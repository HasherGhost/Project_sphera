// lib/faceApi/antiSpoof.ts
import * as faceapi from 'face-api.js';

export interface AntiSpoofResult {
  passed: boolean;
  reason?: string;
  variance?: number;
  hueStdDev?: number;
}

/**
 * P0 - Micro-texture check via Laplacian Variance
 * Real skin has high-frequency detail (pores, textures), whereas printed
 * photos or screens blur these out.
 * Threshold logic: variance > 15 = real.
 */
export function computeLaplacianVariance(canvas: HTMLCanvasElement | HTMLVideoElement, detection: faceapi.FaceDetection): number {
  const tCanvas = document.createElement('canvas');
  tCanvas.width = 64;
  tCanvas.height = 64;
  const ctx = tCanvas.getContext('2d');
  if (!ctx) return 0;
  
  // Extract center face patch
  const patchSize = Math.floor(detection.box.width * 0.4);
  const cx = detection.box.x + detection.box.width / 2;
  const cy = detection.box.y + detection.box.height / 2;
  
  ctx.drawImage(canvas, cx - patchSize/2, cy - patchSize/2, patchSize, patchSize, 0, 0, 64, 64);
  
  const imgData = ctx.getImageData(0, 0, 64, 64);
  const { data, width, height } = imgData;

  // Convert to grayscale
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i/4] = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
  }

  // 3x3 Laplacian kernel convolution
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplace = 4 * gray[idx] 
        - gray[idx - 1] - gray[idx + 1] 
        - gray[idx - width] - gray[idx + width];
      
      sum += laplace;
      sumSq += laplace * laplace;
      count++;
    }
  }

  const mean = sum / count;
  const variance = (sumSq / count) - (mean * mean);
  
  return variance;
}

/**
 * P0 - Color Distribution
 * Printed black&white photos lack color variance.
 * Threshold logic: hue stdDev >= 8 = passed.
 */
export function computeHueVariance(canvas: HTMLCanvasElement | HTMLVideoElement, detection: faceapi.FaceDetection): number {
  const tCanvas = document.createElement('canvas');
  tCanvas.width = 64;
  tCanvas.height = 64;
  const ctx = tCanvas.getContext('2d');
  if (!ctx) return 0;

  const patchSize = Math.floor(detection.box.width * 0.4);
  ctx.drawImage(canvas, detection.box.x + patchSize, detection.box.y + patchSize, patchSize, patchSize, 0, 0, 64, 64);
  
  const imgData = ctx.getImageData(0, 0, 64, 64);
  const { data } = imgData;
  let sumHue = 0;
  let sumHueSq = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i+1] / 255;
    const b = data[i+2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max !== min) {
      if (max === r) h = (g - b) / (max - min);
      else if (max === g) h = 2 + (b - r) / (max - min);
      else h = 4 + (r - g) / (max - min);
      h *= 60;
      if (h < 0) h += 360;
    }
    
    sumHue += h;
    sumHueSq += h * h;
    count++;
  }

  const meanHue = sumHue / count;
  const hueVar = (sumHueSq / count) - (meanHue * meanHue);
  return Math.sqrt(hueVar);
}

/**
 * P0 - Moiré Detection (Naïve FFT Proxy)
 * STUB: Full browser-based FFT for 2D images is too slow to maintain < 150ms loop.
 * Currently stubbed out to prioritize Depth Proxy + Laplacian.
 */
export function detectMoirePattern(canvas: HTMLCanvasElement | HTMLVideoElement, detection: faceapi.FaceDetection): boolean {
  // STUB: Moiré pattern FFT excluded for performance. Relying on Laplacian variance for screen detection.
  return false;
}

export function runAntiSpoofHeuristics(canvas: HTMLCanvasElement | HTMLVideoElement, detection: faceapi.FaceDetection): AntiSpoofResult {
  const variance = computeLaplacianVariance(canvas, detection);
  if (variance < 15) {
    return { passed: false, reason: 'texture_too_smooth', variance };
  }

  const hueStdDev = computeHueVariance(canvas, detection);
  if (hueStdDev < 8) {
    return { passed: false, reason: 'color_distribution_failed', hueStdDev };
  }

  return { passed: true, variance, hueStdDev };
}
