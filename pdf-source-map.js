(function(){
'use strict';

const lessons=window.TLW_LESSONS||[];

const CLASS10_MATHS_PDFS=[
  [
    1,
    "Real Numbers",
    "jemh101.pdf"
  ],
  [
    2,
    "Polynomials",
    "jemh102.pdf"
  ],
  [
    3,
    "Pair of Linear Equations in Two Variables",
    "jemh103.pdf"
  ],
  [
    4,
    "Quadratic Equations",
    "jemh104.pdf"
  ],
  [
    5,
    "Arithmetic Progressions",
    "jemh105.pdf"
  ],
  [
    6,
    "Triangles",
    "jemh106.pdf"
  ],
  [
    7,
    "Coordinate Geometry",
    "jemh107.pdf"
  ],
  [
    8,
    "Introduction to Trigonometry",
    "jemh108.pdf"
  ],
  [
    9,
    "Some Applications of Trigonometry",
    "jemh109.pdf"
  ],
  [
    10,
    "Circles",
    "jemh110.pdf"
  ],
  [
    11,
    "Areas Related to Circles",
    "jemh111.pdf"
  ],
  [
    12,
    "Surface Areas and Volumes",
    "jemh112.pdf"
  ],
  [
    13,
    "Statistics",
    "jemh113.pdf"
  ],
  [
    14,
    "Probability",
    "jemh114.pdf"
  ]
];

CLASS10_MATHS_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Maths'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Class 10 Mathematics - Chapter '+chapter+': '+title;
});

lessons.forEach(lesson=>{
  if(!lesson)return;
  if(lesson.sourcePdf){
    if(!Number.isInteger(lesson.chapterStartPage))lesson.chapterStartPage=1;
    return;
  }
  let chapter=Number(lesson.sourceChapter);
  if(lesson.grade===10&&lesson.subject==='Science'&&lesson.title==='Chemical Reactions and Equations')chapter=1;
  if(!Number.isInteger(chapter)||chapter<1)return;
  if(lesson.grade===10&&lesson.subject==='Science'){
    lesson.sourcePdf='jesc'+String(100+chapter)+'.pdf';
    lesson.chapterStartPage=1;
  }
});

window.TLW_CLASS10_MATHS_PDFS=CLASS10_MATHS_PDFS;
})();