/* Contact enquiry: prepare an email in the visitor's own email app.
   This static GitHub Pages site has no server-side form handler. */
(()=>{
'use strict';
const form=document.getElementById('contactForm');
if(!form)return;
const status=document.getElementById('contactFormStatus');
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const fields=new FormData(form);
  const name=String(fields.get('parentName')||'').trim();
  const email=String(fields.get('email')||'').trim();
  const phone=String(fields.get('phone')||'').trim();
  const grade=String(fields.get('grade')||'').trim();
  const purpose=String(fields.get('purpose')||'').trim();
  const message=String(fields.get('message')||'').trim();
  if(!name||!email||!purpose||!message)return;
  const subject='ThreeLittleWonders Enquiry: '+purpose.slice(0,80);
  const body=[
    'Parent / Guardian Name: '+name,
    'Email Address: '+email,
    'Mobile / WhatsApp Number: '+(phone||'Not provided'),
    'Class / Grade: '+(grade||'Not selected'),
    'Purpose of Contact: '+purpose,
    '',
    'Message:',
    message,
    '',
    'Sent using the ThreeLittleWonders website contact form.'
  ].join('\n');
  const mailto='mailto:hello@threelittlewonders.com?subject='+
    encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  status.textContent='Your email application should open with your message. Please check the details and press Send there. If it does not open, email hello@threelittlewonders.com directly. No message has been sent by the website.';
  window.location.href=mailto;
});
})();