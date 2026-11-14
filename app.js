(()=>{
'use strict';
const LESSONS=window.TLW_LESSONS||[];
const SUBJECTS=window.TLW_SUBJECTS||{};
const STORE_KEY='Threelittlewonders-progress-v1';
const LEGACY_STORE_KEY='threeelittlewonders-progress-v1';
const STUDY_STORE_KEY='Threelittlewonders-study-dashboard-v1';
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GRADE_LEVELS=[-2,-1,0,...Array.from({length:10},(_,i)=>i+1)];
const GRADE_GROUPS=[
 {key:'foundation',label:'Foundation',range:'Nursery · LKG · UKG',icon:'🌱',grades:[-2,-1,0]},
 {key:'primary',label:'Primary',range:'Classes 1–5',icon:'📘',grades:[1,2,3,4,5]},
 {key:'middle',label:'Middle School',range:'Classes 6–8',icon:'🧭',grades:[6,7,8]},
 {key:'secondary',label:'Secondary',range:'Classes 9–10',icon:'🎓',grades:[9,10]}
];
function load(){try{const v=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem(LEGACY_STORE_KEY)||'{}');return {grade:Number.isInteger(v.grade)&&GRADE_LEVELS.includes(v.grade)?v.grade:3,completed:Array.isArray(v.completed)?[...new Set(v.completed.filter(x=>typeof x==='string'))]:[]}}catch{return {grade:3,completed:[]}}}
let state=load(),subject='',query='',classChoicesOpen=true,currentTopicId='',currentSubtopicKey='',currentLesson=null,currentQuestion=0,questionAnswered=false,currentQuizDifficulty='all',currentQuizQuestions=[],currentMistakeId='',currentPracticeSource='',currentFlashcardId='',returnFocus=null,toastTimer;
function persist(){
 try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch{showToast('Progress cannot be saved in this browser.')}
 queueCloudLearningSync();
}
const gradeName=g=>g===-2?'Nursery':g===-1?'LKG':g===0?'UKG':`Class ${g}`;
const subjectIcon=s=>SUBJECTS[s]?.icon||'📚';
function emptyStudyData(){
 return {
  lastLessonId:'',
  lastSubtopicKey:'',
  lessonStats:{},
  topicStats:{},
  testAttempts:[],
  mistakes:[],
  badges:[],
  flashcardStats:{},
  timeByDate:{},
  daily:{date:'',completedLessonIds:[],practicedTopics:[],dailyChallengeDone:false,mysteryChallengeDone:false}
 };
}
function loadStudyData(){
 try{
  const raw=JSON.parse(localStorage.getItem(STUDY_STORE_KEY)||'{}');
  const base=emptyStudyData();
  return {
   ...base,...raw,
   lessonStats:raw&&raw.lessonStats&&typeof raw.lessonStats==='object'?raw.lessonStats:{},
   topicStats:raw&&raw.topicStats&&typeof raw.topicStats==='object'?raw.topicStats:{},
   testAttempts:Array.isArray(raw&&raw.testAttempts)?raw.testAttempts:[],
   mistakes:Array.isArray(raw&&raw.mistakes)?raw.mistakes:[],
   badges:Array.isArray(raw&&raw.badges)?raw.badges:[],
   flashcardStats:raw&&raw.flashcardStats&&typeof raw.flashcardStats==='object'?raw.flashcardStats:{},
   timeByDate:raw&&raw.timeByDate&&typeof raw.timeByDate==='object'?raw.timeByDate:{},
   daily:raw&&raw.daily&&typeof raw.daily==='object'?{
    date:String(raw.daily.date||''),
    completedLessonIds:Array.isArray(raw.daily.completedLessonIds)?raw.daily.completedLessonIds:[],
    practicedTopics:Array.isArray(raw.daily.practicedTopics)?raw.daily.practicedTopics:[],
    dailyChallengeDone:!!raw.daily.dailyChallengeDone,
    mysteryChallengeDone:!!raw.daily.mysteryChallengeDone
   }:base.daily
  };
 }catch{return emptyStudyData()}
}
let studyData=loadStudyData();
let cloudSyncTimer=null;
let cloudHydrating=false;
let cloudHydratedUid='';
function cloudLearningAvailable(){
 return !!(window.TLWCloud?.enabled&&window.TLWCloud?.currentUser?.uid);
}
function cloudLearningPayload(){
 return {
  progress:{
   grade:state.grade,
   completed:[...state.completed]
  },
  studyData:{
   ...studyData,
   badges:Array.isArray(studyData.badges)?studyData.badges:[]
  },
  badges:Array.isArray(studyData.badges)?studyData.badges:[]
 };
}
function queueCloudLearningSync(){
 if(cloudHydrating||!cloudLearningAvailable())return;
 clearTimeout(cloudSyncTimer);
 cloudSyncTimer=setTimeout(()=>{
  window.TLWCloud.saveLearning(cloudLearningPayload()).catch(error=>{
   console.error('Cloud learning sync failed',error);
  });
 },650);
}
function normaliseCloudStudyData(raw){
 const base=emptyStudyData();
 const value=raw&&typeof raw==='object'?raw:{};
 return {
  ...base,...value,
  lessonStats:value.lessonStats&&typeof value.lessonStats==='object'?value.lessonStats:{},
  topicStats:value.topicStats&&typeof value.topicStats==='object'?value.topicStats:{},
  testAttempts:Array.isArray(value.testAttempts)?value.testAttempts:[],
  mistakes:Array.isArray(value.mistakes)?value.mistakes:[],
  badges:Array.isArray(value.badges)?value.badges:[],
  flashcardStats:value.flashcardStats&&typeof value.flashcardStats==='object'?value.flashcardStats:{},
  timeByDate:value.timeByDate&&typeof value.timeByDate==='object'?value.timeByDate:{},
  daily:value.daily&&typeof value.daily==='object'?{
   date:String(value.daily.date||''),
   completedLessonIds:Array.isArray(value.daily.completedLessonIds)?value.daily.completedLessonIds:[],
   practicedTopics:Array.isArray(value.daily.practicedTopics)?value.daily.practicedTopics:[],
   dailyChallengeDone:!!value.daily.dailyChallengeDone,
   mysteryChallengeDone:!!value.daily.mysteryChallengeDone
  }:base.daily
 };
}
async function hydrateCloudLearning(){
 const cloud=window.TLWCloud;
 if(!cloud?.enabled)return false;
 const ready=await cloud.ready;
 if(!ready||!cloud.currentUser?.uid)return false;
 const uid=cloud.currentUser.uid;
 if(cloudHydratedUid===uid)return true;
 cloudHydrating=true;
 try{
  const remote=await cloud.loadLearning();
  if(remote&&(remote.progress||remote.studyData)){
   const progress=remote.progress||{};
   state={
    grade:Number.isInteger(progress.grade)&&GRADE_LEVELS.includes(progress.grade)?progress.grade:state.grade,
    completed:Array.isArray(progress.completed)?[...new Set(progress.completed.filter(x=>typeof x==='string'))]:[]
   };
   studyData=normaliseCloudStudyData(remote.studyData||{});
   if(Array.isArray(remote.badges)&&!studyData.badges.length)studyData.badges=[...remote.badges];
   try{
    localStorage.setItem(STORE_KEY,JSON.stringify(state));
    localStorage.setItem(STUDY_STORE_KEY,JSON.stringify(studyData));
   }catch{}
  }else{
   await cloud.saveLearning(cloudLearningPayload());
  }
  cloudHydratedUid=uid;
  renderAll();
  renderTestSeriesClasses();
  renderStudyDashboard();
  return true;
 }catch(error){
  console.error('Cloud learning hydration failed',error);
  return false;
 }finally{
  cloudHydrating=false;
 }
}
function resetCloudHydration(){
 cloudHydratedUid='';
}

function todayKey(){return new Date().toISOString().slice(0,10)}
function normaliseStudyDay(){
 const today=todayKey();
 if(studyData.daily.date!==today)studyData.daily={date:today,completedLessonIds:[],practicedTopics:[],dailyChallengeDone:false,mysteryChallengeDone:false};
 if(!Array.isArray(studyData.daily.practicedTopics))studyData.daily.practicedTopics=[];
}
function saveStudyData(){
 normaliseStudyDay();
 try{localStorage.setItem(STUDY_STORE_KEY,JSON.stringify(studyData))}catch{}
 queueCloudLearningSync();
}
function lessonStudyStat(id){
 if(!studyData.lessonStats[id])studyData.lessonStats[id]={correct:0,wrong:0,attempts:0,lastStudied:'',completedAt:''};
 return studyData.lessonStats[id];
}
function topicStatKey(lessonId,topicKey='overview'){return lessonId+'::'+(topicKey||'overview')}
function topicStudyStat(lessonId,topicKey='overview'){
 const key=topicStatKey(lessonId,topicKey);
 if(!studyData.topicStats[key]){
  studyData.topicStats[key]={
   quizCorrect:0,quizWrong:0,
   revisionCorrect:0,revisionWrong:0,
   testCorrect:0,testWrong:0,
   lastStudied:'',lastAttemptAt:'',
   revisionStep:0,nextReviewAt:'',lastReviewAt:'',lastOutcome:'',confidence:''
  };
 }
 return studyData.topicStats[key];
}
const REVISION_INTERVALS=[0,1,3,7,14,30];
function dateAfterDays(days){
 const d=new Date();
 d.setHours(9,0,0,0);
 d.setDate(d.getDate()+Math.max(0,Number(days)||0));
 return d.toISOString();
}
function scheduleRevision(lessonId,topicKey='overview',outcome='correct',confidence='normal'){
 const stat=topicStudyStat(lessonId,topicKey||'overview');
 const now=new Date().toISOString();
 let step=Number.isInteger(stat.revisionStep)?stat.revisionStep:0;
 if(outcome==='wrong'){
  step=1;
  stat.revisionStep=step;
  stat.nextReviewAt=dateAfterDays(REVISION_INTERVALS[step]);
 }else if(confidence==='confident'){
  step=Math.max(step,3);
  stat.revisionStep=step;
  stat.nextReviewAt=dateAfterDays(REVISION_INTERVALS[step]);
 }else if(!stat.nextReviewAt){
  step=1;
  stat.revisionStep=step;
  stat.nextReviewAt=dateAfterDays(REVISION_INTERVALS[step]);
 }else if(revisionDue(stat)){
  step=Math.min(REVISION_INTERVALS.length-1,Math.max(1,step+1));
  stat.revisionStep=step;
  stat.nextReviewAt=dateAfterDays(REVISION_INTERVALS[step]);
 }
 stat.lastReviewAt=now;
 stat.lastOutcome=outcome;
 stat.confidence=confidence;
 return stat.nextReviewAt;
}
function revisionDue(stat){
 if(!stat||!stat.nextReviewAt)return false;
 return new Date(stat.nextReviewAt).getTime()<=Date.now();
}
function nextRevisionLabel(stat){
 if(!stat||!stat.nextReviewAt)return 'Not scheduled';
 const due=new Date(stat.nextReviewAt);
 const today=new Date();today.setHours(0,0,0,0);
 const target=new Date(due);target.setHours(0,0,0,0);
 const days=Math.round((target-today)/86400000);
 if(days<=0)return 'Today';
 if(days===1)return 'Tomorrow';
 return 'In '+days+' days';
}
function mistakeIdFor(lessonId,questionText){
 let hash=0;
 const value=lessonId+'|'+String(questionText||'');
 for(let i=0;i<value.length;i++)hash=((hash<<5)-hash+value.charCodeAt(i))|0;
 return lessonId+'::'+Math.abs(hash);
}
function saveMistake(lesson,topicKey,question,selectedIndex,source='quiz'){
 if(!lesson||!question||!Array.isArray(question.options))return;
 const id=mistakeIdFor(lesson.id,question.text);
 const correctIndex=Number(question.answer);
 const existing=studyData.mistakes.find(m=>m.id===id);
 const entry={
  id,
  lessonId:lesson.id,
  topicKey:topicKey||'overview',
  subject:lesson.subject,
  chapter:lesson.title,
  question:String(question.text||''),
  options:[...question.options],
  selectedIndex:Number(selectedIndex),
  correctIndex,
  selectedAnswer:String(question.options[selectedIndex]??''),
  correctAnswer:String(question.options[correctIndex]??''),
  explanation:questionExplanation(lesson,question),
  source,
  lastWrongAt:new Date().toISOString(),
  wrongCount:(existing?.wrongCount||0)+1,
  resolved:false,
  resolvedAt:''
 };
 if(existing)Object.assign(existing,entry);
 else studyData.mistakes.unshift(entry);
 studyData.mistakes=studyData.mistakes.slice(0,200);
 saveStudyData();
}
function resolveMistake(id){
 if(!id)return;
 const item=studyData.mistakes.find(m=>m.id===id);
 if(!item)return;
 item.resolved=true;
 item.resolvedAt=new Date().toISOString();
 saveStudyData();
 renderStudyDashboard();
}
function resolveMistakeForQuestion(lessonId,questionText){
 const id=mistakeIdFor(lessonId,questionText);
 const item=studyData.mistakes.find(m=>m.id===id&&!m.resolved);
 if(!item)return;
 item.resolved=true;
 item.resolvedAt=new Date().toISOString();
 saveStudyData();
}
function activeMistakesForGrade(grade){
 return studyData.mistakes.filter(m=>{
  if(m.resolved)return false;
  const lesson=LESSONS.find(l=>l.id===m.lessonId);
  return lesson&&lesson.grade===grade;
 }).sort((a,b)=>new Date(b.lastWrongAt)-new Date(a.lastWrongAt));
}
function openMistakeRetry(id){
 const mistake=studyData.mistakes.find(m=>m.id===id);
 if(!mistake)return;
 const lesson=LESSONS.find(l=>l.id===mistake.lessonId);
 if(!lesson)return;
 const all=validQuestionsWithMeta(lesson);
 const item=all.find(x=>String(x.question.text)===String(mistake.question));
 if(!item){
  openDashboardLesson(lesson.id,mistake.topicKey||'');
  return;
 }
 currentMistakeId=id;
 currentLesson=lesson;
 currentQuizDifficulty=item.difficulty;
 currentQuizQuestions=[item];
 currentQuestion=0;
 currentSubtopicKey=mistake.topicKey||'overview';
 returnFocus=document.activeElement;
 $('lessonModal').hidden=false;
 document.body.classList.add('modal-open');
 $('lessonTitle').textContent='Retry: '+lesson.title;
 $('modalSubjectIcon').textContent=subjectIcon(lesson.subject);
 $('modalMeta').textContent='MY MISTAKES · '+String(item.difficulty||'practice').toUpperCase();
 showQuiz();
 $('closeLesson').focus();
}
function markPracticedTopic(lessonId,topicKey='overview'){
 normaliseStudyDay();
 const key=topicStatKey(lessonId,topicKey);
 if(!studyData.daily.practicedTopics.includes(key))studyData.daily.practicedTopics.push(key);
}
function touchStudyLesson(lessonId,subtopicKey=''){
 if(!lessonId)return;
 studyData.lastLessonId=lessonId;
 if(subtopicKey)studyData.lastSubtopicKey=subtopicKey;
 const stat=lessonStudyStat(lessonId);
 stat.lastStudied=new Date().toISOString();
 if(subtopicKey){
  const topic=topicStudyStat(lessonId,subtopicKey);
  topic.lastStudied=stat.lastStudied;
 }
 saveStudyData();
}
function recordQuizChoice(lessonId,isCorrect,topicKey='overview',confidence='normal'){
 if(!lessonId)return;
 const now=new Date().toISOString();
 const lessonStat=lessonStudyStat(lessonId);
 lessonStat.attempts=(lessonStat.attempts||0)+1;
 if(isCorrect)lessonStat.correct=(lessonStat.correct||0)+1;
 else lessonStat.wrong=(lessonStat.wrong||0)+1;
 lessonStat.lastStudied=now;
 studyData.lastLessonId=lessonId;
 if(topicKey&&topicKey!=='overview')studyData.lastSubtopicKey=topicKey;

 const topicStat=topicStudyStat(lessonId,topicKey||'overview');
 const priorAttempt=topicStat.lastAttemptAt?new Date(topicStat.lastAttemptAt).getTime():0;
 const revision=priorAttempt>0&&(Date.now()-priorAttempt)>=18*60*60*1000;
 if(isCorrect)topicStat.quizCorrect=(topicStat.quizCorrect||0)+1;
 else topicStat.quizWrong=(topicStat.quizWrong||0)+1;
 if(revision){
  if(isCorrect)topicStat.revisionCorrect=(topicStat.revisionCorrect||0)+1;
  else topicStat.revisionWrong=(topicStat.revisionWrong||0)+1;
 }
 topicStat.lastAttemptAt=now;
 topicStat.lastStudied=now;
 scheduleRevision(lessonId,topicKey||'overview',isCorrect?'correct':'wrong',confidence);
 markPracticedTopic(lessonId,topicKey||'overview');
 saveStudyData();
}
function recordTopicTestChoice(lessonId,topicKey,isCorrect){
 if(!lessonId)return;
 const key=topicKey||'overview';
 const stat=topicStudyStat(lessonId,key);
 if(isCorrect)stat.testCorrect=(stat.testCorrect||0)+1;
 else stat.testWrong=(stat.testWrong||0)+1;
 stat.lastStudied=new Date().toISOString();
 scheduleRevision(lessonId,key,isCorrect?'correct':'wrong',isCorrect?'confident':'normal');
 markPracticedTopic(lessonId,key);

 const lessonStat=lessonStudyStat(lessonId);
 lessonStat.attempts=(lessonStat.attempts||0)+1;
 if(isCorrect)lessonStat.correct=(lessonStat.correct||0)+1;
 else lessonStat.wrong=(lessonStat.wrong||0)+1;
 lessonStat.lastStudied=stat.lastStudied;
 saveStudyData();
}
function recordLessonComplete(lessonId){
 if(!lessonId)return;
 normaliseStudyDay();
 const stat=lessonStudyStat(lessonId);
 stat.completedAt=new Date().toISOString();
 stat.lastStudied=stat.completedAt;
 studyData.lastLessonId=lessonId;
 if(!studyData.daily.completedLessonIds.includes(lessonId))studyData.daily.completedLessonIds.push(lessonId);
 saveStudyData();
}
function recencyScore(dateValue){
 if(!dateValue)return 0;
 const ageDays=(Date.now()-new Date(dateValue).getTime())/86400000;
 if(ageDays<=2)return 10;
 if(ageDays<=7)return 7;
 if(ageDays<=30)return 3;
 return 0;
}
function topicMastery(lesson,topicKey='overview'){
 if(!lesson)return 0;
 const stat=studyData.topicStats[topicStatKey(lesson.id,topicKey)]||{};
 const quizTotal=(stat.quizCorrect||0)+(stat.quizWrong||0);
 const revisionTotal=(stat.revisionCorrect||0)+(stat.revisionWrong||0);
 const testTotal=(stat.testCorrect||0)+(stat.testWrong||0);
 if(!quizTotal&&!revisionTotal&&!testTotal)return 0;
 const quizAccuracy=quizTotal?(stat.quizCorrect||0)/quizTotal:0;
 const revisionAccuracy=revisionTotal?(stat.revisionCorrect||0)/revisionTotal:0;
 const testAccuracy=testTotal?(stat.testCorrect||0)/testTotal:0;
 const score=Math.round(
  quizAccuracy*45+
  revisionAccuracy*20+
  testAccuracy*25+
  recencyScore(stat.lastStudied)
 );
 return Math.max(0,Math.min(100,score));
}
function topicStatusInfo(score){
 if(score>=80)return {key:'mastered',label:'Mastered',icon:'🟢'};
 if(score>=50)return {key:'learning',label:'Learning',icon:'🟡'};
 return {key:'needs-work',label:'Needs work',icon:'🔴'};
}
function chapterMastery(lesson){
 const topics=chapterTopics(lesson);
 if(!topics.length)return topicMastery(lesson,'overview');
 const values=topics.map(topic=>topicMastery(lesson,topic.key));
 return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0;
}
function lessonMastery(lesson){return chapterMastery(lesson)}
function gradeTopicRows(grade){
 const rows=[];
 LESSONS.filter(l=>l.grade===grade).forEach(lesson=>{
  const topics=chapterTopics(lesson);
  if(topics.length){
   topics.forEach(topic=>rows.push({lesson,topic,mastery:topicMastery(lesson,topic.key)}));
  }else{
   rows.push({lesson,topic:{key:'overview',title:lesson.title},mastery:topicMastery(lesson,'overview')});
  }
 });
 return rows;
}
function gradeMasteryAverage(grade){
 const rows=gradeTopicRows(grade);
 return rows.length?Math.round(rows.reduce((sum,row)=>sum+row.mastery,0)/rows.length):0;
}
function studyGreeting(){
 const hour=new Date().getHours();
 return hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
}
function dashboardTopicName(lesson){
 const topics=chapterTopics(lesson);
 const key=lesson.id===studyData.lastLessonId?studyData.lastSubtopicKey:'';
 const match=topics.find(t=>t.key===key);
 return (match&&match.title)||((topics[0]&&topics[0].title)||lesson.title);
}
function revisionRowsForGrade(grade){
 const rows=gradeTopicRows(grade);
 LESSONS.filter(l=>l.grade===grade).forEach(lesson=>{
  const overview=studyData.topicStats[topicStatKey(lesson.id,'overview')];
  if(overview&&(overview.nextReviewAt||overview.lastStudied)){
   rows.push({lesson,topic:{key:'overview',title:lesson.title},mastery:topicMastery(lesson,'overview')});
  }
 });
 const seen=new Set();
 return rows.filter(row=>{
  const key=topicStatKey(row.lesson.id,row.topic.key);
  if(seen.has(key))return false;
  seen.add(key);
  return true;
 });
}
function revisionCandidates(grade){
 return revisionRowsForGrade(grade).filter(row=>{
  const stat=studyData.topicStats[topicStatKey(row.lesson.id,row.topic.key)];
  return revisionDue(stat);
 }).sort((a,b)=>{
  const sa=studyData.topicStats[topicStatKey(a.lesson.id,a.topic.key)]||{};
  const sb=studyData.topicStats[topicStatKey(b.lesson.id,b.topic.key)]||{};
  return new Date(sa.nextReviewAt||0)-new Date(sb.nextReviewAt||0)||a.mastery-b.mastery;
 });
}

function dashboardAccount(){
 try{
  const session=JSON.parse(localStorage.getItem('Threelittlewonders-local-session-v1')||'null');
  const accounts=JSON.parse(localStorage.getItem('Threelittlewonders-local-accounts-v1')||'{}');
  if(!session||!session.email)return null;
  return accounts[String(session.email).toLowerCase()]||null;
 }catch{return null}
}
function renderDashboardTopicRows(host,rows,emptyText){
 if(!host)return;
 if(!rows.length){
  host.innerHTML='<p class="dashboard-empty">'+safe(emptyText)+'</p>';
  return;
 }
 host.innerHTML=rows.map(row=>{
  const status=topicStatusInfo(row.mastery);
  return '<button type="button" class="dashboard-topic-row" data-dashboard-lesson="'+safe(row.lesson.id)+'" data-dashboard-topic="'+safe(row.topic.key)+'">'+
   '<span><strong>'+safe(row.topic.title)+'</strong><small>'+safe(row.lesson.subject)+' · '+safe(row.lesson.title)+'</small></span>'+
   '<b class="mastery-mini mastery-'+status.key+'">'+status.icon+' '+row.mastery+'%</b>'+
  '</button>';
 }).join('');
}
function renderRevisionPlan(grade){
 const host=$('dashboardRevisionPlan');
 if(!host)return;
 const rows=revisionRowsForGrade(grade).filter(row=>{
  const stat=studyData.topicStats[topicStatKey(row.lesson.id,row.topic.key)];
  return stat&&stat.nextReviewAt;
 }).sort((a,b)=>{
  const sa=studyData.topicStats[topicStatKey(a.lesson.id,a.topic.key)]||{};
  const sb=studyData.topicStats[topicStatKey(b.lesson.id,b.topic.key)]||{};
  return new Date(sa.nextReviewAt)-new Date(sb.nextReviewAt);
 }).slice(0,5);
 if(!rows.length){
  host.innerHTML='<p class="dashboard-empty">Complete a quiz to start your smart revision schedule.</p>';
  return;
 }
 host.innerHTML=rows.map(row=>{
  const stat=studyData.topicStats[topicStatKey(row.lesson.id,row.topic.key)]||{};
  const due=revisionDue(stat);
  return '<button type="button" class="revision-plan-row '+(due?'due':'')+'" data-dashboard-lesson="'+safe(row.lesson.id)+'" data-dashboard-topic="'+safe(row.topic.key)+'">'+
   '<span><strong>'+safe(row.topic.title)+'</strong><small>'+safe(row.lesson.subject)+' · '+safe(row.lesson.title)+'</small></span>'+
   '<b>'+safe(nextRevisionLabel(stat))+'</b>'+
  '</button>';
 }).join('');
}
function renderMistakeNotebook(grade){
 const host=$('dashboardMistakes');
 const count=$('dashboardMistakeCount');
 if(!host)return;
 const mistakes=activeMistakesForGrade(grade);
 if(count)count.textContent=mistakes.length;
 if(!mistakes.length){
  host.innerHTML='<p class="dashboard-empty">No unresolved mistakes yet. Incorrect MCQs will automatically appear here for revision.</p>';
  return;
 }
 host.innerHTML=mistakes.slice(0,6).map(m=>{
  const lesson=LESSONS.find(l=>l.id===m.lessonId);
  const topic=lesson?chapterTopics(lesson).find(t=>t.key===m.topicKey):null;
  return '<article class="mistake-card">'+
   '<div class="mistake-card-head"><span>'+safe(m.subject)+'</span><small>'+safe(m.chapter)+(topic?' · '+safe(topic.title):'')+'</small></div>'+
   '<h4>'+safe(m.question)+'</h4>'+
   '<p class="mistake-wrong">❌ <b>Your answer:</b> '+safe(m.selectedAnswer||'Not answered')+'</p>'+
   '<p class="mistake-correct">✅ <b>Correct answer:</b> '+safe(m.correctAnswer)+'</p>'+
   '<div class="mistake-explanation"><b>💡 Explanation</b><p>'+safe(m.explanation)+'</p></div>'+
   '<div class="mistake-actions">'+
    '<button type="button" data-mistake-review="'+safe(m.id)+'">📖 Review topic</button>'+
    '<button type="button" data-mistake-video="'+safe(m.id)+'">▶ Watch explanation</button>'+
    '<button type="button" data-mistake-retry="'+safe(m.id)+'">🔁 Try again</button>'+
   '</div>'+
  '</article>';
 }).join('');
}
function weekStartDate(date=new Date()){
 const d=new Date(date);
 d.setHours(0,0,0,0);
 const day=(d.getDay()+6)%7;
 d.setDate(d.getDate()-day);
 return d;
}
function isoDayLocal(date){
 const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
 return y+'-'+m+'-'+d;
}
function isThisWeek(dateValue){
 if(!dateValue)return false;
 const time=new Date(dateValue).getTime();
 const start=weekStartDate().getTime();
 const end=start+7*86400000;
 return time>=start&&time<end;
}
function weeklyStudySeconds(){
 const start=weekStartDate();
 let total=0;
 for(let i=0;i<7;i++){
  const d=new Date(start);d.setDate(start.getDate()+i);
  total+=Number(studyData.timeByDate?.[isoDayLocal(d)]||0);
 }
 return total;
}
function formatStudyDuration(seconds){
 const mins=Math.floor(Math.max(0,seconds)/60);
 const h=Math.floor(mins/60),m=mins%60;
 if(h&&m)return h+'h '+m+'m';
 if(h)return h+'h';
 return mins+'m';
}
function shouldTrackStudyTime(){
 if(document.hidden||!dashboardAccount())return false;
 const hash=window.location.hash||'#home';
 return ['#explore','#test-series','#my-learning'].includes(hash);
}
function trackStudyTimeTick(){
 if(!shouldTrackStudyTime())return;
 const key=isoDayLocal(new Date());
 studyData.timeByDate[key]=Number(studyData.timeByDate[key]||0)+30;
 saveStudyData();
}
function startStudyTimeTracking(){
 setInterval(trackStudyTimeTick,30000);
}
function subjectMasteryRows(grade){
 const map=new Map();
 gradeTopicRows(grade).forEach(row=>{
  if(!map.has(row.lesson.subject))map.set(row.lesson.subject,[]);
  map.get(row.lesson.subject).push(row.mastery);
 });
 return [...map.entries()].map(([subject,values])=>({
  subject,
  mastery:values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):0
 })).sort((a,b)=>b.mastery-a.mastery||a.subject.localeCompare(b.subject));
}
function weeklyTopicsStudied(grade){
 const seen=new Set();
 Object.entries(studyData.topicStats||{}).forEach(([key,stat])=>{
  if(!stat?.lastStudied||!isThisWeek(stat.lastStudied))return;
  const lessonId=key.split('::')[0];
  const lesson=LESSONS.find(l=>l.id===lessonId);
  if(lesson&&lesson.grade===grade)seen.add(key);
 });
 return seen.size;
}
function weeklyTestsCompleted(grade){
 return studyData.testAttempts.filter(test=>Number(test.grade)===grade&&isThisWeek(test.date)).length;
}
function recentTestForGrade(grade){
 return [...studyData.testAttempts].reverse().find(test=>Number(test.grade)===grade)||null;
}
function renderParentDashboard(account,rows,revise){
 if(!account)return;
 const grade=Number(account.grade);
 const started=rows.filter(row=>row.mastery>0);
 const strongest=[...started].sort((a,b)=>b.mastery-a.mastery)[0]||null;
 const needsHelp=[...started].sort((a,b)=>a.mastery-b.mastery)[0]||null;
 const subjects=subjectMasteryRows(grade);
 const first=String(account.displayName||'Student').trim()||'Student';
 const title=$('parentStudentTitle');if(title)title.textContent=first+' · '+gradeName(grade);
 const study=$('parentStudyTime');if(study)study.textContent=formatStudyDuration(weeklyStudySeconds());
 const topics=$('parentTopicsStudied');if(topics)topics.textContent=weeklyTopicsStudied(grade);
 const mastered=$('parentMastered');if(mastered)mastered.textContent=rows.filter(row=>row.mastery>=80).length;
 const revision=$('parentNeedsRevision');if(revision)revision.textContent=revise.length;
 const subjectHost=$('parentSubjectMastery');
 if(subjectHost){
  subjectHost.innerHTML=subjects.length?subjects.map(row=>
   '<div class="parent-subject-row"><span>'+safe(row.subject)+'</span><div><i style="width:'+row.mastery+'%"></i></div><strong>'+row.mastery+'%</strong></div>'
  ).join(''):'<p class="dashboard-empty">Subject mastery will appear after practice begins.</p>';
 }
 const strong=$('parentStrongest');if(strong)strong.textContent=strongest?strongest.topic.title+' · '+strongest.mastery+'%':'Not enough data yet';
 const help=$('parentNeedsHelp');if(help)help.textContent=needsHelp?needsHelp.topic.title+' · '+needsHelp.mastery+'%':'Not enough data yet';
 const tests=$('parentTestsCompleted');if(tests)tests.textContent=weeklyTestsCompleted(grade);
}
function renderHomeLearningDashboard(){
 const account=dashboardAccount();
 const host=$('homeLearningDashboard');
 if(!host)return;
 if(!account){host.hidden=true;return;}
 host.hidden=false;
 const grade=Number(account.grade);
 const rows=gradeTopicRows(grade);
 const started=rows.filter(row=>row.mastery>0);
 const weak=[...started].sort((a,b)=>a.mastery-b.mastery)[0]||null;
 const revise=revisionCandidates(grade);
 const gradeLessons=LESSONS.filter(l=>l.grade===grade);
 const last=gradeLessons.find(l=>l.id===studyData.lastLessonId);
 const next=last||gradeLessons[0]||null;
 const first=String(account.displayName||'Student').trim().split(/\s+/)[0]||'Student';
 const name=$('homeStudentName');if(name)name.textContent=first;
 const cls=$('homeStudentClass');if(cls)cls.textContent=gradeName(grade);
 const rev=$('homeReviseCount');if(rev)rev.textContent=revise.length+' topic'+(revise.length===1?'':'s')+' due';
 const goal=$('homeGoalText');if(goal){
  normaliseStudyDay();
  const today=studyData.daily.practicedTopics.filter(key=>rows.some(row=>topicStatKey(row.lesson.id,row.topic.key)===key)).length;
  goal.textContent=Math.min(today,3)+' of 3 topics';
 }
 if(next){
  const topics=chapterTopics(next);
  const selected=topics.find(t=>t.key===studyData.lastSubtopicKey)||topics[0]||{key:'overview',title:next.title};
  const title=$('homeContinueTitle');if(title)title.textContent=next.subject+' → '+next.title;
  const meta=$('homeContinueMeta');if(meta)meta.textContent=selected.title+' · '+topicMastery(next,selected.key)+'% mastered';
  const button=$('homeContinueBtn');if(button){button.dataset.dashboardLesson=next.id;button.dataset.dashboardTopic=selected.key;}
 }
 const weakTitle=$('homeWeakTopic');if(weakTitle)weakTitle.textContent=weak?weak.topic.title:'Keep practising';
 const weakMeta=$('homeWeakMeta');if(weakMeta)weakMeta.textContent=weak?weak.lesson.subject+' · '+weak.mastery+'% mastery':'Your weak topics will appear here';
 const recent=recentTestForGrade(grade);
 const score=$('homeRecentScore');
 const meta=$('homeRecentMeta');
 if(recent){
  const accuracy=Number.isFinite(Number(recent.accuracy))?Number(recent.accuracy):Math.round((Number(recent.score)||0)/Math.max(1,Number(recent.total)||1)*100);
  if(score)score.textContent=accuracy+'%';
  if(meta)meta.textContent=(recent.subject||'Test')+' · '+(recent.preset==='mcq'?'MCQ Exam':'Recent test');
 }else{
  if(score)score.textContent='No test yet';
  if(meta)meta.textContent='Take your first test';
 }
}
function activeStudyDay(dayKey){
 const tracked=Number(studyData.timeByDate?.[dayKey]||0)>=300;
 const todayActive=dayKey===todayKey()&&Array.isArray(studyData.daily?.practicedTopics)&&studyData.daily.practicedTopics.length>0;
 return tracked||todayActive;
}
function learningStreakDays(){
 let cursor=new Date();
 const today=isoDayLocal(cursor);
 if(!activeStudyDay(today))cursor.setDate(cursor.getDate()-1);
 let streak=0;
 for(let i=0;i<365;i++){
  const key=isoDayLocal(cursor);
  if(!activeStudyDay(key))break;
  streak++;
  cursor.setDate(cursor.getDate()-1);
 }
 return streak;
}
function weeklyGoalMinutes(){return 100}
function deterministicIndex(seed,length){
 if(!length)return -1;
 let hash=2166136261;
 const value=String(seed||'');
 for(let i=0;i<value.length;i++){
  hash^=value.charCodeAt(i);
  hash=Math.imul(hash,16777619);
 }
 return Math.abs(hash>>>0)%length;
}
function challengePoolForGrade(grade,challengeOnly=false){
 const pool=[];
 LESSONS.filter(l=>l.grade===grade).forEach(lesson=>{
  validQuestionsWithMeta(lesson).forEach(item=>{
   if(challengeOnly&&item.difficulty!=='challenge')return;
   pool.push({...item,lesson});
  });
 });
 return pool;
}
function challengeItemForToday(grade,type='daily'){
 let pool=challengePoolForGrade(grade,type==='mystery');
 if(!pool.length&&type==='mystery')pool=challengePoolForGrade(grade,false);
 if(!pool.length)return null;
 const index=deterministicIndex(todayKey()+'|'+grade+'|'+type,pool.length);
 return pool[index]||null;
}
function challengeTopicKey(item){
 const explicit=String(item?.question?.topicKey||'');
 if(explicit&&chapterTopics(item.lesson).some(t=>t.key===explicit))return explicit;
 return 'overview';
}
function openChallengeItem(item,source){
 if(!item?.lesson)return;
 currentPracticeSource=source;
 currentMistakeId='';
 currentLesson=item.lesson;
 currentQuizDifficulty=item.difficulty||'all';
 currentQuizQuestions=[item];
 currentQuestion=0;
 currentSubtopicKey=challengeTopicKey(item);
 returnFocus=document.activeElement;
 $('lessonModal').hidden=false;
 document.body.classList.add('modal-open');
 $('lessonTitle').textContent=source==='mystery-challenge'?'Mystery Challenge':'Daily Challenge';
 $('modalSubjectIcon').textContent=subjectIcon(item.lesson.subject);
 $('modalMeta').textContent=(source==='mystery-challenge'?'MYSTERY CHALLENGE':'DAILY CHALLENGE')+' · '+String(item.difficulty||'practice').toUpperCase();
 showQuiz();
 $('closeLesson').focus();
}
function badgeId(type,lessonId,topicKey=''){return type+':'+lessonId+':'+topicKey}
function syncAchievementBadges(grade){
 const existing=new Map((studyData.badges||[]).map(b=>[b.id,b]));
 const earned=[];
 LESSONS.filter(l=>l.grade===grade).forEach(lesson=>{
  const topics=chapterTopics(lesson);
  if(topics.length){
   topics.forEach(topic=>{
    const mastery=topicMastery(lesson,topic.key);
    if(mastery>=80){
     const id=badgeId('topic',lesson.id,topic.key);
     earned.push(existing.get(id)||{id,type:'topic',title:topic.title,chapter:lesson.title,subject:lesson.subject,earnedAt:new Date().toISOString()});
    }
   });
   if(topics.every(topic=>topicMastery(lesson,topic.key)>=80)){
    const id=badgeId('chapter',lesson.id);
    earned.push(existing.get(id)||{id,type:'chapter',title:lesson.title,chapter:lesson.title,subject:lesson.subject,earnedAt:new Date().toISOString()});
   }
  }else if(topicMastery(lesson,'overview')>=80){
   const tid=badgeId('topic',lesson.id,'overview');
   earned.push(existing.get(tid)||{id:tid,type:'topic',title:lesson.title,chapter:lesson.title,subject:lesson.subject,earnedAt:new Date().toISOString()});
   const cid=badgeId('chapter',lesson.id);
   earned.push(existing.get(cid)||{id:cid,type:'chapter',title:lesson.title,chapter:lesson.title,subject:lesson.subject,earnedAt:new Date().toISOString()});
  }
 });
 const before=JSON.stringify((studyData.badges||[]).map(b=>b.id).sort());
 const after=JSON.stringify(earned.map(b=>b.id).sort());
 studyData.badges=earned.sort((a,b)=>new Date(b.earnedAt)-new Date(a.earnedAt));
 if(before!==after)saveStudyData();
 return studyData.badges;
}
function renderLearningMomentum(grade){
 normaliseStudyDay();
 const streak=learningStreakDays();
 const streakEl=$('learningStreakCount');
 if(streakEl)streakEl.textContent=streak+' day'+(streak===1?'':'s');
 const streakMessage=$('learningStreakMessage');
 if(streakMessage){
  if(streak>=7)streakMessage.textContent='7-day learning habit reached. Keep it steady.';
  else if(activeStudyDay(todayKey()))streakMessage.textContent='Today counts. '+Math.max(0,7-streak)+' more day'+(7-streak===1?'':'s')+' to reach 7.';
  else streakMessage.textContent='Complete one 5-minute study session today to keep building your streak.';
 }

 const weeklyMinutes=Math.floor(weeklyStudySeconds()/60);
 const weeklyTarget=weeklyGoalMinutes();
 const weeklyText=$('weeklyGoalText');if(weeklyText)weeklyText.textContent=Math.min(weeklyMinutes,weeklyTarget)+' / '+weeklyTarget+' min';
 const weeklyFill=$('weeklyGoalFill');if(weeklyFill)weeklyFill.style.width=Math.min(100,Math.round(weeklyMinutes/weeklyTarget*100))+'%';

 const daily=challengeItemForToday(grade,'daily');
 const dailyBtn=$('dailyChallengeBtn');
 const dailyTitle=$('dailyChallengeTitle');
 const dailyMeta=$('dailyChallengeMeta');
 if(daily){
  if(dailyTitle)dailyTitle.textContent=studyData.daily.dailyChallengeDone?'Daily challenge completed ✓':daily.lesson.subject+' · '+daily.lesson.title;
  if(dailyMeta)dailyMeta.textContent=studyData.daily.dailyChallengeDone?'Come back tomorrow for a new question.':'One focused question from today’s learning bank.';
  if(dailyBtn){
   dailyBtn.disabled=!!studyData.daily.dailyChallengeDone;
   dailyBtn.textContent=studyData.daily.dailyChallengeDone?'Completed ✓':'Start challenge →';
  }
 }else{
  if(dailyTitle)dailyTitle.textContent='No challenge available yet';
  if(dailyMeta)dailyMeta.textContent='Add verified MCQs to unlock Daily Challenge.';
  if(dailyBtn)dailyBtn.disabled=true;
 }

 const mystery=challengeItemForToday(grade,'mystery');
 const mysteryBtn=$('mysteryChallengeBtn');
 const mysteryTitle=$('mysteryChallengeTitle');
 const mysteryMeta=$('mysteryChallengeMeta');
 if(mystery){
  if(mysteryTitle)mysteryTitle.textContent=studyData.daily.mysteryChallengeDone?'Mystery challenge completed ✓':'One challenge question is waiting';
  if(mysteryMeta)mysteryMeta.textContent=studyData.daily.mysteryChallengeDone?mystery.lesson.subject+' · '+mystery.lesson.title:'Topic stays hidden until you open it.';
  if(mysteryBtn){
   mysteryBtn.disabled=!!studyData.daily.mysteryChallengeDone;
   mysteryBtn.textContent=studyData.daily.mysteryChallengeDone?'Completed ✓':'Reveal & try →';
  }
 }else{
  if(mysteryTitle)mysteryTitle.textContent='Mystery challenge unavailable';
  if(mysteryMeta)mysteryMeta.textContent='Challenge-level MCQs will unlock it.';
  if(mysteryBtn)mysteryBtn.disabled=true;
 }

 const badges=syncAchievementBadges(grade);
 const count=$('badgeCount');if(count)count.textContent=badges.length;
 const host=$('dashboardBadges');
 if(host){
  host.innerHTML=badges.length?badges.slice(0,10).map(b=>
   '<span class="mastery-badge '+(b.type==='chapter'?'chapter-badge':'topic-badge')+'" title="'+safe(b.subject+' · '+b.chapter)+'">'+
    '<i aria-hidden="true">'+(b.type==='chapter'?'🏆':'🎓')+'</i><span><strong>'+safe(b.title)+'</strong><small>'+(b.type==='chapter'?'Chapter mastered':'Topic mastered')+'</small></span>'+
   '</span>'
  ).join(''):'<p class="dashboard-empty">Master topics to earn calm, progress-based badges.</p>';
 }
}
function scienceConceptMapGroups(lesson){
 const topics=chapterTopics(lesson);
 if(!topics.length)return [];
 if(/chemical reactions/i.test(lesson.title)){
  const types=topics.filter(t=>/(combination|decomposition|double displacement|displacement|redox)/i.test(t.title));
  const effects=topics.filter(t=>/(oxidation|corrosion|rancidity)/i.test(t.title));
  const used=new Set([...types,...effects].map(t=>t.key));
  const core=topics.filter(t=>!used.has(t.key)&&!/checkpoint/i.test(t.title));
  return [
   {label:'Core Ideas',topics:core},
   {label:'Reaction Types',topics:types},
   {label:'Oxidation & Everyday Effects',topics:effects}
  ].filter(group=>group.topics.length);
 }
 return [{label:'Key Concepts',topics:topics.filter(t=>!/checkpoint/i.test(t.title))}];
}
function renderScienceConceptMap(lesson){
 if(!lesson||lesson.subject!=='Science')return '';
 const groups=scienceConceptMapGroups(lesson);
 if(!groups.length)return '';
 const root=/chemical reactions/i.test(lesson.title)?'Chemical Reactions':lesson.title;
 return '<section class="concept-map-block">'+
  '<div class="concept-map-heading"><div><span>CONCEPT MAP</span><strong>Quick revision view</strong></div><small>Click any concept to open that topic</small></div>'+
  '<div class="concept-map-root">'+safe(root)+'</div>'+
  '<div class="concept-map-branches">'+groups.map(group=>
   '<section class="concept-map-group"><h4>'+safe(group.label)+'</h4><div class="concept-map-nodes">'+group.topics.map(topic=>{
    const mastery=topicMastery(lesson,topic.key);
    const status=topicStatusInfo(mastery);
    return '<button type="button" class="concept-map-node mastery-'+status.key+'" data-concept-topic="'+safe(topic.key)+'"><span>'+safe(topic.title.replace(/^\d+\.\s*/,''))+'</span><small>'+status.icon+' '+mastery+'%</small></button>';
   }).join('')+'</div></section>'
  ).join('')+'</div>'+
 '</section>';
}
function chapterIsMastered(lesson){
 const topics=chapterTopics(lesson);
 if(!topics.length)return topicMastery(lesson,'overview')>=80;
 return topics.every(topic=>topicMastery(lesson,topic.key)>=80);
}
function chapterStepStatus(lesson){
 const mastery=chapterMastery(lesson);
 const mastered=chapterIsMastered(lesson);
 const hasPdf=!!sourcePdfUrl(lesson);
 const hasQuestions=validLessonQuestions(lesson).length>0;
 const mistakes=activeMistakesForGrade(lesson.grade).filter(m=>m.lessonId===lesson.id).length;
 return {
  learn:hasPdf?'ready':'available',
  understand:'ready',
  practice:hasQuestions?'ready':'pending',
  test:hasQuestions?'ready':'pending',
  revise:(mistakes||mastery>0)?'ready':'available',
  mastered:mastered?'done':'progress'
 };
}
function renderChapterJourney(lesson){
 const status=chapterStepStatus(lesson);
 const mastery=chapterMastery(lesson);
 const steps=[
  {n:1,key:'learn',icon:'📖',title:'Learn',sub:'Original NCERT PDF'},
  {n:2,key:'understand',icon:'▶',title:'Understand',sub:'Video · Read Aloud · illustrations'},
  {n:3,key:'practice',icon:'🧩',title:'Quick Practice',sub:'Up to 5 verified questions'},
  {n:4,key:'test',icon:'📝',title:'Chapter Test',sub:'MCQ / Descriptive'},
  {n:5,key:'revise',icon:'🔁',title:'Revise',sub:'Flashcards · mistakes · weak topics'},
  {n:6,key:'mastered',icon:'🏆',title:'Mastered',sub:mastery+'% chapter mastery'}
 ];
 return '<nav class="chapter-learning-path" aria-label="Chapter learning path">'+
  '<div class="chapter-learning-path-head"><span>LEARN → PRACTICE → TEST → REVISE</span><strong>Your chapter path</strong></div>'+
  '<div class="chapter-learning-steps">'+steps.map(step=>
   '<button type="button" class="chapter-learning-step step-'+safe(status[step.key])+'" data-chapter-step="'+step.key+'">'+
    '<b>'+step.n+'</b><i aria-hidden="true">'+step.icon+'</i><span><strong>'+safe(step.title)+'</strong><small>'+safe(step.sub)+'</small></span>'+
   '</button>'
  ).join('')+'</div>'+
 '</nav>';
}
function journeySectionHead(number,icon,title,subtitle){
 return '<div class="journey-section-head"><span>'+number+'</span><i aria-hidden="true">'+icon+'</i><div><strong>'+safe(title)+'</strong><small>'+safe(subtitle)+'</small></div></div>';
}
function renderUnderstandSection(lesson){
 const topics=chapterTopics(lesson);
 const active=topics.find(t=>t.key===currentSubtopicKey)||topics[0]||null;
 return '<section class="chapter-journey-section" id="chapter-step-understand" data-journey-section="understand">'+
  journeySectionHead(2,'▶','Understand','Video, Read Aloud and visual revision')+
  renderScienceConceptMap(lesson)+
  '<div class="understand-actions">'+
   '<button type="button" class="btn btn-secondary" data-understand-video '+(!active?'disabled':'')+'>▶ Watch topic video</button>'+
   '<button type="button" class="btn btn-secondary read-aloud-btn" data-read-aloud="'+safe(lesson.id)+'">🔊 Read Aloud</button>'+
  '</div>'+
 '</section>';
}
function openQuickPractice(lesson){
 if(!lesson)return;
 const questions=shuffledTestItems(quizQuestionsForLesson(lesson,'all')).slice(0,5);
 if(!questions.length){showToast('No verified quick-practice questions are available for this chapter yet.');return;}
 touchStudyLesson(lesson.id,currentSubtopicKey);
 stopReadAloud();
 currentLesson=lesson;
 currentMistakeId='';
 currentPracticeSource='quick-practice';
 currentQuizDifficulty='all';
 currentQuizQuestions=questions;
 currentQuestion=0;
 questionAnswered=false;
 returnFocus=document.activeElement;
 $('lessonModal').hidden=false;
 document.body.classList.add('modal-open');
 $('lessonTitle').textContent='Quick Practice · '+lesson.title;
 $('modalSubjectIcon').textContent=subjectIcon(lesson.subject);
 $('modalMeta').textContent=gradeName(lesson.grade).toUpperCase()+' · QUICK PRACTICE · '+questions.length+' QUESTIONS';
 showQuiz();
 $('closeLesson').focus();
}
function renderQuickPracticeSection(lesson){
 const count=Math.min(5,validLessonQuestions(lesson).length);
 return '<section class="chapter-journey-section" id="chapter-step-practice" data-journey-section="practice">'+
  journeySectionHead(3,'🧩','Quick Practice','Short retrieval practice before the chapter test')+
  '<div class="quick-practice-card"><div><strong>'+(count?count+' question'+(count===1?'':'s'):'No questions yet')+'</strong><p>'+(count?'A focused set from the verified chapter question bank.':'Verified questions must be added before Quick Practice is enabled.')+'</p></div>'+
  '<button type="button" class="btn btn-primary" data-quick-practice="'+safe(lesson.id)+'" '+(count?'':'disabled')+'>Start Quick Practice</button></div>'+
  renderDifficultySelector(lesson)+
 '</section>';
}
function openChapterTestFromLesson(lesson,mode='objective'){
 if(!lesson)return;
 window.location.hash='#test-series';
 openTestBuilder(lesson.grade);
 chooseTestMode(mode);
 const subjectSelect=$('testSubjectSelect');
 if(subjectSelect){
  subjectSelect.value=lesson.subject;
  populateTestChapters();
 }
 const chapterSelect=$('testChapterSelect');
 if(chapterSelect){
  chapterSelect.value=lesson.id;
  populateTestTopics();
 }
 if(mode==='descriptive')selectExamPreset('chapter');
 updateTestScopeNote();
 requestAnimationFrame(()=>$('testBuilder')?.scrollIntoView({behavior:'smooth',block:'start'}));
}
function renderChapterTestSection(lesson){
 const count=validLessonQuestions(lesson).length;
 return '<section class="chapter-journey-section" id="chapter-step-test" data-journey-section="test">'+
  journeySectionHead(4,'📝','Chapter Test','Check what you can retrieve and apply')+
  '<div class="chapter-test-actions">'+
   '<button type="button" class="btn btn-primary" data-chapter-test="objective" '+(count?'':'disabled')+'>MCQ Chapter Test</button>'+
   '<button type="button" class="btn btn-secondary" data-chapter-test="descriptive">Descriptive Chapter Test</button>'+
  '</div>'+
 '</section>';
}
function flashcardHash(value){
 let hash=0;
 const text=String(value||'');
 for(let i=0;i<text.length;i++)hash=((hash<<5)-hash+text.charCodeAt(i))|0;
 return Math.abs(hash);
}
function flashcardsForLesson(lesson){
 if(Array.isArray(lesson?.flashcards)&&lesson.flashcards.length){
  return lesson.flashcards.filter(card=>card&&card.front&&card.back).map((card,index)=>({
   id:'flash:'+lesson.id+':custom:'+index,
   lessonId:lesson.id,
   topicKey:card.topicKey||'overview',
   front:String(card.front),
   back:String(card.back)
  }));
 }
 return validLessonQuestions(lesson).slice(0,20).map((question,index)=>{
  const correct=String(question.options[question.answer]||'');
  const explanation=questionExplanation(lesson,question);
  const back=explanation&&explanation!==correct?correct+' — '+explanation:correct;
  return {
   id:'flash:'+lesson.id+':'+flashcardHash(question.text+'|'+index),
   lessonId:lesson.id,
   topicKey:String(question.topicKey||'overview'),
   front:String(question.text),
   back
  };
 });
}
function flashcardStat(card){
 if(!studyData.flashcardStats[card.id]){
  studyData.flashcardStats[card.id]={step:0,nextReviewAt:'',lastRating:'',lastReviewedAt:'',reviews:0};
 }
 return studyData.flashcardStats[card.id];
}
function flashcardDue(card){
 const stat=studyData.flashcardStats[card.id];
 return !stat?.nextReviewAt||new Date(stat.nextReviewAt).getTime()<=Date.now();
}
function flashcardReviewLabel(card){
 const stat=studyData.flashcardStats[card.id];
 if(!stat?.nextReviewAt)return 'New card';
 const target=new Date(stat.nextReviewAt);
 const today=new Date();today.setHours(0,0,0,0);
 const day=new Date(target);day.setHours(0,0,0,0);
 const diff=Math.round((day-today)/86400000);
 if(diff<=0)return 'Due today';
 if(diff===1)return 'Due tomorrow';
 return 'Due in '+diff+' days';
}
function selectedFlashcard(lesson){
 const cards=flashcardsForLesson(lesson);
 if(!cards.length)return null;
 const current=cards.find(card=>card.id===currentFlashcardId);
 if(current)return current;
 const due=cards.find(flashcardDue);
 if(due)return due;
 return [...cards].sort((a,b)=>{
  const sa=studyData.flashcardStats[a.id]?.nextReviewAt||'9999-12-31';
  const sb=studyData.flashcardStats[b.id]?.nextReviewAt||'9999-12-31';
  return new Date(sa)-new Date(sb);
 })[0];
}
function flashcardTopicKey(lesson,card){
 if(card.topicKey&&chapterTopics(lesson).some(t=>t.key===card.topicKey))return card.topicKey;
 if(currentSubtopicKey&&chapterTopics(lesson).some(t=>t.key===currentSubtopicKey))return currentSubtopicKey;
 return 'overview';
}
function rateFlashcard(lesson,card,rating){
 if(!lesson||!card)return;
 const stat=flashcardStat(card);
 let step=Number(stat.step)||0;
 if(rating==='again')step=1;
 else if(rating==='good')step=Math.max(2,Math.min(REVISION_INTERVALS.length-1,step+1));
 else step=Math.max(3,Math.min(REVISION_INTERVALS.length-1,step+2));
 stat.step=step;
 stat.nextReviewAt=dateAfterDays(REVISION_INTERVALS[step]);
 stat.lastRating=rating;
 stat.lastReviewedAt=new Date().toISOString();
 stat.reviews=(Number(stat.reviews)||0)+1;
 const topicKey=flashcardTopicKey(lesson,card);
 const topicStat=topicStudyStat(lesson.id,topicKey);
 topicStat.lastStudied=stat.lastReviewedAt;
 topicStat.revisionStep=step;
 topicStat.nextReviewAt=stat.nextReviewAt;
 topicStat.lastReviewAt=stat.lastReviewedAt;
 topicStat.lastOutcome=rating==='again'?'needs-review':'flashcard';
 markPracticedTopic(lesson.id,topicKey);
 currentFlashcardId='';
 saveStudyData();
 renderCourses();
 renderStudyDashboard();
}
function renderFlashcardSection(lesson){
 const cards=flashcardsForLesson(lesson);
 if(!cards.length){
  return '<div class="flashcard-empty"><strong>Flashcards are not available yet.</strong><p>They will appear when verified chapter questions or curated flashcards are added.</p></div>';
 }
 const card=selectedFlashcard(lesson);
 const dueCount=cards.filter(flashcardDue).length;
 return '<div class="flashcard-study">'+
  '<div class="flashcard-study-top"><div><span>FLASHCARDS</span><strong>'+cards.length+' cards · '+dueCount+' due now</strong></div><small>'+safe(flashcardReviewLabel(card))+'</small></div>'+
  '<button type="button" class="study-flashcard" data-flashcard-reveal="'+safe(card.id)+'" aria-expanded="false">'+
   '<span class="flashcard-side flashcard-front"><small>FRONT</small><strong>'+safe(card.front)+'</strong><em>Tap to reveal</em></span>'+
   '<span class="flashcard-side flashcard-back" hidden><small>BACK</small><strong>'+safe(card.back)+'</strong></span>'+
  '</button>'+
  '<div class="flashcard-ratings" data-flashcard-ratings hidden>'+
   '<button type="button" data-flashcard-rate="again" data-flashcard-id="'+safe(card.id)+'">😕 Again<small>Tomorrow</small></button>'+
   '<button type="button" data-flashcard-rate="good" data-flashcard-id="'+safe(card.id)+'">🙂 Good<small>3+ days</small></button>'+
   '<button type="button" data-flashcard-rate="easy" data-flashcard-id="'+safe(card.id)+'">😎 Easy<small>7+ days</small></button>'+
  '</div>'+
 '</div>';
}
function renderReviseSection(lesson){
 const mistakes=activeMistakesForGrade(lesson.grade).filter(m=>m.lessonId===lesson.id);
 const weak=chapterTopics(lesson).map(topic=>({topic,mastery:topicMastery(lesson,topic.key)})).filter(row=>row.mastery>0&&row.mastery<80).sort((a,b)=>a.mastery-b.mastery);
 return '<section class="chapter-journey-section" id="chapter-step-revise" data-journey-section="revise">'+
  journeySectionHead(5,'🔁','Revise','Flashcards, mistakes and weak topics')+
  renderFlashcardSection(lesson)+
  '<div class="chapter-revision-summary">'+
   '<div><span>Wrong Answer Notebook</span><strong>'+mistakes.length+' unresolved</strong></div>'+
   '<div><span>Weak topics</span><strong>'+weak.length+' need attention</strong></div>'+
   '<button type="button" class="btn btn-secondary" data-open-learning-dashboard>Open My Learning Dashboard</button>'+
  '</div>'+
 '</section>';
}
function renderMasteredSection(lesson){
 const mastery=chapterMastery(lesson);
 const status=topicStatusInfo(mastery);
 const mastered=chapterIsMastered(lesson);
 return '<section class="chapter-journey-section chapter-mastered-section '+(mastered?'is-mastered':'')+'" id="chapter-step-mastered" data-journey-section="mastered">'+
  journeySectionHead(6,'🏆','Mastered',mastered?'Chapter mastery achieved':'Keep retrieving, testing and revising')+
  '<div class="chapter-mastery-summary"><div><span class="topic-mastery-badge mastery-'+status.key+'">'+status.icon+' '+mastery+'% · '+status.label+'</span><p>'+(mastered?'You have reached the mastery threshold for this chapter.':'Reach 80%+ mastery through quizzes, tests and spaced revision.')+'</p></div>'+
  '<div class="dashboard-mastery-track"><div style="width:'+mastery+'%"></div></div></div>'+
 '</section>';
}
function finishPracticeSession(){
 if(!currentLesson)return;
 stage('Complete');
 const source=currentPracticeSource;
 const label=source==='quick-practice'?'Quick Practice':source==='daily-challenge'?'Daily Challenge':source==='mystery-challenge'?'Mystery Challenge':'Practice';
 $('lessonBody').innerHTML='<div class="celebrate practice-finish"><div class="celebrate-emoji" aria-hidden="true">✅</div><h3>'+safe(label)+' complete</h3><p>Your answers have updated mastery and Smart Revision. Keep using retrieval practice to strengthen the topic.</p></div>';
 footer('Practice updates mastery, not chapter completion.','Back to chapter',()=>{closeLesson();renderCourses();});
}
function renderStudyDashboard(){
 const account=dashboardAccount(),guest=$('learningGuestView'),dashboard=$('studyDashboard');
 if(!guest||!dashboard)return;
 if(!account){
  guest.hidden=false;
  dashboard.hidden=true;
  renderHomeLearningDashboard();
  return;
 }
 guest.hidden=true;
 dashboard.hidden=false;
 normaliseStudyDay();

 const grade=Number(account.grade);
 const rows=gradeTopicRows(grade);
 const started=rows.filter(row=>row.mastery>0);
 const weak=[...started].filter(row=>row.mastery<80).sort((a,b)=>a.mastery-b.mastery).slice(0,3);
 const strong=[...started].filter(row=>row.mastery>=50).sort((a,b)=>b.mastery-a.mastery).slice(0,3);
 const revise=revisionCandidates(grade);
 const mastered=rows.filter(row=>row.mastery>=80).length;
 const average=gradeMasteryAverage(grade);
 const gradeLessons=LESSONS.filter(l=>l.grade===grade);
 const last=gradeLessons.find(l=>l.id===studyData.lastLessonId);
 const next=last||gradeLessons[0]||null;
 const first=String(account.displayName||'Student').trim().split(/\s+/)[0]||'Student';

 $('dashboardGreeting').textContent=studyGreeting();
 $('dashboardStudentName').textContent=first;
 $('dashboardClassName').textContent=gradeName(grade);
 const avgEl=$('dashboardAverageMastery');
 if(avgEl)avgEl.textContent=average+'%';
 const masteredEl=$('dashboardMasteredTopics');
 if(masteredEl)masteredEl.textContent=mastered;
 $('dashboardReviseCount').textContent=revise.length;

 const todayDone=studyData.daily.practicedTopics.filter(key=>rows.some(row=>topicStatKey(row.lesson.id,row.topic.key)===key)).length;
 $('dashboardGoalProgress').textContent=Math.min(todayDone,3)+' of 3 topics practised today';
 $('dashboardGoalFill').style.width=Math.min(100,Math.round(todayDone/3*100))+'%';

 if(next){
  const topics=chapterTopics(next);
  const selectedTopic=topics.find(t=>t.key===studyData.lastSubtopicKey)||topics[0]||{key:'overview',title:next.title};
  const mastery=topicMastery(next,selectedTopic.key);
  $('dashboardContinueTitle').textContent=next.subject+' → '+next.title;
  $('dashboardContinuePath').textContent=selectedTopic.title;
  $('dashboardContinueMastery').textContent=mastery+'% mastered';
  $('dashboardContinueFill').style.width=mastery+'%';
  $('dashboardContinueBtn').dataset.dashboardLesson=next.id;
  $('dashboardContinueBtn').dataset.dashboardTopic=selectedTopic.key;
  $('dashboardUpcomingTest').textContent=next.subject+' Chapter Test';
  $('dashboardUpcomingTestMeta').textContent=next.title;
 }else{
  $('dashboardContinueTitle').textContent='Choose a class to begin';
  $('dashboardContinuePath').textContent='Your next lesson will appear here.';
  $('dashboardContinueMastery').textContent='0% mastered';
  $('dashboardContinueFill').style.width='0%';
  delete $('dashboardContinueBtn').dataset.dashboardLesson;
  delete $('dashboardContinueBtn').dataset.dashboardTopic;
  $('dashboardUpcomingTest').textContent='Chapter Test';
  $('dashboardUpcomingTestMeta').textContent='Practise when you are ready.';
 }
 renderDashboardTopicRows($('dashboardWeakTopics'),weak,'Complete quizzes and tests to identify topics that need more practice.');
 renderDashboardTopicRows($('dashboardStrongTopics'),strong,'Your strongest topics will appear as your mastery grows.');
 renderRevisionPlan(grade);
 renderMistakeNotebook(grade);
 renderParentDashboard(account,rows,revise);
 renderLearningMomentum(grade);
 renderHomeLearningDashboard();
}
function openDashboardLesson(id,topicKey=''){
 const lesson=LESSONS.find(l=>l.id===id);
 if(!lesson)return;
 state.grade=lesson.grade;
 persist();
 classChoicesOpen=false;
 subject=lesson.subject;
 currentTopicId=lesson.id;
 currentSubtopicKey=topicKey||'';
 window.location.hash='#explore';
 renderAll();
 requestAnimationFrame(()=>$('lessonResultsSection')?.scrollIntoView({behavior:'smooth',block:'start'}));
}
const CLASS10_MATHS_CHAPTERS=[
 'Real Numbers',
 'Polynomials',
 'Pair of Linear Equations in Two Variables',
 'Quadratic Equations',
 'Arithmetic Progressions',
 'Triangles',
 'Coordinate Geometry',
 'Introduction to Trigonometry',
 'Some Applications of Trigonometry',
 'Circles',
 'Areas Related to Circles',
 'Surface Areas and Volumes',
 'Statistics',
 'Probability'
];
const CLASS10_SCIENCE_CHAPTERS=[
 'Chemical Reactions and Equations',
 'Acids, Bases and Salts',
 'Metals and Non-metals',
 'Carbon and its Compounds',
 'Life Processes',
 'Control and Coordination',
 'How do Organisms Reproduce?',
 'Heredity',
 'Light - Reflection and Refraction',
 'The Human Eye and the Colourful World',
 'Electricity',
 'Magnetic Effects of Electric Current',
 'Our Environment'
];
function isNurseryListeningLesson(lesson){
 return !!lesson&&lesson.grade===-2&&lesson.subject==='English'&&lesson.title==='Listening and Speaking';
}
let nurseryListeningPosterUrl='';
let nurseryListeningPosterPromise=null;
function loadNurseryListeningPoster(){
 if(nurseryListeningPosterUrl)return Promise.resolve(nurseryListeningPosterUrl);
 if(nurseryListeningPosterPromise)return nurseryListeningPosterPromise;
 const urls=Array.from({length:11},(_,i)=>'assets/listening-speaking-nursery/part-'+String(i).padStart(2,'0')+'.txt');
 nurseryListeningPosterPromise=Promise.all(urls.map(url=>fetch(url).then(response=>{
  if(!response.ok)throw new Error('Visual lesson image data unavailable');
  return response.text();
 }))).then(parts=>{
  nurseryListeningPosterUrl='data:image/webp;base64,'+parts.join('');
  return nurseryListeningPosterUrl;
 }).catch(error=>{
  nurseryListeningPosterPromise=null;
  throw error;
 });
 return nurseryListeningPosterPromise;
}
let activeSpeech=null;
function stopReadAloud(){
 if('speechSynthesis' in window)window.speechSynthesis.cancel();
 activeSpeech=null;
 const btn=document.querySelector('[data-read-aloud].speaking');
 if(btn){btn.classList.remove('speaking');btn.innerHTML='🔊 Read Aloud';}
}
function lessonSpeechLanguage(lesson){
 if(lesson.subject==='Hindi'||lesson.subject==='Sanskrit')return 'hi-IN';
 if(lesson.subject==='Urdu')return 'ur-IN';
 return 'en-IN';
}
function lessonSpeechHeading(lesson){
 const title=String(lesson&&lesson.title||'').trim();
 if(!title)return '';
 const chapter=Number(lesson&&lesson.sourceChapter);
 return Number.isInteger(chapter)&&chapter>0?'Chapter '+chapter+'. '+title:'Chapter. '+title;
}
function lessonSpeechText(lesson){
 let cleanConcept=String(lesson.concept||'').replace(/^##\s+/gm,'').replace(/^EQ:\s*/gm,'').replace(/^-\s+/gm,'').trim();
 const title=String(lesson.title||'').trim();
 if(title&&cleanConcept.toLowerCase().startsWith(title.toLowerCase())){
  cleanConcept=cleanConcept.slice(title.length).replace(/^[\s:.-]+/,'');
 }
 const parts=[lessonSpeechHeading(lesson),cleanConcept];
 if(Array.isArray(lesson.activities))lesson.activities.forEach(row=>parts.push(row.filter(Boolean).join('. ')));
 if(Array.isArray(lesson.rhymes))lesson.rhymes.forEach(item=>parts.push(item.title,item.text));
 if(Array.isArray(lesson.stories))lesson.stories.forEach(item=>parts.push(item.title,item.text,item.moral?'Moral: '+item.moral:''));
 return parts.filter(Boolean).join('. ');
}
function splitMainContent(text){
 const source=String(text||'').trim();
 if(!source)return ['',''];
 const sentences=source.match(/[^.!?।]+[.!?।]?/g)?.map(x=>x.trim()).filter(Boolean)||[];
 if(sentences.length>=2){
  const cut=Math.ceil(sentences.length/2);
  return [sentences.slice(0,cut).join(' '),sentences.slice(cut).join(' ')];
 }
 const words=source.split(/\s+/);
 if(words.length<10)return [source,''];
 const cut=Math.ceil(words.length/2);
 return [words.slice(0,cut).join(' '),words.slice(cut).join(' ')];
}

function hasStructuredStudyContent(text){
 return /^##\s+/m.test(String(text||''));
}
const CLASS10_SCIENCE_CH1_FIGURES={
 '1.1':'assets/science/class10/ch1/figure1-1.webp',
 '1.2':'assets/science/class10/ch1/figure1-2.webp',
 '1.3':'assets/science/class10/ch1/figure1-3.webp',
 '1.4':'assets/science/class10/ch1/figure1-4.webp',
 '1.5':'assets/science/class10/ch1/figure1-5.webp',
 '1.6':'assets/science/class10/ch1/figure1-6.webp',
 '1.7':'assets/science/class10/ch1/figure1-7.webp',
 '1.8':'assets/science/class10/ch1/figure1-8.webp',
 '1.9':'assets/science/class10/ch1/figure1-9.webp',
 '1.10':'assets/science/class10/ch1/figure1-10.webp'
};
function class10ScienceFigureMeta(id){
 const chapter=String(id||'').split('.')[0];
 const chapterMeta=window.TLW_CLASS10_SCIENCE_FIGURES&&window.TLW_CLASS10_SCIENCE_FIGURES[chapter];
 if(!chapterMeta||!chapterMeta.figures||!chapterMeta.figures[id])return null;
 return {...chapterMeta.figures[id],sprite:chapterMeta.sprite,spriteWidth:chapterMeta.width,spriteHeight:chapterMeta.height};
}
function renderPdfSprite(meta,caption,attrs=''){
 const view=[meta.x,meta.y,meta.w,meta.h].join(' ');
 return '<svg class="pdf-study-sprite" viewBox="'+view+'" role="img" aria-label="'+safe(caption)+'" '+attrs+'><image href="'+safe(meta.sprite)+'" width="'+meta.spriteWidth+'" height="'+meta.spriteHeight+'" loading="lazy"></image></svg>';
}
const mathFigureAtlasCache=new Map();
function loadMathFigureAtlas(lesson){
 const atlas=lesson&&lesson.mathFigureAtlas;
 if(!atlas||!atlas.spriteText)return Promise.resolve('');
 if(lesson._mathFigureBlobUrl)return Promise.resolve(lesson._mathFigureBlobUrl);
 if(mathFigureAtlasCache.has(atlas.spriteText))return mathFigureAtlasCache.get(atlas.spriteText);
 const promise=fetch(atlas.spriteText,{cache:'force-cache'}).then(response=>{
  if(!response.ok)throw new Error('Maths figure data unavailable');
  return response.text();
 }).then(encoded=>{
  const clean=String(encoded||'').replace(/\s+/g,'');
  const binary=atob(clean);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
  lesson._mathFigureBlobUrl=url;
  return url;
 }).catch(error=>{
  mathFigureAtlasCache.delete(atlas.spriteText);
  throw error;
 });
 mathFigureAtlasCache.set(atlas.spriteText,promise);
 return promise;
}
function normaliseMathFigureRef(value){
 return String(value||'').toLowerCase()
  .replace(/figure/g,'fig')
  .replace(/fig\./g,'fig')
  .replace(/\s+/g,' ')
  .replace(/\s*\(\s*/g,'(')
  .replace(/\s*\)\s*/g,')')
  .trim();
}
function mathFigurePlacements(lines,lesson,usedFigures){
 const atlas=lesson&&lesson.mathFigureAtlas;
 const placements=new Map();
 if(!atlas||!Array.isArray(lines))return placements;
 Object.keys(atlas.figures||{}).forEach(caption=>{
  if(usedFigures&&usedFigures.has(caption))return;
  let chosen=-1;
  if(caption==='Factor tree of 32760'){
   chosen=lines.findIndex(line=>/factor tree/i.test(line));
   if(chosen<0)chosen=lines.findIndex(line=>/32760/.test(line));
  }else{
   const target=normaliseMathFigureRef(caption);
   const candidates=[];
   lines.forEach((line,index)=>{
    const norm=normaliseMathFigureRef(line);
    if(norm.includes(target))candidates.push({index,norm,length:String(line).length});
   });
   if(candidates.length){
    const exact=candidates.find(item=>item.norm===target);
    chosen=(exact||candidates.sort((a,b)=>a.length-b.length)[0]).index;
   }
  }
  if(chosen>=0){
   if(usedFigures)usedFigures.add(caption);
   const list=placements.get(chosen)||[];
   list.push(caption);
   placements.set(chosen,list);
  }
 });
 return placements;
}
function renderMathInlineFigure(lesson,caption,spriteUrl){
 const atlas=lesson&&lesson.mathFigureAtlas;
 const meta=atlas&&atlas.figures&&atlas.figures[caption];
 if(!atlas||!meta||!spriteUrl)return '';
 const spriteMeta={...meta,sprite:spriteUrl,spriteWidth:atlas.width,spriteHeight:atlas.height};
 const detail=(meta.page?'PDF page '+meta.page+' · ':'')+'Tap image to enlarge';
 return '<figure class="pdf-study-figure pdf-study-figure-sprite math-inline-figure"><button type="button" class="pdf-study-figure-open" data-pdf-sprite="'+safe(spriteUrl)+'" data-pdf-viewbox="'+[meta.x,meta.y,meta.w,meta.h].join(',')+'" data-pdf-sprite-width="'+atlas.width+'" data-pdf-sprite-height="'+atlas.height+'" data-pdf-caption="'+safe(caption)+'" aria-label="Enlarge '+safe(caption)+'">'+renderPdfSprite(spriteMeta,caption)+'</button><figcaption>'+safe(caption)+'<span>'+safe(detail)+'</span></figcaption></figure>';
}
function hydrateMathInlineFigures(lesson){
 const hosts=[...($('courseGrid')?.querySelectorAll('[data-math-inline-figure]')||[])];
 if(!hosts.length||!lesson?.mathFigureAtlas)return;
 loadMathFigureAtlas(lesson).then(url=>{
  if(currentTopicId!==lesson.id)return;
  hosts.forEach(host=>{
   if(!host.isConnected)return;
   const caption=host.dataset.mathInlineFigure||'';
   host.innerHTML=renderMathInlineFigure(lesson,caption,url);
  });
 }).catch(()=>{
  hosts.forEach(host=>{if(host.isConnected)host.innerHTML='<p class="math-figure-error">Diagram could not load. Refresh the page to try again.</p>';});
 });
}
function renderPdfFigure(line,lesson){
 if(lesson&&lesson.grade===10&&lesson.subject==='Science')return '';
 const rawCaption=String(line||'').replace(/^FIGURE:\s*/,'').trim();
 const match=rawCaption.match(/Figure\s+(\d+\.\d+)/i);
 if(!match)return '<div class="study-figure-note">🖼 '+safe(rawCaption)+'</div>';
 const id=match[1];
 if(id.startsWith('1.')&&lesson&&lesson.grade===10&&lesson.subject==='Science'&&lesson.title==='Chemical Reactions and Equations'){
  const src=CLASS10_SCIENCE_CH1_FIGURES[id];
  if(!src)return '<div class="study-figure-note">🖼 '+safe(rawCaption)+'</div>';
  return '<figure class="pdf-study-figure"><button type="button" class="pdf-study-figure-open" data-pdf-image="'+safe(src)+'" data-pdf-caption="'+safe(rawCaption)+'" aria-label="Enlarge '+safe(rawCaption)+'"><img src="'+safe(src)+'" alt="'+safe(rawCaption)+'" loading="lazy"></button><figcaption>'+safe(rawCaption)+'<span>Tap image to enlarge</span></figcaption></figure>';
 }
 const meta=class10ScienceFigureMeta(id);
 if(!meta)return '<div class="study-figure-note">🖼 '+safe(rawCaption)+'</div>';
 const mappedCaption=(meta.caption&&meta.caption.length<=170)?meta.caption:('Figure '+id);
 const caption=mappedCaption+(meta.page?' · PDF page '+meta.page:'');
 return '<figure class="pdf-study-figure pdf-study-figure-sprite"><button type="button" class="pdf-study-figure-open" data-pdf-sprite="'+safe(meta.sprite)+'" data-pdf-viewbox="'+[meta.x,meta.y,meta.w,meta.h].join(',')+'" data-pdf-sprite-width="'+meta.spriteWidth+'" data-pdf-sprite-height="'+meta.spriteHeight+'" data-pdf-caption="'+safe(caption)+'" aria-label="Enlarge '+safe(caption)+'">'+renderPdfSprite(meta,caption)+'</button><figcaption>'+safe(caption)+'<span>Tap image to enlarge</span></figcaption></figure>';
}
function renderStructuredStudyContent(text,lesson){
 const blocks=String(text||'').trim().split(/\n(?=##\s+)/).filter(Boolean);
 const seenFigures=new Set();
 const mathPlacedFigures=new Set();
 const cards=blocks.map((block,index)=>{
  const lines=block.split('\n').map(x=>x.trim()).filter(Boolean);
  const heading=(lines.shift()||'').replace(/^##\s+/,'');
  const figurePlacements=lesson&&lesson.grade===10&&lesson.subject==='Maths'?mathFigurePlacements(lines,lesson,mathPlacedFigures):new Map();
  let body='',listOpen=false;
  const closeList=()=>{if(listOpen){body+='</ul>';listOpen=false;}};
  lines.forEach((line,lineIndex)=>{
   if(line.startsWith('- ')){
    if(!listOpen){body+='<ul class="study-point-list">';listOpen=true;}
    body+='<li>'+safe(line.slice(2))+'</li>';
    return;
   }
   closeList();
   if(line.startsWith('EQ:')){
    body+='<div class="study-equation">'+safe(line.slice(3).trim())+'</div>';
   }else if(line.startsWith('ACTIVITY:')){
    body+='<div class="study-activity-note"><strong>Activity</strong><span>'+safe(line.slice(9).trim())+'</span></div>';
   }else if(line.startsWith('CAUTION:')){
    body+='<div class="study-caution-note"><strong>Caution</strong><span>'+safe(line.slice(8).trim())+'</span></div>';
   }else if(line.startsWith('KNOW:')){
    body+='<div class="study-know-note"><strong>Do You Know?</strong><span>'+safe(line.slice(5).trim())+'</span></div>';
   }else if(line.startsWith('FIGURE:')){
    const figureMatch=line.match(/Figure\s+(\d+\.\d+)/i);
    const figureId=figureMatch?figureMatch[1]:'';
    if(!figureId||!seenFigures.has(figureId)){
     if(figureId)seenFigures.add(figureId);
     body+=renderPdfFigure(line,lesson);
    }
   }else if(line.startsWith('QUESTION:')){
    body+='<div class="study-question-note"><strong>Question</strong><span>'+safe(line.slice(9).trim())+'</span></div>';
   }else if(line.startsWith('### ')){
    body+='<h5 class="study-subheading">'+safe(line.slice(4).trim())+'</h5>';
   }else if(/^Step\s+[IVX]+:/i.test(line)){
    const parts=line.split(':');
    body+='<p class="study-step"><strong>'+safe(parts.shift()+':')+'</strong> '+safe(parts.join(':').trim())+'</p>';
   }else{
    body+='<p>'+safe(line)+'</p>';
   }
   const inlineFigures=figurePlacements.get(lineIndex)||[];
   inlineFigures.forEach(caption=>{
    body+='<div class="math-inline-figure-slot" data-math-inline-figure="'+safe(caption)+'"><span>Loading '+safe(caption)+'…</span></div>';
   });
  });
  closeList();
  return '<article class="study-section-card '+((index===0||index===blocks.length-1)?'study-section-wide':'')+'"><div class="study-section-number">'+(index+1)+'</div><h4>'+safe(heading)+'</h4>'+body+'</article>';
 }).join('');
 return '<section class="structured-study-content"><div class="study-section-grid">'+cards+'</div></section>';
}
function readAloudLesson(id,button){
 const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){showToast('Read Aloud is not supported in this browser.');return;}
 if(activeSpeech===id&&window.speechSynthesis.speaking){stopReadAloud();return;}
 stopReadAloud();
 const utterance=new SpeechSynthesisUtterance(lessonSpeechText(lesson));
 utterance.lang=lessonSpeechLanguage(lesson);
 utterance.rate=lesson.grade<=0?.88:.96;
 const voices=window.speechSynthesis.getVoices();
 const prefix=utterance.lang.split('-')[0].toLowerCase();
 const voice=voices.find(v=>v.lang&&v.lang.toLowerCase()===utterance.lang.toLowerCase())||voices.find(v=>v.lang&&v.lang.toLowerCase().startsWith(prefix));
 if(voice)utterance.voice=voice;
 activeSpeech=id;
 button.classList.add('speaking');
 button.innerHTML='⏹ Stop Reading';
 utterance.onend=()=>{if(activeSpeech===id){activeSpeech=null;button.classList.remove('speaking');button.innerHTML='🔊 Read Aloud';}};
 utterance.onerror=()=>{if(activeSpeech===id){activeSpeech=null;button.classList.remove('speaking');button.innerHTML='🔊 Read Aloud';}};
 window.speechSynthesis.speak(utterance);
}
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function setGrade(g){if(!Number.isInteger(g)||!GRADE_LEVELS.includes(g))return;stopReadAloud();state.grade=g;subject='';query='';currentTopicId='';currentSubtopicKey='';classChoicesOpen=false;$('searchInput').value='';persist();renderAll();requestAnimationFrame(()=>$('classSubjectSection')?.scrollIntoView({behavior:'smooth',block:'start'}))}
function renderGradeSelectors(){
 $('classSelect').innerHTML=GRADE_GROUPS.map(group=>`<optgroup label="${safe(group.label)}">${group.grades.map(g=>`<option value="${g}" ${state.grade===g?'selected':''}>${gradeName(g)}</option>`).join('')}</optgroup>`).join('');
 const classPicker=document.querySelector('.class-picker');
 if(classPicker)classPicker.hidden=true;
 const exploreHeading=document.querySelector('.explore-heading');
 if(exploreHeading)exploreHeading.hidden=!classChoicesOpen;
 if(classChoicesOpen){
  $('gradeShortcuts').classList.remove('selected-class-only');
  $('gradeShortcuts').classList.add('class-hierarchy');
  $('gradeShortcuts').innerHTML=`<div class="learning-stage-list">${GRADE_GROUPS.map((group,index)=>`
   <section class="learning-stage-card learning-stage-${safe(group.key)}" aria-labelledby="stage-${safe(group.key)}">
    <div class="learning-stage-heading">
     <span class="learning-stage-step" aria-hidden="true">${index+1}</span>
     <span class="learning-stage-icon" aria-hidden="true">${group.icon}</span>
     <div><span class="learning-stage-kicker">Learning stage</span><h3 id="stage-${safe(group.key)}">${safe(group.label)}</h3><p>${safe(group.range)}</p></div>
    </div>
    <div class="learning-stage-classes" role="group" aria-label="${safe(group.label)} classes">
     ${group.grades.map(g=>`<button class="grade-chip ${state.grade===g?'selected':''}" data-grade="${g}" aria-pressed="${state.grade===g}">${gradeName(g)}</button>`).join('')}
    </div>
   </section>`).join('')}</div>`;
 }else{
  const group=GRADE_GROUPS.find(group=>group.grades.includes(state.grade));
  $('gradeShortcuts').classList.remove('class-hierarchy');
  $('gradeShortcuts').classList.add('selected-class-only');
  $('gradeShortcuts').innerHTML=`<div class="selected-class-display">
    <div class="selected-class-copy">
      <span class="selected-class-stage">${group?group.icon+' '+safe(group.label):'Selected class'}</span>
      <strong>${gradeName(state.grade)}</strong>
      <span class="selected-class-hint">Choose a subject below to continue learning.</span>
    </div>
    <button type="button" class="change-class-btn" data-change-class>← Change class</button>
   </div>`;
 }
}
function renderSubjectFilters(){
 const subjects=[...new Set(LESSONS.filter(x=>x.grade===state.grade).map(x=>x.subject))];
 const preferredOrder={English:0,Hindi:1,Sanskrit:2,Urdu:3,Maths:4,Science:5,EVS:6,'Social Science':7,'Health and Physical Education':8,Computer:9,'General Knowledge':10};
 subjects.sort((a,b)=>(preferredOrder[a]??99)-(preferredOrder[b]??99)||a.localeCompare(b));
 const choices=['All Subjects',...subjects];
 $('subjectGradeName').textContent=gradeName(state.grade);
 $('subjectFilters').innerHTML=choices.map(s=>`<button class="subject-btn subject-choice ${subject===s?'active':''}" data-subject="${safe(s)}" aria-pressed="${subject===s}"><span class="subject-choice-icon" aria-hidden="true">${s==='All Subjects'?'✦':subjectIcon(s)}</span><span class="subject-choice-name">${safe(s)}</span></button>`).join('');
}
function sourcePdfUrl(lesson){
 const source=String(lesson&&lesson.sourcePdf||'').trim();
 if(!source)return '';
 if(/^https?:\/\//i.test(source))return source;
 const officialSource=source.replace(/\s*\(\d+\)(?=\.pdf$)/i,'');
 const bundled=new Set(['aemr101.pdf']);
 if(bundled.has(officialSource))return new URL('pdfs/'+encodeURIComponent(officialSource),document.baseURI).href;
 return 'https://ncert.nic.in/textbook/pdf/'+encodeURIComponent(officialSource);
}
function chapterTopics(lesson){
 if(Array.isArray(lesson&&lesson.topics)&&lesson.topics.length){
  return lesson.topics.map((item,index)=>typeof item==='string'?{key:'topic-'+index,title:item,page:null}:{key:item.key||('topic-'+index),title:item.title||('Topic '+(index+1)),page:Number.isInteger(item.page)?item.page:null});
 }
 const source=String(lesson&&lesson.concept||'').trim();
 const blocks=source.split(/\n(?=##\s+)/).filter(Boolean);
 const topics=[];
 blocks.forEach((block,index)=>{
  const lines=block.split('\n').map(x=>x.trim()).filter(Boolean);
  const heading=(lines[0]||'').replace(/^##\s+/,'').trim();
  if(!heading)return;
  if(index===0&&heading.toLowerCase()===String(lesson.title||'').trim().toLowerCase())return;
  const pageMap=lesson&&lesson.topicPages||{};
  const mapped=pageMap[heading];
  topics.push({key:'section-'+index,title:heading,page:Number.isInteger(mapped)?mapped:null});
 });
 if(!topics.length)topics.push({key:'overview',title:'Overview',page:Number.isInteger(lesson&&lesson.chapterStartPage)?lesson.chapterStartPage:null});
 return topics;
}
function topicVideoMapping(lesson,topic){
 const local=lesson&&lesson.topicVideos||{};
 const globalMap=window.TLW_TOPIC_VIDEOS||{};
 const raw=local[topic.key]||local[topic.title]||globalMap[lesson.id+':'+topic.key]||globalMap[lesson.id+':'+topic.title]||'';
 if(!raw)return null;
 if(typeof raw==='string')return {url:raw};
 return raw&&typeof raw==='object'?raw:null;
}
function youtubeVideoId(value){
 const raw=String(value||'').trim();
 if(/^[A-Za-z0-9_-]{11}$/.test(raw))return raw;
 const match=raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
 return match?match[1]:'';
}
function topicVideoSearchUrl(lesson,topic){
 const query=[gradeName(lesson.grade),lesson.subject,lesson.title,topic.title,'CBSE NCERT explained'].filter(Boolean).join(' ');
 return 'https://www.youtube.com/results?search_query='+encodeURIComponent(query);
}
function openTopicVideo(lesson,topic){
 const mapping=topicVideoMapping(lesson,topic);
 const mappedValue=mapping&&(mapping.videoId||mapping.url||mapping.youtube||'');
 const id=youtubeVideoId(mappedValue);
 if(id){
  const modal=$('topicVideoModal');
  const frame=$('topicVideoFrame');
  const title=$('topicVideoTitle');
  if(!modal||!frame)return;
  if(title)title.textContent=topic.title;
  frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0';
  modal.hidden=false;
  document.body.classList.add('modal-open');
  return;
 }
 window.open(topicVideoSearchUrl(lesson,topic),'_blank','noopener,noreferrer');
}
function closeTopicVideo(){
 const modal=$('topicVideoModal');
 const frame=$('topicVideoFrame');
 if(frame)frame.src='';
 if(modal)modal.hidden=true;
 if($('lessonModal')?.hidden!==false&&$('authModal')?.hidden!==false)document.body.classList.remove('modal-open');
}
function renderChapterTopicNavigator(lesson){
 const topics=chapterTopics(lesson);
 if(!topics.length)return '';
 const active=topics.find(t=>t.key===currentSubtopicKey)||null;
 return '<section class="chapter-topics-block"><div class="chapter-topics-heading"><span>TOPICS IN THIS CHAPTER</span><strong>'+topics.length+'</strong></div><div class="chapter-topic-buttons">'+topics.map((t,i)=>{
  const mastery=topicMastery(lesson,t.key);
  const status=topicStatusInfo(mastery);
  return '<article class="chapter-topic-card '+(active&&active.key===t.key?'active':'')+'">'+
   '<button type="button" class="chapter-topic-button" data-subtopic-key="'+safe(t.key)+'" '+(t.page===null?'data-page-unverified="true"':'data-pdf-page="'+t.page+'"')+'><span>'+(i+1)+'</span><strong>'+safe(t.title)+'</strong></button>'+
   '<div class="chapter-topic-meta">'+
    '<span class="topic-page-status">'+(t.page!==null?'PDF p. '+t.page:'Page verification pending')+'</span>'+
    '<span class="topic-mastery-badge mastery-'+status.key+'">'+status.icon+' '+mastery+'% · '+status.label+'</span>'+
    '<button type="button" class="topic-video-button" data-topic-video="'+safe(t.key)+'">▶ Watch Video</button>'+
   '</div>'+
  '</article>';
 }).join('')+'</div></section>';
}

const originalPdfCache=new Map();
function pdfBarcodeMasks(filename,pageNumber){
 const map=window.TLW_PDF_BARCODE_MASKS||{};
 return (map[filename]||[]).filter(item=>Number(item.page)===Number(pageNumber)&&Array.isArray(item.rect));
}
async function detectRenderedBarcodes(canvas){
 const found=[];
 try{
  if('BarcodeDetector' in window){
   let detector;
   try{detector=new BarcodeDetector({formats:['qr_code','code_128','code_39','code_93','ean_13','ean_8','upc_a','upc_e','codabar','itf']});}
   catch{detector=new BarcodeDetector({formats:['qr_code']});}
   const rows=await detector.detect(canvas);
   rows.forEach(row=>{
    const b=row.boundingBox;
    if(b&&b.width>20&&b.height>20)found.push([b.x/canvas.width,b.y/canvas.height,b.width/canvas.width,b.height/canvas.height]);
   });
  }
 }catch{}
 if(found.length||typeof window.jsQR!=='function')return found;
 try{
  const maxWidth=1400;
  const ratio=Math.min(1,maxWidth/canvas.width);
  const scan=document.createElement('canvas');
  scan.width=Math.max(1,Math.round(canvas.width*ratio));
  scan.height=Math.max(1,Math.round(canvas.height*ratio));
  const sctx=scan.getContext('2d',{willReadFrequently:true});
  sctx.drawImage(canvas,0,0,scan.width,scan.height);
  const image=sctx.getImageData(0,0,scan.width,scan.height);
  const code=window.jsQR(image.data,scan.width,scan.height,{inversionAttempts:'attemptBoth'});
  if(code&&code.location){
   const pts=[code.location.topLeftCorner,code.location.topRightCorner,code.location.bottomRightCorner,code.location.bottomLeftCorner];
   const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
   const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
   if(x1-x0>20&&y1-y0>20)found.push([x0/scan.width,y0/scan.height,(x1-x0)/scan.width,(y1-y0)/scan.height]);
  }
 }catch{}
 return found;
}
function renderOriginalPdfPanel(lesson){
 const url=sourcePdfUrl(lesson);
 if(!url)return '';
 const topics=chapterTopics(lesson);
 const active=topics.find(t=>t.key===currentSubtopicKey)||null;
 const page=active&&Number.isInteger(active.page)?active.page:(Number.isInteger(lesson.chapterStartPage)?lesson.chapterStartPage:1);
 const pdfUrl=url+'#page='+page+'&view=FitH';
 return '<section class="original-pdf-panel full-fidelity-pdf">'+
   '<div class="pdf-nav-bar">'+
    '<button type="button" data-original-pdf-prev aria-label="Previous PDF page">‹</button>'+
    '<span data-original-pdf-page>Page '+page+'</span>'+
    '<button type="button" data-original-pdf-next aria-label="Next PDF page">›</button>'+
   '</div>'+
   '<object class="original-pdf-object" data="'+safe(pdfUrl)+'" type="application/pdf" aria-label="'+safe(lesson.title)+' PDF">'+
     '<embed class="original-pdf-embed" src="'+safe(pdfUrl)+'" type="application/pdf">'+
     '<div class="pdf-object-fallback"><a href="'+safe(pdfUrl)+'" target="_blank" rel="noopener">Open original PDF</a></div>'+
   '</object>'+
  '</section>';
}
function hydrateOriginalPdfViewer(lesson){
 const panel=$('courseGrid')?.querySelector('.original-pdf-panel');
 if(!panel||!lesson?.sourcePdf)return;
 const topics=chapterTopics(lesson);
 const active=topics.find(t=>t.key===currentSubtopicKey)||null;
 let page=active&&Number.isInteger(active.page)?active.page:(Number.isInteger(lesson.chapterStartPage)?lesson.chapterStartPage:1);
 const url=sourcePdfUrl(lesson);
 const object=panel.querySelector('.original-pdf-object');
 const embed=panel.querySelector('.original-pdf-embed');
 const status=panel.querySelector('[data-original-pdf-page]');
 const prev=panel.querySelector('[data-original-pdf-prev]');
 const next=panel.querySelector('[data-original-pdf-next]');
 function go(target){
  page=Math.max(1,target);
  const src=url+'#page='+page+'&view=FitH';
  if(object)object.data=src;
  if(embed)embed.src=src;
  if(status)status.textContent='Page '+page;
  if(prev)prev.disabled=page<=1;
 }
 prev?.addEventListener('click',()=>go(page-1));
 next?.addEventListener('click',()=>go(page+1));
 if(prev)prev.disabled=page<=1;
}

let testGrade=null;
let activeTestItems=[];
let descriptivePaperRun=0;
let lastDescriptivePaperSignature='';
let activeDescriptiveSections=[];
let examCurrentIndex=0;
let examAnswers=[];
let examReview=new Set();
let examTimerId=null;
let examSecondsLeft=0;
let examSubmitted=false;
let lastExamWeakConcepts=[];
const EXAM_PRESETS={
 full:{key:'full',label:'Full Syllabus',marks:80,minutes:180,targetQuestions:40},
 chapter:{key:'chapter',label:'Chapter Test',marks:20,minutes:30,targetQuestions:20},
 topic:{key:'topic',label:'Topic Test',marks:10,minutes:15,targetQuestions:10}
};
const DIFFICULTY_LEVELS={
 foundation:{label:'Foundation',icon:'🟢',description:'Definitions, recognition and basic recall'},
 standard:{label:'Standard',icon:'🟡',description:'Application and reasoning'},
 challenge:{label:'Challenge',icon:'🔴',description:'Competency, HOTS and case-based thinking'}
};
function normaliseDifficulty(value){
 const key=String(value||'').toLowerCase();
 return DIFFICULTY_LEVELS[key]?key:'';
}
function questionDifficulty(question,index=0,lesson=null){
 const explicit=normaliseDifficulty(question&&question.difficulty);
 if(explicit)return explicit;
 const text=String(question&&question.text||'').toLowerCase();
 if(/\b(case|assertion|reason|analyse|analyze|evaluate|justify|predict|infer|conclude|what would happen|why would|higher order)\b/.test(text))return 'challenge';
 if(/^(what|which|who|where|when|name|identify|define|choose|select|how many|what colour|what comes)\b/.test(text.trim()))return 'foundation';
 if(/\b(explain|compare|apply|calculate|solve|why|how|relationship|difference|correct statement)\b/.test(text))return 'standard';
 return index%3===0?'foundation':index%3===1?'standard':'challenge';
}
function validQuestionsWithMeta(lesson){
 return validLessonQuestions(lesson).map((question,index)=>({question,index,difficulty:questionDifficulty(question,index,lesson)}));
}
function lessonDifficultyCounts(lesson){
 const counts={foundation:0,standard:0,challenge:0};
 validQuestionsWithMeta(lesson).forEach(item=>counts[item.difficulty]++);
 return counts;
}
function quizQuestionsForLesson(lesson,difficulty='all'){
 const items=validQuestionsWithMeta(lesson);
 if(difficulty==='all')return items;
 return items.filter(item=>item.difficulty===difficulty);
}
function explanationKeywords(question){
 const correct=Array.isArray(question&&question.options)&&Number.isInteger(question.answer)?question.options[question.answer]:'';
 const stop=new Set(['what','which','when','where','who','whose','why','how','does','do','did','is','are','was','were','the','this','that','these','those','with','from','into','about','after','before','under','over','and','for','has','have','had','can','could','would','should','your','their','there','than','then','only','most','best','correct','answer']);
 return (String(question&&question.text||'')+' '+String(correct||'')).toLowerCase().match(/[a-z0-9]+/g)?.filter(word=>word.length>=4&&!stop.has(word))||[];
}
function cleanConceptSentences(lesson){
 const raw=String(lesson&&lesson.concept||'')
  .replace(/#{1,6}\s*/g,'')
  .replace(/\b(ACTIVITY|QUESTION|FIGURE|KNOW|EQ):/g,' ')
  .replace(/[•*-]\s+/g,' ');
 return raw.split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>=24&&s.length<=320);
}
function questionExplanation(lesson,question){
 if(question&&typeof question.explanation==='string'&&question.explanation.trim())return question.explanation.trim();
 const correct=Array.isArray(question&&question.options)&&Number.isInteger(question.answer)?String(question.options[question.answer]||''):'';
 const keywords=explanationKeywords(question);
 const sentences=cleanConceptSentences(lesson);
 let best='',bestScore=0;
 sentences.forEach(sentence=>{
  const lower=sentence.toLowerCase();
  let score=0;
  keywords.forEach(word=>{if(lower.includes(word))score+=1});
  if(correct&&lower.includes(correct.toLowerCase()))score+=3;
  if(score>bestScore){bestScore=score;best=sentence}
 });
 if(bestScore>0)return best;
 if(lesson&&lesson.example)return String(lesson.example);
 return 'The correct answer is '+correct+'. Review the concept in '+String(lesson&&lesson.title||'this lesson')+' and connect the answer to the definition, rule or example given there.';
}
function renderDifficultySelector(lesson){
 const counts=lessonDifficultyCounts(lesson);
 const total=counts.foundation+counts.standard+counts.challenge;
 return '<section class="chapter-difficulty-block">'+
  '<div class="chapter-difficulty-heading"><div><span>PRACTICE BY DIFFICULTY</span><strong>Choose your level</strong></div><small>'+total+' MCQs</small></div>'+
  '<div class="chapter-difficulty-grid">'+Object.entries(DIFFICULTY_LEVELS).map(([key,meta])=>
   '<button type="button" class="difficulty-card difficulty-'+key+'" data-quiz-difficulty="'+key+'" data-start-quiz="'+safe(lesson.id)+'" '+(counts[key]?'':'disabled')+'>'+
    '<span class="difficulty-icon">'+meta.icon+'</span><span><strong>'+meta.label+'</strong><small>'+meta.description+'</small></span><b>'+counts[key]+'</b>'+
   '</button>'
  ).join('')+'</div>'+
  (!total?'<p class="difficulty-empty">Difficulty-based MCQs will appear here when this chapter question bank is added.</p>':'')+
 '</section>';
}
function validLessonQuestions(lesson){
 return (Array.isArray(lesson&&lesson.questions)?lesson.questions:[]).filter(q=>
  q&&typeof q.text==='string'&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length
 );
}
function renderTestSeriesClasses(){
 const host=$('testClassGrid');
 if(!host)return;
 host.innerHTML=GRADE_LEVELS.map(g=>{
  const lessons=LESSONS.filter(l=>l.grade===g);
  const subjects=new Set(lessons.map(l=>l.subject)).size;
  return '<article class="test-class-row">'+
   '<div class="test-class-info"><span class="test-class-icon" aria-hidden="true">📝</span><div><strong>'+safe(gradeName(g))+'</strong><small>'+subjects+' subjects</small></div></div>'+
   '<button type="button" class="btn btn-primary test-class-start" data-test-grade="'+g+'">Start</button>'+
  '</article>';
 }).join('');
}
function testLessonsForGrade(){
 return LESSONS.filter(l=>l.grade===testGrade);
}
function stopExamTimer(){
 if(examTimerId){clearInterval(examTimerId);examTimerId=null;}
}
function resetTestPaper(){
 stopExamTimer();
 activeTestItems=[];
 activeDescriptiveSections=[];
 examCurrentIndex=0;
 examAnswers=[];
 examReview=new Set();
 examSecondsLeft=0;
 examSubmitted=false;
 lastExamWeakConcepts=[];
 const panel=$('testPaperPanel');
 if(panel){panel.hidden=true;panel.innerHTML='';}
}
function currentExamPreset(){
 const key=$('testExamPreset')?.value||'full';
 return EXAM_PRESETS[key]||EXAM_PRESETS.full;
}
function setExamPresetValue(key){
 const preset=EXAM_PRESETS[key]?key:'full';
 const input=$('testExamPreset');
 if(input)input.value=preset;
 $('testExamPresetChoice')?.querySelectorAll('[data-exam-preset]').forEach(button=>{
  button.classList.toggle('active',button.dataset.examPreset===preset);
 });
}
function applyExamPresetScope(){
 const preset=currentExamPreset();
 const paperType=$('testPaperTypeSelect')?.value||'objective';
 const chapter=$('testChapterSelect');
 const topic=$('testTopicSelect');
 if(!chapter||!topic)return;
 if(paperType==='objective'){
  chapter.disabled=false;
  topic.disabled=!chapter.value;
  return;
 }
 if(preset.key==='full'){
  chapter.value='';
  chapter.disabled=true;
  topic.value='';
  topic.disabled=true;
 }else if(preset.key==='chapter'){
  chapter.disabled=false;
  topic.value='';
  topic.disabled=true;
 }else{
  chapter.disabled=false;
  topic.disabled=!chapter.value;
 }
}
function selectExamPreset(key){
 setExamPresetValue(key);
 resetTestPaper();
 applyExamPresetScope();
 updateTestScopeNote();
}
function populateTestSubjects(){
 const select=$('testSubjectSelect');
 if(!select)return;
 const subjects=[...new Set(testLessonsForGrade().map(l=>l.subject))].sort((a,b)=>a.localeCompare(b));
 select.innerHTML=subjects.length?subjects.map(s=>'<option value="'+safe(s)+'">'+safe(s)+'</option>').join(''):'<option value="">No subjects available</option>';
 populateTestChapters();
}
function populateTestChapters(){
 resetTestPaper();
 const subject=$('testSubjectSelect')?.value||'';
 const lessons=testLessonsForGrade().filter(l=>l.subject===subject);
 const select=$('testChapterSelect');
 if(!select)return;
 select.innerHTML='<option value="">All chapters</option>'+lessons.map((lesson,index)=>
  '<option value="'+safe(lesson.id)+'">'+(index+1)+'. '+safe(lesson.title)+'</option>'
 ).join('');
 populateTestTopics();
 applyExamPresetScope();
}
function populateTestTopics(){
 resetTestPaper();
 const chapterId=$('testChapterSelect')?.value||'';
 const select=$('testTopicSelect');
 if(!select)return;
 if(!chapterId){
  select.innerHTML='<option value="">All topics</option>';
  select.disabled=true;
 }else{
  const lesson=LESSONS.find(l=>l.id===chapterId);
  const topics=lesson?chapterTopics(lesson):[];
  select.innerHTML='<option value="">All topics</option>'+topics.map(t=>
   '<option value="'+safe(t.key)+'">'+safe(t.title)+'</option>'
  ).join('');
  select.disabled=false;
 }
 applyExamPresetScope();
 updateTestScopeNote();
}
function validateExamScope(){
 const paperType=$('testPaperTypeSelect')?.value||'objective';
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 if(paperType==='objective')return true;
 const preset=currentExamPreset();
 if(preset.key==='chapter'&&!chapterId){
  showToast('Choose a chapter before starting the Chapter Test.');
  return false;
 }
 if(preset.key==='topic'&&(!chapterId||!topicKey)){
  showToast('Choose both a chapter and topic before starting the Topic Test.');
  return false;
 }
 return true;
}
function updateTestScopeNote(){
 const note=$('testScopeNote');
 if(!note)return;
 const paperType=$('testPaperTypeSelect')?.value||'objective';
 const subject=$('testSubjectSelect')?.value||'';
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 const chapter=LESSONS.find(l=>l.id===chapterId);
 const topic=chapter?chapterTopics(chapter).find(t=>t.key===topicKey):null;
 let scope=subject||'Subject';
 if(chapter)scope+=' · '+chapter.title;
 if(topic)scope+=' · '+topic.title;
 const start=$('generateTestBtn');
 if(paperType==='descriptive'){
  const preset=currentExamPreset();
  const cbse=testGrade===10?' Current CBSE reference: 2026-27.':'';
  note.textContent=preset.label+' · '+preset.marks+' marks · '+preset.minutes+' minutes. '+scope+'.'+cbse+' Finish the paper to reveal the practice marking scheme, model-answer guidance and examiner keywords.';
  if(start)start.innerHTML='Begin Descriptive Exam <span aria-hidden="true">↗</span>';
 }else{
  const difficulty=$('testDifficultySelect')?.value||'all';
  const level=difficulty==='all'?'Mixed difficulty':(DIFFICULTY_LEVELS[difficulty]?.label||difficulty);
  note.textContent='MCQ Exam · '+scope+' · '+level+'. Each MCQ carries 1 mark. Timer is based on the number of verified MCQs available.';
  if(start)start.innerHTML='Begin MCQ Exam <span aria-hidden="true">↗</span>';
 }
}
function openTestBuilder(grade){
 testGrade=grade;
 resetTestPaper();
 const builder=$('testBuilder');
 if(!builder)return;
 builder.hidden=false;
 $('testBuilderTitle').textContent=gradeName(grade)+' Test Series';
 const modeChoice=$('testModeChoice');
 const scope=$('testScopeControls');
 if(modeChoice)modeChoice.hidden=false;
 if(scope)scope.hidden=true;
 const paperType=$('testPaperTypeSelect');
 if(paperType)paperType.value='objective';
 setExamPresetValue('full');
 const subjectSelect=$('testSubjectSelect');
 const chapterSelect=$('testChapterSelect');
 const topicSelect=$('testTopicSelect');
 if(subjectSelect)subjectSelect.innerHTML='';
 if(chapterSelect)chapterSelect.innerHTML='';
 if(topicSelect)topicSelect.innerHTML='';
 requestAnimationFrame(()=>builder.scrollIntoView({behavior:'smooth',block:'start'}));
}
function chooseTestMode(mode){
 const paperType=$('testPaperTypeSelect');
 const scope=$('testScopeControls');
 const modeChoice=$('testModeChoice');
 if(!paperType||!scope)return;
 paperType.value=mode==='descriptive'?'descriptive':'objective';
 const difficultyField=$('testDifficultyField');
 const presetChoice=$('testExamPresetChoice');
 if(difficultyField)difficultyField.hidden=paperType.value==='descriptive';
 if(presetChoice)presetChoice.hidden=paperType.value!=='descriptive';
 resetTestPaper();
 scope.hidden=false;
 if(modeChoice)modeChoice.querySelectorAll('[data-test-mode]').forEach(button=>{
  button.classList.toggle('selected',button.dataset.testMode===paperType.value);
 });
 if(paperType.value==='descriptive')setExamPresetValue('full');
 populateTestSubjects();
 applyExamPresetScope();
 updateTestScopeNote();
 requestAnimationFrame(()=>scope.scrollIntoView({behavior:'smooth',block:'start'}));
}
function shuffledTestItems(items){
 const copy=[...items];
 for(let i=copy.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [copy[i],copy[j]]=[copy[j],copy[i]];
 }
 return copy;
}
function buildTestQuestionPool(){
 const subject=$('testSubjectSelect')?.value||'';
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 const difficulty=$('testDifficultySelect')?.value||'all';
 let lessons=testLessonsForGrade().filter(l=>l.subject===subject);
 if(chapterId)lessons=lessons.filter(l=>l.id===chapterId);
 let items=lessons.flatMap(lesson=>validQuestionsWithMeta(lesson).map(item=>({
  lesson,question:item.question,index:item.index,difficulty:item.difficulty
 })));
 if(difficulty!=='all')items=items.filter(item=>item.difficulty===difficulty);
 let topicFallback=false;
 if(topicKey&&chapterId){
  const chapter=lessons[0];
  const topic=chapterTopics(chapter).find(t=>t.key===topicKey);
  const tagged=items.filter(item=>{
   const q=item.question;
   return q.topicKey===topicKey||
    (topic&&String(q.topic||'').toLowerCase()===String(topic.title||'').toLowerCase())||
    (topic&&String(q.section||'').toLowerCase()===String(topic.title||'').toLowerCase());
  });
  if(tagged.length)items=tagged;
  else{items=[];topicFallback=true;}
 }
 const limit=topicKey?10:(chapterId?20:40);
 return {items:shuffledTestItems(items).slice(0,limit),topicFallback,difficulty};
}
function rotatePick(items,count,offset){
 if(!items.length)return [];
 const out=[];
 for(let i=0;i<count;i++)out.push(items[(offset+i)%items.length]);
 return out;
}
const CBSE_PATTERN_SESSION='2026-27';

function class10ScienceSpecificPrompts(focus,marks){
 const f=String(focus||'').toLowerCase();
 const byMarks={2:[],3:[],4:[],5:[]};
 if(/chemical reactions? in daily life|chemical reaction/.test(f)){
  byMarks[2].push(
   'A student mixes two colourless solutions and observes a precipitate. State two observations that can be used as evidence that a chemical reaction has occurred.',
   'Magnesium ribbon burns with a dazzling white flame and forms a white powder. Name the product and state one observation that confirms a chemical change.'
  );
  byMarks[3].push(
   'A student says that every change of state is a chemical reaction. Evaluate the statement. Give one example of a chemical change and identify two observations that support your conclusion.'
  );
 }
 if(/chemical equations?|writing a chemical equation/.test(f)){
  byMarks[2].push(
   'For the reaction of magnesium with oxygen, write the chemical equation and identify the reactant(s) and product.',
   'Why is a word equation less informative than a chemical equation? Give one suitable example.'
  );
  byMarks[3].push(
   'Write the chemical equation for zinc reacting with dilute sulphuric acid. Add physical-state symbols and identify the gas evolved.'
  );
 }
 if(/balanced|balancing|hit-and-trial/.test(f)){
  byMarks[2].push(
   'Balance the equation Fe + H₂O → Fe₃O₄ + H₂ using the smallest whole-number coefficients. State the law that requires the number of atoms of each element to remain equal on both sides.',
   'A student balances H₂ + O₂ → H₂O by changing H₂O to H₂O₂. Explain why this method is incorrect and state what should be changed instead.'
  );
  byMarks[3].push(
   'A learner writes Fe + 4H₂O → Fe₃O₄ + 4H₂ and claims that the equation is balanced. Check the atom count, identify the error and write the correctly balanced equation.'
  );
  byMarks[5].push(
   'Balance the following equations using the smallest whole-number coefficients and justify how each balanced equation obeys conservation of mass: (i) Fe + H₂O → Fe₃O₄ + H₂, (ii) H₂ + O₂ → H₂O, (iii) Al + HCl → AlCl₃ + H₂.'
  );
 }
 if(/physical states|reaction conditions/.test(f)){
  byMarks[2].push(
   'What information is conveyed by the symbols (s), (l), (g) and (aq) in a chemical equation? Write any two of them with their meanings.',
   'Why are temperature, pressure, sunlight or a catalyst sometimes written above or below the reaction arrow?'
  );
  byMarks[3].push(
   'Write an informative balanced equation for iron reacting with steam to form Fe₃O₄ and hydrogen. Include physical-state symbols and explain what H₂O(g) represents.'
  );
 }
 if(/combination/.test(f)){
  byMarks[2].push(
   'Calcium oxide is mixed with water. Write the balanced equation, name the product and identify the reaction type.',
   'Why does a beaker become warm when quick lime reacts with water? Classify the reaction on the basis of energy change.'
  );
  byMarks[3].push(
   'During whitewashing, calcium hydroxide slowly reacts with carbon dioxide in air. Write the equation and explain why a shiny layer develops on the wall after a few days.'
  );
 }
 if(/exothermic/.test(f)){
  byMarks[2].push(
   'Why is respiration considered an exothermic reaction? State the energy change and write the overall reaction of glucose with oxygen.',
   'Differentiate an exothermic reaction from an endothermic reaction using one observable energy change.'
  );
  byMarks[3].push(
   'A compost heap becomes warm while vegetable matter decomposes. Explain the observation and relate it to the meaning of an exothermic process.'
  );
 }
 if(/decomposition/.test(f)){
  byMarks[2].push(
   'Silver chloride turns grey when exposed to sunlight. Write the reaction and identify the type of decomposition involved.',
   'On heating ferrous sulphate crystals, the colour changes and gases are evolved. State what this observation shows about decomposition reactions.'
  );
  byMarks[3].push(
   'Compare thermal, electrolytic and photochemical decomposition. For each, state the form of energy supplied and give one reaction example.'
  );
  byMarks[4].push(
   'Case-based question: A student keeps silver chloride in sunlight and notices that the white solid gradually becomes grey. (a) Name the type of reaction. (1) (b) Write the balanced chemical equation. (1) (c) Explain the colour change and predict what would happen if the sample were kept in darkness. (2)'
  );
  byMarks[5].push(
   'A student studies decomposition using three activities: heating ferrous sulphate, electrolysis of water and exposure of silver chloride to sunlight. For each activity, identify the energy source, write or describe the products formed, and explain why all three are classified as decomposition reactions.'
  );
 }
 if(/displacement/.test(f)&&!/double/.test(f)){
  byMarks[2].push(
   'An iron nail is placed in copper sulphate solution. State the expected colour changes in the nail and solution, and name the reaction type.',
   'Why can zinc displace copper from copper sulphate solution? Explain using relative reactivity.'
  );
  byMarks[3].push(
   'Iron nails are immersed in blue copper sulphate solution for 20 minutes. Write the balanced equation, explain the two visible observations and identify which element is displaced.'
  );
  byMarks[4].push(
   'Case-based question: Three clean metal strips, Fe, Zn and Cu, are separately placed in copper sulphate solution. (a) Which of Fe and Zn can displace copper? (1) (b) What visible change would indicate displacement? (1) (c) Explain why copper itself does not displace copper from its salt and relate the result to reactivity. (2)'
  );
 }
 if(/double displacement|precipitation/.test(f)){
  byMarks[2].push(
   'Aqueous sodium sulphate is mixed with aqueous barium chloride. Name the precipitate and write the balanced chemical equation.',
   'Why is the reaction between sodium sulphate and barium chloride classified as both double displacement and precipitation?'
  );
  byMarks[3].push(
   'Lead nitrate solution is mixed with potassium iodide solution. State the expected observation, name the precipitate and write the balanced chemical equation.'
  );
  byMarks[4].push(
   'Case-based question: Two clear aqueous solutions are mixed and a white insoluble solid appears. The reactants are Na₂SO₄(aq) and BaCl₂(aq). (a) Name the precipitate. (1) (b) Write the balanced equation. (1) (c) Explain why this is a double displacement reaction and how the observation confirms precipitation. (2)'
  );
 }
 if(/oxidation|reduction|redox/.test(f)){
  byMarks[2].push(
   'Copper powder becomes black when heated in air. Name the black substance and state which change represents oxidation.',
   'In CuO + H₂ → Cu + H₂O, identify the substance oxidised and the substance reduced.'
  );
  byMarks[3].push(
   'Copper(II) oxide is heated in a stream of hydrogen. Explain the colour change and show, using gain or loss of oxygen, which substance is oxidised and which is reduced.'
  );
  byMarks[4].push(
   'Case-based question: A black metal oxide is heated while hydrogen gas is passed over it. The solid becomes reddish-brown and water is formed. (a) Identify the metal oxide if the metal is copper. (1) (b) Which reactant is reduced? (1) (c) Explain why the reaction is simultaneously oxidation and reduction. (2)'
  );
 }
 if(/corrosion|rust/.test(f)){
  byMarks[2].push(
   'State the two essential conditions needed for rusting of iron and mention one method used to prevent rusting.',
   'Why does painting an iron surface reduce corrosion? Explain the role of the coating.'
  );
  byMarks[3].push(
   'Two iron nails are kept separately: one in dry air and one in water exposed to air. Predict the relative rusting and justify your answer using the conditions required for corrosion.'
  );
  byMarks[4].push(
   'Case-based question: An iron gate near the coast rusts faster than a similar gate in a dry region. (a) Name the process. (1) (b) State one condition common to rusting in both places. (1) (c) Explain why coastal conditions accelerate the process and suggest one suitable preventive method. (2)'
  );
 }
 if(/rancidity/.test(f)){
  byMarks[2].push(
   'What is rancidity? State one method used to slow it down in foods containing fats and oils.',
   'Why are packets of chips often flushed with nitrogen? Relate your answer to oxidation.'
  );
  byMarks[3].push(
   'A food sample containing oil develops an unpleasant smell after long exposure to air. Explain the chemical change involved and suggest two storage conditions that would slow it down.'
  );
  byMarks[4].push(
   'Case-based question: The same fried food is stored in three ways: an open plate, an airtight container and a nitrogen-flushed packet. (a) Which sample is expected to become rancid fastest? (1) (b) Which condition best limits oxidation? (1) (c) Explain the trend using the role of oxygen and storage conditions. (2)'
  );
 }
 return byMarks[marks]||[];
}

function descriptiveSubjectPrompts(subject,focus,marks){
 const f='"'+focus+'"';
 const competency={
  2:[
   'A learner applies '+f+' in a new situation. State the relevant concept or rule and give one reason that supports its use.',
   'Predict what will happen if one important condition related to '+f+' is changed. Give a reason for your prediction.',
   'State two scientifically or logically valid points needed to distinguish a correct use of '+f+' from an incorrect one.',
   'A student gives an incomplete statement about '+f+'. Write the corrected idea and one reason for the correction.'
  ],
  3:[
   'Analyse a familiar situation involving '+f+'. Identify the relevant concept, explain the reasoning and state the expected conclusion.',
   'A student reaches a conclusion using '+f+'. Describe how the conclusion can be checked and justify the method used.',
   'Compare two possible situations involving '+f+' and explain, with three relevant points, why their outcomes may differ.',
   'Apply '+f+' to a new example. Show the essential reasoning or steps and explain how you know the result is reasonable.'
  ],
  4:[
   'Case-based question: A student encounters a new situation involving '+f+'. (a) Identify the relevant concept. (1) (b) State one observation, rule or relationship that applies. (1) (c) Predict the outcome and justify it using the concept. (2)',
   'Competency-based question: A learner changes one important condition while working with '+f+'. (a) State what changes first. (1) (b) Give one reason. (1) (c) Analyse the final effect and justify your conclusion. (2)'
  ],
  5:[
   'Analyse a multi-step situation involving '+f+'. Identify the main concept, apply it systematically, justify the important steps and state a clear conclusion.',
   'A learner proposes an explanation for '+f+'. Evaluate the explanation using subject knowledge, correct any weakness, support the corrected reasoning with an example and state the final conclusion.',
   'Apply '+f+' to an unfamiliar real-life situation. Explain the method or mechanism, use appropriate evidence or working, and justify the result.'
  ]
 };
 const maths={
  2:[
   'A student chooses a method for a problem based on '+f+'. State the method and give one reason why it is appropriate.',
   'Write the key mathematical relation used in '+f+' and explain how one condition in a problem determines its use.'
  ],
  3:[
   'Solve a representative problem based on '+f+' and show the essential steps. Verify the result using a second check or substitution where possible.',
   'A worked solution involving '+f+' contains an incorrect step. Explain how you would identify the error, correct it and verify the final result.'
  ],
  4:[
   'Case-based question: A real-life situation can be modelled using '+f+'. (a) Identify the required mathematical quantities. (1) (b) Form the relevant relation. (1) (c) Complete the calculation or reasoning and interpret the result. (2)'
  ],
  5:[
   'Solve a multi-step application problem based on '+f+'. Show the mathematical model, complete the working, justify the method and interpret the final answer.',
   'Construct and solve a real-life problem using '+f+'. State the assumptions, show all essential steps and verify that the answer satisfies the original conditions.'
  ]
 };
 const science={
  2:[
   'A student observes a situation related to '+f+'. State one relevant scientific principle or process and give one reason that supports the observation.',
   'Predict what would happen if one essential condition for '+f+' were removed or changed. Give a scientific reason.'
  ],
  3:[
   'Plan or interpret a simple investigation related to '+f+'. State the observation to record, explain the science behind it and give the expected conclusion.',
   'Analyse a real-life example of '+f+'. Identify the process involved, explain one piece of evidence and justify the conclusion.'
  ],
  4:[
   'Case-based question: During an activity involving '+f+', a student records an observation. (a) Identify the concept involved. (1) (b) State one relevant observation or relationship. (1) (c) Explain the observation and predict the effect of changing one condition. (2)'
  ],
  5:[
   'Evaluate a claim about '+f+' using scientific reasoning. Include the relevant process or mechanism, supporting evidence or an equation/diagram where appropriate, and explain the effect of changing one important condition.',
   'Analyse an investigation involving '+f+' from observation to conclusion. Explain the method, identify the evidence, justify the scientific inference and state one limitation or condition that must be controlled.'
  ]
 };
 const language={
  2:[
   'Read or recall an example related to '+f+'. State its central idea or language purpose and support the answer with one relevant detail.',
   'Identify one important language feature used in '+f+' and explain its effect in context.'
  ],
  3:[
   'Analyse '+f+' in context. Explain the main idea or language feature and support your response with a relevant example.',
   'Apply the skill in '+f+' to a new communication situation and justify two important choices in your response.'
  ],
  4:[
   'Case-based question: A learner must use '+f+' in a real communication situation. (a) Identify the purpose. (1) (b) Choose an appropriate language feature. (1) (c) Write the required response and justify the choice. (2)'
  ],
  5:[
   'Write a well-organised response applying '+f+' to an unfamiliar context. Develop the main idea, use suitable language features and support the response with relevant details.',
   'Analyse the theme, message or language choices involved in '+f+' and support your interpretation with logically connected evidence.'
  ]
 };
 let extra={2:[],3:[],4:[],5:[]};
 if(subject==='Maths')extra=maths;
 else if(subject==='Science'||subject==='EVS')extra=science;
 else if(['English','Hindi','Sanskrit','Urdu'].includes(subject))extra=language;
 const scienceSpecific=subject==='Science'&&testGrade===10?class10ScienceSpecificPrompts(focus,marks):[];
 return [...scienceSpecific,...(extra[marks]||[]),...(competency[marks]||[])];
}

function selectedDescriptiveLessons(){
 const subject=$('testSubjectSelect')?.value||'';
 const chapterId=$('testChapterSelect')?.value||'';
 let lessons=testLessonsForGrade().filter(l=>l.subject===subject);
 if(chapterId)lessons=lessons.filter(l=>l.id===chapterId);
 return lessons;
}

function descriptiveFocusesFor(lesson){
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 const topics=lesson?chapterTopics(lesson):[];
 if(chapterId&&topicKey){
  const topic=topics.find(t=>t.key===topicKey);
  if(topic)return [topic.title];
 }
 const names=[...new Set(topics.map(t=>String(t.title||'').trim()).filter(Boolean))];
 return names.length?names:[lesson?.title||($('testSubjectSelect')?.value||'this topic')];
}

function lessonCheckpointQuestions(lesson){
 const source=String(lesson?.concept||'');
 return source.split(/\n+/).map(line=>line.trim()).filter(line=>/^QUESTION:\s*/i.test(line))
  .map(line=>line.replace(/^QUESTION:\s*/i,'').replace(/^\d+\.\s*/,'').trim())
  .filter(Boolean);
}

function buildDescriptiveSection(lessons,marks,count,runOffset){
 if(!lessons.length)return [];
 const candidates=[];
 lessons.forEach(lesson=>{
  descriptiveFocusesFor(lesson).forEach((focus,fi)=>{
   const prompts=descriptiveSubjectPrompts(lesson.subject,focus,marks);
   prompts.forEach((text,pi)=>candidates.push({
    lesson,focus,text,marks,key:lesson.id+':'+focus+':'+marks+':'+pi
   }));
  });
  if(marks===2||marks===3){
   lessonCheckpointQuestions(lesson).forEach((text,qi)=>{
    const suffix=marks===3?' Explain the reasoning or observation that supports your answer.':' Give a brief reason where required.';
    candidates.push({lesson,focus:lesson.title,text:text+suffix,marks,key:lesson.id+':checkpoint:'+marks+':'+qi});
   });
  }
 });
 const offset=(descriptivePaperRun*runOffset)%Math.max(1,candidates.length);
 return rotatePick(candidates,count,offset);
}

function scienceBranchForLesson(lesson){
 const chapter=Number(lesson?.sourceChapter)||(CLASS10_SCIENCE_CHAPTERS.indexOf(lesson?.title)+1);
 if([1,2,3,4].includes(chapter))return {id:'B',title:'Chemistry'};
 if([9,10,11,12].includes(chapter))return {id:'C',title:'Physics'};
 return {id:'A',title:'Biology'};
}

function descriptivePatternBlueprint(lessons){
 const subject=$('testSubjectSelect')?.value||'';
 if(testGrade===10&&subject==='Maths'){
  return [
   {id:'B',label:'SECTION B',title:'Very Short Answer',marks:2,count:5,run:3},
   {id:'C',label:'SECTION C',title:'Short Answer',marks:3,count:6,run:5},
   {id:'D',label:'SECTION D',title:'Long Answer',marks:5,count:4,run:7},
   {id:'E',label:'SECTION E',title:'Case Study Based',marks:4,count:3,run:11}
  ];
 }
 if(testGrade===10&&subject==='Science'){
  const branch=lessons.length===1?scienceBranchForLesson(lessons[0]):null;
  const prefix=branch?('SECTION '+branch.id+' · '+branch.title.toUpperCase()):'CLASS X SCIENCE';
  return [
   {id:'S2',label:prefix,title:'Very Short / Reasoning',marks:2,count:3,run:3},
   {id:'S3',label:prefix,title:'Short Answer / Application',marks:3,count:3,run:5},
   {id:'S4',label:prefix,title:'Case / Competency Based',marks:4,count:2,run:7},
   {id:'S5',label:prefix,title:'Long Answer / Analysis',marks:5,count:1,run:11}
  ];
 }
 return [
  {id:'A',label:'SECTION A',title:'Very Short Answer',marks:2,count:5,run:3},
  {id:'B',label:'SECTION B',title:'Short Answer / Application',marks:3,count:4,run:5},
  {id:'C',label:'SECTION C',title:'Long Answer / Analysis',marks:5,count:2,run:7},
  {id:'D',label:'SECTION D',title:'Case / Competency Based',marks:4,count:2,run:11}
 ];
}

function buildDescriptivePaper(){
 const lessons=selectedDescriptiveLessons();
 if(!lessons.length)return [];
 descriptivePaperRun++;
 const build=()=>descriptivePatternBlueprint(lessons).map(section=>({
  ...section,
  items:buildDescriptiveSection(lessons,section.marks,section.count,section.run)
 }));
 let sections=build();
 let signature=sections.flatMap(s=>s.items.map(x=>x.key)).join('|');
 if(signature===lastDescriptivePaperSignature){
  descriptivePaperRun++;
  sections=build();
  signature=sections.flatMap(s=>s.items.map(x=>x.key)).join('|');
 }
 lastDescriptivePaperSignature=signature;
 return sections;
}

function descriptivePatternNote(subject){
 if(testGrade===10&&subject==='Maths'){
  return 'Pattern reference: CBSE Class X Mathematics Standard Sample Question Paper '+CBSE_PATTERN_SESSION+'. This descriptive practice uses the official 2-mark, 3-mark, 5-mark and 4-mark case-study sections; the 1-mark objective section remains in Objective Quiz mode.';
 }
 if(testGrade===10&&subject==='Science'){
  return 'Pattern reference: CBSE Class X Science Sample Question Paper '+CBSE_PATTERN_SESSION+'. Questions use the current application, reasoning, case-based and multi-mark style. A chapter-wise paper is a practice subset, not the complete 39-question board paper.';
 }
 return 'CBSE-style competency practice using the current '+CBSE_PATTERN_SESSION+' approach. CBSE does not publish one board sample-paper blueprint for every lower class and subject.';
}

function descriptiveKeywords(item){
 const stop=new Set(['which','what','when','where','with','from','into','this','that','these','those','using','state','write','explain','analyse','analyze','identify','give','correct','answer','question','student','learner','reaction','process']);
 const words=(String(item.focus||'')+' '+String(item.text||'')).toLowerCase().match(/[a-z][a-z-]{3,}/g)||[];
 return [...new Set(words.filter(word=>!stop.has(word)))].slice(0,8);
}
function descriptiveModelAnswer(item){
 const terms=descriptiveKeywords(item);
 const sentences=cleanConceptSentences(item.lesson);
 const ranked=sentences.map(sentence=>{
  const lower=sentence.toLowerCase();
  let score=0;
  terms.forEach(term=>{if(lower.includes(term))score+=1;});
  if(String(item.focus||'')&&lower.includes(String(item.focus).toLowerCase()))score+=3;
  return {sentence,score};
 }).sort((a,b)=>b.score-a.score);
 const count=item.marks>=5?3:item.marks>=3?2:1;
 const chosen=ranked.filter(x=>x.score>0).slice(0,count).map(x=>x.sentence);
 if(chosen.length)return chosen.join(' ');
 if(item.lesson?.example)return String(item.lesson.example);
 const fallback=sentences.slice(0,count).map(x=>x);
 if(fallback.length)return fallback.join(' ');
 return 'A complete answer should use the correct concept, relevant subject terminology, an appropriate example or equation where required, and a justified conclusion.';
}
function descriptiveMarkingPoints(item){
 const text=String(item.text||'').toLowerCase();
 const points=[];
 if(/\bdefine|definition|what is|meaning\b/.test(text))points.push('1 mark: Correct definition or identification of the core concept.');
 else points.push('1 mark: Correct identification of the relevant concept, principle or process.');
 if(/\bequation|balance|reaction|formula|calculate|working\b/.test(text))points.push('1 mark: Correct equation, formula, calculation or essential working.');
 else if(/\bexample|observation|evidence\b/.test(text))points.push('1 mark: One correct relevant example, observation or piece of evidence.');
 else points.push('1 mark: One correct supporting fact or application.');
 if(item.marks>=3)points.push('1 mark: Clear explanation, reasoning or cause-and-effect link.');
 if(item.marks>=4)points.push('1 mark: Correct application, prediction, comparison or interpretation of the given situation.');
 if(item.marks>=5)points.push('1 mark: Complete justification or conclusion using appropriate subject terminology.');
 while(points.length<item.marks)points.push('1 mark: One additional accurate and relevant point that directly answers the question.');
 return points.slice(0,item.marks);
}
function descriptiveMarkingSchemeHtml(){
 let number=1;
 const items=activeDescriptiveSections.flatMap(section=>section.items||[]);
 return '<section class="marking-scheme-panel" id="descriptiveMarkingSchemePanel">'+
  '<h3>Marking Scheme & Model Answer Guidance</h3>'+
  '<p>This is a ThreeLittleWonders practice marking scheme structured in CBSE style for the generated questions. It is not an official CBSE marking scheme. Model-answer guidance is derived from the lesson material where available.</p>'+
  items.map(item=>{
   const q=number++;
   const points=descriptiveMarkingPoints(item);
   const model=descriptiveModelAnswer(item);
   const keywords=descriptiveKeywords(item);
   return '<details class="marking-scheme-item" '+(q===1?'open':'')+'>'+
    '<summary><span>Q'+q+'. '+safe(item.focus||item.lesson?.title||'Question')+'</span><strong>'+item.marks+' marks</strong></summary>'+
    '<div class="marking-scheme-body">'+
     '<ol class="marking-points">'+points.map(point=>'<li>'+safe(point)+'</li>').join('')+'</ol>'+
     '<div class="model-answer-box"><strong>Model answer guidance</strong><br>'+safe(model)+'</div>'+
     '<div class="examiner-keywords"><strong>Examiner keywords</strong><br>'+keywords.map(k=>'<span>'+safe(k)+'</span>').join('')+'</div>'+
    '</div>'+
   '</details>';
  }).join('')+
 '</section>';
}
function finishDescriptivePaper(){
 const host=$('descriptiveMarkingScheme');
 if(!host||!activeDescriptiveSections.length)return;
 host.hidden=false;
 host.innerHTML=descriptiveMarkingSchemeHtml();
 const button=document.querySelector('[data-finish-descriptive]');
 if(button){button.disabled=true;button.textContent='Marking Scheme Shown';}
 host.scrollIntoView({behavior:'smooth',block:'start'});
}
function renderDescriptivePaper(){
 const panel=$('testPaperPanel');
 if(!panel)return;
 stopExamTimer();
 if(!validateExamScope())return;
 const preset=currentExamPreset();
 const sections=buildDescriptivePaper();
 activeDescriptiveSections=sections;
 const subject=$('testSubjectSelect')?.value||'';
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 const chapter=LESSONS.find(l=>l.id===chapterId);
 const topic=chapter?chapterTopics(chapter).find(t=>t.key===topicKey):null;
 const scope=[gradeName(testGrade),subject,chapter&&chapter.title,topic&&topic.title].filter(Boolean).join(' · ');
 if(!sections.length||!sections.some(s=>s.items.length)){
  panel.hidden=false;
  panel.innerHTML='<div class="test-empty"><span aria-hidden="true">📝</span><h4>No descriptive paper can be created for this selection yet.</h4><p>Choose a subject or chapter that has lesson content.</p></div>';
  return;
 }
 let qNo=1,total=0;
 const body=sections.map(section=>{
  const rows=section.items.map(item=>{
   total+=item.marks;
   const n=qNo++;
   return '<article class="descriptive-question"><div class="descriptive-q-head"><span>Q'+n+'.</span><p>'+safe(item.text)+'</p><strong>'+item.marks+'</strong></div></article>';
  }).join('');
  return '<section class="descriptive-section"><div class="descriptive-section-head"><div><span>'+safe(section.label||('SECTION '+section.id))+'</span><h4>'+safe(section.title)+'</h4></div><strong>'+section.items.length+' × '+section.marks+' = '+(section.items.length*section.marks)+'</strong></div>'+rows+'</section>';
 }).join('');
 panel.hidden=false;
 panel.innerHTML='<div class="descriptive-paper">'+
  '<div class="descriptive-paper-title"><div><span>CBSE '+CBSE_PATTERN_SESSION+' QUESTION-ONLY PRACTICE PAPER</span><h3>'+safe(scope)+'</h3><p>'+safe(descriptivePatternNote(subject))+'</p></div><div class="descriptive-paper-actions"><button type="button" class="btn btn-light" data-new-descriptive>New Paper</button><button type="button" class="btn btn-secondary" data-print-descriptive>Print</button></div></div>'+
  '<div class="descriptive-meta"><span><b>Exam preset:</b> '+safe(preset.label)+'</span><span><b>Target Marks:</b> '+preset.marks+'</span><span><b>Time:</b> '+preset.minutes+' minutes</span><span><b>Generated question marks:</b> '+total+'</span><span><b>Current CBSE reference:</b> '+CBSE_PATTERN_SESSION+'</span></div>'+
  '<div class="descriptive-instructions"><strong>General Instructions</strong><ol><li>Attempt the questions according to the marks shown.</li><li>Use complete reasoning, steps, equations or diagrams wherever the question requires them.</li><li>Read application and case-based questions carefully before answering.</li><li>Finish the paper before opening the marking scheme.</li></ol></div>'+
  body+
  '<div class="descriptive-finish-row"><button type="button" class="btn btn-primary" data-finish-descriptive>Finish Exam & View Marking Scheme</button></div>'+
  '<div id="descriptiveMarkingScheme" hidden></div>'+
  '</div>';
 panel.scrollIntoView({behavior:'smooth',block:'start'});
}

function formatExamTime(seconds){
 const value=Math.max(0,Math.floor(seconds));
 const hours=Math.floor(value/3600);
 const minutes=Math.floor((value%3600)/60);
 const secs=value%60;
 return hours>0
  ?String(hours).padStart(2,'0')+':'+String(minutes).padStart(2,'0')+':'+String(secs).padStart(2,'0')
  :String(minutes).padStart(2,'0')+':'+String(secs).padStart(2,'0');
}
function updateExamTimerDisplay(){
 const el=$('examTimeRemaining');
 if(el)el.textContent=formatExamTime(examSecondsLeft);
}
function startExamTimer(minutes){
 stopExamTimer();
 examSecondsLeft=Math.max(1,Math.round(minutes*60));
 updateExamTimerDisplay();
 examTimerId=setInterval(()=>{
  examSecondsLeft=Math.max(0,examSecondsLeft-1);
  updateExamTimerDisplay();
  if(examSecondsLeft<=0){
   stopExamTimer();
   submitExamPaper(true);
  }
 },1000);
}
function examQuestionTopicKey(item){
 const selected=$('testTopicSelect')?.value||'';
 if(selected)return selected;
 const explicit=String(item?.question?.topicKey||'');
 if(explicit)return explicit;
 return 'overview';
}
function examConceptName(item){
 const topicKey=examQuestionTopicKey(item);
 if(topicKey!=='overview'){
  const topic=chapterTopics(item.lesson).find(t=>t.key===topicKey);
  if(topic)return topic.title;
 }
 return item.lesson?.title||'Concept';
}
function examGroupName(item){
 if(testGrade===10&&item.lesson?.subject==='Science')return scienceBranchForLesson(item.lesson).title;
 return item.lesson?.title||item.lesson?.subject||'Other';
}
function updateExamLiveStatus(){
 const total=activeTestItems.length;
 const answered=examAnswers.filter(v=>Number.isInteger(v)).length;
 const unanswered=Math.max(0,total-answered);
 const review=examReview.size;
 const q=$('examQuestionStatus');
 if(q)q.textContent='Question '+(examCurrentIndex+1)+' of '+total;
 const a=$('examAnsweredCount');if(a)a.textContent=answered;
 const u=$('examUnansweredCount');if(u)u.textContent=unanswered;
 const r=$('examReviewCount');if(r)r.textContent=review;
 $('examQuestionNav')?.querySelectorAll('[data-exam-nav]').forEach(button=>{
  const index=Number(button.dataset.examNav);
  button.classList.toggle('answered',Number.isInteger(examAnswers[index]));
  button.classList.toggle('review',examReview.has(index));
  button.classList.toggle('current',index===examCurrentIndex);
 });
}
function renderExamQuestion(){
 const pane=$('examQuestionPane');
 if(!pane||!activeTestItems.length)return;
 examCurrentIndex=Math.max(0,Math.min(activeTestItems.length-1,examCurrentIndex));
 const item=activeTestItems[examCurrentIndex];
 const q=item.question;
 const selected=examAnswers[examCurrentIndex];
 const marked=examReview.has(examCurrentIndex);
 const level=DIFFICULTY_LEVELS[item.difficulty]||{icon:'🧩',label:'Practice'};
 pane.innerHTML='<div class="exam-q-number">'+level.icon+' '+safe(level.label.toUpperCase())+' · QUESTION '+(examCurrentIndex+1)+'</div>'+
  '<h3>'+safe(q.text)+'</h3>'+
  '<div class="exam-option-list">'+q.options.map((option,index)=>
   '<label class="exam-option"><input type="radio" name="exam-answer" value="'+index+'" '+(selected===index?'checked':'')+'><span>'+String.fromCharCode(65+index)+'. '+safe(option)+'</span></label>'
  ).join('')+'</div>'+
  '<div class="exam-question-actions">'+
   '<button type="button" class="btn btn-light exam-review-btn '+(marked?'active':'')+'" data-exam-review>'+(marked?'★ Marked for review':'☆ Mark for review')+'</button>'+
   '<div><button type="button" class="btn btn-light" data-exam-prev '+(examCurrentIndex===0?'disabled':'')+'>← Previous</button><button type="button" class="btn btn-primary" data-exam-next>'+(examCurrentIndex===activeTestItems.length-1?'Finish':'Next →')+'</button></div>'+
  '</div>';
 updateExamLiveStatus();
}
function renderTestPaper(){
 if(!validateExamScope())return;
 const panel=$('testPaperPanel');
 if(!panel)return;
 const {items,topicFallback,difficulty}=buildTestQuestionPool();
 activeTestItems=items;
 examCurrentIndex=0;
 examAnswers=Array(items.length).fill(null);
 examReview=new Set();
 examSubmitted=false;
 lastExamWeakConcepts=[];
 const subject=$('testSubjectSelect')?.value||'';
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 const chapter=LESSONS.find(l=>l.id===chapterId);
 const topic=chapter?chapterTopics(chapter).find(t=>t.key===topicKey):null;
 const scope=[gradeName(testGrade),subject,chapter&&chapter.title,topic&&topic.title].filter(Boolean).join(' · ');
 if(!items.length){
  panel.hidden=false;
  const message=topicFallback
   ?'This Topic Test needs questions explicitly tagged to the selected topic. No chapter-level questions were substituted.'
   :'No verified MCQ questions are available for this exam selection yet.';
  panel.innerHTML='<div class="test-empty"><span aria-hidden="true">📝</span><h4>Exam cannot start yet.</h4><p>'+safe(message)+'</p></div>';
  return;
 }
 const difficultyLabel=difficulty==='all'?'Mixed difficulty':(DIFFICULTY_LEVELS[difficulty]?.icon+' '+DIFFICULTY_LEVELS[difficulty]?.label);
 const bankNote='<p class="exam-empty-bank">This MCQ exam uses '+items.length+' verified question'+(items.length===1?'':'s')+'. Each question carries 1 mark. No questions are invented to reach a fixed marks total.</p>';
 panel.hidden=false;
 panel.innerHTML='<section class="exam-mode-shell">'+
  '<div class="exam-live-bar">'+
   '<div class="exam-progress-label"><strong id="examQuestionStatus">Question 1 of '+items.length+'</strong><small>'+safe(scope)+' · '+safe(difficultyLabel)+' · '+items.length+' marks</small></div>'+
   '<div class="exam-stat exam-timer"><span>TIME REMAINING</span><strong id="examTimeRemaining">'+formatExamTime(Math.max(10,items.length)*60)+'</strong></div>'+
   '<div class="exam-stat"><span>ANSWERED</span><strong id="examAnsweredCount">0</strong></div>'+
   '<div class="exam-stat"><span>UNANSWERED</span><strong id="examUnansweredCount">'+items.length+'</strong></div>'+
   '<div class="exam-stat"><span>MARKED REVIEW</span><strong id="examReviewCount">0</strong></div>'+
   '<button type="button" class="btn exam-submit-top" data-exam-submit>Submit Exam</button>'+
  '</div>'+
  bankNote+
  '<div class="exam-body">'+
   '<aside class="exam-question-nav"><h4>QUESTION NAVIGATOR</h4><div class="exam-nav-grid" id="examQuestionNav">'+items.map((_,index)=>'<button type="button" class="exam-nav-btn '+(index===0?'current':'')+'" data-exam-nav="'+index+'">'+(index+1)+'</button>').join('')+'</div></aside>'+
   '<main class="exam-question-pane" id="examQuestionPane"></main>'+
  '</div>'+
 '</section>';
 renderExamQuestion();
 startExamTimer(Math.max(10,items.length));
 panel.scrollIntoView({behavior:'smooth',block:'start'});
}
function examPerformanceSummary(){
 const groups=new Map();
 const concepts=new Map();
 activeTestItems.forEach((item,index)=>{
  const selected=examAnswers[index];
  const correct=selected===item.question.answer;
  const group=examGroupName(item);
  const concept=examConceptName(item);
  if(!groups.has(group))groups.set(group,{correct:0,total:0});
  if(!concepts.has(concept))concepts.set(concept,{correct:0,total:0,lessonId:item.lesson.id,topicKey:examQuestionTopicKey(item)});
  groups.get(group).total++;
  concepts.get(concept).total++;
  if(correct){groups.get(group).correct++;concepts.get(concept).correct++;}
 });
 const groupRows=[...groups.entries()].map(([name,value])=>({name,...value,accuracy:Math.round(value.correct/value.total*100)})).sort((a,b)=>a.name.localeCompare(b.name));
 const conceptRows=[...concepts.entries()].map(([name,value])=>({name,...value,accuracy:Math.round(value.correct/value.total*100)})).sort((a,b)=>a.accuracy-b.accuracy||b.total-a.total);
 return {groupRows,conceptRows};
}
function generateExamRevisionPlan(){
 if(!lastExamWeakConcepts.length){
  showToast('No weak concepts were identified in this exam.');
  return;
 }
 lastExamWeakConcepts.forEach(row=>scheduleRevision(row.lessonId,row.topicKey||'overview','wrong','normal'));
 saveStudyData();
 renderStudyDashboard();
 showToast('Revision plan created. Weak concepts are scheduled for review tomorrow.');
 const button=document.querySelector('[data-generate-exam-revision]');
 if(button){button.disabled=true;button.textContent='Revision Plan Generated ✓';}
}
function submitExamPaper(autoSubmitted=false){
 if(examSubmitted||!activeTestItems.length)return;
 examSubmitted=true;
 stopExamTimer();
 const selectedTopicKey=$('testTopicSelect')?.value||'';
 let correctCount=0;
 let answered=0;
 activeTestItems.forEach((item,index)=>{
  const selected=examAnswers[index];
  const correct=selected===item.question.answer;
  const topicKey=selectedTopicKey||item.question.topicKey||'overview';
  if(Number.isInteger(selected)){
   answered++;
   if(correct)correctCount++;
   recordTopicTestChoice(item.lesson.id,topicKey,correct);
   if(!correct)saveMistake(item.lesson,topicKey,item.question,selected,'exam-mode');
  }else{
   recordTopicTestChoice(item.lesson.id,topicKey,false);
  }
 });
 const total=activeTestItems.length;
 const accuracy=Math.round(correctCount/total*100);
 const scoreMarks=correctCount;
 const {groupRows,conceptRows}=examPerformanceSummary();
 lastExamWeakConcepts=conceptRows.filter(row=>row.accuracy<80).slice(0,6);
 studyData.testAttempts.push({
  date:new Date().toISOString(),
  grade:testGrade,
  subject:$('testSubjectSelect')?.value||'',
  preset:'mcq',
  score:correctCount,
  total,
  maxMarks:total,
  accuracy
 });
 studyData.testAttempts=studyData.testAttempts.slice(-50);
 saveStudyData();
 renderStudyDashboard();
 const panel=$('testPaperPanel');
 if(!panel)return;
 const groupHtml=groupRows.map(row=>'<div class="exam-performance-row"><span>'+safe(row.name)+'</span><strong>'+row.accuracy+'%</strong></div>').join('');
 const weakHtml=lastExamWeakConcepts.length
  ?lastExamWeakConcepts.map(row=>'<div class="exam-weak-item"><span>'+safe(row.name)+'</span><b>'+row.accuracy+'%</b></div>').join('')
  :'<p class="dashboard-empty">No weak concepts detected in this attempt.</p>';
 panel.innerHTML='<section class="exam-mode-shell"><div class="exam-result-dashboard">'+
  '<div class="exam-result-hero">'+
   '<div class="exam-result-score"><div><strong>'+scoreMarks+'/'+total+'</strong><small>MCQ SCORE</small></div></div>'+
   '<div><h3>MCQ Exam Result</h3><p>Accuracy: <b>'+accuracy+'%</b> · '+correctCount+' correct · '+answered+' answered · '+(total-answered)+' unanswered'+(autoSubmitted?' · Auto-submitted when time ended':'')+'</p></div>'+
   '<div class="exam-stat"><span>MARKED REVIEW</span><strong>'+examReview.size+'</strong></div>'+
  '</div>'+
  '<div class="exam-analysis-grid">'+
   '<article class="exam-analysis-card"><h4>Performance Analysis</h4>'+groupHtml+'</article>'+
   '<article class="exam-analysis-card"><h4>Weak Concepts</h4><div class="exam-weak-list">'+weakHtml+'</div></article>'+
  '</div>'+
  '<div class="exam-result-actions"><button type="button" class="btn btn-primary" data-generate-exam-revision>Generate Revision Plan</button><button type="button" class="btn btn-secondary" data-retry-test>Try Another Paper</button></div>'+
 '</div></section>';
 panel.scrollIntoView({behavior:'smooth',block:'start'});
}
function submitTestPaper(){submitExamPaper(false);}


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
 let lessons=LESSONS.filter(l=>l.grade===state.grade&&(allSubjects||l.subject===subject)&&(!query||[l.title,l.subject,l.description,l.concept].some(t=>t.toLowerCase().includes(query))));
 if(state.grade===10&&subject==='Maths'){
  const existingMaths=new Map(LESSONS.filter(l=>l.grade===10&&l.subject==='Maths').map(l=>[String(l.title||'').toLowerCase(),l]));
  lessons=CLASS10_MATHS_CHAPTERS.map((chapter,i)=>{
   const existing=existingMaths.get(chapter.toLowerCase());
   return existing||{
    id:'10-maths-chapter-'+String(i+1).padStart(2,'0'),
    grade:10,
    subject:'Maths',
    title:chapter,
    description:'NCERT Class 10 Mathematics - Chapter '+(i+1),
    concept:'Chapter '+(i+1)+': '+chapter,
    sourceChapter:i+1,
    minutes:20,
    questions:[]
   };
  }).filter(l=>!query||[l.title,l.subject,l.description,l.concept].some(t=>String(t||'').toLowerCase().includes(query)));
 }
 if(state.grade===10&&subject==='Science'){
  const existingScience=new Map(LESSONS.filter(l=>l.grade===10&&l.subject==='Science').map(l=>[l.title,l]));
  lessons=CLASS10_SCIENCE_CHAPTERS.map((chapter,i)=>{
   const existing=[...existingScience.values()].find(l=>{
    const a=String(l.title||'').toLowerCase();
    const b=chapter.toLowerCase();
    return a===b||(i===0&&a.includes('chemical reactions'));
   });
   return existing||{
    id:'10-science-chapter-'+String(i+1).padStart(2,'0'),
    grade:10,
    subject:'Science',
    title:chapter,
    description:'Class 10 Science chapter',
    concept:'Chapter data is available in Google Drive. Main lesson content for this chapter has not yet been imported into the website.',
    sourceChapter:i+1,
    sourcePdf:'jesc'+String(101+i)+'.pdf',
    chapterStartPage:1,
    minutes:10,
    questions:[]
   };
  }).filter(l=>!query||[l.title,l.subject,l.description,l.concept].some(t=>String(t||'').toLowerCase().includes(query)));
 }
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
 const hasActivities=Array.isArray(selected.activities)&&selected.activities.length;
 const hasRhymes=Array.isArray(selected.rhymes)&&selected.rhymes.length;
 const hasStories=Array.isArray(selected.stories)&&selected.stories.length;
 const posterLesson=isNurseryListeningLesson(selected);
 const structuredLesson=hasStructuredStudyContent(selected.concept);
 const mainColumns=splitMainContent(selected.concept);
 let topicStudyContent=selected.sourcePdf?'':posterLesson
  ? '<section class="nursery-listening-poster"><div class="nursery-poster-frame"><div class="nursery-poster-loading" data-poster-loading>Loading visual lesson…</div><img data-nursery-listening-poster alt="Listening and Speaking examples for Nursery with eight illustrated activities" hidden></div><p class="nursery-poster-help">Look at each picture, listen to the question, and practise the answer aloud.</p></section>'
  : structuredLesson
    ? renderStructuredStudyContent(selected.concept,selected)
    : '<section class="topic-main-content"><div class="topic-main-columns"><div class="topic-main-column">'+safe(mainColumns[0])+'</div><div class="topic-main-column '+(!mainColumns[1]?'topic-main-column-empty':'')+'">'+(mainColumns[1]?safe(mainColumns[1]):'<span aria-hidden="true"></span>')+'</div></div>';
 if(!selected.sourcePdf&&!posterLesson&&!structuredLesson&&hasActivities){
  topicStudyContent+='<div class="lesson-activity-table topic-main-rich">'+
   selected.activities.map((row,i)=>'<div class="lesson-activity-row"><div class="lesson-activity-name"><span class="lesson-activity-number">'+(i+1)+'</span><strong>'+safe(row[0])+'</strong></div><div class="lesson-activity-example"><div class="activity-dialogue">'+safe(row[1]).replace(/\n/g,'<br>')+'</div>'+(row[2]?'<div class="activity-learning"><strong>Learning:</strong> '+safe(row[2])+'</div>':'')+'</div></div>').join('')+
   '</div>';
 }
 if(!selected.sourcePdf&&!posterLesson&&!structuredLesson&&hasRhymes){
  topicStudyContent+='<div class="rhyme-grid topic-main-rich">'+
   selected.rhymes.map((r,i)=>'<article class="rhyme-card"><span class="rich-index">'+(i+1)+'</span><h5>'+safe(r.title)+'</h5><p class="rhyme-text">'+safe(r.text).replace(/\n/g,'<br>')+'</p></article>').join('')+
   '</div>';
 }
 if(!selected.sourcePdf&&!posterLesson&&!structuredLesson&&hasStories){
  topicStudyContent+='<div class="story-list topic-main-rich">'+
   selected.stories.map((story,i)=>'<article class="story-card"><div class="story-heading"><span class="rich-index">'+(i+1)+'</span><h5>'+safe(story.title)+'</h5></div><p class="story-text">'+safe(story.text).replace(/\n\n/g,'</p><p class="story-text">').replace(/\n/g,'<br>')+'</p><div class="story-moral"><strong>Moral:</strong> '+safe(story.moral)+'</div></article>').join('')+
   '</div>';
 }
 if(!selected.sourcePdf&&!posterLesson&&!structuredLesson)topicStudyContent+='</section>';
 const richNote='';
 $('courseGrid').innerHTML=`
  <div class="topic-browser">
   <aside class="topic-list-panel" aria-label="Chapters in ${safe(subject)}">
    <div class="topic-list-header"><span>CHAPTERS</span><strong>${lessons.length}</strong></div>
    <div class="topic-list">
     ${lessons.map((l,i)=>`<button type="button" class="topic-list-item ${l.id===selected.id?'active':''}" data-topic-id="${safe(l.id)}" aria-pressed="${l.id===selected.id}">
       <span class="topic-list-number">${i+1}</span>
       <span class="topic-list-copy">${allSubjects?'<small>'+safe(l.subject)+'</small>':''}<strong>${safe(l.title)}</strong></span>
       ${(()=>{const m=chapterMastery(l),s=topicStatusInfo(m);return '<span class="topic-list-mastery mastery-'+s.key+'" title="'+s.label+'">'+m+'%</span>'})()}
      </button>`).join('')}
    </div>
   </aside>
   <article class="topic-content-panel" aria-live="polite">
    <div class="topic-content-top topic-content-top-simple ${posterLesson?'poster-topic-heading':''}">
     <div><span class="chapter-kicker">CHAPTER</span><h3 class="${posterLesson?'visually-hidden':''}">${safe(selected.title)}</h3></div>
    </div>
    ${renderChapterJourney(selected)}
    ${renderChapterTopicNavigator(selected)}
    <section class="chapter-journey-section" id="chapter-step-learn" data-journey-section="learn">
     ${journeySectionHead(1,'📖','Learn',selected.sourcePdf?'Original NCERT PDF':'Lesson content')}
     ${renderOriginalPdfPanel(selected)}
     ${!selected.sourcePdf?topicStudyContent:''}
    </section>
    ${renderUnderstandSection(selected)}
    ${selected.sourcePdf?topicStudyContent:''}
    ${renderQuickPracticeSection(selected)}
    ${renderChapterTestSection(selected)}
    ${renderReviseSection(selected)}
    ${renderMasteredSection(selected)}
    ${richNote}
   </article>
  </div>`;
 if(posterLesson){
  const posterImage=$('courseGrid').querySelector('[data-nursery-listening-poster]');
  const posterLoading=$('courseGrid').querySelector('[data-poster-loading]');
  loadNurseryListeningPoster().then(src=>{
   if(!posterImage?.isConnected)return;
   posterImage.src=src;
   posterImage.hidden=false;
   if(posterLoading)posterLoading.hidden=true;
  }).catch(()=>{
   if(posterLoading?.isConnected)posterLoading.textContent='The visual lesson could not load. Please refresh the page.';
  });
 }
 if(selected.sourcePdf)hydrateOriginalPdfViewer(selected);
 if(selected.mathFigureAtlas)hydrateMathInlineFigures(selected);
}
function renderProgress(){
 const gradeLessons=LESSONS.filter(l=>l.grade===state.grade),doneGrade=gradeLessons.filter(l=>state.completed.includes(l.id)).length;
 const validCompleted=state.completed.filter(id=>LESSONS.some(l=>l.id===id));
 const pct=gradeLessons.length?Math.round(doneGrade/gradeLessons.length*100):0;
 const stars=validCompleted.length*20;
 const account=dashboardAccount();$('navStars').textContent=account?(gradeMasteryAverage(Number(account.grade))+'%'):stars;
 $('totalStars').textContent=stars;
 $('completedCount').textContent=validCompleted.length;
 $('progressPercent').textContent=pct+'%';
 $('progressFill').style.width=pct+'%';
 $('progressSubtitle').textContent=pct===100?'You finished every starter lesson in '+gradeName(state.grade)+'! 🎉':`${doneGrade} of ${gradeLessons.length} ${gradeName(state.grade)} lessons completed`;
 renderStudyDashboard();
}
function renderAll(){
 renderGradeSelectors();
 renderSubjectFilters();
 renderCourses();
 renderProgress();
 const roadmap=$('curriculumSection');if(roadmap)roadmap.hidden=true;
 const subjectSection=$('classSubjectSection');if(subjectSection)subjectSection.hidden=classChoicesOpen;
 const learningNote=document.querySelector('.curriculum-note');if(learningNote)learningNote.hidden=classChoicesOpen;
 if(classChoicesOpen){$('lessonResultsSection').hidden=true;}
}
function openLesson(id,difficulty='all'){
 const lesson=LESSONS.find(l=>l.id===id);
 if(!lesson)return;
 touchStudyLesson(lesson.id,currentSubtopicKey);
 stopReadAloud();
 currentLesson=lesson;
 currentMistakeId='';
 currentPracticeSource='';
 currentQuizDifficulty=normaliseDifficulty(difficulty)||'all';
 currentQuizQuestions=quizQuestionsForLesson(lesson,currentQuizDifficulty);
 if(!currentQuizQuestions.length)currentQuizQuestions=quizQuestionsForLesson(lesson,'all');
 currentQuestion=0;
 questionAnswered=false;
 returnFocus=document.activeElement;
 $('lessonModal').hidden=false;
 document.body.classList.add('modal-open');
 $('lessonTitle').textContent=lesson.title;
 $('modalSubjectIcon').textContent=subjectIcon(lesson.subject);
 const level=currentQuizDifficulty==='all'?'Mixed practice':DIFFICULTY_LEVELS[currentQuizDifficulty].label;
 $('modalMeta').textContent=gradeName(lesson.grade).toUpperCase()+' · '+lesson.subject.toUpperCase()+' · '+level.toUpperCase();
 showQuiz();
 $('closeLesson').focus();
}
function stage(which){
 ['Learn','Quiz','Complete'].forEach(s=>{
  const x=$('stage'+s);
  x.classList.toggle('active',s===which);
  x.classList.toggle('done',({Learn:0,Quiz:1,Complete:2}[s]||0)<({Learn:0,Quiz:1,Complete:2}[which]||0));
 });
}
function footer(left,button,action){
 const e=$('lessonFooter');
 e.innerHTML='<span class="modal-helper">'+safe(left)+'</span><button class="btn btn-primary" id="modalAction">'+safe(button)+' <span aria-hidden="true">↗</span></button>';
 $('modalAction').addEventListener('click',action);
}
function renderRichLesson(l){
 const blocks=[];
 if(Array.isArray(l.activities)&&l.activities.length){
  blocks.push('<section class="rich-lesson-section"><h4>🗣️ Listening & Speaking Practice</h4><p class="rich-lesson-intro">Read one activity at a time. First listen to the teacher question, then practise the child response aloud.</p><div class="lesson-activity-table">'+
   l.activities.map((row,i)=>'<div class="lesson-activity-row"><div class="lesson-activity-name"><span class="lesson-activity-number">'+(i+1)+'</span><strong>'+safe(row[0])+'</strong></div><div class="lesson-activity-example"><div class="activity-dialogue">'+safe(row[1]).replace(/\n/g,'<br>')+'</div>'+(row[2]?'<div class="activity-learning"><strong>Learning:</strong> '+safe(row[2])+'</div>':'')+'</div></div>').join('')+
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
function showLearn(){
 if(!currentLesson)return;
 stage('Learn');
 const l=currentLesson;
 const rich=renderRichLesson(l);
 $('lessonBody').innerHTML='<div class="concept-label">🌱 LET\'S UNDERSTAND</div><h3>'+safe(l.title)+'</h3><p class="explain-text">'+safe(l.concept)+'</p><div class="example-card"><strong>💡 Here\'s an easy example</strong><p>'+safe(l.example)+'</p></div><div class="tip-card"><span>🌟</span><span><strong>Little challenge:</strong> '+safe(l.tip)+'</span></div>'+rich;
 footer('Step 1 of 3 · Read and discover','Try a quiz',()=>{currentQuestion=0;showQuiz()});
}
function currentQuizItem(){
 return currentQuizQuestions[currentQuestion]||null;
}
function showQuiz(){
 if(!currentLesson)return;
 stage('Quiz');
 questionAnswered=false;
 const item=currentQuizItem();
 if(!item){
  $('lessonBody').innerHTML='<div class="feedback retry">No MCQs are available for this difficulty yet.</div>';
  footer('Choose another difficulty from the chapter page.','Close',closeLesson);
  return;
 }
 const q=item.question;
 const meta=DIFFICULTY_LEVELS[item.difficulty]||{label:'Practice',icon:'🧩'};
 $('lessonBody').innerHTML='<div class="quiz-number">'+meta.icon+' '+safe(meta.label.toUpperCase())+' · QUESTION '+(currentQuestion+1)+' OF '+currentQuizQuestions.length+'</div>'+
  '<h3>'+safe(q.text)+'</h3>'+
  '<p class="explain-text">Choose the best answer. After you answer, you will see why it is correct.</p>'+
  '<div class="answer-grid">'+q.options.map((op,i)=>'<button class="answer-option" data-answer="'+i+'">'+String.fromCharCode(65+i)+'. '+safe(op)+'</button>').join('')+'</div>'+
  '<div id="quizFeedback" aria-live="polite"></div>';
 $('lessonBody').querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answer(Number(btn.dataset.answer))));
 footer('Think first, then check the explanation.','Next question',()=>{});
 $('modalAction').disabled=true;
 $('modalAction').style.opacity='.5';
}
function reviewCurrentQuizConcept(){
 if(!currentLesson)return;
 const lesson=currentLesson;
 const topicKey=currentSubtopicKey;
 closeLesson();
 state.grade=lesson.grade;
 persist();
 classChoicesOpen=false;
 subject=lesson.subject;
 currentTopicId=lesson.id;
 currentSubtopicKey=topicKey;
 window.location.hash='#explore';
 renderAll();
 requestAnimationFrame(()=>$('lessonResultsSection')?.scrollIntoView({behavior:'smooth',block:'start'}));
}
function watchCurrentQuizVideo(){
 if(!currentLesson)return;
 const topics=chapterTopics(currentLesson);
 const topic=topics.find(t=>t.key===currentSubtopicKey)||topics[0];
 if(topic)openTopicVideo(currentLesson,topic);
}
function trySimilarQuizQuestion(){
 if(!currentQuizQuestions.length)return;
 currentQuestion=(currentQuestion+1)%currentQuizQuestions.length;
 showQuiz();
}
function bindQuizFeedbackActions(){
 $('quizFeedback')?.querySelector('[data-feedback-review]')?.addEventListener('click',reviewCurrentQuizConcept);
 $('quizFeedback')?.querySelector('[data-feedback-video]')?.addEventListener('click',watchCurrentQuizVideo);
 $('quizFeedback')?.querySelector('[data-feedback-similar]')?.addEventListener('click',trySimilarQuizQuestion);
 $('quizFeedback')?.querySelectorAll('[data-confidence]').forEach(button=>button.addEventListener('click',()=>{
  if(!currentLesson)return;
  if(button.dataset.confidence==='confident')scheduleRevision(currentLesson.id,currentSubtopicKey||'overview','correct','confident');
  saveStudyData();
  renderStudyDashboard();
  $('quizFeedback')?.querySelectorAll('[data-confidence]').forEach(b=>b.disabled=true);
  button.classList.add('selected');
 }));
}
function answer(choice){
 if(!currentLesson||questionAnswered)return;
 const item=currentQuizItem();
 if(!item)return;
 const q=item.question;
 const buttons=[...$('lessonBody').querySelectorAll('[data-answer]')];
 const correct=choice===q.answer;
 questionAnswered=true;
 recordQuizChoice(currentLesson.id,correct,currentSubtopicKey||'overview');
 if(currentPracticeSource==='daily-challenge')studyData.daily.dailyChallengeDone=true;
 if(currentPracticeSource==='mystery-challenge')studyData.daily.mysteryChallengeDone=true;
 if(currentPracticeSource)saveStudyData();
 if(!correct)saveMistake(currentLesson,currentSubtopicKey||'overview',q,choice,'quiz');
 else{resolveMistakeForQuestion(currentLesson.id,q.text);if(currentMistakeId){resolveMistake(currentMistakeId);currentMistakeId='';}}

 buttons.forEach((b,i)=>{
  b.disabled=true;
  if(i===q.answer)b.classList.add('correct');
  else if(i===choice)b.classList.add('incorrect');
 });
 const correctText=String.fromCharCode(65+q.answer)+'. '+q.options[q.answer];
 const explanation=questionExplanation(currentLesson,q);
 $('quizFeedback').innerHTML=
  '<div class="mcq-explanation '+(correct?'mcq-correct':'mcq-wrong')+'">'+
   '<strong class="mcq-result">'+(correct?'✅ Correct':'❌ Incorrect')+'</strong>'+
   '<p><b>Correct answer:</b> '+safe(correctText)+'</p>'+
   '<div class="mcq-why"><b>Why?</b><p>'+safe(explanation)+'</p></div>'+
   '<div class="mcq-feedback-actions">'+
    '<button type="button" data-feedback-review>📖 Review concept</button>'+
    '<button type="button" data-feedback-video>▶ Watch video</button>'+
    '<button type="button" data-feedback-similar>🔁 Try similar question</button>'+
   '</div>'+
   (correct?'<div class="mcq-confidence"><span>How confident were you?</span><button type="button" data-confidence="normal">🙂 Need another review</button><button type="button" data-confidence="confident">😎 Confident</button></div>':'')+
  '</div>';
 bindQuizFeedbackActions();
 renderStudyDashboard();

 const last=currentQuestion===currentQuizQuestions.length-1;
 const footerButton=$('modalAction');
 footerButton.disabled=false;
 footerButton.style.opacity='1';
 footerButton.innerHTML=last?'Finish lesson ↗':'Next question ↗';
 footerButton.onclick=()=>{if(last){if(currentPracticeSource)finishPracticeSession();else completeLesson();}else{currentQuestion++;showQuiz()}};
}
function completeLesson(){if(!currentLesson)return;stage('Complete');const already=state.completed.includes(currentLesson.id);recordLessonComplete(currentLesson.id);if(!already){state.completed.push(currentLesson.id);persist();renderProgress();renderCourses()}else{renderStudyDashboard()}
 $('lessonBody').innerHTML=`<div class="celebrate"><div class="celebrate-emoji" aria-hidden="true">🎉🌟</div><h3>Wonderfully done!</h3><p>You completed <strong>${safe(currentLesson.title)}</strong>! Every little lesson takes you closer to big discoveries.</p><div class="reward">⭐ ${already?'Lesson reviewed!':'+20 stars earned!'}</div></div>`;
 footer('Keep that curious mind shining!','Explore more',()=>{closeLesson();window.location.hash='#explore';});
}
function closeLesson(){stopReadAloud();if($('lessonModal').hidden)return;$('lessonModal').hidden=true;document.body.classList.remove('modal-open');currentLesson=null;currentMistakeId='';currentPracticeSource='';if(returnFocus&&typeof returnFocus.focus==='function')returnFocus.focus()}
function continueLearning(){const next=LESSONS.find(l=>l.grade===state.grade&&!state.completed.includes(l.id))||LESSONS.find(l=>l.grade===state.grade);if(next)openLesson(next.id);else showToast('Choose a class to start learning!')}
function ensurePdfFigureViewer(){
 let viewer=$('pdfFigureViewer');
 if(viewer)return viewer;
 viewer=document.createElement('div');
 viewer.id='pdfFigureViewer';
 viewer.className='pdf-figure-viewer';
 viewer.hidden=true;
 viewer.innerHTML='<button type="button" class="pdf-figure-viewer-close" data-close-pdf-figure aria-label="Close image">×</button><div class="pdf-figure-viewer-inner"><div class="pdf-figure-viewer-media"></div><p></p></div>';
 document.body.appendChild(viewer);
 viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('[data-close-pdf-figure]'))closePdfFigure();});
 return viewer;
}
function openPdfFigure(src,caption){
 const viewer=ensurePdfFigureViewer();
 const media=viewer.querySelector('.pdf-figure-viewer-media');
 media.innerHTML='<img alt="'+safe(caption||'Science figure')+'" src="'+safe(src)+'">';
 viewer.querySelector('p').textContent=caption||'';
 viewer.hidden=false;
 document.body.classList.add('figure-viewer-open');
 viewer.querySelector('[data-close-pdf-figure]').focus();
}
function openPdfFigureSprite(button){
 const viewer=ensurePdfFigureViewer();
 const parts=String(button.dataset.pdfViewbox||'').split(',').map(Number);
 if(parts.length!==4||parts.some(Number.isNaN))return;
 const [x,y,w,h]=parts;
 const sw=Number(button.dataset.pdfSpriteWidth),sh=Number(button.dataset.pdfSpriteHeight);
 const caption=button.dataset.pdfCaption||'Science figure';
 const media=viewer.querySelector('.pdf-figure-viewer-media');
 media.innerHTML='<svg class="pdf-figure-viewer-sprite" viewBox="'+[x,y,w,h].join(' ')+'" role="img" aria-label="'+safe(caption)+'"><image href="'+safe(button.dataset.pdfSprite)+'" width="'+sw+'" height="'+sh+'"></image></svg>';
 viewer.querySelector('p').textContent=caption;
 viewer.hidden=false;
 document.body.classList.add('figure-viewer-open');
 viewer.querySelector('[data-close-pdf-figure]').focus();
}
function closePdfFigure(){
 const viewer=$('pdfFigureViewer');
 if(viewer)viewer.hidden=true;
 document.body.classList.remove('figure-viewer-open');
}
function installEvents(){
 document.querySelectorAll('a[href="#explore"]').forEach(link=>link.addEventListener('click',()=>{
  classChoicesOpen=true;
  subject='';
  query='';
  currentTopicId='';
  $('searchInput').value='';
  if(!$('lessonModal').hidden)closeLesson();
  renderAll();
  requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}));
 }));
 $('classSelect').addEventListener('change',e=>setGrade(Number(e.target.value)));
 $('gradeShortcuts').addEventListener('click',e=>{const gradeBtn=e.target.closest('[data-grade]');if(gradeBtn){setGrade(Number(gradeBtn.dataset.grade));return;}const changeBtn=e.target.closest('[data-change-class]');if(changeBtn){classChoicesOpen=true;subject='';query='';currentTopicId='';$('searchInput').value='';renderAll();requestAnimationFrame(()=>$('gradeShortcuts')?.scrollIntoView({behavior:'smooth',block:'start'}));}});
 $('subjectFilters').addEventListener('click',e=>{const btn=e.target.closest('[data-subject]');if(btn){stopReadAloud();subject=btn.dataset.subject;query='';currentTopicId='';currentSubtopicKey='';$('searchInput').value='';renderSubjectFilters();renderCourses();requestAnimationFrame(()=>$('lessonResultsSection')?.scrollIntoView({behavior:'smooth',block:'start'}))}});
 $('searchInput').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderCourses()});
 $('courseGrid').addEventListener('click',e=>{
 const step=e.target.closest('[data-chapter-step]');
 if(step){$('courseGrid')?.querySelector('[data-journey-section="'+step.dataset.chapterStep+'"]')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
 const quick=e.target.closest('[data-quick-practice]');
 if(quick){const lesson=LESSONS.find(l=>l.id===quick.dataset.quickPractice);if(lesson)openQuickPractice(lesson);return;}
 const chapterTest=e.target.closest('[data-chapter-test]');
 if(chapterTest){const lesson=LESSONS.find(l=>l.id===currentTopicId);if(lesson)openChapterTestFromLesson(lesson,chapterTest.dataset.chapterTest);return;}
 const understandVideo=e.target.closest('[data-understand-video]');
 if(understandVideo){const lesson=LESSONS.find(l=>l.id===currentTopicId);const topics=lesson?chapterTopics(lesson):[];const topic=topics.find(t=>t.key===currentSubtopicKey)||topics[0];if(lesson&&topic)openTopicVideo(lesson,topic);return;}
 const reveal=e.target.closest('[data-flashcard-reveal]');
 if(reveal){reveal.querySelector('.flashcard-front')?.setAttribute('hidden','');reveal.querySelector('.flashcard-back')?.removeAttribute('hidden');reveal.setAttribute('aria-expanded','true');reveal.parentElement?.querySelector('[data-flashcard-ratings]')?.removeAttribute('hidden');return;}
 const rating=e.target.closest('[data-flashcard-rate]');
 if(rating){const lesson=LESSONS.find(l=>l.id===currentTopicId);const card=lesson?flashcardsForLesson(lesson).find(c=>c.id===rating.dataset.flashcardId):null;if(lesson&&card)rateFlashcard(lesson,card,rating.dataset.flashcardRate);return;}
 const dashboardLink=e.target.closest('[data-open-learning-dashboard]');
 if(dashboardLink){window.location.hash='#my-learning';return;}
 const concept=e.target.closest('[data-concept-topic]');if(concept){stopReadAloud();currentSubtopicKey=concept.dataset.conceptTopic;touchStudyLesson(currentTopicId,currentSubtopicKey);renderCourses();requestAnimationFrame(()=>$('courseGrid')?.querySelector('.chapter-topics-block')?.scrollIntoView({behavior:'smooth',block:'start'}));return;}const video=e.target.closest('[data-topic-video]');if(video){const lesson=LESSONS.find(l=>l.id===currentTopicId);const topic=lesson?chapterTopics(lesson).find(t=>t.key===video.dataset.topicVideo):null;if(lesson&&topic)openTopicVideo(lesson,topic);return;}const sprite=e.target.closest('[data-pdf-sprite]');if(sprite){openPdfFigureSprite(sprite);return;}const figure=e.target.closest('[data-pdf-image]');if(figure){openPdfFigure(figure.dataset.pdfImage,figure.dataset.pdfCaption);return;}const topic=e.target.closest('[data-topic-id]');if(topic){stopReadAloud();currentTopicId=topic.dataset.topicId;currentSubtopicKey='';currentFlashcardId='';touchStudyLesson(currentTopicId);renderCourses();return;}const subtopic=e.target.closest('[data-subtopic-key]');if(subtopic){stopReadAloud();currentSubtopicKey=subtopic.dataset.subtopicKey;touchStudyLesson(currentTopicId,currentSubtopicKey);if(subtopic.dataset.pageUnverified==='true')showToast('This topic is listed, but its PDF page has not been verified yet. No page number was guessed.');renderCourses();return;}const aloud=e.target.closest('[data-read-aloud]');if(aloud){readAloudLesson(aloud.dataset.readAloud,aloud);return;}const quiz=e.target.closest('[data-start-quiz]');if(quiz)openLesson(quiz.dataset.startQuiz,quiz.dataset.quizDifficulty||'all');});
 $('testClassGrid')?.addEventListener('click',e=>{const button=e.target.closest('[data-test-grade]');if(button)openTestBuilder(Number(button.dataset.testGrade));});
 $('testChangeClassBtn')?.addEventListener('click',()=>{resetTestPaper();const scope=$('testScopeControls');if(scope)scope.hidden=true;$('testBuilder').hidden=true;$('testClassGrid')?.scrollIntoView({behavior:'smooth',block:'start'});});
 $('testModeChoice')?.addEventListener('click',e=>{const button=e.target.closest('[data-test-mode]');if(button)chooseTestMode(button.dataset.testMode);});
 $('testExamPresetChoice')?.addEventListener('click',e=>{const button=e.target.closest('[data-exam-preset]');if(button)selectExamPreset(button.dataset.examPreset);});
 $('testSubjectSelect')?.addEventListener('change',populateTestChapters);
 $('testChapterSelect')?.addEventListener('change',populateTestTopics);
 $('testTopicSelect')?.addEventListener('change',()=>{resetTestPaper();applyExamPresetScope();updateTestScopeNote();});
 $('testDifficultySelect')?.addEventListener('change',()=>{resetTestPaper();updateTestScopeNote();});
 $('generateTestBtn')?.addEventListener('click',()=>{if(($('testPaperTypeSelect')?.value||'objective')==='descriptive')renderDescriptivePaper();else renderTestPaper();});
 $('testPaperPanel')?.addEventListener('change',e=>{
  if(e.target.matches('input[name="exam-answer"]')){
   examAnswers[examCurrentIndex]=Number(e.target.value);
   updateExamLiveStatus();
  }
 });
 $('testPaperPanel')?.addEventListener('submit',e=>{if(e.target.id==='testPaperForm'){e.preventDefault();submitTestPaper();}});
 $('testPaperPanel')?.addEventListener('click',e=>{
  const nav=e.target.closest('[data-exam-nav]');
  if(nav){examCurrentIndex=Number(nav.dataset.examNav);renderExamQuestion();return;}
  if(e.target.closest('[data-exam-prev]')){examCurrentIndex=Math.max(0,examCurrentIndex-1);renderExamQuestion();return;}
  if(e.target.closest('[data-exam-next]')){
   if(examCurrentIndex>=activeTestItems.length-1)submitExamPaper(false);
   else{examCurrentIndex++;renderExamQuestion();}
   return;
  }
  if(e.target.closest('[data-exam-review]')){
   if(examReview.has(examCurrentIndex))examReview.delete(examCurrentIndex);else examReview.add(examCurrentIndex);
   renderExamQuestion();
   return;
  }
  if(e.target.closest('[data-exam-submit]')){submitExamPaper(false);return;}
  if(e.target.closest('[data-generate-exam-revision]')){generateExamRevisionPlan();return;}
  if(e.target.closest('[data-finish-descriptive]')){finishDescriptivePaper();return;}
  if(e.target.closest('[data-retry-test]')){renderTestPaper();return;}
  if(e.target.closest('[data-new-descriptive]')){renderDescriptivePaper();return;}
  if(e.target.closest('[data-print-descriptive]')){window.print();return;}
  const review=e.target.closest('[data-review-test-lesson]');if(review)openDashboardLesson(review.dataset.reviewTestLesson,review.dataset.reviewTestTopic||'');
 });
 $('dailyChallengeBtn')?.addEventListener('click',()=>{const account=dashboardAccount();if(!account)return;const item=challengeItemForToday(Number(account.grade),'daily');if(item)openChallengeItem(item,'daily-challenge');});
 $('mysteryChallengeBtn')?.addEventListener('click',()=>{const account=dashboardAccount();if(!account)return;const item=challengeItemForToday(Number(account.grade),'mystery');if(item)openChallengeItem(item,'mystery-challenge');});
 $('homeContinueBtn')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.dashboardLesson;if(id)openDashboardLesson(id,e.currentTarget.dataset.dashboardTopic||'');});
 $('dashboardContinueBtn')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.dashboardLesson;if(id)openDashboardLesson(id,e.currentTarget.dataset.dashboardTopic||'');});
 $('dashboardWeakTopics')?.addEventListener('click',e=>{const button=e.target.closest('[data-dashboard-lesson]');if(button)openDashboardLesson(button.dataset.dashboardLesson,button.dataset.dashboardTopic||'');});
 $('dashboardStrongTopics')?.addEventListener('click',e=>{const button=e.target.closest('[data-dashboard-lesson]');if(button)openDashboardLesson(button.dataset.dashboardLesson,button.dataset.dashboardTopic||'');});
 $('dashboardReviseBtn')?.addEventListener('click',()=>{
  const account=dashboardAccount();if(!account)return;
  const due=revisionCandidates(Number(account.grade));
  const row=due[0];
  if(!row){showToast('No topics are due for revision today. Keep learning!');return;}
  const mistake=activeMistakesForGrade(Number(account.grade)).find(m=>m.lessonId===row.lesson.id&&(m.topicKey||'overview')===row.topic.key);
  if(mistake)openMistakeRetry(mistake.id);
  else openDashboardLesson(row.lesson.id,row.topic.key);
 });
 window.addEventListener('tlw-auth-change',event=>{
  renderStudyDashboard();
  if(event.detail?.loggedIn)hydrateCloudLearning();
  else resetCloudHydration();
 });
 window.addEventListener('tlw-cloud-auth-state',event=>{
  if(event.detail?.loggedIn)hydrateCloudLearning();
  else resetCloudHydration();
 });
 window.addEventListener('tlw-cloud-ready',()=>hydrateCloudLearning());
 $('dashboardRevisionPlan')?.addEventListener('click',e=>{
  const button=e.target.closest('[data-dashboard-lesson]');if(!button)return;
  const account=dashboardAccount();
  const mistake=account?activeMistakesForGrade(Number(account.grade)).find(m=>m.lessonId===button.dataset.dashboardLesson&&(m.topicKey||'overview')===(button.dataset.dashboardTopic||'overview')):null;
  if(mistake)openMistakeRetry(mistake.id);
  else openDashboardLesson(button.dataset.dashboardLesson,button.dataset.dashboardTopic||'');
 });
 $('dashboardMistakes')?.addEventListener('click',e=>{
  const retry=e.target.closest('[data-mistake-retry]');
  const review=e.target.closest('[data-mistake-review]');
  const video=e.target.closest('[data-mistake-video]');
  if(retry){openMistakeRetry(retry.dataset.mistakeRetry);return;}
  if(review){
   const m=studyData.mistakes.find(x=>x.id===review.dataset.mistakeReview);
   if(m)openDashboardLesson(m.lessonId,m.topicKey||'');
   return;
  }
  if(video){
   const m=studyData.mistakes.find(x=>x.id===video.dataset.mistakeVideo);
   if(!m)return;
   const lesson=LESSONS.find(l=>l.id===m.lessonId);
   const topic=lesson?chapterTopics(lesson).find(t=>t.key===m.topicKey)||chapterTopics(lesson)[0]:null;
   if(lesson&&topic)openTopicVideo(lesson,topic);
  }
 });
 window.addEventListener('hashchange',renderHomeLearningDashboard);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHomeLearningDashboard();});
 $('clearFiltersBtn').addEventListener('click',()=>{query='';$('searchInput').value='';renderCourses()});
 $('continueBtn').addEventListener('click',continueLearning);
 $('closeLesson').addEventListener('click',closeLesson);
 $('lessonModal').addEventListener('click',e=>{if(e.target===$('lessonModal'))closeLesson()});
 $('topicVideoClose')?.addEventListener('click',closeTopicVideo);
 $('topicVideoModal')?.addEventListener('click',e=>{if(e.target===$('topicVideoModal'))closeTopicVideo();});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('topicVideoModal')&&!$('topicVideoModal').hidden){closeTopicVideo();return;}const viewer=$('pdfFigureViewer');if(viewer&&!viewer.hidden){closePdfFigure();return;}if(!$('lessonModal').hidden)closeLesson();}});
 $('mobileMenuBtn').addEventListener('click',()=>{const menu=$('mobileMenu');menu.hidden=!menu.hidden;$('mobileMenuBtn').setAttribute('aria-expanded',String(!menu.hidden));$('mobileMenuBtn').textContent=menu.hidden?'☰':'✕'});
 $('mobileMenu').addEventListener('click',e=>{if(e.target.closest('a')){$('mobileMenu').hidden=true;$('mobileMenuBtn').setAttribute('aria-expanded','false');$('mobileMenuBtn').textContent='☰'}});
}
$('currentYear').textContent=new Date().getFullYear();
Promise.resolve(window.TLW_DRIVE_READY).catch(()=>false).finally(()=>{
 renderAll();
 renderTestSeriesClasses();
 renderStudyDashboard();
 hydrateCloudLearning();
 startStudyTimeTracking();
 installEvents();
});
})();