(()=>{
'use strict';
const LESSONS=window.TLW_LESSONS||[];
const SUBJECTS=window.TLW_SUBJECTS||{};
const STORE_KEY='Threelittlewonders-progress-v1';
const LEGACY_STORE_KEY='threeelittlewonders-progress-v1';
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
let state=load(),subject='',query='',classChoicesOpen=true,currentTopicId='',currentSubtopicKey='',currentLesson=null,currentQuestion=0,questionAnswered=false,returnFocus=null,toastTimer;
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch{showToast('Progress cannot be saved in this browser.')}}
const gradeName=g=>g===-2?'Nursery':g===-1?'LKG':g===0?'UKG':`Class ${g}`;
const subjectIcon=s=>SUBJECTS[s]?.icon||'📚';
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
 const preferredOrder={English:0,Hindi:1,Sanskrit:2,Urdu:3,Maths:4,Science:5,EVS:6,'Social Science':7,Computer:8,'General Knowledge':9};
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
 return '<section class="chapter-topics-block"><div class="chapter-topics-heading"><span>TOPICS IN THIS CHAPTER</span><strong>'+topics.length+'</strong></div><div class="chapter-topic-buttons">'+topics.map((t,i)=>
  '<article class="chapter-topic-card '+(active&&active.key===t.key?'active':'')+'">'+
   '<button type="button" class="chapter-topic-button" data-subtopic-key="'+safe(t.key)+'" '+(t.page===null?'data-page-unverified="true"':'data-pdf-page="'+t.page+'"')+'><span>'+(i+1)+'</span><strong>'+safe(t.title)+'</strong></button>'+
   '<div class="chapter-topic-meta">'+
    (t.page!==null?'<small>PDF p. '+t.page+'</small>':'<small>Page verification pending</small>')+
    '<button type="button" class="topic-video-button" data-topic-video="'+safe(t.key)+'">▶ Watch Video</button>'+
   '</div>'+
  '</article>'
 ).join('')+'</div></section>';
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
function resetTestPaper(){
 activeTestItems=[];
 const panel=$('testPaperPanel');
 if(panel){panel.hidden=true;panel.innerHTML='';}
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
  select.disabled=false;
  select.innerHTML='<option value="">All topics</option>'+topics.map(t=>
   '<option value="'+safe(t.key)+'">'+safe(t.title)+'</option>'
  ).join('');
 }
 updateTestScopeNote();
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
 if(paperType==='descriptive'){
  const pattern=testGrade===10?'Current CBSE reference: 2026-27. ':'';
  note.textContent=pattern+'Paper scope: '+scope+'. Questions only, with competency, reasoning and case-based styles. A different question set is generated on each new start.';
 }else{
  note.textContent='Paper scope: '+scope+'. Up to 10 available objective questions will be used.';
 }
 const start=$('generateTestBtn');
 if(start)start.innerHTML=(paperType==='descriptive'?'Begin Descriptive Exam':'Begin MCQ Test')+' <span aria-hidden="true">↗</span>';
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
 resetTestPaper();
 scope.hidden=false;
 if(modeChoice)modeChoice.querySelectorAll('[data-test-mode]').forEach(button=>{
  button.classList.toggle('selected',button.dataset.testMode===paperType.value);
 });
 populateTestSubjects();
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
 let lessons=testLessonsForGrade().filter(l=>l.subject===subject);
 if(chapterId)lessons=lessons.filter(l=>l.id===chapterId);
 let items=lessons.flatMap(lesson=>validLessonQuestions(lesson).map((question,index)=>({lesson,question,index})));
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
  else topicFallback=true;
 }
 return {items:shuffledTestItems(items).slice(0,10),topicFallback};
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

function renderDescriptivePaper(){
 const panel=$('testPaperPanel');
 if(!panel)return;
 const sections=buildDescriptivePaper();
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
  '<div class="descriptive-meta"><span><b>Maximum Marks:</b> '+total+'</span><span><b>Current CBSE reference:</b> '+CBSE_PATTERN_SESSION+'</span><span><b>Questions change:</b> Every new start</span></div>'+
  '<div class="descriptive-instructions"><strong>General Instructions</strong><ol><li>Attempt the questions according to the marks shown.</li><li>Use complete reasoning, steps, equations or diagrams wherever the question requires them.</li><li>Read application and case-based questions carefully before answering.</li></ol></div>'+
  body+
  '</div>';
 panel.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderTestPaper(){
 const panel=$('testPaperPanel');
 if(!panel)return;
 const {items,topicFallback}=buildTestQuestionPool();
 activeTestItems=items;
 const subject=$('testSubjectSelect')?.value||'';
 const chapterId=$('testChapterSelect')?.value||'';
 const topicKey=$('testTopicSelect')?.value||'';
 const chapter=LESSONS.find(l=>l.id===chapterId);
 const topic=chapter?chapterTopics(chapter).find(t=>t.key===topicKey):null;
 const scope=[gradeName(testGrade),subject,chapter&&chapter.title,topic&&topic.title].filter(Boolean).join(' · ');
 if(!items.length){
  panel.hidden=false;
  panel.innerHTML='<div class="test-empty"><span aria-hidden="true">📝</span><h4>No test questions are available for this selection yet.</h4><p>Choose another subject or chapter with an existing quiz question bank.</p></div>';
  return;
 }
 const fallbackNote=topicFallback?'<p class="test-paper-note">This topic does not yet have separately tagged questions, so the paper uses the available questions from its chapter.</p>':'';
 panel.hidden=false;
 panel.innerHTML='<div class="test-paper-head"><div><span>TEST PAPER</span><h3>'+safe(scope)+'</h3><p>'+items.length+' questions · 1 mark each</p></div><strong>'+items.length+' marks</strong></div>'+
  fallbackNote+
  '<form id="testPaperForm" class="test-paper-form">'+items.map((item,i)=>
   '<fieldset class="test-question-card" data-test-question="'+i+'"><legend><span>'+(i+1)+'</span>'+safe(item.question.text)+'</legend>'+
   '<div class="test-option-list">'+item.question.options.map((option,oi)=>
    '<label class="test-option"><input type="radio" name="test-q-'+i+'" value="'+oi+'"><span>'+String.fromCharCode(65+oi)+'. '+safe(option)+'</span></label>'
   ).join('')+'</div><div class="test-question-feedback" data-test-feedback="'+i+'"></div></fieldset>'
  ).join('')+
  '<div class="test-submit-row"><span>Answer all questions, then submit your test.</span><button type="submit" class="btn btn-primary">Submit Test</button></div>'+
  '</form><div class="test-result" id="testResult" hidden></div>';
 panel.scrollIntoView({behavior:'smooth',block:'start'});
}
function submitTestPaper(){
 if(!activeTestItems.length)return;
 let score=0,answered=0;
 activeTestItems.forEach((item,i)=>{
  const checked=document.querySelector('input[name="test-q-'+i+'"]:checked');
  const card=document.querySelector('[data-test-question="'+i+'"]');
  const feedback=document.querySelector('[data-test-feedback="'+i+'"]');
  if(checked){
   answered++;
   const selected=Number(checked.value);
   if(selected===item.question.answer){score++;card?.classList.add('test-correct');}
   else card?.classList.add('test-wrong');
  }else{
   card?.classList.add('test-unanswered');
  }
  if(feedback){
   feedback.textContent='Correct answer: '+String.fromCharCode(65+item.question.answer)+'. '+item.question.options[item.question.answer];
  }
 });
 document.querySelectorAll('#testPaperForm input').forEach(input=>input.disabled=true);
 const submit=document.querySelector('#testPaperForm button[type="submit"]');
 if(submit)submit.disabled=true;
 const result=$('testResult');
 if(result){
  const percent=Math.round(score/activeTestItems.length*100);
  result.hidden=false;
  result.innerHTML='<div><span>YOUR SCORE</span><strong>'+score+' / '+activeTestItems.length+'</strong><p>'+percent+'% · '+answered+' answered</p></div><button type="button" class="btn btn-secondary" data-retry-test>Try Again</button>';
  result.scrollIntoView({behavior:'smooth',block:'center'});
 }
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
 let lessons=LESSONS.filter(l=>l.grade===state.grade&&(allSubjects||l.subject===subject)&&(!query||[l.title,l.subject,l.description,l.concept].some(t=>t.toLowerCase().includes(query))));
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
       ${state.completed.includes(l.id)?'<span class="topic-list-done" title="Completed">✓</span>':''}
      </button>`).join('')}
    </div>
   </aside>
   <article class="topic-content-panel" aria-live="polite">
    <div class="topic-content-top topic-content-top-simple ${posterLesson?'poster-topic-heading':''}">
     <div><span class="chapter-kicker">CHAPTER</span><h3 class="${posterLesson?'visually-hidden':''}">${safe(selected.title)}</h3></div>
    </div>
    ${renderChapterTopicNavigator(selected)}
    ${renderOriginalPdfPanel(selected)}
    ${topicStudyContent}
    ${richNote}
    <div class="topic-content-actions">
     <span class="topic-read-status">${done?'✓ Quiz completed':(selected.sourcePdf?'Original PDF is the authoritative chapter content.':(Array.isArray(selected.questions)&&selected.questions.length?'Quiz questions are based on the lesson material.':'Chapter topic added. Detailed content will be imported from Google Drive.'))}</span>
     <div class="topic-action-buttons">
      <button type="button" class="btn btn-secondary read-aloud-btn" data-read-aloud="${safe(selected.id)}">🔊 Read Aloud</button>
      ${Array.isArray(selected.questions)&&selected.questions.length?'<button type="button" class="btn btn-primary topic-quiz-btn" data-start-quiz="'+safe(selected.id)+'">🧩 Quiz Test</button>':''}
     </div>
    </div>
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
 $('navStars').textContent=stars;
 $('totalStars').textContent=stars;
 $('completedCount').textContent=validCompleted.length;
 $('progressPercent').textContent=pct+'%';
 $('progressFill').style.width=pct+'%';
 $('progressSubtitle').textContent=pct===100?'You finished every starter lesson in '+gradeName(state.grade)+'! 🎉':`${doneGrade} of ${gradeLessons.length} ${gradeName(state.grade)} lessons completed`;
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
function openLesson(id){const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;stopReadAloud();currentLesson=lesson;currentQuestion=0;questionAnswered=false;returnFocus=document.activeElement;$('lessonModal').hidden=false;document.body.classList.add('modal-open');$('lessonTitle').textContent=lesson.title;$('modalSubjectIcon').textContent=subjectIcon(lesson.subject);$('modalMeta').textContent=`${gradeName(lesson.grade).toUpperCase()} · ${lesson.subject.toUpperCase()} · QUIZ FROM THIS TOPIC`;
 showQuiz();$('closeLesson').focus();}
function stage(which){['Learn','Quiz','Complete'].forEach(s=>{const x=$('stage'+s);x.classList.toggle('active',s===which);x.classList.toggle('done',({Learn:0,Quiz:1,Complete:2}[s]||0)<({Learn:0,Quiz:1,Complete:2}[which]||0))})}
function footer(left,button,action){const e=$('lessonFooter');e.innerHTML=`<span class="modal-helper">${safe(left)}</span><button class="btn btn-primary" id="modalAction">${safe(button)} <span aria-hidden="true">↗</span></button>`; $('modalAction').addEventListener('click',action)}
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
function showLearn(){if(!currentLesson)return;stage('Learn');const l=currentLesson;
 const rich=renderRichLesson(l);
 $('lessonBody').innerHTML=`<div class="concept-label">🌱 LET'S UNDERSTAND</div><h3>${safe(l.title)}</h3><p class="explain-text">${safe(l.concept)}</p><div class="example-card"><strong>💡 Here's an easy example</strong><p>${safe(l.example)}</p></div><div class="tip-card"><span>🌟</span><span><strong>Little challenge:</strong> ${safe(l.tip)}</span></div>${rich}`;
 footer('Step 1 of 3 · Read and discover','Try a quiz',()=>{currentQuestion=0;showQuiz()});}
function showQuiz(){if(!currentLesson)return;stage('Quiz');questionAnswered=false;const q=currentLesson.questions[currentQuestion];
 $('lessonBody').innerHTML=`<div class="quiz-number">🧩 QUICK QUIZ · QUESTION ${currentQuestion+1} OF ${currentLesson.questions.length}</div><h3>${safe(q.text)}</h3><p class="explain-text">Answer using what you just studied in this topic.</p><div class="answer-grid">${q.options.map((op,i)=>`<button class="answer-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${safe(op)}</button>`).join('')}</div><div id="quizFeedback" aria-live="polite"></div>`;
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
function closeLesson(){stopReadAloud();if($('lessonModal').hidden)return;$('lessonModal').hidden=true;document.body.classList.remove('modal-open');currentLesson=null;if(returnFocus&&typeof returnFocus.focus==='function')returnFocus.focus()}
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
 $('courseGrid').addEventListener('click',e=>{const video=e.target.closest('[data-topic-video]');if(video){const lesson=LESSONS.find(l=>l.id===currentTopicId);const topic=lesson?chapterTopics(lesson).find(t=>t.key===video.dataset.topicVideo):null;if(lesson&&topic)openTopicVideo(lesson,topic);return;}const sprite=e.target.closest('[data-pdf-sprite]');if(sprite){openPdfFigureSprite(sprite);return;}const figure=e.target.closest('[data-pdf-image]');if(figure){openPdfFigure(figure.dataset.pdfImage,figure.dataset.pdfCaption);return;}const topic=e.target.closest('[data-topic-id]');if(topic){stopReadAloud();currentTopicId=topic.dataset.topicId;currentSubtopicKey='';renderCourses();return;}const subtopic=e.target.closest('[data-subtopic-key]');if(subtopic){stopReadAloud();currentSubtopicKey=subtopic.dataset.subtopicKey;if(subtopic.dataset.pageUnverified==='true')showToast('This topic is listed, but its PDF page has not been verified yet. No page number was guessed.');renderCourses();return;}const aloud=e.target.closest('[data-read-aloud]');if(aloud){readAloudLesson(aloud.dataset.readAloud,aloud);return;}const quiz=e.target.closest('[data-start-quiz]');if(quiz)openLesson(quiz.dataset.startQuiz);});
 $('testClassGrid')?.addEventListener('click',e=>{const button=e.target.closest('[data-test-grade]');if(button)openTestBuilder(Number(button.dataset.testGrade));});
 $('testChangeClassBtn')?.addEventListener('click',()=>{resetTestPaper();const scope=$('testScopeControls');if(scope)scope.hidden=true;$('testBuilder').hidden=true;$('testClassGrid')?.scrollIntoView({behavior:'smooth',block:'start'});});
 $('testModeChoice')?.addEventListener('click',e=>{const button=e.target.closest('[data-test-mode]');if(button)chooseTestMode(button.dataset.testMode);});
 $('testSubjectSelect')?.addEventListener('change',populateTestChapters);
 $('testChapterSelect')?.addEventListener('change',populateTestTopics);
 $('testTopicSelect')?.addEventListener('change',()=>{resetTestPaper();updateTestScopeNote();});
 $('generateTestBtn')?.addEventListener('click',()=>{if(($('testPaperTypeSelect')?.value||'objective')==='descriptive')renderDescriptivePaper();else renderTestPaper();});
 $('testPaperPanel')?.addEventListener('submit',e=>{if(e.target.id==='testPaperForm'){e.preventDefault();submitTestPaper();}});
 $('testPaperPanel')?.addEventListener('click',e=>{
  if(e.target.closest('[data-retry-test]'))renderTestPaper();
  if(e.target.closest('[data-new-descriptive]'))renderDescriptivePaper();
  if(e.target.closest('[data-print-descriptive]'))window.print();
 });
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
 installEvents();
});
})();