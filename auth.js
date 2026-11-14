(()=>{
'use strict';

const ACCOUNT_KEY='Threelittlewonders-local-accounts-v1';
const SESSION_KEY='Threelittlewonders-local-session-v1';
const PROGRESS_KEY='Threelittlewonders-progress-v1';
const $=id=>document.getElementById(id);
const gradeName=g=>g===-2?'Nursery':g===-1?'LKG':g===0?'UKG':'Class '+g;
let activeTab='login';

function readAccounts(){
 try{
  const value=JSON.parse(localStorage.getItem(ACCOUNT_KEY)||'{}');
  return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 }catch{return {};}
}
function writeAccounts(accounts){
 localStorage.setItem(ACCOUNT_KEY,JSON.stringify(accounts));
}
function readSession(){
 try{
  const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
  return value&&typeof value.email==='string'?value:null;
 }catch{return null;}
}
function writeSession(email){
 localStorage.setItem(SESSION_KEY,JSON.stringify({email,loggedInAt:new Date().toISOString()}));
}
function clearSession(){
 localStorage.removeItem(SESSION_KEY);
}
function normalizeEmail(value){
 return String(value||'').trim().toLowerCase();
}
function validEmail(value){
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function bytesToBase64(bytes){
 let binary='';
 bytes.forEach(b=>binary+=String.fromCharCode(b));
 return btoa(binary);
}
function base64ToBytes(value){
 const binary=atob(value);
 return Uint8Array.from(binary,ch=>ch.charCodeAt(0));
}
async function derivePasswordHash(password,saltBase64){
 if(!window.crypto?.subtle)throw new Error('Secure browser cryptography is unavailable.');
 const key=await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(password),
  {name:'PBKDF2'},
  false,
  ['deriveBits']
 );
 const bits=await crypto.subtle.deriveBits(
  {name:'PBKDF2',salt:base64ToBytes(saltBase64),iterations:150000,hash:'SHA-256'},
  key,
  256
 );
 return bytesToBase64(new Uint8Array(bits));
}
function newSalt(){
 const bytes=new Uint8Array(16);
 crypto.getRandomValues(bytes);
 return bytesToBase64(bytes);
}
function setStatus(id,message,success=false){
 const el=$(id);
 if(!el)return;
 el.textContent=message||'';
 el.classList.toggle('success',!!success);
}
function accountForSession(){
 const session=readSession();
 if(!session)return null;
 const accounts=readAccounts();
 return accounts[normalizeEmail(session.email)]||null;
}
function setCurrentClass(grade){
 const select=$('classSelect');
 if(!select||grade===undefined||grade===null)return;
 const value=String(grade);
 if([...select.options].some(option=>option.value===value)){
  select.value=value;
  select.dispatchEvent(new Event('change',{bubbles:true}));
 }
 try{
  const progress=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');
  progress.grade=Number(grade);
  if(!Array.isArray(progress.completed))progress.completed=[];
  localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));
 }catch{}
}
function closeUserMenu(){
 const menu=$('authUserMenu');
 if(menu)menu.hidden=true;
}
function renderAuthState(){
 const account=accountForSession();
 const label=$('authButtonLabel');
 const button=$('authButton');
 const mobile=$('mobileAuthButton');
 const menu=$('authUserMenu');
 if(account){
  const first=String(account.displayName||'Student').trim().split(/\s+/)[0]||'Student';
  if(label)label.textContent=first;
  if(button){
   button.setAttribute('aria-haspopup','menu');
   button.setAttribute('aria-expanded',menu&&!menu.hidden?'true':'false');
   button.title='Open '+first+' account menu';
  }
  if($('authUserName'))$('authUserName').textContent=account.displayName||'Student';
  if($('authUserGrade'))$('authUserGrade').textContent=gradeName(Number(account.grade));
  if(mobile)mobile.textContent='👤 '+first+' · Log out';
  if($('learningNavLabel'))$('learningNavLabel').textContent='My Learning Dashboard';
  if($('mobileLearningNavLabel'))$('mobileLearningNavLabel').textContent='My Learning Dashboard';
 }else{
  if(label)label.textContent='Log in';
  if(button){
   button.setAttribute('aria-haspopup','dialog');
   button.removeAttribute('aria-expanded');
   button.title='Log in or create an account';
  }
  if(menu)menu.hidden=true;
  if(mobile)mobile.textContent='Log in / Sign up';
  if($('learningNavLabel'))$('learningNavLabel').textContent='My learning';
  if($('mobileLearningNavLabel'))$('mobileLearningNavLabel').textContent='My learning';
 }
 window.dispatchEvent(new CustomEvent('tlw-auth-change',{detail:account?{loggedIn:true,displayName:account.displayName,grade:Number(account.grade)}:{loggedIn:false}}));
}
function switchTab(tab){
 activeTab=tab==='signup'?'signup':'login';
 const loginForm=$('authLoginForm');
 const signupForm=$('authSignupForm');
 if(loginForm)loginForm.hidden=activeTab!=='login';
 if(signupForm)signupForm.hidden=activeTab!=='signup';
 const loginTab=$('authLoginTab');
 const signupTab=$('authSignupTab');
 if(loginTab){
  loginTab.classList.toggle('active',activeTab==='login');
  loginTab.setAttribute('aria-selected',activeTab==='login'?'true':'false');
 }
 if(signupTab){
  signupTab.classList.toggle('active',activeTab==='signup');
  signupTab.setAttribute('aria-selected',activeTab==='signup'?'true':'false');
 }
 if($('authTitle'))$('authTitle').textContent=activeTab==='login'?'Welcome back':'Create your account';
 setStatus('authLoginStatus','');
 setStatus('authSignupStatus','');
 requestAnimationFrame(()=>{
  const target=activeTab==='login'?$('authLoginEmail'):$('authSignupName');
  target?.focus();
 });
}
function openAuth(tab='login'){
 const modal=$('authModal');
 if(!modal)return;
 closeUserMenu();
 switchTab(tab);
 modal.hidden=false;
 document.body.classList.add('modal-open');
}
function closeAuth(){
 const modal=$('authModal');
 if(!modal)return;
 modal.hidden=true;
 document.body.classList.remove('modal-open');
}
async function createAccount(event){
 event.preventDefault();
 const displayName=String($('authSignupName')?.value||'').trim();
 const gradeValue=$('authSignupGrade')?.value??'';
 const email=normalizeEmail($('authSignupEmail')?.value);
 const password=String($('authSignupPassword')?.value||'');
 const confirmPassword=String($('authSignupConfirm')?.value||'');
 setStatus('authSignupStatus','');

 if(displayName.length<2){
  setStatus('authSignupStatus','Please enter a student display name with at least 2 characters.');
  $('authSignupName')?.focus();
  return;
 }
 if(gradeValue===''){
  setStatus('authSignupStatus','Please select the student class.');
  $('authSignupGrade')?.focus();
  return;
 }
 if(!validEmail(email)){
  setStatus('authSignupStatus','Please enter a valid parent or guardian email.');
  $('authSignupEmail')?.focus();
  return;
 }
 if(password.length<8){
  setStatus('authSignupStatus','Password must contain at least 8 characters.');
  $('authSignupPassword')?.focus();
  return;
 }
 if(password!==confirmPassword){
  setStatus('authSignupStatus','The two passwords do not match.');
  $('authSignupConfirm')?.focus();
  return;
 }
 if(!window.crypto?.subtle){
  setStatus('authSignupStatus','This browser cannot create a secure local password. Please use a modern browser.');
  return;
 }
 const accounts=readAccounts();
 if(accounts[email]){
  setStatus('authSignupStatus','An account with this email already exists on this browser. Please log in.');
  return;
 }
 const submit=event.submitter;
 if(submit){submit.disabled=true;submit.textContent='Creating account...';}
 try{
  const salt=newSalt();
  const passwordHash=await derivePasswordHash(password,salt);
  accounts[email]={
   email,
   displayName,
   grade:Number(gradeValue),
   salt,
   passwordHash,
   createdAt:new Date().toISOString()
  };
  writeAccounts(accounts);
  writeSession(email);
  setCurrentClass(Number(gradeValue));
  setStatus('authSignupStatus','Account created successfully.',true);
  renderAuthState();
  event.target.reset();
  setTimeout(closeAuth,250);
 }catch(error){
  setStatus('authSignupStatus',error?.message||'Could not create the account in this browser.');
 }finally{
  if(submit){submit.disabled=false;submit.textContent='Create account';}
 }
}
async function login(event){
 event.preventDefault();
 const email=normalizeEmail($('authLoginEmail')?.value);
 const password=String($('authLoginPassword')?.value||'');
 setStatus('authLoginStatus','');
 if(!validEmail(email)){
  setStatus('authLoginStatus','Please enter the parent or guardian email used for this account.');
  return;
 }
 const accounts=readAccounts();
 const account=accounts[email];
 if(!account){
  setStatus('authLoginStatus','No account with this email exists on this browser.');
  return;
 }
 const submit=event.submitter;
 if(submit){submit.disabled=true;submit.textContent='Logging in...';}
 try{
  const passwordHash=await derivePasswordHash(password,account.salt);
  if(passwordHash!==account.passwordHash){
   setStatus('authLoginStatus','Incorrect password.');
   return;
  }
  writeSession(email);
  setCurrentClass(Number(account.grade));
  setStatus('authLoginStatus','Login successful.',true);
  renderAuthState();
  event.target.reset();
  setTimeout(closeAuth,220);
 }catch(error){
  setStatus('authLoginStatus',error?.message||'Could not log in on this browser.');
 }finally{
  if(submit){submit.disabled=false;submit.textContent='Log in';}
 }
}
function logout(){
 clearSession();
 closeUserMenu();
 renderAuthState();
}
function handleDesktopAuth(){
 const account=accountForSession();
 if(!account){
  openAuth('login');
  return;
 }
 const menu=$('authUserMenu');
 if(!menu)return;
 menu.hidden=!menu.hidden;
 $('authButton')?.setAttribute('aria-expanded',menu.hidden?'false':'true');
}
function handleMobileAuth(){
 if(accountForSession()){
  logout();
  const mobileMenu=$('mobileMenu');
  if(mobileMenu)mobileMenu.hidden=true;
  const menuButton=$('mobileMenuBtn');
  if(menuButton)menuButton.setAttribute('aria-expanded','false');
 }else{
  openAuth('login');
 }
}
function install(){
 $('authButton')?.addEventListener('click',handleDesktopAuth);
 $('mobileAuthButton')?.addEventListener('click',handleMobileAuth);
 $('authLogoutButton')?.addEventListener('click',logout);
 $('authLoginTab')?.addEventListener('click',()=>switchTab('login'));
 $('authSignupTab')?.addEventListener('click',()=>switchTab('signup'));
 document.querySelector('[data-auth-open-signup]')?.addEventListener('click',()=>switchTab('signup'));
 document.querySelector('[data-auth-open-login]')?.addEventListener('click',()=>switchTab('login'));
 $('authCloseButton')?.addEventListener('click',closeAuth);
 $('authLoginForm')?.addEventListener('submit',login);
 $('authSignupForm')?.addEventListener('submit',createAccount);
 $('authMyLearningLink')?.addEventListener('click',closeUserMenu);
 $('authModal')?.addEventListener('click',event=>{
  if(event.target===$('authModal'))closeAuth();
 });
 document.addEventListener('click',event=>{
  if(!$('navAuth')?.contains(event.target))closeUserMenu();
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   if(!$('authModal')?.hidden)closeAuth();
   else closeUserMenu();
  }
 });
 window.addEventListener('storage',renderAuthState);
 renderAuthState();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();