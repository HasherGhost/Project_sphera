'use client'

import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle, Calendar, Users, ArrowRight } from 'lucide-react';
import { verifyFace } from '@/backend/actions'; // Updated import path

// ==========================================
// 1. ANTI-SPOOF LOGIC (Inlined for minimization)
// ==========================================
export function runAntiSpoofHeuristics(canvas: HTMLCanvasElement | HTMLVideoElement, detection: any) {
  // Laplacian Variance check
  const tCanvas = document.createElement('canvas');
  tCanvas.width = 64; tCanvas.height = 64;
  const ctx = tCanvas.getContext('2d');
  if (!ctx) return { passed: false };
  const patchSize = Math.floor(detection.box.width * 0.4);
  const cx = detection.box.x + detection.box.width / 2;
  const cy = detection.box.y + detection.box.height / 2;
  ctx.drawImage(canvas, cx - patchSize/2, cy - patchSize/2, patchSize, patchSize, 0, 0, 64, 64);
  const data = ctx.getImageData(0, 0, 64, 64).data;
  const gray = new Float32Array(4096);
  for (let i = 0; i < data.length; i += 4) gray[i/4] = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
  let sum = 0, sumSq = 0;
  for (let y = 1; y < 63; y++) {
    for (let x = 1; x < 63; x++) {
      const idx = y * 64 + x;
      const laplace = 4 * gray[idx] - gray[idx-1] - gray[idx+1] - gray[idx-64] - gray[idx+64];
      sum += laplace; sumSq += laplace * laplace;
    }
  }
  const variance = (sumSq / 3844) - ((sum / 3844) ** 2);
  if (variance < 15) return { passed: false, reason: 'texture_too_smooth' };

  // Hue StdDev check
  let sumH = 0, sumHSq = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]/255, g = data[i+1]/255, b = data[i+2]/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0;
    if (max !== min) {
      if (max === r) h = (g-b)/(max-min);
      else if (max === g) h = 2+(b-r)/(max-min);
      else h = 4+(r-g)/(max-min);
      h = (h*60 + 360) % 360;
    }
    sumH += h; sumHSq += h*h;
  }
  const hueStdDev = Math.sqrt((sumHSq/4096) - ((sumH/4096)**2));
  if (hueStdDev < 8) return { passed: false, reason: 'color_distribution_failed' };

  return { passed: true };
}

// ==========================================
// 2. UI COMPONENTS
// ==========================================

export function VerifiedBadge({ type, text }: { type: 'user' | 'company', text?: string }) {
  return (
    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
      <CheckCircle className="w-3.5 h-3.5" />
      <span>{text || (type === 'user' ? 'Identity Verified' : 'Verified Owner')}</span>
    </div>
  );
}

export function TrustBadge({ score }: { score: number }) {
  const isHigh = score >= 80, isMod = score >= 40;
  const color = isHigh ? 'text-emerald-400 bg-emerald-500/10' : isMod ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10';
  const Icon = isHigh ? ShieldCheck : isMod ? Shield : ShieldAlert;
  return (
    <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{isHigh ? 'High Trust' : isMod ? 'Moderate Trust' : 'Low Trust'} ({score})</span>
    </div>
  );
}

export function EventCard({ event, onRegister }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
      <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
      <div className="flex items-center text-slate-400 text-sm space-x-4 mb-4">
        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(event.start_time).toLocaleDateString()}</span>
        <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {event.attendee_count}+ attending</span>
      </div>
      <button onClick={() => onRegister(event.id)} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
        Reserve with Escrow <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}

export function FaceCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Initialize Camera');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    faceapi.nets.faceExpressionNet.loadFromUri('/models');
  }, []);

  const startVerification = async () => {
    setIsVerifying(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
    
    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (detection) {
        const spoof = runAntiSpoofHeuristics(videoRef.current, detection.detection);
        if (spoof.passed) {
          clearInterval(interval);
          setStatus('Verifying...');
          const res = await verifyFace({ descriptor: Array.from(detection.descriptor), latencyMs: 1200 });
          if (res.ok) { setSuccess(true); setStatus('Verified!'); }
          else setStatus('Failed: ' + res.error);
          stream.getTracks().forEach(t => t.stop());
        } else {
          setStatus('Anti-spoof: ' + spoof.reason);
        }
      }
    }, 200);
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl text-white max-w-sm mx-auto text-center">
      <video ref={videoRef} autoPlay muted className="w-full h-48 bg-black rounded-lg mb-4 transform -scale-x-100" />
      <p className="mb-4 text-blue-300 font-medium">{status}</p>
      {!success && !isVerifying && <button onClick={startVerification} className="bg-blue-600 px-6 py-2 rounded-lg">Start Face ID</button>}
    </div>
  );
}
