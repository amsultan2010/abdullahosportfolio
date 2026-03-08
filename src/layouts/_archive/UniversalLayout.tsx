import { type ReactNode } from 'react';
import MobileDock from '../../components/global/MobileDock';
import DesktopDock from '../../components/global/DesktopDock';
import Nav from '../../components/global/Nav';

interface UniversalLayoutProps {
  currentPath: string;
  children: ReactNode;
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function UniversalLayout({
  currentPath,
  children,
  initialBg,
  backgroundMap,
  recentPosts,
}: UniversalLayoutProps) {
  // Always use bg-1 (the sand/mountain background)
  const currentBg = 'bg-1';

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      {/* Navbar */}
      <div className="relative z-10">
        <Nav currentPath={currentPath} recentPosts={recentPosts} />
      </div>

      {/* Main Content */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
