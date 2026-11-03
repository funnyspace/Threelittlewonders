(function(){
'use strict';
const lessons=(window.TLW_LESSONS||[]).filter(l=>l&&l.grade===10&&l.subject==='Science');
const exact=[
 ["Y ou","You"],["I n","In"],["H ow","How"],["W e","We"],["B efore","Before"],["E lectricity","Electricity"],
 ["## 2.1 UNDERSTANDING THE CHEMIC","## 2.1 UNDERSTANDING THE CHEMICAL PROPERTIES OF ACIDS AND BASES"],
 ["## 2.1.3 How do Metal Carbonates and Metal\nHydrogencarbonates React with Acids?","## 2.1.3 How do Metal Carbonates and Metal Hydrogencarbonates React with Acids?"],
 ["## 2.2 WHA VE IN","## 2.2 WHAT DO ALL ACIDS AND BASES HAVE IN COMMON?"],
 ["## 2.3.1 Impor tance of pH in Ever","## 2.3.1 Importance of pH in Everyday Life"],
 ["## 2.4 MORE ABOUT SAL","## 2.4 MORE ABOUT SALTS"],
 ["## 3.1 PHYSIC AL PROPERTIES","## 3.1 PHYSICAL PROPERTIES"],
 ["## 3.2 CHEMIC AL PROPERTIES OF MET","## 3.2 CHEMICAL PROPERTIES OF METALS"],
 ["## 3.2.4 How do Metals react with Solutions of other Metal","## 3.2.4 How do Metals react with Solutions of other Metals?"],
 ["## 3.3 HOW DO METALS AND NON-MET","## 3.3 HOW DO METALS AND NON-METALS REACT?"],
 ["## 3.4 OCCURRENCE OF MET","## 3.4 OCCURRENCE OF METALS"],
 ["## 3.4.5 Extracting Metals towards the Top of the","## 3.4.5 Extracting Metals towards the Top of the Activity Series"],
 ["## 5.1 WHA","## 5.1 WHAT ARE LIFE PROCESSES?"],
 ["## 5.3 RESPIR","## 5.3 RESPIRATION"],
 ["## 5.4 TR ANSPORT","## 5.4 TRANSPORTATION"],
 ["## 5.5 EX CRETION","## 5.5 EXCRETION"],
 ["## 6.2 COORDINATION IN PL ANTS","## 6.2 COORDINATION IN PLANTS"],
 ["## 7.1 DO ORG ANISMS CREA","## 7.1 DO ORGANISMS CREATE EXACT COPIES OF THEMSELVES?"],
 ["## 7.2 MODES OF REPRODUCTION USED BY SINGLE","## 7.2 MODES OF REPRODUCTION USED BY SINGLE ORGANISMS"],
 ["## 8.1 A CCUMUL ATION OF V ARIA\nVARIA TION ARIATION DURING REPRODUCTION","## 8.1 ACCUMULATION OF VARIATION DURING REPRODUCTION"],
 ["## 8.2.2 Rules for the Inheritance of Traits – (b)","## 8.2.2 Rules for the Inheritance of Traits - Mendel's Contributions"],
 ["## 9.2 SPHERIC AL MIRRORS","## 9.2 SPHERICAL MIRRORS"],
 ["## 9.2.2 Representation of Images Formed by Spherical","## 9.2.2 Representation of Images Formed by Spherical Mirrors Using Ray Diagrams"],
 ["## 10.4 DISPERSION OF WHITE LIGHT BY A GL ASS PRISM","## 10.4 DISPERSION OF WHITE LIGHT BY A GLASS PRISM"],
 ["## 11.4 OHM’S LA","## 11.4 OHM'S LAW"],
 ["## 11.5 FA CTORS ON WHICH THE RESIST","## 11.5 FACTORS ON WHICH THE RESISTANCE OF A CONDUCTOR DEPENDS"],
 ["## 11.7.1 Practical Applications of Heating Effect of","## 11.7.1 Practical Applications of Heating Effect of Electric Current"],
 ["## 13.1 ECO -SYSTEM — WHA","## 13.1 ECO-SYSTEM - WHAT ARE ITS COMPONENTS?"]
];
lessons.forEach(lesson=>{
 let s=String(lesson.concept||'');
 exact.forEach(([a,b])=>{s=s.split(a).join(b);});
 s=s.replace(/\n## 0\.5 g of sodium hydrogencarbonate/g,"\n0.5 g of sodium hydrogencarbonate");
 s=s.replace(/\n## 3\.10 mL of a solution of NaOH/g,"\nQUESTION: 3. 10 mL of a solution of NaOH");
 s=s.replace(/\n## 30\.5 kJ\/mol is released\./g,"\n30.5 kJ/mol is released.");
 s=s.replace(/\n## 3\.00 m/g,"\n3.00 m");
 s=s.replace(/\n## 5\.00 \+ 1\.50/g,"\n5.00 + 1.50");
 s=s.replace(/\n## 10\.2 \(b\)\] and not at the retina itself\./g,"\n10.2 (b)] and not at the retina itself.");
 s=s.replace(/\n## 10\.10 shows the actual and apparent positions of the/g,"\nFig. 10.10 shows the actual and apparent positions of the");
 s=s.replace(/\n## 0\.50 A\. What is the power of the bulb\?/g,"\n0.50 A. What is the power of the bulb?");
 s=s.replace(/\s+1 3 \. 2 HOW DO OUR ACTIVITIES AFFECT THE ENVIRONMENT\?/g,"\n## 13.2 HOW DO OUR ACTIVITIES AFFECT THE ENVIRONMENT?");
 s=s.replace(/\n\d{2,3}\s+Science\b/g,"");
 s=s.replace(/\n(?:Acids, Bases and Salts|Metals and Non-metals|Carbon and its Compounds|Life Processes|Control and Coordination|How do Organisms Reproduce\?|Heredity|Light\s*[-–]\s*Reflection and Refraction|The Human Eye and the Colourful World|Electricity|Our Environment)\s+\d{2,3}\b/g,"");
 s=s.replace(/[ \t]{2,}/g," ");
 s=s.replace(/^FIGURE:.*$/gmi,"");
 s=s.replace(/!\[[^\]]*\]\([^\)]+\)/g,"");
 s=s.replace(/<figure\b[\s\S]*?<\/figure>/gi,"");
 s=s.replace(/<img\b[^>]*>/gi,"");
 s=s.replace(/\n{3,}/g,"\n\n");
 lesson.concept=s.trim();
 delete lesson.image;
 delete lesson.images;
 delete lesson.figure;
 delete lesson.figures;
 delete lesson.thumbnail;
 delete lesson.poster;
 delete lesson.cover;
});
})();