(()=>{
'use strict';

const CONFIG={
  spreadsheetId:'1emxwYUpM0g1nasUpBXfO2Zl16nJL6L6VUnyfixoV70g',
  sheetName:'Lessons',
  timeoutMs:5000,
  cacheKey:'tlw-google-drive-lessons-v1',
  cacheMaxAgeMs:24*60*60*1000
};

const csvUrl=`https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(CONFIG.sheetName)}`;

function parseCsv(text){
  const rows=[];
  let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}
      else if(ch==='"')quoted=false;
      else field+=ch;
    }else{
      if(ch==='"')quoted=true;
      else if(ch===','){row.push(field);field='';}
      else if(ch==='\n'){row.push(field);rows.push(row);row=[];field='';}
      else if(ch!=='\r')field+=ch;
    }
  }
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows;
}

function jsonArray(value){
  try{
    const parsed=JSON.parse(value||'[]');
    return Array.isArray(parsed)?parsed.map(String):[];
  }catch{return [];}
}

function boolValue(value){
  return String(value).trim().toLowerCase()!=='false';
}

function readCachedCsv(){
  try{
    const cached=JSON.parse(localStorage.getItem(CONFIG.cacheKey)||'null');
    if(!cached||typeof cached.csv!=='string'||!cached.savedAt)return '';
    if(Date.now()-cached.savedAt>CONFIG.cacheMaxAgeMs)return '';
    return cached.csv;
  }catch{return '';}
}

function writeCachedCsv(csv){
  try{
    localStorage.setItem(CONFIG.cacheKey,JSON.stringify({savedAt:Date.now(),csv}));
  }catch{}
}

function applyRows(rows){
  if(!Array.isArray(window.TLW_LESSONS)||rows.length<2)return false;
  const headers=rows[0].map(x=>String(x).trim());
  const objects=rows.slice(1).filter(r=>r.some(Boolean)).map(r=>
    Object.fromEntries(headers.map((h,i)=>[h,r[i]??'']))
  );
  const localById=new Map(window.TLW_LESSONS.map(lesson=>[lesson.id,lesson]));
  const merged=[...window.TLW_LESSONS];
  let matched=0;

  objects.forEach(row=>{
    if(!row.id||!boolValue(row.active))return;
    const base=localById.get(row.id);
    if(!base)return;
    matched++;

    if(row.grade!=='')base.grade=Number(row.grade);
    if(row.subject)base.subject=row.subject;
    if(row.title)base.title=row.title;
    if(row.description!=='')base.description=row.description;
    const preserveImportedPdf=base.grade===10&&base.subject==='Maths'&&Number(base.sourceChapter)>=1;
    if(row.main_content!==''&&!preserveImportedPdf)base.concept=row.main_content;
    if(row.minutes!=='')base.minutes=Number(row.minutes)||base.minutes;

    const questions=[];
    for(let n=1;n<=2;n++){
      const text=row[`quiz_${n}_question`]||'';
      const options=jsonArray(row[`quiz_${n}_options_json`]);
      const answerRaw=row[`quiz_${n}_answer_index`];
      if(text&&options.length&&answerRaw!==''){
        const answer=Number(answerRaw);
        questions.push({text,options,answer:Number.isInteger(answer)?answer:0});
      }
    }
    if(questions.length)base.questions=questions;
    base.contentSource='google-drive';
  });

  if(!matched)return false;
  window.TLW_LESSONS.splice(0,window.TLW_LESSONS.length,...merged);
  return true;
}

async function loadDriveContent(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),CONFIG.timeoutMs);
  try{
    const response=await fetch(csvUrl,{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const text=await response.text();
    if(!text||/^\s*</.test(text))throw new Error('Google Sheet is not publicly readable');
    const ok=applyRows(parseCsv(text));
    if(!ok)throw new Error('No matching active lessons found in Google Drive');
    writeCachedCsv(text);
    window.TLW_CONTENT_SOURCE='google-drive';
    window.TLW_DRIVE_STATUS={connected:true,source:'live',spreadsheetId:CONFIG.spreadsheetId,sheetName:CONFIG.sheetName};
    return true;
  }catch(error){
    const cached=readCachedCsv();
    if(cached&&applyRows(parseCsv(cached))){
      console.info('ThreeLittleWonders: using cached Google Drive lesson data.',error?.message||error);
      window.TLW_CONTENT_SOURCE='google-drive-cache';
      window.TLW_DRIVE_STATUS={connected:true,source:'cache',spreadsheetId:CONFIG.spreadsheetId,sheetName:CONFIG.sheetName,error:error?.message||String(error)};
      return true;
    }
    console.info('ThreeLittleWonders: using local lesson data.',error?.message||error);
    window.TLW_CONTENT_SOURCE='local';
    window.TLW_DRIVE_STATUS={connected:false,source:'local',spreadsheetId:CONFIG.spreadsheetId,sheetName:CONFIG.sheetName,error:error?.message||String(error)};
    return false;
  }finally{
    clearTimeout(timer);
  }
}

window.TLW_DRIVE_CONFIG=Object.freeze({...CONFIG,csvUrl});
window.TLW_DRIVE_READY=loadDriveContent();
})();