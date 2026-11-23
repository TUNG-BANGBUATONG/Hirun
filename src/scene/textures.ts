import * as THREE from 'three';

export interface ProceduralTextureSet {
  groundColor: THREE.CanvasTexture;
  groundBump: THREE.CanvasTexture;
  assessmentGrid: THREE.CanvasTexture;
  stemFacade: THREE.CanvasTexture;
  stemEmissive: THREE.CanvasTexture;
  woodLouverBump: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 16));

  // 1. Academic Campus Plaza Stone + Blueprint Coordinate Grid (SRGB)
  const gCanvas = document.createElement('canvas');
  gCanvas.width = 512;
  gCanvas.height = 512;
  const gCtx = gCanvas.getContext('2d')!;
  gCtx.fillStyle = '#1b263b';
  gCtx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 4200; i++) {
    const x = (i * 97) % 512;
    const y = ((i * 53 + Math.floor(i / 512) * 19) * 31) % 512;
    const shade = i % 2 === 0 ? 'rgba(255,255,255,0.032)' : 'rgba(0,0,0,0.055)';
    gCtx.fillStyle = shade;
    gCtx.fillRect(x, y, 2, 2);
  }

  gCtx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  gCtx.lineWidth = 1;
  for (let p = 0; p <= 512; p += 64) {
    gCtx.beginPath();
    gCtx.moveTo(p, 0);
    gCtx.lineTo(p, 512);
    gCtx.stroke();
    gCtx.beginPath();
    gCtx.moveTo(0, p);
    gCtx.lineTo(512, p);
    gCtx.stroke();
  }

  gCtx.strokeStyle = 'rgba(203, 213, 225, 0.22)';
  gCtx.lineWidth = 2;
  gCtx.strokeRect(1, 1, 510, 510);

  gCtx.strokeStyle = 'rgba(56, 189, 248, 0.34)';
  gCtx.lineWidth = 1.5;
  gCtx.beginPath();
  gCtx.moveTo(248, 256);
  gCtx.lineTo(264, 256);
  gCtx.moveTo(256, 248);
  gCtx.lineTo(256, 264);
  gCtx.stroke();

  const groundColor = new THREE.CanvasTexture(gCanvas);
  groundColor.colorSpace = THREE.SRGBColorSpace;
  groundColor.wrapS = THREE.RepeatWrapping;
  groundColor.wrapT = THREE.RepeatWrapping;
  groundColor.repeat.set(9, 9);
  groundColor.anisotropy = anisotropy;

  // 2. Ground bump / roughness variation map (Linear)
  const gbCanvas = document.createElement('canvas');
  gbCanvas.width = 256;
  gbCanvas.height = 256;
  const gbCtx = gbCanvas.getContext('2d')!;
  gbCtx.fillStyle = '#808080';
  gbCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const x = (i * 73) % 256;
    const y = (i * 139) % 256;
    const v = 114 + ((i * 29) % 32);
    gbCtx.fillStyle = `rgb(${v},${v},${v})`;
    gbCtx.fillRect(x, y, 2, 2);
  }
  gbCtx.strokeStyle = '#404040';
  gbCtx.lineWidth = 2;
  gbCtx.strokeRect(1, 1, 254, 254);

  const groundBump = new THREE.CanvasTexture(gbCanvas);
  groundBump.wrapS = THREE.RepeatWrapping;
  groundBump.wrapT = THREE.RepeatWrapping;
  groundBump.repeat.set(9, 9);
  groundBump.anisotropy = anisotropy;

  // 3. Assessment Pavilion Competency Matrix Canopy Texture (SRGB)
  const aCanvas = document.createElement('canvas');
  aCanvas.width = 512;
  aCanvas.height = 512;
  const aCtx = aCanvas.getContext('2d')!;
  const aGrad = aCtx.createLinearGradient(0, 0, 512, 512);
  aGrad.addColorStop(0, '#10243d');
  aGrad.addColorStop(0.5, '#193557');
  aGrad.addColorStop(1, '#0e1e36');
  aCtx.fillStyle = aGrad;
  aCtx.fillRect(0, 0, 512, 512);

  // Competency matrix grid cells with subtle mastery bars
  aCtx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
  aCtx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 64) {
    aCtx.beginPath();
    aCtx.moveTo(x, 0);
    aCtx.lineTo(x, 512);
    aCtx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    aCtx.beginPath();
    aCtx.moveTo(0, y);
    aCtx.lineTo(512, y);
    aCtx.stroke();
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const score = ((row * 5 + col * 3) % 7) / 7;
      aCtx.fillStyle =
        score > 0.6
          ? 'rgba(56, 189, 248, 0.42)'
          : score > 0.3
            ? 'rgba(234, 179, 8, 0.36)'
            : 'rgba(148, 163, 184, 0.16)';
      aCtx.fillRect(col * 64 + 10, row * 64 + 18, 44 * (0.4 + score * 0.6), 28);
    }
  }

  const assessmentGrid = new THREE.CanvasTexture(aCanvas);
  assessmentGrid.colorSpace = THREE.SRGBColorSpace;
  assessmentGrid.anisotropy = anisotropy;

  // 4. Data & STEM Atrium Curtain Wall Facade (SRGB) + Emissive Map
  const fCanvas = document.createElement('canvas');
  fCanvas.width = 512;
  fCanvas.height = 512;
  const fCtx = fCanvas.getContext('2d')!;
  fCtx.fillStyle = '#0f172a';
  fCtx.fillRect(0, 0, 512, 512);

  for (let row = 0; row < 8; row++) {
    const y = row * 64;
    fCtx.fillStyle = '#1e293b';
    fCtx.fillRect(0, y, 512, 14);
    fCtx.fillStyle = '#172554';
    fCtx.fillRect(0, y + 14, 512, 46);
    fCtx.fillStyle = '#334155';
    fCtx.fillRect(0, y + 60, 512, 4);
  }
  fCtx.fillStyle = '#475569';
  for (let col = 0; col <= 512; col += 64) {
    fCtx.fillRect(col - 2, 0, 4, 512);
  }

  const stemFacade = new THREE.CanvasTexture(fCanvas);
  stemFacade.colorSpace = THREE.SRGBColorSpace;
  stemFacade.anisotropy = anisotropy;

  const eCanvas = document.createElement('canvas');
  eCanvas.width = 512;
  eCanvas.height = 512;
  const eCtx = eCanvas.getContext('2d')!;
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 8; row++) {
    const y = row * 64 + 24;
    for (let col = 0; col < 8; col++) {
      const x = col * 64 + 10;
      const lit = (row * 5 + col * 3) % 4 !== 0;
      if (lit) {
        eCtx.fillStyle = (row + col) % 3 === 0 ? '#38bdf8' : '#22d3ee';
        eCtx.fillRect(x, y, 44, 7);
        eCtx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        eCtx.fillRect(x, y + 11, 28, 4);
      }
    }
  }

  const stemEmissive = new THREE.CanvasTexture(eCanvas);
  stemEmissive.colorSpace = THREE.SRGBColorSpace;
  stemEmissive.anisotropy = anisotropy;

  // 5. Architectural Acoustic/Timber Slatted Panel Bump Map (Linear)
  const wCanvas = document.createElement('canvas');
  wCanvas.width = 256;
  wCanvas.height = 256;
  const wCtx = wCanvas.getContext('2d')!;
  for (let x = 0; x < 256; x++) {
    const wave = Math.sin((x / 256) * Math.PI * 28) * 0.5 + 0.5;
    const v = Math.round(75 + wave * 135);
    wCtx.fillStyle = `rgb(${v},${v},${v})`;
    wCtx.fillRect(x, 0, 1, 256);
  }
  const woodLouverBump = new THREE.CanvasTexture(wCanvas);
  woodLouverBump.wrapS = THREE.RepeatWrapping;
  woodLouverBump.wrapT = THREE.RepeatWrapping;
  woodLouverBump.repeat.set(3, 1);
  woodLouverBump.anisotropy = anisotropy;

  // 6. Soft radial contact shadow
  const shCanvas = document.createElement('canvas');
  shCanvas.width = 256;
  shCanvas.height = 256;
  const shCtx = shCanvas.getContext('2d')!;
  const shGrad = shCtx.createRadialGradient(128, 128, 12, 128, 128, 124);
  shGrad.addColorStop(0, 'rgba(2, 6, 23, 0.78)');
  shGrad.addColorStop(0.55, 'rgba(2, 6, 23, 0.36)');
  shGrad.addColorStop(1, 'rgba(2, 6, 23, 0.0)');
  shCtx.fillStyle = shGrad;
  shCtx.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.CanvasTexture(shCanvas);

  return {
    groundColor,
    groundBump,
    assessmentGrid,
    stemFacade,
    stemEmissive,
    woodLouverBump,
    contactShadow,
    dispose: () => {
      groundColor.dispose();
      groundBump.dispose();
      assessmentGrid.dispose();
      stemFacade.dispose();
      stemEmissive.dispose();
      woodLouverBump.dispose();
      contactShadow.dispose();
    },
  };
}
