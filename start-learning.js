/* Start Learning entry flow: always begin at class selection. */
(()=>{
  'use strict';
  const start=document.getElementById('startLearningBtn');
  if(!start)return;
  start.addEventListener('click',event=>{
    event.preventDefault();
    window.location.hash='#explore';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const change=document.querySelector('#gradeShortcuts [data-change-class]');
      if(change)change.click();
      else document.getElementById('gradeShortcuts')?.scrollIntoView({behavior:'smooth',block:'center'});
    }));
  });
})();