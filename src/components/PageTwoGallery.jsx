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

        {/* Centered Photo Gallery with Opacity Crossfade */}
        <div
          className="photo-slideshow-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {photos.map((src, idx) => (
            <img
              key={idx}
              src={getFullUrl(src)}
              alt={`Memory ${idx + 1}`}
              className={`gallery-crossfade-img ${idx === currentIndex ? 'active' : ''}`}
              loading={idx < 2 ? 'eager' : 'lazy'}
            />
          ))}

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
