import { useState, useRef, useEffect, type ReactNode } from 'react';

interface NavProps {
  currentPath: string;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

interface MenuBlockProps {
  trigger: string | ReactNode;
  triggerHref: string;
  items: Array<{
    label: string;
    href: string;
    sublabel?: string;
    divider?: boolean;
  }>;
  isOpen: boolean;
  onToggle: () => void;
}

function MenuBlock({ trigger, triggerHref, items, isOpen, onToggle }: MenuBlockProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if ((isOpen || isHovered) && menuRef.current) {
      const firstItem = menuRef.current.querySelector('a') as HTMLElement;
      firstItem?.focus();
    }
  }, [isOpen, isHovered]);

  useEffect(() => {
    if ((isOpen || isHovered) && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom,
        left: rect.left
      });
    }
  }, [isOpen, isHovered]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen && !isHovered) return;

    const menuItems = menuRef.current?.querySelectorAll('a') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        menuItems[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        menuItems[prevIndex]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        onToggle();
        setIsHovered(false);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (document.activeElement as HTMLElement)?.click();
        break;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const shouldShowMenu = isOpen || isHovered;

  return (
    <div 
      className="relative flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        ref={triggerRef}
        href={triggerHref}
        className="text-white hover:text-white/80 transition-colors text-sm font-normal px-0 whitespace-nowrap"
        onKeyDown={handleKeyDown}
        aria-expanded={shouldShowMenu}
        aria-haspopup="true"
      >
        {trigger}
      </a>
      
      {shouldShowMenu && (
        <>
          {/* Mobile: Fixed positioning */}
          <div
            ref={menuRef}
            className="md:hidden fixed backdrop-blur-xl bg-slate-900/50 border border-white/10 shadow-2xl min-w-48 z-[100]"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
            onKeyDown={handleKeyDown}
            role="menu"
          >
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && <div className="border-t border-white/10 my-1" />}
                <a
                  href={item.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700/50 transition-colors focus:bg-slate-700/50 focus:outline-none"
                  role="menuitem"
                  tabIndex={-1}
                >
                  <div className="flex flex-col">
                    <span className="font-normal">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs text-white/90 mt-0.5">{item.sublabel}</span>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
          {/* Desktop: Absolute positioning */}
          <div
            className="hidden md:block absolute top-full left-0 mt-0 backdrop-blur-xl bg-slate-900/50 border border-white/10 shadow-2xl min-w-48 z-[100]"
            onKeyDown={handleKeyDown}
            role="menu"
          >
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && <div className="border-t border-white/10 my-1" />}
                <a
                  href={item.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-slate-700/50 transition-colors focus:bg-slate-700/50 focus:outline-none"
                  role="menuitem"
                  tabIndex={-1}
                >
                  <div className="flex flex-col">
                    <span className="font-normal">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs text-white/90 mt-0.5">{item.sublabel}</span>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Nav({ currentPath, recentPosts = [] }: NavProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMenuToggle = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Menu block configurations
  const blogItems = recentPosts.length > 0 
    ? [
        ...recentPosts.slice(0, 3).map(post => ({
          label: post.title,
          href: `/blog/${post.slug}`,
          sublabel: `${post.readingTime} min read`
        })),
        { label: 'All Posts', href: '/blog', sublabel: 'View all articles', divider: true },
      ]
    : [
        { label: 'Building Terminal Portfolio', href: '/blog/building-terminal-portfolio', sublabel: '5 min read' },
        { label: 'Sharpe Without Illusions', href: '/blog/sharpe-without-illusions', sublabel: '8 min read' },
        { label: 'All Posts', href: '/blog', sublabel: 'View all articles', divider: true },
      ];

  const projectItems = [
    { label: 'QuantZoo', href: '/projects/quantzoo', sublabel: 'Strategy Backtesting Library' },
    { label: 'QuantTerminal', href: '/projects/quantterminal', sublabel: 'Live Trading Platform' },
    { label: 'YourNews', href: '/projects/yournews', sublabel: 'Personalized News Feed' },
    { label: 'All Projects', href: '/projects', sublabel: 'View all projects', divider: true },
  ];

  const caseStudyItems = [
    { label: 'Netflix', href: '/case-studies/netflix', sublabel: 'Microservices at Scale' },
    { label: 'Uber', href: '/case-studies/uber', sublabel: 'API Architecture Evolution' },
    { label: 'Spotify', href: '/case-studies/spotify', sublabel: 'Scaling Agile Teams' },
    { label: 'All Case Studies', href: '/case-studies', sublabel: 'View all cases', divider: true },
  ];

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-6 backdrop-blur-xl bg-slate-900/50 border-b border-white/5"
    >
      <div className="flex items-center h-full px-4 space-x-6 overflow-x-auto md:overflow-x-visible scrollbar-hide">
        {/* RG Logo + Name Block */}
        <a 
          href="/" 
          className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors text-sm font-semibold flex-shrink-0"
        >
          <img 
            src="/icons/rglogo.png" 
            alt="RG Logo" 
            className="h-6 w-auto object-contain"
          />
          <span className="whitespace-nowrap hidden md:inline">Ronniel Gandhe</span>
          <span className="whitespace-nowrap md:hidden">Ronniel</span>
        </a>

        {/* Blog Block */}
        <MenuBlock
          trigger="Blog"
          triggerHref="/blog"
          items={blogItems}
          isOpen={openMenu === 'blog'}
          onToggle={() => handleMenuToggle('blog')}
        />

        {/* Projects Block */}
        <MenuBlock
          trigger="Projects"
          triggerHref="/projects"
          items={projectItems}
          isOpen={openMenu === 'projects'}
          onToggle={() => handleMenuToggle('projects')}
        />

        {/* Case Studies Block */}
        <MenuBlock
          trigger={
            <>
              <span className="hidden md:inline">Case Studies</span>
              <span className="md:hidden">Cases</span>
            </>
          }
          triggerHref="/case-studies"
          items={caseStudyItems}
          isOpen={openMenu === 'case-studies'}
          onToggle={() => handleMenuToggle('case-studies')}
        />

        {/* Simple Link Blocks */}
        <a href="/contact" className="text-white hover:text-white/80 transition-colors text-sm font-normal whitespace-nowrap flex-shrink-0">
          Contact
        </a>
        
        <a 
          href="/Ronniel_Gandhe_Resume.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-white/80 transition-colors text-sm font-normal whitespace-nowrap flex-shrink-0"
        >
          Résumé
        </a>
      </div>
    </nav>
  );
}