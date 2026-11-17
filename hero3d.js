/* Three.js effect behind the circular hero portrait:
   a breathing sphere of amber dots around the photo, plus two tilted rings of particles
   with a bright comet running along each. Tilts toward the pointer, follows the theme,
   and only animates while the hero is on screen. */
(function () {
  'use strict';

  var canvas = document.getElementById('hero3d');
  var host = document.querySelector('.hero-visual');
  var portrait = document.querySelector('.portrait');
  if (!canvas || !host || !portrait) return;
  if (!window.THREE) { canvas.remove(); return; }
  var THREE = window.THREE;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { canvas.remove(); return; }
  if (!renderer.getContext()) { canvas.remove(); return; }
  renderer.setClearColor(0x000000, 0);

  var small = window.innerWidth < 760;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8);
  var group = new THREE.Group();
  scene.add(group);

  function pointsMaterial(vertex) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPR: { value: 1 },
        uScale: { value: 1 },
        uColor: { value: new THREE.Color('#FFB224') },
        uHot: { value: new THREE.Color('#FFE2A3') },
        uOpacity: { value: 1 }
      },
      vertexShader: vertex,
      fragmentShader: [
        'uniform vec3 uColor; uniform vec3 uHot; uniform float uOpacity;',
        'varying float vAlpha; varying float vHeat;',
        'void main() {',
        '  float d = length(gl_PointCoord - 0.5);',
        '  if (d > 0.5) discard;',
        '  vec3 c = mix(uColor, uHot, vHeat);',
        '  gl_FragColor = vec4(c, smoothstep(0.5, 0.0, d) * vAlpha * uOpacity);',
        '}'
      ].join('\n')
    });
  }

  /* ---------- Sphere of dots (Fibonacci distribution) ---------- */
  var N = small ? 700 : 1300;
  var sPos = new Float32Array(N * 3), sRnd = new Float32Array(N);
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var r = Math.sqrt(1 - y * y);
    var th = golden * i;
    sPos[i * 3] = Math.cos(th) * r;
    sPos[i * 3 + 1] = y;
    sPos[i * 3 + 2] = Math.sin(th) * r;
    sRnd[i] = Math.random();
  }
  var sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('aRand', new THREE.BufferAttribute(sRnd, 1));
  var sMat = pointsMaterial([
    'uniform float uTime; uniform float uPR; uniform float uScale;',
    'attribute float aRand;',
    'varying float vAlpha; varying float vHeat;',
    'void main() {',
    '  vec3 p = position;',
    '  float wave = sin(uTime * 1.4 + p.y * 6.0 + p.x * 4.0) * 0.5 + 0.5;',
    '  p *= uScale * (1.16 + 0.06 * wave);',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_Position = projectionMatrix * mv;',
    '  gl_PointSize = (1.4 + aRand * 1.8 + wave * 1.2) * uPR * (8.0 / -mv.z);',
    '  vHeat = wave * 0.6;',
    '  vAlpha = 0.25 + 0.75 * wave;',
    '}'
  ].join('\n'));
  var sphere = new THREE.Points(sGeo, sMat);
  group.add(sphere);

  /* ---------- Two tilted particle rings with a running comet ---------- */
  function makeRing(radius, count, tiltX, tiltY, speed) {
    var p = new Float32Array(count * 3), ang = new Float32Array(count), rr = new Float32Array(count);
    for (var j = 0; j < count; j++) {
      var a = (j / count) * Math.PI * 2;
      var jitter = 1 + (Math.random() - 0.5) * 0.05;
      p[j * 3] = Math.cos(a) * jitter;
      p[j * 3 + 1] = Math.sin(a) * jitter;
      p[j * 3 + 2] = (Math.random() - 0.5) * 0.04;
      ang[j] = a;
      rr[j] = Math.random();
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aAng', new THREE.BufferAttribute(ang, 1));
    g.setAttribute('aRand', new THREE.BufferAttribute(rr, 1));
    var m = pointsMaterial([
      'uniform float uTime; uniform float uPR; uniform float uScale;',
      'attribute float aAng; attribute float aRand;',
      'varying float vAlpha; varying float vHeat;',
      'void main() {',
      '  vec3 p = position * uScale * ' + radius.toFixed(2) + ';',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  float head = fract(aAng / 6.28318 - uTime * ' + speed.toFixed(3) + ');',
      '  float comet = pow(head, 10.0);',
      '  gl_PointSize = (1.3 + aRand * 1.2 + comet * 5.0) * uPR * (8.0 / -mv.z);',
      '  vHeat = comet;',
      '  vAlpha = 0.22 + comet * 0.95;',
      '}'
    ].join('\n'));
    var pts = new THREE.Points(g, m);
    pts.rotation.x = tiltX;
    pts.rotation.y = tiltY;
    group.add(pts);
    return pts;
  }
  var ring1 = makeRing(1.42, small ? 260 : 420, 1.15, 0.35, 0.16);
  var ring2 = makeRing(1.62, small ? 300 : 480, 1.3, -0.5, -0.11);
  var mats = [sMat, ring1.material, ring2.material];

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  function applyTheme() {
    var dark = root.getAttribute('data-theme') !== 'light';
    mats.forEach(function (m) {
      m.uniforms.uColor.value.set(dark ? '#FFB224' : '#C46F00');
      m.uniforms.uHot.value.set(dark ? '#FFE2A3' : '#7A3E00');
      m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      m.uniforms.uOpacity.value = dark ? 1 : 0.85;
      m.needsUpdate = true;
    });
    if (reduce) render(4);
  }
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Size: keep 1 unit = the photo's radius ---------- */
  function resize() {
    var c = canvas.getBoundingClientRect();
    var p = portrait.getBoundingClientRect();
    if (!c.width || !c.height) return;
    var pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(c.width, c.height, false);
    camera.aspect = c.width / c.height;
    camera.updateProjectionMatrix();
    var halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    var unit = (p.width / 2) / (c.height / 2) * halfH;
    mats.forEach(function (m) { m.uniforms.uPR.value = pr; m.uniforms.uScale.value = unit; });
    if (reduce) render(4);
  }

  /* ---------- Pointer tilt ---------- */
  var tx = 0, ty = 0;
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---------- Loop ---------- */
  function render(t) {
    mats.forEach(function (m) { m.uniforms.uTime.value = t; });
    sphere.rotation.y = t * 0.18;
    sphere.rotation.x = Math.sin(t * 0.2) * 0.2;
    ring1.rotation.z = t * 0.12;
    ring2.rotation.z = -t * 0.09;
    group.rotation.y += (tx * 0.35 - group.rotation.y) * 0.05;
    group.rotation.x += (ty * 0.25 - group.rotation.x) * 0.05;
    renderer.render(scene, camera);
  }

  var running = false, visible = true, raf = 0, start = performance.now();
  function loop(now) {
    if (!running) return;
    render((now - start) / 1000);
    raf = requestAnimationFrame(loop);
  }
  function update() {
    var should = !reduce && visible && !document.hidden;
    if (should && !running) { running = true; raf = requestAnimationFrame(loop); }
    if (!should && running) { running = false; cancelAnimationFrame(raf); }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }).observe(host);
  }
  document.addEventListener('visibilitychange', update);
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);

  resize();
  applyTheme();
  if (reduce) render(4); else update();
  canvas.classList.add('is-ready');
})();
