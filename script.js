// ================= EmailJS Initialization (Preserved) =================
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init("yWUV3Q51JOYuYjEEg"); 
  }
})();

// ================= Global States & Responsive Variables =================
const IS_MOBILE = window.innerWidth < 900 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
let mouseX = 0, mouseY = 0;
let mouseXRaw = 0, mouseYRaw = 0;
let cursorDot, cursorRing;

// Physics LERP state values
let ringX = 0, ringY = 0;

// Three.js groups for external animation loop controls
let laptopGroup, ring1, ring2, screenGroup;
let skillCubes = [], skillDataRef = [];

// ================= DOM Load Initialization =================
window.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initBackground3D();
  if (!IS_MOBILE) {
    initCustomCursor();
    initHero3D();
    initSkills3D();
    initInteractiveParallax();
  }
  initScrollAnimations();
  initNavbarMenu();
  initVanillaTilt();
  initCertificateLightbox();
  initAbout3D();
  
  // Cinematic Tech Innovator features
  initHeroTabs();
  initCyberTerminal();
  initIntroAvatar3D();
});

// Track Mouse Movement Coordinates
window.addEventListener('mousemove', (e) => {
  mouseXRaw = e.clientX;
  mouseYRaw = e.clientY;
  mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

  if (!IS_MOBILE) {
    // Spotlight Coords Variables
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }
});

// ================= Preloader & Loading Screen =================
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const loaderText = document.querySelector('.loader-text');
  const loadingBar = document.querySelector('.loading-bar');
  
  if (!preloader) return;

  let progress = 0;
  const loadDuration = 1000;
  const intervalTime = 20;
  const increment = 100 / (loadDuration / intervalTime);

  const loaderInterval = setInterval(() => {
    progress += increment;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      
      // End Preloader overlay
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          preloader.classList.add('fade-out');
          animateHeroEntrance();
        }
      });
    }
    if (loaderText) loaderText.textContent = Math.round(progress) + '%';
    if (loadingBar) loadingBar.style.width = progress + '%';
  }, intervalTime);
}

// ================= Hero Entrance Animations =================
function animateHeroEntrance() {
  const heroTL = gsap.timeline();

  heroTL.fromTo('.hero-content .badge', 
    { opacity: 0, y: -30, scale: 0.95 }, 
    { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
  )
  .fromTo('.hero-content h1', 
    { opacity: 0, y: 40 }, 
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    '-=0.4'
  )
  .fromTo('.hero-content p', 
    { opacity: 0, y: 25 }, 
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
    '-=0.4'
  )
  .fromTo('.hero-content .buttons .btn', 
    { opacity: 0, scale: 0.8 }, 
    { opacity: 1, scale: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(1.5)' },
    '-=0.3'
  )
  .fromTo('.hero-3d-container', 
    { opacity: 0, scale: 0.8 }, 
    { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
    '-=0.7'
  );

  startTypingAnimation();
}

// ================= Custom Glowing Cursor =================
function initCustomCursor() {
  cursorDot = document.getElementById('custom-cursor-dot');
  cursorRing = document.getElementById('custom-cursor-ring');

  if (!cursorDot || !cursorRing) return;

  ringX = window.innerWidth / 2;
  ringY = window.innerHeight / 2;

  // Listeners for hovered active scale transformations
  const hoverables = document.querySelectorAll('a, button, select, textarea, input, [role="button"], [data-tilt], .card, .gallery-card, .timeline-content, .achievement-card, .stat-card');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.classList.add('hovered');
      cursorRing.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('hovered');
      cursorRing.classList.remove('hovered');
    });
  });

  // Hide cursor when leaving window viewport boundary
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = 0;
    cursorRing.style.opacity = 0;
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = 1;
    cursorRing.style.opacity = 1;
  });

  runCursorTick();
}

function runCursorTick() {
  if (cursorDot) {
    cursorDot.style.left = `${mouseXRaw}px`;
    cursorDot.style.top = `${mouseYRaw}px`;
  }

  // Smooth LERP lag tracking outer ring
  if (cursorRing) {
    ringX += (mouseXRaw - ringX) * 0.14;
    ringY += (mouseYRaw - ringY) * 0.14;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }

  requestAnimationFrame(runCursorTick);
}

// ================= 1. Background Scene (Interactive Constellation Particle Web & Shapes) =================
function initBackground3D() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.8, 8);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // --- Dynamic Particle Network Web ---
  const particlesCount = IS_MOBILE ? 40 : 100;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particlesCount * 3);
  const velocities = [];

  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10 + 1.8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

    velocities.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.008
    });
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.06,
    color: 0x00d2ff, // Electric Blue Nodes
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // Connecting Lines Setup
  const maxConnections = 300;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(maxConnections * 2 * 3);
  const lineColors = new Float32Array(maxConnections * 2 * 3);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  // --- Floating Cyber, Fullstack, and AI Geometries ---
  const shapesGroup = new THREE.Group();
  scene.add(shapesGroup);

  const bgShapes = [];
  const shapeGeoms = [
    new THREE.IcosahedronGeometry(0.35, 1), // AI (neural node)
    new THREE.TorusKnotGeometry(0.24, 0.07, 48, 8, 2, 3), // Cyber (encryption knot)
    new THREE.CylinderGeometry(0.28, 0.28, 0.45, 16, 3) // Fullstack (database server drum)
  ];

  const blueMaterial = new THREE.MeshPhongMaterial({
    color: 0x00d2ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 0.1,
    specular: 0x9bf8ff,
    shininess: 90,
    transparent: true,
    opacity: 0.65
  });

  const tealMaterial = new THREE.MeshPhongMaterial({
    color: 0x00f5d4,
    emissive: 0x00f5d4,
    emissiveIntensity: 0.1,
    specular: 0xbbffff,
    shininess: 90,
    transparent: true,
    opacity: 0.65
  });

  const graphiteMaterial = new THREE.MeshPhongMaterial({
    color: 0x0c0d15,
    emissive: 0x020204,
    specular: 0x666666,
    shininess: 50,
    transparent: true,
    opacity: 0.75
  });

  const glassMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 120,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 10; i++) {
    const geom = shapeGeoms[Math.floor(Math.random() * shapeGeoms.length)].clone();
    let mat;
    const r = Math.random();
    if (r < 0.35) {
      mat = blueMaterial;
    } else if (r < 0.7) {
      mat = tealMaterial;
    } else if (r < 0.85) {
      mat = graphiteMaterial;
    } else {
      mat = glassMaterial;
    }

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 8 + 1.8,
      (Math.random() - 0.5) * 10 - 4
    );

    mesh.userData = {
      baseX: mesh.position.x,
      baseY: mesh.position.y,
      baseZ: mesh.position.z,
      rotX: (Math.random() - 0.5) * 0.01,
      rotY: (Math.random() - 0.5) * 0.01,
      rotZ: (Math.random() - 0.5) * 0.01,
      floatSpeed: 0.0004 + Math.random() * 0.0008,
      floatOffset: Math.random() * 100,
      parallaxFactor: 0.5 + Math.random() * 0.8
    };

    shapesGroup.add(mesh);
    bgShapes.push(mesh);
  }

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00d2ff, 1.2); // Electric Blue Light
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00f5d4, 0.8); // Cybernetic Teal Light
  dirLight2.position.set(-5, -5, 2);
  scene.add(dirLight2);

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Loop
  let targetCamX = 0, targetCamY = 0;
  function animate() {
    requestAnimationFrame(animate);

    // --- Particle Network updates ---
    const coords = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particlesCount; i++) {
      coords[i * 3] += velocities[i].x;
      coords[i * 3 + 1] += velocities[i].y;
      coords[i * 3 + 2] += velocities[i].z;

      // Wrap boundaries
      if (Math.abs(coords[i * 3]) > 9) velocities[i].x *= -1;
      if (coords[i * 3 + 1] < -3 || coords[i * 3 + 1] > 7) velocities[i].y *= -1;
      if (Math.abs(coords[i * 3 + 2]) > 7) velocities[i].z *= -1;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Line connections checks
    let lineIdx = 0;
    const lineCoords = lineGeometry.attributes.position.array;
    const lineCol = lineGeometry.attributes.color.array;
    const colorBlue = new THREE.Color(0x00d2ff);
    const colorTeal = new THREE.Color(0x00f5d4);

    for (let i = 0; i < particlesCount; i++) {
      const xi = coords[i * 3];
      const yi = coords[i * 3 + 1];
      const zi = coords[i * 3 + 2];

      for (let j = i + 1; j < particlesCount; j++) {
        const xj = coords[j * 3];
        const yj = coords[j * 3 + 1];
        const zj = coords[j * 3 + 2];

        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 2.2 && lineIdx < maxConnections) {
          const alpha = (1.0 - dist / 2.2) * 0.35;

          lineCoords[lineIdx * 6] = xi;
          lineCoords[lineIdx * 6 + 1] = yi;
          lineCoords[lineIdx * 6 + 2] = zi;

          lineCoords[lineIdx * 6 + 3] = xj;
          lineCoords[lineIdx * 6 + 4] = yj;
          lineCoords[lineIdx * 6 + 5] = zj;

          const mixed = colorBlue.clone().lerp(colorTeal, dist / 2.2);

          lineCol[lineIdx * 6] = mixed.r * alpha;
          lineCol[lineIdx * 6 + 1] = mixed.g * alpha;
          lineCol[lineIdx * 6 + 2] = mixed.b * alpha;
          
          lineCol[lineIdx * 6 + 3] = mixed.r * alpha;
          lineCol[lineIdx * 6 + 4] = mixed.g * alpha;
          lineCol[lineIdx * 6 + 5] = mixed.b * alpha;

          lineIdx++;
        }
      }
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineIdx * 2);

    // --- Floating shapes drift & parallax updates ---
    bgShapes.forEach(shape => {
      shape.rotation.x += shape.userData.rotX;
      shape.rotation.y += shape.userData.rotY;
      shape.rotation.z += shape.userData.rotZ;

      const time = Date.now() * shape.userData.floatSpeed + shape.userData.floatOffset;
      const driftY = Math.sin(time) * 0.45;
      const driftX = Math.cos(time * 0.85) * 0.3;

      // Mouse Parallax drift
      const targetX = shape.userData.baseX + driftX + (mouseX * 1.6 * shape.userData.parallaxFactor);
      const targetY = shape.userData.baseY + driftY + (-mouseY * 1.2 * shape.userData.parallaxFactor);

      shape.position.x += (targetX - shape.position.x) * 0.05;
      shape.position.y += (targetY - shape.position.y) * 0.05;
    });

    // Camera parallax LERP
    targetCamX += (mouseX - targetCamX) * 0.06;
    targetCamY += (mouseY - targetCamY) * 0.06;

    camera.position.x = targetCamX * 1.5;
    camera.position.y = 1.8 + (-targetCamY * 0.8);
    camera.lookAt(0, 1.8, 0);

    renderer.render(scene, camera);
  }
  animate();
}

// ================= 2. Hero Scene (WebGL 3D Laptop & Orbit Rings in Gold/Bronze) =================
// ================= 2. Hero Scene (WebGL 3D AI, Dev & Cyber Terminal) =================
function initHero3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.0, 5.8);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Holographic Core Group
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // Obsidian Octagonal Mainframe Base
  const baseGeo = new THREE.CylinderGeometry(1.3, 1.5, 0.15, 8);
  const baseMat = new THREE.MeshPhongMaterial({ 
    color: 0x0c0d15, 
    shininess: 90, 
    specular: 0x00d2ff,
    flatShading: true
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -1.0;
  coreGroup.add(baseMesh);

  // Tech Grid Base plate
  const gridBase = new THREE.GridHelper(2.5, 12, 0x00d2ff, 0x004455);
  gridBase.position.y = -0.92;
  coreGroup.add(gridBase);

  // Central Holographic AI Node Sphere
  const sphereGeo = new THREE.IcosahedronGeometry(0.55, 2);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x00f5d4, // Cybernetic Teal
    emissive: 0x00443d,
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const aiSphere = new THREE.Mesh(sphereGeo, sphereMat);
  aiSphere.position.y = 0.1;
  coreGroup.add(aiSphere);

  // Inner Electric Glow Core
  const innerGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const innerMat = new THREE.MeshPhongMaterial({
    color: 0x00d2ff, // Electric Blue Core
    emissive: 0x002c33,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.95
  });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  innerCore.position.y = 0.1;
  coreGroup.add(innerCore);

  // Concentric Orbiting Rings
  const ringGroup = new THREE.Group();
  ringGroup.position.y = 0.1;
  coreGroup.add(ringGroup);

  // Ring 1: Teal Horizontal Orbit
  const r1Geo = new THREE.TorusGeometry(1.1, 0.02, 8, 48);
  const r1Mat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.65 });
  const r1 = new THREE.Mesh(r1Geo, r1Mat);
  r1.rotation.x = Math.PI / 2;
  ringGroup.add(r1);

  // Ring 2: Blue Skewed Orbit
  const r2Geo = new THREE.TorusGeometry(1.3, 0.02, 8, 48);
  const r2Mat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.55 });
  const r2 = new THREE.Mesh(r2Geo, r2Mat);
  r2.rotation.x = Math.PI / 4;
  r2.rotation.y = Math.PI / 6;
  ringGroup.add(r2);

  // Ring 3: Orthogonal Outer Orbit
  const r3Geo = new THREE.TorusGeometry(1.5, 0.015, 8, 48);
  const r3Mat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.45 });
  const r3 = new THREE.Mesh(r3Geo, r3Mat);
  r3.rotation.y = Math.PI / 3;
  r3.rotation.z = Math.PI / 4;
  ringGroup.add(r3);

  // Floating Cyber Nodes (Shield fragments)
  const shieldGeo = new THREE.BoxGeometry(0.12, 0.12, 0.03);
  const shieldMat = new THREE.MeshPhongMaterial({
    color: 0x00d2ff,
    emissive: 0x002c33,
    specular: 0xffffff,
    transparent: true,
    opacity: 0.75
  });
  const shields = [];
  const shieldCount = 6;

  for (let i = 0; i < shieldCount; i++) {
    const angle = (i / shieldCount) * Math.PI * 2;
    const mesh = new THREE.Mesh(shieldGeo, shieldMat);
    mesh.userData = {
      angle: angle,
      speed: 0.007,
      radius: 1.0,
      yOffset: (Math.random() - 0.5) * 0.35
    };
    ringGroup.add(mesh);
    shields.push(mesh);
  }

  // Upward binary streams / data flows
  const streamCount = 30;
  const streamGeometry = new THREE.BufferGeometry();
  const streamPositions = new Float32Array(streamCount * 3);
  const streamVelocities = [];

  for (let i = 0; i < streamCount; i++) {
    streamPositions[i * 3] = (Math.random() - 0.5) * 2.0;
    streamPositions[i * 3 + 1] = -0.92;
    streamPositions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
    streamVelocities.push(0.01 + Math.random() * 0.015);
  }

  streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
  const streamMaterial = new THREE.PointsMaterial({
    size: 0.045,
    color: 0x00f5d4,
    transparent: true,
    opacity: 0.8
  });
  const dataStreams = new THREE.Points(streamGeometry, streamMaterial);
  coreGroup.add(dataStreams);

  // Scene Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0x00d2ff, 1.4);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00f5d4, 0.9);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  const pointLight = new THREE.PointLight(0x00f5d4, 2.0, 6);
  pointLight.position.set(0, 0.1, 0);
  scene.add(pointLight);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Render Loop
  let targetRotX = 0, targetRotY = 0;
  let targetPosX = 0, targetPosY = 0;

  function animate() {
    requestAnimationFrame(animate);

    // Slowly rotate spheres
    aiSphere.rotation.y += 0.008;
    aiSphere.rotation.x += 0.004;
    innerCore.rotation.y -= 0.01;

    r1.rotation.z += 0.003;
    r2.rotation.z -= 0.005;
    r3.rotation.z += 0.002;

    // AI Core floating pulse
    const pulseFactor = 0.08 * Math.sin(Date.now() * 0.0016);
    aiSphere.position.y = 0.1 + pulseFactor;
    innerCore.position.y = 0.1 + pulseFactor;
    ringGroup.position.y = 0.1 + pulseFactor;

    // Orbiting shields
    shields.forEach(mesh => {
      mesh.userData.angle += mesh.userData.speed;
      mesh.position.x = Math.cos(mesh.userData.angle) * mesh.userData.radius;
      mesh.position.z = Math.sin(mesh.userData.angle) * mesh.userData.radius;
      mesh.position.y = mesh.userData.yOffset;
      mesh.rotation.y = -mesh.userData.angle + Math.PI / 2;
    });

    // Rise data streams
    const streamCoords = dataStreams.geometry.attributes.position.array;
    for (let i = 0; i < streamCount; i++) {
      streamCoords[i * 3 + 1] += streamVelocities[i];
      if (streamCoords[i * 3 + 1] > 0.8) {
        streamCoords[i * 3] = (Math.random() - 0.5) * 2.0;
        streamCoords[i * 3 + 1] = -0.92;
        streamCoords[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
      }
    }
    dataStreams.geometry.attributes.position.needsUpdate = true;

    // Parallax mouse follow LERP
    targetRotX += (mouseY - targetRotX) * 0.06;
    targetRotY += (mouseX - targetRotY) * 0.06;

    coreGroup.rotation.x = targetRotX * 0.4;
    coreGroup.rotation.y = Math.sin(Date.now() * 0.0003) * 0.08 + (targetRotY * 0.5);

    targetPosX += (mouseX * 0.7 - targetPosX) * 0.05;
    targetPosY += (-mouseY * 0.5 - targetPosY) * 0.05;
    coreGroup.position.set(targetPosX, targetPosY, 0);

    renderer.render(scene, camera);
  }
  animate();
}

// ================= 3. Skills Scene (Magnetic Floating Skill Cubes in Gold/Bronze) =================
function initSkills3D() {
  const canvas = document.getElementById('skills-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 7.5;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Canvas text texture helper
  function createSkillNodeTexture(name, color) {
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 256;
    textCanvas.height = 256;
    const ctx = textCanvas.getContext('2d');
    
    ctx.clearRect(0, 0, 256, 256);
    
    // Glowing gradient circle
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, 'rgba(12, 13, 21, 0.95)');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.lineWidth = 8;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillText(name, 128, 128);

    return new THREE.CanvasTexture(textCanvas);
  }

  // 6 Skills representation nodes
  const skillNodesData = [
    { name: 'Python', color: '#00ff66', pos: [-1.6, 1.0, 0] },
    { name: 'AI & ML', color: '#8b5cf6', pos: [1.6, 1.1, -0.5] },
    { name: 'React', color: '#3b82f6', pos: [0, 1.3, 0.5] },
    { name: 'Cyber Sec', color: '#00ff66', pos: [-1.5, -0.9, -0.3] },
    { name: 'Databases', color: '#3b82f6', pos: [1.5, -0.8, 0.3] },
    { name: 'Git/Linux', color: '#8b5cf6', pos: [0, -1.2, -0.4] }
  ];

  const skillMeshes = [];
  const nodesGroup = new THREE.Group();
  scene.add(nodesGroup);

  skillNodesData.forEach(data => {
    const texture = createSkillNodeTexture(data.name, data.color);
    const geometry = new THREE.SphereGeometry(0.55, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 120,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
    mesh.userData = {
      baseX: data.pos[0],
      baseY: data.pos[1],
      baseZ: data.pos[2],
      floatOffset: Math.random() * 50,
      pulseSpeed: 0.002 + Math.random() * 0.002
    };
    nodesGroup.add(mesh);
    skillMeshes.push(mesh);
  });

  // Connecting network lines
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.25
  });
  
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = [];
  
  for (let i = 0; i < skillMeshes.length; i++) {
    for (let j = i + 1; j < skillMeshes.length; j++) {
      linePositions.push(skillNodesData[i].pos[0], skillNodesData[i].pos[1], skillNodesData[i].pos[2]);
      linePositions.push(skillNodesData[j].pos[0], skillNodesData[j].pos[1], skillNodesData[j].pos[2]);
    }
  }
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const connections = new THREE.LineSegments(lineGeo, lineMat);
  nodesGroup.add(connections);

  // Lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  dirLight.position.set(2, 4, 5);
  scene.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Render loop
  let targetRotX = 0, targetRotY = 0;
  function animate() {
    requestAnimationFrame(animate);

    // Float each node
    skillMeshes.forEach(mesh => {
      const time = Date.now() * mesh.userData.pulseSpeed + mesh.userData.floatOffset;
      mesh.position.y = mesh.userData.baseY + Math.sin(time) * 0.12;
      mesh.position.x = mesh.userData.baseX + Math.cos(time * 0.7) * 0.08;
      
      mesh.rotation.y += 0.005;
    });

    // Update lines to follow floating nodes
    const coords = connections.geometry.attributes.position.array;
    let idx = 0;
    for (let i = 0; i < skillMeshes.length; i++) {
      for (let j = i + 1; j < skillMeshes.length; j++) {
        coords[idx * 6] = skillMeshes[i].position.x;
        coords[idx * 6 + 1] = skillMeshes[i].position.y;
        coords[idx * 6 + 2] = skillMeshes[i].position.z;

        coords[idx * 6 + 3] = skillMeshes[j].position.x;
        coords[idx * 6 + 4] = skillMeshes[j].position.y;
        coords[idx * 6 + 5] = skillMeshes[j].position.z;
        idx++;
      }
    }
    connections.geometry.attributes.position.needsUpdate = true;

    // Slow rotation of entire group
    nodesGroup.rotation.y = Math.sin(Date.now() * 0.0002) * 0.2;

    // Magnetic mouse follow tilt
    targetRotX += (mouseY - targetRotX) * 0.07;
    targetRotY += (mouseX - targetRotY) * 0.07;
    nodesGroup.rotation.x = targetRotX * 0.3;
    nodesGroup.rotation.y += targetRotY * 0.4;

    renderer.render(scene, camera);
  }
  animate();
}

// ================= GSAP Animations & Reveals =================
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Fade reveals
  const scrollSections = document.querySelectorAll('.reveal-on-scroll');
  scrollSections.forEach(sec => {
    gsap.fromTo(sec, 
      { opacity: 0, y: 55 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Stagger load grid cards
  const gridContainers = [
    { target: '.cards.reveal-on-scroll', items: '.card' },
    { target: '.gallery-grid.reveal-on-scroll', items: '.gallery-card' },
    { target: '.achievements-grid.reveal-on-scroll', items: '.achievement-card' }
  ];

  gridContainers.forEach(container => {
    const el = document.querySelector(container.target);
    if (el) {
      gsap.fromTo(el.querySelectorAll(container.items),
         { opacity: 0, y: 40, rotateX: -12 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  });

  // Timelines reveal
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    const slideDirection = item.classList.contains('left') ? -60 : 60;
    gsap.fromTo(item,
      { opacity: 0, x: slideDirection, rotateY: slideDirection > 0 ? 20 : -20 },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Skills
  gsap.fromTo('.bar span',
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: 1.3,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ================= Typing Roles Animation =================
const roles = ["AI & Data Science Student", "Full Stack Developer", "Cybersecurity Explorer", "Automation Specialist"];
let typingIndex = 0;
let charIndex = 0;
let isTypingDeleting = false;

function startTypingAnimation() {
  runTypingEffect();
}

function runTypingEffect() {
  const targetText = roles[typingIndex];
  const typingElement = document.getElementById("typing");
  if (!typingElement) return;

  const currentDisplay = targetText.substring(0, charIndex);
  typingElement.textContent = currentDisplay + "|";

  let speed = isTypingDeleting ? 45 : 90;

  if (!isTypingDeleting && charIndex < targetText.length) {
    charIndex++;
    setTimeout(runTypingEffect, speed);
  } else if (isTypingDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(runTypingEffect, speed);
  } else {
    isTypingDeleting = !isTypingDeleting;
    if (!isTypingDeleting) {
      typingIndex = (typingIndex + 1) % roles.length;
    }
    setTimeout(runTypingEffect, isTypingDeleting ? 1200 : 300);
  }
}

// ================= Interactive 3D Glare Tilts =================
function initVanillaTilt() {
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 12, // Max tilt angle (subtle & elegant)
      speed: 500,
      glare: true,
      "max-glare": 0.25,
      perspective: 900,
      scale: 1.03,
      reset: true
    });
  }
}

// ================= Mobile Menu & Scroll Toggles =================
function initNavbarMenu() {
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(15, 15, 16, 0.95)';
      header.style.borderBottom = '1px solid rgba(212, 175, 55, 0.15)';
    } else {
      header.style.background = 'rgba(15, 15, 16, 0.85)';
      header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.03)';
    }
  });

  if (window.innerWidth < 900 && nav) {
    const toggle = document.createElement('div');
    toggle.className = 'hamburger-menu';
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    toggle.style.cursor = 'pointer';
    toggle.style.fontSize = '20px';
    toggle.style.color = '#ffffff';
    header.appendChild(toggle);

    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      const icon = toggle.querySelector('i');
      if (nav.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    nav.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', () => {
        nav.classList.remove('active');
        const icon = toggle.querySelector('i');
        icon.className = 'fas fa-bars';
      });
    });
  }
}

// ================= GSAP Interactive Content Parallax & Shifting =================
function initInteractiveParallax() {
  if (IS_MOBILE) return;
  
  window.addEventListener('mousemove', () => {
    const xVal = mouseX * 22;
    const yVal = mouseY * 22;

    // Shift glow orbs
    gsap.to('.orb-1', { x: -xVal * 0.7, y: -yVal * 0.7, duration: 1.5, ease: 'power2.out' });
    gsap.to('.orb-2', { x: xVal * 1.1, y: yVal * 1.1, duration: 1.5, ease: 'power2.out' });
    gsap.to('.orb-3', { x: -xVal * 0.4, y: yVal * 0.4, duration: 1.5, ease: 'power2.out' });

    // Hero content opposing parallax shift
    gsap.to('.hero-content', { 
      x: -xVal * 0.4, 
      y: -yVal * 0.4, 
      duration: 1.2, 
      ease: 'power2.out' 
    });

    // Subtitle labels parallax
    gsap.to('.section-subtitle', {
      x: xVal * 0.2,
      duration: 1.8,
      ease: 'power1.out'
    });
  });
}

// ================= Certificate Lightbox Modal =================
function initCertificateLightbox() {
  const lightbox = document.getElementById('certificate-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');
  
  if (!lightbox || !lightboxImg || !lightboxCaption || !closeBtn) return;
  
  const certImages = document.querySelectorAll('.gallery-card img');
  certImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      const cardTitle = img.parentElement.querySelector('h3') ? img.parentElement.querySelector('h3').innerText : alt;
      
      lightboxImg.setAttribute('src', src);
      lightboxCaption.innerText = cardTitle;
      
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  };
  
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg && e.target !== lightboxCaption) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// ================= About Me 3D Talking Hologram Card =================
function initAbout3D() {
  const canvas = document.getElementById('about-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 5.2;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Load User Image as 3D Texture
  const textureLoader = new THREE.TextureLoader();
  const photoTexture = textureLoader.load('arjun_new.jpeg');

  // Create Hologram Plane
  const geometry = new THREE.PlaneGeometry(2.1, 2.8);
  const material = new THREE.MeshPhongMaterial({
    map: photoTexture,
    transparent: true,
    opacity: 0.9,
    shininess: 60,
    side: THREE.DoubleSide
  });
  const photoMesh = new THREE.Mesh(geometry, material);
  photoMesh.position.y = 0.1;
  scene.add(photoMesh);

  // Glowing Hologram Border Frame
  const borderGeo = new THREE.PlaneGeometry(2.2, 2.9);
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0x9061f9,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.set(0, 0.1, -0.01);
  scene.add(borderMesh);

  // Holographic Scanlines / Grid lines overlaying the photo
  const gridHelper = new THREE.GridHelper(2.5, 25, 0x06b6d4, 0x06b6d4);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.set(0, 0.1, 0.02);
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.12;
  scene.add(gridHelper);

  // Concentric Sound Wave Orbits (Cyan & Violet)
  const waveGroup = new THREE.Group();
  const waveGeo = new THREE.RingGeometry(1.5, 1.52, 64);
  const waveMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  const waveRing = new THREE.Mesh(waveGeo, waveMat);
  waveGroup.add(waveRing);
  
  const waveGeo2 = new THREE.RingGeometry(1.7, 1.72, 64);
  const waveMat2 = new THREE.MeshBasicMaterial({ color: 0x9061f9, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const waveRing2 = new THREE.Mesh(waveGeo2, waveMat2);
  waveGroup.add(waveRing2);
  
  waveGroup.position.set(0, 0.1, 0.05);
  scene.add(waveGroup);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 10);
  pointLight.position.set(1.5, 1.5, 2);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x9061f9, 1.5, 10);
  pointLight2.position.set(-1.5, -1.5, 2);
  scene.add(pointLight2);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation Loop
  let targetRotX = 0, targetRotY = 0;
  function animate() {
    requestAnimationFrame(animate);

    // Rotate ambient rings
    waveRing.rotation.z += 0.005;
    waveRing2.rotation.z -= 0.003;

    waveRing.scale.set(1, 1, 1);
    waveRing2.scale.set(1, 1, 1);
    gridHelper.material.opacity = 0.12;
    photoMesh.position.z = 0;

    // Parallax mouse follow
    targetRotX += (mouseY - targetRotX) * 0.08;
    targetRotY += (mouseX - targetRotY) * 0.08;

    photoMesh.rotation.y = targetRotY * 0.4;
    photoMesh.rotation.x = -targetRotX * 0.3;
    borderMesh.rotation.y = targetRotY * 0.4;
    borderMesh.rotation.x = -targetRotX * 0.3;

    renderer.render(scene, camera);
  }
  
  animate();
}

// ================= Hero Tab Controls =================
function initHeroTabs() {
  const tabs = document.querySelectorAll('.hero-tab-btn');
  const contents = document.querySelectorAll('.hero-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const activeContent = document.getElementById(tab.dataset.tab);
      if (activeContent) activeContent.classList.add('active');
      
      if (tab.dataset.tab === 'terminal-tab') {
        setTimeout(() => {
          const terminalInput = document.getElementById('terminal-input');
          if (terminalInput) terminalInput.focus();
        }, 100);
      }
    });
  });
}

// ================= Cyber Terminal Interpreter Protocol Engine =================
const TERMINAL_COMMANDS = {
  help: [
    "-------------------------------------------------------------",
    "SECURE SHELL PROTOCOL MODULES AVAILABLE:",
    "  help             - Displays this command parameter list.",
    "  about            - Details Nagarjuna's identity and core focus.",
    "  skills           - Prints core languages & tech competencies.",
    "  projects         - Fetches active software portfolio archives.",
    "  timeline         - Reveals timeline of academic & tech history.",
    "  contact          - Outputs secure external connection links.",
    "  clear            - Clears terminal output shell log.",
    "-------------------------------------------------------------"
  ],
  about: [
    "Host Identity: Naga Arjun",
    "Course Focus: B.E in Artificial Intelligence & Data Science",
    "Academic Base: SIET College, Tumkur (Shridevi Institute of Engineering & Technology)",
    "Mission Parameters: Building intelligent systems, secure full-stack applications, AI medical platforms, and automation."
  ],
  skills: [
    "Compiling host technical indicators...",
    "  - Core Languages   : Python (Advanced), Java, HTML/CSS/JavaScript (ES6+), TypeScript",
    "  - Intelligent Tech : Machine Learning models, OpenCV, Bioinformatics AI, NLP",
    "  - Web Engineering  : Next.js, React, Vite, Node.js, FastAPI, Flask, Tailwind CSS, PostgreSQL",
    "  - Platform Systems : PWA, Vercel, Render, Google Identity, Git, GitHub, Linux"
  ],
  projects: [
    "Querying active portfolio archives...",
    "  1. NeuroGen AI [Next.js + Clinical Bioinformatics AI + Vercel]",
    "     - Brain cancer bioinformatics platform for genomic sequencing & transcriptomics.",
    "  2. KSLU Circle [React + Vite + PWA + Google Auth]",
    "     - Peer-to-peer Law study resources, question papers & notes repository.",
    "  3. AI Placement Platform [React + FastAPI + PostgreSQL]",
    "     - Multi-agent AI platform scoring resumes via ATS and conducting mock interviews.",
    "  4. AI Attendance System [Vite + FastAPI + OpenCV]",
    "     - Face-recognition student check-in dashboards for HOD, Principal & Faculty.",
    "  5. ASYNCPROOF Meeting Assistant [React + FastAPI + Whisper]",
    "     - Web bot recording meetings, transcribing and summarizing action tasks."
  ],
  timeline: [
    "Decrypting timeline nodes...",
    "  - [2024 - Present] B.E (Artificial Intelligence & Data Science) at SIET College, Tumkur.",
    "  - [2024] Cybersecurity Internship. Focused on secure networks and vulnerability scans.",
    "  - [Ongoing] Product Creator & SaaS Developer. Live platforms: NeuroGen AI & KSLU Circle."
  ],
  contact: [
    "Establishing external connections...",
    "  - Email    : acarjunarjun@gmail.com",
    "  - GitHub   : https://github.com/nagarjuna-32",
    "  - LinkedIn : https://www.linkedin.com/in/naga-arjuna-n/"
  ]
};

function initCyberTerminal() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');

  if (!terminalInput || !terminalOutput || !terminalBody) return;

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim().toLowerCase();
      terminalInput.value = '';
      
      const cmdEcho = document.createElement('div');
      cmdEcho.className = 'command-line-echo';
      cmdEcho.innerHTML = `<span class="terminal-prompt">visitor@arjun:~$</span> ${command}`;
      terminalOutput.appendChild(cmdEcho);

      if (command) {
        processCommand(command, terminalOutput);
      }
      
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  });
}

function processCommand(cmd, outputNode) {
  if (cmd === 'clear' || cmd === 'cls') {
    outputNode.innerHTML = '<div class="system-line">Terminal buffer flushed. Connected to host node: ARJUN-NODE.</div>';
    return;
  }

  if (TERMINAL_COMMANDS[cmd]) {
    TERMINAL_COMMANDS[cmd].forEach(line => {
      const lineNode = document.createElement('div');
      if (line.startsWith('----------------') || line.startsWith('Host') || line.startsWith('Compiling') || line.startsWith('Querying') || line.startsWith('Decrypting') || line.startsWith('Establishing')) {
        lineNode.className = 'system-line';
      } else {
        lineNode.className = 'success-line';
      }
      lineNode.textContent = line;
      outputNode.appendChild(lineNode);
    });
  } else {
    const errorNode = document.createElement('div');
    errorNode.className = 'error-line';
    errorNode.textContent = `sys-err: command '${cmd}' unrecognized. Type 'help' to review parameters.`;
    outputNode.appendChild(errorNode);
  }
}

// ================= 3D Video Avatar Starting Intro Experience =================
function initIntroAvatar3D() {
  const canvas = document.getElementById('intro-avatar-canvas');
  const introOverlay = document.getElementById('intro-experience');
  const startBtn = document.getElementById('start-intro-btn');
  const enterBtn = document.getElementById('enter-portfolio-btn');
  const subtitleText = document.getElementById('intro-subtitle-text');

  if (!canvas || !introOverlay || !startBtn || !enterBtn) return;

  // Prevent background scrolling while intro is open
  document.body.style.overflow = 'hidden';

  // Three.js Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(260, 260);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Avatar Group
  const avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  // Load arjun_new.jpeg texture onto 3D circular disc
  const textureLoader = new THREE.TextureLoader();
  const photoTexture = textureLoader.load('arjun_new.jpeg');

  const discGeo = new THREE.CircleGeometry(1.2, 64);
  const photoMat = new THREE.MeshPhongMaterial({
    map: photoTexture,
    side: THREE.DoubleSide,
    shininess: 80
  });
  const photoDisc = new THREE.Mesh(discGeo, photoMat);
  avatarGroup.add(photoDisc);

  // Outer Glowing Bevel Ring
  const ringGeo = new THREE.RingGeometry(1.22, 1.28, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
  const bevelRing = new THREE.Mesh(ringGeo, ringMat);
  bevelRing.position.z = 0.01;
  avatarGroup.add(bevelRing);

  // 3D Lip-Sync Overlay Mesh (positioned over lower face/mouth area)
  const mouthGeo = new THREE.EllipseCurve(0, -0.32, 0.16, 0.08, 0, Math.PI * 2, false, 0);
  const points = mouthGeo.getPoints(32);
  const mouthGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const mouthMaterial = new THREE.LineBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.8 });
  const mouthMesh = new THREE.LineLoop(mouthGeometry, mouthMaterial);
  mouthMesh.position.set(0, 0, 0.02);
  avatarGroup.add(mouthMesh);

  // Rotating Hologram Orbits
  const orbit1Geo = new THREE.TorusGeometry(1.4, 0.015, 8, 64);
  const orbit1Mat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.5 });
  const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
  orbit1.rotation.x = Math.PI / 3;
  scene.add(orbit1);

  const orbit2Geo = new THREE.TorusGeometry(1.5, 0.012, 8, 64);
  const orbit2Mat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.4 });
  const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
  orbit2.rotation.y = Math.PI / 4;
  scene.add(orbit2);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x00d2ff, 1.2);
  dirLight.position.set(2, 3, 4);
  scene.add(dirLight);

  // Speech & Lip-Sync State
  let isSpeaking = false;
  let synth = window.speechSynthesis;
  let utterance = null;
  const scriptText = "Hi! Welcome to my digital workspace. I am Naga Arjun, an Artificial Intelligence and Data Science student at SIET College, Tumkur. I build modern AI products, clinical bioinformatics platforms, full stack applications, and cybersecurity systems. Click Enter Portfolio to explore my interactive work!";

  function startAvatarVoiceIntro() {
    if (isSpeaking) return;
    isSpeaking = true;
    introOverlay.classList.add('speaking');
    startBtn.innerHTML = '<i class="fas fa-volume-up animate-pulse"></i> Voice Playing...';

    // Typewriter Subtitle Effect
    let words = scriptText.split(' ');
    let currentWordIdx = 0;
    subtitleText.textContent = "";

    const typeInterval = setInterval(() => {
      if (currentWordIdx < words.length && isSpeaking) {
        subtitleText.textContent += (currentWordIdx === 0 ? "" : " ") + words[currentWordIdx];
        currentWordIdx++;
      } else {
        clearInterval(typeInterval);
      }
    }, 210);

    utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const englishVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.name.includes('Microsoft David') || v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => {
      finishSpeech();
    };

    utterance.onerror = () => {
      finishSpeech();
    };

    synth.speak(utterance);
  }

  function finishSpeech() {
    isSpeaking = false;
    introOverlay.classList.remove('speaking');
    startBtn.innerHTML = '<i class="fas fa-redo"></i> Replay Voice Intro';
  }

  function closeIntroAndRevealPortfolio() {
    if (isSpeaking && synth) {
      synth.cancel();
      finishSpeech();
    }
    introOverlay.classList.add('intro-dissolve');
    document.body.style.overflow = '';
  }

  startBtn.addEventListener('click', startAvatarVoiceIntro);
  enterBtn.addEventListener('click', closeIntroAndRevealPortfolio);

  // Animation Loop
  function animateIntro() {
    requestAnimationFrame(animateIntro);

    orbit1.rotation.z += 0.006;
    orbit2.rotation.z -= 0.008;

    if (isSpeaking) {
      // Synchronized 3D Lip-Sync Mesh Pulsing
      const mouthScale = 1.0 + Math.abs(Math.sin(Date.now() * 0.018)) * 0.8;
      mouthMesh.scale.set(1.0, mouthScale, 1.0);
      mouthMesh.material.opacity = 0.9 + Math.sin(Date.now() * 0.02) * 0.1;

      // Random Equalizer height animation
      const eqBars = document.querySelectorAll('.eq-bar');
      eqBars.forEach(bar => {
        const randomH = Math.floor(Math.random() * 24) + 6;
        bar.style.height = `${randomH}px`;
      });
    } else {
      mouthMesh.scale.set(1.0, 1.0, 1.0);
      mouthMesh.material.opacity = 0.4;
      const eqBars = document.querySelectorAll('.eq-bar');
      eqBars.forEach(bar => {
        bar.style.height = '6px';
      });
    }

    // Gentle Avatar Parallax Tilt
    photoDisc.rotation.y = (mouseX * 0.2);
    photoDisc.rotation.x = (-mouseY * 0.15);

    renderer.render(scene, camera);
  }
  animateIntro();
}
