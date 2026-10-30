/* Learning roadmap UI for Nursery through Class 10. Practice progress is separate from lesson quiz stars. */
(()=>{
'use strict';
const DATA=window.TLW_CURRICULUM||{};
const STORE_KEY='Threelittlewonders-curriculum-progress-v1';
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let practised=[];
try{
 const stored=JSON.parse(localStorage.getItem(STORE_KEY)||'[]');
 if(Array.isArray(stored))practised=[...new Set(stored.filter(x=>typeof x==='string'))];
}catch{}
let selected=null;
const grade=()=>String($('classSelect').value);
const gradeLabel=()=>({'-2':'Nursery','-1':'LKG','0':'UKG'}[grade()]||('Class '+grade()));
function topics(){
 return (DATA[grade()]||[]).flatMap((group,gi)=>group.topics.map((topic,ti)=>({
  title:topic.title,activity:topic.activity,area:group.area,icon:group.icon,
  key:grade()+':'+gi+':'+ti
 })));
}
function render(){
 const groups=DATA[grade()]||[];
 const section=$('curriculumSection');
 section.hidden=['-2','-1','0'].includes(grade())||groups.length===0;
 if(section.hidden){selected=null;return;}
 const all=topics(),done=all.filter(t=>practised.includes(t.key)).length;
 $('curriculumGrade').textContent=gradeLabel();
 $('topicSummary').textContent=all.length+' topics in '+groups.length+' learning areas';
 $('topicProgress').textContent=done+' of '+all.length+' practised';
 $('topicProgressFill').style.width=(all.length?Math.round(done/all.length*100):0)+'%';
 $('topicProgressTrack').setAttribute('aria-valuenow',String(done));
 $('topicProgressTrack').setAttribute('aria-valuemax',String(all.length));
 $('curriculumGroups').innerHTML=groups.map((group,gi)=>
  '<section class="curriculum-area">'+
  '<div class="curriculum-area-heading"><span aria-hidden="true">'+safe(group.icon)+'</span><h4>'+safe(group.area)+'</h4><small>'+group.topics.length+' topics</small></div>'+
  '<div class="topic-chip-grid">'+group.topics.map((topic,ti)=>{
   const key=grade()+':'+gi+':'+ti,completed=practised.includes(key),active=selected===key;
   return '<button type="button" class="topic-chip'+(completed?' practised':'')+(active?' selected':'')+'" data-topic="'+safe(key)+'" aria-pressed="'+active+'">'+
    '<span class="topic-chip-title">'+safe(topic.title)+'</span><span aria-hidden="true">'+(completed?'✓':'›')+'</span></button>';
  }).join('')+'</div></section>'
 ).join('');
 const current=all.find(t=>t.key===selected);
 const panel=$('topicPanel');
 panel.hidden=!current;
 if(current){
  const completed=practised.includes(current.key);
  panel.innerHTML='<div class="topic-panel-label">✦ GUIDED PRACTICE · '+safe(current.area)+'</div>'+
   '<h4>'+safe(current.title)+'</h4>'+
   '<p>'+safe(current.activity)+'</p>'+
   '<div class="topic-panel-footer"><span>'+(completed?'🌟 Topic practised!':'Try this with a parent, carer or teacher.')+'</span>'+
   '<button type="button" class="btn '+(completed?'btn-secondary':'btn-primary')+'" id="markTopicBtn">'+
   (completed?'✓ Mark as not practised':'✓ Mark as practised')+'</button></div>';
 }
}
$('curriculumGroups').addEventListener('click',e=>{
 const button=e.target.closest('button[data-topic]');
 if(!button)return;
 selected=button.dataset.topic;
 render();
 $('topicPanel').focus();
});
$('topicPanel').addEventListener('click',e=>{
 if(!e.target.closest('#markTopicBtn')||!selected||!topics().some(t=>t.key===selected))return;
 if(practised.includes(selected))practised=practised.filter(k=>k!==selected);
 else practised.push(selected);
 try{localStorage.setItem(STORE_KEY,JSON.stringify(practised));}catch{}
 render();
 $('markTopicBtn').focus();
});
$('classSelect').addEventListener('change',()=>{selected=null;render();});
$('gradeShortcuts').addEventListener('click',e=>{
 if(e.target.closest('[data-grade]')){selected=null;render();}
});
render();
})();