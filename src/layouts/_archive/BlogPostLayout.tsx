import { type ReactNode, useEffect } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';
import MobileDock from '../../components/global/MobileDock';
import DesktopDock from '../../components/global/DesktopDock';
import Nav from '../../components/global/Nav';
import Background from '../../components/portfolio/Background';

interface BlogPostLayoutProps {
  title: string;
  summary: string;
  publishedAt: string;
  readingTime?: number;
  tags: string[];
  slug: string;
  children?: ReactNode;
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

export default function BlogPostLayout({
  title,
  summary,
  publishedAt,
  readingTime,
  tags,
  slug,
  children,
  initialBg,
  backgroundMap,
  recentPosts,
}: BlogPostLayoutProps) {
  // Override body bg so WebGL silk shows through
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000';
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  return (
    <div className="relative w-screen min-h-screen">
      {/* WebGL Background */}
      <Background />

      {/* Navbar */}
      <div className="relative z-10">
        <Nav currentPath="/blog" recentPosts={recentPosts} />
      </div>

      {/* Main Content */}
      <div className="relative pt-12 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <a
              href="/blog"
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors font-mono text-sm glass px-4 py-2 rounded"
            >
              <span className="text-green-400">$</span>
              <span>cd ..</span>
            </a>
          </div>

          {/* Blog Post Terminal Window */}
          <div className="glass-pane rounded-lg overflow-hidden shadow-2xl">
            {/* Terminal Title Bar */}
            <div className="h-6 flex items-center space-x-2 px-4 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-200 flex-grow text-center font-semibold flex items-center justify-center gap-2">
                <FaRegFolderClosed size={14} className="text-gray-200" />
                {slug} — blog post
              </span>
            </div>

            {/* Terminal Content */}
            <div className="p-8 lg:p-12">
              {/* Header */}
              <header className="mb-8 pb-6 border-b border-gray-700/50">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-mono">
                  {title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-mono mb-4">
                  <span className="flex items-center space-x-2">
                    <span className="text-green-400">$</span>
                    <span>published {formatDate(publishedAt)}</span>
                  </span>
                  {readingTime && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span>{readingTime} min read</span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-700/50 text-green-400 rounded border border-green-500/30 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Article Content */}
              <article
                className="prose prose-invert prose-lg max-w-none
                  [&>h1]:text-white [&>h1]:font-bold [&>h1]:text-2xl [&>h1]:mt-8 [&>h1]:mb-4
                  [&>h2]:text-white [&>h2]:font-bold [&>h2]:text-xl [&>h2]:mt-6 [&>h2]:mb-3
                  [&>h3]:text-white [&>h3]:font-semibold [&>h3]:text-lg [&>h3]:mt-4 [&>h3]:mb-2
                  [&>p]:text-gray-300 [&>p]:leading-relaxed [&>p]:mb-4
                  [&>ul]:text-gray-300 [&>ul]:space-y-2 [&>ul]:my-4
                  [&>ol]:text-gray-300 [&>ol]:space-y-2 [&>ol]:my-4
                  [&>li]:text-gray-300
                  [&>code]:text-green-400 [&>code]:bg-gray-800/80 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                  [&>pre]:bg-gray-800/80 [&>pre]:border [&>pre]:border-gray-700 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-6
                  [&>pre>code]:bg-transparent [&>pre>code]:p-0 [&>pre>code]:text-green-300
                  [&>blockquote]:border-l-4 [&>blockquote]:border-green-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400 [&>blockquote]:my-6
                  [&>a]:text-green-400 [&>a]:underline [&>a]:hover:text-green-300
                  [&>strong]:text-white [&>strong]:font-semibold
                  [&>em]:text-gray-300 [&>em]:italic"
              >
                {children}
              </article>

              {/* Footer */}
              <footer className="mt-12 pt-8 border-t border-gray-700/50">
                <div className="text-center">
                  <p className="text-gray-400 mb-4 font-mono text-sm">
                    <span className="text-green-400">$</span> echo "Thanks for reading!"
                  </p>
                  <a
                    href="mailto:ronnielgandhe@gmail.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all font-mono text-sm"
                  >
                    <span>Send me an email</span>
                    <span>→</span>
                  </a>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
