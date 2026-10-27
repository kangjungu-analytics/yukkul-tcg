const gameButtons=[...document.querySelectorAll('.game-button')];
const searchForm=document.querySelector('#search-form');
const nameInput=document.querySelector('#card-name');
const languageInput=document.querySelector('#card-language');
const results=document.querySelector('#results');
const naverFrame=document.querySelector('#naver-frame');
const openNaver=document.querySelector('#open-naver');
const savedKey='yukkul-tcg-saved-v1';
const logKey='yukkul-tcg-price-log-v1';
let selectedGame='포켓몬 카드';
let currentCard=null;
let savedCards=readList(savedKey);
let priceLogs=readList(logKey);

function readList(key){try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:[]}catch{return[]}}
function storeList(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function safe(text){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

gameButtons.forEach(button=>button.addEventListener('click',()=>{
  gameButtons.forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  selectedGame=button.dataset.game;
}));

searchForm.addEventListener('submit',event=>{
  event.preventDefault();
  const name=nameInput.value.trim();
  if(!name)return;
  currentCard={game:selectedGame,name,language:languageInput.value,label:`${selectedGame} · ${name} · ${languageInput.value}`};
  document.querySelector('#price-card').value=currentCard.label;
  document.querySelector('#query-preview').innerHTML=`검색어: <strong>${safe(currentCard.label)}</strong>`;
  searchNaver();
  results.classList.remove('hidden');
  results.scrollIntoView({behavior:'smooth',block:'nearest'});
});

function searchNaver(){
  const phrase=`${currentCard.name} ${currentCard.game} ${currentCard.language} 카드`;
  const url=`https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(phrase)}`;
  naverFrame.src=url;
  openNaver.href=url;
}

document.querySelector('#save-search').addEventListener('click',()=>{
  if(!currentCard)return;
  const exists=savedCards.some(card=>card.label===currentCard.label);
  if(!exists){savedCards.unshift(currentCard);savedCards=savedCards.slice(0,30);storeList(savedKey,savedCards);drawSaved()}
  document.querySelector('#save-search').textContent=exists?'☆ 이미 저장했어요':'★ 저장했어요';
});

document.querySelector('#price-form').addEventListener('submit',event=>{
  event.preventDefault();
  const card=document.querySelector('#price-card').value.trim();
  const price=Number(document.querySelector('#price-value').value);
  const source=document.querySelector('#price-source').value;
  if(!card||!Number.isFinite(price)||price<0)return;
  priceLogs.unshift({card,price,source,date:new Date().toLocaleDateString('ko-KR')});
  priceLogs=priceLogs.slice(0,50);
  storeList(logKey,priceLogs);
  document.querySelector('#price-value').value='';
  drawLogs();
});

function drawSaved(){
  const box=document.querySelector('#saved-list');
  document.querySelector('#saved-count').textContent=savedCards.length;
  if(!savedCards.length){box.innerHTML='<span class="empty-chip">아직 저장한 카드가 없어요. 검색한 뒤 ☆ 버튼을 눌러보세요.</span>';return}
  box.innerHTML=savedCards.map((card,i)=>`<span class="saved-chip">${safe(card.label)}<button type="button" aria-label="관심 카드 삭제" data-remove-saved="${i}">×</button></span>`).join('');
  box.querySelectorAll('[data-remove-saved]').forEach(button=>button.addEventListener('click',()=>{
    savedCards.splice(Number(button.dataset.removeSaved),1);
    storeList(savedKey,savedCards);
    drawSaved();
  }));
}

function drawLogs(){
  const box=document.querySelector('#price-log-list');
  if(!priceLogs.length){box.innerHTML='<div class="empty-state">아직 기록이 없어요. 찾은 가격을 첫 기록으로 남겨보세요.</div>';return}
  box.innerHTML=priceLogs.map((log,i)=>`<div class="log-row"><span class="log-card">${safe(log.card)}</span><span class="log-price">${Number(log.price).toLocaleString('ko-KR')}원</span><span class="log-meta">${safe(log.source)} · ${safe(log.date)}</span><button class="delete-log" type="button" data-remove-log="${i}">삭제</button></div>`).join('');
  box.querySelectorAll('[data-remove-log]').forEach(button=>button.addEventListener('click',()=>{
    priceLogs.splice(Number(button.dataset.removeLog),1);
    storeList(logKey,priceLogs);
    drawLogs();
  }));
}

document.querySelector('#clear-saved').addEventListener('click',()=>{
  savedCards=[];
  storeList(savedKey,savedCards);
  drawSaved();
});

drawSaved();
drawLogs();
