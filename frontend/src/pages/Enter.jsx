"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LogInModal from '../components/LogInModal';
import Login from './Login';
import Signup from './Signup';
import '../index.css';

function Enter() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const beams = [
    {
      id: 1,
      initialX: 10,
      translateX: 10,
      duration: 7,
      repeatDelay: 3,
      delay: 2,
      color: 'from-cyan-500 via-blue-500 to-transparent'
    },
    {
      id: 2,
      initialX: 600,
      translateX: 600,
      duration: 3,
      repeatDelay: 3,
      delay: 4,
      color: 'from-emerald-500 via-teal-500 to-transparent'
    },
    {
      id: 3,
      initialX: 100,
      translateX: 100,
      duration: 7,
      repeatDelay: 7,
      height: "h-6",
      color: 'from-violet-500 via-purple-500 to-transparent'
    },
    {
      id: 4,
      initialX: 400,
      translateX: 400,
      duration: 5,
      repeatDelay: 14,
      delay: 4,
      color: 'from-amber-500 via-yellow-500 to-transparent'
    },
    {
      id: 5,
      initialX: 800,
      translateX: 800,
      duration: 11,
      repeatDelay: 2,
      height: "h-20",
      color: 'from-rose-500 via-pink-500 to-transparent'
    },
    {
      id: 6,
      initialX: 1000,
      translateX: 1000,
      duration: 4,
      repeatDelay: 2,
      height: "h-12",
      color: 'from-indigo-500 via-blue-500 to-transparent'
    },
    {
      id: 7,
      initialX: 1200,
      translateX: 1200,
      duration: 6,
      repeatDelay: 4,
      delay: 2,
      height: "h-6",
      color: 'from-green-500 via-emerald-500 to-transparent'
    },
  ];

  return (
    <div
      ref={parentRef}
      className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated Beams */}
      {beams.map((beam) => (
        <BeamWithCollision
          key={beam.id}
          beam={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl pb-3 md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500  mb-4"
        >
          Bloggera
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-300 mb-10"
        >
          Where words find their power
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button
            onClick={() => setShowLogin(true)}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 glow-effect"
          >
            Sign In
          </button>
          <button
            onClick={() => setShowSignup(true)}
            className="px-8 py-3 rounded-xl border-2 border-[var(--gradient-from)] text-[var(--gradient-from)] font-medium transition-all duration-300 transform hover:scale-105"
          >
            Create Account
          </button>
        </motion.div>
      </div>

      {/* Bottom surface for collisions */}
      <div
        ref={containerRef}
        className="absolute bottom-0 bg-gray-900 w-full h-1.5 pointer-events-none"
        style={{
          filter: "blur(20px)"
        }}
      ></div>

      {/* Modals */}
      <LogInModal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Welcome Back">
        <Login onSuccess={() => setShowLogin(false)} onSwitchToSignup={handleSwitchToSignup} />
      </LogInModal>
      <LogInModal isOpen={showSignup} onClose={() => setShowSignup(false)} title="Begin Your Journey">
        <Signup onSuccess={() => setShowSignup(false)} onSwitchToLogin={handleSwitchToLogin} />
      </LogInModal>
    </div>
  );
}

const BeamWithCollision = ({ beam, containerRef, parentRef }) => {
  const beamRef = useRef(null);
  const [collision, setCollision] = useState({
    detected: false,
    coordinates: null,
  });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (beamRef.current && containerRef.current && parentRef.current && !cycleCollisionDetected) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - parentRect.top;

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          });
          setCycleCollisionDetected(true);
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);
    return () => clearInterval(animationInterval);
  }, [cycleCollisionDetected, containerRef, parentRef]);

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
      }, 2000);

      setTimeout(() => {
        setBeamKey((prevKey) => prevKey + 1);
      }, 2000);
    }
  }, [collision]);

  return (
    <>
      <motion.div
        key={`${beam.id}-${beamKey}`}
        ref={beamRef}
        animate={{
          translateY: ["-200px", "1800px"],
          translateX: beam.translateX
        }}
        initial={{
          translateY: "-200px",
          translateX: beam.initialX
        }}
        transition={{
          duration: beam.duration,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beam.delay,
          repeatDelay: beam.repeatDelay
        }}
        className={`absolute left-0 top-0 m-auto ${beam.height || 'h-14'} w-px rounded-full bg-gradient-to-t ${beam.color}`}
      />

      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`explosion-${beam.id}-${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            color={beam.color.split(' ')[0].replace('from-', '')}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const Explosion = ({ color, ...props }) => {
  const particles = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
    size: Math.random() * 3 + 1,
    duration: Math.random() * 1.5 + 0.5
  }));

  return (
    <div {...props} className="absolute z-50 h-2 w-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-current to-transparent blur-sm"
        style={{ color }}
      ></motion.div>

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: particle.directionX,
            y: particle.directionY,
            opacity: 0,
          }}
          transition={{ duration: particle.duration, ease: "easeOut" }}
          className='absolute rounded-full bg-white'
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            color
          }}
        />
      ))}
    </div>
  );
};

export default Enter;