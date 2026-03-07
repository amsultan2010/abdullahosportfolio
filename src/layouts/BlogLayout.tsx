import { useEffect, useRef, useState } from 'react';
import MobileDock from '../components/global/MobileDock';
import DesktopDock from '../components/global/DesktopDock';
import Nav from '../components/global/Nav';
import BlogPostCard from '../components/BlogPostCard';
import Background from '../components/portfolio/Background';

interface BlogPost {
  title: string;
  slug: string | undefined;
  summary: string;
  publishedAt: string;
  readingTime?: number;
  tags: string[];
}

interface BlogLayoutProps {
  posts: BlogPost[];
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function BlogLayout({ posts, initialBg, backgroundMap, recentPosts }: BlogLayoutProps) {
  // Always use bg-1 (the sand/mountain background)
  const currentBg = 'bg-1';
  const [visiblePosts, setVisiblePosts] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up intersection observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisiblePosts((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Observe all post elements
    const postElements = document.querySelectorAll('[data-post-card]');
    postElements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        postElements.forEach((el) => {
          observerRef.current?.unobserve(el);
        });
      }
    };
  }, [posts]);

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      {/* WebGL Background */}
      <Background />

      {/* Navbar */}
      <div className="relative z-10">
        <Nav currentPath="/blog" recentPosts={recentPosts} />
      </div>

      {/* Main Content */}
      <div className="relative z-0 pt-12 pb-32 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 mt-8 flex justify-center">
            <div className="glass rounded-lg p-6">
              <h1 className="text-base font-bold text-white mb-2 font-mono">
                <span className="text-green-400">$</span> cd ~/blog
              </h1>
              <p className="text-gray-300 font-mono text-sm">
                Technical writing on systematic trading, infrastructure, and software engineering.
              </p>
            </div>
          </div>

          {/* Blog Posts Feed - Single Column */}
          <div className="flex flex-col gap-6">
            {posts.map((post, index) => (
              <div
                key={post.slug}
                id={`post-${post.slug}`}
                data-post-card
                className={`transition-all duration-700 ease-out ${
                  visiblePosts.has(`post-${post.slug}`)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <BlogPostCard post={post} />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <div className="glass rounded-lg p-8 inline-block">
                <p className="text-gray-300 font-mono">
                  <span className="text-green-400">$</span> ls -la
                  <br />
                  <span className="text-gray-500">No posts yet. Check back soon!</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
