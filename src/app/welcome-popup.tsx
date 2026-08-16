'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if we've shown this already in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      setShow(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
      
      // Fire confetti and snow
      const duration = 5 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        // launch a few confetti from the left edge
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        // and launch a few from the right edge
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });

        // Snow effect
        confetti({
          particleCount: 1,
          startVelocity: 0,
          ticks: 200,
          origin: {
            x: Math.random(),
            // since they fall down, start a bit higher than random
            y: (Math.random() * 0.2) - 0.2
          },
          colors: ['#ffffff'],
          shapes: ['circle'],
          gravity: Math.random() * 0.4 + 0.6,
          scalar: Math.random() * 0.4 + 0.6,
          drift: Math.random() * 1 - 0.5
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Hide popup after 5 seconds
      setTimeout(() => {
        setShow(false);
      }, 5000);
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem 4rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, fadeOut 1s ease-in-out 4s forwards',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          margin: 0, 
          background: 'linear-gradient(45deg, var(--primary), #a25afd)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          Welcome Back!
        </h1>
        <h2 style={{ fontSize: '2rem', margin: '0.5rem 0 0 0', color: 'var(--foreground)' }}>
          KOLAR BSR
        </h2>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
