const search = document.querySelector('#q');
    const cards = [...document.querySelectorAll('[data-card-area]')];
    const areaChecks = [...document.querySelectorAll('[data-check-area]')];
    const chips = [...document.querySelectorAll('.area-chip')];
    function refresh(){
      const term = search.value.trim().toLocaleLowerCase('es');
      const selected = areaChecks.filter(x=>x.checked).map(x=>x.dataset.checkArea);
      let count = 0;
      cards.forEach(card=>{const show=(!selected.length||selected.includes(card.dataset.cardArea))&&(!term||card.innerText.toLocaleLowerCase('es').includes(term));card.hidden=!show;if(show)count++;});
      document.querySelector('.counter').textContent=`${count} ${count===1?'trabajo encontrado':'trabajos encontrados'}`;
    }
    search.addEventListener('input',refresh);areaChecks.forEach(x=>x.addEventListener('change',refresh));
    chips.forEach(chip=>chip.addEventListener('click',()=>{const check=areaChecks.find(x=>x.dataset.checkArea===chip.dataset.area);if(!check)return;check.checked=!check.checked;chip.classList.toggle('active',check.checked);refresh();}));
    document.querySelector('#clear').addEventListener('click',()=>{search.value='';areaChecks.forEach(x=>x.checked=false);chips.forEach(x=>x.classList.remove('active'));refresh();});
    document.querySelectorAll('.favorite').forEach(button=>button.addEventListener('click',()=>{const saved=button.dataset.saved==='true';button.dataset.saved=String(!saved);button.textContent=saved?'♧ Guardar en favoritos':'★ Guardado';}));
