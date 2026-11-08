(function(){
'use strict';
var PR={};(window.WEHAD_PRODUCTS||[]).forEach(function(p){PR[p.slug]=p;});
var KEY='wehad_cart_v1',VAT=0.15;
var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(n){return (Math.round(n*100)/100).toLocaleString('en-US',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2});};

var MEM=[];
function load(){try{var c=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(c)?c.filter(function(i){return PR[i.slug]&&i.qty>0;}):[];}catch(e){return MEM;}}
function save(c){MEM=c;try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}render();}
function unit(i){var p=PR[i.slug];if(i.v&&p.variants){for(var k=0;k<p.variants.length;k++)if(p.variants[k][0]===i.v)return p.variants[k][1];}return p.price;}
function totals(c){var s=c.reduce(function(a,i){return a+unit(i)*i.qty;},0);var v=Math.round(s*VAT*100)/100;return {sub:s,vat:v,total:s+v,count:c.reduce(function(a,i){return a+i.qty;},0)};}

function add(slug,v,qty){var c=load();var f=c.filter(function(i){return i.slug===slug&&(i.v||'')===(v||'');})[0];
  if(f)f.qty=Math.min(999,f.qty+qty);else c.push({slug:slug,v:v||'',qty:qty});save(c);
  toast('تمت الإضافة إلى السلة ✓');var b=$('.cart-btn');if(b){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}}
function setQty(idx,q){var c=load();if(!c[idx])return;if(q<=0)c.splice(idx,1);else c[idx].qty=Math.min(999,q);save(c);}

var tt;function toast(m){var t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show');},2200);}

function itemHTML(i,idx){var p=PR[i.slug];
  return '<div class="li"><a href="/store/'+p.slug+'/"><img src="/store/img/'+p.img+'.jpg" alt=""></a><div><b>'+esc(p.name)+'</b><small>'+esc(i.v?('المقاس: '+i.v):(p.size||p.kind))+'</small><br>'+
  '<span class="mini"><button type="button" data-inc="'+idx+'" aria-label="زيادة">+</button><span>'+i.qty+'</span><button type="button" data-dec="'+idx+'" aria-label="نقصان">−</button></span><button type="button" class="rm" data-rm="'+idx+'">حذف</button></div>'+
  '<div class="lp">'+fmt(unit(i)*i.qty)+' <small>ريال</small></div></div>';}
function sumHTML(t){return '<div class="tot"><span>المجموع قبل الضريبة</span><span>'+fmt(t.sub)+' ريال</span></div><div class="tot"><span>ضريبة القيمة المضافة 15%</span><span>'+fmt(t.vat)+' ريال</span></div><div class="tot big"><span>الإجمالي</span><span>'+fmt(t.total)+' ريال</span></div>';}
var EMPTY='<div class="empty-cart"><p>سلتك فاضية.</p><a href="/store/">تصفّح المنتجات ←</a></div>';

function render(){var c=load(),t=totals(c);
  $$('[data-cart-count]').forEach(function(e){e.textContent=t.count;e.classList.toggle('has',t.count>0);});
  var l=$('[data-drawer-list]'),f=$('[data-drawer-ft]');
  if(l){l.innerHTML=c.length?c.map(itemHTML).join(''):EMPTY;f.innerHTML=c.length?sumHTML(t)+'<a class="btn-main wide go" href="/store/cart/">إتمام الطلب</a>':'';}
  var cl=$('[data-co-list]');if(cl){cl.innerHTML=c.length?c.map(itemHTML).join(''):EMPTY;$('[data-co-sum]').innerHTML=sumHTML(t)+'<p class="fine">تكلفة التوصيل تتأكد معك حسب موقعك.</p>';
    var fm=$('[data-co-form]');if(fm)fm.style.display=c.length?'':'none';}
}

/* drawer */
var lastFocus;
function openCart(){if(location.pathname.indexOf('/store/cart')===0){window.scrollTo({top:0,behavior:'smooth'});return;}var d=$('#drawer');lastFocus=document.activeElement;d.classList.add('open');d.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var x=$('.x',d);x&&x.focus();}
function closeCart(){var d=$('#drawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus&&lastFocus.focus&&lastFocus.focus();}

document.addEventListener('click',function(e){var t=e.target.closest('button,a');if(!t)return;
  if(t.hasAttribute('data-open-cart')){e.preventDefault();openCart();}
  else if(t.hasAttribute('data-close-cart'))closeCart();
  else if(t.dataset.add){add(t.dataset.add,'',1);}
  else if(t.dataset.inc!==undefined){var c=load();setQty(+t.dataset.inc,c[+t.dataset.inc].qty+1);}
  else if(t.dataset.dec!==undefined){var c2=load();setQty(+t.dataset.dec,c2[+t.dataset.dec].qty-1);}
  else if(t.dataset.rm!==undefined)setQty(+t.dataset.rm,0);
});
$$('[data-close-cart]').forEach(function(b){b.addEventListener('click',closeCart);});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeCart();});

/* mobile nav */
var bg=$('.burger'),lk=$('#links');if(bg)bg.addEventListener('click',function(){var o=lk.classList.toggle('open');bg.setAttribute('aria-expanded',o);});

/* listing filters */
var grid=$('[data-grid]');
if(grid){var cat='all',q='';var cards=$$('.card',grid);
  function apply(){var n=0;cards.forEach(function(c){var ok=(cat==='all'||c.dataset.cat===cat)&&(!q||c.dataset.q.toLowerCase().indexOf(q)>-1);c.hidden=!ok;if(ok)n++;});$('[data-empty]').hidden=n>0;}
  function setCat(k){cat=k;$$('.chip').forEach(function(ch){var on=ch.dataset.cat===k;ch.classList.toggle('on',on);ch.setAttribute('aria-selected',on);});apply();}
  $$('.chip').forEach(function(ch){ch.setAttribute('role','tab');ch.addEventListener('click',function(){setCat(ch.dataset.cat);try{history.replaceState(null,'',ch.dataset.cat==='all'?location.pathname:'#'+ch.dataset.cat);}catch(_){}});});
  $('[data-search]').addEventListener('input',function(e){q=e.target.value.trim().toLowerCase();apply();});
  var h=location.hash.slice(1);if(h&&$('.chip[data-cat="'+h+'"]'))setCat(h);
}

/* product page */
var pd=$('[data-product]');
if(pd){var slug=pd.dataset.product,qi=$('[data-qty]',pd),pe=$('[data-price]',pd);
  function curV(){var r=$('input[name=v]:checked',pd);return r?r.value:'';}
  $$('input[name=v]',pd).forEach(function(r){r.addEventListener('change',function(){pe.textContent=fmt(+r.dataset.price);});});
  $$('[data-q]',pd).forEach(function(b){b.addEventListener('click',function(){qi.value=Math.max(1,Math.min(999,(+qi.value||1)+(+b.dataset.q)));});});
  $('[data-add-pd]',pd).addEventListener('click',function(){add(slug,curV(),Math.max(1,Math.min(999,parseInt(qi.value,10)||1)));});
}

/* checkout */
var fm=$('[data-co-form]');
if(fm){fm.addEventListener('submit',function(e){e.preventDefault();var err=$('[data-co-err]');err.textContent='';
  var c=load();if(!c.length){err.textContent='السلة فاضية.';return;}
  var d={};new FormData(fm).forEach(function(v,k){d[k]=String(v).trim();});
  $$('.bad',fm).forEach(function(x){x.classList.remove('bad');});
  var bad=[];['name','phone','city','addr'].forEach(function(k){if(!d[k])bad.push(k);});
  var ph=d.phone.replace(/[\s\-]/g,'').replace(/^\+?966/,'0').replace(/[٠-٩]/g,function(x){return '٠١٢٣٤٥٦٧٨٩'.indexOf(x);});
  if(d.phone&&!/^05\d{8}$/.test(ph))bad.push('phone');
  if(bad.length){bad.forEach(function(k){fm.elements[k].classList.add('bad');});fm.elements[bad[0]].focus();err.textContent=bad.indexOf('phone')>-1&&d.phone?'اكتب رقم جوال سعودي صحيح يبدأ بـ 05':'كمّل البيانات المطلوبة.';return;}
  var t=totals(c),ref='WS-'+Date.now().toString(36).toUpperCase().slice(-6);
  var lines=c.map(function(i){var p=PR[i.slug];return '• '+p.name+(i.v?' ('+i.v+')':'')+' × '+i.qty+' = '+fmt(unit(i)*i.qty)+' ريال';}).join('\n');
  var fields={'الاسم':d.name,'الجوال':ph,'المدينة':d.city,'العنوان':d.addr,'طريقة الدفع':d.pay,'المنتجات':'\n'+lines,
    'المجموع قبل الضريبة':fmt(t.sub)+' ريال','الضريبة 15%':fmt(t.vat)+' ريال','الإجمالي':fmt(t.total)+' ريال (غير شامل التوصيل)','ملاحظات':d.notes||'-'};
  var btn=$('[data-co-submit]');btn.disabled=true;btn.textContent='جاري إرسال الطلب…';
  var payload={kind:'request',ref:ref,title:'طلب شراء من المتجر',fields:fields,lang:'ar',page:location.pathname,hp:d.hp};
  var done=function(r){showDone(r||ref,d,lines,t);save([]);};
  if(!window.WEHAD_API){done(ref);return;}
  fetch(window.WEHAD_API,{method:'POST',body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(j){if(!j.ok)throw j;done(j.ref);})
  .catch(function(){btn.disabled=false;btn.textContent='تأكيد الطلب';err.innerHTML='تعذّر إرسال الطلب. جرّب مرة ثانية أو <a href="'+waLink(ref,d,lines,t)+'" target="_blank" rel="noopener">أرسله على واتساب</a>.';});
});}
function waLink(ref,d,lines,t){var m='السلام عليكم، طلب من متجر وهاد البنيان\nرقم الطلب: '+ref+'\nالاسم: '+d.name+'\nالمدينة: '+d.city+'\nطريقة الدفع: '+d.pay+'\n\n'+lines+'\n\nالإجمالي مع الضريبة: '+fmt(t.total)+' ريال';return 'https://wa.me/'+window.WEHAD_WA+'?text='+encodeURIComponent(m);}
function showDone(ref,d,lines,t){var box=$('[data-co-done]');$('[data-co-main]').hidden=true;box.hidden=false;
  box.innerHTML='<div class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>وصلنا طلبك، شكرًا لك!</h2><p>رقم الطلب</p><div class="ref">'+esc(ref)+'</div>'+
  '<p>'+(d.pay==='تحويل بنكي'?'بنتواصل معك على '+esc(d.phone)+' لتأكيد الطلب وتكلفة التوصيل، ونرسل لك بيانات الحساب البنكي للتحويل.':'بنتواصل معك على '+esc(d.phone)+' لتأكيد الطلب وموعد التوصيل، والدفع يكون عند الاستلام.')+'</p>'+
  '<p style="margin-top:18px"><a class="btn-wa" href="'+waLink(ref,d,lines,t)+'" target="_blank" rel="noopener">تابع طلبك على واتساب</a></p><p><a href="/store/">الرجوع للمتجر</a></p>';
  window.scrollTo({top:0,behavior:'smooth'});}

render();
window.addEventListener('storage',function(e){if(e.key===KEY)render();});
})();
