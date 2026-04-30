import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { DesktopState, DesktopAction, WindowId, WindowState } from './types';
import { WINDOW_DEFAULTS } from './types';

function createWindow(id: WindowId, zIndex: number, titleOverride?: string): WindowState {
  const defaults = WINDOW_DEFAULTS[id];
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const isMobile = screenW <= 768;
  // On mobile, auto-fullscreen non-terminal windows (terminal stays windowed to show hero)
  if (isMobile && id !== 'terminal') {
    return {
      id,
      title: titleOverride || defaults.title,
      isOpen: true,
      isMinimized: false,
      isFullscreen: true,
      zIndex,
      position: { x: 0, y: 28 },
      size: { width: screenW, height: screenH - 28 - 80 },
    };
  }
  // Clamp window size to fit screen (leave room for dock + menu bar)
  const maxW = screenW - 40;
  const maxH = screenH - 28 - 70;
  const w = Math.min(defaults.width, maxW);
  const h = Math.min(defaults.height, maxH);
  const x = Math.max(0, Math.round((screenW - w) / 2));
  const y = Math.max(28, Math.round((screenH - h) / 2));
  return {
    id,
    title: titleOverride || defaults.title,
    isOpen: true,
    isMinimized: false,
    isFullscreen: false,
    zIndex,
    position: { x, y },
    size: { width: w, height: h },
  };
}

function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const baseWindows = state.windows;

      const existing = baseWindows[action.id];
      if (existing?.isOpen && !existing.isMinimized) {
        // Already open — just focus it
        return {
          ...state,
          focusedWindowId: action.id,
          windows: {
            ...baseWindows,
            [action.id]: { ...existing, zIndex: state.nextZIndex },
          },
          nextZIndex: state.nextZIndex + 1,
        };
      }

      // Only one window at a time (besides terminal) — close others
      const cleaned: typeof baseWindows = {};
      for (const [wid, w] of Object.entries(baseWindows)) {
        if (wid === 'terminal' || wid === action.id) cleaned[wid as WindowId] = w;
      }

      if (existing?.isMinimized) {
        return {
          ...state,
          focusedWindowId: action.id,
          windows: {
            ...cleaned,
            [action.id]: { ...existing, isMinimized: false, zIndex: state.nextZIndex },
          },
          nextZIndex: state.nextZIndex + 1,
        };
      }
      const win = createWindow(action.id, state.nextZIndex, action.title);
      return {
        ...state,
        focusedWindowId: action.id,
        windows: { ...cleaned, [action.id]: win },
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'CLOSE_WINDOW': {
      const updated = { ...state.windows };
      delete updated[action.id];
      // Also close sub-windows if closing a parent
      if (action.id !== 'detail' && action.id !== 'content') {
        delete updated['detail'];
        delete updated['content'];
      }
      const focused = state.focusedWindowId === action.id ? null : state.focusedWindowId;
      return {
        ...state,
        windows: updated,
        focusedWindowId: focused,
        activeDetail: action.id === 'detail' ? null : state.activeDetail,
        activeContent: action.id === 'content' ? null : state.activeContent,
      };
    }

    case 'MINIMIZE_WINDOW': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        ...state,
        focusedWindowId: state.focusedWindowId === action.id ? null : state.focusedWindowId,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isMinimized: true },
        },
      };
    }

    case 'RESTORE_WINDOW': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        ...state,
        focusedWindowId: action.id,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isMinimized: false, zIndex: state.nextZIndex },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'FOCUS_WINDOW': {
      const win = state.windows[action.id];
      if (!win || win.isMinimized) return state;
      return {
        ...state,
        focusedWindowId: action.id,
        windows: {
          ...state.windows,
          [action.id]: { ...win, zIndex: state.nextZIndex },
        },
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'MOVE_WINDOW': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, position: action.position },
        },
      };
    }

    case 'RESIZE_WINDOW': {
      const win = state.windows[action.id];
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, size: action.size },
        },
      };
    }

    case 'TOGGLE_FULLSCREEN': {
      const win = state.windows[action.id];
      if (!win) return state;
      if (win.isFullscreen) {
        // Restore previous bounds
        const prev = win.prevBounds || { position: { x: 100, y: 60 }, size: { width: 800, height: 500 } };
        return {
          ...state,
          windows: {
            ...state.windows,
            [action.id]: { ...win, isFullscreen: false, position: prev.position, size: prev.size, prevBounds: undefined },
          },
        };
      }
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            isFullscreen: true,
            prevBounds: { position: win.position, size: win.size },
            position: { x: 20, y: 28 },
            size: { width: window.innerWidth - 40, height: window.innerHeight - 28 - 80 },
          },
        },
      };
    }

    case 'SET_BOOT_COMPLETE':
      return { ...state, bootComplete: true };

    case 'OPEN_DETAIL': {
      const detailWin = createWindow('detail', state.nextZIndex, action.detail.type === 'project' ? (action.detail as any).title : (action.detail as any).company || (action.detail as any).institution || 'Detail');
      return {
        ...state,
        activeDetail: action.detail,
        focusedWindowId: 'detail',
        windows: { ...state.windows, detail: detailWin },
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'CLOSE_DETAIL': {
      const updated = { ...state.windows };
      delete updated['detail'];
      return {
        ...state,
        activeDetail: null,
        windows: updated,
        focusedWindowId: state.focusedWindowId === 'detail' ? null : state.focusedWindowId,
      };
    }

    case 'OPEN_CONTENT': {
      const contentWin = createWindow('content', state.nextZIndex, action.content.title);
      return {
        ...state,
        activeContent: action.content,
        focusedWindowId: 'content',
        windows: { ...state.windows, content: contentWin },
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'CLOSE_CONTENT': {
      const updated = { ...state.windows };
      delete updated['content'];
      return {
        ...state,
        activeContent: null,
        windows: updated,
        focusedWindowId: state.focusedWindowId === 'content' ? null : state.focusedWindowId,
      };
    }

    case 'DESELECT_ALL':
      return { ...state, focusedWindowId: null };

    case 'LOCK_SCREEN':
      return { ...initialState };

    default:
      return state;
  }
}

const initialState: DesktopState = {
  windows: {},
  focusedWindowId: null,
  nextZIndex: 100,
  bootComplete: false,
  activeDetail: null,
  activeContent: null,
};

const DesktopContext = createContext<{
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>;
} | null>(null);

export function DesktopProvider({ children, skipBoot }: { children: ReactNode; skipBoot?: boolean }) {
  const [state, dispatch] = useReducer(desktopReducer, { ...initialState, bootComplete: !!skipBoot });
  return (
    <DesktopContext.Provider value={{ state, dispatch }}>
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error('useDesktop must be used within DesktopProvider');
  return ctx;
}
