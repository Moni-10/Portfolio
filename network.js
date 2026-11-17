/* Three.js "network" effect for sections marked data-fx="network".
   Drifting nodes link up when close, data packets travel along the links,
   and nodes near the pointer connect to it. Follows the theme, only animates
   while the section is on screen, and stays still for reduced-motion users. */
(function () {
  'use strict';
  if (!window.THREE) return;
  var THREE = window.THREE;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  Array.prototype.forEach.call(document.querySelectorAll('[data-fx="network"]'), setup);

  function setup(host) {
    var canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.insertBefore(canvas, host.firstChild);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) { canvas.remove(); return; }
    if (!renderer.getContext()) { canvas.remove(); return; }
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
    var W = 1, H = 1, LINK = 170;
    var MAX_NODES = 90, MAX_LINKS = 900, MAX_PACKETS = 24;
    var nodes = [], packets = [];

    /* Nodes */
    var nPos = new Float32Array(MAX_NODES * 3), nSize = new Float32Array(MAX_NODES);
    var nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
    nGeo.setAttribute('aSize', new THREE.BufferAttribute(nSize, 1));
    var pointMat = function (glow) {
      return new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color('#FFB224') }, uOpacity: { value: 1 }, uPR: { value: 1 } },
        vertexShader: [
          'attribute float aSize; uniform float uPR;',
          'void main() {',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '  gl_PointSize = aSize * uPR;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform vec3 uColor; uniform float uOpacity;',
          'void main() {',
          '  float d = length(gl_PointCoord - 0.5);',
          '  if (d > 0.5) discard;',
          '  float a = ' + (glow ? 'smoothstep(0.5, 0.0, d)' : 'smoothstep(0.5, 0.3, d)') + ';',
          '  gl_FragColor = vec4(uColor, a * uOpacity);',
          '}'
        ].join('\n')
      });
    };
    var nMat = pointMat(false);
    scene.add(new THREE.Points(nGeo, nMat));

    /* Links */
    var lPos = new Float32Array(MAX_LINKS * 6), lAlpha = new Float32Array(MAX_LINKS * 2);
    var lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    lGeo.setAttribute('aAlpha', new THREE.BufferAttribute(lAlpha, 1));
    var lMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color('#FFB224') }, uOpacity: { value: 1 } },
      vertexShader: [
        'attribute float aAlpha; varying float vA;',
        'void main() { vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor; uniform float uOpacity; varying float vA;',
        'void main() { gl_FragColor = vec4(uColor, vA * uOpacity); }'
      ].join('\n')
    });
    scene.add(new THREE.LineSegments(lGeo, lMat));

    /* Packets */
    var pPos = new Float32Array(MAX_PACKETS * 3), pSize = new Float32Array(MAX_PACKETS);
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
    var pMat = pointMat(true);
    scene.add(new THREE.Points(pGeo, pMat));
    var mats = [nMat, lMat, pMat];

    function build() {
      var count = Math.max(18, Math.min(MAX_NODES, Math.round((W * H) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          s: 2.5 + Math.random() * 3.5, ph: Math.random() * 6.28
        });
      }
      packets = [];
      var pc = Math.min(MAX_PACKETS, Math.round(count / 3));
      for (var p = 0; p < pc; p++) packets.push(newPacket());
    }
    function newPacket(from) {
      var a = from != null ? from : Math.floor(Math.random() * nodes.length);
      return { a: a, b: nearest(a), t: Math.random(), sp: 0.006 + Math.random() * 0.01 };
    }
    function nearest(a) {
      var best = -1, bd = Infinity, A = nodes[a];
      for (var i = 0; i < nodes.length; i++) {
        if (i === a) continue;
        var dx = nodes[i].x - A.x, dy = nodes[i].y - A.y, d = dx * dx + dy * dy;
        if (d < bd && Math.random() > 0.35) { bd = d; best = i; }
      }
      return best < 0 ? (a + 1) % nodes.length : best;
    }

    var pointer = { x: -9999, y: -9999, on: false };
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = H - (e.clientY - r.top); pointer.on = true;
    }, { passive: true });
    host.addEventListener('pointerleave', function () { pointer.on = false; });

    function applyTheme() {
      var dark = root.getAttribute('data-theme') !== 'light';
      mats.forEach(function (m) {
        m.uniforms.uColor.value.set(dark ? '#FFB224' : '#B36A00');
        m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        m.needsUpdate = true;
      });
      nMat.uniforms.uOpacity.value = dark ? 0.75 : 0.6;
      lMat.uniforms.uOpacity.value = dark ? 0.55 : 0.4;
      pMat.uniforms.uOpacity.value = 1;
      if (reduce) step(0);
    }
    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    function resize() {
      var r = host.getBoundingClientRect();
      var w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h || (w === W && Math.abs(h - H) < 4)) return;
      var rebuild = Math.abs(w - W) > 40 || Math.abs(h - H) > 200;
      W = w; H = h;
      LINK = W < 700 ? 120 : 170;
      var pr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(pr);
      renderer.setSize(W, H, false);
      mats.forEach(function (m) { if (m.uniforms.uPR) m.uniforms.uPR.value = pr; });
      camera.left = 0; camera.right = W; camera.top = H; camera.bottom = 0;
      camera.updateProjectionMatrix();
      if (rebuild || !nodes.length) build();
      if (reduce) step(0);
    }

    function step(t) {
      var i, j, n, li = 0;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (!reduce) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
          if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
          if (pointer.on) {
            var px = n.x - pointer.x, py = n.y - pointer.y, pd = Math.sqrt(px * px + py * py);
            if (pd < 120 && pd > 0.1) { n.x += (px / pd) * 0.6; n.y += (py / pd) * 0.6; }
          }
        }
        nPos[i * 3] = n.x; nPos[i * 3 + 1] = n.y; nPos[i * 3 + 2] = 0;
        nSize[i] = n.s + Math.sin(t * 2 + n.ph) * 1.2;
      }
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length && li < MAX_LINKS; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            var a = (1 - d / LINK) * 0.6;
            lPos.set([nodes[i].x, nodes[i].y, 0, nodes[j].x, nodes[j].y, 0], li * 6);
            lAlpha[li * 2] = a; lAlpha[li * 2 + 1] = a;
            li++;
          }
        }
        if (pointer.on && li < MAX_LINKS) {
          var qx = nodes[i].x - pointer.x, qy = nodes[i].y - pointer.y, qd = Math.sqrt(qx * qx + qy * qy);
          if (qd < 200) {
            var qa = (1 - qd / 200) * 0.9;
            lPos.set([nodes[i].x, nodes[i].y, 0, pointer.x, pointer.y, 0], li * 6);
            lAlpha[li * 2] = qa; lAlpha[li * 2 + 1] = qa * 0.2;
            li++;
          }
        }
      }
      for (i = 0; i < packets.length; i++) {
        var p = packets[i];
        if (!reduce) {
          p.t += p.sp;
          if (p.t >= 1) {
            p = newPacket(p.b);
            p.t = 0;
            packets[i] = p;
          }
        }
        var A = nodes[p.a], B = nodes[p.b];
        pPos[i * 3] = A.x + (B.x - A.x) * p.t;
        pPos[i * 3 + 1] = A.y + (B.y - A.y) * p.t;
        pPos[i * 3 + 2] = 0;
        pSize[i] = 9;
      }
      nGeo.setDrawRange(0, nodes.length);
      nGeo.attributes.position.needsUpdate = true; nGeo.attributes.aSize.needsUpdate = true;
      lGeo.setDrawRange(0, li * 2);
      lGeo.attributes.position.needsUpdate = true; lGeo.attributes.aAlpha.needsUpdate = true;
      pGeo.setDrawRange(0, packets.length);
      pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aSize.needsUpdate = true;
      renderer.render(scene, camera);
    }

    var running = false, visible = false, raf = 0, start = performance.now();
    function loop(now) {
      if (!running) return;
      step((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    }
    function update() {
      var should = !reduce && visible && !document.hidden;
      if (should && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!should && running) { running = false; cancelAnimationFrame(raf); }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }, { rootMargin: '100px' }).observe(host);
    } else { visible = true; }
    document.addEventListener('visibilitychange', update);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    window.addEventListener('resize', resize);

    resize();
    applyTheme();
    if (reduce) step(0); else update();
    canvas.classList.add('is-ready');
  }
})();
