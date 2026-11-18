/* Single-section navigation for Threelittlewonders.
   Refresh preserves the current section and its scroll position. */
(()=>{
  'use strict';
  const LAST_VIEW_KEY='Threelittlewonders-last-view-v1';
  const SCROLL_KEY='Threelittlewonders-view-scroll-v1';
  const viewIds=['home','explore','test-series','contact','how-it-works','my-learning','about','privacy','terms','child-safety','faqs'];
  const views=new Map(viewIds.map(id=>[id,document.getElementById(id)]));
  const pageLinks=document.querySelectorAll('a[href^="#"]');
  let activeView='';
  let scrollTimer=0;

  function savedView(){
    try{
      const value=sessionStorage.getItem(LAST_VIEW_KEY)||'';
      return views.has(value)?value:'';
    }catch{return '';}
  }
  function currentView(){
    const hash=decodeURIComponent(window.location.hash.slice(1));
    if(views.has(hash))return hash;
    return savedView()||'home';
  }
  function saveView(view){
    try{sessionStorage.setItem(LAST_VIEW_KEY,view);}catch{}
  }
  function readScroll(view){
    try{
      const map=JSON.parse(sessionStorage.getItem(SCROLL_KEY)||'{}');
      const value=Number(map[view]);
      return Number.isFinite(value)&&value>=0?value:0;
    }catch{return 0;}
  }
  function saveScroll(view=activeView){
    if(!view)return;
    try{
      const map=JSON.parse(sessionStorage.getItem(SCROLL_KEY)||'{}');
      map[view]=Math.max(0,Math.round(window.scrollY||0));
      sessionStorage.setItem(SCROLL_KEY,JSON.stringify(map));
    }catch{}
  }
  function showView({restoreScroll=false}={}){
    const active=currentView();
    if(!window.location.hash||!views.has(decodeURIComponent(window.location.hash.slice(1)))){
      history.replaceState(null,'',window.location.pathname+window.location.search+'#'+active);
    }
    activeView=active;
    saveView(active);
    for(const [id,element] of views){
      if(element)element.hidden=id!==active;
    }
    for(const link of pageLinks){
      const target=link.getAttribute('href')?.slice(1);
      if(!views.has(target))continue;
      const isActive=target===active;
      link.classList.toggle('active',isActive);
      if(isActive)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    }
    document.title=(active==='home'?'Threelittlewonders':({
      explore:'Explore courses','test-series':'Test Series',contact:'Contact','how-it-works':'How it works','my-learning':'My learning',about:'About Us',privacy:'Privacy Policy',terms:'Terms & Conditions','child-safety':'Child Safety',faqs:'FAQs'
    }[active]+' | Threelittlewonders'));
    requestAnimationFrame(()=>{
      window.scrollTo(0,restoreScroll?readScroll(active):0);
    });
  }

  window.addEventListener('hashchange',()=>{
    saveScroll(activeView);
    showView({restoreScroll:false});
  });
  window.addEventListener('scroll',()=>{
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>saveScroll(activeView),120);
  },{passive:true});
  window.addEventListener('beforeunload',()=>saveScroll(activeView));

  showView({restoreScroll:true});
})();
