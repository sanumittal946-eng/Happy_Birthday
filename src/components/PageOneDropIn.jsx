import React from 'react';
import { motion } from 'framer-motion';

export default function PageOneDropIn({ dropMessage, senderName, onSurpriseClick }) {
  return (
    <div className="page-wrapper page-one-container">
      {/* Gentle Floating Background Sparkles (Pure CSS) */}
      <div className="ambient-sparkles-layer" aria-hidden="true">
        <span className="css-sparkle s-1">✨</span>
        <span className="css-sparkle s-2">🌸</span>
        <span className="css-sparkle s-3">💖</span>
        <span className="css-sparkle s-4">✨</span>
        <span className="css-sparkle s-5">🎀</span>
      </div>

      {/* Dropping Message Card (Framer Motion spring drop-in on load) */}
      <motion.div
        className="drop-in-card"
        initial={{ y: -160, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          damping: 16,
          stiffness: 110,
          delay: 0.15,
        }}
      >
        <div className="card-top-icon">💌</div>

        <h1 className="drop-card-message font-script">
          {dropMessage}
        </h1>

        <p className="drop-card-signature font-handwriting">
          — from {senderName}
        </p>
      </motion.div>

      {/* Glowing, gently pulsing pill button */}
      <motion.button
        className="surprise-pill-btn animate-pulse-gentle"
        onClick={onSurpriseClick}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        title="Tap to open your surprise!"
      >
        <span>Surprise for you 🎁</span>
      </motion.button>
    </div>
  );
}
