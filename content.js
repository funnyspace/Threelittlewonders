/* Starter curriculum for Threelittlewonders. All lesson copy is bundled locally.
   Add more lessons with add(grade, subject, title, description, emoji, concept, example, tip, quiz1, quiz2).
   Grade -2 = Nursery, grade -1 = LKG, grade 0 = UKG, grades 1-10 = school classes. */
window.TLW_SUBJECTS = {
  'Maths': { icon:'🔢', color:'#eaf2ff', label:'Maths' },
  'English': { icon:'📚', color:'#fff0e0', label:'English' },
  'Hindi': { icon:'हिंदी', color:'#ffe9d8', label:'Hindi' },
  'Science': { icon:'🔬', color:'#e7f5e9', label:'Science' },
  'EVS': { icon:'🌿', color:'#ecf7e3', label:'EVS' },
  'Social Science': { icon:'🌍', color:'#f2ebff', label:'Social Science' },
  'Computer': { icon:'💻', color:'#e9f6f9', label:'Computer' },
  'Health and Physical Education': { icon:'🏃', color:'#eef8e9', label:'Health and Physical Education' },
  'General Knowledge': { icon:'🌟', color:'#fff5cc', label:'General Knowledge' }
};
window.TLW_LESSONS=[];
function add(grade,subject,title,description,emoji,concept,example,tip,q1,q2){
  const id=String(grade)+'-'+subject.toLowerCase().replace(/[^a-z]+/g,'-')+'-'+title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  window.TLW_LESSONS.push({id,grade,subject,title,description,emoji,concept,example,tip,minutes:grade<3?5:grade<6?7:9,questions:[q1,q2].map(q=>({text:q[0],options:q[1],answer:q[2]}))});
}
// FOUNDATION
add(0,'English','Meet the ABCs','Say hello to letters and the sounds they make.','🔤','The English alphabet has 26 letters. Each letter has a name and helps us make words. A, B and C are the first three letters.','A is for Apple. B is for Ball. C is for Cat.','Look around you and name three things that start with different letters.', ['Which letter comes after A?',['C','B','D','F'],1], ['Which word starts with C?', ['Sun','Cat','Ball','Fish'],1]);
add(0,'Maths','Count from 1 to 10','Little numbers, big counting fun!','🧮','Counting helps us know how many things there are. We say the numbers in order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.','Count the stars: ✦ ✦ ✦ ✦. There are 4 stars.', 'Count your fingers one by one, then count them backwards.', ['How many stars? ✦ ✦ ✦ ✦?',['3','4','5','7'],1], ['What comes after 7?',['6','9','8','10'],2]);
add(0,'EVS','A Rainbow of Colours','Find wonderful colours all around you.','🌈','Colours make the world beautiful! Red, blue and yellow are familiar colours. Leaves are often green, and the sky often looks blue.','A ripe banana is usually yellow. Grass is often green.','Find one red, one blue and one yellow thing at home.', ['What colour is grass usually?',['Purple','Green','Black','Pink'],1], ['What colour is a ripe banana usually?',['Blue','Yellow','Grey','Violet'],1]);
add(0,'Maths','Shapes Around Us','Meet circles, triangles, squares and rectangles.','🔺','A circle is round. A triangle has 3 sides. A square has 4 equal sides. A rectangle has 4 sides with opposite sides equal.','A clock face may be a circle, and a window may be a rectangle.','Use your finger to draw each shape in the air.', ['Which shape has 3 sides?',['Square','Triangle','Circle','Rectangle'],1], ['Which shape is round?',['Circle','Square','Triangle','Rectangle'],0]);
// CLASS 1
[
  ['Finding the Furry Cat!','Pre-number Concepts'],
  ['What is Long? What is Round?','Shapes'],
  ['Mango Treat','Numbers 1 to 9'],
  ['Making 10','Numbers 10 to 20'],
  ['How Many?','Addition and Subtraction of Single Digit Numbers'],
  ['Vegetable Farm','Addition and Subtraction up to 20'],
  ["Lina’s Family",'Measurement'],
  ['Fun with Numbers','Numbers 21 to 99'],
  ['Utsav','Patterns'],
  ['How do I Spend my Day?','Time'],
  ['How Many Times?','Multiplication'],
  ['How Much Can We Spend?','Money'],
  ['So Many Toys','Data Handling']
].forEach(([title,topic],index)=>{
  window.TLW_LESSONS.push({
    id:'1-maths-joyful-'+String(index+1).padStart(2,'0'),
    grade:1,
    subject:'Maths',
    title,
    description:topic+' · NCERT Joyful Mathematics',
    emoji:'🔢',
    concept:'This Class 1 Maths topic has been added from the NCERT Joyful Mathematics textbook contents. Detailed lesson content will be added separately.',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});
[
  ['Two Little Hands','Unit 1: My Family and Me'],
  ['Greetings','Unit 1: My Family and Me'],
  ['Picture Time','Unit 2: Life Around Us'],
  ['The Cap-seller and the Monkeys','Unit 2: Life Around Us'],
  ['A Farm','Unit 2: Life Around Us'],
  ['Fun with Pictures','Unit 3: Food'],
  ['The Food we Eat','Unit 3: Food'],
  ['The Four Seasons','Unit 4: Seasons'],
  ["Anandi’s Rainbow",'Unit 4: Seasons']
].forEach(([title,unit],index)=>{
  window.TLW_LESSONS.push({
    id:'1-english-mridang-'+String(index+1).padStart(2,'0'),
    grade:1,
    subject:'English',
    title,
    description:unit+' · NCERT Mridang',
    emoji:'📘',
    concept:'This Class 1 English topic has been added from the NCERT Mridang textbook contents. Detailed lesson content will be added separately.',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});
[
  ['मीना का परिवार','इकाई 1: परिवार'],
  ['चंदा मामा दूर के','इकाई 1: परिवार · केवल पढ़ने के लिए'],
  ['दादा-दादी','इकाई 1: परिवार'],
  ['रीना का दिन','इकाई 1: परिवार'],
  ['रानी भी','इकाई 1: परिवार'],
  ['मुर्गा बोला कुकड़ू-कूँ','इकाई 2: जीव-जगत · केवल पढ़ने के लिए'],
  ['मिठाई','इकाई 2: जीव-जगत'],
  ['तीन साथी','इकाई 2: जीव-जगत'],
  ['वाह, मेरे घोड़े!','इकाई 2: जीव-जगत'],
  ['खतरे में साँप','इकाई 2: जीव-जगत'],
  ['कबरी झबरी बकरी','इकाई 2: जीव-जगत · केवल पढ़ने के लिए'],
  ['आलू की सड़क','इकाई 3: हमारा खान-पान'],
  ['झूलम-झूली','इकाई 3: हमारा खान-पान'],
  ['भुट्टे','इकाई 3: हमारा खान-पान'],
  ['फूली रोटी','इकाई 3: हमारा खान-पान'],
  ['मेला','इकाई 4: त्योहार और मेले'],
  ['बरखा और मेघा','इकाई 4: त्योहार और मेले'],
  ['होली','इकाई 4: त्योहार और मेले'],
  ['जन्मदिवस पर पेड़ लगाओ','इकाई 4: त्योहार और मेले'],
  ['हवा','इकाई 5: हरी-भरी दुनिया'],
  ['कितनी प्यारी है ये दुनिया','इकाई 5: हरी-भरी दुनिया'],
  ['चाँद का बच्चा','इकाई 5: हरी-भरी दुनिया'],
  ['अक्षर गीत','इकाई 5: हरी-भरी दुनिया · केवल पढ़ने के लिए']
].forEach(([title,unit],index)=>{
  window.TLW_LESSONS.push({
    id:'1-hindi-sarangi-'+String(index+1).padStart(2,'0'),
    grade:1,
    subject:'Hindi',
    title,
    description:unit+' · NCERT सारंगी',
    emoji:'📕',
    concept:'यह कक्षा 1 हिंदी का विषय NCERT सारंगी पाठ्यपुस्तक की विषय-सूची से जोड़ा गया है। विस्तृत पाठ सामग्री बाद में जोड़ी जाएगी।',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});


// CLASS 2
[
  ['A Day at the Beach','Counting in Groups'],
  ['Shapes Around Us','3D Shapes'],
  ['Fun with Numbers','Numbers 1 to 100'],
  ['Shadow Story (Togalu)','2D Shapes'],
  ['Playing with Lines','Orientations of a Line'],
  ['Decoration for Festival','Addition and Subtraction'],
  ["Rani’s Gift",'Measurement'],
  ['Grouping and Sharing','Multiplication and Division'],
  ['Which Season is it?','Measurement of Time'],
  ['Fun at the Fair','Money'],
  ['Data Handling','Data Handling']
].forEach(([title,topic],index)=>{
  window.TLW_LESSONS.push({
    id:'2-maths-joyful-'+String(index+1).padStart(2,'0'),
    grade:2,
    subject:'Maths',
    title,
    description:topic+' · NCERT Joyful Mathematics',
    emoji:'🔢',
    concept:'This Class 2 Maths topic has been added from the NCERT Joyful Mathematics textbook contents. Detailed lesson content will be added separately.',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});
[
  ['My Bicycle','Unit 1: Fun with Friends'],
  ['Picture Reading','Unit 1: Fun with Friends'],
  ['It is Fun','Unit 2: Welcome to My World'],
  ['Seeing without Seeing','Unit 2: Welcome to My World'],
  ['Come Back Soon','Unit 3: Going Places'],
  ['Between Home and School','Unit 3: Going Places'],
  ['This is My Town','Unit 3: Going Places'],
  ['A Show of Clouds','Unit 4: Life Around Us'],
  ['My Name','Unit 4: Life Around Us'],
  ['The Crow','Unit 4: Life Around Us'],
  ['The Smart Monkey','Unit 4: Life Around Us'],
  ['Little Drops of Water','Unit 5: Harmony'],
  ['We are all Indians','Unit 5: Harmony']
].forEach(([title,unit],index)=>{
  window.TLW_LESSONS.push({
    id:'2-english-mridang-'+String(index+1).padStart(2,'0'),
    grade:2,
    subject:'English',
    title,
    description:unit+' · NCERT Mridang',
    emoji:'📘',
    concept:'This Class 2 English topic has been added from the NCERT Mridang textbook contents. Detailed lesson content will be added separately.',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});



// CLASS 3
add(3,'Maths','Multiplication Magic','Turn repeated addition into multiplication.','✖️','Multiplication helps us add equal groups quickly. The × sign means multiply.','3 groups of 4 are 4 + 4 + 4 = 12, so 3 × 4 = 12.','Make three groups of four pencils or dots.', ['3 × 4 = ?',['7','10','12','14'],2], ['5 × 2 = ?',['10','7','12','15'],0]);
[
  ['Picture Reading','Unit 1: Fun with Friends'],
  ['Colours','Unit 1: Fun with Friends'],
  ['Badal and Moti','Unit 1: Fun with Friends'],
  ['Best Friends','Unit 1: Fun with Friends'],
  ['Picture Reading','Unit 2: Toys and Games'],
  ['Out in the Garden','Unit 2: Toys and Games'],
  ['Talking Toys','Unit 2: Toys and Games'],
  ['Paper Boats','Unit 2: Toys and Games'],
  ['Picture Reading','Unit 3: Good Food'],
  ['The Big Laddoo','Unit 3: Good Food'],
  ['Thank God','Unit 3: Good Food'],
  ["Madhu’s Wish",'Unit 3: Good Food'],
  ['Picture Reading','Unit 4: The Sky'],
  ['Night','Unit 4: The Sky'],
  ['Chanda Mama Counts the Stars','Unit 4: The Sky'],
  ['Chandrayaan','Unit 4: The Sky']
].forEach(([title,unit],index)=>{
  window.TLW_LESSONS.push({
    id:'3-english-santoor-'+String(index+1).padStart(2,'0'),
    grade:3,
    subject:'English',
    title,
    description:unit+' · NCERT Santoor',
    emoji:'📘',
    concept:'This Class 3 English topic has been added from the NCERT Santoor textbook contents. Detailed lesson content will be added separately.',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});
add(3,'Science','Parts of a Plant','Meet roots, stems, leaves and flowers.','🌻','Roots help anchor plants and absorb water. Stems support plant parts. Leaves usually make food through photosynthesis.','A sunflower has roots, a stem, leaves and a flower.','Draw and label a simple flowering plant.', ['Which plant part absorbs water from soil?',['Flower','Root','Fruit','Petal'],1], ['Which part usually makes food?',['Leaves','Roots','Seeds','Thorns'],0]);
add(3,'Social Science','Reading Simple Maps','Maps help us find our way.','🗺️','A map is a drawing that represents a place from above. Symbols can represent roads, rivers and buildings. A map key explains symbols.','A blue wavy line on a map may show a river if its key says so.','Draw a map of your room and add a symbol key.', ['What explains map symbols?',['A key','A calendar','A ruler only','A poem'],0], ['A map usually shows a place from?',['Above','Under the ground only','Inside a book only','Behind'],0]);
add(3,'Computer','Being Safe Online','Learn kind and safe internet habits.','🛡️','The internet can help us learn, but we must protect personal information. Ask a trusted adult before sharing your name, address or photos online.','If a stranger asks for your home address in a game, do not share it; tell a trusted adult.','Remember: stop, think, and ask before clicking unknown links.', ['Should you share your address with online strangers?',['Yes','No','Always','Only in games'],1], ['Who can help with an unsafe online message?',['A trusted adult','An unknown stranger','A pop-up ad','Nobody'],0]);
// CLASS 4
add(4,'Maths','Friendly Fractions','Understand parts of a whole.','🍕','A fraction shows equal parts of a whole. In 1/4, the bottom number 4 tells us the whole has four equal parts. The top number 1 tells us we have one part.','If a pizza is cut into 4 equal slices and you take 1, you have 1/4 of the pizza.','Fold paper into four equal parts and shade one part.', ['What is half of 8?',['2','4','6','8'],1], ['In 3/5, which number is the denominator?',['3','8','5','2'],2]);
add(4,'English','Past, Present and Future','Tell when something happens.','⏰','Verb tenses tell us about time. Present talks about now or habits, past about earlier, and future about what will happen.','I play today. I played yesterday. I will play tomorrow.','Say one sentence about yesterday, today and tomorrow.', ['“I walk” is in which tense?',['Future','Present','Past','None'],1], ['Which word can show future tense?',['Will','Yesterday','Was','Had'],0]);
add(4,'Science','States of Matter','Solids, liquids and gases everywhere.','🧊','Matter commonly appears as solid, liquid or gas. Solids keep their shape, liquids flow and take the shape of their container, and gases spread out.','Ice is solid; water is liquid; water vapour is gas.','Watch an ice cube melt safely and describe what changes.', ['Ice is a?',['Gas','Liquid','Solid','Light'],2], ['Which can take the shape of its container?',['Water','A wooden block','A rock','A metal spoon'],0]);
add(4,'Social Science','Landforms of Our World','Explore mountains, plains and plateaus.','⛰️','A landform is a natural feature of Earth’s surface. Mountains are high, plains are generally flat, and plateaus are elevated areas with relatively flat tops.','The Himalayas are mountains. The Indo-Gangetic Plain is an extensive plain.','Find and label two different landforms on a physical map.', ['Which landform is usually high with steep slopes?',['Plain','Mountain','Beach','Pond'],1], ['A plateau is generally?',['Underwater only','A flat elevated land area','Always made of ice','A river'],1]);
add(4,'Computer','Patterns and Sequences','Give instructions in the right order.','🧩','A sequence is a list of steps performed in order. Computers follow instructions carefully, so order matters.','To make a sandwich: prepare ingredients, place filling between bread slices, then serve.','Write four steps for getting ready for school.', ['What is a sequence?',['Steps in order','A random picture','A password','A type of mouse'],0], ['Why does order matter?',['Steps can depend on earlier steps','It never matters','It makes screens bigger','It changes colour'],0]);
// CLASS 5
add(5,'Maths','Decimals Made Easy','Discover tenths and hundredths.','📏','Decimals can represent parts of one whole using place value. The digit after the decimal point is in the tenths place.','0.5 means five tenths, which equals one half. 1.25 means one and twenty-five hundredths.','Use money amounts to spot decimals in daily life.', ['0.5 is equal to?',['1/2','1/4','2','5'],0], ['In 2.34, which digit is in the tenths place?',['2','3','4','0'],1]);
add(5,'English','Read and Understand','Find the main idea in a paragraph.','📖','Reading comprehension means understanding what a text says. Look for who, what, where and why. The main idea tells us what the text is mostly about.','“Mina plants a sapling and waters it daily.” Main idea: Mina cares for a new plant.','After reading a paragraph, describe it in one sentence.', ['What is a main idea?',['The biggest point of a text','The last letter','A punctuation mark','A random word'],0], ['“Aman feeds his dog.” Who is feeding?',['Dog','Aman','Bird','Teacher'],1]);
add(5,'Science','Our Digestive System','Follow the journey of food.','🫁','Digestion breaks food into simpler substances that the body can absorb. Digestion starts in the mouth and continues through the stomach and small intestine.','Teeth chew food, saliva begins digestion, and the small intestine absorbs many nutrients.','Chew your food carefully and notice how your mouth helps.',['Where does digestion begin?',['Mouth','Foot','Lung','Ear'],0], ['Where are many nutrients absorbed?',['Hair','Small intestine','Bone','Nose'],1]);
add(5,'Social Science','How Communities Work','Understand rules and responsibilities.','🏘️','Communities function better when people share responsibilities, follow fair rules and cooperate. Local governments help provide community services.','Keeping a public park clean helps everyone enjoy it.','Think of two small ways to help your neighbourhood.', ['What helps a community?',['Cooperation','Littering','Breaking rules','Wasting water'],0], ['Who benefits from clean public spaces?',['Only one person','Everyone','Nobody','Only animals'],1]);
add(5,'Computer','Thinking Like a Coder','Algorithms are plans we can follow.','🤖','An algorithm is a clear sequence of steps to complete a task or solve a problem. Each step should be understandable and ordered.','Algorithm to count three books: start at 0, count each book once, then say the total.','Write an algorithm for brushing your teeth.', ['An algorithm is a?',['Step-by-step plan','Kind of fruit','Computer screen','Music note'],0], ['Good algorithms have instructions that are?',['Clear','Impossible','Secret','Random'],0]);
// CLASS 6
add(6,'Maths','Introduction to Integers','Explore numbers above and below zero.','➕','Integers include positive numbers, negative numbers and zero. On a number line, numbers to the right are greater.','At −3°C, the temperature is below zero. 3 is less than 2? No, 3 is greater than 2.','Draw a number line from −5 to 5.', ['Which number is less?',['2','3','5','0'],0], ['What is 2 + 5?',['3','7','9','10'],1]);
add(6,'English','Describing With Adjectives','Make your writing colourful and precise.','🎨','An adjective describes a noun or pronoun. It can tell us qualities such as size, colour or feeling.','In “a bright yellow kite”, bright and yellow describe the kite.','Describe your favourite object using three adjectives.', ['Find the adjective: “A tall tree.”',['Tree','Tall','A','None'],1], ['Which word describes colour?',['Blue','Run','Quickly','Eat'],0]);
add(6,'Science','Components of Food','Discover nutrients that fuel us.','🥗','Foods contain nutrients such as carbohydrates, proteins, fats, vitamins and minerals. Different nutrients help with energy, growth and body functions.','Rice is a source of carbohydrates; pulses can supply protein. A balanced diet includes variety.','Notice which food groups you eat in one meal.', ['Which nutrient is important for growth and tissue repair?',['Protein','Sand','Air','Plastic'],0], ['Which is a good source of carbohydrates?',['Rice','Stone','Water bottle','Chalk'],0]);
add(6,'Social Science','Earth and Its Motions','Understand days and seasons.','🌎','Earth rotates around its axis roughly once every 24 hours, causing day and night. Earth also revolves around the Sun. Seasons are linked to Earth’s tilted axis as it revolves.','When your part of Earth faces the Sun, it is daytime there.','Use a ball and torch with adult supervision to model day and night.', ['What mainly causes day and night?',['Earth’s rotation','Clouds','Moonlight','Rain'],0], ['Earth revolves around the?',['Sun','Mars','Moon','Venus'],0]);
add(6,'Computer','Loops: Repeat Smartly','Give repeated instructions efficiently.','🔁','A loop repeats a set of instructions. Instead of writing the same action many times, a loop tells a computer how often to repeat it.','To print “Hello” three times, repeat the print instruction 3 times.','Think of a routine you repeat every day.', ['What does a loop do?',['Repeats steps','Deletes the keyboard','Stops time','Changes the weather'],0], ['A loop that runs 4 times repeats its instructions?',['2 times','3 times','4 times','0 times'],2]);
// CLASS 7
add(7,'Maths','Algebraic Expressions','Use letters to stand for numbers.','🧠','In algebra, letters like x can represent unknown or changing numbers. An expression such as 2x + 3 combines numbers and variables without an equals sign.','If x = 4, then 2x + 3 = 2×4 + 3 = 11.','Choose a value of x and evaluate 3x + 2.', ['If x = 2, what is x + 5?',['3','5','7','10'],2], ['Which is an algebraic expression?',['4 + y','A map','A poem','A rock'],0]);
add(7,'English','Active and Passive Voice','See how sentences shift focus.','✍️','In active voice, the subject usually performs the action. In passive voice, the subject receives the action. Both can be useful depending on emphasis.','Active: “Ravi wrote the letter.” Passive: “The letter was written by Ravi.”','Change “Maya cleaned the room” to passive voice.', ['Which is active voice?',['The cake was baked by Ali.','Ali baked the cake.','The door was closed.','The game was played.'],1], ['Which sentence is passive?',['Birds fly.','She runs.','The song was sung by Meera.','They smile.'],2]);
add(7,'Science','How Heat Travels','Meet conduction, convection and radiation.','🌡️','Heat can transfer through conduction (direct contact), convection (movement of fluids) and radiation (electromagnetic waves).','A metal spoon warming in hot soup is an example of conduction.','Ask an adult to help you observe heat transfer safely; avoid touching hot objects.', ['Heat moving through direct contact is?',['Conduction','Reflection','Refraction','Magnetism'],0], ['Sunlight warming your skin mainly uses?',['Conduction','Radiation','Evaporation','Freezing'],1]);
add(7,'Social Science','A Window Into Medieval India','History through sources and change.','🏛️','Historians study inscriptions, manuscripts, buildings and other evidence to learn about the past. Medieval India societies, kingdoms and cultures changed over time.','A dated inscription can help historians understand events and rulers.','Look at a historical monument and ask what it can tell you.', ['Which is a historical source?',['Inscription','Future weather','A guess only','A blank page'],0], ['Historians use evidence to study?',['The past','Tomorrow’s lottery','Only planets','Nothing'],0]);
add(7,'Computer','If, Then: Making Decisions','Let your programs choose what to do.','💡','A condition checks whether something is true or false. Programs can use if/else to choose which action runs.','If it is raining, carry an umbrella; otherwise, enjoy the dry weather.','Write a simple if/else rule for choosing a sweater.', ['What does an if statement check?',['A condition','A battery','A picture','A song'],0], ['If 3 > 2 is the condition, is it?',['True','False','Unknown','A string'],0]);
// CLASS 8
add(8,'Maths','Solving Linear Equations','Find the value of an unknown.','📐','A linear equation in one variable can look like 2x + 3 = 11. Keep both sides balanced while isolating x.','2x + 3 = 11 → 2x = 8 → x = 4.','Check your answer by substituting it into the original equation.', ['Solve x + 6 = 10.',['4','6','10','16'],0], ['Solve 3x = 15.',['3','4','5','6'],2]);
add(8,'English','Direct and Indirect Speech','Report what someone said.','🗣️','Direct speech quotes the speaker’s exact words. Indirect speech reports the meaning, often with changes in pronouns and tense.','Direct: Sara said, “I am happy.” Indirect: Sara said that she was happy.','Look for quotation marks in a story and rewrite a sentence.', ['Which has direct speech?',['Ravi said that he was tired.','Ravi said, “I am tired.”','He was tired.','Ravi felt tired.'],1], ['Direct speech often uses?',['Quotation marks','Math signs','Fractions','Graphs'],0]);
add(8,'Science','Meet Microorganisms','Tiny life, big impact.','🦠','Microorganisms include bacteria, some fungi, protozoa and microscopic algae. Some are useful; some may cause disease. Viruses are often studied alongside them.','Certain bacteria help make curd, while some microorganisms can spoil food.','Practise food hygiene and wash hands before meals.', ['Which microorganism can help make curd?',['Helpful bacteria','Pebbles','Plastic','Sand'],0], ['Are all microorganisms harmful?',['Yes','No','Only in winter','Only in water'],1]);
add(8,'Social Science','Inside Our Parliament','Understand representative democracy.','🏛️','In India, Parliament includes the President, Lok Sabha and Rajya Sabha. Elected representatives in the Lok Sabha help make laws and hold the government accountable.','A proposed law is discussed through a legislative process before becoming law.','Find out who represents your constituency in the Lok Sabha.', ['Which is a house of the Indian Parliament?',['Lok Sabha','Supreme Court','RBI','Election Commission'],0], ['Parliament helps make?',['Laws','Weather','Mountains','Rivers'],0]);
add(8,'Computer','Data and Binary Basics','Learn how computers represent information.','💾','Digital computers use binary digits called bits. Each bit can have a value of 0 or 1. Groups of bits represent numbers, text and more.','Binary 10 represents decimal 2, and binary 11 represents decimal 3.','Try writing the decimal numbers 0, 1, 2 and 3 in binary.', ['A bit can be?',['0 or 1','Any colour','Only 5','A paragraph'],0], ['Binary 11 equals decimal?',['2','3','4','11'],1]);
// CLASS 9
add(9,'Maths','Polynomials Explained','Build expressions using powers of x.','📊','A polynomial uses variables with non-negative integer exponents and coefficients. Its degree is the highest exponent with a non-zero coefficient.','3x² + 2x + 5 is a polynomial of degree 2.','Write a polynomial of degree 3 and identify its leading term.', ['Degree of 4x² + x + 1?',['1','2','3','4'],1], ['Which expression is a polynomial?',['x² + 2x','1/x','√x','A rock'],0]);
add(9,'English','Edit for Clear Writing','Fix grammar, punctuation and meaning.','🖊️','Editing makes writing clearer and more accurate. Check subject–verb agreement, word choice, sentence structure and punctuation.','Incorrect: “She go to school.” Correct: “She goes to school.”','Reread a short paragraph slowly and correct one error at a time.', ['Choose the correct sentence.',['He have a book.','He has a book.','he having a book.','He having a book.'],1], ['What ends a statement?',['Period / full stop','Question mark only','Comma only','Colon only'],0]);
add(9,'Science','Newton’s Laws of Motion','Explore forces and movement.','🚀','Newton’s first law says that an object keeps its state of rest or uniform straight-line motion unless acted upon by a net external force. His second law relates net force, mass and acceleration: F = ma.','For a mass of 2 kg accelerating at 3 m/s², net force is 6 N.','Think about why passengers lean forward when a bus brakes.', ['F = ma: what is force if m = 2 kg and a = 4 m/s²?',['2 N','6 N','8 N','10 N'],2], ['Without net external force, an object at rest?',['Stays at rest','Must speed up','Must turn','Must fall'],0]);
add(9,'Social Science','Why Democracy Matters','Explore democratic principles.','🗳️','Democracy is a system in which people have a role in choosing government. Important principles include political equality, participation and accountability.','Regular elections give citizens a way to choose representatives.','Discuss why everyone’s voice should matter in public decisions.', ['A key feature of democracy is?',['Public participation','Rule by one person without choice','No accountability','No elections ever'],0], ['Why are free and fair elections important?',['To choose representatives','To change seasons','To grow plants','To set time'],0]);
add(9,'Computer','Your First HTML Page','Learn how websites get structure.','🌐','HTML stands for HyperText Markup Language. It describes webpage structure using elements such as headings, paragraphs and lists.','A heading can be written with the h1 element. A paragraph can be written with p.','Make a simple page with one heading and one paragraph.', ['What does HTML describe?',['Webpage structure','Weather','Electric current','Food nutrients'],0], ['Which element is a top-level heading?',['h1','img','ul','em'],0]);
// CLASS 10
add(10,'Maths','Real Numbers','NCERT Class 10 Mathematics — Chapter 1.','🔢','This card represents Chapter 1: Real Numbers from the Class 10 Mathematics textbook.','Chapter 1 is titled “Real Numbers”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 1?',['Real Numbers','Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations'],0], ['Which chapter number is “Real Numbers”?',['1','2','2','3'],0]);
add(10,'Maths','Polynomials','NCERT Class 10 Mathematics — Chapter 2.','🔢','This card represents Chapter 2: Polynomials from the Class 10 Mathematics textbook.','Chapter 2 is titled “Polynomials”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 2?',['Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions'],0], ['Which chapter number is “Polynomials”?',['2','3','1','4'],0]);
add(10,'Maths','Pair of Linear Equations in Two Variables','NCERT Class 10 Mathematics — Chapter 3.','🔢','This card represents Chapter 3: Pair of Linear Equations in Two Variables from the Class 10 Mathematics textbook.','Chapter 3 is titled “Pair of Linear Equations in Two Variables”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 3?',['Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Triangles'],0], ['Which chapter number is “Pair of Linear Equations in Two Variables”?',['3','4','2','5'],0]);
add(10,'Maths','Quadratic Equations','Solve expressions with x squared.','📈','A quadratic equation in one variable has the form ax² + bx + c = 0, where a is not zero. Some can be solved by factorisation.','x² − 5x + 6 = 0 → (x−2)(x−3) = 0, so x = 2 or x = 3.','Substitute each root back into the original equation to verify.', ['Solutions of x² − 9 = 0?',['3 only','−3 only','3 and −3','9 and 0'],2], ['What is the degree of a quadratic?',['1','2','3','4'],1]);
add(10,'Maths','Arithmetic Progressions','NCERT Class 10 Mathematics — Chapter 5.','🔢','This card represents Chapter 5: Arithmetic Progressions from the Class 10 Mathematics textbook.','Chapter 5 is titled “Arithmetic Progressions”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 5?',['Arithmetic Progressions','Triangles','Coordinate Geometry','Introduction to Trigonometry'],0], ['Which chapter number is “Arithmetic Progressions”?',['5','6','4','7'],0]);
add(10,'Maths','Triangles','NCERT Class 10 Mathematics — Chapter 6.','🔢','This card represents Chapter 6: Triangles from the Class 10 Mathematics textbook.','Chapter 6 is titled “Triangles”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 6?',['Triangles','Coordinate Geometry','Introduction to Trigonometry','Some Applications of Trigonometry'],0], ['Which chapter number is “Triangles”?',['6','7','5','8'],0]);
add(10,'Maths','Coordinate Geometry','NCERT Class 10 Mathematics — Chapter 7.','🔢','This card represents Chapter 7: Coordinate Geometry from the Class 10 Mathematics textbook.','Chapter 7 is titled “Coordinate Geometry”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 7?',['Coordinate Geometry','Introduction to Trigonometry','Some Applications of Trigonometry','Circles'],0], ['Which chapter number is “Coordinate Geometry”?',['7','8','6','9'],0]);
add(10,'Maths','Introduction to Trigonometry','Learn sine, cosine and tangent in right triangles.','📐','In a right triangle, sine, cosine and tangent compare sides relative to an acute angle: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.','For a 3-4-5 right triangle, if the opposite side is 3 and hypotenuse 5, sin θ = 3/5.','Sketch a right triangle and label opposite, adjacent and hypotenuse.', ['sin θ is which ratio?',['Opposite / hypotenuse','Adjacent / opposite','Hypotenuse / opposite','Adjacent / hypotenuse'],0], ['For opposite = 3 and adjacent = 4, tan θ = ?',['4/3','3/4','3/5','5/4'],1]);
add(10,'Maths','Some Applications of Trigonometry','NCERT Class 10 Mathematics — Chapter 9.','🔢','This card represents Chapter 9: Some Applications of Trigonometry from the Class 10 Mathematics textbook.','Chapter 9 is titled “Some Applications of Trigonometry”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 9?',['Some Applications of Trigonometry','Circles','Areas Related to Circles','Surface Areas and Volumes'],0], ['Which chapter number is “Some Applications of Trigonometry”?',['9','10','8','11'],0]);
add(10,'Maths','Circles','NCERT Class 10 Mathematics — Chapter 10.','🔢','This card represents Chapter 10: Circles from the Class 10 Mathematics textbook.','Chapter 10 is titled “Circles”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 10?',['Circles','Areas Related to Circles','Surface Areas and Volumes','Statistics'],0], ['Which chapter number is “Circles”?',['10','11','9','12'],0]);
add(10,'Maths','Areas Related to Circles','NCERT Class 10 Mathematics — Chapter 11.','🔢','This card represents Chapter 11: Areas Related to Circles from the Class 10 Mathematics textbook.','Chapter 11 is titled “Areas Related to Circles”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 11?',['Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability'],0], ['Which chapter number is “Areas Related to Circles”?',['11','12','10','13'],0]);
add(10,'Maths','Surface Areas and Volumes','NCERT Class 10 Mathematics — Chapter 12.','🔢','This card represents Chapter 12: Surface Areas and Volumes from the Class 10 Mathematics textbook.','Chapter 12 is titled “Surface Areas and Volumes”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 12?',['Surface Areas and Volumes','Statistics','Probability','Real Numbers'],0], ['Which chapter number is “Surface Areas and Volumes”?',['12','13','11','14'],0]);
add(10,'Maths','Statistics','NCERT Class 10 Mathematics — Chapter 13.','🔢','This card represents Chapter 13: Statistics from the Class 10 Mathematics textbook.','Chapter 13 is titled “Statistics”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 13?',['Statistics','Probability','Real Numbers','Polynomials'],0], ['Which chapter number is “Statistics”?',['13','14','12','15'],0]);
add(10,'Maths','Probability','NCERT Class 10 Mathematics — Chapter 14.','🔢','This card represents Chapter 14: Probability from the Class 10 Mathematics textbook.','Chapter 14 is titled “Probability”.','Follow the NCERT chapter order while studying.', ['What is the title of Chapter 14?',['Probability','Real Numbers','Polynomials','Pair of Linear Equations in Two Variables'],0], ['Which chapter number is “Probability”?',['14','13','13','12'],0]);
/* Class 10 English: NCERT First Flight chapters and original chapter PDFs. */
[
  "A Letter to God",
  "Nelson Mandela: Long Walk to Freedom",
  "Two Stories about Flying",
  "From the Diary of Anne Frank",
  "Glimpses of India",
  "Mijbil the Otter",
  "Madam Rides the Bus",
  "The Sermon at Benares",
  "The Proposal"
].forEach((title,index)=>{
  const chapter=index+1;
  const pdf='jeff'+String(100+chapter)+'.pdf';
  window.TLW_LESSONS.push({
    id:'10-english-first-flight-ch'+String(chapter).padStart(2,'0'),
    grade:10,
    subject:'English',
    title,
    description:'NCERT First Flight · Class 10 English · Chapter '+chapter,
    emoji:'📘',
    concept:'Chapter '+chapter+': '+title,
    example:'',
    tip:'',
    minutes:20,
    sourceChapter:chapter,
    sourcePdf:pdf,
    chapterStartPage:1,
    originalPdfTitle:'NCERT First Flight - Class 10 English - Chapter '+chapter+': '+title,
    questions:[]
  });
});
add(10,'Science','Chemical Reactions and Equations','Complete Chapter 1 study content from the uploaded Science PDF.','⚗️',"## 1. Chemical Reactions in Daily Life\nA chemical reaction has taken place whenever a chemical change changes the nature and identity of the starting substance. The chapter begins with familiar situations:\n- milk left at room temperature during summer\n- an iron tawa, pan or nail exposed to a humid atmosphere\n- grapes undergoing fermentation\n- food being cooked\n- food being digested in the body\n- respiration\n\nThese examples lead to the central questions: What is a chemical reaction, and how can we recognise that one has occurred?\n\nACTIVITY: Activity 1.1 — Burning magnesium ribbon\n- Clean a magnesium ribbon about 3–4 cm long by rubbing it with sandpaper.\n- Hold it with a pair of tongs.\n- Burn it using a spirit lamp or burner and collect the ash in a watch-glass.\n- Keep the burning ribbon as far from the eyes as possible.\n- Observe what happens.\nCAUTION: This activity needs a teacher’s assistance. Suitable eye protection should be used.\nThe magnesium ribbon burns with a dazzling white flame and changes into a white powder. The white powder is magnesium oxide, formed by reaction of magnesium with oxygen in air.\nEQ: 2Mg + O₂ → 2MgO\nFIGURE: Figure 1.1 shows a magnesium ribbon burning in air and magnesium oxide being collected in a watch-glass.\n\nACTIVITY: Activity 1.2 — Lead nitrate and potassium iodide\n- Take lead nitrate solution in a test tube.\n- Add potassium iodide solution.\n- Observe the change.\n\nACTIVITY: Activity 1.3 — Zinc with dilute acid\n- Take a few zinc granules in a conical flask or test tube.\n- Add dilute hydrochloric acid or dilute sulphuric acid.\n- Observe what happens around the zinc granules.\n- Touch the flask or test tube and note any temperature change.\nCAUTION: Handle acids carefully.\nFIGURE: Figure 1.2 shows formation of hydrogen gas by the action of dilute sulphuric acid on zinc.\n\nFrom Activities 1.1–1.3, four common observations can indicate that a chemical reaction has occurred:\n- change in state\n- change in colour\n- evolution of a gas\n- change in temperature\n\n## 2. Chemical Equations\nA long sentence describing a reaction can be shortened into a word-equation. Burning magnesium in oxygen can be written as:\nEQ: Magnesium + Oxygen → Magnesium oxide\nThe substances that undergo chemical change are called reactants. The new substances formed are products.\nIn a word-equation:\n- reactants are written on the left-hand side (LHS)\n- products are written on the right-hand side (RHS)\n- a plus sign separates multiple reactants or products\n- the arrow points from reactants towards products and indicates the direction of the reaction\n\n## 3. Writing a Chemical Equation\nChemical equations become more concise when chemical formulae replace words.\nEQ: Mg + O₂ → MgO\nCount the atoms of each element on the LHS and RHS. If the numbers match, the equation is balanced. If they do not match, the equation is unbalanced. An unbalanced formula equation is called a skeletal chemical equation.\n\n## 4. Balanced Chemical Equations\nThe law of conservation of mass states that mass can neither be created nor destroyed in a chemical reaction. Therefore, the total mass of elements in the products must equal the total mass of elements in the reactants. Equivalently, the number of atoms of each element must be the same before and after the reaction.\n\nThe zinc and sulphuric acid reaction is:\nEQ: Zinc + Sulphuric acid → Zinc sulphate + Hydrogen\nEQ: Zn + H₂SO₄ → ZnSO₄ + H₂\nAtom count:\n- Zn: 1 on LHS, 1 on RHS\n- H: 2 on LHS, 2 on RHS\n- S: 1 on LHS, 1 on RHS\n- O: 4 on LHS, 4 on RHS\nThis equation is already balanced.\n\nThe chapter then balances:\nEQ: Fe + H₂O → Fe₃O₄ + H₂\n\n## 5. Balancing by the Hit-and-Trial Method\nStep I: Draw boxes around each chemical formula conceptually. Do not alter a chemical formula while balancing.\nEQ: Fe + H₂O → Fe₃O₄ + H₂\n\nStep II: Count the atoms in the unbalanced equation:\n- Fe: 1 on LHS, 3 on RHS\n- H: 2 on LHS, 2 on RHS\n- O: 1 on LHS, 4 on RHS\n\nStep III: Start with a compound containing the largest number of atoms. For Fe₃O₄, balance oxygen first. Four oxygen atoms are needed on the LHS, so place coefficient 4 before H₂O.\nEQ: Fe + 4H₂O → Fe₃O₄ + H₂\nDo not change H₂O into H₂O₄ or (H₂O)₄. Only coefficients are changed.\n\nStep IV: Balance hydrogen. Four H₂O molecules contain 8 hydrogen atoms, so place coefficient 4 before H₂.\nEQ: Fe + 4H₂O → Fe₃O₄ + 4H₂\n\nStep V: Balance iron. Fe₃O₄ contains 3 iron atoms, so place coefficient 3 before Fe.\nEQ: 3Fe + 4H₂O → Fe₃O₄ + 4H₂\n\nStep VI: Check every element again. Fe, H and O now have the same number of atoms on both sides.\nEQ: 3Fe + 4H₂O → Fe₃O₄ + 4H₂\nThis trial-based procedure using the smallest whole-number coefficients is called the hit-and-trial method.\n\n## 6. Writing Physical States and Reaction Conditions\nA chemical equation can be made more informative by including physical states:\n- (g) = gas\n- (l) = liquid\n- (aq) = aqueous solution\n- (s) = solid\n\nThe balanced iron-steam equation becomes:\nEQ: 3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)\nHere H₂O(g) indicates steam.\n\nReaction conditions such as temperature, pressure, catalyst, sunlight or chlorophyll may be written above or below the reaction arrow when needed.\nExample:\nEQ: CO(g) + 2H₂(g) → CH₃OH(l)  [340 atm]\nPhotosynthesis is represented with sunlight and chlorophyll as reaction conditions:\nEQ: 6CO₂(aq) + 12H₂O(l) → C₆H₁₂O₆(aq) + 6O₂(aq) + 6H₂O(l)  [sunlight, chlorophyll]\n\n## 7. Checkpoint Questions: Chemical Equations\nQUESTION: 1. Why should a magnesium ribbon be cleaned before burning in air?\nQUESTION: 2. Write balanced equations for:\n- Hydrogen + Chlorine → Hydrogen chloride\n- Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride\n- Sodium + Water → Sodium hydroxide + Hydrogen\nQUESTION: 3. Write balanced chemical equations with state symbols for:\n- aqueous barium chloride reacting with aqueous sodium sulphate to give insoluble barium sulphate and sodium chloride solution\n- aqueous sodium hydroxide reacting with aqueous hydrochloric acid to produce sodium chloride solution and water\n\n## 8. Types of Chemical Reactions\nDuring a chemical reaction, atoms of one element do not turn into atoms of another element. Atoms do not disappear or appear from nowhere. Chemical reactions involve breaking and making bonds between atoms to produce new substances.\n\n## 9. Combination Reactions\nACTIVITY: Activity 1.4 — Quick lime and water\n- Take a small amount of calcium oxide, or quick lime, in a beaker.\n- Slowly add water.\n- Touch the beaker and note the temperature change.\nCalcium oxide reacts vigorously with water to form slaked lime, calcium hydroxide, and releases a large amount of heat.\nEQ: CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat\nA reaction in which two or more reactants combine to form a single product is a combination reaction.\nFIGURE: Figure 1.3 shows formation of slaked lime by reaction of calcium oxide with water.\n\nKNOW: Slaked lime solution is used for whitewashing. Calcium hydroxide slowly reacts with carbon dioxide in air to form a thin layer of calcium carbonate. This layer forms after two to three days and gives a shiny finish. Marble also has the formula CaCO₃.\nEQ: Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)\n\nMore combination reactions:\nEQ: C(s) + O₂(g) → CO₂(g)\nEQ: 2H₂(g) + O₂(g) → 2H₂O(l)\n\n## 10. Exothermic Reactions\nA reaction in which heat is released along with the formation of products is called an exothermic reaction.\nBurning natural gas:\nEQ: CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)\nRespiration is also exothermic. Food is broken down during digestion, carbohydrates form glucose, and glucose reacts with oxygen in cells to provide energy.\nEQ: C₆H₁₂O₆(aq) + 6O₂(aq) → 6CO₂(aq) + 6H₂O(l) + energy\nThe decomposition of vegetable matter into compost is another exothermic process.\nQUESTION: Identify the type of reaction in Activity 1.1, where heat is given out along with formation of a single product.\n\n## 11. Decomposition Reactions\nA decomposition reaction occurs when a single reactant breaks down into two or more simpler products. It is opposite in pattern to a combination reaction.\n\nACTIVITY: Activity 1.5 — Heating ferrous sulphate\n- Take about 2 g ferrous sulphate crystals in a dry boiling tube.\n- Note their colour.\n- Heat the boiling tube over a burner or spirit lamp.\n- Observe the colour after heating.\nThe green ferrous sulphate crystals change colour and a characteristic smell of burning sulphur can be noticed.\nEQ: 2FeSO₄(s) → Fe₂O₃(s) + SO₂(g) + SO₃(g)  [heat]\nFerrous sulphate crystals lose water on heating and then decompose to ferric oxide, sulphur dioxide and sulphur trioxide.\nFIGURE: Figure 1.4 shows the correct way of heating ferrous sulphate crystals and smelling the odour.\n\nThermal decomposition of calcium carbonate:\nEQ: CaCO₃(s) → CaO(s) + CO₂(g)  [heat]\nCalcium carbonate, limestone, decomposes to calcium oxide, quick lime, and carbon dioxide. Quick lime is used in several industries, including cement manufacture. Decomposition caused by heating is called thermal decomposition.\n\nACTIVITY: Activity 1.6 — Heating lead nitrate\n- Take about 2 g lead nitrate powder in a boiling tube.\n- Hold the tube with tongs and heat it over a flame.\n- Observe the changes.\nBrown fumes of nitrogen dioxide are produced.\nEQ: 2Pb(NO₃)₂(s) → 2PbO(s) + 4NO₂(g) + O₂(g)  [heat]\nFIGURE: Figure 1.5 shows heating of lead nitrate and emission of nitrogen dioxide.\n\n## 12. Decomposition by Electricity and Light\nACTIVITY: Activity 1.7 — Electrolysis of water\n- Take a plastic mug and fit two carbon electrodes through rubber stoppers in holes at the base.\n- Connect the electrodes to a 6 V battery.\n- Fill the mug with water so the electrodes are immersed.\n- Add a few drops of dilute sulphuric acid.\n- Invert two water-filled test tubes over the electrodes.\n- Switch on the current and allow bubbles to collect.\n- Compare the volumes of the gases collected.\n- Carefully test the gases using a burning candle.\nCAUTION: Testing the gases should be performed carefully by the teacher.\nQUESTION: Is the gas volume the same in both tubes? Which gases are present?\nFIGURE: Figure 1.6 shows electrolysis of water.\n\nACTIVITY: Activity 1.8 — Silver chloride in sunlight\n- Take about 2 g silver chloride in a china dish.\n- Note its colour.\n- Place the dish in sunlight.\n- Observe the colour after some time.\nWhite silver chloride turns grey because it decomposes into silver and chlorine in sunlight.\nEQ: 2AgCl(s) → 2Ag(s) + Cl₂(g)  [sunlight]\nSilver bromide behaves similarly:\nEQ: 2AgBr(s) → 2Ag(s) + Br₂(g)  [sunlight]\nThese light-sensitive reactions have been used in black-and-white photography.\nFIGURE: Figure 1.7 shows silver chloride turning grey in sunlight as silver metal forms.\n\nDecomposition reactions may need energy in the form of heat, light or electricity. Reactions in which energy is absorbed are called endothermic reactions.\n\nACTIVITY: Endothermic observation\n- Take about 2 g barium hydroxide in a test tube.\n- Add about 1 g ammonium chloride.\n- Mix with a glass rod.\n- Touch the bottom of the test tube.\nQUESTION: What temperature change do you feel? Is the process exothermic or endothermic?\n\nQUESTION: 1. A solution of substance X is used for whitewashing. Name X, give its formula, and write its reaction with water.\nQUESTION: 2. Why is the gas volume in one test tube in Activity 1.7 double that in the other? Name the gas.\n\n## 13. Displacement Reactions\nACTIVITY: Activity 1.9 — Iron nails in copper sulphate\n- Clean three iron nails with sandpaper.\n- Take two test tubes, A and B, each containing about 10 mL copper sulphate solution.\n- Tie two nails with thread and immerse them in test tube B for about 20 minutes.\n- Keep one nail aside for comparison.\n- Remove the immersed nails after 20 minutes.\n- Compare the blue colour intensity of solutions A and B.\n- Compare the colour of the immersed nails with the nail kept aside.\nThe immersed iron nail becomes brownish and the blue colour of copper sulphate fades.\nEQ: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)\nIron displaces copper from copper sulphate. This is a displacement reaction.\nOther examples:\nEQ: Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)\nEQ: Pb(s) + CuCl₂(aq) → PbCl₂(aq) + Cu(s)\nZinc and lead are more reactive than copper and displace copper from its compounds.\nFIGURE: Figure 1.8 compares iron nails and copper sulphate solution before and after the experiment.\n\n## 14. Double Displacement and Precipitation Reactions\nACTIVITY: Activity 1.10 — Sodium sulphate and barium chloride\n- Take about 3 mL sodium sulphate solution in one test tube.\n- Take about 3 mL barium chloride solution in another.\n- Mix the solutions.\n- Observe the product.\nA white insoluble substance forms. An insoluble solid formed in a reaction is called a precipitate. A reaction that produces a precipitate can be called a precipitation reaction.\nEQ: Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s) + 2NaCl(aq)\nBarium sulphate is the white precipitate. The reaction involves exchange of ions between the reactants, so it is a double displacement reaction.\nFIGURE: Figure 1.9 shows formation of barium sulphate and sodium chloride.\n\nQUESTION: Recall Activity 1.2, where lead(II) nitrate and potassium iodide solutions were mixed:\n- What was the colour of the precipitate?\n- Name the compound precipitated.\n- Write the balanced chemical equation.\n- Decide whether it is also a double displacement reaction.\n\n## 15. Oxidation and Reduction\nACTIVITY: Activity 1.11 — Heating copper powder\n- Heat a china dish containing about 1 g copper powder.\n- Observe the surface of the copper.\nThe copper becomes coated with black copper(II) oxide because oxygen is added to copper.\nEQ: 2Cu + O₂ → 2CuO  [heat]\nFIGURE: Figure 1.10 shows oxidation of copper to copper oxide.\n\nIf hydrogen is passed over heated copper(II) oxide, the black coating turns brown as copper is formed.\nEQ: CuO + H₂ → Cu + H₂O  [heat]\n\nIf a substance gains oxygen during a reaction, it is oxidised. If a substance loses oxygen, it is reduced. In the CuO + H₂ reaction, CuO loses oxygen and is reduced, while H₂ gains oxygen and is oxidised. Reactions in which oxidation and reduction occur together are oxidation-reduction reactions, or redox reactions.\n\nOther redox examples:\nEQ: ZnO + C → Zn + CO\nHere carbon is oxidised to CO and ZnO is reduced to Zn.\nEQ: MnO₂ + 4HCl → MnCl₂ + 2H₂O + Cl₂\nHere HCl is oxidised to Cl₂ while MnO₂ is reduced to MnCl₂.\n\nMore generally:\n- oxidation = gain of oxygen or loss of hydrogen\n- reduction = loss of oxygen or gain of hydrogen\n\nQUESTION: Recall Activity 1.1. When magnesium burns in oxygen and forms magnesium oxide, is magnesium oxidised or reduced?\n\n## 16. Effects of Oxidation in Everyday Life\n### Corrosion\nIron articles may be shiny when new but develop a reddish-brown coating after exposure. This is rusting. A metal is said to corrode when it is attacked by substances around it, such as moisture or acids.\nExamples include:\n- reddish-brown rust on iron\n- black coating on silver\n- green coating on copper\nCorrosion damages car bodies, bridges, iron railings, ships and other metal objects, especially those made of iron.\n\n### Rancidity\nWhen fats and oils are oxidised, they become rancid and their smell and taste change.\nWays to slow oxidation include:\n- adding antioxidants\n- keeping food in airtight containers\n- reducing contact with oxygen\nChips packets are commonly flushed with nitrogen to reduce oxidation.\n\nQUESTION: 1. Why does the colour of copper sulphate solution change when an iron nail is dipped in it?\nQUESTION: 2. Give an example of a double displacement reaction other than Activity 1.10.\nQUESTION: 3. Identify the substances oxidised and reduced in:\nEQ: 4Na(s) + O₂(g) → 2Na₂O(s)\nEQ: CuO(s) + H₂(g) → Cu(s) + H₂O(l)\n\n## 17. What You Have Learnt\n- A complete chemical equation symbolically represents reactants, products and their physical states.\n- A chemical equation is balanced so that the number of atoms of each type is the same on the reactant and product sides.\n- In a combination reaction, two or more substances combine to form a new single substance.\n- Decomposition reactions are opposite to combination reactions; one substance decomposes to give two or more substances.\n- Exothermic reactions release heat along with products.\n- Endothermic reactions absorb energy.\n- In a displacement reaction, one element displaces another from its compound.\n- In a double displacement reaction, atoms or groups of atoms, usually ions, are exchanged.\n- Precipitation reactions produce insoluble salts.\n- Oxidation involves gain of oxygen or loss of hydrogen.\n- Reduction involves loss of oxygen or gain of hydrogen.\n\n## 18. Exercises\nQUESTION: 1. For 2PbO(s) + C(s) → 2Pb(s) + CO₂(g), which statements are incorrect?\n- Lead is getting reduced.\n- Carbon dioxide is getting oxidised.\n- Carbon is getting oxidised.\n- Lead oxide is getting reduced.\nOptions: (i) (a) and (b), (ii) (a) and (c), (iii) (a), (b) and (c), (iv) all.\n\nQUESTION: 2. Fe₂O₃ + 2Al → Al₂O₃ + 2Fe is an example of which type of reaction?\n- combination\n- double displacement\n- decomposition\n- displacement\n\nQUESTION: 3. What happens when dilute hydrochloric acid is added to iron filings?\n- Hydrogen gas and iron chloride are produced.\n- Chlorine gas and iron hydroxide are produced.\n- No reaction takes place.\n- Iron salt and water are produced.\n\nQUESTION: 4. What is a balanced chemical equation? Why should chemical equations be balanced?\n\nQUESTION: 5. Translate each statement into a chemical equation and balance it:\n- Hydrogen gas combines with nitrogen to form ammonia.\n- Hydrogen sulphide gas burns in air to give water and sulphur dioxide.\n- Barium chloride reacts with aluminium sulphate to give aluminium chloride and a precipitate of barium sulphate.\n- Potassium metal reacts with water to give potassium hydroxide and hydrogen gas.\n\nQUESTION: 6. Balance:\nEQ: HNO₃ + Ca(OH)₂ → Ca(NO₃)₂ + H₂O\nEQ: NaOH + H₂SO₄ → Na₂SO₄ + H₂O\nEQ: NaCl + AgNO₃ → AgCl + NaNO₃\nEQ: BaCl₂ + H₂SO₄ → BaSO₄ + HCl\n\nQUESTION: 7. Write balanced equations for:\n- Calcium hydroxide + Carbon dioxide → Calcium carbonate + Water\n- Zinc + Silver nitrate → Zinc nitrate + Silver\n- Aluminium + Copper chloride → Aluminium chloride + Copper\n- Barium chloride + Potassium sulphate → Barium sulphate + Potassium chloride\n\nQUESTION: 8. Write balanced equations and identify the reaction type:\n- Potassium bromide(aq) + Barium iodide(aq) → Potassium iodide(aq) + Barium bromide(s)\n- Zinc carbonate(s) → Zinc oxide(s) + Carbon dioxide(g)\n- Hydrogen(g) + Chlorine(g) → Hydrogen chloride(g)\n- Magnesium(s) + Hydrochloric acid(aq) → Magnesium chloride(aq) + Hydrogen(g)\n\nQUESTION: 9. What are exothermic and endothermic reactions? Give examples.\n\nQUESTION: 10. Why is respiration considered an exothermic reaction?\n\nQUESTION: 11. Why are decomposition reactions called the opposite of combination reactions? Write equations for each.\n\nQUESTION: 12. Write one equation each for decomposition reactions in which energy is supplied as heat, light and electricity.\n\nQUESTION: 13. What is the difference between displacement and double displacement reactions? Write equations for each.\n\nQUESTION: 14. During refining of silver, silver is recovered from silver nitrate solution by displacement with copper metal. Write the reaction.\n\nQUESTION: 15. What is a precipitation reaction? Explain with examples.\n\nQUESTION: 16. Explain oxidation and reduction in terms of gain or loss of oxygen, giving two examples of each.\n\nQUESTION: 17. A shiny brown element X becomes black when heated in air. Name X and the black compound formed.\n\nQUESTION: 18. Why is paint applied to iron articles?\n\nQUESTION: 19. Why are oil- and fat-containing food items flushed with nitrogen?\n\nQUESTION: 20. Explain with one example each:\n- corrosion\n- rancidity\n\n## 19. Group Activity\nACTIVITY: Compare exothermic and endothermic changes\n- Take four beakers and label them A, B, C and D.\n- Put 25 mL water in beakers A, B and C, and copper sulphate solution in beaker D.\n- Measure and record the temperature of each liquid.\n- Add two spatulas of potassium sulphate to A.\n- Add two spatulas of ammonium nitrate to B.\n- Add two spatulas of anhydrous copper sulphate to C.\n- Add fine iron filings to D.\n- Stir each mixture.\n- Measure and record the final temperature of each mixture.\nQUESTION: Determine which of the changes are exothermic and which are endothermic.",'The chapter includes chemical equations, balancing, reaction types, redox, corrosion and rancidity.','Use the in-chapter questions and exercises to practise after reading.', ['What are substances formed by a reaction called?',['Reactants','Products','Elements only','Mixtures only'],1], ['In a balanced equation, atoms of each element are?',['Equal on both sides','Always fewer on the right','Destroyed','Created from nothing'],0]);
add(10,'Social Science','Federalism in India','Understand different levels of government.','🇮🇳','Federalism divides governing powers between different levels of government. In India, the Union and state governments have constitutionally assigned powers; local self-government is another important level.','Some subjects belong to the Union List; others belong to the State List or Concurrent List.','Find out which level of government manages a nearby local service.', ['Federalism involves?',['Different levels of government','Only one local club','No constitution','No states'],0], ['In India’s Union and states have powers assigned by the?',['Constitution','A weather report','A game','A novel'],0]);
/* Class 10 Health and Physical Education chapters and original NCERT PDFs. */
[
  "Physical Education: Relation with other Subjects",
  "Effects of Physical Activities on Human Body",
  "Growth and Development during Adolescence",
  "Individual Games and Sports I",
  "Individual Games and Sports II",
  "Team Games and Sports I",
  "Team Games and Sports II",
  "Yoga for Healthy Living",
  "Dietary Considerations and Food Quality",
  "Safety Measures for Healthy Living",
  "Healthy Community Living",
  "Social Health",
  "Agencies and Awards Promoting Health, Sports and Yoga"
].forEach((title,index)=>{
  const chapter=index+1;
  const pdf='jehp'+String(100+chapter)+'.pdf';
  window.TLW_LESSONS.push({
    id:'10-health-physical-education-ch'+String(chapter).padStart(2,'0'),
    grade:10,
    subject:'Health and Physical Education',
    title,
    description:'NCERT Class 10 Health and Physical Education · Chapter '+chapter,
    emoji:'🏃',
    concept:'Chapter '+chapter+': '+title,
    example:'',
    tip:'',
    minutes:10,
    sourceChapter:chapter,
    sourcePdf:pdf,
    chapterStartPage:1,
    originalPdfTitle:'NCERT Class 10 Health and Physical Education - Chapter '+chapter+': '+title,
    questions:[]
  });
});


/* Class 2 Hindi topics from NCERT Sarangi 2. */
[
  ['नीमा की दादी','इकाई 1: परिवार'],
  ['घर','इकाई 1: परिवार'],
  ['माला की चाँदी की पायल','इकाई 1: परिवार'],
  ['माँ','इकाई 1: परिवार'],
  ['थाथू और मैं','इकाई 1: परिवार'],
  ['चींटा','इकाई 1: परिवार'],
  ['टिल्लू जी','इकाई 1: परिवार'],
  ['नटखट दिवाकर','इकाई 1: परिवार · केवल पढ़ने के लिए'],
  ['तीन दोस्त','इकाई 2: रंग ही रंग'],
  ['दुनिया रंग-बिरंगी','इकाई 2: रंग ही रंग'],
  ['कौन','इकाई 2: रंग ही रंग'],
  ['बैंगनी जोजो','इकाई 2: रंग ही रंग'],
  ['तोसिया का सपना','इकाई 2: रंग ही रंग'],
  ['तालाब','इकाई 3: हरी-भरी धरती'],
  ['बीज','इकाई 3: हरी-भरी धरती'],
  ['किसान','इकाई 3: हरी-भरी धरती'],
  ['मूली','इकाई 3: हरी-भरी धरती'],
  ['बरसात और मेंढक','इकाई 3: हरी-भरी धरती'],
  ['उठो उठो','इकाई 3: हरी-भरी धरती · केवल पढ़ने के लिए'],
  ['शेर और चूहे की दोस्ती','इकाई 4: मित्रता'],
  ['आउट','इकाई 4: मित्रता'],
  ['खेल सन्ध्या','इकाई 4: मित्रता · केवल पढ़ने के लिए'],
  ['छुपन-छुपाई','इकाई 4: मित्रता'],
  ['हाथी साइकिल चला रहा था','इकाई 4: मित्रता'],
  ['डरो मत!','इकाई 4: मित्रता · केवल पढ़ने के लिए'],
  ['चार दिशाएँ','इकाई 5: आकाश'],
  ['चंदा मामा','इकाई 5: आकाश'],
  ['गिरे ताल में चंदा मामा','इकाई 5: आकाश'],
  ['सबसे बड़ा छाता','इकाई 5: आकाश'],
  ['बादल','इकाई 5: आकाश'],
  ['फिर फुर्र!','इकाई 5: आकाश · केवल पढ़ने के लिए']
].forEach(([title,unit],index)=>{
  window.TLW_LESSONS.push({
    id:'2-hindi-sarangi-'+String(index+1).padStart(2,'0'),
    grade:2,
    subject:'Hindi',
    title,
    description:unit+' · NCERT सारंगी 2',
    emoji:'📕',
    concept:'यह कक्षा 2 हिंदी का विषय NCERT सारंगी 2 पाठ्यपुस्तक की विषय-सूची से जोड़ा गया है। विस्तृत पाठ सामग्री बाद में जोड़ी जाएगी।',
    example:'',
    tip:'',
    minutes:5,
    questions:[]
  });
});

/* Hindi subject placeholders for Classes 3–10. Detailed NCERT topics/content can be added class-wise later. */
for (let grade=3; grade<=10; grade++) {
  window.TLW_LESSONS.push({
    id:grade+'-hindi-starter',
    grade,
    subject:'Hindi',
    title:'हिंदी',
    description:'कक्षा '+grade+' हिंदी · विषय जोड़ा गया',
    emoji:'📕',
    concept:'कक्षा '+grade+' के लिए हिंदी विषय जोड़ा गया है। संबंधित NCERT पुस्तक के अध्याय और विस्तृत सामग्री बाद में जोड़ी जा सकती है।',
    example:'',
    tip:'हिंदी के पाठ पढ़ें, बोलें और लिखने का नियमित अभ्यास करें।',
    minutes:5,
    questions:[]
  });
}
