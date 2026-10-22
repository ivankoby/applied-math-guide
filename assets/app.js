
(function(){
 var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
 var K='pm-read',KL='pm-last';
 function ico(n){return '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-'+n+'"/></svg>'}
 function rd(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(e){return []}}
 function wr(a){try{localStorage.setItem(K,JSON.stringify(a))}catch(e){}}
 var today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
 $$('[data-open]').forEach(function(el){
   if(el.dataset.open>today)return;
   if(el.classList.contains('st')){el.remove();return}
   el.className='stat done';el.removeAttribute('data-open');el.innerHTML=ico('check-circle')+'<span>Уже открыта</span>';
 });
 function paint(){
   var r=rd();
   $$('.s-lec').forEach(function(a){a.classList.toggle('read',r.indexOf(+a.dataset.n)>-1)});
   $$('a.tile[data-n]').forEach(function(a){a.classList.toggle('read',r.indexOf(+a.dataset.n)>-1)});
   var b=$('#prog-bar'),t=$('#prog-text');
   if(b){b.style.width=(r.length/18*100)+'%';t.textContent='Прочитано лекций: '+r.length+' из 18'}
   var rb=$('#readbtn');
   if(rb){var on=r.indexOf(+rb.dataset.n)>-1;rb.classList.toggle('done',on);rb.classList.toggle('ghost',!on);rb.setAttribute('aria-pressed',on);
     rb.innerHTML=on?ico('check-circle')+'Прочитано (нажми, чтобы снять)':ico('check')+'Отметить лекцию прочитанной'}
 }
 var rb=$('#readbtn');
 if(rb)rb.addEventListener('click',function(){var n=+rb.dataset.n,r=rd(),i=r.indexOf(n);if(i>-1)r.splice(i,1);else r.push(n);wr(r);paint()});
 var cur=$('#lecture-n');
 if(cur){try{localStorage.setItem(KL,cur.dataset.n)}catch(e){}}
 var go=$('#continue');
 if(go){try{var l=parseInt(localStorage.getItem(KL),10);if(l>=1&&l<=18){go.href='lectures/'+('0'+l).slice(-2)+'.html';go.innerHTML=ico('arrow-right')+'Продолжить: лекция '+l;go.classList.remove('hidden');var s2=$('#start-main');if(s2)s2.classList.add('hidden')}}catch(e){}}
 paint();
 var menu=$('#menu');
 if(menu){menu.addEventListener('click',function(e){e.stopPropagation();var o=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',o)});
  document.addEventListener('click',function(e){if(document.body.classList.contains('menu-open')&&!e.target.closest('.side')){document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded',false)}})}
 document.addEventListener('keydown',function(e){
   if(/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')||e.metaKey||e.ctrlKey||e.altKey)return;
   var a=e.key==='ArrowLeft'?$('a[rel=prev]'):e.key==='ArrowRight'?$('a[rel=next]'):null;if(a)location.href=a.href});
 var q=$('#q'),res=$('#results'),D=window.SEARCH||[];
 var kind={a:'Статья',l:'Лекция',c:'Карточка',t:'Термин',f:'Формула'};
 function root(){return document.body.dataset.root||''}
 function find(v){
   var tk=v.toLowerCase().split(/\s+/).filter(Boolean).map(function(w){return w.length>5?w.slice(0,w.length-2):w});if(!tk.length)return[];
   var out=[];
   D.forEach(function(d){
     var ti=d.a.toLowerCase(),tx=(d.b||'').toLowerCase(),s=0,ok=true;
     tk.forEach(function(w){var i=ti.indexOf(w),j=tx.indexOf(w);if(i<0&&j<0)ok=false;else s+=(i>-1?3:0)+(j>-1?1:0)+(i===0?2:0)});
     if(ok)out.push([s,d])});
   out.sort(function(x,y){return y[0]-x[0]});return out.slice(0,12).map(function(x){return x[1]});
 }
 function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function show(){
   var v=q.value.trim();if(v.length<2){res.style.display='none';return}
   var r=find(v);
   res.innerHTML=r.length?r.map(function(d){return '<a href="'+root()+d.u+'"><span class="k">'+kind[d.k]+'</span><b>'+esc(d.a)+'</b>'+(d.b?'<small>'+esc(d.b.slice(0,110))+'</small>':'')+'</a>'}).join(''):'<div class="none">Ничего не найдено. Попробуй другое слово.</div>';
   res.style.display='block';
 }
 if(q){q.addEventListener('input',show);q.addEventListener('focus',show);
  document.addEventListener('click',function(e){if(!e.target.closest('.search'))res.style.display='none'});
  q.addEventListener('keydown',function(e){if(e.key==='Escape'){res.style.display='none';q.blur()}if(e.key==='Enter'){var a=$('#results a');if(a)location.href=a.href}});
  document.addEventListener('keydown',function(e){if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')){e.preventDefault();q.focus()}})}
 var gf=$('#gfilter');
 if(gf)gf.addEventListener('input',function(){
   var v=gf.value.trim().toLowerCase();
   $$('.gl p').forEach(function(p){p.classList.toggle('hidden',!!v&&p.textContent.toLowerCase().indexOf(v)<0)});
   $$('.gl-group').forEach(function(g){g.classList.toggle('hidden',!$('.gl p:not(.hidden)',g))})});
 var ff=$('#ffilter'),fs=$('#fsel');
 function fil(){var v=(ff.value||'').trim().toLowerCase(),n=fs.value;
   $$('.fblock').forEach(function(b){
     var any=false;
     $$('tr.frow',b).forEach(function(r){var okq=!v||r.textContent.toLowerCase().indexOf(v)>-1;r.classList.toggle('hidden',!okq);if(okq)any=true});
     b.classList.toggle('hidden',!any||(n!=='all'&&b.dataset.n!==n))})}
 if(ff){ff.addEventListener('input',fil);fs.addEventListener('change',fil)}
 $$('.fchip[data-n]').forEach(function(c){c.addEventListener('click',function(){
   $$('.fchip[data-n]').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false')});c.classList.add('on');c.setAttribute('aria-pressed','true');
   var n=c.dataset.n;$$('.qblock').forEach(function(b){b.classList.toggle('hidden',n!=='all'&&b.dataset.n!==n)})})});
 var oa=$('#openall'),ca=$('#closeall');
 if(oa)oa.addEventListener('click',function(){$$('.qblock:not(.hidden) details.qa').forEach(function(d){d.open=true})});
 if(ca)ca.addEventListener('click',function(){$$('details.qa').forEach(function(d){d.open=false})});
})();
