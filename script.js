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
  const hoverables = document.querySelectorAll('a, button, select, textarea, input, [role="button"], [data-tilt], .card, .gallery-card, .timeline-content, .achievement-card');
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
    color: 0xd4af37, // Soft Gold Nodes
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

  // --- Floating Luxury Geometries ---
  const shapesGroup = new THREE.Group();
  scene.add(shapesGroup);

  const bgShapes = [];
  const shapeGeoms = [
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.SphereGeometry(0.35, 24, 24),
    new THREE.TorusGeometry(0.3, 0.08, 10, 36)
  ];

  const goldMaterial = new THREE.MeshPhongMaterial({
    color: 0xd4af37,
    emissive: 0xd4af37,
    emissiveIntensity: 0.1,
    specular: 0xffebad,
    shininess: 90,
    transparent: true,
    opacity: 0.65
  });

  const graphiteMaterial = new THREE.MeshPhongMaterial({
    color: 0x222225,
    emissive: 0x08080a,
    specular: 0x777777,
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
    if (r < 0.4) {
      mat = goldMaterial;
    } else if (r < 0.7) {
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

  const dirLight1 = new THREE.DirectionalLight(0xd4af37, 1.2); // Warm Gold Light
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xcd7f32, 0.8); // Warm Bronze Light
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
    const colorGold = new THREE.Color(0xd4af37);
    const colorBronze = new THREE.Color(0xcd7f32);

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

          const mixed = colorGold.clone().lerp(colorBronze, dist / 2.2);

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
function initHero3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.8, 6.2);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Base laptop group
  laptopGroup = new THREE.Group();

  // Keyboard Base Plate
  const baseGeo = new THREE.BoxGeometry(2.4, 0.1, 1.7);
  const baseMat = new THREE.MeshPhongMaterial({ color: 0x0f0f10, shininess: 80, specular: 0xd4af37 });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -0.5;
  laptopGroup.add(baseMesh);

  // Keypad Glow Pane (Emissive Gold)
  const keypadGeo = new THREE.BoxGeometry(2.1, 0.02, 1.1);
  const keypadMat = new THREE.MeshPhongMaterial({ 
    color: 0xd4af37, 
    emissive: 0xd4af37, 
    emissiveIntensity: 1.0, 
    transparent: true, 
    opacity: 0.75 
  });
  const keypadMesh = new THREE.Mesh(keypadGeo, keypadMat);
  keypadMesh.position.set(0, -0.44, 0.1);
  laptopGroup.add(keypadMesh);

  // Screen Panel Group
  screenGroup = new THREE.Group();
  screenGroup.position.set(0, -0.45, -0.8);

  const panelGeo = new THREE.BoxGeometry(2.4, 1.6, 0.08);
  const panelMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1d, shininess: 80, specular: 0xd4af37 });
  const panelMesh = new THREE.Mesh(panelGeo, panelMat);
  panelMesh.position.y = 0.8;
  screenGroup.add(panelMesh);

  // Display Panel (Frosted Bronze)
  const displayGeo = new THREE.PlaneGeometry(2.26, 1.46);
  const displayMat = new THREE.MeshPhongMaterial({ 
    color: 0xcd7f32, 
    emissive: 0xcd7f32, 
    emissiveIntensity: 0.6, 
    transparent: true, 
    opacity: 0.4 
  });
  const displayMesh = new THREE.Mesh(displayGeo, displayMat);
  displayMesh.position.set(0, 0.8, 0.045);
  screenGroup.add(displayMesh);

  // Grid lines inside display (Gold)
  const screenGrid = new THREE.GridHelper(1.4, 14, 0xd4af37, 0xd4af37);
  screenGrid.rotation.x = Math.PI / 2;
  screenGrid.position.set(0, 0.8, 0.05);
  screenGroup.add(screenGrid);

  // Default tilt open
  screenGroup.rotation.x = -0.25; 
  laptopGroup.add(screenGroup);
  scene.add(laptopGroup);

  // Orbit Rings (Gold and Bronze)
  const ringGroup = new THREE.Group();
  
  const ring1Geo = new THREE.TorusGeometry(2.0, 0.03, 8, 64);
  const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.55 });
  ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2.3;
  ringGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(2.3, 0.03, 8, 64);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xcd7f32, transparent: true, opacity: 0.45 });
  ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = -Math.PI / 2.5;
  ring2.rotation.y = Math.PI / 6;
  ringGroup.add(ring2);

  scene.add(ringGroup);

  // Lighting
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xd4af37, 2.0, 8); // Gold Point Light
  pointLight.position.set(0, 1.5, 0.5);
  scene.add(pointLight);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Loop
  let targetRotX = 0, targetRotY = 0;
  let targetPosX = 0, targetPosY = 0;
  
  function animate() {
    requestAnimationFrame(animate);

    // Orbits speed
    ring1.rotation.z += 0.009;
    ring2.rotation.z -= 0.007;
    
    // Screen display hinge pulsing
    screenGroup.rotation.x = -0.3 + (Math.sin(Date.now() * 0.001) * 0.045);

    // Mouse tracking coordinate sets
    targetRotX += (mouseY - targetRotX) * 0.07;
    targetRotY += (mouseX - targetRotY) * 0.07;

    // Direct X/Y tilt
    laptopGroup.rotation.x = targetRotX * 0.45;
    laptopGroup.rotation.y = Math.sin(Date.now() * 0.0006) * 0.15 + (targetRotY * 0.6);

    // Magnetic drift translations (pulls laptop towards cursor position)
    targetPosX += (mouseX * 0.8 - targetPosX) * 0.06;
    targetPosY += (-mouseY * 0.6 - targetPosY) * 0.06;
    laptopGroup.position.set(targetPosX, targetPosY, 0);

    renderer.render(scene, camera);
  }
  animate();
}

// ================= 3. Skills Scene (Magnetic Floating Skill Cubes in Gold/Bronze) =================
function initSkills3D() {
  const canvas = document.getElementById('skills-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Canvas texture builder
  function createCubeTexture(name, accentColor) {
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 256;
    textCanvas.height = 256;
    const ctx = textCanvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a1d'; // graphite base
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.lineWidth = 14;
    ctx.strokeStyle = accentColor;
    ctx.strokeRect(0, 0, 256, 256);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    for(let i = 0; i < 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    
    ctx.font = 'bold 36px Poppins, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.fillText(name, 128, 128);

    return new THREE.CanvasTexture(textCanvas);
  }

  // Soft gold and bronze colored skill list
  skillDataRef = [
    { name: 'Python', color: '#d4af37', pos: [-1.4, 0.9, 0], scale: 0.9 },
    { name: 'React', color: '#cd7f32', pos: [1.3, 0.8, -0.5], scale: 0.95 },
    { name: 'Flask', color: '#d4af37', pos: [-1.2, -0.9, -0.3], scale: 0.85 },
    { name: 'MongoDB', color: '#cd7f32', pos: [1.2, -0.9, 0.2], scale: 0.9 }
  ];

  skillCubes = [];

  skillDataRef.forEach(data => {
    const texture = createCubeTexture(data.name, data.color);
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const materials = Array(6).fill(new THREE.MeshPhongMaterial({ map: texture, shininess: 100 }));
    
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.set(data.pos[0], data.pos[1], data.pos[2]);
    cube.scale.set(data.scale, data.scale, data.scale);
    
    cube.rotSpeedX = 0.008 + Math.random() * 0.008;
    cube.rotSpeedY = 0.005 + Math.random() * 0.008;
    cube.floatOffset = Math.random() * 10;

    scene.add(cube);
    skillCubes.push(cube);
  });

  // Lights
  const light = new THREE.DirectionalLight(0xffffff, 1.8);
  light.position.set(1, 3, 4);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Cube floating render loop with magnetic pull
  function animate() {
    requestAnimationFrame(animate);

    skillCubes.forEach((cube, idx) => {
      cube.rotation.x += cube.rotSpeedX;
      cube.rotation.y += cube.rotSpeedY;

      // Base sine floating height
      const floatHeight = skillDataRef[idx].pos[1] + Math.sin((Date.now() * 0.0015) + cube.floatOffset) * 0.15;
      
      // Magnetic pull coordinates mapping
      const destX = skillDataRef[idx].pos[0] + (mouseX * 0.6);
      const destY = floatHeight + (-mouseY * 0.4);

      cube.position.x += (destX - cube.position.x) * 0.06;
      cube.position.y += (destY - cube.position.y) * 0.06;

      cube.rotation.z = mouseX * 0.15;
    });

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
