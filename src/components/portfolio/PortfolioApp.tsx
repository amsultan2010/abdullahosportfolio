import { useState } from 'react';
import Background from './Background';
import NameHeader from './NameHeader';
import NameFlash from './NameFlash';
import Navbar from './Navbar';
import MainContent from './MainContent';
import Education from './Education';
import Experience from './Experience';
import Projects from './Projects';
import CaseStudies from './CaseStudies';
import Blog from './Blog';
import DetailPanel from './DetailPanel';
import ContentViewer from './ContentViewer';
import type { DetailContent } from './DetailPanel';
import type { ContentViewData } from './ContentViewer';

function PortfolioApp() {
  const [activeDetail, setActiveDetail] = useState<DetailContent | null>(null);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Background />
      <NameHeader />
      <NameFlash />
      <Navbar />
      <MainContent />
      <Education onCardClick={(detail) => setActiveDetail(detail)} />
      <Experience onCardClick={(detail) => setActiveDetail(detail)} />
      <Projects onCardClick={(detail) => setActiveDetail(detail)} />
      <CaseStudies onContentClick={(content) => setActiveContent(content)} />
      <Blog onContentClick={(content) => setActiveContent(content)} />

      {activeDetail && (
        <DetailPanel
          detail={activeDetail}
          onClose={() => setActiveDetail(null)}
        />
      )}

      {activeContent && (
        <ContentViewer
          content={activeContent}
          onClose={() => setActiveContent(null)}
        />
      )}

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
