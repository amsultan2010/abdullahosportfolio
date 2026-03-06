import Background from './Background';
import NameHeader from './NameHeader';
import NameFlash from './NameFlash';
import Navbar from './Navbar';
import MainContent from './MainContent';
import Education from './Education';
import Experience from './Experience';
import Projects from './Projects';

function PortfolioApp() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '2400px' }}>
      <Background />
      <NameHeader />
      <NameFlash />
      <Navbar />
      <MainContent />
      <Education />
      <Experience />
      <Projects />

      {/* Font rendering */}
      <style>{`
        :root {
          color-scheme: dark;
          color: rgba(255, 255, 255, 0.87);
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}

export default PortfolioApp;
