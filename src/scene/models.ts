import * as THREE from 'three';
import { HubId, LEARNING_HUBS } from '../data/learningData';
import { ProceduralTextureSet } from './textures';

export interface AnimatedCampusHandles {
  hubGroups: Record<HubId, THREE.Group>;
  hitProxies: THREE.Mesh[];
  mediaRings: THREE.Group[];
  workshopGyro: THREE.Group;
  shuttlePods: {
    group: THREE.Group;
    phaseOffset: number;
  }[];
  shuttleTrackCurve: THREE.CatmullRomCurve3;
  pathwayCurves: THREE.CatmullRomCurve3[];
  knowledgePulses: THREE.InstancedMesh;
  knowledgePulseCount: number;
  selectionRing: THREE.Mesh;
  hoverRing: THREE.Mesh;
  emissiveMaterials: THREE.MeshStandardMaterial[];
  explodableParts: {
    object: THREE.Object3D;
    baseY: number;
    explodeY: number;
  }[];
  dispose: () => void;
}

function createContactShadow(
  mat: THREE.MeshBasicMaterial,
  width: number,
  depth: number,
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, depth);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.025;
  mesh.renderOrder = 1;
  return mesh;
}

function registerExplodable(
  list: AnimatedCampusHandles['explodableParts'],
  object: THREE.Object3D,
  explodeY: number,
) {
  list.push({
    object,
    baseY: object.position.y,
    explodeY,
  });
}

function createExtrudedRoundedRect(
  w: number,
  d: number,
  h: number,
  radius: number,
  bevelSize = 0.06,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hd = d / 2;
  const r = Math.min(radius, hw * 0.45, hd * 0.45);
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function buildCampusScene(
  scene: THREE.Scene,
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): AnimatedCampusHandles {
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Calibrated PBR Material Library (roughness delta >= 0.25 between adjacent parts)
  const mats = {
    stonePlinth: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.88,
        metalness: 0.06,
      }),
    ),
    brushedAluminum: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xcbd5e1,
        roughness: 0.24,
        metalness: 0.88,
        clearcoat: 0.25,
      }),
    ),
    darkAnodized: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.7,
      }),
    ),
    architecturalGlass: trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        roughness: 0.08,
        metalness: 0.1,
        transmission: isSoftwareGl ? 0 : 0.84,
        transparent: true,
        opacity: isSoftwareGl ? 0.4 : 0.92,
        ior: 1.52,
        thickness: 0.8,
        clearcoat: 1.0,
        depthWrite: false,
      }),
    ),
    whiteCeramic: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.32,
        metalness: 0.42,
      }),
    ),
    warmBrass: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.22,
        metalness: 0.9,
      }),
    ),
    assessmentCanopyMat: trackMat(
      new THREE.MeshStandardMaterial({
        map: textures.assessmentGrid,
        roughness: 0.2,
        metalness: 0.45,
      }),
    ),
    stemSkin: trackMat(
      new THREE.MeshStandardMaterial({
        map: textures.stemFacade,
        emissive: new THREE.Color(0x38bdf8),
        emissiveMap: textures.stemEmissive,
        emissiveIntensity: 0.65,
        roughness: 0.22,
        metalness: 0.6,
      }),
    ),
    acousticPanel: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        bumpMap: textures.woodLouverBump,
        bumpScale: 0.08,
        roughness: 0.62,
        metalness: 0.32,
      }),
    ),
    accentSky: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: new THREE.Color(0x0ea5e9),
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.3,
      }),
    ),
    accentEmerald: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: new THREE.Color(0x16a34a),
        emissiveIntensity: 0.85,
        roughness: 0.22,
        metalness: 0.22,
      }),
    ),
    accentAmber: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: new THREE.Color(0xd97706),
        emissiveIntensity: 0.85,
        roughness: 0.24,
        metalness: 0.2,
      }),
    ),
    accentCyan: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: new THREE.Color(0x0891b2),
        emissiveIntensity: 0.85,
        roughness: 0.22,
        metalness: 0.25,
      }),
    ),
    accentViolet: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        emissive: new THREE.Color(0x7c3aed),
        emissiveIntensity: 0.78,
        roughness: 0.24,
        metalness: 0.25,
      }),
    ),
    rubberWheel: trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.92,
        metalness: 0.04,
      }),
    ),
    contactShadowMat: trackMat(
      new THREE.MeshBasicMaterial({
        map: textures.contactShadow,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    ),
  };

  const emissiveMaterials: THREE.MeshStandardMaterial[] = [
    mats.stemSkin,
    mats.accentSky,
    mats.accentEmerald,
    mats.accentAmber,
    mats.accentCyan,
    mats.accentViolet,
  ];

  const explodableParts: AnimatedCampusHandles['explodableParts'] = [];
  const hitProxies: THREE.Mesh[] = [];
  const mediaRings: THREE.Group[] = [];
  const shuttlePods: AnimatedCampusHandles['shuttlePods'] = [];

  // =========================================================================
  // 0. GROUND CAMPUS PLAZA & HORIZON LANDSCAPE
  // =========================================================================
  const outerGround = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(95, 64)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.94,
        metalness: 0.05,
      }),
    ),
  );
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.position.y = -0.06;
  outerGround.receiveShadow = true;
  scene.add(outerGround);

  const campusPad = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(16.8, 17.4, 0.22, 64)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: textures.groundColor,
        bumpMap: textures.groundBump,
        bumpScale: 0.04,
        roughness: 0.78,
        metalness: 0.12,
      }),
    ),
  );
  campusPad.position.y = -0.11;
  campusPad.receiveShadow = true;
  scene.add(campusPad);

  const curb = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(16.95, 0.14, 12, 80)),
    mats.brushedAluminum,
  );
  curb.rotation.x = Math.PI / 2;
  curb.position.y = 0.01;
  scene.add(curb);

  // Instanced Campus Trees with ±15% natural scale & tint variation
  const treeCount = 34;
  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.16, 0.95, 8));
  const trunkMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, metalness: 0.05 }),
  );
  const crownGeo = trackGeo(new THREE.ConeGeometry(0.76, 2.35, 9));
  const crownMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e3a34, roughness: 0.82, metalness: 0.04 }),
  );

  const trunkInstances = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const crownInstances = new THREE.InstancedMesh(crownGeo, crownMat, treeCount);
  trunkInstances.castShadow = !isSoftwareGl;
  crownInstances.castShadow = !isSoftwareGl;
  crownInstances.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const tintColor = new THREE.Color();
  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + (i % 3) * 0.09;
    const radius = 18.8 + ((i * 17) % 9) * 0.95;
    const scale = 0.85 + ((i * 23) % 30) / 100;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    dummy.position.set(x, 0.45 * scale - 0.05, z);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.set(0, angle, 0);
    dummy.updateMatrix();
    trunkInstances.setMatrixAt(i, dummy.matrix);

    dummy.position.set(x, 1.85 * scale - 0.05, z);
    dummy.updateMatrix();
    crownInstances.setMatrixAt(i, dummy.matrix);

    tintColor.setHSL(0.44 + ((i % 5) - 2) * 0.015, 0.34, 0.19 + (i % 4) * 0.025);
    crownInstances.setColorAt(i, tintColor);
  }
  trunkInstances.instanceMatrix.needsUpdate = true;
  crownInstances.instanceMatrix.needsUpdate = true;
  if (crownInstances.instanceColor) crownInstances.instanceColor.needsUpdate = true;
  trunkInstances.computeBoundingSphere();
  crownInstances.computeBoundingSphere();
  scene.add(trunkInstances, crownInstances);

  const registerHitProxy = (
    hubId: HubId,
    parent: THREE.Group,
    w: number,
    h: number,
    d: number,
    offsetY = h / 2,
  ) => {
    const proxy = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, h, d)),
      trackMat(new THREE.MeshBasicMaterial({ visible: false })),
    );
    proxy.position.set(0, offsetY, 0);
    proxy.layers.set(1);
    proxy.userData.hubId = hubId;
    parent.add(proxy);
    hitProxies.push(proxy);
  };

  // =========================================================================
  // 1. DATA & STEM HUB (9-part architectural glass hall with 3D Data Bar Core)
  // =========================================================================
  const stemGroup = new THREE.Group();
  stemGroup.position.set(...LEARNING_HUBS[0].position);
  stemGroup.add(createContactShadow(mats.contactShadowMat, 7.6, 6.2));

  const stemPlinth = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(5.6, 4.4, 0.38, 0.32, 0.05)),
    mats.stonePlinth,
  );
  stemPlinth.castShadow = true;
  stemPlinth.receiveShadow = true;
  stemGroup.add(stemPlinth);

  // Interior Illuminated 3D Learning Analytics Bar Columns (revealed in Exploded View!)
  const stemDataCore = new THREE.Group();
  stemDataCore.position.y = 0.42;
  const barHeights = [1.85, 2.55, 3.15, 2.8];
  const barMats = [mats.accentEmerald, mats.accentSky, mats.accentCyan, mats.accentAmber];
  barHeights.forEach((bh, idx) => {
    const bx = -1.35 + idx * 0.9;
    const basePedestal = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.66, 0.22, 2.2)),
      mats.darkAnodized,
    );
    basePedestal.position.set(bx, 0.11, 0);
    stemDataCore.add(basePedestal);

    const bar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.46, bh, 0.46)),
      barMats[idx],
    );
    bar.position.set(bx, 0.22 + bh / 2, 0);
    stemDataCore.add(bar);
  });
  stemGroup.add(stemDataCore);

  // Main Curtain Wall Atrium
  const stemBody = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(4.6, 3.4, 3.6, 0.24, 0.04)),
    mats.stemSkin,
  );
  stemBody.position.y = 0.42;
  stemBody.castShadow = true;
  stemBody.receiveShadow = true;
  stemGroup.add(stemBody);
  registerExplodable(explodableParts, stemBody, 1.65);

  const stemGlassShell = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.92, 3.25, 3.72)),
    mats.architecturalGlass,
  );
  stemGlassShell.position.y = 2.25;
  stemGlassShell.renderOrder = 3;
  stemGroup.add(stemGlassShell);
  registerExplodable(explodableParts, stemGlassShell, 2.4);

  const mullionGeo = trackGeo(new THREE.BoxGeometry(0.24, 3.85, 0.24));
  const mullionOffsets: [number, number][] = [
    [-2.42, -1.82],
    [2.42, -1.82],
    [-2.42, 1.82],
    [2.42, 1.82],
  ];
  for (const [mx, mz] of mullionOffsets) {
    const m = new THREE.Mesh(mullionGeo, mats.brushedAluminum);
    m.position.set(mx, 2.32, mz);
    m.castShadow = true;
    stemGroup.add(m);
  }

  const louverGroup = new THREE.Group();
  const louverGeo = trackGeo(new THREE.BoxGeometry(5.12, 0.07, 3.92));
  for (let ly = 1.25; ly <= 3.55; ly += 0.76) {
    const louver = new THREE.Mesh(louverGeo, mats.brushedAluminum);
    louver.position.y = ly;
    louverGroup.add(louver);
  }
  stemGroup.add(louverGroup);
  registerExplodable(explodableParts, louverGroup, 2.55);

  // Rooftop Research Skylight & Observatory Dome
  const stemRoofGroup = new THREE.Group();
  stemRoofGroup.position.y = 4.15;
  const roofCap = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(5.0, 3.8, 0.28, 0.22, 0.05)),
    mats.darkAnodized,
  );
  roofCap.castShadow = true;
  stemRoofGroup.add(roofCap);

  const observatoryDome = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(1.1, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2)),
    mats.architecturalGlass,
  );
  observatoryDome.position.set(-0.75, 0.3, 0);
  observatoryDome.renderOrder = 4;
  stemRoofGroup.add(observatoryDome);

  const domeBase = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.16, 1.22, 0.22, 22)),
    mats.brushedAluminum,
  );
  domeBase.position.set(-0.75, 0.34, 0);
  stemRoofGroup.add(domeBase);

  const spire = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.05, 0.11, 2.0, 10)),
    mats.brushedAluminum,
  );
  spire.position.set(1.6, 1.28, 0.9);
  stemRoofGroup.add(spire);

  const spireBeacon = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.15, 14, 14)),
    mats.accentSky,
  );
  spireBeacon.position.set(1.6, 2.34, 0.9);
  stemRoofGroup.add(spireBeacon);

  stemGroup.add(stemRoofGroup);
  registerExplodable(explodableParts, stemRoofGroup, 3.4);
  registerHitProxy('stem', stemGroup, 5.8, 6.4, 4.6, 3.2);
  scene.add(stemGroup);

  // =========================================================================
  // 2. DIGITAL LMS & MEDIA STUDIO (2 composite broadcast towers + rotating rings)
  // =========================================================================
  const mediaGroup = new THREE.Group();
  mediaGroup.position.set(...LEARNING_HUBS[1].position);

  const towerProfile = [
    new THREE.Vector2(0.72, 0),
    new THREE.Vector2(0.64, 0.6),
    new THREE.Vector2(0.46, 3.2),
    new THREE.Vector2(0.38, 5.4),
    new THREE.Vector2(0.48, 5.75),
  ];
  const mediaTowerGeo = trackGeo(new THREE.LatheGeometry(towerProfile, 20));
  const mediaPadGeo = trackGeo(new THREE.CylinderGeometry(1.5, 1.65, 0.34, 8));
  const studioRingGeo = trackGeo(new THREE.TorusGeometry(1.38, 0.08, 12, 32));
  const screenArcGeo = trackGeo(new THREE.CylinderGeometry(1.22, 1.22, 0.65, 16, 1, true, 0, Math.PI * 1.1));

  const towerOffsets: [number, number, number][] = [
    [-1.65, 0, -1.1],
    [2.1, 0, 1.45],
  ];

  towerOffsets.forEach(([tx, , tz], idx) => {
    const unit = new THREE.Group();
    unit.position.set(tx, 0, tz);
    unit.add(createContactShadow(mats.contactShadowMat, 3.8, 3.8));

    const pad = new THREE.Mesh(mediaPadGeo, mats.stonePlinth);
    pad.position.y = 0.17;
    pad.castShadow = true;
    pad.receiveShadow = true;
    unit.add(pad);

    const collar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.84, 0.94, 0.28, 16)),
      mats.darkAnodized,
    );
    collar.position.y = 0.45;
    unit.add(collar);

    const mast = new THREE.Mesh(mediaTowerGeo, mats.whiteCeramic);
    mast.position.y = 0.34;
    mast.castShadow = true;
    unit.add(mast);

    // Upper broadcast crown + rotating telemetry ring
    const crownGroup = new THREE.Group();
    crownGroup.position.y = 5.95;

    const studioPod = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.74, 0.62, 0.95, 16)),
      mats.darkAnodized,
    );
    studioPod.castShadow = true;
    crownGroup.add(studioPod);

    const glowingBand = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.78, 0.78, 0.24, 16)),
      mats.accentEmerald,
    );
    crownGroup.add(glowingBand);

    const beaconCap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.24, 16, 16)),
      mats.accentEmerald,
    );
    beaconCap.position.y = 0.85;
    crownGroup.add(beaconCap);

    // Rotating orbital broadcast ring + curved display panels
    const ringAssembly = new THREE.Group();
    ringAssembly.rotation.y = idx * 1.4;
    const outerRing = new THREE.Mesh(studioRingGeo, mats.brushedAluminum);
    outerRing.rotation.x = Math.PI / 2;
    ringAssembly.add(outerRing);

    const screenArc = new THREE.Mesh(screenArcGeo, mats.architecturalGlass);
    screenArc.renderOrder = 3;
    ringAssembly.add(screenArc);

    for (let n = 0; n < 3; n++) {
      const a = (n * Math.PI * 2) / 3;
      const node = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.22, 0.22, 0.22)),
        mats.accentEmerald,
      );
      node.position.set(Math.cos(a) * 1.38, 0, Math.sin(a) * 1.38);
      ringAssembly.add(node);
    }

    crownGroup.add(ringAssembly);
    unit.add(crownGroup);
    registerExplodable(explodableParts, crownGroup, 2.1);
    mediaRings.push(ringAssembly);
    mediaGroup.add(unit);
  });

  registerHitProxy('media', mediaGroup, 7.6, 8.6, 6.2, 4.3);
  scene.add(mediaGroup);

  // =========================================================================
  // 3. DIGITAL LIBRARY & ARCHIVE (8-part terraced vaults + golden knowledge stacks)
  // =========================================================================
  const libraryGroup = new THREE.Group();
  libraryGroup.position.set(...LEARNING_HUBS[2].position);
  libraryGroup.add(createContactShadow(mats.contactShadowMat, 7.2, 5.4));

  const libPad = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(6.2, 4.4, 0.28, 0.24, 0.04)),
    mats.stonePlinth,
  );
  libPad.receiveShadow = true;
  libraryGroup.add(libPad);

  const vaultBodyGeo = trackGeo(new THREE.BoxGeometry(1.58, 1.65, 2.85));
  const vaultRoofGeo = trackGeo(new THREE.BoxGeometry(1.72, 0.2, 3.0));
  const bookStackGeo = trackGeo(new THREE.BoxGeometry(1.24, 1.22, 2.38));

  for (let i = 0; i < 3; i++) {
    const vx = -1.9 + i * 1.9;
    // Warm glowing interior archive stacks (visible on Exploded View)
    const stackCore = new THREE.Mesh(bookStackGeo, mats.warmBrass);
    stackCore.position.set(vx, 0.92, -0.4);
    libraryGroup.add(stackCore);

    const vaultShell = new THREE.Mesh(vaultBodyGeo, mats.acousticPanel);
    vaultShell.position.set(vx, 1.12, -0.4);
    vaultShell.castShadow = true;
    vaultShell.receiveShadow = true;
    libraryGroup.add(vaultShell);
    registerExplodable(explodableParts, vaultShell, 1.15);

    const vaultRoof = new THREE.Mesh(vaultRoofGeo, mats.darkAnodized);
    vaultRoof.position.set(vx, 2.04, -0.4);
    vaultRoof.castShadow = true;
    libraryGroup.add(vaultRoof);
    registerExplodable(explodableParts, vaultRoof, 2.25);

    const readingLight = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.2, 0.14, 0.08)),
      mats.accentAmber,
    );
    readingLight.position.set(vx, 1.64, 1.03);
    libraryGroup.add(readingLight);
    registerExplodable(explodableParts, readingLight, 1.15);
  }

  // Front reading amphitheater benches & curved brass skybridge conduit
  for (const bx of [-1.25, 1.25]) {
    const kiosk = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.45, 0.52, 0.95, 16)),
      mats.whiteCeramic,
    );
    kiosk.position.set(bx, 0.76, 1.55);
    kiosk.castShadow = true;
    libraryGroup.add(kiosk);

    const lamp = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.24, 0.34, 0.26, 14)),
      mats.accentAmber,
    );
    lamp.position.set(bx, 1.36, 1.55);
    libraryGroup.add(lamp);
  }

  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.9, 1.95, 0.8),
    new THREE.Vector3(-1.1, 2.22, 1.55),
    new THREE.Vector3(0, 2.28, 1.55),
    new THREE.Vector3(1.1, 2.22, 1.55),
    new THREE.Vector3(1.9, 1.95, 0.8),
  ]);
  const archMesh = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(archCurve, 28, 0.075, 10, false)),
    mats.warmBrass,
  );
  libraryGroup.add(archMesh);
  registerExplodable(explodableParts, archMesh, 1.7);

  registerHitProxy('library', libraryGroup, 6.6, 3.2, 4.8, 1.6);
  scene.add(libraryGroup);

  // =========================================================================
  // 4. ASSESSMENT & COMPETENCY PAVILION (7-part angled matrix canopies + kiosk)
  // =========================================================================
  const assessmentGroup = new THREE.Group();
  assessmentGroup.position.set(...LEARNING_HUBS[3].position);
  assessmentGroup.add(createContactShadow(mats.contactShadowMat, 7.6, 5.8));

  const assessPad = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(6.8, 4.8, 0.22, 0.22, 0.04)),
    mats.stonePlinth,
  );
  assessPad.receiveShadow = true;
  assessmentGroup.add(assessPad);

  const canopyFrameGeo = trackGeo(new THREE.BoxGeometry(1.78, 0.1, 1.24));
  const canopyFaceGeo = trackGeo(new THREE.PlaneGeometry(1.66, 1.12));
  const columnGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.07, 0.96, 8));

  const canopyDeck = new THREE.Group();
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const px = -2.05 + col * 2.05;
      const pz = -1.05 + row * 2.15;

      const colL = new THREE.Mesh(columnGeo, mats.brushedAluminum);
      colL.position.set(px - 0.52, 0.58, pz);
      assessmentGroup.add(colL);

      const colR = new THREE.Mesh(columnGeo, mats.brushedAluminum);
      colR.position.set(px + 0.52, 0.58, pz);
      assessmentGroup.add(colR);

      const holder = new THREE.Group();
      holder.position.set(px, 1.1, pz);
      holder.rotation.x = 0.34;

      const frame = new THREE.Mesh(canopyFrameGeo, mats.brushedAluminum);
      frame.castShadow = true;
      frame.receiveShadow = true;
      holder.add(frame);

      const matrixFace = new THREE.Mesh(canopyFaceGeo, mats.assessmentCanopyMat);
      matrixFace.rotation.x = -Math.PI / 2;
      matrixFace.position.y = 0.055;
      holder.add(matrixFace);

      canopyDeck.add(holder);
    }
  }
  assessmentGroup.add(canopyDeck);
  registerExplodable(explodableParts, canopyDeck, 1.5);

  // Analytics Proctoring Kiosk on Eastern Edge
  const kioskBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.72, 1.35, 1.05)),
    mats.whiteCeramic,
  );
  kioskBody.position.set(2.9, 0.88, 0);
  kioskBody.castShadow = true;
  assessmentGroup.add(kioskBody);

  const kioskAlertStrip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.76, 0.16, 1.09)),
    mats.accentAmber,
  );
  kioskAlertStrip.position.set(2.9, 1.44, 0);
  assessmentGroup.add(kioskAlertStrip);

  registerHitProxy('assessment', assessmentGroup, 7.2, 2.5, 5.2, 1.25);
  scene.add(assessmentGroup);

  // =========================================================================
  // 5. PROJECT & LAB DOME (8-part Lathe parabolic dome + gyro calibration ring)
  // =========================================================================
  const workshopGroup = new THREE.Group();
  workshopGroup.position.set(...LEARNING_HUBS[4].position);
  workshopGroup.add(createContactShadow(mats.contactShadowMat, 6.8, 5.4));

  const workPad = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(6.0, 4.4, 0.28, 0.28, 0.04)),
    mats.stonePlinth,
  );
  workPad.receiveShadow = true;
  workshopGroup.add(workPad);

  // Interior workshop stage visible when dome lifts
  const stageRing = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.55, 1.65, 0.45, 24)),
    mats.darkAnodized,
  );
  stageRing.position.set(-0.85, 0.5, 0);
  workshopGroup.add(stageRing);

  const stageCore = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.95, 1.1, 0.72, 16)),
    mats.accentCyan,
  );
  stageCore.position.set(-0.85, 0.82, 0);
  workshopGroup.add(stageCore);

  // Sculpted Lathe Parabolic Innovation Dome
  const domeProfile: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const y = t * 3.1;
    const r = 1.72 * Math.cos(t * Math.PI * 0.43) + 0.12;
    domeProfile.push(new THREE.Vector2(r, y));
  }
  const labDome = new THREE.Mesh(
    trackGeo(new THREE.LatheGeometry(domeProfile, 28)),
    mats.whiteCeramic,
  );
  labDome.position.set(-0.85, 0.58, 0);
  labDome.castShadow = true;
  labDome.receiveShadow = true;
  workshopGroup.add(labDome);
  registerExplodable(explodableParts, labDome, 1.65);

  const oculusGlass = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.65, 0.85, 0.26, 20)),
    mats.architecturalGlass,
  );
  oculusGlass.position.set(-0.85, 3.72, 0);
  oculusGlass.renderOrder = 4;
  workshopGroup.add(oculusGlass);
  registerExplodable(explodableParts, oculusGlass, 2.35);

  // Rotating Innovation Calibration Gyro Ring
  const workshopGyro = new THREE.Group();
  workshopGyro.position.set(-0.85, 3.78, 0);
  const gyroTorus = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(1.15, 0.085, 12, 32)),
    mats.accentCyan,
  );
  gyroTorus.rotation.x = Math.PI / 2;
  workshopGyro.add(gyroTorus);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const fin = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.14, 0.12)),
      mats.brushedAluminum,
    );
    fin.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15);
    fin.rotation.y = -a;
    workshopGyro.add(fin);
  }
  workshopGroup.add(workshopGyro);
  registerExplodable(explodableParts, workshopGyro, 2.8);

  // Adjacent Cylindrical Prototyping Studio
  const protoCylinder = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.92, 0.92, 2.15, 22)),
    mats.brushedAluminum,
  );
  protoCylinder.position.set(1.75, 1.36, 0.2);
  protoCylinder.castShadow = true;
  workshopGroup.add(protoCylinder);

  const protoCap = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.92, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
    mats.darkAnodized,
  );
  protoCap.position.set(1.75, 2.43, 0.2);
  workshopGroup.add(protoCap);
  registerExplodable(explodableParts, protoCap, 1.35);

  const labBridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.55, 1.1, 0.2),
    new THREE.Vector3(0.9, 1.65, 0.2),
    new THREE.Vector3(1.2, 1.65, 0.2),
    new THREE.Vector3(1.48, 1.1, 0.2),
  ]);
  const labBridge = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(labBridgeCurve, 20, 0.11, 10, false)),
    mats.accentCyan,
  );
  workshopGroup.add(labBridge);

  registerHitProxy('workshop', workshopGroup, 6.4, 4.8, 4.8, 2.4);
  scene.add(workshopGroup);

  // =========================================================================
  // 6. STUDENT SUCCESS & ADVISING HUB (9-part commons + animated campus shuttles)
  // =========================================================================
  const advisingGroup = new THREE.Group();
  advisingGroup.position.set(...LEARNING_HUBS[5].position);
  advisingGroup.add(createContactShadow(mats.contactShadowMat, 7.2, 5.2));

  const advPad = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(6.2, 4.4, 0.22, 0.22, 0.04)),
    mats.stonePlinth,
  );
  advPad.receiveShadow = true;
  advisingGroup.add(advPad);

  const commonsBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.8, 1.9, 2.45)),
    mats.acousticPanel,
  );
  commonsBody.position.set(-0.9, 1.18, -0.45);
  commonsBody.castShadow = true;
  commonsBody.receiveShadow = true;
  advisingGroup.add(commonsBody);

  const clerestory = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.88, 0.36, 2.52)),
    mats.accentViolet,
  );
  clerestory.position.set(-0.9, 1.86, -0.45);
  advisingGroup.add(clerestory);

  const commonsRoof = new THREE.Group();
  commonsRoof.position.set(-0.2, 2.24, -0.45);
  const commonsRoofDeck = new THREE.Mesh(
    trackGeo(createExtrudedRoundedRect(5.5, 3.05, 0.18, 0.18, 0.04)),
    mats.darkAnodized,
  );
  commonsRoofDeck.castShadow = true;
  commonsRoof.add(commonsRoofDeck);
  advisingGroup.add(commonsRoof);
  registerExplodable(explodableParts, commonsRoof, 1.75);

  // Campus Welcome Pergola Arch
  const archPillarGeo = trackGeo(new THREE.BoxGeometry(0.18, 2.25, 0.18));
  for (const gz of [-1.45, 0.55]) {
    const pillar = new THREE.Mesh(archPillarGeo, mats.brushedAluminum);
    pillar.position.set(2.15, 1.32, gz);
    pillar.castShadow = true;
    advisingGroup.add(pillar);
  }
  const pergolaBeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.22, 2.35)),
    mats.accentViolet,
  );
  pergolaBeam.position.set(2.15, 2.36, -0.45);
  advisingGroup.add(pergolaBeam);

  // Autonomous Campus Shuttle Loop
  const shuttleTrackCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-2.45, 0.26, 1.55),
      new THREE.Vector3(2.35, 0.26, 1.55),
      new THREE.Vector3(2.35, 0.26, -1.35),
      new THREE.Vector3(1.45, 0.26, -1.35),
      new THREE.Vector3(1.45, 0.26, 1.05),
      new THREE.Vector3(-2.45, 0.26, 1.05),
    ],
    true,
  );
  const trackRail = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(shuttleTrackCurve, 64, 0.038, 6, true)),
    mats.brushedAluminum,
  );
  advisingGroup.add(trackRail);

  const podChassisGeo = trackGeo(new THREE.BoxGeometry(0.66, 0.18, 0.42));
  const podCabinGeo = trackGeo(new THREE.BoxGeometry(0.52, 0.28, 0.36));
  const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12));
  wheelGeo.rotateX(Math.PI / 2);

  for (let v = 0; v < 2; v++) {
    const pod = new THREE.Group();
    const chassis = new THREE.Mesh(podChassisGeo, mats.darkAnodized);
    chassis.position.y = 0.14;
    chassis.castShadow = true;
    pod.add(chassis);

    const cabin = new THREE.Mesh(
      podCabinGeo,
      v === 0 ? mats.whiteCeramic : mats.accentViolet,
    );
    cabin.position.y = 0.35;
    pod.add(cabin);

    const lightBar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.05, 0.08, 0.26)),
      mats.accentSky,
    );
    lightBar.position.set(0.33, 0.16, 0);
    pod.add(lightBar);

    const wheelPos: [number, number][] = [
      [-0.2, -0.22],
      [0.2, -0.22],
      [-0.2, 0.22],
      [0.2, 0.22],
    ];
    for (const [wx, wz] of wheelPos) {
      const wheel = new THREE.Mesh(wheelGeo, mats.rubberWheel);
      wheel.position.set(wx, 0.08, wz);
      pod.add(wheel);
    }

    advisingGroup.add(pod);
    shuttlePods.push({ group: pod, phaseOffset: v * 0.5 });
  }

  registerHitProxy('advising', advisingGroup, 6.8, 3.0, 4.8, 1.5);
  scene.add(advisingGroup);

  // =========================================================================
  // 7. LEARNING DATA FLOW PATHWAYS & INSTANCED ENGAGEMENT PULSES
  // =========================================================================
  const pathwayCurves: THREE.CatmullRomCurve3[] = [
    // Media -> Library
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.2, 0.16, -4.4),
      new THREE.Vector3(-7.6, 0.16, 0.2),
      new THREE.Vector3(-6.5, 0.16, 3.0),
    ]),
    // Assessment -> Library
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.6, 0.16, 5.2),
      new THREE.Vector3(0.4, 0.16, 4.2),
      new THREE.Vector3(-4.2, 0.16, 4.6),
    ]),
    // Library -> STEM Core
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.8, 0.16, 3.0),
      new THREE.Vector3(-2.8, 0.16, 0.5),
      new THREE.Vector3(-1.4, 0.16, -1.2),
    ]),
    // STEM Core -> Workshop Dome
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.4, 0.16, -2.5),
      new THREE.Vector3(5.0, 0.16, -3.5),
      new THREE.Vector3(6.4, 0.16, -4.4),
    ]),
    // STEM Core -> Advising Commons
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.16, -0.4),
      new THREE.Vector3(0.2, 0.16, 3.0),
      new THREE.Vector3(0.4, 0.16, 5.8),
    ]),
  ];

  const pathwayMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.42,
      metalness: 0.72,
    }),
  );

  for (const curve of pathwayCurves) {
    const pipe = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(curve, 28, 0.085, 8, false)),
      pathwayMat,
    );
    scene.add(pipe);
  }

  const knowledgePulseCount = pathwayCurves.length * 6;
  const knowledgePulses = new THREE.InstancedMesh(
    trackGeo(new THREE.SphereGeometry(0.145, 10, 10)),
    trackMat(new THREE.MeshBasicMaterial({ color: 0x38bdf8 })),
    knowledgePulseCount,
  );
  knowledgePulses.frustumCulled = false;
  scene.add(knowledgePulses);

  // =========================================================================
  // 8. SELECTION & HOVER PRECISION RINGS
  // =========================================================================
  const selectionRing = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(3.4, 3.68, 48)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    ),
  );
  selectionRing.rotation.x = -Math.PI / 2;
  selectionRing.position.y = 0.05;
  selectionRing.visible = false;
  scene.add(selectionRing);

  const hoverRing = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(3.65, 3.82, 48)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    ),
  );
  hoverRing.rotation.x = -Math.PI / 2;
  hoverRing.position.y = 0.055;
  hoverRing.visible = false;
  scene.add(hoverRing);

  const hubGroups: Record<HubId, THREE.Group> = {
    stem: stemGroup,
    media: mediaGroup,
    library: libraryGroup,
    assessment: assessmentGroup,
    workshop: workshopGroup,
    advising: advisingGroup,
  };

  return {
    hubGroups,
    hitProxies,
    mediaRings,
    workshopGyro,
    shuttlePods,
    shuttleTrackCurve,
    pathwayCurves,
    knowledgePulses,
    knowledgePulseCount,
    selectionRing,
    hoverRing,
    emissiveMaterials,
    explodableParts,
    dispose: () => {
      for (const d of disposables) {
        d.dispose();
      }
    },
  };
}
