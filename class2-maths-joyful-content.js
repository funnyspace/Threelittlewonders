/* Class 2 Maths NCERT Joyful Mathematics: verified chapter PDFs and topic page mappings. */
(function(){
 const data={
  '2-maths-joyful-01':{sourcePdf:'bejm101.pdf',topics:[
   ['Counting in Groups',1],['Seashell Groups',2],['Tasty Chikoos',3],['Fun with Blocks and Strips',4],['Let us Make 100',6],['Counting through Cards',7],['Make Numbers',9],['Comparing Numbers',10],['Flash Card Game',12],['Play with Numbers',13]
  ]},
  '2-maths-joyful-02':{sourcePdf:'bejm102.pdf',topics:[
   ['Shapes Around Us',1],['Musical Instruments and Shapes',2],['Match Objects with Solid Shapes',3],['Faces, Edges and Corners',4],['Decorating Solid Shapes',5],['Cube, Cuboid, Cone, Cylinder and Sphere',6],['Touch and Tell',7]
  ]},
  '2-maths-joyful-03':{sourcePdf:'bejm103.pdf',topics:[
   ['Ginladi and Number Strip',1],['Guess my Number',2],['Number Patterns',3],['Skip Counting',4],['Backward Number Patterns',5],['Patterns in Number Chart',6],['Number Window',7]
  ]},
  '2-maths-joyful-04':{sourcePdf:'bejm104.pdf',topics:[
   ['Shadow Story (Togalu)',1],['Fun with Shadows',2],['Trace Shapes',3],['Hide and Seek with Shapes',4],['Colour the Carpet',6],['Catch the Corner',7],['Origami Fun',8],['Patterns with Shapes',9]
  ]},
  '2-maths-joyful-05':{sourcePdf:'bejm105.pdf',topics:[
   ['Playing with Lines',1],['What is Straight?',2],['Play with Dots',3],['Curved Line Drawings',4],['Designs with Different Lines',5],['Fun with Folding',6]
  ]},
  '2-maths-joyful-06':{sourcePdf:'bejm106.pdf',topics:[
   ['Decoration for Celebration',1],['Adding Tens and Ones',2],['Addition on Ginladi',4],['Addition on Number Line',5],['Playing with Blocks',6],['Addition with Regrouping',8],['Subtraction with Ginladi',10],['Subtraction on Number Line',12],['Subtraction with Blocks',14],['Regrouping in Subtraction',15],['Addition and Subtraction Facts',20],['Project Work',21]
  ]},
  '2-maths-joyful-07':{sourcePdf:'bejm107.pdf',topics:[
   ['Rani’s Gift',1],['Measuring Length',2],['Longest and Shortest Paths',3],['How Many Blocks?',4],['Project Work on Length',5],['Heavy and Light',6],['Make your own Balance',7],['Compare Weights',8],['Different Types of Balance',9],['Fruits in the Park',10],['Making Nimbu Pani',11]
  ]},
  '2-maths-joyful-08':{sourcePdf:'bejm108.pdf',topics:[
   ['Grouping and Sharing',1],['Repeated Addition and Multiplication',2],['Groups of Objects',3],['Multiplication Table Practice',4],['Tables of 2 and 3',5],['Tables of 5 and 10',6],['Equal Groups',7],['Multiplication Word Problems',8]
  ]},
  '2-maths-joyful-09':{sourcePdf:'bejm109.pdf',topics:[
   ['Seasons',1],['Favourite Season',2],['Seasons and Festivals',3],['Calendar Fun',4],['Using a Calendar',5],['How Long Does it Take?',6],['Trip and Duration',7],['Travel Time',9],['Gargi’s Day',10],['Reading Clocks',11],['Knowing Direction',13],['East, West, North or South',14]
  ]},
  '2-maths-joyful-10':{sourcePdf:'bejm110.pdf',topics:[
   ['Fun at the Fair',1],['How Much Rupal Spent?',2],['Indian Currency',3],['Features of Currency Notes',4],['Paise and Rupees',5],['Pop the Balloon',6],['Money Combinations',8],['Let us Buy',9]
  ]},
  '2-maths-joyful-11':{sourcePdf:'bejm111.pdf',topics:[
   ['Favourite Colours',1],['Picnic Day',2],['Mode of Coming to School',3],['Picture Graph',4],['Games we Play',5],['Class Survey',6],['Family Data Project',7],['Puzzles',8]
  ]}
 };
 Object.entries(data).forEach(([id,meta])=>{
  const lesson=window.TLW_LESSONS&&window.TLW_LESSONS.find(x=>x.id===id);
  if(!lesson)return;
  lesson.sourcePdf=meta.sourcePdf;
  lesson.chapterStartPage=1;
  lesson.topics=meta.topics.map(([title,page],index)=>({key:'verified-'+String(index+1).padStart(2,'0'),title,page}));
  lesson.concept='## '+lesson.title+'\nOriginal NCERT Joyful Mathematics chapter PDF assigned. Select a verified topic above to open the original PDF at its corresponding page.\n\n## Learning approach\nUse the original textbook activities, pictures, examples, games and project work directly from the PDF.';
  lesson.description=lesson.description+' · Original chapter PDF linked';
 });
})();