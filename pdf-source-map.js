(function(){
'use strict';

const lessons=window.TLW_LESSONS||[];

const CLASS9_MATHS_PDFS=[
  [1,'Orienting Yourself: The Use of Coordinates','iemh101.pdf'],
  [2,'Introduction to Linear Polynomials','iemh102.pdf'],
  [3,'The World of Numbers','iemh103.pdf'],
  [4,'Exploring Algebraic Identities','iemh104.pdf'],
  [5,'I’m Up and Down, and Round and Round','iemh105.pdf'],
  [6,'Measuring Space: Perimeter and Area','iemh106.pdf'],
  [7,'The Mathematics of Maybe: Introduction to Probability','iemh107.pdf'],
  [8,'Predicting What Comes Next: Exploring Sequences and Progressions','iemh108.pdf']
];

CLASS9_MATHS_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===9&&
    item.subject==='Maths'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Ganita Manjari Part I - Grade 9 Mathematics - Chapter '+chapter+': '+title;
});

const CLASS9_HINDI_PDFS=[
  [1,'दो बैलों की कथा','ihga101.pdf'],
  [2,'क्या लिखूँ?','ihga102.pdf'],
  [3,'संवादहीन','ihga103.pdf'],
  [4,'ऐसी भी बातें होती हैं (लता मंगेशकर से साक्षात्कार)','ihga104.pdf'],
  [5,'आखिरी चट्टान तक','ihga105.pdf'],
  [6,'रीढ़ की हड्डी','ihga106.pdf'],
  [7,'मैं और मेरा देश','ihga107.pdf'],
  [8,'पद','ihga108.pdf'],
  [9,'राम-लक्ष्मण-परशुराम संवाद','ihga109.pdf'],
  [10,'भारति, जय, विजयकरे!','ihga110.pdf'],
  [11,'झाँसी की रानी','ihga111.pdf'],
  [12,'घर की याद','ihga112.pdf']
];

CLASS9_HINDI_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===9&&
    item.subject==='Hindi'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT गंगा - कक्षा 9 हिंदी - पाठ '+chapter+': '+title;
});

const CLASS9_ENGLISH_PDFS=[
  [1,'How I Taught My Grandmother to Read','iebe101.pdf'],
  [2,'The Pot Maker','iebe102.pdf'],
  [3,'Winds of Change','iebe103.pdf'],
  [4,'Vitamin-M','iebe104.pdf'],
  [5,'The World of Limitless Possibilities','iebe105.pdf'],
  [6,'Twin Melodies','iebe106.pdf'],
  [7,'Carrier of Words','iebe107.pdf'],
  [8,'Follow That Dream','iebe108.pdf']
];

CLASS9_ENGLISH_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===9&&
    item.subject==='English'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Kaveri - Grade 9 English - Unit '+chapter+': '+title;
});

const CLASS9_SCIENCE_PDFS=[
  [1,'Exploration: Entering the World of Secondary Science','iesc101.pdf'],
  [2,'Cell: The Building Block of Life','iesc102.pdf'],
  [3,'Tissues in Action','iesc103.pdf'],
  [4,'Describing Motion Around Us','iesc104.pdf'],
  [5,'Exploring Mixtures and their Separation','iesc105.pdf'],
  [6,'How Forces Affect Motion','iesc106.pdf'],
  [7,'Work, Energy, and Simple Machines','iesc107.pdf'],
  [8,'Journey Inside the Atom','iesc108.pdf'],
  [9,'Atomic Foundations of Matter','iesc109.pdf'],
  [10,'Sound Waves: Characteristics and Applications','iesc110.pdf'],
  [11,'Reproduction: How Life Continues','iesc111.pdf'],
  [12,'Patterns in Life: Diversity and Classification','iesc112.pdf'],
  [13,'Earth as a System: Energy, Matter, and Life','iesc113.pdf']
];

CLASS9_SCIENCE_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===9&&
    item.subject==='Science'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Exploration - Grade 9 Science - Chapter '+chapter+': '+title;
});

const CLASS10_ECONOMICS_PDFS=[
  [1,'Development','jess201.pdf'],
  [2,'Sectors of the Indian Economy','jess202.pdf'],
  [3,'Money and Credit','jess203.pdf'],
  [4,'Globalisation and the Indian Economy','jess204.pdf'],
  [5,'Consumer Rights','jess205.pdf']
];

CLASS10_ECONOMICS_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Social Science'&&
    item.subSubject==='economics'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Understanding Economic Development - Economics - Chapter '+chapter+': '+title;
});

const CLASS10_POLITICAL_SCIENCE_PDFS=[
  [1,'Power-sharing','jess401.pdf'],
  [2,'Federalism','jess402.pdf'],
  [3,'Gender, Religion and Caste','jess403.pdf'],
  [4,'Political Parties','jess404.pdf'],
  [5,'Outcomes of Democracy','jess405.pdf']
];

CLASS10_POLITICAL_SCIENCE_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Social Science'&&
    item.subSubject==='political-science'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT Democratic Politics – II - Political Science - Chapter '+chapter+': '+title;
});

const CLASS10_HISTORY_PDFS=[
  [1,'The Rise of Nationalism in Europe','jess301.pdf'],
  [2,'Nationalism in India','jess302.pdf'],
  [3,'The Making of a Global World','jess303.pdf'],
  [4,'The Age of Industrialisation','jess304.pdf'],
  [5,'Print Culture and the Modern World','jess305.pdf']
];

CLASS10_HISTORY_PDFS.forEach(([chapter,title,pdf])=>{
  const lesson=lessons.find(item=>
    item&&
    item.grade===10&&
    item.subject==='Social Science'&&
    item.subSubject==='history'&&
    String(item.title||'').trim().toLowerCase()===title.toLowerCase()
  );
  if(!lesson)return;
  lesson.sourceChapter=chapter;
  lesson.sourcePdf=pdf;
  lesson.chapterStartPage=1;
  lesson.originalPdfTitle='NCERT India and the Contemporary World – II - History - Chapter '+chapter+': '+title;
});

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
window.TLW_CLASS9_MATHS_PDFS=CLASS9_MATHS_PDFS;
window.TLW_CLASS9_HINDI_PDFS=CLASS9_HINDI_PDFS;
window.TLW_CLASS9_ENGLISH_PDFS=CLASS9_ENGLISH_PDFS;
window.TLW_CLASS9_SCIENCE_PDFS=CLASS9_SCIENCE_PDFS;
window.TLW_CLASS10_ECONOMICS_PDFS=CLASS10_ECONOMICS_PDFS;
window.TLW_CLASS10_POLITICAL_SCIENCE_PDFS=CLASS10_POLITICAL_SCIENCE_PDFS;
window.TLW_CLASS10_HISTORY_PDFS=CLASS10_HISTORY_PDFS;
window.TLW_CLASS10_GEOGRAPHY_PDFS=CLASS10_GEOGRAPHY_PDFS;
window.TLW_CLASS10_HPE_PDFS=CLASS10_HPE_PDFS;
})();