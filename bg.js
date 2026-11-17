/* Three.js page background.
   - An amber wave of points along the bottom of the view.
   - Twinkling dust spread over the whole screen, top to bottom.
   - Small wireframe shapes floating across the screen.
   Dust and shapes ride with the camera, so they fill every part of the page as you scroll.
   Reacts to the pointer and scroll, follows the light/dark theme, pauses when the tab is hidden
   and stays still for reduced-motion users. */
(function () {
  'use strict';

  var canvas = document.getElementById('bg3d');
  if (!canvas) return;
  if (!window.THREE) { canvas.remove(); return; }
  var THREE = window.THREE;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { canvas.remove(); return; }
  if (!renderer.getContext()) { canvas.remove(); return; }
  renderer.setClearColor(0x000000, 0);

  var root = document.documentElement;
  var small = window.innerWidth < 760;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 220);
  scene.add(camera); // dust and shapes are children of the camera
  var lookTarget = new THREE.Vector3(0, 0, -20);
  var world = new THREE.Group();
  scene.add(world);

  /* ---------- Wave grid ---------- */
  var gap = small ? 1.55 : 1.1;
  var W = small ? 90 : 124, D = 92;
  var cols = Math.floor(W / gap), rows = Math.floor(D / gap);
  var count = cols * rows;
  var pos = new Float32Array(count * 3);
  var rnd = new Float32Array(count);
  var k = 0;
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      pos[k * 3] = -W / 2 + i * gap;
      pos[k * 3 + 1] = 0;
      pos[k * 3 + 2] = -D + 16 + j * gap;
      rnd[k] = Math.random();
      k++;
    }
  }
  var gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gridGeo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));

  var gridMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, -10) },
      uPR: { value: 1 },
      uSize: { value: small ? 3.8 : 3.4 },
      uHalfW: { value: W / 2 },
      uColor: { value: new THREE.Color('#FFB224') },
      uOpacity: { value: 1 }
    },
    vertexShader: [
      'uniform float uTime; uniform vec2 uMouse; uniform float uPR; uniform float uSize; uniform float uHalfW;',
      'attribute float aRand;',
      'varying float vAlpha;',
      'void main() {',
      '  vec3 p = position;',
      '  float w = sin(p.x * 0.16 + uTime * 0.55) * 1.1',
      '          + cos(p.z * 0.21 + uTime * 0.42) * 0.9',
      '          + sin((p.x + p.z) * 0.07 + uTime * 0.28) * 1.6;',
      '  float d = length(p.xz - uMouse);',
      '  w += sin(d * 0.55 - uTime * 2.4) * 1.3 * exp(-d * 0.09);',
      '  p.y += w;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  float z = -mv.z;',
      '  gl_PointSize = min(uSize * uPR * (0.6 + aRand * 0.8) * (12.0 / z), 7.0 * uPR);',
      '  float edge = 1.0 - smoothstep(uHalfW * 0.62, uHalfW, abs(position.x));',
      '  vAlpha = smoothstep(95.0, 18.0, z) * smoothstep(1.5, 7.0, z) * edge * (0.3 + 0.7 * smoothstep(-2.6, 2.8, w));',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; uniform float uOpacity;',
      'varying float vAlpha;',
      'void main() {',
      '  float d = length(gl_PointCoord - 0.5);',
      '  if (d > 0.5) discard;',
      '  gl_FragColor = vec4(uColor, smoothstep(0.5, 0.05, d) * vAlpha * uOpacity);',
      '}'
    ].join('\n')
  });
  world.add(new THREE.Points(gridGeo, gridMat));

  /* ---------- Full-screen dust (camera space) ---------- */
  var dustCount = small ? 260 : 620;
  var dPos = new Float32Array(dustCount * 3);
  var dRnd = new Float32Array(dustCount);
  for (var n = 0; n < dustCount; n++) {
    dPos[n * 3] = (Math.random() - 0.5) * 96;
    dPos[n * 3 + 1] = (Math.random() - 0.5) * 56;
    dPos[n * 3 + 2] = -(16 + Math.random() * 44);
    dRnd[n] = Math.random();
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute('aRand', new THREE.BufferAttribute(dRnd, 1));
  var dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPR: { value: 1 },
      uColor: { value: new THREE.Color('#FFB224') },
      uOpacity: { value: 0.8 }
    },
    vertexShader: [
      'uniform float uTime; uniform float uScroll; uniform float uPR;',
      'attribute float aRand;',
      'varying float vAlpha;',
      'void main() {',
      '  vec3 p = position;',
      '  p.y = mod(p.y + 28.0 + uTime * (0.25 + aRand * 0.55) + uScroll * (6.0 + aRand * 14.0), 56.0) - 28.0;',
      '  p.x += sin(uTime * 0.3 + aRand * 6.28) * 1.2;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = min((1.2 + aRand * 2.8) * uPR * (16.0 / -mv.z), 5.0 * uPR);',
      '  float twinkle = 0.5 + 0.5 * sin(uTime * (1.0 + aRand * 1.5) + aRand * 40.0);',
      '  vAlpha = (0.3 + 0.7 * twinkle) * (1.0 - smoothstep(24.0, 28.0, abs(p.y)));',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; uniform float uOpacity;',
      'varying float vAlpha;',
      'void main() {',
      '  float d = length(gl_PointCoord - 0.5);',
      '  if (d > 0.5) discard;',
      '  gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vAlpha * uOpacity);',
      '}'
    ].join('\n')
  });
  camera.add(new THREE.Points(dustGeo, dustMat));

  /* ---------- Small floating wireframe shapes (camera space) ---------- */
  var shapeDefs = [
    { g: new THREE.IcosahedronGeometry(1, 0), x: -0.84, y: 0.72, z: 30, s: 1.6 },
    { g: new THREE.OctahedronGeometry(1, 0), x: 0.58, y: 0.86, z: 34, s: 1.4 },
    { g: new THREE.TorusGeometry(0.8, 0.26, 8, 26), x: -0.95, y: -0.05, z: 40, s: 1.4 },
    { g: new THREE.TetrahedronGeometry(1, 0), x: 0.9, y: -0.05, z: 32, s: 1.5 },
    { g: new THREE.DodecahedronGeometry(1, 0), x: -0.86, y: -0.72, z: 36, s: 1.5 },
    { g: new THREE.IcosahedronGeometry(1, 1), x: 0.4, y: -0.86, z: 42, s: 1.6 }
  ];
  if (small) shapeDefs = [shapeDefs[0], shapeDefs[1], shapeDefs[4], shapeDefs[5]];
  var shapes = shapeDefs.map(function (d, idx) {
    var m = new THREE.Mesh(d.g, new THREE.MeshBasicMaterial({ color: 0xFFB224, wireframe: true, transparent: true, opacity: 0.2, depthWrite: false }));
    m.userData = d;
    m.userData.spin = 0.15 + (idx % 3) * 0.08;
    m.userData.speed = 0.5 + (idx % 4) * 0.25;
    camera.add(m);
    return m;
  });

  /* ---------- Theme ---------- */
  var gridBase = 1;
  function applyTheme() {
    var dark = root.getAttribute('data-theme') !== 'light';
    var color = dark ? '#FFB224' : '#B36A00';
    var blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    [gridMat, dustMat].forEach(function (m) {
      m.uniforms.uColor.value.set(color);
      m.blending = blend;
      m.needsUpdate = true;
    });
    gridBase = dark ? 1.0 : 0.65;
    dustMat.uniforms.uOpacity.value = dark ? 0.85 : 0.55;
    shapes.forEach(function (m) {
      m.material.color.set(color);
      m.material.opacity = dark ? 0.12 : 0.16;
    });
    if (reduce) render(6);
  }
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Size ---------- */
  var lastW = 0, lastH = 0;
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    // Mobile browsers resize the height when the address bar slides; ignore small jumps.
    if (w === lastW && Math.abs(h - lastH) < 120) return;
    lastW = w; lastH = h;
    var pr = Math.min(window.devicePixelRatio || 1, w < 760 ? 1.5 : 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    gridMat.uniforms.uPR.value = pr;
    dustMat.uniforms.uPR.value = pr;
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 68 : 55;
    camera.updateProjectionMatrix();
    if (reduce) render(6);
  }

  /* ---------- Pointer + scroll ---------- */
  var pointer = new THREE.Vector2(0, 0);
  var smooth = new THREE.Vector2(0, 0);
  var raycaster = new THREE.Raycaster();
  var ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  var hit = new THREE.Vector3();
  var mouseTarget = new THREE.Vector2(0, -10);
  var hasPointer = false;

  window.addEventListener('pointermove', function (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    hasPointer = true;
  }, { passive: true });

  var scrollP = 0, scrollSmooth = 0;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (reduce) render(6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Render ---------- */
  function wrap(v, lim) { var span = lim * 2; return ((v + lim) % span + span) % span - lim; }

  function render(t) {
    gridMat.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;

    smooth.lerp(pointer, 0.05);
    scrollSmooth += (scrollP - scrollSmooth) * 0.06;
    dustMat.uniforms.uScroll.value = scrollSmooth;

    camera.position.set(smooth.x * 3.2, 7 + smooth.y * 1.4 + scrollSmooth * 5, 26 - scrollSmooth * 6);
    lookTarget.set(smooth.x * 1.5, scrollSmooth * -2, -20);
    camera.lookAt(lookTarget);
    world.rotation.y = scrollSmooth * 0.5;

    var tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    shapes.forEach(function (m, idx) {
      var d = m.userData;
      var halfH = d.z * tanHalf, halfW = halfH * camera.aspect;
      var y = d.y * halfH + Math.sin(t * 0.45 + idx) * 0.9 + scrollSmooth * halfH * 2.4 * d.speed;
      m.position.set(
        d.x * halfW + Math.cos(t * 0.3 + idx * 2) * 0.8 - smooth.x * (1 + idx * 0.15),
        wrap(y, halfH * 1.15) - smooth.y * 0.8,
        -d.z
      );
      m.scale.setScalar(d.s);
      m.rotation.x = t * d.spin + idx;
      m.rotation.y = t * d.spin * 1.3 + scrollSmooth * 4;
    });

    if (hasPointer) {
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(ground, hit)) {
        var local = world.worldToLocal(hit.clone());
        mouseTarget.set(local.x, local.z);
      }
    }
    gridMat.uniforms.uMouse.value.lerp(mouseTarget, 0.08);
    // Keep the wave quiet behind body text once the hero has scrolled away.
    gridMat.uniforms.uOpacity.value = gridBase * (1 - Math.min(1, scrollSmooth * 12) * 0.4);

    renderer.render(scene, camera);
  }

  var running = false, start = performance.now(), raf = 0;
  function loop(now) {
    if (!running) return;
    render((now - start) / 1000);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (reduce || running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause(); else play();
  });
  window.addEventListener('resize', resize);

  resize();
  onScroll();
  applyTheme();
  if (reduce) render(6); else play();
  canvas.classList.add('is-ready');
})();
