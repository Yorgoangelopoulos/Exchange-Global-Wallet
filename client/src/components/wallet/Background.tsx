import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// A component that renders a polygonal/crystal style background
const Background = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Create triangles when the component mounts
  useEffect(() => {
    if (!containerRef.current) return;
    
    const createTriangles = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Clear existing triangles
      container.innerHTML = '';
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Number of triangles scales with screen size
      const triangleCount = Math.floor((width * height) / 15000);
      
      for (let i = 0; i < triangleCount; i++) {
        const triangle = document.createElement('div');
        triangle.className = 'absolute bg-opacity-30 transform rotate-0';
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // Random size between 50px and 200px
        const size = 50 + Math.random() * 150;
        
        // Random background color - blues and purples
        const hue = 220 + Math.random() * 60; // 220-280 range (blues to purples)
        const saturation = 70 + Math.random() * 30; // 70-100%
        const lightness = 30 + Math.random() * 20; // 30-50%
        const opacity = 0.05 + Math.random() * 0.15; // 0.05-0.2
        
        // Random rotation
        const rotation = Math.random() * 360;
        
        // Apply styles
        Object.assign(triangle.style, {
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`,
          transform: `rotate(${rotation}deg)`,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          transition: 'all 0.5s ease-in-out',
          zIndex: '0'
        });
        
        container.appendChild(triangle);
      }
    };
    
    createTriangles();
    
    // Re-create triangles on window resize
    const handleResize = () => {
      createTriangles();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <motion.div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full overflow-hidden bg-gradient-to-br from-[#0d1117] via-[#161b2d] to-[#1a1035] z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};

export default Background;
