const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];$('#year').textContent=new Date().getFullYear();
const search=$('#search'),cards=$$('.job-card'),filters=$$('.filter');let activeFilter='All';
function filterJobs(){const q=search.value.trim().toLowerCase();let count=0;cards.forEach(card=>{const matches=(activeFilter==='All'||card.dataset.category===activeFilter)&&(!q||(card.dataset.title+' '+card.dataset.tags+' '+card.dataset.category).toLowerCase().includes(q));card.hidden=!matches;if(matches)count++});$('#no-results').hidden=count>0}
search.addEventListener('input',filterJobs);filters.forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;filters.forEach(b=>b.classList.toggle('active',b===btn));filterJobs()}));
const modal=$('#apply-modal'),form=$('#application-form'),status=$('#form-status');
function openModal(role){modal.hidden=false;document.body.style.overflow='hidden';if(role)$('#role-select').value=role;status.textContent='';status.className='form-status';setTimeout(()=>form.elements.name.focus(),60)}
function closeModal(){modal.hidden=true;document.body.style.overflow=''}
$$('.apply-btn').forEach(btn=>btn.addEventListener('click',()=>openModal(btn.dataset.role)));
$('#modal-close').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});
const menu=$('.menu');menu.addEventListener('click',()=>{const nav=$('.nav-links');const shown=nav.style.display==='flex';nav.style.display=shown?'none':'flex';if(!shown){nav.style.position='absolute';nav.style.top='65px';nav.style.left='18px';nav.style.right='18px';nav.style.zIndex='20';nav.style.padding='20px';nav.style.background='#f7f7f2';nav.style.border='1px solid #e5e7df';nav.style.borderRadius='6px';nav.style.flexDirection='column';nav.style.gap='18px'}});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{if(innerWidth<=640) $('.nav-links').style.display='none'}));
async function sendForm(formEl,statusEl,type){const button=formEl.querySelector('button[type="submit"]');const data=Object.fromEntries(new FormData(formEl).entries());data.type=type;statusEl.className='form-status';statusEl.textContent='Sending…';button.disabled=true;button.style.opacity='.65';try{const response=await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save this form. Please try again.');let emailSent=false;try{const mailResponse=await fetch('https://formsubmit.app/f/h87usrfyum',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({...data,_subject:'Qelvairo '+(type==='application'?'Career application':'Contact enquiry'),_replyto:data.email||'',_template:'table'})});if(mailResponse.ok){const mailResult=await mailResponse.json();emailSent=mailResult.ok===true||mailResult.success===true}}catch(mailError){console.warn('FormSubmit notification could not be sent',mailError)}statusEl.textContent=emailSent?'Thanks! Your submission has been saved and an email notification was sent.':(result.message||'Your submission was saved on the site, but email notification is not connected.');formEl.reset()}catch(err){statusEl.className='form-status error';statusEl.textContent=err.message==='Failed to fetch'?'Could not connect right now. Please try again in a moment.':err.message}finally{button.disabled=false;button.style.opacity='1'}}
form.addEventListener('submit',e=>{e.preventDefault();sendForm(form,status,'application')});
const contactForm=$('#contact-form');contactForm.addEventListener('submit',e=>{e.preventDefault();sendForm(contactForm,$('#contact-status'),'contact')});
$$('[data-learning-topic]').forEach(link=>link.addEventListener('click',()=>{
  const topic=contactForm.elements.topic;
  const message=contactForm.elements.message;
  if(topic)topic.value='Something else';
  if(message&&!message.value.trim())message.value='I would like to learn about '+link.dataset.learningTopic+'. Please share more information.';
}));

// Subtle entrance animations; content remains visible when reduced motion is preferred.
const revealTargets=$$('.section-head,.service-card,.project-card,.manifesto-inner>*,.job-card,.steps article,.contact-copy,.contact-form-wrap,.cta-card');
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.body.classList.add('reveal-ready');
  revealTargets.forEach(el=>el.classList.add('reveal'));
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}});
  },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  revealTargets.forEach(el=>revealObserver.observe(el));
}
const qaiPanel=$('#qai-panel'),qaiLaunch=$('#qai-launch'),qaiClose=$('#qai-close'),qaiForm=$('#qai-form'),qaiInput=$('#qai-input'),qaiMessages=$('#qai-messages'),qaiSend=$('#qai-send');
function qaiAddMessage(text,who){const el=document.createElement('div');el.className='qai-message '+(who==='user'?'qai-user':'qai-bot');const label=document.createElement('span');label.className='qai-message-label';label.textContent=who==='user'?'YOU':'QELVAIRO AI';el.appendChild(label);el.appendChild(document.createTextNode(text));qaiMessages.appendChild(el);qaiMessages.scrollTop=qaiMessages.scrollHeight;return el}
function qaiOpen(){qaiPanel.hidden=false;qaiLaunch.hidden=true;qaiInput.focus()}
function qaiClosePanel(){qaiPanel.hidden=true;qaiLaunch.hidden=false;qaiLaunch.focus()}
qaiLaunch.addEventListener('click',qaiOpen);qaiClose.addEventListener('click',qaiClosePanel);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!qaiPanel.hidden)qaiClosePanel()});
function qaiFreeReply(message){const q=message.toLowerCase();
if(/salary|pay|paid|wage|income|how much/.test(q))return "Qelvairo hasn't published confirmed salary rates yet. Pay depends on the role, scope, experience, and whether the work is human-led or AI-assisted. Contact us through the Contact section for project-specific details.";
if(/professional website|build.*website|website.*build|make.*site|web design|website design/.test(q))return "Here's a practical website plan:\n1. Define the audience and one main goal.\n2. Plan Home, Services, About, and Contact pages.\n3. Use consistent typography, spacing, and 2–3 brand colors.\n4. Design mobile-first and make calls to action clear.\n5. Test every link and form, check accessibility, then connect a domain and publish.\nTell me which step you want help with.";
if(/learn ai|teach.*ai|beginner.*ai|start.*ai/.test(q))return "Beginner AI roadmap:\n1. Learn how prompts give clear context, tasks, and desired formats.\n2. Practice with research, summaries, brainstorming, and writing.\n3. Verify important claims instead of trusting every answer.\n4. Protect private information.\n5. Build a small project, like a website outline or FAQ.\nWhat would you like to learn first?";
if(/ai worker|workers|automation|automate/.test(q))return "AI workers can assist with research summaries, first drafts of content, website planning and starter code, and repetitive workflow steps. They need clear instructions and human review. Qelvairo describes these as service areas; availability and pricing should be confirmed through Contact.";
if(/job|career|hire|hiring|vacan/.test(q))return "You can browse the Careers section on Qelvairo. Please note that the roles shown there are example roles unless a listing is explicitly confirmed as open. Use the application form to send an enquiry.";
if(/price|pricing|cost|free/.test(q))return "We're keeping Qelvairo's learning guides accessible. Specific service prices haven't been published, so contact us with what you need for an accurate quote.";
if(/hello|hi\b|hey\b|salam/.test(q))return "Hey! 👋 I'm Qelvairo's free guide mode. I can help with website-building steps, beginner AI learning, AI worker ideas, and careers information. What are you working on?";
return "I can still help in free guide mode, but live AI replies are temporarily unavailable because the connected AI API account has no credits. Try asking about building a professional website, learning AI, AI worker services, careers, or salary information—or contact Qelvairo for a specific enquiry.";
}
async function qaiAsk(message){const clean=message.trim();if(!clean||clean.length>2000)return;qaiAddMessage(clean,'user');qaiInput.value='';qaiSend.disabled=true;const pending=qaiAddMessage('Thinking…','bot');try{const response=await fetch('/api/qelvairo-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:clean})});const data=await response.json();if(!response.ok)throw new Error(data.error||'AI unavailable');pending.lastChild.textContent=data.reply||qaiFreeReply(clean)}catch(err){pending.lastChild.textContent=qaiFreeReply(clean)}finally{qaiSend.disabled=false;qaiInput.focus();qaiMessages.scrollTop=qaiMessages.scrollHeight}}
qaiForm.addEventListener('submit',e=>{e.preventDefault();qaiAsk(qaiInput.value)});$$('[data-qai-prompt]').forEach(btn=>btn.addEventListener('click',()=>qaiAsk(btn.dataset.qaiPrompt)));

// Tiny desktop pointer parallax on the hero art, disabled for touch/reduced-motion.
const heroArt=$('.hero-art');
if(heroArt&&window.matchMedia('(hover: hover) and (pointer: fine)').matches&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  heroArt.addEventListener('pointermove',e=>{
    const r=heroArt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    heroArt.style.setProperty('--pointer-x',String(x*8)+'px');
    heroArt.style.setProperty('--pointer-y',String(y*8)+'px');
    heroArt.style.transform='translate3d('+String(x*5)+'px,'+String(y*5)+'px,0)';
  });
  heroArt.addEventListener('pointerleave',()=>{heroArt.style.transform='';heroArt.style.removeProperty('--pointer-x');heroArt.style.removeProperty('--pointer-y')});
}