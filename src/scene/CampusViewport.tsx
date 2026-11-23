import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {
  HUB_BY_ID,
  HubId,
  OVERVIEW_CAMERA,
  StudyPeriod,
} from '../data/learningData';
import { buildCampusScene } from './models';
import { createProceduralTextures } from './textures';

export interface CampusViewportProps {
  selectedHub: HubId | null;
  onSelectHub: (hub: HubId | null) => void;
  studyPeriod: StudyPeriod;
  explodeAmount: number;
  simSpeed: number;
  resetCameraNonce: number;
}

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _targetSky = new THREE.Color();
const _targetKeyColor = new THREE.Color();
const _targetHemiSky = new THREE.Color();
const _targetHemiGround = new THREE.Color();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _pulseColor = new THREE.Color();

interface MoodPalette {
  sky: number;
  fogDensity: number;
  keyColor: number;
  keyIntensity: number;
  keyPos: [number, number, number];
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  emissiveBoost: number;
  exposure: number;
}

const PERIOD_PALETTES: Record<StudyPeriod, MoodPalette> = {
  morning: {
    sky: 0x16243a,
    fogDensity: 0.0115,
    keyColor: 0xfff3db,
    keyIntensity: 2.35,
    keyPos: [18, 26, 14],
    hemiSky: 0x8ec5fc,
    hemiGround: 0x1e293b,
    hemiIntensity: 1.05,
    emissiveBoost: 0.55,
    exposure: 1.12,
  },
  afternoon: {
    sky: 0x1c1930,
    fogDensity: 0.0135,
    keyColor: 0xffb36b,
    keyIntensity: 2.1,
    keyPos: [-22, 12, 16],
    hemiSky: 0x7c8cf8,
    hemiGround: 0x1f1926,
    hemiIntensity: 0.85,
    emissiveBoost: 0.95,
    exposure: 1.08,
  },
  evening: {
    sky: 0x070d19,
    fogDensity: 0.0155,
    keyColor: 0x93c5fd,
    keyIntensity: 1.35,
    keyPos: [-12, 22, -16],
    hemiSky: 0x3b82f6,
    hemiGround: 0x090f1d,
    hemiIntensity: 0.65,
    emissiveBoost: 1.45,
    exposure: 1.05,
  },
};

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function CampusViewport({
  selectedHub,
  onSelectHub,
  studyPeriod,
  explodeAmount,
  simSpeed,
  resetCameraNonce,
}: CampusViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  const stateRef = useRef({
    selectedHub,
    studyPeriod,
    explodeAmount,
    simSpeed,
    onSelectHub,
    cameraTransitionActive: false,
  });

  stateRef.current.selectedHub = selectedHub;
  stateRef.current.studyPeriod = studyPeriod;
  stateRef.current.explodeAmount = explodeAmount;
  stateRef.current.simSpeed = simSpeed;
  stateRef.current.onSelectHub = onSelectHub;

  useEffect(() => {
    const preset = selectedHub ? HUB_BY_ID[selectedHub].camera : OVERVIEW_CAMERA;
    _targetCamPos.set(...preset.position);
    _targetLookAt.set(...preset.target);
    stateRef.current.cameraTransitionActive = true;
  }, [selectedHub, resetCameraNonce]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure =
      PERIOD_PALETTES[stateRef.current.studyPeriod].exposure;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initialMood = PERIOD_PALETTES[stateRef.current.studyPeriod];
    scene.background = new THREE.Color(initialMood.sky);
    scene.fog = new THREE.FogExp2(initialMood.sky, initialMood.fogDensity);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.25, 180);
    camera.position.set(...OVERVIEW_CAMERA.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...OVERVIEW_CAMERA.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.minDistance = 7;
    controls.maxDistance = 42;
    controls.maxPolarAngle = Math.PI * 0.465;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.panSpeed = 0.7;
    controls.update();

    const handleControlsStart = () => {
      stateRef.current.cameraTransitionActive = false;
    };
    controls.addEventListener('start', handleControlsStart);

    // 3-Point Studio + Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      initialMood.hemiSky,
      initialMood.hemiGround,
      initialMood.hemiIntensity,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      initialMood.keyColor,
      initialMood.keyIntensity,
    );
    keyLight.position.set(...initialMood.keyPos);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 65;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    rimLight.position.set(-16, 14, -18);
    scene.add(rimLight);

    let softbox: THREE.RectAreaLight | null = null;
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      softbox = new THREE.RectAreaLight(0xe0f2fe, 2.2, 14, 14);
      softbox.position.set(0, 16, 2);
      softbox.lookAt(0, 0, 0);
      scene.add(softbox);
    }

    const textures = createProceduralTextures(
      renderer.capabilities.getMaxAnisotropy(),
    );
    const handles = buildCampusScene(scene, textures, isSoftwareGl);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Layer-1 Raycasting (throttled hover + click select)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let lastHoverCheck = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let hoveredHubId: HubId | null = null;

    const updatePointerNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (dist > 6) return;
      updatePointerNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(handles.hitProxies, false);
      if (hits.length > 0) {
        const hitHub = hits[0].object.userData.hubId as HubId | undefined;
        if (hitHub) {
          stateRef.current.onSelectHub(hitHub);
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;

      updatePointerNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(handles.hitProxies, false);

      if (hits.length > 0) {
        const hId = hits[0].object.userData.hubId as HubId;
        hoveredHubId = hId;
        renderer.domElement.style.cursor = 'pointer';
        const pos = HUB_BY_ID[hId].position;
        handles.hoverRing.position.set(pos[0], 0.055, pos[2]);
        handles.hoverRing.visible = hId !== stateRef.current.selectedHub;
      } else if (hoveredHubId !== null) {
        hoveredHubId = null;
        renderer.domElement.style.cursor = 'grab';
        handles.hoverRing.visible = false;
      }
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
    );

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let simClock = 0;
    let currentExplode = 0;

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.08, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const {
        selectedHub: activeHub,
        studyPeriod: periodKey,
        explodeAmount: targetExplode,
        simSpeed: speed,
      } = stateRef.current;

      simClock += dt * speed;

      // 1. Damped lighting & atmospheric fog transitions
      const mood = PERIOD_PALETTES[periodKey];
      const dampFactor = 1 - Math.exp(-4.5 * dt);
      _targetSky.setHex(mood.sky);
      (scene.background as THREE.Color).lerp(_targetSky, dampFactor);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(_targetSky, dampFactor);
        scene.fog.density = THREE.MathUtils.damp(
          scene.fog.density,
          mood.fogDensity,
          4.5,
          dt,
        );
      }

      _targetKeyColor.setHex(mood.keyColor);
      keyLight.color.lerp(_targetKeyColor, dampFactor);
      keyLight.intensity = THREE.MathUtils.damp(
        keyLight.intensity,
        mood.keyIntensity,
        4.5,
        dt,
      );
      keyLight.position.x = THREE.MathUtils.damp(
        keyLight.position.x,
        mood.keyPos[0],
        3.5,
        dt,
      );
      keyLight.position.y = THREE.MathUtils.damp(
        keyLight.position.y,
        mood.keyPos[1],
        3.5,
        dt,
      );
      keyLight.position.z = THREE.MathUtils.damp(
        keyLight.position.z,
        mood.keyPos[2],
        3.5,
        dt,
      );

      _targetHemiSky.setHex(mood.hemiSky);
      _targetHemiGround.setHex(mood.hemiGround);
      hemiLight.color.lerp(_targetHemiSky, dampFactor);
      hemiLight.groundColor.lerp(_targetHemiGround, dampFactor);
      hemiLight.intensity = THREE.MathUtils.damp(
        hemiLight.intensity,
        mood.hemiIntensity,
        4.5,
        dt,
      );
      renderer.toneMappingExposure = THREE.MathUtils.damp(
        renderer.toneMappingExposure,
        mood.exposure,
        4.5,
        dt,
      );

      for (let i = 0; i < handles.emissiveMaterials.length; i++) {
        handles.emissiveMaterials[i].emissiveIntensity = THREE.MathUtils.damp(
          handles.emissiveMaterials[i].emissiveIntensity,
          mood.emissiveBoost,
          4.5,
          dt,
        );
      }

      // 2. Smooth exploded cutaway elevation
      currentExplode = THREE.MathUtils.damp(
        currentExplode,
        targetExplode,
        6.0,
        dt,
      );
      for (let i = 0; i < handles.explodableParts.length; i++) {
        const part = handles.explodableParts[i];
        part.object.position.y = part.baseY + part.explodeY * currentExplode;
      }

      // 3. Smooth damped camera transition (stops on arrival or user OrbitControls start)
      if (stateRef.current.cameraTransitionActive) {
        const camLambda = 5.2;
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          _targetCamPos.x,
          camLambda,
          dt,
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          _targetCamPos.y,
          camLambda,
          dt,
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          _targetCamPos.z,
          camLambda,
          dt,
        );
        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          _targetLookAt.x,
          camLambda,
          dt,
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          _targetLookAt.y,
          camLambda,
          dt,
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          _targetLookAt.z,
          camLambda,
          dt,
        );

        if (
          camera.position.distanceToSquared(_targetCamPos) < 0.015 &&
          controls.target.distanceToSquared(_targetLookAt) < 0.015
        ) {
          stateRef.current.cameraTransitionActive = false;
        }
      }

      // 4. Selection ring update
      if (activeHub) {
        const h = HUB_BY_ID[activeHub];
        handles.selectionRing.visible = true;
        handles.selectionRing.position.set(h.position[0], 0.052, h.position[2]);
        (handles.selectionRing.material as THREE.MeshBasicMaterial).color.set(
          h.accentHex,
        );
        handles.selectionRing.rotation.z = simClock * 0.35;
      } else {
        handles.selectionRing.visible = false;
      }

      // 5. Kinetic animations (broadcast rings, workshop gyro, campus shuttles, knowledge flow)
      const mediaSpinRate = periodKey === 'evening' ? 1.4 : 0.85;
      for (let i = 0; i < handles.mediaRings.length; i++) {
        handles.mediaRings[i].rotation.y +=
          dt * speed * mediaSpinRate * (i === 0 ? 1 : -1.15);
      }

      handles.workshopGyro.rotation.y += dt * speed * 1.1;

      for (let i = 0; i < handles.shuttlePods.length; i++) {
        const pod = handles.shuttlePods[i];
        const t = (simClock * 0.09 + pod.phaseOffset) % 1;
        const nextT = (t + 0.01) % 1;
        handles.shuttleTrackCurve.getPointAt(t, _vec3A);
        handles.shuttleTrackCurve.getPointAt(nextT, _vec3B);
        pod.group.position.copy(_vec3A);
        const angle = Math.atan2(_vec3B.z - _vec3A.z, _vec3B.x - _vec3A.x);
        pod.group.rotation.y = -angle;
      }

      let instanceIdx = 0;
      const pulseSpeed = 0.22;
      for (let c = 0; c < handles.pathwayCurves.length; c++) {
        const curve = handles.pathwayCurves[c];
        const eveningBoost =
          periodKey === 'evening' && (c === 0 || c === 2) ? 1.18 : 1.0;

        if (c === 0) _pulseColor.setHex(0x22c55e); // Online media stream
        else if (c === 1) _pulseColor.setHex(0xeab308); // Assessment flow
        else if (c === 2) _pulseColor.setHex(0x38bdf8); // Knowledge core
        else if (c === 3) _pulseColor.setHex(0x06b6d4); // Workshop practice
        else _pulseColor.setHex(0xa78bfa); // Advising support

        for (let p = 0; p < 6; p++) {
          const u = (simClock * pulseSpeed + p / 6 + c * 0.13) % 1;
          curve.getPointAt(u, _vec3A);
          _vec3A.y += 0.08;
          _scale.setScalar(eveningBoost);
          _mat4.compose(_vec3A, _quat, _scale);
          handles.knowledgePulses.setMatrixAt(instanceIdx, _mat4);
          handles.knowledgePulses.setColorAt(instanceIdx, _pulseColor);
          instanceIdx++;
        }
      }
      handles.knowledgePulses.instanceMatrix.needsUpdate = true;
      if (handles.knowledgePulses.instanceColor) {
        handles.knowledgePulses.instanceColor.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlsStart);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
      );
      if (softbox) scene.remove(softbox);
      envTarget.dispose();
      handles.dispose();
      textures.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B1120] text-slate-200 p-8">
        <div className="max-w-md border border-slate-700/80 bg-slate-900/90 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">
            ไม่สามารถเริ่มต้นการแสดงผล 3 มิติได้
          </h2>
          <p className="text-sm text-slate-400">
            อุปกรณ์หรือเบราว์เซอร์ไม่รองรับ WebGL 2 คุณยังสามารถดูกราฟวิเคราะห์การเรียนและข้อมูลผู้เรียนได้จากแถบด้านบน
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      aria-label="มุมมองวิทยาเขต 3 มิติวิเคราะห์ข้อมูลการเรียนรู้"
    />
  );
}
