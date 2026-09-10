import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { config } from './config';
import PageOneDropIn from './components/PageOneDropIn';
import PageTwoGallery from './components/PageTwoGallery';
import './index.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1); // 1: Drop-In Reveal, 2: Gallery & Wishes
  const [isMuted, setIsMuted] = useState(false);
  const audioInstance = useRef(null);

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const full = `${base}${path.startsWith('/') ? path.slice(1) : path}`;
    return encodeURI(full);
  };

  // Anti-Inspect Security & In-Memory Audio Init
  useEffect(() => {
    // 1. In-memory audio (Zero <audio> tags in DOM inspector)
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.src = getFullUrl(config.musicFile);
    audioInstance.current = audio;

    // 2. Disable Right-Click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Disable DevTools keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['U', 'u', 'S', 's'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 4. Disable image/canvas dragging
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const handleSurpriseClick = () => {
    // 1. Play in-memory audio
    if (audioInstance.current) {
      audioInstance.current.volume = 0.45;
      audioInstance.current.play().catch((err) => {
        console.warn('Audio play request handled:', err);
      });
    }

    // 2. Fire one single capped confetti burst (60-80 particles, auto-cleanup)
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#fb7185', '#fbcfe8', '#fed7aa', '#ffd700'],
      scalar: 1.1,
      disableForReducedMotion: true,
    });

    // 3. Smooth transition to Page 2
    setCurrentPage(2);
  };

  const handleToggleMute = () => {
    if (audioInstance.current) {
      const nextMuted = !isMuted;
      audioInstance.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <main className="master-app-viewport no-inspect-protection">

      {/* Page transitions with Framer Motion (fade + slight zoom, ~400-500ms) */}
      <AnimatePresence mode="wait">
        {currentPage === 1 ? (
          <motion.div
            key="page-one"
            className="page-slide-frame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <PageOneDropIn
              dropMessage={config.dropMessage}
              senderName={config.senderName}
              onSurpriseClick={handleSurpriseClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="page-two"
            className="page-slide-frame"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <PageTwoGallery
              recipientName={config.recipientName}
              senderName={config.senderName}
              photos={config.photos}
              wishes={config.wishes}
              shortLetter={config.shortLetter}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
