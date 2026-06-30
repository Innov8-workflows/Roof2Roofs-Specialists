/* ===== Roof 2 Roofs Specialist Ltd — Ad Landing Page ===== */
(function(){
'use strict';

document.getElementById('yr').textContent = new Date().getFullYear();

// Escape visitor-entered values before inserting them as HTML (prevents markup injection)
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- LAZY BACKGROUND VIDEOS ---------- */
function setupVideo(v, src){
  if(!v) return;
  const start = () => {
    if(!v.getAttribute('src')){ v.src = src; v.muted = true; v.defaultMuted = true; v.load(); }
    const p = v.play(); if(p && p.catch) p.catch(()=>{});
  };
  if('IntersectionObserver' in window){
    new IntersectionObserver(es => es.forEach(e => {
      if(e.isIntersecting) start();
      else if(v.getAttribute('src')) v.pause();
    }), {threshold:.15}).observe(v);
  } else { start(); }
}
const heroVideo = document.getElementById('heroVideo');
const baVideo   = document.getElementById('baVideo');
const ctaVideo  = document.getElementById('ctaVideo');
setupVideo(heroVideo, 'assets/hero.mp4');
setupVideo(baVideo,   'assets/ba.mp4');
setupVideo(ctaVideo,  'assets/cta.mp4');
document.addEventListener('touchstart', () => {
  if(heroVideo){ const p = heroVideo.play(); if(p && p.catch) p.catch(()=>{}); }
}, {once:true, passive:true});

/* ---------- MULTI-STEP QUIZ ---------- */
const lead = {};
const STEPS = ['1','2','3','4'];               // numbered steps (drive the progress bar)
const quiz = document.getElementById('quiz');
const progressBar = document.getElementById('progressBar');

function currentStep(){ const a = document.querySelector('.quiz-step.active'); return a ? a.dataset.step : '1'; }

function goStep(key, scroll){
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.toggle('active', s.dataset.step === key));
  const i = STEPS.indexOf(key);
  progressBar.style.width = (i >= 0 ? ((i + 1) / STEPS.length) * 100 : 100) + '%';
  if(scroll){ quiz.scrollIntoView({behavior:'smooth', block:'start'}); }
}
function advance(){ const i = STEPS.indexOf(currentStep()); if(i > -1 && i < STEPS.length - 1) goStep(STEPS[i + 1], false); }
function back(){ const i = STEPS.indexOf(currentStep()); if(i > 0) goStep(STEPS[i - 1], false); }

document.querySelectorAll('.quiz-back').forEach(b => b.addEventListener('click', back));

// option cards / rows — capture answer, then auto-advance
document.querySelectorAll('.opt, .opt-row').forEach(btn => {
  btn.addEventListener('click', () => {
    lead[btn.dataset.field] = btn.dataset.val;
    document.querySelectorAll('[data-field="'+btn.dataset.field+'"]').forEach(x => x.classList.remove('sel'));
    btn.classList.add('sel');
    setTimeout(advance, 160);
  });
});

const val = id => (document.getElementById(id).value || '').trim();

// step 3 — postcode
document.querySelector('[data-step="3"] .q-next').addEventListener('click', () => {
  const pc = document.getElementById('leadPostcode');
  if(!pc.value.trim()){ pc.classList.add('err'); pc.focus(); return; }
  pc.classList.remove('err'); lead.postcode = val('leadPostcode'); advance();
});

// step 4 — contact → finish (WhatsApp handoff)
document.getElementById('toFinish').addEventListener('click', () => {
  const name = document.getElementById('leadName'), phone = document.getElementById('leadPhone');
  let ok = true;
  [name, phone].forEach(f => { if(!f.value.trim()){ f.classList.add('err'); ok = false; } else f.classList.remove('err'); });
  if(!ok){ (name.value.trim() ? phone : name).focus(); return; }
  lead.name = val('leadName'); lead.phone = val('leadPhone'); lead.email = val('leadEmail');
  // Conversions: real lead captured (contact details submitted). Guarded so each fires once.
  if(!lead._tracked){
    if(window.fbq)  fbq('track', 'Lead');
    if(window.gtag) gtag('event', 'generate_lead', { service: lead.service || '', urgency: lead.urgency || '' });
    lead._tracked = true;
  }
  showDone();
});

function waLink(){
  let t = "Hi Roof 2 Roofs — I'd like a free roof inspection & quote please.";
  t += '%0A%0A*Name:* ' + (lead.name || '-');
  t += '%0A*Phone:* ' + (lead.phone || '-');
  if(lead.postcode) t += '%0A*Postcode:* ' + lead.postcode;
  if(lead.email)    t += '%0A*Email:* ' + lead.email;
  t += '%0A*Service:* ' + (lead.service || '-');
  if(lead.urgency)  t += '%0A*Timing:* ' + lead.urgency;
  return 'https://wa.me/447523038369?text=' + t;
}

function showDone(){
  goStep('done', true);
  progressBar.style.width = '100%';
  if(window.gtag) gtag('event', 'enquiry_sent');
  var fn = lead.name ? lead.name.split(' ')[0] : 'there';
  document.getElementById('doneHead').textContent = 'Request Sent!';
  document.getElementById('doneMsg').textContent =
    'Thanks ' + fn + "! We've got your details and will be in touch shortly to arrange your free inspection.";
  document.getElementById('doneSummary').innerHTML =
    '<b>Name:</b> ' + esc(lead.name || '-') + '<br><b>Phone:</b> ' + esc(lead.phone || '-') +
    '<br><b>For:</b> ' + esc(lead.service || 'Roofing quote') + (lead.postcode ? ' · ' + esc(lead.postcode) : '');
  var wa = document.getElementById('waConfirm');
  wa.href = waLink();
}

/* ---------- REVIEWS SLIDER ---------- */
// Real reviews mirrored from the main Roof 2 Roofs Specialist Ltd website.
const REVIEW_COUNT = null; // set to a number once a verified review total is confirmed
const REVIEWS = [
  { stars:5, title:'Spotless finish', text:'Albert and the team re-roofed our bungalow and the finish is spotless. Tidy, on time and a fair price. Could not be happier with the work.', name:'Sarah W.', location:'Luton' },
  { stars:5, title:'Sorted a bad leak fast', text:'Came out the same week to fix a bad leak after a storm. Sorted quickly and explained everything clearly. Would highly recommend these lads.', name:'David M.', location:'Reading' },
  { stars:5, title:'Looks like a brand new roof', text:'Had the roof cleaned and the moss removed and it looks like a brand new roof. Great value for money and lovely to deal with.', name:'Janet P.', location:'Oxford' },
  { stars:5, title:'Honest advice, no hard sell', text:'Professional from the first phone call. The drone survey showed exactly what needed doing. No hard sell, just honest advice.', name:'Mark T.', location:'High Wycombe' },
  { stars:5, title:'Brilliant job all round', text:'New fascias and guttering fitted and a brilliant job all round. Polite, reliable and they cleaned up after themselves. Thank you.', name:'Lisa H.', location:'Beaconsfield' },
];

(function initSlider(){
  const track = document.getElementById('revTrack');
  const dotsWrap = document.getElementById('revDots');
  if(!track || !REVIEWS.length) return;

  if(REVIEW_COUNT){
    var rc = document.getElementById('reviewCount'); if(rc) rc.textContent = 'Based on ' + REVIEW_COUNT + '+ reviews';
    var rsc = document.getElementById('revSummaryCount'); if(rsc) rsc.textContent = 'Based on ' + REVIEW_COUNT + '+ Google reviews';
  }

  const gSvg = '<svg class="rev-source" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 4.75c1.61 0 3.06.55 4.2 1.64l3.15-3.15C17.45 1.43 14.97.5 12 .5 7.7.5 3.99 2.97 2.18 6.57l3.66 2.84C6.71 6.81 9.14 4.75 12 4.75z"/></svg>';
  const initials = n => n.split(/[\s.]+/).filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();

  track.innerHTML = REVIEWS.map(r => (
    '<div class="rev-card"><div class="rev-card-inner">' +
      '<div class="rev-card-stars">' + '★'.repeat(r.stars) + '</div>' +
      '<h4>' + r.title + '</h4>' +
      '<p>' + r.text + '</p>' +
      '<div class="rev-author">' +
        '<span class="rev-avatar">' + initials(r.name) + '</span>' +
        '<div class="rev-author-meta"><strong>' + r.name + '</strong><span>' + r.location + '</span></div>' +
        gSvg +
      '</div>' +
    '</div></div>'
  )).join('');

  dotsWrap.innerHTML = REVIEWS.map((_, i) => '<button class="rev-dot' + (i===0?' active':'') + '" data-i="' + i + '" aria-label="Go to review ' + (i+1) + '"></button>').join('');
  const dots = Array.from(dotsWrap.children);

  let cur = 0, timer = null;
  function show(i){
    cur = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach((d, n) => d.classList.toggle('active', n === cur));
  }
  function next(){ show(cur + 1); }
  function prev(){ show(cur - 1); }
  function play(){ stop(); timer = setInterval(next, 5500); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  document.getElementById('revNext').addEventListener('click', () => { next(); play(); });
  document.getElementById('revPrev').addEventListener('click', () => { prev(); play(); });
  dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.i); play(); }));

  const slider = document.getElementById('revSlider');
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', play);

  let x0 = null;
  slider.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; stop(); }, {passive:true});
  slider.addEventListener('touchend', e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 40){ dx < 0 ? next() : prev(); }
    x0 = null; play();
  }, {passive:true});

  show(0); play();
})();

})();
