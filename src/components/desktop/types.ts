import type { DetailContent } from '../portfolio/DetailPanel';
import type { ContentViewData } from '../portfolio/ContentViewer';

export type WindowId =
  | 'terminal'
  | 'education'
  | 'experience'
  | 'projects'
  | 'deep-research'
  | 'blog'
  | 'detail'
  | 'content';

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevBounds?: { position: { x: number; y: number }; size: { width: number; height: number } };
}

export interface DesktopState {
  windows: Record<string, WindowState>;
  focusedWindowId: WindowId | null;
  nextZIndex: number;
  bootComplete: boolean;
  // Sub-window content
  activeDetail: DetailContent | null;
  activeContent: ContentViewData | null;
}

export type DesktopAction =
  | { type: 'OPEN_WINDOW'; id: WindowId; title?: string }
  | { type: 'CLOSE_WINDOW'; id: WindowId }
  | { type: 'MINIMIZE_WINDOW'; id: WindowId }
  | { type: 'RESTORE_WINDOW'; id: WindowId }
  | { type: 'FOCUS_WINDOW'; id: WindowId }
  | { type: 'MOVE_WINDOW'; id: WindowId; position: { x: number; y: number } }
  | { type: 'RESIZE_WINDOW'; id: WindowId; size: { width: number; height: number } }
  | { type: 'TOGGLE_FULLSCREEN'; id: WindowId }
  | { type: 'SET_BOOT_COMPLETE' }
  | { type: 'OPEN_DETAIL'; detail: DetailContent }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'OPEN_CONTENT'; content: ContentViewData }
  | { type: 'CLOSE_CONTENT' }
  | { type: 'DESELECT_ALL' }
  | { type: 'LOCK_SCREEN' };

// Default window configs
export const WINDOW_DEFAULTS: Record<WindowId, { title: string; width: number; height: number; x: number; y: number }> = {
  terminal:        { title: 'ronnielgandhe.com — zsh',      width: 800, height: 500, x: 80,  y: 60 },
  education:       { title: 'Education — Finder',           width: 720, height: 580, x: 120, y: 50 },
  experience:      { title: 'Experience — Finder',          width: 720, height: 580, x: 160, y: 70 },
  projects:        { title: 'Projects — Visual Studio Code', width: 960, height: 680, x: 80, y: 35 },
  'deep-research': { title: 'Deep Research — Preview',      width: 950, height: 680, x: 140, y: 50 },
  blog:            { title: 'My Thoughts — Notes',          width: 900, height: 620, x: 110, y: 60 },
  detail:          { title: 'Detail',                       width: 650, height: 600, x: 200, y: 80 },
  content:         { title: 'Reader',                       width: 900, height: 700, x: 150, y: 40 },
};
