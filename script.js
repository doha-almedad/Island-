/* الموقع الأدبي — نموذج أولي. البيانات هنا تجريبية وتُستبدل لاحقًا بقاعدة بيانات فعلية. */
const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');

/* ---------- حفظ التقدم (مع حماية من فشل التخزين) ---------- */
const store = {
  get() { try { return JSON.parse(localStorage.getItem('lit-state')) || {}; } catch (e) { return {}; } },
  set(s) { try { localStorage.setItem('lit-state', JSON.stringify(s)); } catch (e) {} }
};
let state = Object.assign({ visited: false, done: {}, last: null, mode: 'calm', ship: null }, store.get());
const save = () => store.set(state);

/* ---------- البيانات ---------- */
const MAPS = [
  { id: 'language', name: 'علوم اللغة', blurb: 'النحو والصرف والبلاغة وأدوات الكلام.',
    islands: [
      { id: 'grammar', name: 'النحو', x: 28, y: 35, council: 'مجلس الإعراب' },
      { id: 'rhetoric', name: 'البلاغة', x: 68, y: 30, council: 'مجلس البيان' },
      { id: 'research', name: 'البحث', x: 50, y: 72, council: 'مجلس البحث' } ] },
  { id: 'heritage', name: 'التراث', blurb: 'نصوص الأولين وأخبارهم ومصادرهم.',
    islands: [
      { id: 'poetry-old', name: 'الشعر القديم', x: 30, y: 40, council: 'مجلس الرواة' },
      { id: 'reading', name: 'القراءة', x: 70, y: 62, council: 'مجلس القراء' } ] },
  { id: 'literature', name: 'الأدب', blurb: 'الشعر والنثر والسرد، قراءةً وكتابة.',
    islands: [
      { id: 'writing', name: 'الكتابة', x: 35, y: 35, council: 'مجلس الكتّاب' },
      { id: 'story', name: 'السرد', x: 70, y: 55, council: 'مجلس الحكاية' } ] },
  { id: 'unknown', name: 'المجهولة', blurb: 'خريطة لم تُحدَّد وظيفتها بعد.', islands: [] }
];
const ISLANDS = MAPS.flatMap(m => m.islands.map(i => ({ ...i, map: m.id })));
/* أعداد السفن والأعضاء أرقام تجريبية؛ في النسخة الفعلية تأتي من الخادم لحظة الاستخدام */
ISLANDS.forEach((i, n) => { i.ships = 2 + (n * 3) % 7; i.active = 10 + (n * 17) % 40; });

const ZONES = [
  ['lessons', 'دار الدروس', 'مسارات ودروس منظمة تقرؤها وتحفظ تقدمك فيها.'],
  ['library', 'خزانة الكتب والملخصات', 'كتب ومقالات وملخصات ومراجع تحفظها في مكتبتك.'],
  ['portico', 'رواق النصوص', 'تمارين وتطبيقات عملية، وتنشر فيه محاولاتك.'],
  ['council', 'مجلس النقاش', 'اسأل وناقش وردّ.'],
  ['diwan', 'ديوان الأعضاء', 'أعمال أدبية منشورة؛ انشر واقرأ وانقل النقاش إلى المجلس.'],
  ['news', 'لوحة أخبار الجزيرة', 'مستجدات المحتوى والفعاليات ومواعيدها.']
];

const LESSON = {
  title: 'الفاعل والمفعول به',
  text: 'الفاعل اسم مرفوع يدل على من قام بالفعل، والمفعول به اسم منصوب يقع عليه الفعل. في جملة «كتب الطالبُ الدرسَ» يقوم الطالب بالكتابة فهو فاعل، ويقع الكتاب عليه الفعل فالدرس مفعول به.',
  q: 'في جملة «قرأتِ الفتاةُ القصةَ»، ما إعراب كلمة «القصة»؟',
  opts: ['فاعل مرفوع', 'مفعول به منصوب', 'مبتدأ مرفوع'], ok: 1
};

const TRIPS = [
  { id: 't1', name: 'رحلة الكتّاب الأولى', island: 'writing', status: 'قادمة', level: 'مبتدئ', tasks: 'مهام كتابية',
    when: 'تُعلن المواعيد لاحقًا', ships: 6, members: 24 },
  { id: 't2', name: 'عبور بحر الإعراب', island: 'grammar', status: 'جارية', level: 'متوسط', tasks: 'تمارين إعراب',
    when: 'تُعلن المواعيد لاحقًا', ships: 9, members: 41 },
  { id: 't3', name: 'رحلة الرواة', island: 'poetry-old', status: 'سابقة', level: 'مبتدئ', tasks: 'قراءة وتلخيص',
    when: 'انتهت', ships: 5, members: 19 }
];

const NEWS = ['أُضيف درس جديد في دار دروس النحو.', 'مجلس البيان يفتح باب النقاش حول التشبيه.', 'موعد رحلة الكتّاب الأولى قريبًا.'];

/* ---------- أدوات ---------- */
const mapOf = id => MAPS.find(m => m.id === id);
const islandOf = id => ISLANDS.find(i => i.id === id);
const progress = id => state.done[id] ? 100 : 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nextIsland = () => ISLANDS.find(i => !state.done[i.id]) || ISLANDS[0];

/* ---------- الصفحات ---------- */
function mapCards() {
  return `<div class="grid">${MAPS.map(m => `
    <article class="card"><h3>${m.name}</h3><p>${m.blurb}</p>
    <a class="btn sm" href="#maps/${m.id}">انتقل إلى الخريطة</a></article>`).join('')}</div>`;
}

function home() {
  const returning = state.visited;
  state.visited = true; save();
  const j = nextIsland();
  const journal = `<section class="block"><h2>دفتر رحلتك</h2><div class="card">
    <p>${returning ? 'هذه خطتك الحالية، وتستطيع تغييرها في أي وقت.' : 'خطة تعلّم تُبنى على اهتماماتك حتى لا تضيع بين المحتوى.'}</p>
    <p><strong>الآن:</strong> ${j.name} — ${LESSON.title}<br><strong>لاحقًا:</strong> ${ISLANDS.filter(i => i !== j).slice(0, 2).map(i => i.name).join('، ')}</p>
    <a class="btn" href="#island/${j.id}">${returning ? 'أكمل من حيث توقفت' : 'ابدأ أول درس'}</a>
    <button class="btn alt" data-guide>اسأل مرشدك</button></div></section>`;
  const news = `<section class="block"><h2>المستجدات</h2><ul>${NEWS.map(n => `<li>${n}</li>`).join('')}</ul></section>`;
  if (returning) {
    const total = ISLANDS.length, done = Object.keys(state.done).length;
    return `<div class="hero"><h1>أهلًا بعودتك</h1>
      <p>أنجزت ${done} من ${total} جزر.</p><div class="bar" aria-hidden="true"><i style="width:${done / total * 100}%"></i></div></div>${journal}${news}`;
  }
  return `<div class="hero"><h1>أهلًا بك في الموقع الأدبي</h1>
    <p>مكان لتتعلم اللغة والأدب وتقرأ وتكتب وتشارك غيرك، بهدوء أو عبر رحلات بحرية.</p>
    <a class="btn" href="#maps">اكتشف حكايتنا</a></div>
    <section class="block"><h2>ما نقدمه</h2><div class="grid">
      <div class="card"><h3>تعلّم هادئ</h3><p>دروس وتمارين في صفحات واضحة دون أي منافسة.</p></div>
      <div class="card"><h3>قراءة وكتابة</h3><p>مكتبة شخصية ونصوص تنشرها وتناقشها.</p></div>
      <div class="card"><h3>رحلات بحرية</h3><p>سفن تتنافس في مجالها ومستواها. المشاركة اختيارية.</p></div></div></section>
    <section class="block"><h2>اكشف خرائطنا</h2>${mapCards()}</section>${journal}${news}`;
}

function maps(id) {
  const m = id && mapOf(id);
  const switchHtml = `<div class="switch" role="group" aria-label="طريقة العرض">
    <button class="btn sm" data-mode="calm" aria-pressed="${state.mode === 'calm'}">العرض المباشر</button>
    <button class="btn sm" data-mode="visual" aria-pressed="${state.mode === 'visual'}">العرض البصري</button></div>`;
  if (!m) return `<h1>الخرائط</h1><p>اختر خريطة لترى مجالاتها.</p>${mapCards()}`;
  const body = !m.islands.length
    ? '<p class="note">لم تُحدَّد وظيفة هذه الخريطة بعد.</p>'
    : state.mode === 'visual'
      ? `<div class="sea" role="group" aria-label="خريطة ${m.name}">${m.islands.map(i =>
          `<button class="isle" style="right:${i.x}%;top:${i.y}%" data-isle="${i.id}" aria-pressed="false">${i.name}</button>
           <span class="ship" aria-hidden="true" style="right:${i.x - 14}%;top:${i.y + 14}%">⛵</span>`).join('')}</div>
         <div id="isleCard" class="card isle-card" aria-live="polite"><p>المس جزيرة لتعرف حالتها.</p></div>`
      : `<div class="grid">${m.islands.map(i => `<article class="card"><h3>${i.name}</h3>
          <p>${i.ships} سفن • ${i.active} عضوًا نشطًا</p><a class="btn sm" href="#island/${i.id}">افتح المجال</a></article>`).join('')}</div>`;
  return `<p class="crumb"><a href="#maps">الخرائط</a> / ${m.name}</p><h1>${m.name}</h1><p>${m.blurb}</p>${switchHtml}${body}
    <p class="note">أعداد السفن والأعضاء هنا تجريبية، وتصبح بيانات فعلية عند الربط بالخادم.</p>`;
}

function island(id) {
  const i = islandOf(id); if (!i) return '<p>لم نجد هذه الجزيرة.</p>';
  const m = mapOf(i.map);
  state.last = id; save();
  return `<p class="crumb"><a href="#maps">الخرائط</a> / <a href="#maps/${m.id}">${m.name}</a> / ${i.name}</p>
    <h1>جزيرة ${i.name}</h1>
    <p><span class="tag${state.done[id] ? ' on' : ''}">${state.done[id] ? 'أنجزت درسها' : 'لم تبدأ بعد'}</span> ${i.ships} سفن • ${i.active} عضوًا نشطًا</p>
    <div class="switch"><a class="btn sm alt" href="#maps/${m.id}" data-mode-set="visual">اعرض الجزيرة</a></div>
    <div class="grid">${ZONES.map(z => `<article class="card zone"><h3>${z[0] === 'council' ? i.council : z[1]}</h3><p>${z[2]}</p>
      ${z[0] === 'lessons' ? `<button class="btn sm" data-lesson="${i.id}">افتح الدرس</button>` : '<span class="note">قريبًا في النسخة التالية</span>'}</article>`).join('')}</div>
    <div id="lessonBox"></div>`;
}

function openLesson(id) {
  $('#lessonBox').innerHTML = `<article class="lesson" aria-live="polite"><h2>${LESSON.title}</h2><p>${LESSON.text}</p>
    <div class="q"><strong>تمرين:</strong> ${LESSON.q}
    ${LESSON.opts.map((o, n) => `<label><input type="radio" name="a" value="${n}"> ${o}</label>`).join('')}
    <button class="btn sm" id="check">تحقق من إجابتي</button><p class="msg" id="msg"></p></div>
    <button class="btn alt" id="closeLesson">أغلق الدرس وارجع</button></article>`;
  $('#lessonBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#check').onclick = () => {
    const v = document.querySelector('input[name=a]:checked');
    const msg = $('#msg');
    if (!v) { msg.textContent = 'اختر إجابة أولًا.'; return; }
    if (+v.value === LESSON.ok) { state.done[id] = true; save(); msg.textContent = 'إجابة صحيحة، وحُفظ تقدمك.'; }
    else msg.textContent = 'ليست الإجابة الصحيحة. تذكّر أن المفعول به يقع عليه الفعل.';
  };
  $('#closeLesson').onclick = () => { $('#lessonBox').innerHTML = ''; window.scrollTo({ top: 0 }); };
}

function challenges() {
  return `<h1>التحديات</h1><p>الانضمام اختياري، والتعلم الهادئ متاح دائمًا دون رحلات.</p>
    <div class="grid">${TRIPS.map(t => `<article class="card"><h3>${t.name}</h3>
      <p><span class="tag">${t.status}</span> ${t.level} • ${t.tasks}</p>
      <p>الجزيرة: ${islandOf(t.island).name}<br>${t.ships} سفن • ${t.members} أعضاء<br>${t.when}</p>
      <p class="note">شروط الانضمام والفوز تُعلن قبل التسجيل.</p>
      ${t.status === 'سابقة' ? '' : `<button class="btn sm" data-join="${t.id}">أنشئ سفينتك</button>`}</article>`).join('')}</div>
    <section class="block"><h2>سفينتك</h2>${state.ship
      ? `<div class="card"><h3>${esc(state.ship.name)}</h3><p>رحلة: ${esc(state.ship.trip)}. أنت القائد.</p></div>`
      : '<p class="note">لم تنشئ سفينة بعد.</p>'}<div id="shipForm"></div></section>`;
}

function profile() {
  const done = Object.keys(state.done).length, pts = done * 50;
  return `<h1>الملف الشخصي</h1><div class="grid">
    <div class="card"><h3>المستوى</h3><p>${done > 1 ? 'متوسط' : 'مبتدئ'}</p></div>
    <div class="card"><h3>النقاط</h3><p>${pts}</p></div>
    <div class="card"><h3>الإنجازات</h3><p>${done ? 'أنجزت ' + done + ' جزر' : 'لا إنجازات بعد'}</p></div></div>
    <section class="block"><h2>بيتك على الخريطة</h2><a class="btn alt" href="#maps">رؤية بيت العضو على الخريطة</a></section>
    <p class="note">يمكنك قراءة ملفك دون دخول الخريطة.</p>`;
}

/* ---------- التوجيه ---------- */
function route() {
  const [r, arg] = (location.hash.slice(1) || 'home').split('/');
  const pages = { home, maps: () => maps(arg), island: () => island(arg), challenges, profile };
  view.innerHTML = (pages[r] || home)();
  const key = r === 'island' ? 'maps' : r;
  document.querySelectorAll('#nav a').forEach(a => {
    if (a.dataset.r === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0 }); view.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);

/* ---------- التفاعل ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.dataset.mode) { state.mode = t.dataset.mode; save(); route(); }
  if (t.dataset.modeSet) { state.mode = t.dataset.modeSet; save(); }
  if (t.dataset.lesson) openLesson(t.dataset.lesson);
  if (t.dataset.guide !== undefined) toggleGuide(true);
  if (t.dataset.isle) {
    const i = islandOf(t.dataset.isle);
    document.querySelectorAll('.isle').forEach(b => b.setAttribute('aria-pressed', b === t));
    $('#isleCard').innerHTML = `<h3>${i.name}</h3><p>${i.ships} سفن مبحرة • ${i.active} عضوًا نشطًا</p><a class="btn sm" href="#island/${i.id}">ادخل الجزيرة</a>`;
  }
  if (t.dataset.join) {
    const trip = TRIPS.find(x => x.id === t.dataset.join);
    $('#shipForm').innerHTML = `<form class="ship-form"><input required aria-label="اسم السفينة" placeholder="اسم سفينتك" maxlength="30">
      <button class="btn">أنشئ السفينة</button></form>`;
    $('#shipForm form').onsubmit = ev => { ev.preventDefault();
      state.ship = { name: $('#shipForm input').value, trip: trip.name }; save(); route(); };
    $('#shipForm input').focus();
  }
});

/* ---------- المرشد (ردود جاهزة الآن؛ يُربط لاحقًا بمحادثة ذكية) ---------- */
const ANSWERS = {
  'من أين أبدأ؟': 'ابدأ بجزيرة النحو: افتح دار الدروس، ثم أنجز التمرين.',
  'ما الفرق بين الرواق والديوان؟': 'الرواق للتمارين والمحاولات، والديوان لنشر الأعمال الأدبية.',
  'هل يجب أن أشارك في رحلة؟': 'لا. المشاركة اختيارية، والتعلم الهادئ متاح دائمًا.'
};
function toggleGuide(open) {
  const g = $('#guide'); g.hidden = !open; $('#guideBtn').setAttribute('aria-expanded', open);
  if (open && !$('#guideOpts').children.length) {
    $('#guideLog').textContent = 'مرحبًا! اختر سؤالًا:';
    Object.keys(ANSWERS).forEach(q => { const b = document.createElement('button');
      b.className = 'btn alt sm'; b.textContent = q;
      b.onclick = () => { $('#guideLog').textContent = ANSWERS[q]; }; $('#guideOpts').append(b); });
  }
}
$('#guideBtn').onclick = () => toggleGuide($('#guide').hidden);
$('#guideClose').onclick = () => toggleGuide(false);

route();
