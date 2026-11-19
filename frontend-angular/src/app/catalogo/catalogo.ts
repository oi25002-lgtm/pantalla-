import { Component, computed, input, model, OnInit, output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Work } from '../app';
import { afterNextRender, inject, Injector } from '@angular/core';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
  host: { '(window:scroll)': 'onCatalogScroll()' },

})
export class Catalogo implements OnInit {
  readonly active = input.required<boolean>();
  readonly works = input.required<Work[]>();
  readonly areas = input.required<string[]>();
  readonly actionNotice = model('');
  readonly navigateTo = output<'requester' | 'login'>();

  readonly query = signal('');
  readonly searchScope = signal('all');
  readonly selectedAreas = signal<string[]>([]);
  readonly selectedYears = signal<number[]>([]);
  readonly selectedTypes = signal<string[]>([]);
  readonly selectedCareers = signal<string[]>([]);
  readonly selectedSubjects = signal<string[]>([]);
  readonly selectedAuthors = signal<string[]>([]);
  readonly sortOrder = signal('recent');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly favoriteIds = signal<number[]>(this.readFavorites());
  readonly favoritesOnly = signal(false);
  readonly selectedWork = signal<Work | null>(null);

  readonly years = computed(() => [...new Set(this.publicWorks().map((work) => work.year))].sort((a, b) => b - a));
  readonly authors = computed(() => [...new Set(this.publicWorks().flatMap((work) => work.authors))].sort());
  readonly types = computed(() => [...new Set(this.publicWorks().map((work) => work.type))].sort());
  readonly careers = computed(() => [...new Set(this.publicWorks().map((work) => work.career))].sort());
  readonly subjects = computed(() => [...new Set(this.publicWorks().map((work) => work.subject).filter(Boolean))].sort());
  readonly filteredWorks = computed(() => {
    const term = this.query().trim().toLocaleLowerCase('es');
    let results = this.publicWorks().filter((work) => {
      const searchable = this.searchableText(work, this.searchScope());
      return (
        (!term || searchable.toLocaleLowerCase('es').includes(term)) &&
        (!this.selectedAreas().length || this.selectedAreas().includes(work.area)) &&
        (!this.selectedYears().length || this.selectedYears().includes(work.year)) &&
        (!this.selectedTypes().length || this.selectedTypes().includes(work.type)) &&
        (!this.selectedCareers().length || this.selectedCareers().includes(work.career)) &&
        (!this.selectedSubjects().length || this.selectedSubjects().includes(work.subject)) &&
        (!this.selectedAuthors().length || work.authors.some((author) => this.selectedAuthors().includes(author))) &&
        (!this.favoritesOnly() || this.favoriteIds().includes(work.id))
      );
    });
    results = [...results].sort((a, b) => this.sortOrder() === 'old' ? a.year - b.year : b.year - a.year);
    return results;
  });
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredWorks().length / this.pageSize)));
  readonly pageWorks = computed(() => this.filteredWorks().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));

  ngOnInit(): void {
    const match = globalThis.location?.hash.match(/^#trabajo-(\d+)$/);
    if (match) {
      const work = this.publicWorks().find((item) => item.id === Number(match[1]));
      if (work) this.selectedWork.set(work);
    }
  }

  private publicWorks(): Work[] {
    return this.works().filter((work) => work.published && work.permission !== 'Pendiente');
  }

  private searchableText(work: Work, scope: string): string {
    if (scope === 'title') return work.title;
    if (scope === 'author') return work.authors.join(' ');
    if (scope === 'topic') return `${work.area} ${work.summary} ${work.keywords.join(' ')}`;
    return `${work.title} ${work.authors.join(' ')} ${work.area} ${work.summary} ${work.keywords.join(' ')}`;
  }

  private readFavorites(): number[] {
    try {
      const saved = globalThis.localStorage?.getItem('ues-repository-demo-favorites');
      return saved ? JSON.parse(saved) as number[] : [];
    } catch {
      return [];
    }
  }

  private persistFavorites(): void {
    try {
      globalThis.localStorage?.setItem('ues-repository-demo-favorites', JSON.stringify(this.favoriteIds()));
    } catch {
      this.actionNotice.set('El navegador no permitió guardar los favoritos de demostración.');
    }
  }

  isSelected<T extends string | number>(selection: WritableSignal<T[]>, value: T): boolean {
    return selection().includes(value);
  }

  toggleSelection<T extends string | number>(selection: WritableSignal<T[]>, value: T): void {
    const current = selection();
    selection.set(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    this.page.set(1);
  }

  clearFilters(): void {
    this.query.set('');
    this.selectedAreas.set([]);
    this.selectedYears.set([]);
    this.selectedTypes.set([]);
    this.selectedCareers.set([]);
    this.selectedSubjects.set([]);
    this.selectedAuthors.set([]);
    this.favoritesOnly.set(false);
    this.page.set(1);
  }

  toggleFavorite(id: number): void {
    const current = this.favoriteIds();
    this.favoriteIds.set(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    this.persistFavorites();
  }

  openWork(work: Work): void {
    if (!work.published) return;
    this.selectedWork.set(work);
    globalThis.location.hash = `trabajo-${work.id}`;
  }

  closeWork(): void {
    this.selectedWork.set(null);
    if (globalThis.location.hash.startsWith('#trabajo-')) globalThis.history.replaceState(null, '', globalThis.location.pathname + globalThis.location.search);
  }

  async shareWork(work: Work): Promise<void> {
    const link = `${globalThis.location.origin}${globalThis.location.pathname}#trabajo-${work.id}`;
    try {
      await globalThis.navigator.clipboard.writeText(link);
      this.actionNotice.set('Enlace de la ficha copiado. Solo permite abrir una publicación vigente.');
    } catch {
      this.actionNotice.set(`Copia este enlace público: ${link}`);
    }
  }

  movePage(direction: number): void {
    this.page.set(Math.min(this.pageCount(), Math.max(1, this.page() + direction)));
  }

  permissionAllowsResource(work: Work, resourceId: number): boolean {
    return work.permission === 'Ficha y materiales autorizados' && work.approvedResourceIds.includes(resourceId);
  }

  readonly filtersOpen = signal(true);
  private wasBelowCatalogStart = false;

  onCatalogScroll(): void {
    if (!this.active()) return;

    const catalog = document.getElementById('catalogo');
    if (!catalog) return;

    const belowCatalogStart = catalog.getBoundingClientRect().top < -120;
    if (belowCatalogStart === this.wasBelowCatalogStart) return;

    this.wasBelowCatalogStart = belowCatalogStart;
    this.filtersOpen.set(!belowCatalogStart);
  }
    private readonly injector = inject(Injector);

  openNotifications(): void {
    this.navigateTo.emit('requester');

    afterNextRender(() => {
      document.getElementById('requester-notices')?.scrollIntoView({
        block: 'start',
      });
    }, { injector: this.injector });
  }

}
