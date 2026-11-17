(function () {
  'use strict';

  /* ---------- Data ---------- */
  var websites = [
    { key: 'mmw', name: 'Mohindra Mechanical Works', url: 'https://www.mmwmachine.com/', kind: 'Business website', date: 'Where I work',
      text: 'Main site for a maker of rotogravure, flexographic, coating, lamination and slitting machines.' },
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
    { key: 'iec', name: 'Integrated Engineers & Contractors', url: 'https://www.iec.co.in/', kind: 'Portal and store',
      text: 'Catalogue for compressed air dryers, industrial chillers and humidity control systems, built so buyers can compare products before they call.' },
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

  // Freelance content sites run from the Blog Panel.
  // To show a real screenshot instead of the designed cover, save it as
  // assets/shots/<key>.jpg and add  shot: true  to that entry.
  var blogs = [
    { key: 'fork7', name: 'Fork7', url: 'https://fork7.com/', hue: 34,
      tagline: 'Thoughts, insights & stories', cats: ['Ideas', 'Stories', 'Insights'],
      text: 'Blog of fresh perspectives, thoughtful stories and useful ideas.' },
    { key: 'hits9', name: 'hits9', url: 'https://hits9.com/', hue: 350,
      tagline: 'Latest headlines and stories', cats: ['Technology', 'Shopping', 'Business', 'Gaming', 'Finance'],
      text: 'News and stories across technology, shopping, business, gaming, finance and travel.' },
    { key: 'yoyoguide', name: 'Yoyoguide', url: 'https://yoyoguide.com/', hue: 200,
      tagline: 'Technology, business, gaming, finance, travel and lifestyle', cats: ['Technology', 'AI', 'Gaming', 'Health'],
      text: 'Guides and headlines on technology, business, gaming, AI, health and shopping.' },
    { key: 'bta', name: 'Best Travel Advisory', url: 'https://besttraveladvisory.com/', hue: 160,
      tagline: 'Fresh stories and useful guides for curious readers', cats: ['Destinations', 'Adventure', 'Budget', 'Solo'],
      text: 'Travel blog with destination guides plus adventure, budget, luxury and solo travel.' }
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
  var progress = $('scrollProgress');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Active nav link (scroll spy) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var spyTargets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function spy() {
    var line = window.innerHeight * 0.35, current = '';
    spyTargets.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = s.id;
    });
    // At the very bottom of the page, the last section counts as active.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = spyTargets[spyTargets.length - 1].id;
    setActive(current);
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-toggle');
  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('nav-open')); });
  Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) setMenu(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 820) setMenu(false); });

  /* ---------- Project cards ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function renderProjects(list, target, leadCount, asPhone) {
    list.forEach(function (f, i) {
      var lead = i < leadCount;
      var art = el('article', { class: 'project card' + (lead ? ' lead' : '') + (asPhone ? ' is-phone' : '') });
      var shot = el('img', { class: 'shot', src: 'assets/shots/' + f.key + '.jpg', alt: f.name + ' homepage', loading: 'lazy', width: '902', height: '1716' });
      var frame;

      if (asPhone) {
        frame = el('a', { class: 'phone', href: f.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open ' + f.name + ' in a new tab' });
        frame.appendChild(el('span', { class: 'notch', 'aria-hidden': 'true' }));
        var screen = el('div', { class: 'viewport screen' });
        screen.appendChild(shot);
        frame.appendChild(screen);
      } else {
        frame = el('a', { class: 'browser', href: f.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open ' + f.name + ' in a new tab' });
        var bar = el('div', { class: 'bar', 'aria-hidden': 'true' });
        var dots = el('span', { class: 'dots' });
        dots.innerHTML = '<i></i><i></i><i></i>';
        bar.appendChild(dots);
        bar.appendChild(el('span', { class: 'address' }, host(f.url)));
        var vp = el('div', { class: 'viewport' });
        vp.appendChild(shot);
        frame.appendChild(bar); frame.appendChild(vp);
      }
      var hint = el('span', { class: 'open-hint', 'aria-hidden': 'true' }, 'Open site ↗');
      frame.appendChild(hint);

      var body = el('div', { class: 'project-text' });
      var top = el('div', { class: 'project-top' });
      top.appendChild(el('span', { class: 'num' }, pad(i + 1) + ' / ' + pad(list.length)));
      top.appendChild(el('span', { class: 'live' }, 'Live'));
      body.appendChild(top);
      body.appendChild(el('h3', null, f.name));
      body.appendChild(el('p', null, f.text));
      var meta = el('div', { class: 'project-meta' });
      meta.appendChild(el('span', { class: 'pill' }, f.kind));
      if (f.date) meta.appendChild(el('span', { class: 'pill date' }, f.date));
      body.appendChild(meta);
      body.appendChild(el('a', { class: 'visit', href: f.url, target: '_blank', rel: 'noopener' }, 'Visit ' + host(f.url)));

      art.appendChild(frame); art.appendChild(body);
      target.appendChild(art);
    });
  }
  renderProjects(websites, $('websiteList'), 1, false);
  renderProjects(stores, $('storeList'), 0, true);

  /* ---------- Freelance blogs ---------- */
  var blogList = $('blogList');
  blogs.forEach(function (f, i) {
    var art = el('article', { class: 'card blog-card' });
    art.style.setProperty('--hue', f.hue);
    var cover = el('a', { class: 'cover', href: f.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open ' + f.name + ' in a new tab' });
    if (f.shot) {
      cover.classList.add('has-shot');
      cover.appendChild(el('img', { class: 'shot', src: 'assets/shots/' + f.key + '.jpg', alt: f.name + ' homepage', loading: 'lazy' }));
    } else {
      var bar = el('span', { class: 'cover-bar', 'aria-hidden': 'true' });
      bar.appendChild(el('i'));
      bar.appendChild(document.createTextNode(host(f.url)));
      cover.appendChild(bar);
      cover.appendChild(el('strong', { class: 'cover-name' }, f.name));
      cover.appendChild(el('span', { class: 'cover-tag' }, f.tagline));
      var cats = el('span', { class: 'cover-cats', 'aria-hidden': 'true' });
      f.cats.forEach(function (c) { cats.appendChild(el('em', null, c)); });
      cover.appendChild(cats);
      var lines = el('span', { class: 'cover-lines', 'aria-hidden': 'true' });
      lines.innerHTML = '<i></i><i></i><i></i>';
      cover.appendChild(lines);
    }
    cover.appendChild(el('span', { class: 'open-hint', 'aria-hidden': 'true' }, 'Visit ↗'));

    var body = el('div', { class: 'project-text' });
    var top = el('div', { class: 'project-top' });
    top.appendChild(el('span', { class: 'num' }, pad(i + 1) + ' / ' + pad(blogs.length)));
    top.appendChild(el('span', { class: 'live' }, 'Live'));
    body.appendChild(top);
    body.appendChild(el('h3', null, f.name));
    body.appendChild(el('p', null, f.text));
    var meta = el('div', { class: 'project-meta' });
    meta.appendChild(el('span', { class: 'pill' }, 'Content site'));
    meta.appendChild(el('span', { class: 'pill date' }, 'Freelance'));
    body.appendChild(meta);
    body.appendChild(el('a', { class: 'visit', href: f.url, target: '_blank', rel: 'noopener' }, 'Visit ' + host(f.url)));

    art.appendChild(cover); art.appendChild(body);
    blogList.appendChild(art);
  });
  var pmSites = $('pmSites');
  blogs.forEach(function (f) {
    var s = el('span', null, f.name);
    s.style.setProperty('--hue', f.hue);
    pmSites.appendChild(s);
  });

  /* ---------- Client marquee ---------- */
  var marquee = $('marquee');
  var names = websites.concat(stores, blogs).map(function (f) { return f.name; });
  for (var copy = 0; copy < 2; copy++) {
    names.forEach(function (n, i) {
      marquee.appendChild(el('span', { class: i % 2 ? 'alt' : '' }, n));
      marquee.appendChild(el('i', null, '✦'));
    });
  }

  /* ---------- Toolkit chips ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.toolkit dd'), function (dd) {
    var items = dd.textContent.split(/,\s*/);
    dd.textContent = '';
    items.forEach(function (t) { dd.appendChild(el('span', { class: 'chip' }, t)); });
  });

  /* ---------- Counters (run when the section scrolls into view) ---------- */
  var liveSites = $('websiteList').children.length + $('storeList').children.length + $('blogList').children.length;
  Array.prototype.forEach.call(document.querySelectorAll('[data-count-auto="sites"]'), function (n) {
    n.setAttribute('data-count', liveSites);
    n.textContent = liveSites;
  });
  function runCounter(n) {
    var end = Number(n.getAttribute('data-count')), suffix = n.getAttribute('data-suffix') || '';
    var t0 = null, dur = 1600;
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      n.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    });
  }
  var counterEls = document.querySelectorAll('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        runCounter(en.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counterEls, function (n) {
      n.textContent = '0' + (n.getAttribute('data-suffix') || '');
      cio.observe(n);
    });
  }

  /* ---------- Card spotlight + frame tilt ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.card, .side li, .build-grid article, .contact-form'), function (card) {
      var frame = card.querySelector('.browser, .phone, .cover');
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (frame) {
          frame.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
          frame.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
        }
      });
      card.addEventListener('pointerleave', function () {
        if (frame) { frame.style.setProperty('--ry', '0deg'); frame.style.setProperty('--rx', '0deg'); }
      });
    });
  }

  /* ---------- CRM screen tabs ---------- */
  var crmShot = $('crmShot');
  crmShot.addEventListener('load', function () { crmShot.classList.remove('fading'); });
  var appTabs = document.querySelectorAll('.app-tabs button');
  Array.prototype.forEach.call(appTabs, function (b) {
    var pre = new Image(); pre.src = b.getAttribute('data-shot');
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-selected') === 'true') return;
      Array.prototype.forEach.call(appTabs, function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      crmShot.classList.add('fading');
      setTimeout(function () {
        crmShot.src = b.getAttribute('data-shot');
        crmShot.alt = b.getAttribute('data-alt');
      }, reduceMotion ? 0 : 220);
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

  /* ---------- Scroll reveal ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var groups = [
      '.section-head', '.counter-grid li', '.project', '.panel-feature', '.blog-card', '.app', '.modules > div', '.build-grid article', '.timeline > li',
      '.toolkit > div', '.side li', '.split .text-link', '.contact-intro', '.contact-form', '.footer'
    ];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add('in');
        io.unobserve(t);
        // Hand control back to the element's own hover transitions once it has arrived.
        setTimeout(function () { t.classList.remove('reveal', 'in'); t.style.removeProperty('--d'); }, 1300);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    groups.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (n, i) {
        n.classList.add('reveal');
        n.style.setProperty('--d', Math.min(i % 4, 3) * 90 + 'ms');
        io.observe(n);
      });
    });
  }

  /* ---------- Contact form ---------- */
  var CONTACT_EMAIL = 'monikashyap902@gmail.com';
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
    sendBtn.classList.add('is-sending');
    sendBtn.textContent = 'Sending…';
    setStatus('');

    function readJson(r) {
      return r.json().catch(function () { return {}; }).then(function (data) { return { status: r.status, ok: r.ok, data: data }; });
    }

    // Backup route: FormSubmit delivers straight to the inbox, so the form still works
    // when the Vercel function is missing or its SMTP settings aren't configured.
    function viaFormSubmit() {
      return fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          'Looking for': payload.reason,
          message: payload.message,
          _subject: payload.reason + ': message from ' + payload.name,
          _replyto: payload.email,
          _template: 'table',
          _captcha: 'false',
          _honey: payload.company
        })
      }).then(readJson).then(function (res) {
        var success = res.ok && (res.data.success === true || res.data.success === 'true');
        return { sent: success, error: success ? '' : (res.data.message || '') };
      });
    }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(readJson).then(function (res) {
      if (res.ok && res.data.ok) return { sent: true };
      // Problems with what the visitor typed, or too many tries: show the server's message.
      if (res.status === 400 || res.status === 429) return { sent: false, error: res.data.error };
      return viaFormSubmit();
    }, function () {
      return viaFormSubmit();
    }).then(function (result) {
      if (result.sent) {
        form.reset();
        setStatus('Message sent. I’ll reply to your email soon.', 'ok');
        sendBtn.classList.add('is-sent');
        setTimeout(function () { sendBtn.classList.remove('is-sent'); }, 2400);
      } else {
        setStatus(result.error || 'The message didn’t send. Try again, or email ' + CONTACT_EMAIL + '.', 'err');
      }
    }).catch(function () {
      setStatus('No connection. Check your internet and try again, or email ' + CONTACT_EMAIL + '.', 'err');
    }).then(function () {
      sendBtn.disabled = false;
      sendBtn.classList.remove('is-sending');
      sendBtn.textContent = 'Send message';
    });
  });

  $('year').textContent = new Date().getFullYear();
  spy();
})();
