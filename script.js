(function () {
  'use strict';

  /* ---------- Data ---------- */
  var websites = [
    { key: 'iec', name: 'Integrated Engineers & Contractors', url: 'https://www.iec.co.in/', kind: 'Portal and store',
      text: 'Catalogue for compressed air dryers, industrial chillers and humidity control systems, built so buyers can compare products before they call.' },
    { key: 'voxx', name: 'Voxx Lab', url: 'https://www.voxxlabs.in/', kind: 'Business portal', date: 'Live May 2026',
      text: 'Microscope supplier site organised by who is buying: schools, pathology labs, research and manufacturing.' },
    { key: 'kagariya', name: 'Kagariya Pro', url: 'https://www.kagariyapro.com/', kind: 'Business portal', date: 'Live May 2026',
      text: 'Product portal for a Delhi maker of rubber floor tiles, gym rolls and gym equipment.' },
    { key: 'arnold', name: 'Arnold Switchgears', url: 'https://www.arnoldswitchgears.com/', kind: 'Business portal', date: 'Live Apr 2026',
      text: 'Site for Siddharth Electricals, covering switches, sockets, wires and cables.' },
    { key: 'cortex', name: 'Cortex Helmet', url: 'https://www.cortexhelmet.in/', kind: 'Business portal',
      text: 'Bold, dark brand site for a motorcycle helmet maker, with helmet variants and the features riders care about.' },
    { key: 'ortho', name: 'Ortho Care', url: 'https://www.orthoimplants.com/', kind: 'Portal and store', date: 'Live Mar 2026',
      text: 'Orthopaedic implants and mobility products, from locking plates and nails to wheelchairs.' },
    { key: 'dfs', name: 'DFS Systems', url: 'https://www.dfsfirealarmsystems.com/', kind: 'Business website', date: 'Live Jan 2026',
      text: 'Fire alarm and fire safety systems distributor, with product ranges and clear reasons to choose them.' },
    { key: 'kapil', name: 'Kapil Healthcare', url: 'https://www.kapilhealthcare.com/', kind: 'Business website',
      text: 'Diagnostics and biopsy centre site that introduces the doctor and lists tests by department.' },
    { key: 'bmr', name: 'BMR Equipment India', url: 'https://www.bmreipl.com/', kind: 'Business website', date: 'Live Apr 2026',
      text: 'Dealer site for wheel loaders and construction and mining equipment across Delhi NCR.' },
    { key: 'mmw', name: 'Mohindra Mechanical Works', url: 'https://www.mmwmachine.com/', kind: 'Business website', date: 'Where I work',
      text: 'Main site for a maker of rotogravure, flexographic, coating, lamination and slitting machines.' },
    { key: 'roto', name: 'MMW printing and packaging', url: 'https://roto.rajdhaniengg.in/', kind: 'Business website',
      text: 'Product site for Mohindra Mechanical Works’ printing, lamination, coating and packaging machinery.' },
    { key: 'dumbbell', name: 'Arth Fitness', url: 'https://www.dumbbellplatewala.com/', kind: 'Business portal',
      text: 'Fitness equipment maker with dumbbells, weight plates and strength training gear.' },
    { key: 'rilon', name: 'Rilon India', url: 'https://www.rilonindia.com/', kind: 'Business website', date: 'Live May 2026',
      text: 'Site for Mega Machine Industries, a Delhi maker of welding machines, cables and accessories.' }
  ];

  var stores = [
    { key: 'devesh', name: 'Devesh Meditech', url: 'https://www.deveshmeditechindia.com/', kind: 'E-commerce',
      text: 'Laparoscopy and surgical equipment, with product pages, brochures and a blog.' },
    { key: 'eraya', name: 'Eraya Home Decor', url: 'https://www.erayahomedecor.com/', kind: 'E-commerce',
      text: 'Home décor store with bestsellers, product listings, cart and checkout.' },
    { key: 'royaleva', name: 'Royal Eva Products', url: 'https://www.royalevaproducts.com/', kind: 'E-commerce',
      text: 'Footwear maker selling clogs, sandals, slippers and school shoes.' },
    { key: 'esd', name: 'Global Static Shield', url: 'https://www.esdbuying.com/', kind: 'Portal and store',
      text: 'Catalogue of ESD and cleanroom products, with product search, company profile and a blog.' }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function host(url) { return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }

  /* ---------- Theme ---------- */
  var toggle = document.querySelector('.theme-toggle');
  function syncToggle() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  toggle.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncToggle();
  });
  syncToggle();

  /* ---------- Header border on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero browser ---------- */
  var heroBrowser = $('heroBrowser');
  var typed = $('typed');
  var shots = [$('heroShotA'), $('heroShotB')];
  var loadbar = $('loadbar');
  var tabsEl = $('heroTabs');
  var heroIndex = 0, front = 0, timer = null, typingTimer = null, pendingDone = null;

  websites.forEach(function (f, i) {
    var li = el('li');
    var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false' }, f.name);
    b.addEventListener('click', function () { showHero(i, true); });
    li.appendChild(b);
    tabsEl.appendChild(li);
    var pre = new Image(); pre.src = 'assets/shots/' + f.key + '.jpg';
  });

  function typeText(text, done) {
    clearInterval(typingTimer);
    if (reduceMotion) { typed.textContent = text; done(); return; }
    var i = 0; typed.textContent = '';
    pendingDone = done;
    typingTimer = setInterval(function () {
      i++;
      typed.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(typingTimer); pendingDone = null; done(); }
    }, 38);
  }

  function showHero(i, userPicked) {
    heroIndex = i;
    var f = websites[i];
    Array.prototype.forEach.call(tabsEl.querySelectorAll('button'), function (b, j) {
      b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    });
    heroBrowser.href = f.url;
    heroBrowser.setAttribute('aria-label', 'Open ' + f.name + ' in a new tab');
    typeText(host(f.url), function () {
      var back = 1 - front;
      shots[back].src = 'assets/shots/' + f.key + '.jpg';
      shots[back].alt = f.name + ' homepage';
      shots[back].removeAttribute('aria-hidden');
      shots[front].setAttribute('aria-hidden', 'true');
      shots[front].alt = '';
      shots[back].classList.add('is-on');
      shots[front].classList.remove('is-on');
      front = back;
      loadbar.classList.remove('run'); void loadbar.offsetWidth; loadbar.classList.add('run');
    });
    if (userPicked) restartCycle();
  }

  function restartCycle() {
    clearInterval(timer);
    if (reduceMotion || document.hidden) return;
    timer = setInterval(function () { showHero((heroIndex + 1) % websites.length); }, 4200);
  }
  heroBrowser.addEventListener('mouseenter', function () { clearInterval(timer); });
  heroBrowser.addEventListener('mouseleave', restartCycle);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearInterval(timer);
      clearInterval(typingTimer);
      typed.textContent = host(websites[heroIndex].url);
      if (pendingDone) { var d = pendingDone; pendingDone = null; d(); }
    } else {
      restartCycle();
    }
  });
  restartCycle();

  /* ---------- Project cards ---------- */
  function renderProjects(list, target, leadCount) {
    list.forEach(function (f, i) {
      var lead = i < leadCount;
      var art = el('article', { class: 'project' + (lead ? ' lead' : '') });

      var frame = el('a', { class: 'browser', href: f.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open ' + f.name + ' in a new tab' });
      var bar = el('div', { class: 'bar', 'aria-hidden': 'true' });
      var dots = el('span', { class: 'dots' });
      dots.innerHTML = '<i></i><i></i><i></i>';
      bar.appendChild(dots);
      bar.appendChild(el('span', { class: 'address' }, host(f.url)));
      var vp = el('div', { class: 'viewport' });
      vp.appendChild(el('img', { class: 'shot', src: 'assets/shots/' + f.key + '.jpg', alt: f.name + ' homepage', loading: 'lazy', width: '902', height: '1716' }));
      frame.appendChild(bar); frame.appendChild(vp);

      var body = el('div', { class: 'project-text' });
      var meta = el('div', { class: 'project-meta' });
      meta.appendChild(el('span', { class: 'pill' }, f.kind));
      if (f.date) meta.appendChild(el('span', { class: 'pill date' }, f.date));
      body.appendChild(meta);
      body.appendChild(el('h3', null, f.name));
      body.appendChild(el('p', null, f.text));
      body.appendChild(el('a', { class: 'visit', href: f.url, target: '_blank', rel: 'noopener' }, 'Visit ' + host(f.url)));

      art.appendChild(frame); art.appendChild(body);
      target.appendChild(art);
    });
  }
  renderProjects(websites, $('websiteList'), 1);
  renderProjects(stores, $('storeList'), 0);

  /* ---------- CRM screen tabs ---------- */
  var crmShot = $('crmShot');
  var appTabs = document.querySelectorAll('.app-tabs button');
  Array.prototype.forEach.call(appTabs, function (b) {
    var pre = new Image(); pre.src = b.getAttribute('data-shot');
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(appTabs, function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      crmShot.src = b.getAttribute('data-shot');
      crmShot.alt = b.getAttribute('data-alt');
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = $('copyEmail');
  copyBtn.addEventListener('click', function () {
    var email = 'monikashyap902@gmail.com';
    function ok() { copyBtn.textContent = 'Email copied'; setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(ok, function () { window.location.href = 'mailto:' + email; });
    } else {
      window.location.href = 'mailto:' + email;
    }
  });

  /* ---------- Contact form ---------- */
  var form = $('contactForm');
  var statusEl = $('formStatus');
  var sendBtn = form.querySelector('button[type="submit"]');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
  }
  function check() {
    var problems = [];
    var name = form.elements.name, email = form.elements.email, message = form.elements.message;
    [name, email, message].forEach(function (f) { f.removeAttribute('aria-invalid'); });
    if (!name.value.trim()) { problems.push('add your name'); name.setAttribute('aria-invalid', 'true'); }
    if (!EMAIL_RE.test(email.value.trim())) { problems.push('check the email address'); email.setAttribute('aria-invalid', 'true'); }
    if (message.value.trim().length < 10) { problems.push('write a few more words in the message'); message.setAttribute('aria-invalid', 'true'); }
    return problems;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var problems = check();
    if (problems.length) {
      var text = problems.join(', ');
      setStatus(text.charAt(0).toUpperCase() + text.slice(1) + '.', 'err');
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    var payload = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      reason: form.elements.reason.value,
      message: form.elements.message.value,
      company: form.elements.company.value
    };
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    setStatus('');
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, data: data }; });
    }).then(function (res) {
      if (res.ok && res.data.ok) {
        form.reset();
        setStatus('Message sent. I’ll reply to your email soon.', 'ok');
      } else {
        setStatus(res.data.error || 'The message didn’t send. Try again, or email monikashyap902@gmail.com.', 'err');
      }
    }).catch(function () {
      setStatus('No connection to the server. Check your internet and try again, or email monikashyap902@gmail.com.', 'err');
    }).then(function () {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send message';
    });
  });

  $('year').textContent = new Date().getFullYear();
})();
