/* Single-section navigation for Threelittlewonders.
   The URL hash identifies the active page, with Home as the default view.
   No learning data is removed or reloaded when switching sections. */
(()=>{
  'use strict';
  const viewIds=['home','explore','contact','how-it-works','my-learning'];
  const views=new Map(viewIds.map(id=>[id,document.getElementById(id)]));
  const pageLinks=document.querySelectorAll('a[href^="#"]');
  function currentView(){
    const hash=decodeURIComponent(window.location.hash.slice(1));
    return views.has(hash)?hash:'home';
  }
  function showView(){
    const active=currentView();
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
      explore:'Explore courses',contact:'Contact','how-it-works':'How it works','my-learning':'My learning'
    }[active]+' | Threelittlewonders'));
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange',showView);
  showView();
})();
