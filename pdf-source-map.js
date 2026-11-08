(function(){
'use strict';
const lessons=window.TLW_LESSONS||[];
lessons.forEach(lesson=>{
  if(!lesson||lesson.sourcePdf)return;
  let chapter=Number(lesson.sourceChapter);
  if(lesson.grade===10&&lesson.subject==='Science'&&lesson.title==='Chemical Reactions and Equations')chapter=1;
  if(!Number.isInteger(chapter)||chapter<1)return;
  if(lesson.grade===10&&lesson.subject==='Maths'){
    lesson.sourcePdf='jemh'+String(100+chapter)+'.pdf';
    lesson.chapterStartPage=1;
  }else if(lesson.grade===10&&lesson.subject==='Science'){
    lesson.sourcePdf='jesc'+String(100+chapter)+'.pdf';
    lesson.chapterStartPage=1;
  }
});
})();