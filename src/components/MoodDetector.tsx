import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { apiConfig } from '../utils/apiConfig';

// Lightweight on-device estimator using face expressions via face-api.js
// Requires models to be loaded from a public path /models (add files in public if available)

const MoodDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [mood, setMood] = useState<string>('Neutral');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {}
    };
    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const runDetection = async () => {
    // Try face-api if present; fallback to neutral
    const w = window as any;
    let detected = 'Neutral';
    try {
      if (w.faceapi && videoRef.current) {
        if (!ready) {
          try {
            await w.faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await w.faceapi.nets.faceExpressionNet.loadFromUri('/models');
          } catch {
            // Fallback to CDN-hosted models if local not present
            const cdnBase = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
            await w.faceapi.nets.tinyFaceDetector.loadFromUri(cdnBase);
            await w.faceapi.nets.faceExpressionNet.loadFromUri(cdnBase);
          }
          setReady(true);
        }
        const detections = await w.faceapi
          .detectSingleFace(videoRef.current, new w.faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
        if (detections && detections.expressions) {
          const { happy, sad, neutral, angry } = detections.expressions as any;
          const map: Record<string, number> = { Happy: happy, Sad: sad, Neutral: neutral, Angry: angry };
          detected = Object.entries(map).sort((a, b) => b[1] - a[1])[0][0];
        }
      }
    } catch {}
    setMood(detected);
    try {
      await axios.post(apiConfig.endpoints.moods, { mood: detected, source: 'camera' });
    } catch {}
  };

  // Auto-detect every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      runDetection();
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Webcam Mood Detector (Preview)</h3>
      <video ref={videoRef} className="w-full rounded mb-3" muted playsInline />
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Detected: {mood}</span>
        <span className="text-xs text-gray-500">Auto-detecting...</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">This detector runs on-device. No video is uploaded; only mood labels are saved.</p>
    </div>
  );
};

export default MoodDetector;


