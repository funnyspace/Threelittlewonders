(()=>{
'use strict';

const config=window.TLW_CLOUD_CONFIG||{};
const firebaseConfig=config.firebase||{};
const configured=!!(
  config.enabled&&
  firebaseConfig.apiKey&&
  firebaseConfig.authDomain&&
  firebaseConfig.projectId&&
  firebaseConfig.appId
);

const bridge={
  enabled:configured,
  provider:'firebase',
  status:configured?'loading':'local',
  currentUser:null,
  currentProfile:null,
  ready:Promise.resolve(false),
  signup:async()=>{throw new Error('Cloud sync is not configured.');},
  login:async()=>{throw new Error('Cloud sync is not configured.');},
  logout:async()=>{},
  loadLearning:async()=>null,
  saveLearning:async()=>false,
  sendPasswordReset:async()=>{throw new Error('Cloud sync is not configured.');}
};
window.TLWCloud=bridge;

function emit(name,detail){
  window.dispatchEvent(new CustomEvent(name,{detail}));
}

if(!configured){
  emit('tlw-cloud-ready',{enabled:false,status:'local'});
  return;
}

bridge.ready=(async()=>{
  const version='13.3.0';
  const appSdk=await import('https://www.gstatic.com/firebasejs/'+version+'/firebase-app.js');
  const authSdk=await import('https://www.gstatic.com/firebasejs/'+version+'/firebase-auth.js');
  const firestoreSdk=await import('https://www.gstatic.com/firebasejs/'+version+'/firebase-firestore.js');

  const firebaseApp=appSdk.initializeApp(firebaseConfig);
  const auth=authSdk.getAuth(firebaseApp);
  const db=firestoreSdk.getFirestore(firebaseApp);

  const profileRef=uid=>firestoreSdk.doc(db,'users',uid);
  const learningRef=uid=>firestoreSdk.doc(db,'users',uid,'learning','state');

  async function readProfile(user){
    if(!user)return null;
    const snap=await firestoreSdk.getDoc(profileRef(user.uid));
    if(snap.exists())return {uid:user.uid,email:user.email,...snap.data()};
    return {uid:user.uid,email:user.email,displayName:user.displayName||'Student',grade:null};
  }

  bridge.signup=async({displayName,grade,email,password})=>{
    const credential=await authSdk.createUserWithEmailAndPassword(auth,email,password);
    if(displayName)await authSdk.updateProfile(credential.user,{displayName});
    const profile={
      uid:credential.user.uid,
      email:credential.user.email,
      displayName:displayName||'Student',
      grade:Number(grade),
      parentEmail:email,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
    await firestoreSdk.setDoc(profileRef(credential.user.uid),profile,{merge:true});
    bridge.currentUser=credential.user;
    bridge.currentProfile=profile;
    return profile;
  };

  bridge.login=async(email,password)=>{
    const credential=await authSdk.signInWithEmailAndPassword(auth,email,password);
    const profile=await readProfile(credential.user);
    bridge.currentUser=credential.user;
    bridge.currentProfile=profile;
    return profile;
  };

  bridge.logout=async()=>{
    await authSdk.signOut(auth);
    bridge.currentUser=null;
    bridge.currentProfile=null;
  };

  bridge.loadLearning=async()=>{
    const user=auth.currentUser;
    if(!user)return null;
    const snap=await firestoreSdk.getDoc(learningRef(user.uid));
    return snap.exists()?snap.data():null;
  };

  bridge.saveLearning=async(payload)=>{
    const user=auth.currentUser;
    if(!user)return false;
    await firestoreSdk.setDoc(learningRef(user.uid),{
      ...payload,
      schemaVersion:2,
      updatedAt:new Date().toISOString(),
      updatedAtMs:Date.now()
    },{merge:true});
    return true;
  };

  bridge.sendPasswordReset=async email=>{
    await authSdk.sendPasswordResetEmail(auth,email);
    return true;
  };

  authSdk.onAuthStateChanged(auth,async user=>{
    bridge.currentUser=user||null;
    if(!user){
      bridge.currentProfile=null;
      emit('tlw-cloud-auth-state',{loggedIn:false});
      return;
    }
    try{
      const profile=await readProfile(user);
      bridge.currentProfile=profile;
      emit('tlw-cloud-auth-state',{loggedIn:true,profile});
    }catch(error){
      console.error('Cloud profile load failed',error);
      emit('tlw-cloud-error',{message:error?.message||'Could not load cloud profile.'});
    }
  });

  bridge.status='ready';
  emit('tlw-cloud-ready',{enabled:true,status:'ready'});
  return true;
})().catch(error=>{
  bridge.status='error';
  bridge.enabled=false;
  console.error('Cloud initialization failed',error);
  emit('tlw-cloud-ready',{enabled:false,status:'error',message:error?.message||'Cloud initialization failed.'});
  return false;
});
})();
