import { useState, useEffect, useRef } from 'react';

const MainContent = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={contentRef}
      className="main-content-container"
      style={{
        position: 'relative',
        marginTop: '180px',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'left',
        width: '90%',
        minWidth: '320px',
        maxWidth: '1200px',
        zIndex: 2,
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      <div className="main-content-text">
        <h1>Using <span style={{
          fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
          fontStyle: 'italic',
          fontWeight: '500'
        }}> cloud infrastructure + data science </span> </h1>
        <h1>to build elegant and scalable solutions to<br /><span style={{
          fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
          fontStyle: 'italic',
          fontWeight: '500'
        }}>real world problems</span></h1>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @font-face {
          font-family: 'NeueMontreal-MediumItalic';
          src: url('/NeueMontreal-MediumItalic.otf') format('opentype');
          font-weight: 500;
          font-style: italic;
        }

        .main-content-container {
          color: white;
        }

        .main-content-text h1 {
          font-family: 'NeueMontreal-Light', 'Arial', sans-serif !important;
          font-size: clamp(24px, 4vw, 36px) !important;
          line-height: 1.4 !important;
          font-weight: normal !important;
          font-style: normal !important;
          margin: 0 0 0.1rem 0 !important;
          padding: 0 !important;
        }

        .main-content-container .main-content-text h1 {
          font-size: clamp(24px, 4vw, 36px) !important;
          line-height: 1.4 !important;
        }

        .main-content-text h1:last-child {
          margin-bottom: 0;
        }

        .main-content-text span {
          color: rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 1200px) {
          .main-content-container {
            width: 95%;
            max-width: 900px;
          }
        }

        @media (max-width: 768px) {
          .main-content-container {
            width: calc(95% - 40px);
            padding: 0 20px;
            min-width: 320px;
            max-width: 600px;
            margin-top: 150px !important;
          }

          .main-content-text h1 {
            font-size: clamp(20px, 5vw, 32px);
          }
        }

        @media (max-width: 480px) {
          .main-content-container {
            width: calc(98% - 40px);
            padding: 0 20px;
            min-width: 300px;
            max-width: 400px;
            margin-top: 130px !important;
          }
        }

        @media (max-width: 400px) {
          .main-content-text h1 {
            font-size: clamp(16px, 7vw, 24px);
          }
        }

        @media (max-width: 350px) {
          .main-content-text h1 {
            font-size: clamp(14px, 8vw, 20px);
          }
        }
      `}</style>
    </div>
  );
};

export default MainContent;
