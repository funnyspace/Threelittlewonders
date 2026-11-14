(function(){
'use strict';

const lessons=window.TLW_LESSONS||[];

const CLASS10_GEOGRAPHY_PDFS=[
  [1,'Resources and Development','jess101.pdf'],
  [2,'Forest and Wildlife Resources','jess102.pdf'],
  [3,'Water Resources','jess103.pdf'],
  [4,'Agriculture','jess104.pdf'],
  [5,'Minerals and Energy Resources','jess105.pdf'],
  [6,'Manufacturing Industries','jess106.pdf'],
  [7,'Lifelines of National Economy','jess107.pdf']
];

CLASS10_GEOGRAPHY_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Social Science'&&
    item.subSubject==='geography'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Contemporary India – II - Geography - Chapter '+chapter+': '+title;
});

const CLASS10_HINDI_PDFS=[
  [1,'सूरदास के पद','jhks101.pdf'],
  [2,'राम-लक्ष्मण-परशुराम संवाद','jhks102.pdf'],
  [3,'आत्मकथ्य','jhks103.pdf'],
  [4,'उत्साह और अट नहीं रही है','jhks104.pdf'],
  [5,'यह दंतुरित मुस्कान और फसल','jhks105.pdf'],
  [6,'संगतकार','jhks106.pdf'],
  [7,'नेताजी का चश्मा','jhks107.pdf'],
  [8,'बालगोबिन भगत','jhks108.pdf'],
  [9,'लखनवी अंदाज़','jhks109.pdf'],
  [10,'एक कहानी यह भी','jhks110.pdf'],
  [11,'नौबतखाने में इबादत','jhks111.pdf'],
  [12,'संस्कृति','jhks112.pdf']
];

CLASS10_HINDI_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Hindi'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT क्षितिज भाग 2 - कक्षा 10 हिंदी - अध्याय '+chapter+': '+title;
});

const CLASS10_ENGLISH_PDFS=[
  [1,'A Letter to God','jeff101.pdf'],
  [2,'Nelson Mandela: Long Walk to Freedom','jeff102.pdf'],
  [3,'Two Stories about Flying','jeff103.pdf'],
  [4,'From the Diary of Anne Frank','jeff104.pdf'],
  [5,'Glimpses of India','jeff105.pdf'],
  [6,'Mijbil the Otter','jeff106.pdf'],
  [7,'Madam Rides the Bus','jeff107.pdf'],
  [8,'The Sermon at Benares','jeff108.pdf'],
  [9,'The Proposal','jeff109.pdf']
];

CLASS10_ENGLISH_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='English'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT First Flight - Class 10 English - Chapter '+chapter+': '+title;
});

const CLASS10_HPE_PDFS=[
  [1,'Physical Education: Relation with other Subjects','jehp101.pdf'],
  [2,'Effects of Physical Activities on Human Body','jehp102.pdf'],
  [3,'Growth and Development during Adolescence','jehp103.pdf'],
  [4,'Individual Games and Sports I','jehp104.pdf'],
  [5,'Individual Games and Sports II','jehp105.pdf'],
  [6,'Team Games and Sports I','jehp106.pdf'],
  [7,'Team Games and Sports II','jehp107.pdf'],
  [8,'Yoga for Healthy Living','jehp108.pdf'],
  [9,'Dietary Considerations and Food Quality','jehp109.pdf'],
  [10,'Safety Measures for Healthy Living','jehp110.pdf'],
  [11,'Healthy Community Living','jehp111.pdf'],
  [12,'Social Health','jehp112.pdf'],
  [13,'Agencies and Awards Promoting Health, Sports and Yoga','jehp113.pdf']
];

CLASS10_HPE_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Health and Physical Education'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Class 10 Health and Physical Education - Chapter '+chapter+': '+title;
});

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
window.TLW_CLASS10_ENGLISH_PDFS=CLASS10_ENGLISH_PDFS;
window.TLW_CLASS10_HINDI_PDFS=CLASS10_HINDI_PDFS;
window.TLW_CLASS10_GEOGRAPHY_PDFS=CLASS10_GEOGRAPHY_PDFS;
window.TLW_CLASS10_HPE_PDFS=CLASS10_HPE_PDFS;
})();