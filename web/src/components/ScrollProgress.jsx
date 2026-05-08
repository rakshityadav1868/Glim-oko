import { useState, useEffect } from 'react';
import "../App.css";

const ScrollProgress = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        (window.scrollY / total) * 100;

      setScroll(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="scroll-progress-container">
      <div
        className="scroll-progress-bar"
        style={{ width: `${scroll}%` }}
      ></div>
    </div>
  );
};

export default ScrollProgress;