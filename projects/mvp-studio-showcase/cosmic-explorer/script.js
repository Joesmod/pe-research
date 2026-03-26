// Stars
const sc=document.getElementById('stars');
for(let i=0;i<150;i++){const s=document.createElement('div');s.className='star';s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${Math.random()*3+1}px;height:${Math.random()*3+1}px;--d:${Math.random()*3+2}s;animation-delay:${Math.random()*3}s`;sc.appendChild(s)}

const API='https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
const loader=document.getElementById('loader');
const card=document.getElementById('apodCard');
const error=document.getElementById('error');
const errorMsg=document.getElementById('errorMsg');
const mediaWrap=document.getElementById('mediaWrap');
const apodTitle=document.getElementById('apodTitle');
const apodDate=document.getElementById('apodDate');
const apodExplanation=document.getElementById('apodExplanation');
const apodCopyright=document.getElementById('apodCopyright');
const datePicker=document.getElementById('datePicker');

const today=new Date().toISOString().split('T')[0];
datePicker.max=today;
datePicker.value=today;

function show(el){el.style.display=''}
function hide(el){el.style.display='none'}

async function fetchAPOD(date){
  hide(card);hide(error);show(loader);
  try{
    const r=await fetch(`${API}&date=${date}`);
    if(!r.ok)throw new Error(`API returned ${r.status}`);
    const d=await r.json();
    if(d.error)throw new Error(d.error.message||'Unknown error');
    render(d);
  }catch(e){
    hide(loader);show(error);errorMsg.textContent=e.message;
  }
}

function render(d){
  hide(loader);
  mediaWrap.innerHTML='';
  if(d.media_type==='image'){
    const img=document.createElement('img');
    img.src=d.hdurl||d.url;img.alt=d.title;img.loading='lazy';
    img.onclick=()=>openLightbox(img.src);
    mediaWrap.appendChild(img);
  }else{
    const iframe=document.createElement('iframe');
    iframe.src=d.url;iframe.allow='autoplay;encrypted-media';iframe.allowFullscreen=true;
    mediaWrap.appendChild(iframe);
  }
  apodDate.textContent=d.date;
  apodTitle.textContent=d.title;
  apodExplanation.textContent=d.explanation;
  apodCopyright.textContent=d.copyright?`© ${d.copyright}`:'';
  // Re-trigger animation
  card.style.animation='none';card.offsetHeight;card.style.animation='';
  show(card);
}

function openLightbox(src){
  const lb=document.createElement('div');lb.className='lightbox';
  lb.innerHTML=`<img src="${src}">`;
  lb.onclick=()=>lb.remove();
  document.body.appendChild(lb);
}

function randomDate(){
  const start=new Date(1995,5,16).getTime();
  const end=Date.now();
  const d=new Date(start+Math.random()*(end-start));
  return d.toISOString().split('T')[0];
}

function loadToday(){datePicker.value=today;fetchAPOD(today)}

document.getElementById('todayBtn').onclick=loadToday;
document.getElementById('randomBtn').onclick=()=>{const d=randomDate();datePicker.value=d;fetchAPOD(d)};
datePicker.onchange=()=>fetchAPOD(datePicker.value);

document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.lightbox')?.remove()});

fetchAPOD(today);
