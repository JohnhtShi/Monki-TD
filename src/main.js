const canvas2d = document.getElementById("map2d");
const shaderCanvas = document.getElementById("shader-bg");
const ctx = canvas2d.getContext("2d");

const ui = {
  wave: document.getElementById("stat-wave"),
  lives: document.getElementById("stat-lives"),
  gold: document.getElementById("stat-gold"),
  enemies: document.getElementById("stat-enemies"),
  selectionPanel: document.getElementById("selection-panel"),
  selectionName: document.getElementById("selection-name"),
  selectionBody: document.getElementById("selection-body"),
  toggleHitboxes: document.getElementById("toggle-hitboxes"),
  togglePause: document.getElementById("toggle-pause"),
  toggleTheme: document.getElementById("toggle-theme"),
  buildButtons: Array.from(document.querySelectorAll(".tower-button")),
};

const WORLD = { width: 4800, height: 3200 };
const PATH_WIDTH = 180;
const ENEMY_SPAWN_OFFSET = 220;

const PATH_POINTS = [
  { x: 0, y: 460 },
  { x: 520, y: 460 },
  { x: 900, y: 760 },
  { x: 1380, y: 760 },
  { x: 1700, y: 460 },
  { x: 2380, y: 460 },
  { x: 2880, y: 980 },
  { x: 3460, y: 980 },
  { x: 3820, y: 620 },
  { x: WORLD.width, y: 620 },
];

const SPRITES = {
  enemyPfp: {
    src: "../assets/enemies/pfp.png",
    frameWidth: 300,
    frameHeight: 300,
    frames: 1,
    fps: 0,
  },
  enemyMonki: {
    src: "../assets/enemies/monki.png",
    frameWidth: 64,
    frameHeight: 64,
    frames: 6,
    fps: 8,
  },
  enemyFarmer: {
    src: "../assets/enemies/monki-farmer.png",
    frameWidth: 64,
    frameHeight: 64,
    frames: 6,
    fps: 8,
  },
  enemyBusiness: {
    src: "../assets/enemies/monki-businessman.png",
    frameWidth: 64,
    frameHeight: 64,
    frames: 6,
    fps: 8,
  },
  enemyPolice: {
    src: "../assets/enemies/monki-police.png",
    frameWidth: 64,
    frameHeight: 64,
    frames: 6,
    fps: 8,
  },
  enemyPrisoner: {
    src: "../assets/enemies/monki-prisoner.png",
    frameWidth: 64,
    frameHeight: 64,
    frames: 6,
    fps: 8,
  },
  enemyCapitalist: {
    src: "../assets/enemies/monki-capitalist.png",
    frameWidth: 64,
    frameHeight: 64,
    frames: 6,
    fps: 8,
  },
  towerBlood: {
    src: "../assets/towers/blood-moon.png",
    frameWidth: 110,
    frameHeight: 140,
    frames: 10,
    fps: 10,
    noOffset: true,
  },
  towerObelisk: {
    src: "../assets/towers/obelisk.png",
    frameWidth: 140,
    frameHeight: 240,
    frames: 19,
    fps: 12,
    noOffset: true,
  },
  towerBank: {
    src: "../assets/towers/monki-bank.png",
    frameWidth: 128,
    frameHeight: 128,
    frames: 1,
    fps: 0,
  },
  towerBarn: {
    src: "../assets/towers/monki-barn.png",
    frameWidth: 128,
    frameHeight: 128,
    frames: 1,
    fps: 0,
  },
  towerStall: {
    src: "../assets/towers/monki-stall.png",
    frameWidth: 128,
    frameHeight: 128,
    frames: 1,
    fps: 0,
  },
  towerJail: {
    src: "../assets/towers/monki-jail.png",
    frameWidth: 128,
    frameHeight: 128,
    frames: 1,
    fps: 0,
  },
  towerAtm: {
    src: "../assets/towers/monki-atm.png",
    frameWidth: 128,
    frameHeight: 128,
    frames: 1,
    fps: 0,
  },
  towerBanana: {
    src: "../assets/towers/monki-banana-tree.png",
    frameWidth: 256,
    frameHeight: 128,
    frames: 1,
    fps: 0,
  },
  towerRelic: {
    src: "../assets/towers/obelisk-effects.png",
    frameWidth: 380,
    frameHeight: 380,
    frames: 7,
    fps: 10,
    noOffset: true,
  },
};

const TOWER_TYPES = {
  blood: {
    id: "blood",
    name: "Blood Moon",
    sprite: SPRITES.towerBlood,
    cost: 140,
    range: 330,
    fireRate: 0.85,
    damage: 20,
    projectileSpeed: 720,
    projectileRadius: 11,
    role: "Aggressive striker",
    attack: "Crimson bolts that carve lingering wounds.",
    special: "Hemorrhage: stacks bleed damage and executes low health targets.",
    size: 120,
  },
  obelisk: {
    id: "obelisk",
    name: "Obelisk",
    sprite: SPRITES.towerObelisk,
    cost: 180,
    range: 420,
    fireRate: 0.45,
    damage: 45,
    projectileSpeed: 840,
    projectileRadius: 12,
    role: "Siege artillery",
    attack: "Arc lances that crack open armor at long range.",
    special: "Arc Cascade: chains lightning and slows nearby targets.",
    size: 140,
  },
  bank: {
    id: "bank",
    name: "Monki Bank",
    sprite: SPRITES.towerBank,
    cost: 90,
    range: 260,
    fireRate: 1.2,
    damage: 12,
    projectileSpeed: 620,
    projectileRadius: 9,
    role: "Budget skirmisher",
    attack: "Rapid coin volleys that tag priority targets.",
    special: "Bounty Ledger: marked enemies drop bonus gold and pay interest.",
    size: 96,
  },
  barn: {
    id: "barn",
    name: "Monki Barn",
    sprite: SPRITES.towerBarn,
    cost: 120,
    range: 300,
    fireRate: 0.95,
    damage: 18,
    projectileSpeed: 660,
    projectileRadius: 10,
    role: "Balanced defender",
    attack: "Heavy farm slugs that detonate on impact.",
    special: "Harvest Shockwave: splash damage plus a slowing field.",
    size: 112,
  },
  stall: {
    id: "stall",
    name: "Monki Stall",
    sprite: SPRITES.towerStall,
    cost: 110,
    range: 320,
    fireRate: 1.05,
    damage: 15,
    projectileSpeed: 700,
    projectileRadius: 9,
    role: "Sustained fire",
    attack: "Supply darts with rapid follow-up bursts.",
    special: "Supply Mark: makes targets vulnerable and fires extra shots.",
    size: 104,
  },
  jail: {
    id: "jail",
    name: "Monki Jail",
    sprite: SPRITES.towerJail,
    cost: 200,
    range: 380,
    fireRate: 0.55,
    damage: 36,
    projectileSpeed: 760,
    projectileRadius: 12,
    role: "Heavy hitter",
    attack: "Lockdown rounds that disrupt elite pushes.",
    special: "Lockdown: stuns targets and snares nearby enemies.",
    size: 132,
  },
  atm: {
    id: "atm",
    name: "ATM Relay",
    sprite: SPRITES.towerAtm,
    cost: 130,
    range: 290,
    fireRate: 1.3,
    damage: 14,
    projectileSpeed: 660,
    projectileRadius: 9,
    role: "Rapid response",
    attack: "Overdraft bursts that ramp damage on the same target.",
    special: "Overdraft Burst: repeated hits stack bonus damage.",
    size: 100,
  },
  banana: {
    id: "banana",
    name: "Banana Grove",
    sprite: SPRITES.towerBanana,
    cost: 160,
    range: 360,
    fireRate: 0.9,
    damage: 24,
    projectileSpeed: 700,
    projectileRadius: 11,
    role: "Long-range striker",
    attack: "Banana clusters that explode in wide arcs.",
    special: "Slipstream Grove: heavy splash damage with deep slows.",
    size: 118,
  },
  relic: {
    id: "relic",
    name: "Obelisk Relic",
    sprite: SPRITES.towerRelic,
    cost: 240,
    range: 460,
    fireRate: 0.42,
    damage: 58,
    projectileSpeed: 900,
    projectileRadius: 13,
    role: "Mythic artillery",
    attack: "Piercing prism bolts that carve through lines.",
    special: "Rift Prism: pierces targets and arcs to elites.",
    size: 150,
  },
};

const UPGRADE_CONFIG = {
  damage: {
    label: "Power",
    amount: 6,
    cost: 80,
  },
  range: {
    label: "Range",
    amount: 24,
    cost: 70,
  },
  rate: {
    label: "Fire Rate",
    amount: 0.18,
    cost: 90,
  },
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const ENEMY_TYPES = {
  monki: {
    id: "monki",
    sprite: "enemyMonki",
    baseHp: 150,
    hpScale: 20,
    baseSpeed: 118,
    speedScale: 2.7,
    size: 70,
    reward: 32,
  },
  farmer: {
    id: "farmer",
    sprite: "enemyFarmer",
    baseHp: 185,
    hpScale: 24,
    baseSpeed: 102,
    speedScale: 2.5,
    size: 74,
    reward: 36,
  },
  prisoner: {
    id: "prisoner",
    sprite: "enemyPrisoner",
    baseHp: 130,
    hpScale: 18,
    baseSpeed: 150,
    speedScale: 3.3,
    size: 66,
    reward: 34,
  },
  runner: {
    id: "runner",
    sprite: "enemyPrisoner",
    baseHp: 95,
    hpScale: 12,
    baseSpeed: 170,
    speedScale: 3.4,
    size: 62,
    reward: 30,
  },
  business: {
    id: "business",
    sprite: "enemyBusiness",
    baseHp: 170,
    hpScale: 22,
    baseSpeed: 126,
    speedScale: 2.9,
    size: 70,
    reward: 38,
  },
  police: {
    id: "police",
    sprite: "enemyPolice",
    baseHp: 230,
    hpScale: 28,
    baseSpeed: 108,
    speedScale: 2.6,
    size: 78,
    reward: 44,
  },
  enforcer: {
    id: "enforcer",
    sprite: "enemyPolice",
    baseHp: 260,
    hpScale: 26,
    baseSpeed: 98,
    speedScale: 2.2,
    size: 82,
    reward: 50,
  },
  capitalist: {
    id: "capitalist",
    sprite: "enemyCapitalist",
    baseHp: 310,
    hpScale: 34,
    baseSpeed: 90,
    speedScale: 2.1,
    size: 86,
    reward: 58,
  },
  mogul: {
    id: "mogul",
    sprite: "enemyCapitalist",
    baseHp: 340,
    hpScale: 32,
    baseSpeed: 78,
    speedScale: 1.9,
    size: 92,
    reward: 64,
  },
  pfp: {
    id: "pfp",
    sprite: "enemyPfp",
    baseHp: 300,
    hpScale: 32,
    baseSpeed: 96,
    speedScale: 2.2,
    size: 92,
    reward: 65,
    elite: true,
  },
  boss: {
    id: "boss",
    sprite: "enemyPfp",
    baseHp: 1500,
    hpScale: 200,
    baseSpeed: 70,
    speedScale: 1.4,
    size: 160,
    reward: 260,
    boss: true,
  },
};

const ENEMY_SPAWN_TABLE = [
  { id: "monki", unlock: 1, weight: 4 },
  { id: "farmer", unlock: 2, weight: 3 },
  { id: "runner", unlock: 2, weight: 2 },
  { id: "prisoner", unlock: 3, weight: 3 },
  { id: "business", unlock: 4, weight: 2 },
  { id: "police", unlock: 5, weight: 2 },
  { id: "enforcer", unlock: 6, weight: 2 },
  { id: "capitalist", unlock: 7, weight: 1 },
  { id: "mogul", unlock: 8, weight: 1 },
];

const SHADER_THEMES = {
  rift: {
    label: "Rift",
    main: `
      vec2 r = iResolution.xy;
      float t = iTime;
      vec4 o = vec4(0.0);
      vec4 FC = vec4(gl_FragCoord.xy, 1.0, 1.0);

      float z = 0.0;
      float d = 0.0;
      for (int i = 0; i < 70; i++) {
        vec3 p = abs(z * normalize(FC.rgb * 2.0 - r.xyy));
        p.z += t * 5.0;
        p += sin(p + p);
        for (int j = 0; j < 9; j++) {
          float jf = float(j) + 1.0;
          p += 0.4 * cos(roundCompat(0.2 * jf * p) + 0.2 * t).zxy;
          d = jf;
        }
        z += d = 0.1 * sqrt(length(p.xyy * p.yxy));
        o += vec4(z, 1.0, 9.0, 1.0) / d;
      }

      o = tanhCompat(o / 7000.0);
    `,
  },
  nebula: {
    label: "Nebula",
    main: `
      vec2 r = iResolution.xy;
      float t = iTime * 0.6;
      vec4 o = vec4(0.0);
      vec4 FC = vec4(gl_FragCoord.xy, 1.0, 1.0);

      vec3 c = vec3(0.0);
      vec3 p = vec3(0.0);
      vec3 v = vec3(0.0);
      float z = 0.0;
      float d = 0.0;
      for (int i = 0; i < 50; i++) {
        c = normalize(FC.rgb * 2.0 - r.xxy);
        p = z * c;
        p.xz -= t;
        v = p - sin(p).xxz;
        float wave = dot(cos(v).xz, sin(v.zx / 0.6)) + 0.6;
        d = 0.4 * max(wave, v.y + 3.0);
        z += d;
        float dd = d * d;
        vec3 glow = (cos(p.y + vec3(6.0, 1.0, 2.0)) + 1.1)
          / (length(tan(p.y / 0.3) / cos(p.xz / 0.1)) + dd / 0.01) / z;
        vec3 fog = -c * dd / (z * z);
        o.rgb += fog + glow;
      }

      o = tanhCompat(0.1 * o);
      o.a = 1.0;
    `,
  },
};

const THEME_ORDER = ["rift", "nebula"];
const DEFAULT_THEME = "nebula";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("apex-theme");
    if (saved && SHADER_THEMES[saved]) return saved;
  } catch (error) {
    // Ignore storage failures.
  }
  return DEFAULT_THEME;
}

const state = {
  time: 0,
  gold: 750,
  lives: 20,
  wave: 1,
  enemies: [],
  towers: [],
  projectiles: [],
  spawnTimer: 0,
  spawnRemaining: 0,
  bossRemaining: 0,
  waveCooldown: 2.2,
  selectedTower: null,
  buildSelection: null,
  hoverWorld: null,
  paused: false,
  showHitboxes: false,
  theme: getInitialTheme(),
  camera: {
    x: PATH_POINTS[0].x,
    y: PATH_POINTS[0].y,
    zoom: 0.85,
  },
};

const assets = {};
const uiCache = {
  selectedId: null,
  gold: null,
  towerKey: "",
};
const shaderState = {
  ready: false,
  gl: null,
  program: null,
  isWebgl2: false,
  attrib: null,
  uniforms: {},
  buffer: null,
  themeId: null,
  mouse: [0, 0, 0, 0],
  startTime: performance.now(),
};
let lastTime = performance.now();
let dragging = false;
let dragMoved = false;
let dragStart = { x: 0, y: 0 };
let cameraStart = { x: 0, y: 0 };
let pointer = { x: 0, y: 0 };
let activePointerId = null;

const pathSegments = buildPathSegments(PATH_POINTS);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function createPlaceholderImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(255,255,255,0.5)";
    context.fillRect(0, 0, 2, 2);
  }
  return canvas;
}

function computeFrameOffsets(img, frameWidth, frameHeight, frames) {
  if (!img || frames <= 1) return null;
  const canvas = document.createElement("canvas");
  canvas.width = frameWidth;
  canvas.height = frameHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  const centers = [];
  const threshold = 8;

  for (let i = 0; i < frames; i += 1) {
    context.clearRect(0, 0, frameWidth, frameHeight);
    context.drawImage(
      img,
      i * frameWidth,
      0,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );

    const imageData = context.getImageData(0, 0, frameWidth, frameHeight);
    let minX = frameWidth;
    let minY = frameHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < frameHeight; y += 1) {
      for (let x = 0; x < frameWidth; x += 1) {
        const alpha = imageData.data[(y * frameWidth + x) * 4 + 3];
        if (alpha > threshold) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0 || maxY < 0) {
      centers.push({ x: frameWidth / 2, y: frameHeight / 2 });
    } else {
      centers.push({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
    }
  }

  const anchor = centers.reduce(
    (acc, center) => ({ x: acc.x + center.x, y: acc.y + center.y }),
    { x: 0, y: 0 }
  );
  anchor.x /= centers.length || 1;
  anchor.y /= centers.length || 1;

  return centers.map((center) => ({
    x: anchor.x - center.x,
    y: anchor.y - center.y,
  }));
}

async function loadImageSafe(src) {
  try {
    return await loadImage(src);
  } catch (error) {
    console.error(error);
    return createPlaceholderImage();
  }
}

async function loadAssets() {
  const entries = Object.entries(SPRITES);
  await Promise.all(
    entries.map(async ([key, value]) => {
      const img = await loadImageSafe(value.src);
      const frames = value.frames ?? 1;
      let frameWidth = value.frameWidth ?? img.width;
      let frameHeight = value.frameHeight ?? img.height;
      if (frames > 1) {
        frameWidth = Math.floor(img.width / frames);
        frameHeight = img.height;
      }
      const frameOffsets = (frames > 1 && !value.noOffset) ? computeFrameOffsets(img, frameWidth, frameHeight, frames) : null;
      assets[key] = {
        ...value,
        frames,
        frameWidth,
        frameHeight,
        img,
        frameOffsets,
        frame: 0,
        frameTimer: 0,
      };
    })
  );
}

function buildPathSegments(points) {
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    segments.push({ start, end, dx, dy, length });
  }
  return segments;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function worldToScreen(position) {
  const { x, y } = position;
  const { width, height } = canvas2d;
  return {
    x: (x - state.camera.x) * state.camera.zoom + width / 2,
    y: (y - state.camera.y) * state.camera.zoom + height / 2,
  };
}

function screenToWorld(position) {
  const { width, height } = canvas2d;
  return {
    x: (position.x - width / 2) / state.camera.zoom + state.camera.x,
    y: (position.y - height / 2) / state.camera.zoom + state.camera.y,
  };
}

function updateCameraClamp() {
  const marginX = WORLD.width * 0.1;
  const marginY = WORLD.height * 0.1;
  state.camera.x = clamp(state.camera.x, -marginX, WORLD.width + marginX);
  state.camera.y = clamp(state.camera.y, -marginY, WORLD.height + marginY);
}

function isPointOnPath(point) {
  return distanceToPath(point) <= PATH_WIDTH * 0.5;
}

function distanceToPath(point) {
  let min = Infinity;
  for (const segment of pathSegments) {
    const dist = distanceToSegment(point, segment.start, segment.end);
    if (dist < min) min = dist;
  }
  return min;
}

function distanceToSegment(point, start, end) {
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const wx = point.x - start.x;
  const wy = point.y - start.y;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(point.x - end.x, point.y - end.y);
  const b = c1 / c2;
  const px = start.x + b * vx;
  const py = start.y + b * vy;
  return Math.hypot(point.x - px, point.y - py);
}

function spawnWave() {
  const waveScale = 1 + state.wave * 0.2;
  state.spawnRemaining = Math.floor(14 + state.wave * 6);
  state.bossRemaining = state.wave % 5 === 0 ? 1 : 0;
  state.spawnTimer = 0;
  state.spawnInterval = Math.max(0.38, 1.1 - state.wave * 0.055);
  state.waveCooldown = 0;
  state.waveReward = Math.floor(140 * waveScale);
}

function createEnemy(typeId) {
  const template = ENEMY_TYPES[typeId] || ENEMY_TYPES.monki;
  const sprite = assets[template.sprite];
  const hp = template.baseHp + state.wave * template.hpScale;
  const speed = template.baseSpeed + state.wave * template.speedScale;
  const size = template.size;
  const radiusScale = template.boss ? 0.42 : 0.35;

  return {
    id: createId(),
    type: template.id,
    boss: Boolean(template.boss),
    sprite,
    x: PATH_POINTS[0].x,
    y: PATH_POINTS[0].y,
    pathIndex: 0,
    progress: 0,
    speed,
    hp,
    maxHp: hp,
    size,
    radius: size * radiusScale,
    reward: template.reward,
    slowTimer: 0,
    slowFactor: 0,
    stunTimer: 0,
    bleedTimer: 0,
    bleedDps: 0,
    bleedStacks: 0,
    vulnerableTimer: 0,
    vulnerableBonus: 0,
    bountyTimer: 0,
    bountyBonus: 0,
    overdraftTimer: 0,
    overdraftStacks: 0,
  };
}

function pickEnemyType() {
  const eliteChance = Math.min(0.22 + state.wave * 0.025, 0.55);
  if (Math.random() < eliteChance) return "pfp";

  const available = ENEMY_SPAWN_TABLE.filter((entry) => state.wave >= entry.unlock);
  if (available.length === 0) return "monki";
  const totalWeight = available.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of available) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return available[available.length - 1].id;
}

function createTower(typeId, position) {
  const template = TOWER_TYPES[typeId];
  const tower = {
    id: createId(),
    typeId,
    name: template.name,
    role: template.role,
    attack: template.attack,
    special: template.special,
    sprite: assets[`tower${capitalize(typeId)}`] || template.sprite,
    x: position.x,
    y: position.y,
    range: template.range,
    fireRate: template.fireRate,
    damage: template.damage,
    projectileSpeed: template.projectileSpeed,
    projectileRadius: template.projectileRadius ?? 10,
    size: template.size,
    cooldown: 0,
    upgrades: { damage: 0, range: 0, rate: 0 },
    specialTimer: 0,
  };
  return tower;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function canAfford(amount) {
  return state.gold >= amount;
}

function getTowerSpecialScale(tower) {
  return 1 + totalUpgradeLevel(tower) * 0.12;
}

function applySlow(enemy, factor, duration) {
  if (factor <= 0 || duration <= 0) return;
  enemy.slowFactor = Math.max(enemy.slowFactor, factor);
  enemy.slowTimer = Math.max(enemy.slowTimer, duration);
}

function applyStun(enemy, duration) {
  if (duration <= 0) return;
  enemy.stunTimer = Math.max(enemy.stunTimer, duration);
}

function applyVulnerable(enemy, bonus, duration) {
  if (bonus <= 0 || duration <= 0) return;
  enemy.vulnerableBonus = Math.max(enemy.vulnerableBonus, bonus);
  enemy.vulnerableTimer = Math.max(enemy.vulnerableTimer, duration);
}

function applyBleed(enemy, dps, duration, maxStacks) {
  if (dps <= 0 || duration <= 0) return;
  enemy.bleedStacks = Math.min(maxStacks, (enemy.bleedStacks || 0) + 1);
  enemy.bleedTimer = Math.max(enemy.bleedTimer, duration);
  enemy.bleedDps = dps * enemy.bleedStacks;
}

function applyBounty(enemy, bonus, duration) {
  if (bonus <= 0 || duration <= 0) return;
  enemy.bountyBonus = Math.max(enemy.bountyBonus, bonus);
  enemy.bountyTimer = Math.max(enemy.bountyTimer, duration);
}

function applyDamage(enemy, amount) {
  const vuln = enemy.vulnerableTimer > 0 ? enemy.vulnerableBonus : 0;
  enemy.hp -= amount * (1 + vuln);
}

function getEnemyReward(enemy) {
  const bounty = enemy.bountyTimer > 0 ? enemy.bountyBonus : 0;
  return Math.round(enemy.reward * (1 + bounty));
}

function killEnemy(enemy) {
  state.gold += getEnemyReward(enemy);
  state.enemies = state.enemies.filter((item) => item.id !== enemy.id);
}

function isElite(enemy) {
  return enemy.boss || enemy.type === "pfp" || enemy.maxHp > 260;
}

function applySplashDamage(center, radius, baseDamage, options = {}) {
  const {
    excludeId = null,
    slowFactor = 0,
    slowDuration = 0,
    damageMultiplier = 1,
  } = options;
  for (const enemy of state.enemies) {
    if (excludeId && enemy.id === excludeId) continue;
    const dist = Math.hypot(enemy.x - center.x, enemy.y - center.y);
    if (dist > radius) continue;
    const falloff = 1 - dist / radius;
    applyDamage(enemy, baseDamage * falloff * damageMultiplier);
    if (slowFactor > 0) applySlow(enemy, slowFactor, slowDuration);
    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  }
}

function applyTowerSpecialOnHit(tower, enemy, projectile) {
  if (!tower) return;
  const scale = projectile.specialScale ?? getTowerSpecialScale(tower);

  switch (tower.typeId) {
    case "blood": {
      applyBleed(enemy, 6 * scale, 4.2, 3);
      if (enemy.hp / enemy.maxHp <= 0.2) {
        applyDamage(enemy, 22 * scale);
      }
      break;
    }
    case "obelisk": {
      applySlow(enemy, 0.22, 1.6);
      const chainTargets = state.enemies
        .filter((other) => other.id !== enemy.id)
        .map((other) => ({ other, dist: Math.hypot(other.x - enemy.x, other.y - enemy.y) }))
        .filter((entry) => entry.dist <= 180)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2)
        .map((entry) => entry.other);
      chainTargets.forEach((target) => {
        applyDamage(target, tower.damage * 0.6 * scale);
        applySlow(target, 0.18, 1.2);
        if (target.hp <= 0) killEnemy(target);
      });
      break;
    }
    case "bank": {
      applyBounty(enemy, 0.4, 6);
      break;
    }
    case "barn": {
      applySplashDamage(enemy, 150, tower.damage * 0.6, {
        excludeId: enemy.id,
        slowFactor: 0.28,
        slowDuration: 1.8,
      });
      break;
    }
    case "stall": {
      applyVulnerable(enemy, 0.25, 2.6);
      break;
    }
    case "jail": {
      applyStun(enemy, 0.7);
      applySplashDamage(enemy, 140, tower.damage * 0.35, {
        excludeId: enemy.id,
        slowFactor: 0.45,
        slowDuration: 1.5,
      });
      break;
    }
    case "atm": {
      enemy.overdraftTimer = 3.2;
      enemy.overdraftStacks = Math.min(5, (enemy.overdraftStacks || 0) + 1);
      const bonus = tower.damage * 0.12 * enemy.overdraftStacks * scale;
      applyDamage(enemy, bonus);
      break;
    }
    case "banana": {
      applySplashDamage(enemy, 170, tower.damage * 0.75, {
        excludeId: enemy.id,
        slowFactor: 0.5,
        slowDuration: 2.2,
      });
      break;
    }
    case "relic": {
      if (isElite(enemy)) {
        applyDamage(enemy, tower.damage * 0.35 * scale);
      }
      break;
    }
    default:
      break;
  }
}

function findExtraTargets(tower, primary, count) {
  return state.enemies
    .filter((enemy) => enemy.id !== primary.id)
    .map((enemy) => ({ enemy, dist: Math.hypot(enemy.x - tower.x, enemy.y - tower.y) }))
    .filter((entry) => entry.dist <= tower.range * 0.9)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((entry) => entry.enemy);
}

function findEnemyInRange(tower) {
  let target = null;
  let bestDistance = Infinity;
  for (const enemy of state.enemies) {
    const dx = enemy.x - tower.x;
    const dy = enemy.y - tower.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= tower.range && distance < bestDistance) {
      bestDistance = distance;
      target = enemy;
    }
  }
  return target;
}

function fireAtTarget(tower, target) {
  const dx = target.x - tower.x;
  const dy = target.y - tower.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed = tower.projectileSpeed;
  state.projectiles.push({
    id: createId(),
    x: tower.x,
    y: tower.y,
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    damage: tower.damage,
    radius: 10,
    life: 2,
  });
}

function updateEnemies(dt) {
  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
    if (enemy.slowTimer === 0) enemy.slowFactor = 0;
    enemy.vulnerableTimer = Math.max(0, enemy.vulnerableTimer - dt);
    if (enemy.vulnerableTimer === 0) enemy.vulnerableBonus = 0;
    enemy.bountyTimer = Math.max(0, enemy.bountyTimer - dt);
    if (enemy.bountyTimer === 0) enemy.bountyBonus = 0;
    enemy.overdraftTimer = Math.max(0, enemy.overdraftTimer - dt);
    if (enemy.overdraftTimer === 0) enemy.overdraftStacks = 0;
    if (enemy.bleedTimer > 0) {
      enemy.bleedTimer = Math.max(0, enemy.bleedTimer - dt);
      enemy.hp -= enemy.bleedDps * dt;
      if (enemy.bleedTimer === 0) {
        enemy.bleedDps = 0;
        enemy.bleedStacks = 0;
      }
    }

    if (enemy.hp <= 0) {
      killEnemy(enemy);
      continue;
    }

    const slowFactor = enemy.slowTimer > 0 ? enemy.slowFactor : 0;
    const speedMultiplier = enemy.stunTimer > 0 ? 0 : 1 - slowFactor;
    let remaining = enemy.speed * speedMultiplier * dt;

    while (remaining > 0 && enemy.pathIndex < pathSegments.length) {
      const segment = pathSegments[enemy.pathIndex];
      const available = segment.length - enemy.progress;
      if (remaining < available) {
        enemy.progress += remaining;
        remaining = 0;
      } else {
        remaining -= available;
        enemy.pathIndex += 1;
        enemy.progress = 0;
      }
    }

    if (enemy.pathIndex >= pathSegments.length) {
      state.enemies.splice(i, 1);
      state.lives = Math.max(0, state.lives - 1);
      continue;
    }

    const segment = pathSegments[enemy.pathIndex];
    const ratio = segment.length === 0 ? 0 : enemy.progress / segment.length;
    enemy.x = segment.start.x + segment.dx * ratio;
    enemy.y = segment.start.y + segment.dy * ratio;
  }
}

function updateTowers(dt) {
  for (const tower of state.towers) {
    tower.cooldown -= dt;
    if (tower.cooldown > 0) continue;
    const target = findEnemyInRange(tower);
    if (!target) continue;
    fireAtTarget(tower, target);
    tower.cooldown = 1 / tower.fireRate;
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    let hit = null;
    for (const enemy of state.enemies) {
      const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
      if (dist <= enemy.radius + projectile.radius) {
        hit = enemy;
        break;
      }
    }

    if (hit) {
      hit.hp -= projectile.damage;
      if (hit.hp <= 0) {
        state.gold += hit.reward;
        state.enemies = state.enemies.filter((item) => item.id !== hit.id);
      }
      state.projectiles.splice(i, 1);
      continue;
    }

    if (projectile.life <= 0) {
      state.projectiles.splice(i, 1);
    }
  }
}

function updateSpawns(dt) {
  if (state.waveCooldown > 0) {
    state.waveCooldown -= dt;
    if (state.waveCooldown <= 0) {
      spawnWave();
    }
    return;
  }

  if (state.spawnRemaining <= 0 && state.bossRemaining <= 0) {
    if (state.enemies.length === 0) {
      state.gold += state.waveReward || 0;
      state.wave += 1;
      state.waveCooldown = 3.5;
    }
    return;
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) return;

  if (state.bossRemaining > 0) {
    state.enemies.push(createEnemy("boss"));
    state.bossRemaining -= 1;
    state.spawnTimer = Math.max(0.9, state.spawnInterval * 1.35);
    return;
  }

  const enemyType = pickEnemyType();
  state.enemies.push(createEnemy(enemyType));
  state.spawnRemaining -= 1;
  state.spawnTimer = state.spawnInterval;
}

function updateSprites(dt) {
  for (const sprite of Object.values(assets)) {
    if (sprite.frames <= 1) continue;
    sprite.frameTimer += dt;
    const frame = Math.floor(sprite.frameTimer * sprite.fps) % sprite.frames;
    sprite.frame = frame;
  }
}

function update(dt) {
  state.time += dt;
  updateSprites(dt);
  updateSpawns(dt);
  updateEnemies(dt);
  updateTowers(dt);
  updateProjectiles(dt);
  updateUI();
}

function updateUI() {
  ui.wave.textContent = String(state.wave).padStart(2, "0");
  ui.lives.textContent = String(state.lives);
  ui.gold.textContent = `$${Math.floor(state.gold)}`;
  ui.enemies.textContent = String(state.enemies.length + state.spawnRemaining + state.bossRemaining);
  updateSelectionPanel();
}

function drawGrid() {
  const { width, height } = canvas2d;
  const gridSize = 120;
  const left = state.camera.x - width / 2 / state.camera.zoom;
  const right = state.camera.x + width / 2 / state.camera.zoom;
  const top = state.camera.y - height / 2 / state.camera.zoom;
  const bottom = state.camera.y + height / 2 / state.camera.zoom;

  const startX = Math.floor(left / gridSize) * gridSize;
  const endX = Math.ceil(right / gridSize) * gridSize;
  const startY = Math.floor(top / gridSize) * gridSize;
  const endY = Math.ceil(bottom / gridSize) * gridSize;

  ctx.strokeStyle = "rgba(120, 160, 210, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = startX; x <= endX; x += gridSize) {
    const screen = worldToScreen({ x, y: top });
    const screenBottom = worldToScreen({ x, y: bottom });
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(screenBottom.x, screenBottom.y);
  }

  for (let y = startY; y <= endY; y += gridSize) {
    const screen = worldToScreen({ x: left, y });
    const screenRight = worldToScreen({ x: right, y });
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(screenRight.x, screenRight.y);
  }
  ctx.stroke();
}

function drawPath() {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  PATH_POINTS.forEach((point, index) => {
    const screen = worldToScreen(point);
    if (index === 0) ctx.moveTo(screen.x, screen.y);
    else ctx.lineTo(screen.x, screen.y);
  });
  ctx.strokeStyle = "rgba(90, 230, 200, 0.2)";
  ctx.lineWidth = PATH_WIDTH * state.camera.zoom;
  ctx.stroke();

  ctx.strokeStyle = "rgba(248, 198, 109, 0.3)";
  ctx.lineWidth = (PATH_WIDTH * 0.4) * state.camera.zoom;
  ctx.stroke();
  ctx.restore();
}

function drawSprite2D(sprite, position, size, alpha = 1) {
  if (!sprite?.img) return;
  const frameWidth = Math.floor(sprite.frameWidth || sprite.img.width);
  const frameHeight = Math.floor(sprite.frameHeight || sprite.img.height);
  const aspect = frameWidth / frameHeight;
  const drawWidth = size * aspect;
  const drawHeight = size;
  const frame = sprite.frames > 1 ? sprite.frame : 0;
  const sx = frame * frameWidth;
  const sy = 0;
  const screen = worldToScreen(position);
  const scaledWidth = drawWidth * state.camera.zoom;
  const scaledHeight = drawHeight * state.camera.zoom;
  let offsetX = 0;
  let offsetY = 0;
  const frameOffset = sprite.frameOffsets?.[frame];
  if (frameOffset) {
    offsetX = (frameOffset.x / frameWidth) * scaledWidth;
    offsetY = (frameOffset.y / frameHeight) * scaledHeight;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    sprite.img,
    sx,
    sy,
    frameWidth,
    frameHeight,
    screen.x - scaledWidth / 2 + offsetX,
    screen.y - scaledHeight / 2 + offsetY,
    scaledWidth,
    scaledHeight
  );
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    if (enemy.boss) {
      const screen = worldToScreen(enemy);
      const pulse = 0.65 + Math.sin(state.time * 3.2 + enemy.x * 0.01) * 0.18;
      const glowRadius = enemy.size * 0.75 * state.camera.zoom;
      const gradient = ctx.createRadialGradient(
        screen.x,
        screen.y,
        glowRadius * 0.2,
        screen.x,
        screen.y,
        glowRadius
      );
      gradient.addColorStop(0, `rgba(90, 230, 200, ${0.45 * pulse})`);
      gradient.addColorStop(0.5, `rgba(90, 230, 200, ${0.2 * pulse})`);
      gradient.addColorStop(1, "rgba(90, 230, 200, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = "rgba(90, 230, 200, 0.7)";
      ctx.shadowBlur = 28 * state.camera.zoom;
      drawSprite2D(enemy.sprite, enemy, enemy.size);
      ctx.restore();
    } else {
      drawSprite2D(enemy.sprite, enemy, enemy.size);
    }

    const healthRatio = enemy.hp / enemy.maxHp;
    const screen = worldToScreen(enemy);
    const barWidth = (enemy.boss ? 92 : 50) * state.camera.zoom;
    const barHeight = (enemy.boss ? 10 : 6) * state.camera.zoom;
    const barOffset = enemy.size * (enemy.boss ? 0.5 : 0.4) * state.camera.zoom;

    ctx.fillStyle = "rgba(10, 15, 22, 0.8)";
    ctx.fillRect(screen.x - barWidth / 2, screen.y - barOffset, barWidth, barHeight);
    ctx.fillStyle = "rgba(90, 230, 200, 0.9)";
    ctx.fillRect(screen.x - barWidth / 2, screen.y - barOffset, barWidth * healthRatio, barHeight);

    if (enemy.boss) {
      ctx.strokeStyle = "rgba(248, 198, 109, 0.75)";
      ctx.lineWidth = Math.max(1, 1.4 * state.camera.zoom);
      ctx.strokeRect(screen.x - barWidth / 2, screen.y - barOffset, barWidth, barHeight);
    }

    if (state.showHitboxes) {
      ctx.strokeStyle = "rgba(255, 90, 95, 0.6)";
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, enemy.radius * state.camera.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawTowers() {
  for (const tower of state.towers) {
    drawSprite2D(tower.sprite, tower, tower.size);

    if (state.selectedTower?.id === tower.id) {
      const screen = worldToScreen(tower);
      ctx.strokeStyle = "rgba(90, 230, 200, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, tower.range * state.camera.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (state.showHitboxes) {
      const screen = worldToScreen(tower);
      ctx.strokeStyle = "rgba(248, 198, 109, 0.55)";
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, tower.size * 0.3 * state.camera.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawProjectiles() {
  ctx.fillStyle = "rgba(248, 198, 109, 0.9)";
  for (const projectile of state.projectiles) {
    const screen = worldToScreen(projectile);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, projectile.radius * state.camera.zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBuildPreview() {
  if (!state.buildSelection || !state.hoverWorld) return;
  const template = TOWER_TYPES[state.buildSelection];
  const invalid = !isValidPlacement(state.hoverWorld, template.size);
  const sprite = assets[`tower${capitalize(state.buildSelection)}`];
  drawSprite2D(sprite, state.hoverWorld, template.size, invalid ? 0.35 : 0.7);

  if (invalid) {
    const screen = worldToScreen(state.hoverWorld);
    ctx.strokeStyle = "rgba(255, 90, 95, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, template.size * 0.3 * state.camera.zoom, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function render2d() {
  const { width, height } = canvas2d;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(10, 19, 31, 0.65)");
  gradient.addColorStop(0.6, "rgba(5, 8, 15, 0.7)");
  gradient.addColorStop(1, "rgba(5, 7, 12, 0.78)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawGrid();
  drawPath();
  drawBuildPreview();
  drawProjectiles();
  drawTowers();
  drawEnemies();
}

function isValidPlacement(position, size) {
  if (position.x < 80 || position.y < 80 || position.x > WORLD.width - 80 || position.y > WORLD.height - 80) {
    return false;
  }

  if (isPointOnPath(position)) return false;

  for (const tower of state.towers) {
    const dist = Math.hypot(position.x - tower.x, position.y - tower.y);
    if (dist < (tower.size + size) * 0.45) {
      return false;
    }
  }

  return true;
}

function placeTower(position) {
  const typeId = state.buildSelection;
  if (!typeId) return;
  const template = TOWER_TYPES[typeId];
  if (!isValidPlacement(position, template.size)) return;
  if (!canAfford(template.cost)) return;

  state.gold -= template.cost;
  const tower = createTower(typeId, position);
  state.towers.push(tower);
  state.selectedTower = tower;
}

function selectTowerAt(position) {
  const clicked = state.towers.find((tower) => {
    const dist = Math.hypot(position.x - tower.x, position.y - tower.y);
    return dist <= tower.size * 0.35;
  });
  state.selectedTower = clicked || null;
}

function updateSelectionPanel() {
  const tower = state.selectedTower;
  if (!tower) {
    if (uiCache.selectedId !== null) {
      ui.selectionName.textContent = "No tower selected";
      ui.selectionBody.innerHTML = `<p class=\"selection-empty\">Select a tower to see upgrades and range details.</p>`;
      uiCache.selectedId = null;
      uiCache.towerKey = "";
    }
    return;
  }

  const towerKey = [
    tower.id,
    tower.range,
    tower.damage,
    tower.fireRate,
    tower.upgrades.damage,
    tower.upgrades.range,
    tower.upgrades.rate,
  ].join("|");

  if (uiCache.selectedId === tower.id && uiCache.gold === Math.floor(state.gold) && uiCache.towerKey === towerKey) {
    return;
  }

  ui.selectionName.textContent = tower.name;
  const stats = [
    { label: "Range", value: Math.round(tower.range) },
    { label: "Damage", value: Math.round(tower.damage) },
    { label: "Fire Rate", value: tower.fireRate.toFixed(2) },
  ];

  const upgradeButtons = Object.entries(UPGRADE_CONFIG)
    .map(([key, config]) => {
      const level = tower.upgrades[key];
      const cost = Math.floor(config.cost * (1 + level * 0.55 + state.wave * 0.08));
      const disabled = level >= 4 || !canAfford(cost);
      const label = `${config.label} +${config.amount}`;
      return `
        <button class="upgrade-button" data-upgrade="${key}" ${disabled ? "disabled" : ""}>
          <span>${label}</span>
          <strong>${level >= 4 ? "MAX" : `$${cost}`}</strong>
        </button>
      `;
    })
    .join("");

  ui.selectionBody.innerHTML = `
    <div class="selection-info">
      <div class="selection-stat"><span>Level</span><strong>${totalUpgradeLevel(tower)}</strong></div>
      ${stats.map((stat) => `<div class="selection-stat"><span>${stat.label}</span><strong>${stat.value}</strong></div>`).join("")}
      ${
        [
          { label: "Role", text: tower.role },
          { label: "Attack", text: tower.attack },
          { label: "Special", text: tower.special },
        ]
          .filter((detail) => detail.text)
          .map(
            (detail) => `
              <div class="selection-detail">
                <span>${detail.label}</span>
                <p>${detail.text}</p>
              </div>
            `,
          )
          .join("")
      }
    </div>
    <div class="upgrade-footer">
      <div class="upgrade-grid">${upgradeButtons}</div>
    </div>
  `;

  uiCache.selectedId = tower.id;
  uiCache.gold = Math.floor(state.gold);
  uiCache.towerKey = towerKey;

  ui.selectionBody.querySelectorAll(".upgrade-button").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.upgrade;
      upgradeTower(tower, type);
    });
  });
}

function totalUpgradeLevel(tower) {
  return tower.upgrades.damage + tower.upgrades.range + tower.upgrades.rate;
}

function upgradeTower(tower, type) {
  const config = UPGRADE_CONFIG[type];
  if (!config) return;
  const level = tower.upgrades[type];
  if (level >= 4) return;
  const cost = Math.floor(config.cost * (1 + level * 0.55 + state.wave * 0.08));
  if (!canAfford(cost)) return;

  state.gold -= cost;
  tower.upgrades[type] += 1;

  if (type === "damage") tower.damage += config.amount;
  if (type === "range") tower.range += config.amount;
  if (type === "rate") tower.fireRate += config.amount;
}

function resize() {
  canvas2d.width = window.innerWidth;
  canvas2d.height = window.innerHeight;
  resizeShader();
}

function getThemeLabel(themeId) {
  return SHADER_THEMES[themeId]?.label || SHADER_THEMES[DEFAULT_THEME].label;
}

function updateThemeToggle() {
  if (!ui.toggleTheme) return;
  ui.toggleTheme.textContent = `Theme: ${getThemeLabel(state.theme)}`;
  ui.toggleTheme.classList.toggle("is-active", state.theme !== DEFAULT_THEME);
}

function setTheme(themeId) {
  const resolved = SHADER_THEMES[themeId] ? themeId : DEFAULT_THEME;
  state.theme = resolved;
  try {
    localStorage.setItem("apex-theme", resolved);
  } catch (error) {
    // Ignore storage failures.
  }
  updateThemeToggle();
  if (shaderState.gl) {
    const ok = buildShaderProgram(resolved);
    if (!ok && resolved !== DEFAULT_THEME) {
      state.theme = DEFAULT_THEME;
      buildShaderProgram(DEFAULT_THEME);
      updateThemeToggle();
    }
  } else {
    initShaderBackground();
  }
}

function buildFragmentShaderSource(themeId, isWebgl2) {
  const theme = SHADER_THEMES[themeId] || SHADER_THEMES[DEFAULT_THEME];
  const outputDecl = isWebgl2 ? "out vec4 fragColor;" : "";
  const outputVar = isWebgl2 ? "fragColor" : "gl_FragColor";
  const versionLine = isWebgl2 ? "#version 300 es\n" : "";
  return `${versionLine}precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform vec4 iMouse;
    ${outputDecl}

    vec3 roundCompat(vec3 v) {
      return floor(v + 0.5);
    }

    vec4 tanhCompat(vec4 v) {
      vec4 e = exp(2.0 * v);
      return (e - 1.0) / (e + 1.0);
    }

    void main() {
      ${theme.main}
      ${outputVar} = o;
    }
  `;
}

function buildShaderProgram(themeId) {
  if (!shaderState.gl) return false;
  const gl = shaderState.gl;
  const vertexShaderSource = shaderState.isWebgl2
    ? `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }`
    : `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }`;

  const fragmentShaderSource = buildFragmentShaderSource(themeId, shaderState.isWebgl2);
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return false;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
    return false;
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (shaderState.program) {
    gl.deleteProgram(shaderState.program);
  }

  shaderState.program = program;
  shaderState.attrib = gl.getAttribLocation(program, "position");
  shaderState.uniforms = {
    resolution: gl.getUniformLocation(program, "iResolution"),
    time: gl.getUniformLocation(program, "iTime"),
    mouse: gl.getUniformLocation(program, "iMouse"),
  };
  shaderState.themeId = themeId;
  return true;
}

function initShaderBackground() {
  if (!shaderCanvas) return;
  if (!shaderState.gl) {
    const gl = shaderCanvas.getContext("webgl2", { antialias: true, alpha: true })
      || shaderCanvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    shaderState.gl = gl;
    shaderState.isWebgl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    shaderState.buffer = buffer;
  }

  if (!buildShaderProgram(state.theme)) return;
  shaderState.ready = true;
  resizeShader();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function resizeShader() {
  if (!shaderState.ready || !shaderCanvas) return;
  const gl = shaderState.gl;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  shaderCanvas.width = Math.floor(window.innerWidth * ratio);
  shaderCanvas.height = Math.floor(window.innerHeight * ratio);
  shaderCanvas.style.width = `${window.innerWidth}px`;
  shaderCanvas.style.height = `${window.innerHeight}px`;
  gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
}

function renderShader(now) {
  if (!shaderState.ready) return;
  const gl = shaderState.gl;
  gl.useProgram(shaderState.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, shaderState.buffer);
  gl.enableVertexAttribArray(shaderState.attrib);
  gl.vertexAttribPointer(shaderState.attrib, 2, gl.FLOAT, false, 0, 0);

  const time = (now - shaderState.startTime) / 1000;
  gl.uniform2f(shaderState.uniforms.resolution, shaderCanvas.width, shaderCanvas.height);
  gl.uniform1f(shaderState.uniforms.time, time);
  gl.uniform4f(
    shaderState.uniforms.mouse,
    shaderState.mouse[0],
    shaderState.mouse[1],
    shaderState.mouse[2],
    shaderState.mouse[3]
  );

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function updateShaderMouse(event, isDown = false) {
  if (!shaderState.ready) return;
  const rect = shaderCanvas.getBoundingClientRect();
  const ratio = shaderCanvas.width / rect.width;
  const x = (event.clientX - rect.left) * ratio;
  const y = (rect.height - (event.clientY - rect.top)) * ratio;
  shaderState.mouse[0] = x;
  shaderState.mouse[1] = y;
  if (isDown) shaderState.mouse[2] = 1;
}

function getWorldFromEvent(event) {
  return screenToWorld({ x: event.clientX, y: event.clientY });
}

function handlePointerMove(event) {
  pointer = { x: event.clientX, y: event.clientY };
  state.hoverWorld = getWorldFromEvent(event);
  updateShaderMouse(event);

  if (!dragging) return;

  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  const distance = Math.hypot(dx, dy);
  if (distance > 4) dragMoved = true;

  state.camera.x = cameraStart.x - dx / state.camera.zoom;
  state.camera.y = cameraStart.y - dy / state.camera.zoom;
  updateCameraClamp();
}

function handlePointerDown(event) {
  updateShaderMouse(event, true);
  if (event.target.closest(".panel") || event.target.closest(".bottom-bar")) return;
  dragging = true;
  dragMoved = false;
  dragStart = { x: event.clientX, y: event.clientY };
  cameraStart = { ...state.camera };
  activePointerId = event.pointerId ?? null;
  if (canvas2d?.setPointerCapture && activePointerId !== null) {
    try {
      canvas2d.setPointerCapture(activePointerId);
    } catch (error) {
      activePointerId = null;
    }
  }
}

function handlePointerUp(event) {
  if (shaderState.ready) shaderState.mouse[2] = 0;
  if (!dragging) return;
  dragging = false;
  if (dragMoved) return;
  if (event.target.closest(".panel") || event.target.closest(".bottom-bar")) return;

  if (activePointerId !== null) {
    if (canvas2d?.hasPointerCapture?.(activePointerId)) {
      canvas2d.releasePointerCapture(activePointerId);
    }
    activePointerId = null;
  }

  const world = getWorldFromEvent(event);
  if (!world) return;
  if (state.buildSelection) {
    placeTower(world);
    return;
  }
  selectTowerAt(world);
}

function handleWheel(event) {
  if (event.target.closest(".panel") || event.target.closest(".bottom-bar")) return;
  const zoomFactor = 1 - event.deltaY * 0.0012;
  const before = screenToWorld({ x: event.clientX, y: event.clientY });
  state.camera.zoom = clamp(state.camera.zoom * zoomFactor, 0.4, 1.6);
  const after = screenToWorld({ x: event.clientX, y: event.clientY });
  state.camera.x += before.x - after.x;
  state.camera.y += before.y - after.y;
  updateCameraClamp();
}

function handleBuildSelection(typeId) {
  state.buildSelection = typeId;
  ui.buildButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.build === typeId);
  });
}

function handleToggles() {
  ui.toggleHitboxes.addEventListener("click", () => {
    state.showHitboxes = !state.showHitboxes;
    ui.toggleHitboxes.classList.toggle("is-active", state.showHitboxes);
    ui.toggleHitboxes.textContent = `Hitboxes: ${state.showHitboxes ? "On" : "Off"}`;
  });

  ui.togglePause.addEventListener("click", () => {
    state.paused = !state.paused;
    ui.togglePause.classList.toggle("is-active", state.paused);
    ui.togglePause.textContent = `Pause: ${state.paused ? "On" : "Off"}`;
  });

  ui.toggleTheme.addEventListener("click", () => {
    const index = THEME_ORDER.indexOf(state.theme);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
    setTheme(next);
  });
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  renderShader(now);

  if (!state.paused) {
    update(dt);
  }
  render2d();

  requestAnimationFrame(loop);
}

function bindPanelToggles() {
  document.querySelectorAll(".panel[data-panel]").forEach((panel) => {
    const toggle = panel.querySelector(".panel-toggle");
    const panelId = panel.dataset.panel;
    if (!toggle || !panelId) return;
    const storageKey = `apex-panel-${panelId}`;
    let collapsed = false;
    try {
      collapsed = localStorage.getItem(storageKey) === "collapsed";
    } catch (error) {
      // Ignore storage failures.
    }
    panel.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.textContent = collapsed ? "Expand" : "Minimize";

    toggle.addEventListener("click", () => {
      const isCollapsed = panel.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!isCollapsed));
      toggle.textContent = isCollapsed ? "Expand" : "Minimize";
      try {
        localStorage.setItem(storageKey, isCollapsed ? "collapsed" : "expanded");
      } catch (error) {
        // Ignore storage failures.
      }
    });
  });
}

function bindEvents() {
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);
  window.addEventListener("wheel", handleWheel, { passive: true });
  canvas2d.addEventListener("contextmenu", (event) => event.preventDefault());

  ui.buildButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const typeId = button.dataset.build;
      if (state.buildSelection === typeId) {
        state.buildSelection = null;
        ui.buildButtons.forEach((btn) => btn.classList.remove("is-active"));
        return;
      }
      handleBuildSelection(typeId);
    });
  });

  handleToggles();
  bindPanelToggles();

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      state.buildSelection = null;
      ui.buildButtons.forEach((btn) => btn.classList.remove("is-active"));
    }

    if (event.key === "1") handleBuildSelection("blood");
    if (event.key === "2") handleBuildSelection("obelisk");
    if (event.key === "3") handleBuildSelection("bank");
    if (event.key === "4") handleBuildSelection("barn");
    if (event.key === "5") handleBuildSelection("stall");
    if (event.key === "6") handleBuildSelection("jail");
    if (event.key === "7") handleBuildSelection("atm");
    if (event.key === "8") handleBuildSelection("banana");
    if (event.key === "9") handleBuildSelection("relic");
    if (event.key.toLowerCase() === "h") ui.toggleHitboxes.click();
    if (event.key.toLowerCase() === "t") ui.toggleTheme.click();
  });
}

async function start() {
  initShaderBackground();
  resize();
  bindEvents();
  updateThemeToggle();
  await loadAssets();
  spawnWave();
  updateUI();
  requestAnimationFrame(loop);
}

start();
