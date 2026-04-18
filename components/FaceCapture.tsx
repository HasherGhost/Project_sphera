'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { runAntiSpoofHeuristics } from '@/lib/faceApi/antiSpoof';
import { verifyFace } from '@/actions/verifyFace';

export default function FaceCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState<string>('Loading AI Models...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  
  // Challenge State
  const [challengeType, setChallengeType] = useState<'blink' | 'turn_left' | 'turn_right' | 'smile' | null>(null);
  const [challengeActive, setChallengeActive] = useState(false);
  const startTimeRef = useRef<number>(0);
  const blinkState = useRef<'open' | 'closed' | 'done'>('open');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; // Assumed models served from public/models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('Ready. Ensure you are well lit.');
      } catch (err) {
        setStatus('Error loading models. Check /public/models presence.');
      }
    };
    loadModels();
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsVerifying(true);
        setStatus('Scanning face & running security checks...');
        startTimeRef.current = Date.now();
        beginDetectionLoop();
      }
    } catch (err) {
      setStatus('Webcam access required for verification.');
    }
  }, [modelsLoaded]);

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const calculateEAR = (landmarks: faceapi.Point[]) => {
    const p1 = landmarks[36], p2 = landmarks[37], p3 = landmarks[38], p4 = landmarks[39], p5 = landmarks[40], p6 = landmarks[41];
    const p7 = landmarks[42], p8 = landmarks[43], p9 = landmarks[44], p10 = landmarks[45], p11 = landmarks[46], p12 = landmarks[47];

    const dist = (pA: faceapi.Point, pB: faceapi.Point) => Math.sqrt(Math.pow(pA.x - pB.x, 2) + Math.pow(pA.y - pB.y, 2));

    const leftEAR = (dist(p2, p6) + dist(p3, p5)) / (2.0 * dist(p1, p4));
    const rightEAR = (dist(p8, p12) + dist(p9, p11)) / (2.0 * dist(p7, p10));
    return (leftEAR + rightEAR) / 2.0;
  };

  const beginDetectionLoop = () => {
    // Challenge generated at start to prevent replay
    const challenges = ['blink', 'turn_left', 'turn_right', 'smile'] as const;
    const currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    let localChallengeActive = false;
    let spoofPassed = false;
    let descriptor: Float32Array | null = null;
    let errorFrameCount = 0;

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();

      if (!detection) {
        errorFrameCount++;
        if (errorFrameCount > 10) setStatus('No face detected. Please face the camera.');
        return;
      }
      errorFrameCount = 0;

      // 1. Structural Checks
      const boxArea = detection.detection.box.width * detection.detection.box.height;
      const frameArea = 640 * 480;
      if (boxArea / frameArea < 0.15) {
        setStatus('Move closer.');
        return;
      }

      // 2. Anti-Spoof Checks
      if (!spoofPassed) {
        const spoofRes = runAntiSpoofHeuristics(videoRef.current, detection.detection);
        if (!spoofRes.passed) {
          setStatus(`Failed Integrity Check (${spoofRes.reason}). Are you using a screen/photo?`);
          return;
        }
        spoofPassed = true;
        descriptor = detection.descriptor;
        localChallengeActive = true;
        setChallengeType(currentChallenge);
        setStatus(`Challenge: ${currentChallenge.toUpperCase()}`);
      }

      // 3. Challenge Active Phase
      if (localChallengeActive) {
        let passed = false;

        switch (currentChallenge) {
          case 'blink':
            const ear = calculateEAR(detection.landmarks.positions);
            if (ear < 0.20 && blinkState.current === 'open') blinkState.current = 'closed';
            else if (ear > 0.28 && blinkState.current === 'closed') {
              blinkState.current = 'done';
              passed = true;
            }
            break;
          case 'turn_left':
            // Nose moves left relative to bounding box
            const noseLeft = detection.landmarks.getNose()[0];
            if (noseLeft.x < detection.detection.box.x + detection.detection.box.width * 0.3) passed = true;
            break;
          case 'turn_right':
            const noseRight = detection.landmarks.getNose()[0];
            if (noseRight.x > detection.detection.box.x + detection.detection.box.width * 0.7) passed = true;
            break;
          case 'smile':
            if (detection.expressions.happy > 0.7) passed = true;
            break;
        }

        if (passed) {
          clearInterval(interval);
          setStatus('Finalizing Match...');
          await submitVerification(descriptor!);
        } else if (Date.now() - startTimeRef.current > 15000) {
          clearInterval(interval);
          setStatus('Timed out. Please try again.');
          setIsVerifying(false);
          stopWebcam();
        }
      }
    }, 150);
  };

  const submitVerification = async (descriptorArr: Float32Array) => {
    stopWebcam();
    const lat = Date.now() - startTimeRef.current;
    
    // Convert Float32Array to standard array for JSON transport
    const res = await verifyFace({
      descriptor: Array.from(descriptorArr),
      latencyMs: lat
    });

    if (res.ok) {
      setSuccess(true);
      setLatency(res.latencyMs);
      setStatus(`Verified Successfully in ${(res.latencyMs / 1000).toFixed(2)}s`);
    } else {
      setStatus(`Verification Failed: ${res.error}`);
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-slate-900 rounded-xl text-white font-sans max-w-md mx-auto">
      <h2 className="text-xl font-bold">Identity Verification</h2>
      
      <div className="relative w-[320px] h-[240px] bg-black rounded-lg overflow-hidden border border-slate-700">
        <video 
          ref={videoRef} 
          muted 
          playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100" 
        />
        {!isVerifying && !success && (
          <div className="absolute inset-0 flex items-center justify-center">
            {modelsLoaded ? (
              <button 
                onClick={startWebcam}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold transition"
              >
                Start Verification
              </button>
            ) : (
              <p className="text-sm text-slate-400">Loading AI Models...</p>
            )}
          </div>
        )}
      </div>

      <div className="text-center min-h-[40px]">
        <p className={`font-medium ${success ? 'text-green-400' : 'text-blue-300'}`}>
          {status}
        </p>
        {success && latency && (
          <p className="text-sm text-slate-400 mt-1">
            Latency metric logged for trust ranking.
          </p>
        )}
      </div>
    </div>
  );
}
