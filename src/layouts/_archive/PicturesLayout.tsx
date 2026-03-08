import MobileDock from '../../components/global/MobileDock';
import DesktopDock from '../../components/global/DesktopDock';
import Nav from '../../components/global/Nav';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Photo {
  src: string;
  alt: string;
  createdAt?: string;
  caption?: string;
}

interface PicturesLayoutProps {
  photos: Photo[];
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PicturesLayout({ photos, initialBg, backgroundMap, recentPosts }: PicturesLayoutProps) {
  // Always use bg-1 (the sand/mountain background)
  const currentBg = 'bg-1';
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSlides = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    caption: photo.caption || photo.alt,
  }));

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      {/* Navbar */}
      <div className="relative z-10">
        <Nav currentPath="/pictures" recentPosts={recentPosts} />
      </div>

      {/* Main Content */}
      <div className="relative z-0 pt-12 pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 mt-8">
            <div className="glass rounded-lg p-6 inline-block">
              <h1 className="text-base font-bold text-white mb-2 font-mono">
                <span className="text-green-400">$</span> cd ~/pictures
              </h1>
              <p className="text-gray-300 font-mono text-sm">
                Moments from life, work, and adventures around Waterloo and beyond.
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="glass rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-4 text-gray-200 font-mono text-sm">
                  {photo.caption && (
                    <p className="text-white font-semibold mb-2 leading-relaxed">
                      {photo.caption}
                    </p>
                  )}
                  {photo.createdAt && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <svg 
                        className="w-3 h-3" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      <time>{formatDate(photo.createdAt)}</time>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {photos.length === 0 && (
            <div className="text-center py-12">
              <div className="glass rounded-lg p-8 inline-block">
                <p className="text-gray-300 font-mono">
                  <span className="text-green-400">$</span> ls -la
                  <br />
                  <span className="text-gray-500">No photos yet. Check back soon!</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={currentIndex}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
          button: { color: '#e0e0e0' },
          navigationPrev: { color: '#e0e0e0' },
          navigationNext: { color: '#e0e0e0' },
        }}
      />

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
