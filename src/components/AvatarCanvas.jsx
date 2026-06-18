import React, { useEffect, useRef, useState } from 'react';

// Sign language pose library — DELTA Euler (x,y,z) radians applied ON TOP OF bind pose
// These are relative offsets from the model's A-pose bind quaternion, NOT absolute rotations.
// LeftShoulder local: +Y→world-left, +Z→world-down, +X→world-backward
// Arm goes further down by increasing X delta; arm raises by decreasing (negative) X delta.
const SIGN_POSES = {
  default: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],   // lower arms from A-pose to natural sides
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.47,  0,     0],
    RightForeArm:  [0.05,  0,     0],
    RightHand:     [0,     0,     0],
    Spine:         [0,     0,     0],
    Spine1:        [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0,     0,     0],
  },
  hello: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.65,-0.35,  0],   // raise right arm up and outward
    RightForeArm:  [-0.85, 0.18,  0],   // bend forearm up strongly
    RightHand:     [-0.15, 0.08,  0.08],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0,    -0.08,  0],
  },
  hi: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.65,-0.35,  0],
    RightForeArm:  [-0.85, 0.18,  0],
    RightHand:     [-0.15, 0.08,  0.08],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0,    -0.06,  0],
  },
  thank_you: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.25,-0.10,  0],   // arm raised toward face/chin
    RightForeArm:  [-1.15, 0.08,  0.08],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.06,  0,     0],
  },
  help: {
    LeftShoulder:  [0,     0,     0.04],
    LeftArm:       [0.10,  0.18,  0],   // both arms raised mid-body
    LeftForeArm:   [-0.55, 0.08,  0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,    -0.04],
    RightArm:      [0.10, -0.18,  0],
    RightForeArm:  [-0.55,-0.08,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  emergency: {
    LeftShoulder:  [0,     0.06,  0],
    LeftArm:       [-0.15, 0.22,  0],   // both arms raised urgently
    LeftForeArm:   [-0.65, 0,     0.06],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,    -0.06,  0],
    RightArm:      [-0.15,-0.22,  0],
    RightForeArm:  [-0.65, 0,    -0.06],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.06,  0.04,  0],
  },
  food: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.30,-0.20,  0],   // arm raised to mouth height
    RightForeArm:  [-1.30, 0.08,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [-0.06,-0.08,  0],
  },
  water: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.40,-0.15,  0],
    RightForeArm:  [-1.20, 0.12,  0.08],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [-0.03,-0.04,  0],
  },
  yes: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.30, -0.08,  0],   // arm in front, forearm vertical
    RightForeArm:  [-0.55, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.08,  0,     0],
  },
  no: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.20, -0.15,  0],
    RightForeArm:  [-0.80, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0,     0.12,  0],
  },
  love: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.35,-0.25,  0],
    RightForeArm:  [-0.90, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  friend: {
    LeftShoulder:  [0,     0,     0.04],
    LeftArm:       [0.20,  0.18,  0],
    LeftForeArm:   [-0.60, 0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,    -0.04],
    RightArm:      [0.20, -0.18,  0],
    RightForeArm:  [-0.60, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  good_morning: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.50,-0.30,  0],
    RightForeArm:  [-0.70, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  good_night: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.45,-0.22,  0],
    RightForeArm:  [-0.75, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [-0.04, 0,     0],
  },
  stop: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.05, -0.15,  0],
    RightForeArm:  [-0.22, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [-0.04, 0,     0],
  },
  ok: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.10, -0.30,  0],
    RightForeArm:  [-0.90, 0.08,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  fine: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.15, -0.08,  0],
    RightForeArm:  [-1.00, 0.18,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  please: {
    LeftShoulder:  [0,     0,     0.04],
    LeftArm:       [0.20,  0.14,  0],
    LeftForeArm:   [-0.85, 0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,    -0.04],
    RightArm:      [0.20, -0.14,  0],
    RightForeArm:  [-0.85, 0,     0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  sorry: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.47,  0,     0],
    LeftForeArm:   [0.05,  0,     0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.05, -0.10,  0],
    RightForeArm:  [-1.10, 0.08,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.06,  0,     0],
  },
  doctor: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [0.15,  0.08,  0],
    LeftForeArm:   [-0.70, 0.12,  0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [0.15, -0.08,  0],
    RightForeArm:  [-1.05,-0.08,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
  hospital: {
    LeftShoulder:  [0,     0,     0],
    LeftArm:       [-0.55, 0.18,  0],   // both arms raised high (cross sign)
    LeftForeArm:   [-0.80, 0.18,  0],
    LeftHand:      [0,     0,     0],
    RightShoulder: [0,     0,     0],
    RightArm:      [-0.55,-0.18,  0],
    RightForeArm:  [-0.80,-0.18,  0],
    RightHand:     [0,     0,     0],
    Spine2:        [0.04,  0,     0],
    Neck:          [0.02,  0,     0],
    Head:          [0.04,  0,     0],
  },
};

// Per-gesture finger shapes [thumb, index, middle, ring, pinky] bend in radians
const FINGER_SHAPES = {
  default:      { L: [0.25,0.25,0.25,0.25,0.25], R: [0.25,0.25,0.25,0.25,0.25] },
  hello:        { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,0,0,0] },
  hi:           { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,0,0,0] },
  thank_you:    { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,0,0,0] },
  help:         { L: [0,0,0,0,0],                R: [0,1.3,1.3,1.3,1.3] },
  emergency:    { L: [1.1,1.3,1.3,1.3,1.3],     R: [1.1,1.3,1.3,1.3,1.3] },
  food:         { L: [0.25,0.25,0.25,0.25,0.25], R: [0.5,0.55,0.55,0.55,0.55] },
  water:        { L: [0.25,0.25,0.25,0.25,0.25], R: [1.1,0,0,0,1.3] },
  yes:          { L: [0.25,0.25,0.25,0.25,0.25], R: [1.1,1.3,1.3,1.3,1.3] },
  no:           { L: [0.25,0.25,0.25,0.25,0.25], R: [1.1,0,1.3,1.3,1.3] },
  love:         { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,1.3,1.3,0] },
  friend:       { L: [0.8,0,1.2,1.2,1.2],        R: [0.8,0,1.2,1.2,1.2] },
  good_morning: { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,0,0,0] },
  good_night:   { L: [0.25,0.25,0.25,0.25,0.25], R: [0.2,0.2,0.2,0.2,0.2] },
  stop:         { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,0,0,0] },
  ok:           { L: [0.25,0.25,0.25,0.25,0.25], R: [0.8,0.8,0,0,0] },
  fine:         { L: [0.25,0.25,0.25,0.25,0.25], R: [0,0,0,0,0] },
  please:       { L: [0,0,0,0,0],                R: [0,0,0,0,0] },
  sorry:        { L: [0.25,0.25,0.25,0.25,0.25], R: [1.1,1.3,1.3,1.3,1.3] },
  doctor:       { L: [0.5,0,1.1,1.1,1.1],        R: [0.5,0,1.1,1.1,1.1] },
  hospital:     { L: [0,0,0,0,0],                R: [0,0,0,0,0] },
};

// Word-boundary–aware bone name matcher.
// Prevents 'LeftHand' from matching 'LeftHandIndex1', 'LeftHandThumb2', etc.
function boneMatchesAlias(boneName, alias) {
  if (boneName === alias) return true;
  // Handle namespace prefix: mixamorig:LeftArm, CC_Base_L_Arm, etc.
  if (boneName.endsWith(':' + alias)) return true;
  const idx = boneName.toLowerCase().indexOf(alias.toLowerCase());
  if (idx === -1) return false;
  // The character immediately after the alias must be end-of-string or non-alphanumeric
  const nextChar = boneName[idx + alias.length];
  return nextChar === undefined || !/[a-zA-Z0-9]/.test(nextChar);
}

// Returns true if `child` is a descendant of `ancestor` within 20 levels.
function isDescendantOf(child, ancestor) {
  let cur = child ? child.parent : null;
  for (let d = 0; d < 20 && cur; d++, cur = cur.parent) {
    if (cur === ancestor) return true;
  }
  return false;
}

function buildTargetDeltas(gestureName) {
  const pose = SIGN_POSES[gestureName] || SIGN_POSES['default'];
  const base = SIGN_POSES['default'];
  const result = {};
  for (const k in base) {
    result[k] = pose[k] ? [...pose[k]] : [...base[k]];
  }
  return result;
}

const AvatarCanvas = ({ gesture = 'default', speedRate = 1.0, width = 480, height = 480, gender = 'male' }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [statusText, setStatusText] = useState('LOADING...');
  const [statusColor, setStatusColor] = useState('var(--accent-cyan)');
  const [modelLoaded, setModelLoaded] = useState(false);

  const ctxRef = useRef({
    scene: null, camera: null, renderer: null,
    model: null, bones: {}, headMesh: null,
    rafId: null, eyeBlinking: false,
    gestureState: 'default',
    targetDeltas: buildTargetDeltas('default'),
    lookAtY: 0.85, baseCamY: 1.05, baseCamZ: 1.85,
  });

  useEffect(() => {
    ctxRef.current.gestureState = gesture;
    ctxRef.current.targetDeltas = buildTargetDeltas(gesture);
  }, [gesture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const THREE = window.THREE;
    if (!THREE) { setStatusText('THREE.JS NOT FOUND'); setStatusColor('var(--accent-red)'); return; }

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.05, 80);
    camera.position.set(0, 0.9, 2.0);
    camera.lookAt(0, 0.6, 0);

    // ── Studio Lighting ───────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x3a3a4a, 0.55));
    const key = new THREE.DirectionalLight(0xfff4e8, 2.8);
    key.position.set(3.5, 5, 3.5); key.castShadow = true;
    key.shadow.mapSize.width = 2048; key.shadow.mapSize.height = 2048;
    key.shadow.bias = -0.0005; key.shadow.radius = 3;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd0e8ff, 1.1); fill.position.set(-4, 3, 2.5); scene.add(fill);
    const rim1 = new THREE.DirectionalLight(0xe8f0ff, 3.0); rim1.position.set(-2.5, 4, -5); scene.add(rim1);
    const rim2 = new THREE.DirectionalLight(0xfff6ee, 2.5); rim2.position.set(2.5, 3, -5); scene.add(rim2);
    const bounce = new THREE.DirectionalLight(0x221108, 0.4); bounce.position.set(0, -4, 1); scene.add(bounce);
    const top = new THREE.DirectionalLight(0xffffff, 0.6); top.position.set(0, 8, 0); scene.add(top);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.32 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.42; floor.receiveShadow = true;
    scene.add(floor);

    // Hologram placeholder
    const placeholder = new THREE.Group();
    const matC = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.18 });
    const matP = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.12 });
    const torus1 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.013, 8, 36), matC);
    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.010, 8, 36), matP);
    const octa   = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), matC);
    [torus1, torus2, octa].forEach(m => { m.rotation.x = Math.PI / 2; m.position.y = 0.55; placeholder.add(m); });
    octa.rotation.x = 0;
    scene.add(placeholder);

    ctxRef.current.scene    = scene;
    ctxRef.current.camera   = camera;
    ctxRef.current.renderer = renderer;
    let isDestroyed = false;

    // ── GLB Load ──────────────────────────────────────────────────────────────
    const loadGLB = () => {
      if (typeof THREE.GLTFLoader === 'undefined') {
        setStatusText('ENGINE LOADING...');
        setTimeout(loadGLB, 1200);
        return;
      }
      const modelPath = gender === 'female' ? '/assets/female.glb' : '/assets/male.glb';
      setStatusText('LOADING AVATAR...');

      const loader = new THREE.GLTFLoader();
      loader.load(modelPath, (gltf) => {
        if (isDestroyed) return;
        scene.remove(placeholder);

        const model = gltf.scene;
        model.position.set(0, -0.42, 0);
        model.scale.set(0.92, 0.92, 0.92);
        scene.add(model);

        // ── Material pass: hide accessories, apply professional look ──────────
        model.traverse((child) => {
          if (!child.isMesh) return;
          const n = (child.name || '').toLowerCase();

          if (
            n.includes('facewear') || n.includes('headwear') ||
            n.includes('helmet')   || n.includes('carnival') ||
            n.includes('visor')    || n.includes('mask')     ||
            n.includes('glasses')  || n.includes('eyewear')
          ) { child.visible = false; return; }

          child.castShadow = true;
          child.receiveShadow = true;

          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (!mat) return;
            if (n.includes('skin') || n.includes('head') || n.includes('face') || n.includes('body') || n.includes('neck')) {
              mat.roughness = 0.55; mat.metalness = 0.01;
              if (mat.emissive) { mat.emissive.setHex(0x180a04); mat.emissiveIntensity = 0.08; }
            } else if (n.includes('eye') || n.includes('cornea') || n.includes('iris')) {
              mat.roughness = 0.02; mat.metalness = 0.8;
            } else if (n.includes('hair') || n.includes('brow') || n.includes('lash')) {
              mat.roughness = 0.9; mat.metalness = 0;
            } else if (n.includes('tooth') || n.includes('teeth')) {
              mat.roughness = 0.28; mat.metalness = 0.02;
            } else if (
              n.includes('outfit_top') || n.includes('outfit_bottom') ||
              n.includes('cloth')      || n.includes('shirt')         ||
              n.includes('jacket')     || n.includes('suit')          ||
              n.includes('top')        || n.includes('bottom')
            ) {
              // Remove texture so color override fully takes effect (not just a tint over cyberpunk texture)
              mat.map = null; mat.normalMap = null; mat.roughnessMap = null; mat.metalnessMap = null;
              mat.color.setHex(0x1a2540);
              mat.roughness = 0.85; mat.metalness = 0.02;
              if (mat.emissive) { mat.emissive.setHex(0x000000); mat.emissiveIntensity = 0; }
            } else if (n.includes('outfit_footwear') || n.includes('shoe') || n.includes('boot') || n.includes('footwear')) {
              mat.map = null; mat.normalMap = null;
              mat.color.setHex(0x111111); mat.roughness = 0.72; mat.metalness = 0.08;
            }
            mat.needsUpdate = true;
          });
        });

        // ── Bone detection ────────────────────────────────────────────────────
        const bones = {};
        const BONE_MAP = {
          // Clavicle / shoulder girdle
          LeftShoulder:  ['LeftShoulder','Left_Shoulder','Shoulder_L','LeftClavicle','Left_Clavicle','Clavicle_L','l_shoulder','l_clavicle','ShoulderL'],
          // Upper arm (humerus)
          LeftArm:       ['LeftArm','Left_Arm','UpperArm_L','LeftUpperArm','Left_UpperArm','upper_arm_l','arm_l'],
          // Forearm (radius + ulna)
          LeftForeArm:   ['LeftForeArm','Left_ForeArm','ForeArm_L','LeftForearm','Left_Forearm','forearm_l','lower_arm_l'],
          // Wrist / hand root — must NOT match LeftHandIndex1 etc. (boneMatchesAlias enforces word boundary)
          LeftHand:      ['LeftHand','Left_Hand','Hand_L','hand_l','wrist_l'],
          RightShoulder: ['RightShoulder','Right_Shoulder','Shoulder_R','RightClavicle','Right_Clavicle','Clavicle_R','r_shoulder','r_clavicle','ShoulderR'],
          RightArm:      ['RightArm','Right_Arm','UpperArm_R','RightUpperArm','Right_UpperArm','upper_arm_r','arm_r'],
          RightForeArm:  ['RightForeArm','Right_ForeArm','ForeArm_R','RightForearm','Right_Forearm','forearm_r','lower_arm_r'],
          RightHand:     ['RightHand','Right_Hand','Hand_R','hand_r','wrist_r'],
          Spine:         ['Spine','spine','Spine_01','spine_01','Spine01'],
          Spine1:        ['Spine1','Spine_1','spine.001','Spine_02','spine_02','Spine02'],
          Spine2:        ['Spine2','Spine_2','spine.002','Spine_03','spine_03','Spine03','UpperChest','upper_chest'],
          Neck:          ['Neck','neck','Neck_01','neck_01'],
          Head:          ['Head','head','Head_01','head_01'],
        };
        const FINGER_MAP = ['Thumb','Index','Middle','Ring','Pinky'];
        let foundBoneCount = 0;
        let headMesh = null;

        model.traverse((child) => {
          if (child.isBone || child.type === 'Bone') {
            const bname = child.name;
            // Store bind quaternion for bind-relative animation
            child.userData.bindQ = child.quaternion.clone();

            for (const [key, aliases] of Object.entries(BONE_MAP)) {
              if (!bones[key]) {
                for (const alias of aliases) {
                  if (boneMatchesAlias(bname, alias)) {
                    bones[key] = child; foundBoneCount++; break;
                  }
                }
              }
            }
            ['Left','Right'].forEach(side => {
              FINGER_MAP.forEach(finger => {
                for (let s = 1; s <= 4; s++) {
                  const key = `${side}Hand${finger}${s}`;
                  if (!bones[key] && bname.includes(key)) { bones[key] = child; foundBoneCount++; }
                }
              });
            });
          }
          if (!headMesh && child.isMesh) {
            const n = (child.name || '').toLowerCase();
            if (n.includes('head') || n.includes('face') || n.includes('avatar')) headMesh = child;
          }
        });

        // Skeleton fallback — skeleton.bones[] may be in non-hierarchical order;
        // boneMatchesAlias enforces word boundaries to prevent LeftHand→LeftHandIndex1 false matches.
        if (foundBoneCount < 4) {
          model.traverse((child) => {
            if (child.isSkinnedMesh && child.skeleton) {
              child.skeleton.bones.forEach((bone) => {
                if (!bone.userData.bindQ) bone.userData.bindQ = bone.quaternion.clone();
                const bname = bone.name;
                for (const [key, aliases] of Object.entries(BONE_MAP)) {
                  if (!bones[key]) {
                    for (const alias of aliases) {
                      if (boneMatchesAlias(bname, alias)) { bones[key] = bone; break; }
                    }
                  }
                }
              });
            }
          });
        }

        // ── Arm-chain hierarchy validation ────────────────────────────────────
        // If a hand bone was incorrectly matched to a finger joint (e.g. LeftHandIndex1),
        // the detected hand will NOT be a descendant of the forearm. Walk the forearm's
        // children to find the real hand root and replace the bad match.
        ['Left', 'Right'].forEach(side => {
          const forearm = bones[`${side}ForeArm`];
          const hand    = bones[`${side}Hand`];
          if (!forearm) return;
          if (hand && isDescendantOf(hand, forearm)) return; // chain is correct

          // Search within forearm subtree for a bone whose name signals "hand/wrist"
          // but is NOT a finger (Thumb/Index/Middle/Ring/Pinky/Digit)
          let correct = null;
          forearm.traverse(b => {
            if (correct || b === forearm) return;
            const bn = b.name.toLowerCase();
            const isHandRoot =
              (bn.includes('hand') || bn.includes('wrist') || bn.endsWith('_h') || bn.endsWith('_w')) &&
              !/thumb|index|middle|ring|pinky|digit|finger/.test(bn);
            if (isHandRoot) {
              correct = b;
              if (!correct.userData.bindQ) correct.userData.bindQ = correct.quaternion.clone();
            }
          });
          if (correct) bones[`${side}Hand`] = correct;
        });

        // ── Enforce Correct Bone Hierarchy ────────────────────────────────────
        // Re-parent bones dynamically maintaining world transforms:
        // Head -> Neck -> Shoulder -> Upper Arm (Arm) -> Forearm -> Hand
        const neck = bones['Neck'];
        const head = bones['Head'];
        if (head && neck && neck.parent !== head) {
          head.attach(neck);
        }
        ['Left', 'Right'].forEach(side => {
          const shoulder = bones[`${side}Shoulder`];
          const arm      = bones[`${side}Arm`];
          const forearm  = bones[`${side}ForeArm`];
          const hand     = bones[`${side}Hand`];
          
          if (neck && shoulder && shoulder.parent !== neck) {
            neck.attach(shoulder);
          }
          if (shoulder && arm && arm.parent !== shoulder) {
            shoulder.attach(arm);
          }
          if (arm && forearm && forearm.parent !== arm) {
            arm.attach(forearm);
          }
          if (forearm && hand && hand.parent !== forearm) {
            forearm.attach(hand);
          }
        });

        // ── Apply default pose immediately (bind-relative) ─────────────────────
        const applyPoseImmediate = (deltas) => {
          for (const [jointName, delta] of Object.entries(deltas)) {
            const bone = bones[jointName];
            if (!bone) continue;
            const bindQ  = bone.userData.bindQ || new THREE.Quaternion();
            const deltaQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(delta[0], delta[1], delta[2]));
            bone.quaternion.copy(bindQ).multiply(deltaQ);
          }
        };
        applyPoseImmediate(buildTargetDeltas('default'));

        // Snap finger joints to relaxed position
        const defaultShape = FINGER_SHAPES['default'];
        ['Left','Right'].forEach((side, si) => {
          const angles = si === 0 ? defaultShape.L : defaultShape.R;
          FINGER_MAP.forEach((fname, fi) => {
            for (let s = 1; s <= 4; s++) {
              const b = bones[`${side}Hand${fname}${s}`];
              if (b) {
                const bindQ  = b.userData.bindQ || new THREE.Quaternion();
                const deltaQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(angles[fi], 0, 0));
                b.quaternion.copy(bindQ).multiply(deltaQ);
              }
            }
          });
        });

        // ── Auto-frame camera to face ──────────────────────────────────────────
        model.updateMatrixWorld(true);
        let lookAtY = 0.85, baseCamY = 1.05, baseCamZ = 1.85;
        if (bones['Head']) {
          const headPos = new THREE.Vector3();
          bones['Head'].getWorldPosition(headPos);
          lookAtY  = headPos.y - 0.02;
          baseCamY = headPos.y + 0.12;
          baseCamZ = Math.max(1.45, headPos.y * 1.05 + 0.35);
        }
        camera.position.set(0, baseCamY, baseCamZ);
        camera.lookAt(0, lookAtY, 0);
        ctxRef.current.lookAtY  = lookAtY;
        ctxRef.current.baseCamY = baseCamY;
        ctxRef.current.baseCamZ = baseCamZ;

        ctxRef.current.model   = model;
        ctxRef.current.bones   = bones;
        ctxRef.current.headMesh = headMesh;
        setModelLoaded(true);
        setStatusColor('var(--accent-green)');
        setStatusText(`PRESENTER READY · ${Object.keys(bones).length} BONES`);
      }, undefined, (err) => {
        console.warn('GLB load error:', err);
        setStatusText('AVATAR OFFLINE · HOLOGRAM MODE');
        setStatusColor('var(--accent-cyan)');
      });
    };

    loadGLB();

    // ── Eye blink ─────────────────────────────────────────────────────────────
    const triggerBlink = () => {
      if (ctxRef.current.eyeBlinking) return;
      const head = ctxRef.current.headMesh;
      if (!head || !head.morphTargetInfluences || !head.morphTargetDictionary) return;
      ctxRef.current.eyeBlinking = true;
      const lIdx = head.morphTargetDictionary['eyeBlinkLeft']  ?? head.morphTargetDictionary['eyeBlink_L'];
      const rIdx = head.morphTargetDictionary['eyeBlinkRight'] ?? head.morphTargetDictionary['eyeBlink_R'];
      const set = (v) => {
        if (lIdx !== undefined) head.morphTargetInfluences[lIdx] = v;
        if (rIdx !== undefined) head.morphTargetInfluences[rIdx] = v;
      };
      set(1);
      setTimeout(() => { set(0); ctxRef.current.eyeBlinking = false; }, 130);
    };

    // ── Render loop ───────────────────────────────────────────────────────────
    const loop = () => {
      if (isDestroyed) return;
      const t       = Date.now() * 0.001;
      const lerpRate = 0.08 * speedRate;
      const model   = ctxRef.current.model;
      const bones   = ctxRef.current.bones;
      const head    = ctxRef.current.headMesh;
      const gs      = ctxRef.current.gestureState;
      const deltas  = ctxRef.current.targetDeltas;

      const breathX = Math.sin(t * 1.6) * 0.014;
      const breathY = Math.cos(t * 1.4) * 0.004;
      const driftX  = Math.sin(t * 0.7) * 0.018;
      const driftY  = Math.cos(t * 0.9) * 0.014;

      if (model) {
        // Apply bind-relative bone rotations
        for (const [jointName, delta] of Object.entries(deltas)) {
          const bone = bones[jointName];
          if (!bone) continue;
          const bindQ = bone.userData.bindQ || new THREE.Quaternion();

          let rx = delta[0], ry = delta[1], rz = delta[2];

          // Idle micro-motion layered on top of delta
          if (jointName === 'Head') {
            if (gs === 'yes')            rx += Math.sin(t * 10) * 0.10;
            else if (gs === 'no')        ry += Math.sin(t * 10) * 0.14;
            else if (gs === 'emergency') { rx += Math.sin(t*13)*0.04; ry += Math.cos(t*13)*0.04; }
            rx += driftX; ry += driftY;
          }
          if (jointName === 'Neck')  { rx += driftX * 0.4; ry += driftY * 0.4; }
          if (jointName === 'Spine' || jointName === 'Spine1' || jointName === 'Spine2') {
            rx += breathX * 0.4; ry += breathY * 0.18;
          }
          if (jointName === 'LeftShoulder' || jointName === 'RightShoulder') rx += breathX * 0.25;

          const deltaQ  = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
          const targetQ = bindQ.clone().multiply(deltaQ);
          bone.quaternion.slerp(targetQ, lerpRate);
        }

        // Finger bends (bind-relative)
        const shape = FINGER_SHAPES[gs] || FINGER_SHAPES['default'];
        const FNAME = ['Thumb','Index','Middle','Ring','Pinky'];
        [['Left', shape.L], ['Right', shape.R]].forEach(([side, angles]) => {
          FNAME.forEach((fname, fi) => {
            const bend = angles[fi];
            for (let s = 1; s <= 4; s++) {
              const b = bones[`${side}Hand${fname}${s}`];
              if (!b) continue;
              const bindQ  = b.userData.bindQ || new THREE.Quaternion();
              const deltaQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(bend, 0, 0));
              b.quaternion.slerp(bindQ.clone().multiply(deltaQ), lerpRate);
            }
          });
        });

        // Morph targets
        if (head && head.morphTargetInfluences && head.morphTargetDictionary) {
          const d = head.morphTargetDictionary;
          const mi = head.morphTargetInfluences;
          const lerp = THREE.MathUtils.lerp;

          const mouthIdx = d['mouthOpen'] ?? d['jawOpen'] ?? d['viseme_O'];
          if (mouthIdx !== undefined) {
            const target = window.speechSynthesis?.speaking
              ? Math.max(0.1, Math.min(1.0, Math.abs(Math.sin(t * 10)) * 0.8)) : 0;
            mi[mouthIdx] = lerp(mi[mouthIdx], target, 0.2);
          }
          const smileL = d['mouthSmileLeft']  ?? d['mouthSmile_L'];
          const smileR = d['mouthSmileRight'] ?? d['mouthSmile_R'];
          const targetSmile = (gs === 'hello' || gs === 'hi' || gs === 'thank_you' || gs === 'good_morning') ? 0.55 : 0;
          if (smileL !== undefined) mi[smileL] = lerp(mi[smileL], targetSmile, 0.06);
          if (smileR !== undefined) mi[smileR] = lerp(mi[smileR], targetSmile, 0.06);
          const browUp = d['browInnerUp'] ?? d['browOuterUp_L'];
          const targetBrow = (gs === 'help' || gs === 'emergency') ? 0.6 : 0;
          if (browUp !== undefined) mi[browUp] = lerp(mi[browUp], targetBrow, 0.06);
          if (Math.random() < 0.016 && !ctxRef.current.eyeBlinking) triggerBlink();
        }
      } else {
        // Hologram idle
        placeholder.children.forEach((m, i) => {
          if (i === 0) { m.rotation.z += 0.012; m.position.y = 0.55 + Math.sin(t * 2.2) * 0.035; }
          if (i === 1) { m.rotation.z -= 0.018; m.position.y = 0.55 - Math.sin(t * 2.2) * 0.02; }
          if (i === 2) { m.rotation.x += 0.012; m.rotation.y += 0.018; m.scale.setScalar(1 + Math.sin(t * 4) * 0.07); }
        });
      }

      // Camera push-in on gesture
      const baseCamZ  = ctxRef.current.baseCamZ  || 1.85;
      const baseCamY  = ctxRef.current.baseCamY  || 1.05;
      const lookAtY   = ctxRef.current.lookAtY   || 0.85;
      const camTargetZ = gs !== 'default' ? baseCamZ - 0.22 : baseCamZ;
      const camTargetY = gs !== 'default' ? baseCamY - 0.04 : baseCamY;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, lerpRate);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, lerpRate);
      camera.lookAt(0, lookAtY, 0);

      renderer.render(scene, camera);
      ctxRef.current.rafId = requestAnimationFrame(loop);
    };

    ctxRef.current.rafId = requestAnimationFrame(loop);

    return () => {
      isDestroyed = true;
      if (ctxRef.current.rafId) cancelAnimationFrame(ctxRef.current.rafId);
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => m?.dispose());
      });
      renderer.dispose();
    };
  }, [width, height, speedRate, gender]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{
        position: 'absolute', bottom: '10px', left: '10px',
        fontSize: '10px', fontFamily: 'monospace', color: statusColor,
        background: 'rgba(4,4,10,0.72)', padding: '4px 9px', borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none',
        textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.4px',
      }}>
        <span style={{
          display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
          background: statusColor, marginRight: '5px', verticalAlign: 'middle',
        }} />
        {statusText}
      </div>
    </div>
  );
};

export default AvatarCanvas;
