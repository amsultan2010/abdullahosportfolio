import MacTerminal from '../../components/global/MacTerminal';
import MobileDock from '../../components/global/MobileDock';
import DesktopDock from '../../components/global/DesktopDock';
import Nav from '../../components/global/Nav';

interface AppLayoutProps {
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function Desktop({ initialBg, backgroundMap, recentPosts }: AppLayoutProps) {
  // Always use bg-1 (the sand/mountain background)
  const currentBg = 'bg-1';

  return (
    <div className='relative w-screen h-screen overflow-hidden'>
      <div
        className='absolute inset-0 bg-cover bg-center'
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      <div className='relative z-10'>
        <Nav currentPath="/" recentPosts={recentPosts} />
      </div>

      <div className='relative z-0 flex items-center justify-center h-[calc(100vh-1.5rem)] pt-6'>
        <MacTerminal />
      </div>

      <MobileDock />
      <DesktopDock />
    </div>
  );
}
npm run build
npm run preview