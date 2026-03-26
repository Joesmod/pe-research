const MOODS=[
  {id:'happy',emoji:'😊',label:'Happy',gradient:'linear-gradient(135deg,#f093fb,#f5576c)',content:'joke'},
  {id:'sad',emoji:'😢',label:'Sad',gradient:'linear-gradient(135deg,#4facfe,#00f2fe)',content:'joke'},
  {id:'bored',emoji:'😴',label:'Bored',gradient:'linear-gradient(135deg,#a18cd1,#fbc2eb)',content:'joke'},
  {id:'stressed',emoji:'😤',label:'Stressed',gradient:'linear-gradient(135deg,#89f7fe,#66a6ff)',content:'quote'},
  {id:'reflective',emoji:'🤔',label:'Reflective',gradient:'linear-gradient(135deg,#c3cfe2,#f5f7fa)',content:'quote'},
  {id:'curious',emoji:'🧐',label:'Curious',gradient:'linear-gradient(135deg,#ffecd2,#fcb69f)',content:'fact'},
  {id:'angry',emoji:'😠',label:'Angry',gradient:'linear-gradient(135deg,#ff9a9e,#fad0c4)',content:'quote'},
  {id:'excited',emoji:'🤩',label:'Excited',gradient:'linear-gradient(135deg,#f9d423,#ff4e50)',content:'joke'},
];

const QUOTES=[
  {text:"The only way out is through.",author:"Robert Frost"},
  {text:"This too shall pass.",author:"Persian Proverb"},
  {text:"Breathe. You're going to be okay.",author:"Unknown"},
  {text:"Stars can't shine without darkness.",author:"D.H. Sidebottom"},
  {text:"You are enough just as you are.",author:"Meghan Markle"},
  {text:"Peace comes from within. Do not seek it without.",author:"Buddha"},
  {text:"The present moment is filled with joy and happiness. If you are attentive, you will see it.",author:"Thich Nhat Hanh"},
  {text:"Almost everything will work again if you unplug it for a few minutes, including you.",author:"Anne Lamott"},
  {text:"You don't have to control your thoughts. You just have to stop letting them control you.",author:"Dan Millman"},
  {text:"What lies behind us and what lies before us are tiny matters compared to what lies within us.",author:"Ralph Waldo Emerson"},
  {text:"In the middle of difficulty lies opportunity.",author:"Albert Einstein"},
  {text:"Happiness is not something ready made. It comes from your own actions.",author:"Dalai Lama"},
];

const FACTS=[
  "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
  "Octopuses have three hearts and blue blood.",
  "A group of flamingos is called a 'flamboyance'.",
  "Bananas are berries, but strawberries aren't.",
  "The shortest war in history lasted 38-45 minutes (Britain vs Zanzibar, 1896).",
  "Venus is the only planet that spins clockwise.",
  "A single cloud can weigh more than 1 million pounds.",
  "There are more possible iterations of a game of chess than there are atoms in the known universe.",
  "The human brain uses about 20% of the body's total energy.",
  "Sea otters hold hands while they sleep so they don't drift apart.",
  "The inventor of the Pringles can is buried in one.",
  "Cows have best friends and get stressed when separated.",
];

let currentMood=null;
const moodsEl=document.getElementById('moods');
const loader=document.getElementById('loader');
const vibeCard=document.getElementById('vibeCard');
const vibeType=document.getElementById('vibeType');
const vibeText=document.getElementById('vibeText');
const vibeSource=document.getElementById('vibeSource');
const toast=document.getElementById('toast');

// Build mood buttons
MOODS.forEach(m=>{
  const b=document.createElement('button');
  b.className='mood-btn';
  b.innerHTML=`<span class="mood-emoji">${m.emoji}</span><span class="mood-label">${m.label}</span>`;
  b.onclick=()=>selectMood(m);
  moodsEl.appendChild(b);
});

function selectMood(m){
  currentMood=m;
  document.body.style.background=m.gradient;
  document.querySelectorAll('.mood-btn').forEach((b,i)=>b.classList.toggle('active',MOODS[i].id===m.id));
  fetchContent();
}

async function fetchContent(){
  vibeCard.style.display='none';
  loader.style.display='';
  const m=currentMood;
  try{
    if(m.content==='joke')await fetchJoke();
    else if(m.content==='quote')showQuote();
    else showFact();
  }catch(e){
    vibeType.textContent='Error';
    vibeText.textContent='Something went wrong. Try again!';
    vibeSource.textContent='';
  }
  loader.style.display='none';
  vibeCard.style.display='';
  vibeCard.style.animation='none';vibeCard.offsetHeight;vibeCard.style.animation='';
}

async function fetchJoke(){
  try{
    const r=await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist,explicit&safe-mode');
    const d=await r.json();
    vibeType.textContent='😂 Joke';
    if(d.type==='twopart'){
      vibeText.textContent=d.setup;
      vibeSource.textContent=d.delivery;
    }else{
      vibeText.textContent=d.joke;
      vibeSource.textContent='';
    }
  }catch{
    vibeType.textContent='😂 Joke';
    vibeText.textContent="Why do programmers prefer dark mode? Because light attracts bugs!";
    vibeSource.textContent='(offline fallback)';
  }
}

function showQuote(){
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  vibeType.textContent='💭 Quote';
  vibeText.textContent=`"${q.text}"`;
  vibeSource.textContent=`— ${q.author}`;
}

function showFact(){
  const f=FACTS[Math.floor(Math.random()*FACTS.length)];
  vibeType.textContent='🧠 Fun Fact';
  vibeText.textContent=f;
  vibeSource.textContent='';
}

document.getElementById('newBtn').onclick=()=>{if(currentMood)fetchContent()};
document.getElementById('copyBtn').onclick=()=>{
  const text=`${vibeType.textContent}\n${vibeText.textContent}${vibeSource.textContent?'\n'+vibeSource.textContent:''}\n\n— Vibe Check ✨`;
  navigator.clipboard.writeText(text).then(()=>{
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),2000);
  });
};
