(function(){
  var CONTACT="harj@eudaspace.co.uk";
  var list=[],state={q:"",cat:"all",area:"all"};
  var $=function(s){return document.querySelector(s)};
  var grid=$("#grid"),count=$("#count"),dlg=$("#dlg"),dlgBody=$("#dlgBody"),lastFocus=null;
  function esc(s){var d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML}
  function host(u){return u.replace(/^https?:\/\/(www\.)?/,"").replace(/\/$/,"")}
  function inArea(l,a){
    if(a==="all")return true;
    if(a==="surrey")return l.region.indexOf("Surrey")>-1;
    if(a==="swlondon")return l.region.indexOf("SW London")>-1;
    if(a==="nearby")return l.region.indexOf("Wider")===0;
    return true;
  }
  function filtered(){
    var q=state.q.trim().toLowerCase();
    return list.filter(function(l){
      if(state.cat!=="all"&&l.categorySlug!==state.cat)return false;
      if(!inArea(l,state.area))return false;
      if(q){var h=(l.name+" "+l.category+" "+l.town+" "+l.description+" "+l.sensoryNote).toLowerCase();if(h.indexOf(q)<0)return false}
      return true;
    });
  }
  function card(l){
    return '<li><article class="card"><span class="tag">'+esc(l.category)+'</span><h3>'+esc(l.name)+'</h3>'+
      '<p class="meta">'+esc(l.town)+'</p><p>'+esc(l.description)+'</p>'+
      '<p class="note"><strong>Sensory comfort notes:</strong> '+esc(l.sensoryNote)+'</p>'+
      '<div class="btns"><button type="button" class="btn ghost" data-open="'+esc(l.slug)+'" aria-label="Details for '+esc(l.name)+'">Details</button>'+
      '<a class="btn ghost" href="'+esc(l.website)+'" target="_blank" rel="noopener noreferrer">Website<span class="vh"> (opens in a new tab)</span></a></div></article></li>';
  }
  function render(){
    var r=filtered();
    grid.innerHTML=r.map(card).join("");
    count.textContent=r.length===list.length?("Showing all "+list.length+" listings"):("Showing "+r.length+" of "+list.length+" listings");
    if(!r.length)grid.innerHTML='<li><p>No listings match those filters. Try clearing the search or choosing all areas.</p></li>';
    document.querySelectorAll(".cats button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.cat===state.cat))});
  }
  function openListing(slug){
    var l=list.filter(function(x){return x.slug===slug})[0];if(!l)return;
    lastFocus=document.activeElement;
    var rows='<dt>Category</dt><dd>'+esc(l.category)+'</dd><dt>Area</dt><dd>'+esc(l.town)+'</dd>'+
      '<dt>Website</dt><dd><a href="'+esc(l.website)+'" target="_blank" rel="noopener noreferrer">'+esc(host(l.website))+'</a></dd>'+
      '<dt>Email</dt><dd>'+(l.email?'<a href="mailto:'+esc(l.email)+'">'+esc(l.email)+'</a>':'Not found on their website. Please use their website.')+'</dd>'+
      '<dt>Phone</dt><dd>'+(l.phone?'<a href="tel:'+esc(l.phone.replace(/[^+\d]/g,""))+'">'+esc(l.phone)+'</a>':'Not found on their website.')+'</dd>'+
      '<dt>About</dt><dd>'+esc(l.description)+'</dd><dt>Sensory comfort notes</dt><dd>'+esc(l.sensoryNote)+'</dd>'+
      '<dt>Researched</dt><dd>Website read on '+esc(l.reviewed)+'. Credentials, insurance and references have not yet been checked.</dd>';
    dlgBody.innerHTML='<button type="button" class="btn ghost close" id="closeDlg">Close</button><h2 id="dlgTitle">'+esc(l.name)+'</h2><dl>'+rows+'</dl>'+
      '<p><a href="mailto:'+CONTACT+'?subject='+encodeURIComponent("Correction or removal: "+l.name)+'">Suggest a correction or ask for this listing to be removed</a></p>';
    if(typeof dlg.showModal==="function")dlg.showModal();else dlg.setAttribute("open","");
    $("#closeDlg").addEventListener("click",closeDlg);
    history.replaceState(null,"","#listing-"+l.slug);
  }
  function closeDlg(){
    if(dlg.close)dlg.close();else dlg.removeAttribute("open");
    history.replaceState(null,"","#directory");
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function buildCats(){
    var cats={},order=[];
    list.forEach(function(l){if(!cats[l.categorySlug]){cats[l.categorySlug]={name:l.category,n:0};order.push(l.categorySlug)}cats[l.categorySlug].n++});
    var wanted=["architects","lighting","acoustic-flooring-joinery","decorators","organisers","buying-agents"];
    var html=wanted.map(function(s){var c=cats[s];return '<li><button type="button" data-cat="'+s+'" aria-pressed="false"><span class="t">'+esc(c.name)+'</span><span class="n">'+c.n+' listings</span></button></li>'}).join("");
    $("#cats").innerHTML=html;
    var sel=$("#cat");sel.innerHTML='<option value="all">All categories</option>'+wanted.map(function(s){return '<option value="'+s+'">'+esc(cats[s].name)+'</option>'}).join("");
  }
  function setCat(s,scroll){state.cat=s;$("#cat").value=s;render();if(scroll)$("#directory").scrollIntoView();history.replaceState(null,"",s==="all"?"#directory":"#category-"+s)}
  function init(data){
    list=data.sort(function(a,b){return a.order-b.order});
    buildCats();render();
    $("#q").addEventListener("input",function(e){state.q=e.target.value;render()});
    $("#cat").addEventListener("change",function(e){setCat(e.target.value,false)});
    $("#area").addEventListener("change",function(e){state.area=e.target.value;render()});
    $("#reset").addEventListener("click",function(){state={q:"",cat:"all",area:"all"};$("#q").value="";$("#cat").value="all";$("#area").value="all";render()});
    $("#cats").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setCat(b.dataset.cat,true)});
    grid.addEventListener("click",function(e){var b=e.target.closest("[data-open]");if(b)openListing(b.dataset.open)});
    dlg.addEventListener("click",function(e){if(e.target===dlg)closeDlg()});
    dlg.addEventListener("cancel",function(){history.replaceState(null,"","#directory")});
    var h=location.hash;
    if(h.indexOf("#category-")===0){state.cat=h.slice(10);$("#cat").value=state.cat;render()}
    if(h.indexOf("#listing-")===0)openListing(h.slice(9));
  }
  fetch("data/listings.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(init).catch(function(){
    grid.innerHTML='<li><p class="status">The directory data could not be loaded. If you opened this file directly, please view it through a web server (or the published site).</p></li>';
  });
})();
