import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import FloatingBalloonsBg from './FloatingBalloonsBg';

export default function PageTwoGallery({
  recipientName,
  senderName,
  photos,
  wishes,
  shortLetter,
  isMuted,
  onToggleMute,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef(null);

  const totalPhotos = photos.length;
  const currentWish = wishes[currentIndex % wishes.length];

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const full = `${base}${path.startsWith('/') ? path.slice(1) : path}`;
    return encodeURI(full);
  };

  // Auto-advance photos every 3.5 seconds (opacity transition only)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPhotos);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, totalPhotos]);

  // Handle user manual swipe or tap: pause auto-advance and resume after 4s
  const handleUserInteraction = (newIndex) => {
    setCurrentIndex(newIndex);
    setIsPaused(true);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  const handlePrev = () => {
    const nextIdx = currentIndex === 0 ? totalPhotos - 1 : currentIndex - 1;
    handleUserInteraction(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % totalPhotos;
    handleUserInteraction(nextIdx);
  };

  // Touch swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  // Canvas references for zero-DOM-exposure photo rendering
  const canvasRefA = useRef(null);
  const canvasRefB = useRef(null);
  const [activeCanvas, setActiveCanvas] = useState('A');
  const imagesCache = useRef({});

  // Helper to draw image cover onto canvas
  const drawImageCover = (canvas, img) => {
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;

    const hRatio = w / imgW;
    const vRatio = h / imgH;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (w - imgW * ratio) / 2;
    const centerShiftY = (h - imgH * ratio) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(
      img,
      0,
      0,
      imgW,
      imgH,
      centerShiftX,
      centerShiftY,
      imgW * ratio,
      imgH * ratio
    );
  };

  // Preload photos into memory (never in the DOM tree)
  useEffect(() => {
    photos.forEach((src) => {
      const fullUrl = getFullUrl(src);
      if (!imagesCache.current[fullUrl]) {
        const img = new Image();
        img.src = fullUrl;
        imagesCache.current[fullUrl] = img;
      }
    });
  }, [photos]);

  // Render to canvas on index change with smooth alternating crossfade
  useEffect(() => {
    const currentPhotoUrl = getFullUrl(photos[currentIndex]);
    let img = imagesCache.current[currentPhotoUrl];

    const renderToTargetCanvas = (loadedImg) => {
      const nextTarget = activeCanvas === 'A' ? 'B' : 'A';
      const targetCanvas = nextTarget === 'A' ? canvasRefA.current : canvasRefB.current;
      drawImageCover(targetCanvas, loadedImg);
      setActiveCanvas(nextTarget);
    };

    if (img && img.complete && img.naturalWidth > 0) {
      renderToTargetCanvas(img);
    } else {
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        imagesCache.current[currentPhotoUrl] = fallbackImg;
        renderToTargetCanvas(fallbackImg);
      };
      fallbackImg.src = currentPhotoUrl;
    }
  }, [currentIndex, photos]);

  return (
    <div className="page-wrapper page-two-container">
      {/* Background Floating Balloons (Compositor Thread CSS) */}
      <FloatingBalloonsBg />

      {/* Fixed Sound Toggle in Corner */}
      <button
        className="fixed-music-toggle"
        onClick={onToggleMute}
        title={isMuted ? 'Unmute music' : 'Mute music'}
        aria-label="Toggle background music"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Main Content Box */}
      <div className="gallery-main-card">
        {/* Rotating Birthday Wish Header (Sync with photo) */}
        <div className="rotating-wish-wrapper">
          <p key={currentIndex} className="rotating-wish-text font-script fade-in-wish">
            {currentWish}
          </p>
        </div>

        {/* Centered Photo Canvas Gallery (No <img> tags anywhere in DOM) */}
        <div
          className="photo-slideshow-container secure-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Dual Canvas Layer for Seamless Hardware Crossfading */}
          <canvas
            ref={canvasRefA}
            width={900}
            height={900}
            className={`gallery-canvas ${activeCanvas === 'A' ? 'active' : ''}`}
            aria-label="Birthday Memory"
          />
          <canvas
            ref={canvasRefB}
            width={900}
            height={900}
            className={`gallery-canvas ${activeCanvas === 'B' ? 'active' : ''}`}
            aria-label="Birthday Memory"
          />

          {/* Anti-Inspect Glass Shield prevents touch callout, drag, and element picking */}
          <div className="security-glass-overlay" aria-hidden="true" />

          {/* Navigation Arrows */}
          <button
            className="gallery-arrow arrow-left"
            onClick={handlePrev}
            aria-label="Previous photo"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="gallery-arrow arrow-right"
            onClick={handleNext}
            aria-label="Next photo"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Small Dot Progress Indicator */}
        <div className="slideshow-dots">
          {photos.map((_, idx) => (
            <button
              key={idx}
              className={`dot-pill ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => handleUserInteraction(idx)}
              aria-label={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>

        {/* Short Message Letter at the bottom of the gallery */}
        {shortLetter && (
          <div className="short-letter-note">
            <div className="mini-washi-tape" />
            <span className="letter-decor-icon">💌</span>
            <p className="short-letter-text font-handwriting">
              "{shortLetter}"
            </p>
          </div>
        )}

        {/* Closing Line at Bottom */}
        <div className="closing-line-block font-sans">
          <p className="closing-headline font-script">
            Happy Birthday, {recipientName}! 🎉
          </p>
          <p className="closing-subtext font-handwriting">
            — Made with love by {senderName} 💗
          </p>
        </div>
      </div>
    </div>
  );
}
