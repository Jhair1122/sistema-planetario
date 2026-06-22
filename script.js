import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============ CONFIGURACIÓN DE ESCENA ============
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020210);
scene.fog = new THREE.FogExp2(0x020210, 0.000015);

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 18, 62);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ============ ORBIT CONTROLS ============
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.minDistance = 6;
controls.maxDistance = 160;
controls.maxPolarAngle = Math.PI * 0.80;
controls.minPolarAngle = Math.PI * 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.08;   // Muy suave
controls.zoomSpeed = 0.8;
controls.rotateSpeed = 0.6;
controls.update();

// ============ LUCES ============
const ambientLight = new THREE.AmbientLight(0x223366, 3.5);
scene.add(ambientLight);

// Luz principal del sol — más intensa y con mayor alcance
const sunLight = new THREE.PointLight(0xfff4e0, 600, 300, 1.2);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 300;
scene.add(sunLight);

const sunLight2 = new THREE.PointLight(0xff9944, 200, 200, 1.4);
sunLight2.position.set(0, 0, 0);
scene.add(sunLight2);

// Luz de relleno tenue azulada para el lado oscuro
const fillLight = new THREE.DirectionalLight(0x334488, 0.4);
fillLight.position.set(-50, 20, -50);
scene.add(fillLight);

// ============ ESTRELLAS ============
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 4000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 80 + Math.random() * 120;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const colorChoice = Math.random();
        if (colorChoice < 0.1) {
            colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
        } else if (colorChoice < 0.2) {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.6;
        } else if (colorChoice < 0.25) {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.5;
        } else {
            const brightness = 0.9 + Math.random() * 0.1;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness;
        }
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    return stars;
}
const stars = createStars();

// ============ TEXTURAS PROCEDURALES ============
function createCanvasTexture(width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// --- Sol ---
function drawSunTexture(ctx, w, h) {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, '#ffff80');
    gradient.addColorStop(0.2, '#ffe040');
    gradient.addColorStop(0.4, '#ffa000');
    gradient.addColorStop(0.7, '#ff6600');
    gradient.addColorStop(0.9, '#cc3300');
    gradient.addColorStop(1, '#991100');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 15 + 3;
        const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        spotGrad.addColorStop(0, 'rgba(255,200,50,0.6)');
        spotGrad.addColorStop(0.6, 'rgba(255,140,20,0.3)');
        spotGrad.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Mercurio ---
function drawMercuryTexture(ctx, w, h) {
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 200; i++) {
        const shade = 100 + Math.random() * 80;
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 8 + 1, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 6 + 2;
        ctx.strokeStyle = 'rgba(60,60,60,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(70,70,70,0.4)';
        ctx.fill();
    }
}

// --- Venus ---
function drawVenusTexture(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#e8c98b');
    gradient.addColorStop(0.3, '#d4a96a');
    gradient.addColorStop(0.5, '#c49455');
    gradient.addColorStop(0.7, '#d4a96a');
    gradient.addColorStop(1, '#e0c080');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = 'rgba(180,130,80,0.2)';
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 40 + 10, Math.random() * 10 + 3, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Tierra ---
function drawEarthTexture(ctx, w, h) {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#1a5276');
    oceanGrad.addColorStop(0.3, '#2980b9');
    oceanGrad.addColorStop(0.5, '#3498db');
    oceanGrad.addColorStop(0.7, '#2980b9');
    oceanGrad.addColorStop(1, '#1a5276');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#27ae60';
    ctx.beginPath(); ctx.ellipse(w * 0.2, h * 0.25, w * 0.1, h * 0.18, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.22, h * 0.55, w * 0.06, h * 0.13, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.48, h * 0.22, w * 0.08, h * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.5, w * 0.07, h * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.7, h * 0.25, w * 0.14, h * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.6, w * 0.04, h * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#229954';
    ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.45, w * 0.05, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();

    for (let i = 0; i < 80; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 6 + 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(0, 0, w, h * 0.08);
    ctx.fillRect(0, h * 0.92, w, h * 0.08);
}

// --- Marte ---
function drawMarsTexture(ctx, w, h) {
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 150; i++) {
        const shade = 140 + Math.random() * 60;
        ctx.fillStyle = `rgb(${shade + 30},${Math.floor(shade * 0.3)},${Math.floor(shade * 0.2)})`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 12 + 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,240,230,0.6)';
    ctx.fillRect(0, 0, w, h * 0.06);
    ctx.fillRect(0, h * 0.94, w, h * 0.06);
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = 'rgba(100,20,10,0.3)';
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 20 + 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Júpiter ---
function drawJupiterTexture(ctx, w, h) {
    const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
    baseGrad.addColorStop(0, '#c4956a');
    baseGrad.addColorStop(0.5, '#e8c98b');
    baseGrad.addColorStop(1, '#c4956a');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    const bandColors = [
        '#d4a574', '#e8cfa0', '#c4956a', '#f0dcc0', '#b8845c', '#d4b896',
        '#e8c98b', '#c49455', '#f5e6c8', '#c49455', '#e0c080', '#b87840',
        '#d4a96a', '#e8cfa0', '#c49060', '#f0dcc0', '#c4956a', '#d4a574',
        '#e8c98b', '#b87840'
    ];
    for (let i = 0; i < bandColors.length; i++) {
        ctx.fillStyle = bandColors[i];
        ctx.fillRect(0, (i / bandColors.length) * h, w, h / bandColors.length + 4);
    }
    for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `rgba(${180 + Math.random() * 40},${100 + Math.random() * 40},${40 + Math.random() * 20},0.4)`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 15 + 3, Math.random() * 6 + 1, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    const spotX = w * 0.6, spotY = h * 0.45;
    const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 18);
    spotGrad.addColorStop(0, '#e8745c');
    spotGrad.addColorStop(0.5, '#d4553c');
    spotGrad.addColorStop(1, 'rgba(200,100,60,0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, 18, 8, 0.05, 0, Math.PI * 2);
    ctx.fill();
}

// --- Saturno ---
function drawSaturnTexture(ctx, w, h) {
    drawJupiterTexture(ctx, w, h);
    ctx.fillStyle = 'rgba(255,240,200,0.25)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(200,180,140,0.3)';
        ctx.fillRect(0, h * 0.2 + i * h * 0.12, w, h * 0.04);
    }
}

// --- Urano ---
function drawUranusTexture(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#b8d8e8');
    gradient.addColorStop(0.3, '#8ec8d8');
    gradient.addColorStop(0.5, '#a0d4e4');
    gradient.addColorStop(0.7, '#78b8c8');
    gradient.addColorStop(1, '#b0d4e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(0, i * h / 7, w, h / 14);
    }
}

// --- Neptuno ---
function drawNeptuneTexture(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#3040a0');
    gradient.addColorStop(0.3, '#2848b8');
    gradient.addColorStop(0.5, '#3860d0');
    gradient.addColorStop(0.7, '#2840a0');
    gradient.addColorStop(1, '#2838a0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(150,180,255,0.2)';
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 12 + 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Anillo de Saturno ---
function drawRingTexture(ctx, w, h) {
    const ringColors = [
        'rgba(210,180,140,0.9)', 'rgba(200,170,130,0.7)', 'rgba(220,190,150,0.95)',
        'rgba(180,150,110,0.5)', 'rgba(230,200,160,0.85)', 'rgba(190,160,120,0.6)',
        'rgba(200,170,130,0.8)', 'rgba(170,140,100,0.4)', 'rgba(210,180,140,0.9)',
        'rgba(160,130,90,0.3)',
    ];
    for (let i = 0; i < ringColors.length; i++) {
        ctx.fillStyle = ringColors[i];
        ctx.fillRect(i * (w / ringColors.length), 0, w / ringColors.length, h);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(w * 0.35, 0, w * 0.06, h);
    ctx.fillRect(w * 0.55, 0, w * 0.03, h);
}

// ============ INSTANCIAR TEXTURAS ============
const sunTexture = createCanvasTexture(512, 256, drawSunTexture);
const mercuryTexture = createCanvasTexture(512, 256, drawMercuryTexture);
const venusTexture = createCanvasTexture(512, 256, drawVenusTexture);
const earthTexture = createCanvasTexture(512, 256, drawEarthTexture);
const marsTexture = createCanvasTexture(512, 256, drawMarsTexture);
const jupiterTexture = createCanvasTexture(512, 256, drawJupiterTexture);
const saturnTexture = createCanvasTexture(512, 256, drawSaturnTexture);
const uranusTexture = createCanvasTexture(512, 256, drawUranusTexture);
const neptuneTexture = createCanvasTexture(512, 256, drawNeptuneTexture);
const ringTexture = createCanvasTexture(512, 64, drawRingTexture);

// ============ SOL ============
const sunGeometry = new THREE.SphereGeometry(3.5, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({
    map: sunTexture,
    emissive: new THREE.Color(0xff6600),
    emissiveIntensity: 1.8,
    roughness: 0.4,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Glow del sol (shader)
const glowGeometry = new THREE.SphereGeometry(4.2, 64, 64);
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xff8800) },
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vPosition = worldPos.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;
        uniform vec3 uColor;
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 3.5);
            float alpha = fresnel * 0.7;
            gl_FragColor = vec4(uColor, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
});
const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glowMesh);

const glowGeometry2 = new THREE.SphereGeometry(5.5, 64, 64);
const glowMaterial2 = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xff4400) } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vPosition = worldPos.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 uColor;
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 6.0);
            float alpha = fresnel * 0.35;
            gl_FragColor = vec4(uColor, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
});
const glowMesh2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
scene.add(glowMesh2);

// ============ DATOS DE PLANETAS ============
const planetConfigs = [
    { name: 'Mercurio', radius: 0.5,  orbitRadius: 7,  speed: 0.40, texture: mercuryTexture,
        frase: 'La velocidad no lo es todo, pero la perseverancia sí. Cada línea de código que escribes te acerca más a tu meta. ¡No te detengas!' },
    { name: 'Venus',    radius: 0.85, orbitRadius: 10.5, speed: 0.28, texture: venusTexture,
        frase: 'Brilla con intensidad propia. La ingeniería de software es el arte de crear soluciones que iluminan el mundo. Tu código puede cambiar vidas.' },
    { name: 'Tierra',   radius: 0.9,  orbitRadius: 14.5, speed: 0.20, texture: earthTexture,
        frase: 'Este es tu hogar, pero tu mente puede crear universos enteros. Cada proyecto de software es un nuevo mundo que nace de tu imaginación y esfuerzo.' },
    { name: 'Marte',    radius: 0.62, orbitRadius: 19,  speed: 0.15, texture: marsTexture,
        frase: 'La conquista de nuevos territorios comienza con un solo commit. Atrévete a explorar más allá de tu zona de confort. El futuro es de los valientes.' },
    { name: 'Júpiter',  radius: 2.6,  orbitRadius: 27,  speed: 0.09, texture: jupiterTexture,
        frase: 'Sé gigante en tus aspiraciones. La grandeza en el desarrollo de software se construye con paciencia, disciplina y un aprendizaje constante.' },
    { name: 'Saturno',  radius: 2.0,  orbitRadius: 34,  speed: 0.065, texture: saturnTexture,
        frase: 'Los anillos del éxito se forman con dedicación constante. Cada capa de conocimiento que adquieres te hace más valioso. ¡Sigue sumando!', hasRings: true },
    { name: 'Urano',    radius: 1.4,  orbitRadius: 40,  speed: 0.045, texture: uranusTexture,
        frase: 'Piensa diferente, gira distinto. La innovación en software nace de perspectivas únicas. No temas romper los esquemas establecidos.' },
    { name: 'Neptuno',  radius: 1.3,  orbitRadius: 46,  speed: 0.030, texture: neptuneTexture,
        frase: 'En las profundidades del conocimiento hay tesoros que solo la disciplina descubre. Cada desafío técnico superado te acerca a la maestría.' }
];

// ============ CREACIÓN DE PLANETAS ============
const planets = [];

planetConfigs.forEach((config) => {
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.y = Math.random() * Math.PI * 2;
    // Leve inclinación orbital individual para dar profundidad 3D
    orbitGroup.rotation.x = (Math.random() - 0.5) * 0.08;
    orbitGroup.rotation.z = (Math.random() - 0.5) * 0.05;
    scene.add(orbitGroup);

    const planetGeometry = new THREE.SphereGeometry(config.radius, 64, 64);
      const planetMaterial = new THREE.MeshStandardMaterial({
        map: config.texture,
        roughness: 0.75,
        metalness: 0.05,
        envMapIntensity: 0.3,
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.x = config.orbitRadius;
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    planetMesh.userData = { planetName: config.name };
    orbitGroup.add(planetMesh);

    let ringMesh = null;
    if (config.hasRings) {
        const ringGeometry = new THREE.RingGeometry(config.radius * 1.3, config.radius * 2.2, 128);
        const ringMaterial = new THREE.MeshStandardMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            roughness: 0.7,
            depthWrite: true,
        });
        ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI / 2 + 0.47;
        ringMesh.rotation.y = 0.3;
        planetMesh.add(ringMesh);
    }

    // Órbita visual
    const orbitCurve = new THREE.EllipseCurve(0, 0, config.orbitRadius, config.orbitRadius, 0, Math.PI * 2, false, 0);
    const orbitPoints = orbitCurve.getPoints(256);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
     const orbitLine = new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: 0x4466aa, transparent: true, opacity: 0.3, depthTest: true })
    );
    scene.add(orbitLine);

    planets.push({
        name: config.name,
        mesh: planetMesh,
        orbitGroup: orbitGroup,
        orbitRadius: config.orbitRadius,
        speed: config.speed,
        frase: config.frase,
        ringMesh: ringMesh,
        orbitLine: orbitLine,
    });
});

// ============ RAYCASTER ============
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getPlanetIntersections() {
    raycaster.setFromCamera(mouse, camera);
    raycaster.params.Points = { threshold: 0.1 };
    // Usar esferas de colisión ligeramente más grandes para mejor UX
    const meshes = planets.map(p => p.mesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length > 0) return hits;

    // Segunda pasada: hitboxes expandidas para planetas pequeños
    const expandedHits = [];
    planets.forEach(planet => {
        const planetWorldPos = new THREE.Vector3();
        planet.mesh.getWorldPosition(planetWorldPos);
        const r = planet.mesh.geometry.parameters.radius;
        const hitRadius = Math.max(r * 2.2, 1.2);
        const ray = raycaster.ray;
        const distToCenter = ray.distanceToPoint(planetWorldPos);
        if (distToCenter < hitRadius) {
            const distToCamera = camera.position.distanceTo(planetWorldPos);
            expandedHits.push({ object: planet.mesh, distance: distToCamera });
        }
    });
    expandedHits.sort((a, b) => a.distance - b.distance);
    return expandedHits;
}

// ============ ESTADO DE ZOOM ============
let appState = 'IDLE'; // IDLE | ZOOMING_IN | VIEWING | ZOOMING_OUT
let targetPlanet = null;
let savedCameraPosition = new THREE.Vector3();
let savedCameraTarget = new THREE.Vector3();
let zoomStartTime = 0;
const ZOOM_DURATION = 1.5;
let timeScale = 1.0;
let targetTimeScale = 1.0;
let hoveredPlanet = null;

// ============ ELEMENTOS UI ============
const overlay = document.getElementById('planet-overlay');
const planetNameEl = document.getElementById('planet-name');
const planetPhraseEl = document.getElementById('planet-phrase');
const backButton = document.getElementById('back-button');
const instructionsEl = document.getElementById('instructions');

setTimeout(() => instructionsEl.classList.add('fade-out'), 8000);

// ============ DISTINCIÓN CLIC VS ARRASTRE ============
let mouseDownPos = new THREE.Vector2();
let isDragging = false;

window.addEventListener('mousedown', (e) => {
    mouseDownPos.set(e.clientX, e.clientY);
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging && mouseDownPos.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 3) {
        isDragging = true;
    }
});

// ============ FUNCIONES DE ZOOM ============
function zoomToPlanet(planet) {
    if (appState !== 'IDLE') return;
    targetPlanet = planet;
    savedCameraPosition.copy(camera.position);
    savedCameraTarget.copy(controls.target);
    appState = 'ZOOMING_IN';
    zoomStartTime = performance.now() / 1000;
    targetTimeScale = 0.0;
    controls.autoRotate = false;
}

function zoomOut() {
    if (appState !== 'VIEWING') return;
    appState = 'ZOOMING_OUT';
    zoomStartTime = performance.now() / 1000;
    targetTimeScale = 1.0;
    overlay.classList.remove('visible');
}

function getZoomTargetPosition(planet) {
    const planetWorldPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(planetWorldPos);
    // Dirección desde el sol hacia el planeta, a altura levemente elevada
    const dirFromSun = planetWorldPos.clone().normalize();
    dirFromSun.y += 0.35;
    dirFromSun.normalize();
    const distance = planet.mesh.geometry.parameters.radius * 4.5 + 2.5;
    const targetPos = planetWorldPos.clone().add(dirFromSun.multiplyScalar(distance));
    return { position: targetPos, lookAt: planetWorldPos };
}

// ============ EVENT LISTENERS ============
window.addEventListener('click', (event) => {
    if (isDragging || appState !== 'IDLE') return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const intersections = getPlanetIntersections();
    if (intersections.length > 0) {
        const clickedMesh = intersections[0].object;
        const planet = planets.find(p => p.mesh === clickedMesh);
        if (planet) zoomToPlanet(planet);
    }
});

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (appState === 'IDLE') {
        const intersections = getPlanetIntersections();
        if (intersections.length > 0) {
            const hoveredMesh = intersections[0].object;
            const planet = planets.find(p => p.mesh === hoveredMesh);
            if (planet && hoveredPlanet !== planet) {
                if (hoveredPlanet) {
                    hoveredPlanet.mesh.material.emissive = new THREE.Color(0x000000);
                    hoveredPlanet.mesh.material.emissiveIntensity = 0;
                }
                hoveredPlanet = planet;
                planet.mesh.material.emissive = new THREE.Color(0x333333);
                planet.mesh.material.emissiveIntensity = 0.5;
                document.body.classList.add('pointer-cursor');
            }
        } else if (hoveredPlanet) {
            hoveredPlanet.mesh.material.emissive = new THREE.Color(0x000000);
            hoveredPlanet.mesh.material.emissiveIntensity = 0;
            hoveredPlanet = null;
            document.body.classList.remove('pointer-cursor');
        }
    }
});

backButton.addEventListener('click', zoomOut);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Touch para móviles
window.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1 && appState === 'IDLE') {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        setTimeout(() => {
            if (appState === 'IDLE') {
                const intersections = getPlanetIntersections();
                if (intersections.length > 0) {
                    const planet = planets.find(p => p.mesh === intersections[0].object);
                    if (planet) zoomToPlanet(planet);
                }
            }
        }, 150);
    }
});

// ============ LOOP DE ANIMACIÓN ============
const clock = new THREE.Clock();

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);
    const elapsed = performance.now() / 1000;

    // Suavizar timeScale
    timeScale += (targetTimeScale - timeScale) * 3 * dt;
    if (Math.abs(targetTimeScale - timeScale) < 0.001) timeScale = targetTimeScale;

    // Glow del sol
    glowMaterial.uniforms.uTime.value = elapsed;

    // Rotaciones
    sun.rotation.y += 0.15 * dt;
    glowMesh.rotation.y -= 0.05 * dt;
    glowMesh2.rotation.y += 0.03 * dt;
    stars.rotation.y += 0.01 * dt;
    stars.rotation.x += 0.003 * dt;

    // Planetas: órbita y rotación propia
    planets.forEach(planet => {
        planet.orbitGroup.rotation.y += planet.speed * timeScale * dt;
        planet.mesh.rotation.y += (0.5 + planet.speed * 0.3) * timeScale * dt;
    });

    // Estados de zoom
    if (appState === 'ZOOMING_IN') {
        const t = Math.min((elapsed - zoomStartTime) / ZOOM_DURATION, 1.0);
        const easedT = easeInOutCubic(t);
        const zoomTarget = getZoomTargetPosition(targetPlanet);
        camera.position.lerpVectors(savedCameraPosition, zoomTarget.position, easedT);
        controls.target.lerpVectors(savedCameraTarget, zoomTarget.lookAt, easedT);
        if (t >= 1.0) {
            appState = 'VIEWING';
            planetNameEl.textContent = targetPlanet.name;
            planetPhraseEl.textContent = targetPlanet.frase;
            overlay.classList.add('visible');
            controls.enabled = false;
        }
    } else if (appState === 'ZOOMING_OUT') {
        const t = Math.min((elapsed - zoomStartTime) / ZOOM_DURATION, 1.0);
        const easedT = easeInOutCubic(t);
        // Partir desde posición actual de cámara (no la del planeta)
        camera.position.lerp(savedCameraPosition, easedT * 0.12 + 0.02);
        controls.target.lerp(savedCameraTarget, easedT * 0.12 + 0.02);
        if (t >= 1.0) {
            camera.position.copy(savedCameraPosition);
            controls.target.copy(savedCameraTarget);
            appState = 'IDLE';
            targetPlanet = null;
            controls.enabled = true;
            controls.autoRotate = true;
        }
    } else if (appState === 'VIEWING' && targetPlanet) {
        const planetWorldPos = new THREE.Vector3();
        targetPlanet.mesh.getWorldPosition(planetWorldPos);
        // Seguir suavemente al planeta mientras orbita
        controls.target.lerp(planetWorldPos, 0.08);
        const dirFromSun = planetWorldPos.clone().normalize();
        dirFromSun.y += 0.35;
        dirFromSun.normalize();
        const desiredDistance = targetPlanet.mesh.geometry.parameters.radius * 4.5 + 2.5;
        const desiredPos = planetWorldPos.clone().add(dirFromSun.multiplyScalar(desiredDistance));
        camera.position.lerp(desiredPos, 0.06);
    }

    if (appState === 'IDLE' || appState === 'ZOOMING_OUT') {
        controls.update();
    }

    renderer.render(scene, camera);
}

animate();

console.log('🚀 Sistema Planetario 3D iniciado');
console.log('🪐 Planetas:', planets.map(p => p.name).join(', '));
console.log('🖱️ Haz clic en un planeta para explorarlo');
