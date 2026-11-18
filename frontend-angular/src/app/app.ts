import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Screen = 'catalog' | 'login' | 'register' | 'admin' | 'supervisor' | 'requester';
type UserRole = 'Administrador' | 'Supervisor' | 'Lector';
type ReviewStatus = 'Pendiente' | 'Aprobada' | 'Con correcciones' | 'Rechazada';
type PermissionMode = 'Pendiente' | 'Solo ficha' | 'Ficha y materiales autorizados';
type ResourceKind = 'PDF' | 'ZIP' | 'Enlace de descarga' | 'Demostración';

interface Resource {
  id: number;
  name: string;
  kind: ResourceKind;
  href: string;
}

interface WorkData {
  title: string;
  authors: string[];
  year: number;
  career: string;
  area: string;
  type: string;
  subject: string;
  summary: string;
  keywords: string[];
  advisor: string;
  advisorAllowed: boolean;
}

interface Work extends WorkData {
  id: number;
  permission: PermissionMode;
  approvedResourceIds: number[];
  resources: Resource[];
  published: boolean;
  featured: boolean;
  withdrawnReason: string;
}

interface HistoryEntry {
  at: string;
  actor: string;
  action: string;
  note: string;
}

interface Delivery {
  id: number;
  projectId: number;
  version: number;
  requester: string;
  receivedAt: string;
  updatedAt: string;
  estimatedHours: number | null;
  status: ReviewStatus;
  reviewer: string;
  decidedAt: string;
  note: string;
  data: WorkData;
  permission: PermissionMode;
  approvedResourceIds: number[];
  resources: Resource[];
  history: HistoryEntry[];
}

interface DemoUser {
  id: number;
  username: string;
  name: string;
  roles: UserRole[];
  active: boolean;
}

interface Notice {
  id: number;
  audience: 'Supervisor' | 'Solicitante';
  text: string;
  at: string;
  read: boolean;
}

const AREA_NAMES = ['Bases de datos', 'Desarrollo web', 'Redes y Comunicación', 'Inteligencia artificial', 'Otros'];
const CAREER_NAME = 'Ingeniería en Sistemas Informáticos';
const SAMPLE_PDF = '/ejemplo-material.pdf';

function makeWorkData(index: number): WorkData {
  const areas = AREA_NAMES;
  const area = areas[(index - 1) % areas.length];
  const type = index % 2 === 0 ? 'Proyecto de curso' : 'Trabajo de grado';
  return {
    title: `[Trabajo de muestra ${String(index).padStart(2, '0')}]`,
    authors: [`[Autor ${index}.1]`, `[Autor ${index}.2]`],
    year: 2021 + (index % 6),
    career: CAREER_NAME,
    area,
    type,
    subject: type === 'Proyecto de curso' ? '[Asignatura de muestra]' : '',
    summary: '[Resumen de muestra. Sustituir por el resumen aprobado del trabajo.]',
    keywords: [area.toLowerCase(), '[palabra clave]'],
    advisor: '[Docente asesor]',
    advisorAllowed: index % 3 !== 0,
  };
}

function makePublicWorks(): Work[] {
  return Array.from({ length: 20 }, (_, offset) => {
    const id = offset + 1;
    const resource: Resource = { id: id * 10, name: 'Material de demostración', kind: 'PDF', href: SAMPLE_PDF };
    const sheetOnly = id % 5 === 0;
    return {
      id,
      ...makeWorkData(id),
      permission: sheetOnly ? 'Solo ficha' : 'Ficha y materiales autorizados',
      approvedResourceIds: sheetOnly ? [] : [resource.id],
      resources: [resource],
      published: true,
      featured: id === 4,
      withdrawnReason: '',
    };
  });
}

function makeDemoDeliveries(): Delivery[] {
  const now = Date.now();
  return [
    { id: 201, projectId: 21, version: 1, requester: '[Usuario de muestra A]', ageHours: 22, permission: 'Pendiente' as PermissionMode, status: 'Pendiente' as ReviewStatus, note: '' },
    { id: 202, projectId: 22, version: 1, requester: '[Solicitante de muestra B]', ageHours: 9, permission: 'Solo ficha' as PermissionMode, status: 'Pendiente' as ReviewStatus, note: '' },
    { id: 203, projectId: 23, version: 1, requester: '[Solicitante de muestra C]', ageHours: 3, permission: 'Ficha y materiales autorizados' as PermissionMode, status: 'Pendiente' as ReviewStatus, note: '' },
    { id: 204, projectId: 24, version: 1, requester: '[Usuario de muestra A]', ageHours: 48, permission: 'Pendiente' as PermissionMode, status: 'Con correcciones' as ReviewStatus, note: 'Completar los datos de la asignatura y volver a adjuntar el archivo corregido.' },
  ].map((seed, offset) => {
    const data = makeWorkData(offset + 21);
    const resource: Resource = { id: seed.id * 10, name: `Material de muestra ${offset + 1}.pdf`, kind: 'PDF', href: SAMPLE_PDF };
    const receivedAt = new Date(now - seed.ageHours * 60 * 60 * 1000).toISOString();
    return {
      id: seed.id,
      projectId: seed.projectId,
      version: seed.version,
      requester: seed.requester,
      receivedAt,
      updatedAt: receivedAt,
      estimatedHours: seed.status === 'Pendiente' ? 24 : null,
      status: seed.status,
      reviewer: '',
      decidedAt: '',
      note: seed.note,
      data,
      permission: seed.permission,
      approvedResourceIds: seed.permission === 'Ficha y materiales autorizados' ? [resource.id] : [],
      resources: [resource],
      history: seed.status === 'Con correcciones'
        ? [
          { at: receivedAt, actor: seed.requester, action: 'Entrega v1 recibida', note: 'Datos de demostración.' },
          { at: new Date(now - 24 * 60 * 60 * 1000).toISOString(), actor: '[Supervisor de demostración]', action: 'Con correcciones', note: seed.note },
        ]
        : [{ at: receivedAt, actor: seed.requester, action: 'Entrega recibida', note: 'Datos de demostración.' }],
    };
  });
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly screen = signal<Screen>('catalog');
  readonly roles: UserRole[] = ['Administrador', 'Supervisor', 'Lector'];
  readonly areas = AREA_NAMES;
  readonly works = signal<Work[]>(makePublicWorks());
  readonly submissions = signal<Delivery[]>(makeDemoDeliveries());
  readonly users = signal<DemoUser[]>([
    { id: 1, username: '[admin-demo]', name: '[Administrador de muestra]', roles: ['Administrador'], active: true },
    { id: 2, username: '[supervisor-demo]', name: '[Supervisor de muestra]', roles: ['Supervisor'], active: true },
    { id: 3, username: '[usuario-demo]', name: '[Usuario de muestra A]', roles: ['Lector'], active: true },
  ]);
  readonly notices = signal<Notice[]>([]);

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
  readonly loginName = signal('');
  readonly loginPassword = signal('');
  readonly loginNotice = signal('');
  readonly registerName = signal('');
  readonly registerUsername = signal('');
  readonly registerPassword = signal('');
  readonly actionNotice = signal('');
  readonly correctionTarget = signal<number | null>(null);
  readonly formError = signal('');
  readonly submissionRequesterName = signal('');
  readonly newTitle = signal('');
  readonly newAuthors = signal('');
  readonly newYear = signal(new Date().getFullYear());
  readonly newCareer = signal(CAREER_NAME);
  readonly newArea = signal(AREA_NAMES[0]);
  readonly newType = signal('Proyecto de curso');
  readonly newSubject = signal('');
  readonly newSummary = signal('');
  readonly newKeywords = signal('');
  readonly newAdvisor = signal('');
  readonly newLink = signal('');
  readonly newLinkKind = signal<'Enlace de descarga' | 'Demostración'>('Enlace de descarga');
  readonly newUsername = signal('');
  readonly newUserName = signal('');
  readonly selectedFiles = signal<File[]>([]);
  readonly reviewNotes = signal<Record<number, string>>({});
  readonly withdrawTarget = signal<number | null>(null);
  readonly withdrawReason = signal('');
  readonly requesterName = signal('[Usuario de muestra A]');

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
  readonly pendingDeliveries = computed(() => this.submissions().filter((item) => item.status === 'Pendiente').sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)));
  readonly requesterDeliveries = computed(() => this.submissions().filter((item) => item.requester === this.requesterName()).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)));
  readonly reportRows = computed(() => {
    const map = new Map<string, number>();
    for (const work of this.publicWorks()) {
      const key = `${work.year}|${work.area}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].map(([key, count]) => {
      const [year, area] = key.split('|');
      return { year: Number(year), area, count };
    }).sort((a, b) => b.year - a.year || a.area.localeCompare(b.area));
  });
  readonly pendingCount = computed(() => this.pendingDeliveries().length);
  readonly publishedCount = computed(() => this.works().filter((work) => work.published).length);
  readonly unreadSupervisorNoticeCount = computed(() => this.notices().filter((notice) => notice.audience === 'Supervisor' && !notice.read).length);
  readonly selectedFileNames = computed(() => this.selectedFiles().map((file) => file.name).join(', '));

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

  navigate(screen: Screen): void {
    this.screen.set(screen);
    this.loginNotice.set('');
    this.actionNotice.set('');
  }

  submitLogin(): void {
    this.loginNotice.set('Este formulario aún no autentica cuentas. Para revisar pantallas, utiliza una vista de demostración; en la versión conectada el rol asignado determinará el acceso.');
  }

  registerUser(): void {
    const name = this.registerName().trim();
    const username = this.registerUsername().trim();
    const password = this.registerPassword();
    if (!name || !username || password.length < 8) {
      this.loginNotice.set('Completa tu nombre y usuario. La contraseña de demostración debe tener al menos 8 caracteres.');
      return;
    }
    if (this.users().some((user) => user.username.toLocaleLowerCase() === username.toLocaleLowerCase())) {
      this.loginNotice.set('Ese nombre de usuario ya está registrado en esta demostración.');
      return;
    }
    const id = Math.max(0, ...this.users().map((user) => user.id)) + 1;
    this.users.update((items) => [...items, { id, username, name, roles: ['Lector'], active: true }]);
    this.requesterName.set(name);
    this.registerPassword.set('');
    this.loginNotice.set('');
    this.navigate('requester');
    this.actionNotice.set('Cuenta de demostración creada. Puedes explorar el catálogo y, si quieres, solicitar la publicación de un proyecto sin pedir autorización previa al administrador.');
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

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles.set(Array.from(input.files ?? []));
  }

  startCorrection(delivery: Delivery): void {
    this.correctionTarget.set(delivery.projectId);
    this.submissionRequesterName.set(delivery.requester);
    this.newTitle.set(delivery.data.title);
    this.newAuthors.set(delivery.data.authors.join(', '));
    this.newYear.set(delivery.data.year);
    this.newCareer.set(delivery.data.career);
    this.newArea.set(delivery.data.area);
    this.newType.set(delivery.data.type);
    this.newSubject.set(delivery.data.subject);
    this.newSummary.set(delivery.data.summary);
    this.newKeywords.set(delivery.data.keywords.join(', '));
    this.newAdvisor.set(delivery.data.advisor);
    this.selectedFiles.set([]);
    this.newLink.set('');
    this.formError.set('Vuelve a seleccionar los materiales corregidos. La nueva versión conservará el mismo proyecto y tendrá su propio historial.');
    globalThis.document.getElementById('submission-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelCorrection(): void {
    this.correctionTarget.set(null);
    this.formError.set('');
    this.newTitle.set('');
    this.newAuthors.set('');
    this.newSummary.set('');
    this.selectedFiles.set([]);
    this.newLink.set('');
    this.newLinkKind.set('Enlace de descarga');
  }

  submitWork(): void {
    this.formError.set('');
    const submittingName = this.submissionRequesterName().trim();
    const authors = this.newAuthors().split(',').map((name) => name.trim()).filter(Boolean);
    const files = this.selectedFiles();
    const link = this.newLink().trim();
    const validLink = this.isHttpUrl(link);
    if (!submittingName || !this.newTitle().trim() || !authors.length || !this.newSummary().trim() || !this.newCareer().trim()) {
      this.formError.set('Completa tu nombre, título, autores, carrera y resumen antes de enviar.');
      return;
    }
    if (this.newType() === 'Trabajo de grado' && !files.some((file) => file.name.toLowerCase().endsWith('.pdf'))) {
      this.formError.set('Para un trabajo de grado es necesario adjuntar el PDF completo.');
      return;
    }
    if (this.newType() === 'Proyecto de curso' && !files.length && !validLink) {
      this.formError.set('Para un proyecto de curso agrega al menos un PDF, ZIP o enlace válido de descarga/demostración.');
      return;
    }
    if (link && !validLink) {
      this.formError.set('El enlace debe comenzar con http:// o https://.');
      return;
    }
    if (files.some((file) => !/\.(pdf|zip)$/i.test(file.name))) {
      this.formError.set('Los materiales deben ser archivos PDF o ZIP.');
      return;
    }

    const resourceFiles = files.map((file, index): Resource => ({
      id: Date.now() + index,
      name: file.name,
      kind: file.name.toLowerCase().endsWith('.zip') ? 'ZIP' : 'PDF',
      href: URL.createObjectURL(file),
    }));
    const resources = [...resourceFiles];
    if (validLink) resources.push({ id: Date.now() + resources.length, name: link, kind: this.newLinkKind(), href: link });
    const data: WorkData = {
      title: this.newTitle().trim(), authors, year: Number(this.newYear()), career: this.newCareer().trim(),
      area: this.newArea(), type: this.newType(), subject: this.newType() === 'Proyecto de curso' ? this.newSubject().trim() : '',
      summary: this.newSummary().trim(), keywords: this.newKeywords().split(',').map((word) => word.trim()).filter(Boolean),
      advisor: this.newAdvisor().trim(), advisorAllowed: false,
    };
    const now = new Date().toISOString();
    const correctionProjectId = this.correctionTarget();
    const projectId = correctionProjectId ?? Math.max(0, ...this.works().map((work) => work.id), ...this.submissions().map((item) => item.projectId)) + 1;
    const priorVersions = this.submissions().filter((item) => item.projectId === projectId);
    const version = priorVersions.length ? Math.max(...priorVersions.map((item) => item.version)) + 1 : 1;
    const deliveryId = Date.now();
    this.requesterName.set(submittingName);
    const delivery: Delivery = {
      id: deliveryId, projectId, version, requester: submittingName, receivedAt: now, updatedAt: now,
      estimatedHours: 24, status: 'Pendiente', reviewer: '', decidedAt: '', note: '', data,
      permission: 'Pendiente', approvedResourceIds: [], resources,
      history: [{ at: now, actor: submittingName, action: `Entrega v${version} recibida`, note: 'Materiales y datos recibidos para revisión.' }],
    };
    this.submissions.update((items) => [...items, delivery]);
    if (!correctionProjectId) {
      this.works.update((items) => [...items, { id: projectId, ...data, permission: 'Pendiente', approvedResourceIds: [], resources, published: false, featured: false, withdrawnReason: '' }]);
    }
    this.notices.update((items) => [{ id: deliveryId, audience: 'Supervisor', text: `Nueva entrega recibida: ${data.title}.`, at: now, read: false }, ...items]);
    this.actionNotice.set('El envío quedó registrado en esta demostración. Se avisó al panel interno del supervisor.');
    this.cancelCorrection();
    this.newTitle.set(''); this.newAuthors.set(''); this.newSummary.set(''); this.newKeywords.set(''); this.newSubject.set(''); this.newAdvisor.set(''); this.newLink.set(''); this.selectedFiles.set([]);
  }

  setReviewNote(deliveryId: number, note: string): void {
    this.reviewNotes.update((notes) => ({ ...notes, [deliveryId]: note }));
  }

  changePermission(deliveryId: number, permission: PermissionMode): void {
    this.submissions.update((items) => items.map((item) => item.id === deliveryId ? { ...item, permission } : item));
    const delivery = this.submissions().find((item) => item.id === deliveryId);
    if (delivery?.status === 'Aprobada') this.publishApprovedDelivery(delivery);
  }

  toggleResourcePermission(deliveryId: number, resourceId: number): void {
    this.submissions.update((items) => items.map((item) => {
      if (item.id !== deliveryId) return item;
      const approved = item.approvedResourceIds.includes(resourceId)
        ? item.approvedResourceIds.filter((id) => id !== resourceId)
        : [...item.approvedResourceIds, resourceId];
      return { ...item, approvedResourceIds: approved };
    }));
    const delivery = this.submissions().find((item) => item.id === deliveryId);
    if (delivery?.status === 'Aprobada') this.publishApprovedDelivery(delivery);
  }

  toggleAdvisorPermission(deliveryId: number): void {
    this.submissions.update((items) => items.map((item) => item.id === deliveryId
      ? { ...item, data: { ...item.data, advisorAllowed: !item.data.advisorAllowed } }
      : item));
  }

  decideDelivery(deliveryId: number, decision: ReviewStatus): void {
    const delivery = this.submissions().find((item) => item.id === deliveryId);
    if (!delivery || delivery.status !== 'Pendiente') return;
    const note = (this.reviewNotes()[deliveryId] ?? '').trim();
    if ((decision === 'Con correcciones' || decision === 'Rechazada') && !note) {
      this.actionNotice.set(decision === 'Rechazada' ? 'Escribe el motivo para registrar el rechazo.' : 'Escribe las observaciones que debe corregir el solicitante.');
      return;
    }
    const now = new Date().toISOString();
    const updated: Delivery = {
      ...delivery, status: decision, reviewer: '[Supervisor de demostración]', decidedAt: now, updatedAt: now, note,
      estimatedHours: null,
      history: [...delivery.history, { at: now, actor: '[Supervisor de demostración]', action: decision, note }],
    };
    this.submissions.update((items) => items.map((item) => item.id === deliveryId ? updated : item));
    if (decision === 'Aprobada') {
      this.publishApprovedDelivery(updated);
      if (updated.permission === 'Pendiente') this.actionNotice.set('La revisión fue aprobada, pero la ficha no se publica hasta registrar el permiso de difusión.');
      else this.actionNotice.set('Revisión aprobada. La publicación respeta el alcance del permiso registrado.');
    } else if (decision === 'Rechazada') {
      this.notices.update((items) => [{ id: Date.now(), audience: 'Solicitante', text: `La entrega de ${updated.data.title} fue rechazada. Revisa el motivo registrado.`, at: now, read: false }, ...items]);
      this.actionNotice.set('Rechazo registrado con motivo. Se creó un aviso interno para el solicitante.');
    } else {
      this.notices.update((items) => [{ id: Date.now(), audience: 'Solicitante', text: `Hay correcciones solicitadas para ${updated.data.title}.`, at: now, read: false }, ...items]);
      this.actionNotice.set('Observaciones registradas. El solicitante puede enviar una nueva versión del mismo proyecto.');
    }
  }

  private publishApprovedDelivery(delivery: Delivery): void {
    if (delivery.status !== 'Aprobada' || delivery.permission === 'Pendiente') return;
    const existing = this.works().find((work) => work.id === delivery.projectId);
    const approvedResourceIds = delivery.permission === 'Solo ficha' ? [] : delivery.approvedResourceIds;
    const next: Work = {
      id: delivery.projectId, ...delivery.data, permission: delivery.permission, approvedResourceIds,
      resources: delivery.resources, published: true, featured: existing?.featured ?? false, withdrawnReason: '',
    };
    this.works.update((items) => existing ? items.map((work) => work.id === delivery.projectId ? next : work) : [...items, next]);
  }

  toggleFeatured(workId: number): void {
    this.works.update((items) => items.map((work) => work.id === workId ? { ...work, featured: !work.featured } : work));
  }

  beginWithdrawal(workId: number): void {
    this.withdrawTarget.set(workId);
    this.withdrawReason.set('');
  }

  cancelWithdrawal(): void {
    this.withdrawTarget.set(null);
    this.withdrawReason.set('');
  }

  confirmWithdrawal(): void {
    const workId = this.withdrawTarget();
    const reason = this.withdrawReason().trim();
    if (!workId) return;
    if (!reason) {
      this.actionNotice.set('El retiro requiere un motivo.');
      return;
    }
    this.works.update((items) => items.map((work) => work.id === workId ? { ...work, published: false, withdrawnReason: reason } : work));
    const now = new Date().toISOString();
    this.submissions.update((items) => items.map((item) => item.projectId === workId ? { ...item, updatedAt: now, history: [...item.history, { at: now, actor: '[Supervisor de demostración]', action: 'Publicación retirada', note: reason }] } : item));
    this.actionNotice.set('Publicación retirada del catálogo. El motivo queda en el historial interno de demostración.');
    this.cancelWithdrawal();
  }

  changeUserRole(userId: number, role: UserRole, enabled: boolean): void {
    if (userId === 1) return;
    this.users.update((users) => users.map((user) => {
      if (user.id !== userId) return user;
      const roles = enabled ? [...new Set([...user.roles, role])] : user.roles.filter((item) => item !== role);
      return { ...user, roles };
    }));
  }

  changeUserActive(userId: number): void {
    if (userId === 1) return;
    this.users.update((users) => users.map((user) => user.id === userId ? { ...user, active: !user.active } : user));
  }

  addUser(): void {
    const username = this.newUsername().trim();
    const name = this.newUserName().trim();
    if (!username || !name) {
      this.actionNotice.set('Escribe el nombre de usuario y el nombre de la persona.');
      return;
    }
    if (this.users().some((user) => user.username.toLocaleLowerCase() === username.toLocaleLowerCase())) {
      this.actionNotice.set('Ya existe una cuenta de muestra con ese usuario.');
      return;
    }
    const id = Math.max(0, ...this.users().map((user) => user.id)) + 1;
    this.users.update((items) => [...items, { id, username, name, roles: ['Lector'], active: true }]);
    this.newUsername.set('');
    this.newUserName.set('');
    this.actionNotice.set('Cuenta de muestra agregada con el rol Lector.');
  }

  toggleNoticeRead(noticeId: number): void {
    this.notices.update((items) => items.map((notice) => notice.id === noticeId ? { ...notice, read: true } : notice));
  }

  movePage(direction: number): void {
    this.page.set(Math.min(this.pageCount(), Math.max(1, this.page() + direction)));
  }

  permissionAllowsResource(work: Work, resourceId: number): boolean {
    return work.permission === 'Ficha y materiales autorizados' && work.approvedResourceIds.includes(resourceId);
  }

  dateLabel(value: string): string {
    return new Intl.DateTimeFormat('es-SV', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }

  private isHttpUrl(value: string): boolean {
    if (!value) return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
