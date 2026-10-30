(()=>{
'use strict';
const LESSONS=window.TLW_LESSONS||[];
const SUBJECTS=window.TLW_SUBJECTS||{};
const STORE_KEY='Threelittlewonders-progress-v1';
const LEGACY_STORE_KEY='threeelittlewonders-progress-v1';
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GRADE_LEVELS=[-2,-1,0,...Array.from({length:10},(_,i)=>i+1)];
function load(){try{const v=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem(LEGACY_STORE_KEY)||'{}');return {grade:Number.isInteger(v.grade)&&GRADE_LEVELS.includes(v.grade)?v.grade:3,completed:Array.isArray(v.completed)?[...new Set(v.completed.filter(x=>typeof x==='string'))]:[]}}catch{return {grade:3,completed:[]}}}
let state=load(),subject='',query='',classChoicesOpen=true,currentTopicId='',currentLesson=null,currentQuestion=0,questionAnswered=false,returnFocus=null,toastTimer;
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch{showToast('Progress cannot be saved in this browser.')}}
const gradeName=g=>g===-2?'Nursery':g===-1?'LKG':g===0?'UKG':`Class ${g}`;
const subjectIcon=s=>SUBJECTS[s]?.icon||'📚';
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function setGrade(g){if(!Number.isInteger(g)||!GRADE_LEVELS.includes(g))return;state.grade=g;subject='';query='';currentTopicId='';classChoicesOpen=false;$('searchInput').value='';persist();renderAll();requestAnimationFrame(()=>$('classSubjectSection')?.scrollIntoView({behavior:'smooth',block:'start'}))}
function renderGradeSelectors(){
 $('classSelect').innerHTML=GRADE_LEVELS.map(g=>`<option value="${g}" ${state.grade===g?'selected':''}>${gradeName(g)}</option>`).join('');
 const classPicker=document.querySelector('.class-picker');
 if(classPicker)classPicker.hidden=!classChoicesOpen;
 if(classChoicesOpen){
  $('gradeShortcuts').classList.remove('selected-class-only');
  $('gradeShortcuts').innerHTML=GRADE_LEVELS.map(g=>`<button class="grade-chip ${state.grade===g?'selected':''}" data-grade="${g}" aria-pressed="${state.grade===g}">${gradeName(g)}</button>`).join('');
 }else{
  $('gradeShortcuts').classList.add('selected-class-only');
  $('gradeShortcuts').innerHTML=`<div class="selected-class-display"><strong>${gradeName(state.grade)}</strong><button type="button" class="change-class-btn" data-change-class>Change class</button></div>`;
 }
}
function renderSubjectFilters(){
 const subjects=[...new Set(LESSONS.filter(x=>x.grade===state.grade).map(x=>x.subject))];
 const preferredOrder={English:0,Hindi:1,Sanskrit:2,Urdu:3,Maths:4,Science:5,EVS:6,'Social Science':7,Computer:8,'General Knowledge':9};
 subjects.sort((a,b)=>(preferredOrder[a]??99)-(preferredOrder[b]??99)||a.localeCompare(b));
 const choices=['All Subjects',...subjects];
 $('subjectGradeName').textContent=gradeName(state.grade);
 $('subjectFilters').innerHTML=choices.map(s=>`<button class="subject-btn subject-choice ${subject===s?'active':''}" data-subject="${safe(s)}" aria-pressed="${subject===s}"><span class="subject-choice-icon" aria-hidden="true">${s==='All Subjects'?'✦':subjectIcon(s)}</span><span class="subject-choice-name">${safe(s)}</span></button>`).join('');
}
function renderCourses(){
 const lessonSection=$('lessonResultsSection');
 if(!subject){
  lessonSection.hidden=true;
  $('courseGrid').innerHTML='';
  $('emptyState').hidden=true;
  currentTopicId='';
  return;
 }
 lessonSection.hidden=false;
 const allSubjects=subject==='All Subjects';
 $('selectedSubjectTitle').textContent=subject;
 $('selectedSubjectPill').innerHTML=`<span aria-hidden="true">${allSubjects?'✦':subjectIcon(subject)}</span><strong>${safe(subject)}</strong> · ${gradeName(state.grade)}`;
 const lessons=LESSONS.filter(l=>l.grade===state.grade&&(allSubjects||l.subject===subject)&&(!query||[l.title,l.subject,l.description,l.concept].some(t=>t.toLowerCase().includes(query))));
 if(!lessons.length){
  currentTopicId='';
  $('courseGrid').innerHTML='';
  $('emptyState').hidden=false;
  return;
 }
 $('emptyState').hidden=true;
 if(!lessons.some(l=>l.id===currentTopicId))currentTopicId=lessons[0].id;
 const selected=lessons.find(l=>l.id===currentTopicId)||lessons[0];
 const done=state.completed.includes(selected.id);
 const richNote=(selected.activities?.length||selected.rhymes?.length||selected.stories?.length)
   ? '<div class="topic-rich-note">✨ This topic includes additional guided learning content. Select <strong>Read</strong> to view everything.</div>'
   : '';
 $('courseGrid').innerHTML=`
  <div class="topic-browser">
   <aside class="topic-list-panel" aria-label="Topics in ${safe(subject)}">
    <div class="topic-list-header"><span>TOPICS</span><strong>${lessons.length}</strong></div>
    <div class="topic-list">
     ${lessons.map((l,i)=>`<button type="button" class="topic-list-item ${l.id===selected.id?'active':''}" data-topic-id="${safe(l.id)}" aria-pressed="${l.id===selected.id}">
       <span class="topic-list-number">${i+1}</span>
       <span class="topic-list-copy">${allSubjects?'<small>'+safe(l.subject)+'</small>':''}<strong>${safe(l.title)}</strong></span>
       ${state.completed.includes(l.id)?'<span class="topic-list-done" title="Completed">✓</span>':''}
      </button>`).join('')}
    </div>
   </aside>
   <article class="topic-content-panel" aria-live="polite">
    <div class="topic-content-top">
     <div>
      <span class="topic-content-subject">${subjectIcon(selected.subject)} ${safe(selected.subject)} · ${gradeName(selected.grade)}</span>
      <h3>${safe(selected.title)}</h3>
      <p class="topic-content-description">${safe(selected.description)}</p>
     </div>
     <span class="topic-time">${selected.minutes} min</span>
    </div>
    <div class="topic-content-block">
     <span class="topic-content-label">🌱 What you will learn</span>
     <p>${safe(selected.concept)}</p>
    </div>
    <div class="topic-content-block topic-example-block">
     <span class="topic-content-label">💡 Easy example</span>
     <p>${safe(selected.example)}</p>
    </div>
    <div class="topic-content-block topic-activity-block">
     <span class="topic-content-label">🌟 Try this</span>
     <p>${safe(selected.tip)}</p>
    </div>
    ${richNote}
    <div class="topic-content-actions">
     <span class="topic-read-status">${done?'✓ Completed · Read again':'📖 Full lesson + quick quiz'}</span>
     <button type="button" class="btn btn-primary topic-read-btn" data-read-lesson="${safe(selected.id)}">Read</button>
    </div>
   </article>
  </div>`;
}
function renderProgress(){
 const gradeLessons=LESSONS.filter(l=>l.grade===state.grade),doneGrade=gradeLessons.filter(l=>state.completed.includes(l.id)).length;
 const validCompleted=state.completed.filter(id=>LESSONS.some(l=>l.id===id));
 const pct=gradeLessons.length?Math.round(doneGrade/gradeLessons.length*100):0;
 const stars=validCompleted.length*20;
 $('navStars').textContent=stars;
 $('totalStars').textContent=stars;
 $('completedCount').textContent=validCompleted.length;
 $('progressPercent').textContent=pct+'%';
 $('progressFill').style.width=pct+'%';
 $('progressSubtitle').textContent=pct===100?'You finished every starter lesson in '+gradeName(state.grade)+'! 🎉':`${doneGrade} of ${gradeLessons.length} ${gradeName(state.grade)} lessons completed`;
}
function renderAll(){renderGradeSelectors();renderSubjectFilters();renderCourses();renderProgress();if(state.grade>=-2&&state.grade<=0){const roadmap=$('curriculumSection');if(roadmap)roadmap.hidden=true;}}
function openLesson(id){const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;currentLesson=lesson;currentQuestion=0;questionAnswered=false;returnFocus=document.activeElement;$('lessonModal').hidden=false;document.body.classList.add('modal-open');$('lessonTitle').textContent=lesson.title;$('modalSubjectIcon').textContent=subjectIcon(lesson.subject);$('modalMeta').textContent=`${gradeName(lesson.grade).toUpperCase()} · ${lesson.subject.toUpperCase()} · ${lesson.minutes} MIN`;
 showLearn();$('closeLesson').focus();}
function stage(which){['Learn','Quiz','Complete'].forEach(s=>{const x=$('stage'+s);x.classList.toggle('active',s===which);x.classList.toggle('done',({Learn:0,Quiz:1,Complete:2}[s]||0)<({Learn:0,Quiz:1,Complete:2}[which]||0))})}
function footer(left,button,action){const e=$('lessonFooter');e.innerHTML=`<span class="modal-helper">${safe(left)}</span><button class="btn btn-primary" id="modalAction">${safe(button)} <span aria-hidden="true">↗</span></button>`; $('modalAction').addEventListener('click',action)}
function renderRichLesson(l){
 const blocks=[];
 if(Array.isArray(l.activities)&&l.activities.length){
  blocks.push('<section class="rich-lesson-section"><h4>🗣️ Listening & Speaking Practice</h4><p class="rich-lesson-intro">Read one activity at a time. First listen to the teacher question, then practise the child response aloud.</p><div class="lesson-activity-table">'+
   l.activities.map((row,i)=>'<div class="lesson-activity-row"><div class="lesson-activity-name"><span class="lesson-activity-number">'+(i+1)+'</span><strong>'+safe(row[0])+'</strong></div><div class="lesson-activity-example"><div class="activity-dialogue">'+safe(row[1]).replace(/\\n/g,'<br>')+'</div>'+(row[2]?'<div class="activity-learning"><strong>Learning:</strong> '+safe(row[2])+'</div>':'')+'</div></div>').join('')+
   '</div></section>');
 }
 if(Array.isArray(l.rhymes)&&l.rhymes.length){
  blocks.push('<section class="rich-lesson-section"><h4>🎵 Nursery Rhymes</h4><div class="rhyme-grid">'+
   l.rhymes.map((r,i)=>'<article class="rhyme-card"><span class="rich-index">'+(i+1)+'</span><h5>'+safe(r.title)+'</h5><p class="rhyme-text">'+safe(r.text).replace(/\n/g,'<br>')+'</p></article>').join('')+
   '</div></section>');
 }
 if(Array.isArray(l.stories)&&l.stories.length){
  blocks.push('<section class="rich-lesson-section"><h4>📖 Nursery Stories</h4><div class="story-list">'+
   l.stories.map((story,i)=>'<article class="story-card"><div class="story-heading"><span class="rich-index">'+(i+1)+'</span><h5>'+safe(story.title)+'</h5></div><p class="story-text">'+safe(story.text).replace(/\n\n/g,'</p><p class="story-text">').replace(/\n/g,'<br>')+'</p><div class="story-moral"><strong>Moral:</strong> '+safe(story.moral)+'</div></article>').join('')+
   '</div></section>');
 }
 return blocks.join('');
}
function showLearn(){if(!currentLesson)return;stage('Learn');const l=currentLesson;
 const rich=renderRichLesson(l);
 $('lessonBody').innerHTML=`<div class="concept-label">🌱 LET'S UNDERSTAND</div><h3>${safe(l.title)}</h3><p class="explain-text">${safe(l.concept)}</p><div class="example-card"><strong>💡 Here's an easy example</strong><p>${safe(l.example)}</p></div><div class="tip-card"><span>🌟</span><span><strong>Little challenge:</strong> ${safe(l.tip)}</span></div>${rich}`;
 footer('Step 1 of 3 · Read and discover','Try a quiz',()=>{currentQuestion=0;showQuiz()});}
function showQuiz(){if(!currentLesson)return;stage('Quiz');questionAnswered=false;const q=currentLesson.questions[currentQuestion];
 $('lessonBody').innerHTML=`<div class="quiz-number">🧩 QUICK QUIZ · QUESTION ${currentQuestion+1} OF ${currentLesson.questions.length}</div><h3>${safe(q.text)}</h3><p class="explain-text">Choose the answer that feels right. You can try again if you need to!</p><div class="answer-grid">${q.options.map((op,i)=>`<button class="answer-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${safe(op)}</button>`).join('')}</div><div id="quizFeedback" aria-live="polite"></div>`;
 $('lessonBody').querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answer(Number(btn.dataset.answer))));
 footer('Take your time. You’ve got this!','Next question',()=>{});
 $('modalAction').disabled=true;
 $('modalAction').style.opacity='.5';}
function answer(choice){if(!currentLesson||questionAnswered)return;const q=currentLesson.questions[currentQuestion];
 const buttons=[...$('lessonBody').querySelectorAll('[data-answer]')];
 if(choice!==q.answer){buttons[choice].classList.add('incorrect');$('quizFeedback').innerHTML='<div class="feedback retry">Not quite! Give it another try. You can do it! 💛</div>';return}
 questionAnswered=true;buttons.forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct')});
 $('quizFeedback').innerHTML='<div class="feedback good">That’s right! Amazing thinking! 🌟</div>';
 const last=currentQuestion===currentLesson.questions.length-1;
 const footerButton=$('modalAction');footerButton.disabled=false;footerButton.style.opacity='1';footerButton.innerHTML=last?'Finish lesson ↗':'Next question ↗';footerButton.onclick=()=>{if(last)completeLesson();else{currentQuestion++;showQuiz()}};
}
function completeLesson(){if(!currentLesson)return;stage('Complete');const already=state.completed.includes(currentLesson.id);if(!already){state.completed.push(currentLesson.id);persist();renderProgress();renderCourses()}
 $('lessonBody').innerHTML=`<div class="celebrate"><div class="celebrate-emoji" aria-hidden="true">🎉🌟</div><h3>Wonderfully done!</h3><p>You completed <strong>${safe(currentLesson.title)}</strong>! Every little lesson takes you closer to big discoveries.</p><div class="reward">⭐ ${already?'Lesson reviewed!':'+20 stars earned!'}</div></div>`;
 footer('Keep that curious mind shining!','Explore more',()=>{closeLesson();window.location.hash='#explore';});
}
function closeLesson(){if($('lessonModal').hidden)return;$('lessonModal').hidden=true;document.body.classList.remove('modal-open');currentLesson=null;if(returnFocus&&typeof returnFocus.focus==='function')returnFocus.focus()}
function continueLearning(){const next=LESSONS.find(l=>l.grade===state.grade&&!state.completed.includes(l.id))||LESSONS.find(l=>l.grade===state.grade);if(next)openLesson(next.id);else showToast('Choose a class to start learning!')}
function installEvents(){
 $('classSelect').addEventListener('change',e=>setGrade(Number(e.target.value)));
 $('gradeShortcuts').addEventListener('click',e=>{const gradeBtn=e.target.closest('[data-grade]');if(gradeBtn){setGrade(Number(gradeBtn.dataset.grade));return;}const changeBtn=e.target.closest('[data-change-class]');if(changeBtn){classChoicesOpen=true;renderGradeSelectors();requestAnimationFrame(()=>$('gradeShortcuts')?.scrollIntoView({behavior:'smooth',block:'center'}));}});
 $('subjectFilters').addEventListener('click',e=>{const btn=e.target.closest('[data-subject]');if(btn){subject=btn.dataset.subject;query='';currentTopicId='';$('searchInput').value='';renderSubjectFilters();renderCourses();requestAnimationFrame(()=>$('lessonResultsSection')?.scrollIntoView({behavior:'smooth',block:'start'}))}});
 $('searchInput').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderCourses()});
 $('courseGrid').addEventListener('click',e=>{const topic=e.target.closest('[data-topic-id]');if(topic){currentTopicId=topic.dataset.topicId;renderCourses();return;}const read=e.target.closest('[data-read-lesson]');if(read)openLesson(read.dataset.readLesson);});
 $('clearFiltersBtn').addEventListener('click',()=>{query='';$('searchInput').value='';renderCourses()});
 $('continueBtn').addEventListener('click',continueLearning);
 $('closeLesson').addEventListener('click',closeLesson);
 $('lessonModal').addEventListener('click',e=>{if(e.target===$('lessonModal'))closeLesson()});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('lessonModal').hidden)closeLesson()});
 $('mobileMenuBtn').addEventListener('click',()=>{const menu=$('mobileMenu');menu.hidden=!menu.hidden;$('mobileMenuBtn').setAttribute('aria-expanded',String(!menu.hidden));$('mobileMenuBtn').textContent=menu.hidden?'☰':'✕'});
 $('mobileMenu').addEventListener('click',e=>{if(e.target.closest('a')){$('mobileMenu').hidden=true;$('mobileMenuBtn').setAttribute('aria-expanded','false');$('mobileMenuBtn').textContent='☰'}});
}
$('currentYear').textContent=new Date().getFullYear();
renderAll();installEvents();
})();