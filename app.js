/* data.js の SITE_CONFIG.shopUrl に販売ページのURLを設定してください。 */
const DATA = Array.isArray(window.SITE_DATA) ? window.SITE_DATA : [];
const CONFIG = window.SITE_CONFIG || {};
const $ = id => document.getElementById(id);
let lastSelection = [];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function selection(){
  const max = DATA.length;
  let from = clamp(Number($('from').value) || 1, 1, max);
  let to = clamp(Number($('to').value) || max, 1, max);
  if(from > to) [from,to] = [to,from];
  const pool = DATA.filter(x => x.no >= from && x.no <= to);
  const count = clamp(Number($('count').value) || 1, 1, pool.length);
  let items = [...pool];
  if($('order').value === 'random') for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return {items:items.slice(0,count),from,to,count};
}
function orderText(){return `印刷版 注文メモ\n出題方向: ${$('mode').value==='en-ja'?'英語→日本語':'日本語→英語'}\n範囲: ${$('from').value}〜${$('to').value}\n問題数: ${$('count').value}問\n解答: ${$('answers').checked?'あり':'なし'}\nレイアウト: ${$('columns').value}列`;}
function updateOrder(){ $('orderSummary').textContent = orderText(); }
function render(){
  if(!DATA.length){$('paper').textContent='データを読み込めませんでした。data.js を確認してください。';return;}
  const {items,from,to,count}=selection(), mode=$('mode').value, cols=$('columns').value;
  $('from').value=from; $('to').value=to; $('count').value=count; lastSelection=items;
  const questions=items.map((x,i)=>{const prompt=mode==='en-ja'?x.en:x.ja;return `<div class="q"><div class="qtop"><b class="num">${i+1}.</b><div class="prompt">${esc(prompt)}${$('showNo').checked?`<span class="source">No.${x.no}</span>`:''}</div></div><div class="answer-line"></div></div>`}).join('');
  const answers=items.map((x,i)=>{const a=mode==='en-ja'?x.ja:x.en;return `<div class="answer"><b>${i+1}.</b> ${esc(a)}${$('showNo').checked?`<span class="source">No.${x.no}</span>`:''}</div>`}).join('');
  $('paper').innerHTML=`<header class="print-head"><div><h2>${esc($('title').value.trim() || '英熟語 練習プリント')}</h2></div><div class="print-meta">範囲 ${from}〜${to} ／ ${count}問<br>${mode==='en-ja'?'英語 → 日本語':'日本語 → 英語'}</div></header><p class="name">名前：<span class="line"></span></p><div class="questions" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${questions}</div>${$('answers').checked?`<section class="answer-page"><h3>解答</h3><div class="answers" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${answers}</div></section>`:''}`;
  $('status').textContent=`${from}〜${to}番から${count}問を作成しました。`; updateOrder();
}
function renderLibrary(){const term=$('search').value.trim().toLowerCase();const matches=DATA.filter(x=>!term||`${x.en} ${x.ja}`.toLowerCase().includes(term)).slice(0,60);$('libraryList').innerHTML=matches.length?matches.map(x=>`<article class="entry"><b>No.${x.no}</b><span>${esc(x.en)}</span><small>${esc(x.ja)}</small></article>`).join(''):'<p class="empty">該当する熟語が見つかりません。</p>';}
function init(){
  $('total').textContent=DATA.length; ['from','to','count'].forEach(id=>{ $(id).max=DATA.length; }); $('from').value=1; $('to').value=DATA.length;
  $('generate').onclick=render; $('shuffle').onclick=render; $('print').onclick=()=>{if(!lastSelection.length)render();window.print();};
  ['mode','order','answers','showNo','columns','from','to','count','title'].forEach(id=>$(id).addEventListener('change',render)); $('search').addEventListener('input',renderLibrary);
  $('buyButton').onclick=()=>{const url=CONFIG.shopUrl; if(!url){alert('販売ページURLは未設定です。data.js の SITE_CONFIG.shopUrl に設定してください。');return;}const u=new URL(url,location.href);u.searchParams.set('order',orderText());window.open(u,'_blank','noopener');};
  if(CONFIG.adsenseClient && CONFIG.adsenseSlot){const s=document.createElement('script');s.async=true;s.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CONFIG.adsenseClient)}`;s.crossOrigin='anonymous';document.head.append(s);$('adSlot').innerHTML=`<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(CONFIG.adsenseClient)}" data-ad-slot="${esc(CONFIG.adsenseSlot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;s.onload=()=>{try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}};}
  render(); renderLibrary();
}
init();
