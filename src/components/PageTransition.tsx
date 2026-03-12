import React, { useState, useEffect } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
  };

  return (
    <div 
      className={`
        transition-all duration-700 ease-out
        ${isVisible && !isExiting 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
      `}
    >
      {children}
    </div>
  );
};

export default PageTransition;
