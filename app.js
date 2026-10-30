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
let state=load(),subject='All',query='',currentLesson=null,currentQuestion=0,questionAnswered=false,returnFocus=null,toastTimer;
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch{showToast('Progress cannot be saved in this browser.')}}
const gradeName=g=>g===-2?'Nursery':g===-1?'LKG':g===0?'UKG':`Class ${g}`;
const subjectIcon=s=>SUBJECTS[s]?.icon||'📚';
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function setGrade(g){if(!Number.isInteger(g)||!GRADE_LEVELS.includes(g))return;state.grade=g;subject='All';query='';$('searchInput').value='';persist();renderAll()}
function renderGradeSelectors(){
 $('classSelect').innerHTML=GRADE_LEVELS.map(g=>`<option value="${g}" ${state.grade===g?'selected':''}>${gradeName(g)}</option>`).join('');
 $('gradeShortcuts').innerHTML=GRADE_LEVELS.map(g=>`<button class="grade-chip ${state.grade===g?'selected':''}" data-grade="${g}" aria-pressed="${state.grade===g}">${gradeName(g)}</button>`).join('');
}
function renderSubjectFilters(){
 const subjects=[...new Set(LESSONS.filter(x=>x.grade===state.grade).map(x=>x.subject))];
 $('subjectFilters').innerHTML=['All',...subjects].map(s=>`<button class="subject-btn ${subject===s?'active':''}" data-subject="${safe(s)}" aria-pressed="${subject===s}">${s==='All'?'✦ All subjects':subjectIcon(s)+' '+safe(s)}</button>`).join('');
}
function renderCourses(){
 const lessons=LESSONS.filter(l=>l.grade===state.grade&&(subject==='All'||l.subject===subject)&&(!query||[l.title,l.subject,l.description,l.concept].some(t=>t.toLowerCase().includes(query))));
 $('courseGrid').innerHTML=lessons.map(l=>{
 const done=state.completed.includes(l.id),visual=SUBJECTS[l.subject]?.color||'#f7f3eb';
 return `<article class="course-card"><div class="course-visual" style="background:${visual}"><span class="visual-emoji" aria-hidden="true">${safe(l.emoji)}</span><span class="visual-small" aria-hidden="true">✦</span><span class="card-top-tag">${l.minutes} min lesson</span>${done?'<span class="completed-label">✓ Completed</span>':''}</div><div class="course-content"><div class="course-subject">${safe(l.subject)} · ${gradeName(l.grade)}</div><h3>${safe(l.title)}</h3><p>${safe(l.description)}</p><div class="course-meta"><small><span>📘</span> Learn + quick quiz</small><button class="course-open" data-lesson-id="${safe(l.id)}" aria-label="${done?'Review':'Start'} ${safe(l.title)}">↗</button></div></div></article>`
 }).join('');
 $('emptyState').hidden=lessons.length>0;
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
function renderAll(){renderGradeSelectors();renderSubjectFilters();renderCourses();renderProgress()}
function openLesson(id){const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;currentLesson=lesson;currentQuestion=0;questionAnswered=false;returnFocus=document.activeElement;$('lessonModal').hidden=false;document.body.classList.add('modal-open');$('lessonTitle').textContent=lesson.title;$('modalSubjectIcon').textContent=subjectIcon(lesson.subject);$('modalMeta').textContent=`${gradeName(lesson.grade).toUpperCase()} · ${lesson.subject.toUpperCase()} · ${lesson.minutes} MIN`;
 showLearn();$('closeLesson').focus();}
function stage(which){['Learn','Quiz','Complete'].forEach(s=>{const x=$('stage'+s);x.classList.toggle('active',s===which);x.classList.toggle('done',({Learn:0,Quiz:1,Complete:2}[s]||0)<({Learn:0,Quiz:1,Complete:2}[which]||0))})}
function footer(left,button,action){const e=$('lessonFooter');e.innerHTML=`<span class="modal-helper">${safe(left)}</span><button class="btn btn-primary" id="modalAction">${safe(button)} <span aria-hidden="true">↗</span></button>`; $('modalAction').addEventListener('click',action)}
function showLearn(){if(!currentLesson)return;stage('Learn');const l=currentLesson;
 $('lessonBody').innerHTML=`<div class="concept-label">🌱 LET'S UNDERSTAND</div><h3>${safe(l.title)}</h3><p class="explain-text">${safe(l.concept)}</p><div class="example-card"><strong>💡 Here's an easy example</strong><p>${safe(l.example)}</p></div><div class="tip-card"><span>🌟</span><span><strong>Little challenge:</strong> ${safe(l.tip)}</span></div>`;
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
function continueLearning(){if(state.grade===-2){window.location.hash='#explore';return;}const next=LESSONS.find(l=>l.grade===state.grade&&!state.completed.includes(l.id))||LESSONS.find(l=>l.grade===state.grade);if(next)openLesson(next.id);else showToast('Choose a class to start learning!')}
function installEvents(){
 $('classSelect').addEventListener('change',e=>setGrade(Number(e.target.value)));
 $('gradeShortcuts').addEventListener('click',e=>{const btn=e.target.closest('[data-grade]');if(btn)setGrade(Number(btn.dataset.grade))});
 $('subjectFilters').addEventListener('click',e=>{const btn=e.target.closest('[data-subject]');if(btn){subject=btn.dataset.subject;renderSubjectFilters();renderCourses()}});
 $('searchInput').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderCourses()});
 $('courseGrid').addEventListener('click',e=>{const btn=e.target.closest('[data-lesson-id]');if(btn)openLesson(btn.dataset.lessonId)});
 $('clearFiltersBtn').addEventListener('click',()=>{subject='All';query='';$('searchInput').value='';renderSubjectFilters();renderCourses()});
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