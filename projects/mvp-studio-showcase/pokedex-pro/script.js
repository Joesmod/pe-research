const TYPE_COLORS={normal:'#a8a878',fire:'#f08030',water:'#6890f0',electric:'#f8d030',grass:'#78c850',ice:'#98d8d8',fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',flying:'#a890f0',psychic:'#f85888',bug:'#a8b820',rock:'#b8a038',ghost:'#705898',dragon:'#7038f8',dark:'#705848',steel:'#b8b8d0',fairy:'#ee99ac'};
const STAT_NAMES={hp:'HP','attack':'ATK','defense':'DEF','special-attack':'SPA','special-defense':'SPD','speed':'SPE'};
const allTypes=Object.keys(TYPE_COLORS);
let allPokemon=[];
let activeType=null;

const grid=document.getElementById('grid');
const loader=document.getElementById('loader');
const search=document.getElementById('search');
const typeFilters=document.getElementById('typeFilters');
const overlay=document.getElementById('modalOverlay');
const modal=document.getElementById('modal');

// Build type filter buttons
allTypes.forEach(t=>{
  const b=document.createElement('button');
  b.className='type-btn';b.textContent=t;b.style.background=TYPE_COLORS[t];
  b.onclick=()=>{
    if(activeType===t){activeType=null;b.classList.remove('active')}
    else{document.querySelectorAll('.type-btn').forEach(x=>x.classList.remove('active'));activeType=t;b.classList.add('active')}
    filterPokemon();
  };
  typeFilters.appendChild(b);
});

function typeTag(t){return `<span class="type-tag" style="background:${TYPE_COLORS[t]||'#888'}">${t}</span>`}

function createCard(p){
  const d=document.createElement('div');
  d.className='poke-card';
  d.dataset.name=p.name;
  d.dataset.types=p.types.map(t=>t.type.name).join(',');
  const mainType=p.types[0].type.name;
  d.style.setProperty('--type-color',TYPE_COLORS[mainType]||'#888');
  d.innerHTML=`
    <img src="${p.sprites.other['official-artwork'].front_default||p.sprites.front_default}" alt="${p.name}" loading="lazy">
    <div class="id">#${String(p.id).padStart(3,'0')}</div>
    <div class="name">${p.name}</div>
    <div class="types">${p.types.map(t=>typeTag(t.type.name)).join('')}</div>`;
  d.onclick=()=>openModal(p);
  return d;
}

function filterPokemon(){
  const q=search.value.toLowerCase();
  document.querySelectorAll('.poke-card').forEach(c=>{
    const nameMatch=c.dataset.name.includes(q);
    const typeMatch=!activeType||c.dataset.types.includes(activeType);
    c.classList.toggle('hidden',!(nameMatch&&typeMatch));
  });
}
search.oninput=filterPokemon;

function openModal(p){
  const mainType=p.types[0].type.name;
  const color=TYPE_COLORS[mainType]||'#888';
  document.getElementById('modalHeader').style.setProperty('--type-color',color);
  document.getElementById('modalImg').src=p.sprites.other['official-artwork'].front_default||p.sprites.front_default;
  document.getElementById('modalId').textContent=`#${String(p.id).padStart(3,'0')}`;
  document.getElementById('modalName').textContent=p.name;
  document.getElementById('modalTypes').innerHTML=p.types.map(t=>typeTag(t.type.name)).join('');
  
  const statsEl=document.getElementById('modalStats');
  statsEl.innerHTML=p.stats.map(s=>{
    const pct=Math.min(s.base_stat/255*100,100);
    const name=STAT_NAMES[s.stat.name]||s.stat.name;
    return `<div class="stat-row"><span class="stat-name">${name}</span><span class="stat-val">${s.base_stat}</span><div class="stat-bar"><div class="stat-fill" style="width:0%;background:${color}"></div></div></div>`;
  }).join('');
  // Animate bars
  requestAnimationFrame(()=>{
    statsEl.querySelectorAll('.stat-fill').forEach((el,i)=>{
      el.style.width=Math.min(p.stats[i].base_stat/255*100,100)+'%';
    });
  });

  document.getElementById('modalAbilities').innerHTML=p.abilities.map(a=>`<span class="ability">${a.ability.name.replace('-',' ')}</span>`).join('');
  document.getElementById('modalDetails').innerHTML=`
    <div class="detail"><span>Height</span><strong>${(p.height/10).toFixed(1)}m</strong></div>
    <div class="detail"><span>Weight</span><strong>${(p.weight/10).toFixed(1)}kg</strong></div>
    <div class="detail"><span>Base Exp</span><strong>${p.base_experience||'?'}</strong></div>
    <div class="detail"><span>Moves</span><strong>${p.moves.length}</strong></div>`;
  
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
}

document.getElementById('modalClose').onclick=closeModal;
overlay.onclick=e=>{if(e.target===overlay)closeModal()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function closeModal(){overlay.classList.remove('open');document.body.style.overflow=''}

// Load all 151
async function loadAll(){
  try{
    const r=await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data=await r.json();
    const promises=data.results.map(p=>fetch(p.url).then(r=>r.json()));
    allPokemon=await Promise.all(promises);
    loader.style.display='none';
    allPokemon.sort((a,b)=>a.id-b.id).forEach(p=>grid.appendChild(createCard(p)));
  }catch(e){
    loader.innerHTML=`<p style="color:#f87171">Failed to load Pokémon: ${e.message}</p>`;
  }
}
loadAll();
