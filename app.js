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
function lessonSpeechText(lesson){
 const cleanConcept=String(lesson.concept||'').replace(/^##\s+/gm,'').replace(/^EQ:\s*/gm,'').replace(/^-\s+/gm,'');
 const parts=[lesson.title,cleanConcept];
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
function renderChapterTopicNavigator(lesson){
 const topics=chapterTopics(lesson);
 if(!topics.length)return '';
 const active=topics.find(t=>t.key===currentSubtopicKey)||null;
 return '<section class="chapter-topics-block"><div class="chapter-topics-heading"><span>TOPICS IN THIS CHAPTER</span><strong>'+topics.length+'</strong></div><div class="chapter-topic-buttons">'+topics.map((t,i)=>'<button type="button" class="chapter-topic-button '+(active&&active.key===t.key?'active':'')+'" data-subtopic-key="'+safe(t.key)+'" '+(t.page===null?'data-page-unverified="true"':'data-pdf-page="'+t.page+'"')+'><span>'+(i+1)+'</span><strong>'+safe(t.title)+'</strong>'+(t.page!==null?'<small>PDF p. '+t.page+'</small>':'<small>Page verification pending</small>')+'</button>').join('')+'</div></section>';
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
 if(!url)return '<section class="original-pdf-panel original-pdf-unavailable"><div><strong>Original PDF</strong><p>No verified source PDF has been assigned to this chapter yet.</p></div></section>';
 const topics=chapterTopics(lesson);
 const active=topics.find(t=>t.key===currentSubtopicKey)||null;
 const page=active&&Number.isInteger(active.page)?active.page:(Number.isInteger(lesson.chapterStartPage)?lesson.chapterStartPage:1);
 const verified=!!(active&&Number.isInteger(active.page));
 return '<section class="original-pdf-panel full-fidelity-pdf" data-pdf-viewer data-pdf-url="'+safe(url)+'" data-pdf-file="'+safe(lesson.sourcePdf)+'" data-pdf-page="'+page+'">'+
   '<div class="original-pdf-toolbar"><div><span>ORIGINAL PDF · FULL PAGE</span><strong>'+safe(lesson.sourcePdf)+'</strong><small>'+(active?(verified?'Verified topic page: '+page:'Topic page has not been verified. Showing the chapter start page without guessing.'):'Chapter PDF · use Previous/Next to read every page')+'</small></div>'+
   '<div class="pdf-viewer-actions"><button type="button" data-pdf-prev aria-label="Previous PDF page">‹</button><span data-pdf-page-status>Page '+page+'</span><button type="button" data-pdf-next aria-label="Next PDF page">›</button><button type="button" data-pdf-zoom-out aria-label="Zoom out">−</button><button type="button" data-pdf-zoom-in aria-label="Zoom in">+</button><a class="pdf-open-original" href="'+safe(url+'#page='+page)+'" target="_blank" rel="noopener">Open original PDF ↗</a></div></div>'+
   '<div class="pdf-canvas-scroll"><div class="pdf-loading" data-pdf-loading>Loading original textbook page…</div><canvas class="original-pdf-canvas" data-pdf-canvas hidden></canvas><div class="pdf-native-fallback" data-pdf-fallback hidden></div></div>'+
   '<p class="pdf-fidelity-note" data-pdf-note>All textbook text, diagrams, tables and images are shown from the original PDF. Only a verified barcode/QR area is hidden when present.</p>'+
  '</section>';
}
function hydrateOriginalPdfViewer(lesson){
 const host=$('courseGrid')?.querySelector('[data-pdf-viewer]');
 if(!host||!lesson?.sourcePdf)return;
 const url=host.dataset.pdfUrl;
 const filename=host.dataset.pdfFile;
 let pageNumber=Math.max(1,Number(host.dataset.pdfPage)||1);
 let zoom=1;
 let renderToken=0;
 const canvas=host.querySelector('[data-pdf-canvas]');
 const loading=host.querySelector('[data-pdf-loading]');
 const fallback=host.querySelector('[data-pdf-fallback]');
 const status=host.querySelector('[data-pdf-page-status]');
 const note=host.querySelector('[data-pdf-note]');
 const prev=host.querySelector('[data-pdf-prev]');
 const next=host.querySelector('[data-pdf-next]');
 const zoomIn=host.querySelector('[data-pdf-zoom-in]');
 const zoomOut=host.querySelector('[data-pdf-zoom-out]');
 function nativeFallback(message){
  if(loading)loading.hidden=true;
  if(canvas)canvas.hidden=true;
  if(fallback){
   fallback.hidden=false;
   const sourceUrl=url+'#page='+pageNumber+'&view=FitH';
   const googleViewer='https://docs.google.com/gview?embedded=1&url='+encodeURIComponent(url)+'#page='+pageNumber;
   fallback.innerHTML='<p>'+safe(message||'Showing the original PDF through the compatibility viewer.')+'</p><iframe class="original-pdf-frame" title="Original PDF for '+safe(lesson.title)+'" src="'+safe(googleViewer)+'" loading="eager" referrerpolicy="no-referrer"></iframe><div class="pdf-fallback-actions"><a href="'+safe(sourceUrl)+'" target="_blank" rel="noopener">Open original PDF in a new tab ↗</a></div>';
  }
  if(note)note.textContent='The source PDF is shown directly because the browser could not use the full-page renderer. No textbook content is removed.';
 }
 async function getDocument(){
  if(originalPdfCache.has(url))return originalPdfCache.get(url);
  if(!window.pdfjsLib)throw new Error('PDF renderer unavailable');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const promise=window.pdfjsLib.getDocument({url,withCredentials:false}).promise.catch(err=>{originalPdfCache.delete(url);throw err;});
  originalPdfCache.set(url,promise);
  return promise;
 }
 async function renderPage(target){
  const token=++renderToken;
  if(loading){loading.hidden=false;loading.textContent='Loading original textbook page…';}
  if(fallback)fallback.hidden=true;
  try{
   const doc=await getDocument();
   if(token!==renderToken||!host.isConnected)return;
   pageNumber=Math.min(Math.max(1,target),doc.numPages);
   const page=await doc.getPage(pageNumber);
   if(token!==renderToken||!host.isConnected)return;
   const base=page.getViewport({scale:1});
   const containerWidth=Math.max(280,host.querySelector('.pdf-canvas-scroll')?.clientWidth||base.width);
   const cssScale=Math.min(2.4,Math.max(.55,(containerWidth/base.width)*zoom));
   const pixelRatio=Math.min(2.25,window.devicePixelRatio||1);
   const viewport=page.getViewport({scale:cssScale*pixelRatio});
   canvas.width=Math.ceil(viewport.width);
   canvas.height=Math.ceil(viewport.height);
   canvas.style.width=Math.ceil(viewport.width/pixelRatio)+'px';
   canvas.style.height=Math.ceil(viewport.height/pixelRatio)+'px';
   const ctx=canvas.getContext('2d',{alpha:false});
   await page.render({canvasContext:ctx,viewport}).promise;
   if(token!==renderToken||!host.isConnected)return;
   const verifiedMasks=pdfBarcodeMasks(filename,pageNumber).map(item=>item.rect.map(Number));
   const detectedMasks=verifiedMasks.length?[]:await detectRenderedBarcodes(canvas);
   const masks=[...verifiedMasks,...detectedMasks];
   if(masks.length){
    ctx.save();
    ctx.fillStyle='#fff';
    masks.forEach(rect=>{
     const [x,y,w,h]=rect;
     const padX=2/canvas.width,padY=2/canvas.height;
     ctx.fillRect(Math.floor((x-padX)*canvas.width),Math.floor((y-padY)*canvas.height),Math.ceil((w+2*padX)*canvas.width),Math.ceil((h+2*padY)*canvas.height));
    });
    ctx.restore();
   }
   canvas.hidden=false;
   if(loading)loading.hidden=true;
   if(status)status.textContent='Page '+pageNumber+' of '+doc.numPages;
   if(prev)prev.disabled=pageNumber<=1;
   if(next)next.disabled=pageNumber>=doc.numPages;
   if(note)note.textContent=masks.length?'Full original textbook page shown. Verified barcode/QR hidden on this page; all other content is preserved.':'Full original textbook page shown with all text, images, diagrams and tables preserved.';
  }catch(error){
   nativeFallback('Full-page rendering was blocked by the source server or browser. The original PDF is shown directly below.');
  }
 }
 prev?.addEventListener('click',()=>renderPage(pageNumber-1));
 next?.addEventListener('click',()=>renderPage(pageNumber+1));
 zoomIn?.addEventListener('click',()=>{zoom=Math.min(2.4,zoom+.2);renderPage(pageNumber);});
 zoomOut?.addEventListener('click',()=>{zoom=Math.max(.6,zoom-.2);renderPage(pageNumber);});
 nativeFallback('Loading the chapter PDF. If the enhanced renderer becomes available, it will replace this viewer automatically.');
 renderPage(pageNumber);
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
      ${Array.isArray(selected.questions)&&selected.questions.length?'<button type="button" class="btn btn-primary topic-quiz-btn" data-start-quiz="'+safe(selected.id)+'">Start Quiz</button>':''}
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
 $('courseGrid').addEventListener('click',e=>{const sprite=e.target.closest('[data-pdf-sprite]');if(sprite){openPdfFigureSprite(sprite);return;}const figure=e.target.closest('[data-pdf-image]');if(figure){openPdfFigure(figure.dataset.pdfImage,figure.dataset.pdfCaption);return;}const topic=e.target.closest('[data-topic-id]');if(topic){stopReadAloud();currentTopicId=topic.dataset.topicId;currentSubtopicKey='';renderCourses();return;}const subtopic=e.target.closest('[data-subtopic-key]');if(subtopic){stopReadAloud();currentSubtopicKey=subtopic.dataset.subtopicKey;if(subtopic.dataset.pageUnverified==='true')showToast('This topic is listed, but its PDF page has not been verified yet. No page number was guessed.');renderCourses();return;}const aloud=e.target.closest('[data-read-aloud]');if(aloud){readAloudLesson(aloud.dataset.readAloud,aloud);return;}const quiz=e.target.closest('[data-start-quiz]');if(quiz)openLesson(quiz.dataset.startQuiz);});
 $('clearFiltersBtn').addEventListener('click',()=>{query='';$('searchInput').value='';renderCourses()});
 $('continueBtn').addEventListener('click',continueLearning);
 $('closeLesson').addEventListener('click',closeLesson);
 $('lessonModal').addEventListener('click',e=>{if(e.target===$('lessonModal'))closeLesson()});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){const viewer=$('pdfFigureViewer');if(viewer&&!viewer.hidden){closePdfFigure();return;}if(!$('lessonModal').hidden)closeLesson();}});
 $('mobileMenuBtn').addEventListener('click',()=>{const menu=$('mobileMenu');menu.hidden=!menu.hidden;$('mobileMenuBtn').setAttribute('aria-expanded',String(!menu.hidden));$('mobileMenuBtn').textContent=menu.hidden?'☰':'✕'});
 $('mobileMenu').addEventListener('click',e=>{if(e.target.closest('a')){$('mobileMenu').hidden=true;$('mobileMenuBtn').setAttribute('aria-expanded','false');$('mobileMenuBtn').textContent='☰'}});
}
$('currentYear').textContent=new Date().getFullYear();
Promise.resolve(window.TLW_DRIVE_READY).catch(()=>false).finally(()=>{
 renderAll();
 installEvents();
});
})();