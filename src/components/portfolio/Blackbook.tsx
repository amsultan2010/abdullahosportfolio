import type { ReactNode } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════
   BLACKBOOK — Ronniel's hidden personal dashboard
   Password-gated, Supabase-synced, theme-matched
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://czdvtqqanvmgptginlwa.supabase.co';
const SUPABASE_ANON = 'sb_publishable_cNeHCMWzmLHmEfor6SDG3A_RJhF1SCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export async function hashPass(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const PASS = 'vaishali123!';
// Apple/YouOS font stack (SF Pro on macOS/iOS, system fonts elsewhere)
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'NeueMontreal-Regular', 'Segoe UI', sans-serif";
const FONT_MEDIUM = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'NeueMontreal-Medium', 'Segoe UI', sans-serif";

// Apple-style spring transition (used everywhere)
const APPLE_TRANSITION = 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)';
const CARD_RADIUS = 18;
const CARD_RADIUS_SM = 12;
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08)';

// CAD/USD reference rate (manual, conservative). Can be overridden by user later.
const FX_USD_TO_CAD = 1.37;

// ── Theme ──
interface Theme {
  bg: string; text: string; textStrong: string; textMuted: string;
  border: string; cardBg: string; inputBg: string; accentSubtle: string;
}

function useBlackbookTheme(): Theme {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rg-theme') === 'dark';
    return false;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('rg-theme') === 'dark';
      setDark(prev => prev !== current ? current : prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return dark ? {
    bg: '#000000', text: '#b5b5b5', textStrong: '#e8e5e3', textMuted: '#8a8380',
    border: 'rgba(255,255,255,0.1)', cardBg: '#171717',
    inputBg: 'rgba(255,255,255,0.06)', accentSubtle: 'rgba(255,255,255,0.12)',
  } : {
    bg: '#f5f5f4', text: '#44403c', textStrong: '#1c1917', textMuted: '#6b6560',
    border: 'rgba(0,0,0,0.1)', cardBg: '#f5f5f5',
    inputBg: 'rgba(0,0,0,0.04)', accentSubtle: 'rgba(0,0,0,0.06)',
  };
}

// ── Types ──
interface Meeting {
  id: string; title: string; person: string; time: string; notes: string; link?: string;
  contactId?: string;
}

interface Deliverable { text: string; done: boolean; }
interface JournalEntry {
  id: string; date: string; body: string; tomorrow: string;
  deliverables?: Deliverable[];
  agenda?: string[];
  meetings: Meeting[]; updatedAt: string;
}

// Legacy types (kept for migration)
type ScoutingStatus = 'researching' | 'ready' | 'archived';
type OutreachStatus = 'queued' | 'dm-sent' | 'replied' | 'call-scheduled' | 'call-done' | 'connected';

// New contact system
type ContactCategory = 'call-booked' | 'reply-needed' | 'warm' | 'awaiting-reply' | 'connected' | 'archived';
type Urgency = 'now' | 'soon' | 'later' | 'waiting';

interface NetworkContact {
  id: string; name: string; company: string; role: string;
  // New fields
  category: ContactCategory; urgency: Urgency;
  whatTheySaid: string; actionNeeded: string; followUpDate?: string;
  linkedinUrl?: string; tags?: string[];
  notes: string; createdAt: string;
  // Legacy fields (optional, for backward compat)
  whyReachOut?: string; companyInfo?: string; foundVia?: string;
  scoutingStatus?: ScoutingStatus; outreachStatus?: OutreachStatus;
  platform?: string; lastContactDate?: string; nextAction?: string;
}

type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string; title: string; status: TaskStatus; priority: TaskPriority;
  dueDate?: string; notes?: string; createdAt: string; updatedAt: string;
}

type GoalStatus = 'active' | 'completed' | 'paused';
type GoalTimeframe = 'short' | 'long';

interface GoalCheckItem { id: string; text: string; done: boolean; }
interface GoalLogEntry { id: string; text: string; date: string; }

interface Goal {
  id: string; title: string; description: string; status: GoalStatus;
  timeframe: GoalTimeframe; deadline?: string;
  progress: number; checklist: GoalCheckItem[]; log: GoalLogEntry[];
  milestones?: string[]; completedMilestones?: boolean[];
  createdAt: string; updatedAt: string;
}

interface ProjectIdea {
  id: string; title: string; description: string;
  tags: string[]; createdAt: string; updatedAt: string;
}

// ── Finance types ──
type Currency = 'USD' | 'CAD';
type AccountType = 'checking' | 'savings' | 'tfsa' | 'crypto' | 'cash';

interface Account {
  id: string; name: string; type: AccountType;
  currency: Currency; balance: number; updatedAt: string;
}

interface Transaction {
  id: string; date: string; amount: number; currency: Currency;
  type: 'income' | 'expense'; category: string; note: string; createdAt: string;
}

interface Budget {
  id: string; category: string; monthlyTarget: number; currency: Currency;
}

interface FinancialGoal {
  id: string; name: string; targetAmount: number; currentAmount: number;
  currency: Currency; deadline?: string;
}

interface FinanceData {
  accounts: Account[]; transactions: Transaction[];
  budgets: Budget[]; goals: FinancialGoal[];
}

interface BlackbookData {
  journal: JournalEntry[]; contacts: NetworkContact[]; ideas: ProjectIdea[];
  tasks: Task[]; goals: Goal[]; finance: FinanceData;
  journalUpdatedAt?: string; contactsUpdatedAt?: string; ideasUpdatedAt?: string;
  tasksUpdatedAt?: string; goalsUpdatedAt?: string; financeUpdatedAt?: string;
}

// Default empty finance state
const DEFAULT_FINANCE: FinanceData = {
  accounts: [], transactions: [], budgets: [], goals: [],
};

// Convert to CAD for net-worth aggregation
function toCAD(amount: number, currency: Currency): number {
  return currency === 'USD' ? amount * FX_USD_TO_CAD : amount;
}

// YYYY-MM string for "this month" filtering
function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}
function thisMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Date helper (local timezone, not UTC) ──
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Storage helpers ──
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`bb-${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save<T>(key: string, val: T) {
  localStorage.setItem(`bb-${key}`, JSON.stringify(val));
}

// ── Data migration from v1 ──
function migrateIfNeeded() {
  if (localStorage.getItem('bb-migrated')) return;
  try {
    // Migrate logs → journal
    const oldLogs = load<any[]>('logs', []);
    if (oldLogs.length > 0) {
      const journal: JournalEntry[] = oldLogs.map(l => ({
        id: l.date, date: l.date,
        body: [l.built, l.notes].filter(Boolean).join('\n'),
        tomorrow: '', meetings: [], updatedAt: new Date().toISOString(),
      }));
      save('journal', journal);
    }
    // Migrate contacts (v1 format)
    const oldContacts = load<any[]>('contacts', []);
    if (oldContacts.length > 0) {
      const contacts: NetworkContact[] = oldContacts.map(c => ({
        id: c.id, name: c.name || '', company: c.company || '', role: c.role || '',
        category: 'warm' as ContactCategory, urgency: 'later' as Urgency,
        whatTheySaid: c.notes || '', actionNeeded: c.nextAction || '',
        notes: c.notes || '', createdAt: new Date().toISOString(),
      }));
      save('contacts', contacts);
    }
    // Migrate projects → ideas
    const oldProjects = load<any[]>('projects', []);
    if (oldProjects.length > 0) {
      const ideas: ProjectIdea[] = oldProjects.map(p => ({
        id: p.id, title: p.name || '', description: p.nextStep || '',
        tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }));
      save('ideas', ideas);
    }
    localStorage.setItem('bb-migrated', '1');
    // Clean old keys
    localStorage.removeItem('bb-logs');
    localStorage.removeItem('bb-projects');
  } catch { /* silent */ }
}

// ── V3 contact migration: old outreach/scouting → new category/urgency ──
function migrateContactsV3() {
  if (localStorage.getItem('bb-migrated-v3-contacts')) return;
  const contacts = load<any[]>('contacts', []);
  if (contacts.length === 0) { localStorage.setItem('bb-migrated-v3-contacts', '1'); return; }

  const migrated = contacts.map((c: any) => {
    if (c.category) return c; // Already v3
    let category: ContactCategory = 'warm';
    let urgency: Urgency = 'later';
    const os = c.outreachStatus as string;
    if (os === 'dm-sent') { category = 'awaiting-reply'; urgency = 'waiting'; }
    else if (os === 'replied') { category = 'reply-needed'; urgency = 'soon'; }
    else if (os === 'call-scheduled') { category = 'call-booked'; urgency = 'now'; }
    else if (os === 'call-done') { category = 'warm'; urgency = 'soon'; }
    else if (os === 'connected') { category = 'connected'; urgency = 'later'; }
    if (c.scoutingStatus === 'archived') category = 'archived';
    return {
      ...c, category, urgency,
      whatTheySaid: c.whatTheySaid || c.notes || '',
      actionNeeded: c.actionNeeded || c.nextAction || '',
    };
  });
  save('contacts', migrated);
  localStorage.setItem('bb-migrated-v3-contacts', '1');
}

// ── Finance migration: ensure default empty finance shape exists ──
function migrateFinance() {
  if (localStorage.getItem('bb-migrated-finance')) return;
  const existing = load<any>('finance', null);
  if (!existing || typeof existing !== 'object' || !Array.isArray(existing.accounts)) {
    save('finance', DEFAULT_FINANCE);
  } else {
    // Patch any missing arrays to keep older partials valid
    const patched: FinanceData = {
      accounts: Array.isArray(existing.accounts) ? existing.accounts : [],
      transactions: Array.isArray(existing.transactions) ? existing.transactions : [],
      budgets: Array.isArray(existing.budgets) ? existing.budgets : [],
      goals: Array.isArray(existing.goals) ? existing.goals : [],
    };
    save('finance', patched);
  }
  localStorage.setItem('bb-migrated-finance', '1');
}

// ── Supabase sync ──
async function loadFromCloud(passHash: string) {
  const { data } = await supabase
    .from('blackbook').select('data').eq('pass_hash', passHash).single();
  return data?.data as BlackbookData | null;
}

async function saveToCloud(passHash: string, payload: BlackbookData) {
  await supabase.from('blackbook').upsert({
    pass_hash: passHash, data: payload, updated_at: new Date().toISOString(),
  });
}

// Per-field merge: for each section, the one with the newer timestamp wins.
// This means if you edit contacts on phone and journal on laptop, both are kept.
function mergeCloudLocal(cloud: BlackbookData | null, local: BlackbookData): BlackbookData {
  if (!cloud) return local;

  const pick = <T,>(
    cloudVal: T, cloudTs: string | undefined,
    localVal: T, localTs: string | undefined,
    fallback: T,
  ): T => {
    const cTime = cloudTs ? new Date(cloudTs).getTime() : 0;
    const lTime = localTs ? new Date(localTs).getTime() : 0;
    if (cTime >= lTime) return cloudVal ?? fallback;
    return localVal ?? fallback;
  };

  return {
    journal: pick(cloud.journal, cloud.journalUpdatedAt, local.journal, local.journalUpdatedAt, []),
    contacts: pick(cloud.contacts, cloud.contactsUpdatedAt, local.contacts, local.contactsUpdatedAt, []),
    ideas: pick(cloud.ideas, cloud.ideasUpdatedAt, local.ideas, local.ideasUpdatedAt, []),
    tasks: pick(cloud.tasks, cloud.tasksUpdatedAt, local.tasks, local.tasksUpdatedAt, []),
    goals: pick(cloud.goals, cloud.goalsUpdatedAt, local.goals, local.goalsUpdatedAt, []),
    finance: pick(cloud.finance, cloud.financeUpdatedAt, local.finance, local.financeUpdatedAt, DEFAULT_FINANCE),
    journalUpdatedAt: [cloud.journalUpdatedAt, local.journalUpdatedAt].filter(Boolean).sort().pop(),
    contactsUpdatedAt: [cloud.contactsUpdatedAt, local.contactsUpdatedAt].filter(Boolean).sort().pop(),
    ideasUpdatedAt: [cloud.ideasUpdatedAt, local.ideasUpdatedAt].filter(Boolean).sort().pop(),
    tasksUpdatedAt: [cloud.tasksUpdatedAt, local.tasksUpdatedAt].filter(Boolean).sort().pop(),
    goalsUpdatedAt: [cloud.goalsUpdatedAt, local.goalsUpdatedAt].filter(Boolean).sort().pop(),
    financeUpdatedAt: [cloud.financeUpdatedAt, local.financeUpdatedAt].filter(Boolean).sort().pop(),
  };
}

// ── Retry queue for failed saves ──
class SaveQueue {
  private pending: (() => Promise<void>) | null = null;
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private maxRetries = 5;
  onStatusChange?: (status: 'saving' | 'saved' | 'error' | 'retrying') => void;

  enqueue(saveFn: () => Promise<void>) {
    this.pending = saveFn;
    this.retryCount = 0;
    this.run();
  }

  private async run() {
    if (!this.pending) return;
    const fn = this.pending;
    this.onStatusChange?.(this.retryCount > 0 ? 'retrying' : 'saving');
    try {
      await fn();
      this.pending = null;
      this.retryCount = 0;
      this.onStatusChange?.('saved');
    } catch {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 15000);
        this.onStatusChange?.('retrying');
        this.retryTimer = setTimeout(() => this.run(), delay);
      } else {
        this.onStatusChange?.('error');
      }
    }
  }

  hasPending() { return this.pending !== null; }
  cancel() { if (this.retryTimer) clearTimeout(this.retryTimer); }
}

// ── Company domain mapping for logos ──
const COMPANY_DOMAINS: Record<string, string> = {
  'linear': 'linear.app', 'offdeal': 'offdeal.com', 'ostium': 'ostium.io',
  'alpaca': 'alpaca.markets', 'composer': 'composer.trade', 'ramp': 'ramp.com',
  'vercel': 'vercel.com', 'mercury': 'mercury.com', 'kalshi': 'kalshi.com', 'entorr': 'entorr.com',
  'rippling': 'rippling.com', 'boardy.ai': 'boardy.ai', 'fable': 'fable.app',
  'maxima': 'maxima.com', 'builder': 'builder.io', 'gentube': 'gentube.app',
  'doordash': 'doordash.com', 'university of waterloo': 'uwaterloo.ca', 'uwaterloo': 'uwaterloo.ca',
  'hexa / stackadapt': 'stackadapt.com', 'stackadapt': 'stackadapt.com',
  'bahl': 'bahl.com', 'bcv/kp fellow': 'kleinerperkins.com',
};

function getCompanyLogo(company: string) {
  const domain = COMPANY_DOMAINS[company.toLowerCase()];
  return domain ? `https://unavatar.io/${domain}?fallback=false` : null;
}

function getLinkedInSearchUrl(company: string) {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' engineering')}&origin=GLOBAL_SEARCH_HEADER`;
}

// ── Default data (empty — contacts come from cloud or are added manually) ──
const DEFAULT_CONTACTS: NetworkContact[] = [];

// ── Company Logo component ──
function CompanyLogo({ company, size = 28, t }: { company: string; size?: number; t: Theme }) {
  const [failed, setFailed] = useState(false);
  const logo = getCompanyLogo(company);
  if (!logo || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 6, background: t.accentSubtle,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontFamily: FONT_MEDIUM, color: t.textMuted,
        flexShrink: 0,
      }}>{company.charAt(0).toUpperCase()}</div>
    );
  }
  return (
    <img src={logo} alt={company} width={size} height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: 6, flexShrink: 0, objectFit: 'contain' }} />
  );
}

// ── Fingerprint SVG ──
function FingerprintIcon({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVisible(true), 3000); return () => clearTimeout(timer); }, []);

  const isDark = typeof window !== 'undefined' && localStorage.getItem('rg-theme') === 'dark';
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const iconSize = isMobile ? 18 : 28;

  return (
    <button onClick={onClick} aria-label="Access" style={{
      position: 'fixed', bottom: isMobile ? 12 : 20, right: isMobile ? 12 : 20, zIndex: 9999,
      background: 'none', border: 'none', cursor: 'pointer',
      opacity: visible ? 0.15 : 0, transition: 'opacity 1.5s ease',
      padding: isMobile ? 4 : 8, color: isDark ? '#78716c' : '#78716c',
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.35'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.15'; }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
        <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 5.5 2 6 5"/>
        <path d="M9 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1 6-2 8"/>
        <path d="M12 12v4"/>
        <path d="M2 16c1-2 2.5-3.5 4-4.5"/>
        <path d="M18 14c.5 2 .5 4-.5 6"/>
        <path d="M22 20c-1-1.5-2-3.5-2-6"/>
      </svg>
    </button>
  );
}

// ── Password Gate ──
export function PasswordGate({ onUnlock, onClose, inline }: { onUnlock: (pw: string) => void; onClose: () => void; inline?: boolean }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseTheme = useBlackbookTheme();
  const t = inline ? {
    ...baseTheme,
    text: 'rgba(0,0,0,0.8)',
    textStrong: '#1d1d1f',
    textMuted: 'rgba(0,0,0,0.45)',
    border: 'rgba(0,0,0,0.1)',
    inputBg: 'rgba(255,255,255,0.5)',
    accentSubtle: 'rgba(255,255,255,0.4)',
  } : baseTheme;
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (pw === PASS) { onUnlock(pw); }
    else { setShake(true); setPw(''); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div style={{
      position: inline ? 'relative' : 'fixed', inset: inline ? undefined : 0,
      width: inline ? '100%' : undefined, height: inline ? '100%' : undefined,
      zIndex: inline ? undefined : 10000,
      background: inline ? 'transparent' : t.bg,
      backdropFilter: inline ? undefined : 'blur(40px)',
      WebkitBackdropFilter: inline ? undefined : 'blur(40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT,
    }} onClick={inline ? undefined : onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        animation: shake ? 'bb-shake 0.4s ease' : undefined,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: t.accentSubtle,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
            <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 5.5 2 6 5"/>
            <path d="M9 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1 6-2 8"/>
            <path d="M12 12v4"/>
            <path d="M2 16c1-2 2.5-3.5 4-4.5"/>
            <path d="M18 14c.5 2 .5 4-.5 6"/>
            <path d="M22 20c-1-1.5-2-3.5-2-6"/>
          </svg>
        </div>
        <input ref={inputRef} type="password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="type password"
          style={{
            background: t.inputBg, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: '12px 20px', color: t.text,
            fontSize: 15, fontFamily: FONT, outline: 'none',
            width: 240, textAlign: 'center', letterSpacing: 2,
          }}
        />
        <span style={{ color: t.textMuted, fontSize: 14, fontWeight: 500 }}>press enter</span>
      </div>
      <style>{`
        @keyframes bb-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ── Shared Field (Apple-aesthetic) ──
function Field({ label, value, onChange, placeholder, t, type }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; t: Theme; type?: string;
}) {
  return (
    <div>
      {label && <label style={{
        fontSize: 11, color: t.textMuted, fontFamily: FONT_MEDIUM,
        display: 'block', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>{label}</label>}
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} type={type || 'text'} style={{
          background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
          padding: '9px 12px', borderRadius: 10, fontFamily: FONT, fontSize: 13,
          width: '100%', outline: 'none', transition: APPLE_TRANSITION,
          boxSizing: 'border-box', letterSpacing: '-0.005em',
        }}
        onFocus={e => { e.target.style.borderColor = t.textMuted; e.target.style.background = t.cardBg; }}
        onBlur={e => { e.target.style.borderColor = t.border; e.target.style.background = t.inputBg; }}
      />
    </div>
  );
}

// ── Shared TextArea (Apple-aesthetic) ──
function TextArea({ value, onChange, placeholder, t, minHeight = 120 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; t: Theme; minHeight?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
      background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
      padding: '11px 14px', borderRadius: 10, fontFamily: FONT, fontSize: 13,
      width: '100%', outline: 'none', resize: 'vertical', minHeight,
      lineHeight: '1.55', transition: APPLE_TRANSITION, boxSizing: 'border-box',
      wordBreak: 'break-word', overflowWrap: 'break-word',
      letterSpacing: '-0.005em',
    }}
      onFocus={e => { e.target.style.borderColor = t.textMuted; e.target.style.background = t.cardBg; }}
      onBlur={e => { e.target.style.borderColor = t.border; e.target.style.background = t.inputBg; }}
    />
  );
}

// ── Save Indicator ──
function SaveIndicator({ status, t }: { status: 'saved' | 'saving' | 'unsaved' | 'error' | 'retrying'; t: Theme }) {
  const isError = status === 'error';
  const isRetrying = status === 'retrying';
  return (
    <span style={{
      fontSize: 14,
      color: isError ? '#ef4444' : isRetrying ? '#f59e0b' : status === 'saved' ? t.textMuted : t.text,
      fontFamily: FONT, opacity: status === 'unsaved' ? 0 : 0.7,
      transition: 'opacity 0.3s',
    }}>
      {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : isRetrying ? 'Retrying...' : isError ? 'Save failed' : ''}
    </span>
  );
}

// ── Mini Calendar ──
function MiniCalendar({ selectedDate, onSelectDate, journalDates, t }: {
  selectedDate: string; onSelectDate: (d: string) => void; journalDates: Set<string>; t: Theme;
}) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate + 'T12:00'));
  const today = localToday();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontFamily: FONT, fontSize: 16, padding: '2px 8px' }}>&lsaquo;</button>
        <span style={{ fontSize: 14, color: t.textStrong, fontFamily: FONT_MEDIUM }}>{monthName}</span>
        <button onClick={next} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontFamily: FONT, fontSize: 16, padding: '2px 8px' }}>&rsaquo;</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} style={{ fontSize: 14, color: t.textMuted, padding: '4px 0', fontFamily: FONT }}>{d}</span>
        ))}
        {days.map((day, i) => {
          if (day === null) return <span key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasEntry = journalDates.has(dateStr);
          return (
            <button key={i} onClick={() => onSelectDate(dateStr)} style={{
              background: isSelected ? t.accentSubtle : 'transparent',
              border: isToday ? `1px solid ${t.textMuted}` : '1px solid transparent',
              borderRadius: 6, padding: '4px 0', cursor: 'pointer',
              color: isSelected ? t.textStrong : t.text, fontFamily: FONT, fontSize: 14,
              position: 'relative', transition: 'all 0.15s',
            }}>
              {day}
              {hasEntry && <span style={{
                position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)',
                width: 3, height: 3, borderRadius: '50%', background: t.textMuted,
              }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Meeting Row ──
function MeetingRow({ meeting, onChange, onRemove, contacts, t }: {
  meeting: Meeting; onChange: (patch: Partial<Meeting>) => void; onRemove: () => void;
  contacts?: NetworkContact[]; t: Theme;
}) {
  const linkedContact = contacts?.find(c => c.id === meeting.contactId);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 8, alignItems: 'start' }}>
        <Field value={meeting.time} onChange={v => onChange({ time: v })} placeholder="2:00 PM" t={t} />
        <Field value={meeting.title} onChange={v => onChange({ title: v })} placeholder="Meeting title" t={t} />
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
          fontSize: 14, padding: '6px 4px', marginTop: 1,
        }}>&times;</button>
      </div>
      {/* Contact picker + person field */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {contacts && contacts.length > 0 && (
          <select value={meeting.contactId || ''} onChange={e => {
            const cId = e.target.value;
            if (cId) {
              const c = contacts.find(x => x.id === cId);
              if (c) onChange({ contactId: cId, person: c.name });
            } else {
              onChange({ contactId: undefined });
            }
          }} style={{
            background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 8px', borderRadius: 8, fontFamily: FONT, fontSize: 13, outline: 'none',
            maxWidth: 180,
          }}>
            <option value="">Pick contact...</option>
            {contacts.filter(c => c.category !== 'archived').map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
            ))}
          </select>
        )}
        <div style={{ flex: 1 }}>
          <Field value={meeting.person} onChange={v => onChange({ person: v })} placeholder="With..." t={t} />
        </div>
        {linkedContact?.company && (
          <span style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, flexShrink: 0 }}>{linkedContact.company}</span>
        )}
      </div>
      {/* Meeting link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <TextArea value={meeting.link || ''} onChange={v => onChange({ link: v })} placeholder="Meeting link (Zoom, Google Meet...)" t={t} minHeight={34} />
        </div>
        {meeting.link && (
          <a href={meeting.link} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 12, fontFamily: FONT_MEDIUM, color: '#2d8a56', textDecoration: 'none',
            padding: '5px 10px', borderRadius: 6, background: 'rgba(48, 180, 98, 0.1)',
            border: '1px solid rgba(48, 180, 98, 0.2)', whiteSpace: 'nowrap', flexShrink: 0,
          }}>Join</a>
        )}
      </div>
    </div>
  );
}

// ── Journal Tab ──
function JournalTab({ journal, setJournal, contacts, t }: {
  journal: JournalEntry[]; setJournal: (fn: (prev: JournalEntry[]) => JournalEntry[]) => void;
  contacts?: NetworkContact[]; t: Theme;
}) {
  const today = localToday();
  const [selectedDate, setSelectedDate] = useState(today);

  // Auto-create today's entry if it doesn't exist
  useEffect(() => {
    if (!journal.find(e => e.date === today)) {
      setJournal(prev => [...prev, {
        id: today, date: today, body: '', tomorrow: '',
        meetings: [], updatedAt: new Date().toISOString(),
      }]);
    }
    // Hard-remove old entries that have no user content
    setJournal(prev => prev.filter(e => {
      if (e.date === today) return true;
      const hasBody = (e.body?.trim() || '').length >= 3;
      const hasAgenda = e.agenda && e.agenda.length > 0;
      const hasDeliverables = e.deliverables && e.deliverables.length > 0;
      const hasMeetings = e.meetings && e.meetings.length > 0;
      return hasBody || hasAgenda || hasDeliverables || hasMeetings;
    }));
  }, []);

  const entry = journal.find(e => e.date === selectedDate);
  const journalDates = new Set(journal.filter(e => {
    const hasBody = (e.body?.trim() || '').length >= 3;
    const hasAgenda = e.agenda && e.agenda.length > 0;
    const hasDeliverables = e.deliverables && e.deliverables.length > 0;
    const hasMeetings = e.meetings && e.meetings.length > 0;
    return hasBody || hasAgenda || hasDeliverables || hasMeetings;
  }).map(e => e.date));

  const updateEntry = (patch: Partial<JournalEntry>) => {
    if (entry) {
      setJournal(prev => prev.map(e => e.date === selectedDate
        ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e));
    } else {
      // Create entry for selected date
      setJournal(prev => [...prev, {
        id: selectedDate, date: selectedDate, body: '', tomorrow: '',
        meetings: [], updatedAt: new Date().toISOString(), ...patch,
      }]);
    }
  };

  const addMeeting = () => {
    const meetings = [...(entry?.meetings || []), {
      id: Date.now().toString(), title: '', person: '', time: '', notes: '',
    }];
    updateEntry({ meetings });
  };

  const updateMeeting = (meetingId: string, patch: Partial<Meeting>) => {
    const meetings = (entry?.meetings || []).map(m => m.id === meetingId ? { ...m, ...patch } : m);
    updateEntry({ meetings });
  };

  const removeMeeting = (meetingId: string) => {
    const meetings = (entry?.meetings || []).filter(m => m.id !== meetingId);
    updateEntry({ meetings });
  };

  // Past entries (excluding selected date), newest first
  const pastEntries = journal
    .filter(e => e.date !== selectedDate && e.body.trim())
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* Calendar + Upcoming — one dark pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, marginBottom: 16, background: t.cardBg, borderRadius: 12, border: `0.5px solid ${t.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px' }}>
          <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate}
            journalDates={journalDates} t={t} />
        </div>
        <div style={{ padding: '16px', borderLeft: `0.5px solid ${t.border}` }}>
          <UpcomingMeetings journal={journal} onSelectDate={setSelectedDate} t={t} selectedDate={selectedDate} />
        </div>
      </div>

      {/* Day section */}
      <div style={{ background: t.cardBg, borderRadius: 12, border: `0.5px solid ${t.border}`, padding: 16 }}>
        {/* Summary / Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 8 }}>Summary</label>
          <textarea
            value={entry?.body || ''}
            onChange={e => updateEntry({ body: e.target.value })}
            placeholder="What did you do today? Jot down notes, wins, blockers..."
            rows={4}
            style={{
              width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
              padding: '10px 12px', borderRadius: 8, fontFamily: FONT, fontSize: 14,
              outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5,
            }}
          />
        </div>

        {/* Meetings */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM }}>Meetings</label>
            <button onClick={addMeeting} style={{
              background: 'none', border: 'none', color: t.textMuted,
              cursor: 'pointer', fontFamily: FONT, fontSize: 14,
            }}>+ add</button>
          </div>
          {(entry?.meetings || []).length === 0 && (
            <p style={{ color: t.textMuted, fontSize: 14, opacity: 0.6 }}>No meetings scheduled</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(entry?.meetings || []).map(m => (
              <MeetingRow key={m.id} meeting={m}
                onChange={patch => updateMeeting(m.id, patch)}
                onRemove={() => removeMeeting(m.id)} contacts={contacts} t={t} />
            ))}
          </div>
        </div>

        {/* Tomorrow's Agenda */}
        <div>
          <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 8 }}>Tomorrow's Agenda</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(entry?.agenda || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ color: t.textMuted, fontSize: 10 }}>•</span>
                <span style={{ fontSize: 14, fontFamily: FONT, color: t.text, flex: 1 }}>{item}</span>
                <button onClick={() => {
                  const items = [...(entry?.agenda || [])];
                  items.splice(i, 1);
                  updateEntry({ agenda: items });
                }} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 12, padding: '0 4px' }}>×</button>
              </div>
            ))}
          </div>
          <input
            placeholder="Add agenda item..."
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                const text = (e.target as HTMLInputElement).value.trim();
                updateEntry({ agenda: [...(entry?.agenda || []), text] });
                (e.target as HTMLInputElement).value = '';
              }
            }}
            style={{
              width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
              padding: '8px 12px', borderRadius: 8, fontFamily: FONT, fontSize: 14,
              outline: 'none', boxSizing: 'border-box', marginTop: 8,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Upcoming Meetings ──
function UpcomingMeetings({ journal, onSelectDate, t, selectedDate }: {
  journal: JournalEntry[]; onSelectDate: (d: string) => void; t: Theme; selectedDate: string;
}) {
  const today = selectedDate;
  // Helper: get next day from a YYYY-MM-DD string
  const nextDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00');
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const upcoming = journal
    .filter(e => e.date >= today || (e.agenda && e.agenda.length > 0))
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap(e => [
      // Meetings show on their own date
      ...(e.date >= today ? e.meetings.map(m => ({ type: 'meeting' as const, ...m, date: e.date })) : []),
      // Agenda items are "for tomorrow" so shift date forward by 1 day
      ...(e.agenda || [])
        .map((a, i) => ({ type: 'agenda' as const, id: `agenda-${e.date}-${i}`, title: a, person: '', time: '', notes: '', date: nextDay(e.date) }))
        .filter(a => a.date >= today),
    ])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  const allUpcoming = upcoming;

  if (allUpcoming.length === 0) return null;

  return (
    <div>
      <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 8 }}>Upcoming</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {allUpcoming.map(m => {
          const isToday = m.date === localToday();
          const dateLabel = isToday ? 'Today' : new Date(m.date + 'T12:00').toLocaleDateString('en', { month: 'short', day: 'numeric' });
          return (
            <button key={m.id + m.date} onClick={() => onSelectDate(m.date)} style={{
              display: 'flex', flexDirection: 'column', gap: 2,
              background: 'transparent', border: 'none', borderRadius: 6,
              padding: '6px 8px', cursor: 'pointer', fontFamily: FONT,
              textAlign: 'left', transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accentSubtle; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: isToday ? '#2d8a56' : t.textMuted, fontFamily: FONT_MEDIUM }}>{dateLabel}</span>
                {m.type === 'meeting' && m.time && <span style={{ fontSize: 14, color: t.textMuted }}>{m.time}</span>}
                {m.type === 'agenda' && <span style={{ fontSize: 11, color: t.textMuted, fontFamily: FONT_MEDIUM }}>agenda</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.textStrong }}>{m.title || (m.type === 'meeting' ? 'Untitled meeting' : 'Untitled')}</span>
              {m.type === 'meeting' && m.person && <span style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{m.person}</span>}
              {m.type === 'meeting' && (m as any).link && (
                <a href={(m as any).link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                  fontSize: 11, fontFamily: FONT_MEDIUM, color: '#2d8a56', textDecoration: 'none',
                  marginTop: 2,
                }}>Join meeting</a>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Past entry preview ──
function PastEntry({ entry, onSelect, t }: { entry: JournalEntry; onSelect: () => void; t: Theme }) {
  const firstLine = entry.body.split('\n')[0].slice(0, 80);
  const dateLabel = new Date(entry.date + 'T12:00').toLocaleDateString('en', { month: 'short', day: 'numeric', weekday: 'short' });
  return (
    <button onClick={onSelect} style={{
      display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px',
      background: 'transparent', border: 'none', borderRadius: 6,
      cursor: 'pointer', fontFamily: FONT, transition: 'background 0.15s',
      marginBottom: 2,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = t.accentSubtle; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 14, color: t.textMuted }}>{dateLabel}</span>
      <span style={{ fontSize: 14, color: t.text, display: 'block', marginTop: 2 }}>
        {firstLine || 'Empty entry'}{firstLine.length >= 80 ? '...' : ''}
      </span>
    </button>
  );
}

// ── Network Tab ──
// Traffic light: green = active/ready, yellow = needs work, red = dead
const TRAFFIC_COLORS: Record<string, string> = {
  green: '#22c55e', yellow: '#eab308', red: '#ef4444',
};
// Map any urgency value to a traffic light
function getLight(urgency: string): 'green' | 'yellow' | 'red' {
  if (['now', 'soon', 'hot', 'green'].includes(urgency)) return 'green';
  if (['later', 'warm', 'yellow', 'waiting'].includes(urgency)) return 'yellow';
  return 'red';
}
// Keep old names for backward compat
const URGENCY_COLORS: Record<string, string> = new Proxy(TRAFFIC_COLORS, {
  get: (_, key: string) => TRAFFIC_COLORS[getLight(key)] || '#6b7280',
});
const CATEGORY_META: any[] = []; // unused but referenced

// ── LinkedIn URL parser ──
function parseLinkedInUrl(url: string): { name: string; linkedinUrl: string } | null {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes('linkedin.com')) return null;
    const match = u.pathname.match(/\/in\/([^/]+)/);
    if (!match) return null;
    const slug = match[1];
    // Split by hyphens, drop trailing ID-like segments (all digits, or long alphanumeric hashes)
    const parts = slug.split('-').filter(p => !/^\d+$/.test(p) && !(p.length > 6 && /^[a-z0-9]+$/.test(p)));
    if (parts.length === 0) return null;
    const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    return { name, linkedinUrl: url.trim() };
  } catch { return null; }
}

// Try to fetch company from LinkedIn page title via CORS proxy (best-effort)
function tryFetchLinkedInCompany(url: string, onCompany: (company: string) => void) {
  fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
    .then(r => r.text())
    .then(html => {
      // LinkedIn title format: "Firstname Lastname - Title at Company | LinkedIn"
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (!titleMatch) return;
      const title = titleMatch[1];
      const atMatch = title.match(/\bat\b\s+(.+?)\s*\|/i);
      if (atMatch) onCompany(atMatch[1].trim());
    })
    .catch(() => {}); // Silent fail — name from URL is still valuable
}

function NetworkTab({ contacts, setContacts, journal, t }: {
  contacts: NetworkContact[]; setContacts: (fn: (prev: NetworkContact[]) => NetworkContact[]) => void;
  journal?: JournalEntry[]; t: Theme;
}) {
  const [view, setView] = useState<'outreach' | 'contacts'>('outreach');
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [pasteUrl, setPasteUrl] = useState('');
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const updateContact = (id: string, patch: Partial<NetworkContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };
  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (expandedCard === id) setExpandedCard(null);
  };
  const addContact = () => {
    const id = Date.now().toString();
    setContacts(prev => [...prev, {
      id, name: '', company: '', role: '', category: 'warm', urgency: 'later',
      whatTheySaid: '', actionNeeded: '', notes: '', createdAt: new Date().toISOString(),
    }]);
    setExpandedCard(id);
    setJustAdded(id);
    setTimeout(() => {
      document.getElementById(`contact-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const addFromLinkedIn = (url: string) => {
    const parsed = parseLinkedInUrl(url);
    if (!parsed) {
      setPasteStatus('Not a valid LinkedIn profile URL');
      setTimeout(() => setPasteStatus(null), 2500);
      return;
    }
    // Check for duplicate
    if (contacts.some(c => c.linkedinUrl === parsed.linkedinUrl)) {
      setPasteStatus(`${parsed.name} already exists`);
      setTimeout(() => setPasteStatus(null), 2500);
      return;
    }
    const id = Date.now().toString();
    setContacts(prev => [...prev, {
      id, name: parsed.name, company: '', role: '', category: 'warm', urgency: 'later',
      whatTheySaid: '', actionNeeded: '', linkedinUrl: parsed.linkedinUrl,
      notes: '', createdAt: new Date().toISOString(),
    }]);
    setExpandedCard(id);
    setJustAdded(id);
    setPasteUrl('');
    setPasteStatus(`Added ${parsed.name}`);
    setTimeout(() => {
      document.getElementById(`contact-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    setTimeout(() => setPasteStatus(null), 2500);
    // Try to fetch company in background
    tryFetchLinkedInCompany(parsed.linkedinUrl, (company) => {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, company: c.company || company } : c));
    });
  };

  const active = contacts.filter(c => c.category !== 'connected' && c.category !== 'archived');
  const connected = contacts.filter(c => c.category === 'connected');
  const filtered = filter
    ? filter.startsWith('tag:')
      ? active.filter(c => (c.tags || []).includes(filter.slice(4)))
      : active.filter(c => `${c.name} ${c.company}`.toLowerCase().includes(filter.toLowerCase()))
    : active;

  const counts = {
    'call-booked': filtered.filter(c => c.category === 'call-booked').length,
    'reply-needed': filtered.filter(c => c.category === 'reply-needed').length,
    'warm': filtered.filter(c => c.category === 'warm').length,
    'awaiting-reply': filtered.filter(c => c.category === 'awaiting-reply').length,
  };

  const filteredConnected = filter
    ? filter.startsWith('tag:')
      ? connected.filter(c => (c.tags || []).includes(filter.slice(4)))
      : connected.filter(c => `${c.name} ${c.company}`.toLowerCase().includes(filter.toLowerCase()))
    : connected;

  // Sort: green first, yellow middle, red last
  const lightOrder = (c: NetworkContact) => { const l = getLight(c.urgency); return l === 'green' ? 0 : l === 'yellow' ? 1 : 2; };
  const sorted = [...filtered].sort((a, b) => {
    if (a.id === justAdded) return -1;
    if (b.id === justAdded) return 1;
    return lightOrder(a) - lightOrder(b);
  });
  const greenCount = sorted.filter(c => getLight(c.urgency) === 'green').length;
  const yellowCount = sorted.filter(c => getLight(c.urgency) === 'yellow').length;
  const redCount = sorted.filter(c => getLight(c.urgency) === 'red').length;

  return (
    <div>
      {/* Traffic light counts */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 14, fontFamily: FONT, background: t.cardBg, borderRadius: 10, padding: '10px 14px', border: `0.5px solid ${t.border}` }}>
        <span><span style={{ color: '#22c55e', fontFamily: FONT_MEDIUM, fontSize: 16 }}>{greenCount}</span> <span style={{ color: t.textMuted }}>active</span></span>
        <span><span style={{ color: '#eab308', fontFamily: FONT_MEDIUM, fontSize: 16 }}>{yellowCount}</span> <span style={{ color: t.textMuted }}>needs work</span></span>
        <span><span style={{ color: '#ef4444', fontFamily: FONT_MEDIUM, fontSize: 16 }}>{redCount}</span> <span style={{ color: t.textMuted }}>inactive</span></span>
      </div>

      {/* Contact list — flat, sorted by light */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map(c => (
          <div key={c.id} id={`contact-${c.id}`}>
            <ContactCard contact={c} expanded={expandedCard === c.id}
              onToggle={() => {
                const collapsing = expandedCard === c.id;
                setExpandedCard(collapsing ? null : c.id);
                if (collapsing && c.id === justAdded) setJustAdded(null);
              }}
              onUpdate={p => updateContact(c.id, p)} onRemove={() => removeContact(c.id)} t={t} />
          </div>
        ))}
      </div>

      {/* Add */}
      <button onClick={addContact} style={{
        background: t.cardBg, border: `1px dashed ${t.border}`,
        color: t.textMuted, padding: '10px', borderRadius: 10, width: '100%',
        cursor: 'pointer', fontFamily: FONT, fontSize: 14, marginTop: 16,
      }}>+ Add Contact</button>
    </div>
  );
}

// ── Tag System ──
const TAG_SUGGESTIONS = ['intent:refer', 'intent:hire', 'intro:pending', 'intro:done'];
const TAG_COLORS: Record<string, string> = {
  'intent:refer': '#2d8a56', 'intent:hire': '#2563eb', 'intro:pending': '#f59e0b', 'intro:done': '#6b7280',
};

function TagPill({ tag, onRemove, t }: { tag: string; onRemove?: () => void; t: Theme }) {
  const color = TAG_COLORS[tag] || t.textMuted;
  return (
    <span style={{
      fontSize: 11, fontFamily: FONT_MEDIUM, padding: '2px 7px', borderRadius: 4,
      background: `${color}18`, color, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {tag}
      {onRemove && <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
        background: 'none', border: 'none', color, cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1,
      }}>&times;</button>}
    </span>
  );
}

// ── Contact Card (redesigned) ──
function ContactCard({ contact: c, expanded, onToggle, onUpdate, onRemove, t }: {
  contact: NetworkContact; expanded: boolean;
  onToggle: () => void; onUpdate: (p: Partial<NetworkContact>) => void;
  onRemove: () => void; t: Theme;
}) {
  const [newTag, setNewTag] = useState('');
  const tags = c.tags || [];
  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) onUpdate({ tags: [...tags, t] });
    setNewTag('');
  };
  const removeTag = (tag: string) => onUpdate({ tags: tags.filter(t => t !== tag) });

  const light = getLight(c.urgency);
  const urgColor = TRAFFIC_COLORS[light];

  const isCold = ['waiting', 'later', 'cold'].includes(c.urgency);

  return (
    <div style={{
      border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden',
      display: 'flex', cursor: 'pointer', background: t.cardBg,
      opacity: isCold && !expanded ? 0.55 : 1, transition: 'opacity 0.15s',
    }} onClick={onToggle}
      onMouseEnter={e => { if (isCold) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { if (isCold && !expanded) e.currentTarget.style.opacity = '0.55'; }}
    >
      {/* Left urgency bar */}
      <div style={{ width: 4, flexShrink: 0, background: urgColor }} />

      <div style={{ flex: 1, padding: '12px 14px' }}>
        {/* Header: logo + name + linkedin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          {c.company ? <CompanyLogo company={c.company} size={28} t={t} /> : (
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: t.accentSubtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontFamily: FONT_MEDIUM, color: t.textMuted, flexShrink: 0,
            }}>{(c.name || '?')[0].toUpperCase()}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONT_MEDIUM, color: t.textStrong, fontSize: 16 }}>{c.name || 'New contact'}</span>
              {c.linkedinUrl && (
                <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                  color: t.textMuted, display: 'flex', opacity: 0.5, transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
            </div>
            {(c.company || c.role) && (
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 1 }}>
                {[c.company, c.role].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>

        {/* Quote: what they said */}
        {c.whatTheySaid && (
          <div style={{
            fontSize: 13, color: t.text, fontStyle: 'italic', marginTop: 8,
            borderLeft: `2px solid ${t.border}`, paddingLeft: 10, lineHeight: 1.5,
          }}>
            "{c.whatTheySaid}"
          </div>
        )}

        {/* Action needed */}
        {c.actionNeeded && (
          <div style={{ fontSize: 13, color: t.textStrong, fontFamily: FONT_MEDIUM, marginTop: 8 }}>
            <span style={{ color: urgColor, marginRight: 4 }}>&rarr;</span> {c.actionNeeded}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {tags.map(tag => <TagPill key={tag} tag={tag} t={t} />)}
          </div>
        )}

        {/* Expanded edit */}
        {expanded && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${t.border}`, paddingTop: 12 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <Field label="Name" value={c.name} onChange={v => onUpdate({ name: v })} placeholder="First Last" t={t} />
              <Field label="Company" value={c.company} onChange={v => onUpdate({ company: v })} placeholder="Company" t={t} />
              <Field label="Role" value={c.role} onChange={v => onUpdate({ role: v })} placeholder="Role" t={t} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 3 }}>What they said</label>
              <TextArea value={c.whatTheySaid} onChange={v => onUpdate({ whatTheySaid: v })} placeholder="Context from their last message..." t={t} minHeight={40} />
            </div>
            <div style={{ marginTop: 8 }}>
              <Field label="Action needed" value={c.actionNeeded} onChange={v => onUpdate({ actionNeeded: v })} placeholder="What to do next..." t={t} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
              <div>
                <label style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 3 }}>Category</label>
                <select value={c.category} onChange={e => onUpdate({ category: e.target.value as ContactCategory })} style={{
                  background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
                  padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 14, outline: 'none', width: '100%',
                }}>
                  <option value="call-booked">Call Booked</option>
                  <option value="reply-needed">Need to Reply</option>
                  <option value="warm">Warm</option>
                  <option value="awaiting-reply">Awaiting Reply</option>
                  <option value="connected">Connected</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 3 }}>Status</label>
                <select value={getLight(c.urgency)} onChange={e => onUpdate({ urgency: e.target.value as any })} style={{
                  background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
                  padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 14, outline: 'none', width: '100%',
                }}>
                  <option value="green">🟢 Active</option>
                  <option value="yellow">🟡 Needs Work</option>
                  <option value="red">🔴 Inactive</option>
                </select>
              </div>
              <Field label="Follow-up" value={c.followUpDate || ''} onChange={v => onUpdate({ followUpDate: v })} placeholder="mid-May..." t={t} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <Field label="LinkedIn URL" value={c.linkedinUrl || ''} onChange={v => onUpdate({ linkedinUrl: v })} placeholder="https://linkedin.com/in/..." t={t} />
              <div />
            </div>
            {/* Tags editor */}
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 3 }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {tags.map(tag => <TagPill key={tag} tag={tag} onRemove={() => removeTag(tag)} t={t} />)}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <input value={newTag} onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { addTag(newTag); e.preventDefault(); } }}
                  placeholder="Add tag..." style={{
                    background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
                    padding: '5px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 12, outline: 'none', width: 100,
                  }} />
                {TAG_SUGGESTIONS.filter(s => !tags.includes(s)).map(s => (
                  <button key={s} onClick={() => addTag(s)} style={{
                    background: 'none', border: `1px solid ${t.border}`, color: t.textMuted,
                    padding: '3px 7px', borderRadius: 4, cursor: 'pointer', fontFamily: FONT, fontSize: 11,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMuted; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
                  >+ {s}</button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <TextArea value={c.notes} onChange={v => onUpdate({ notes: v })} placeholder="Notes..." t={t} minHeight={40} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
                background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                fontFamily: FONT, fontSize: 13, opacity: 0.7,
              }}>Delete contact</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tasks Tab ──
const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  high: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  low: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' },
};

function TasksTab({ tasks, setTasks, t }: {
  tasks: Task[]; setTasks: (fn: (prev: Task[]) => Task[]) => void; t: Theme;
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  const addTask = () => {
    if (!newTitle.trim()) return;
    const now = new Date().toISOString();
    setTasks(prev => [{ id: Date.now().toString(), title: newTitle.trim(), status: 'todo', priority: newPriority, createdAt: now, updatedAt: now }, ...prev]);
    setNewTitle('');
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t));
  };

  const today = localToday();
  const active = tasks.filter(t => t.status !== 'done')
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  const done = tasks.filter(t => t.status === 'done').slice(0, 20);
  const [showDone, setShowDone] = useState(false);

  return (
    <div>
      {/* Quick add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="What needs to get done?"
          style={{
            flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '10px 14px', borderRadius: 8, fontFamily: FONT, fontSize: 14, outline: 'none',
          }} />
        <select value={newPriority} onChange={e => setNewPriority(e.target.value as TaskPriority)} style={{
          background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
          padding: '8px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 14, outline: 'none',
        }}>
          <option value="high">High</option>
          <option value="medium">Med</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Active tasks */}
      {active.length === 0 && (
        <p style={{ color: t.textMuted, fontSize: 14, textAlign: 'center', padding: 32 }}>No tasks. Add one above.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {active.map(task => (
          <TaskRow key={task.id} task={task} today={today} onUpdate={p => updateTask(task.id, p)}
            onRemove={() => setTasks(prev => prev.filter(t => t.id !== task.id))} t={t} />
        ))}
      </div>

      {/* Done tasks */}
      {done.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setShowDone(!showDone)} style={{
            background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
            fontFamily: FONT, fontSize: 14, padding: '4px 0',
          }}>{showDone ? 'Hide' : 'Show'} completed ({done.length})</button>
          {showDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, opacity: 0.6 }}>
              {done.map(task => (
                <TaskRow key={task.id} task={task} today={today} onUpdate={p => updateTask(task.id, p)}
                  onRemove={() => setTasks(prev => prev.filter(t => t.id !== task.id))} t={t} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, today, onUpdate, onRemove, t }: {
  task: Task; today: string; onUpdate: (p: Partial<Task>) => void;
  onRemove: () => void; t: Theme;
}) {
  const isDone = task.status === 'done';
  const isOverdue = task.dueDate && task.dueDate < today && !isDone;
  const pc = PRIORITY_COLORS[task.priority];
  const [editing, setEditing] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
      borderRadius: 8, transition: 'background 0.15s', background: t.cardBg,
      border: `0.5px solid ${t.border}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = t.accentSubtle; }}
      onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; }}
    >
      {/* Checkbox */}
      <button onClick={() => onUpdate({ status: isDone ? 'todo' : 'done' })} style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        border: `1.5px solid ${isDone ? 'rgba(48, 180, 98, 0.5)' : t.border}`,
        background: isDone ? 'rgba(48, 180, 98, 0.15)' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#2d8a56', fontSize: 14,
      }}>{isDone ? '✓' : ''}</button>

      {/* Title */}
      {editing ? (
        <input value={task.title} onChange={e => onUpdate({ title: e.target.value })}
          onBlur={() => setEditing(false)} onKeyDown={e => e.key === 'Enter' && setEditing(false)}
          autoFocus style={{
            flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '4px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 14, outline: 'none',
          }} />
      ) : (
        <span onClick={() => setEditing(true)} style={{
          flex: 1, fontFamily: FONT, fontSize: 14, cursor: 'text',
          color: isDone ? t.textMuted : t.text,
          textDecoration: isDone ? 'line-through' : 'none',
        }}>{task.title}</span>
      )}

      {/* Priority pill */}
      <span style={{
        fontSize: 14, fontFamily: FONT_MEDIUM, padding: '2px 6px', borderRadius: 4,
        background: pc.bg, color: pc.text,
      }}>{task.priority}</span>

      {/* Due date */}
      {task.dueDate && (
        <span style={{ fontSize: 14, color: isOverdue ? '#ef4444' : t.textMuted, fontFamily: FONT }}>
          {new Date(task.dueDate + 'T12:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </span>
      )}

      {/* Delete */}
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
        fontSize: 14, opacity: 0.5, padding: '0 2px',
      }}>&times;</button>
    </div>
  );
}

// ── Goals Tab ──
// ── Goal migration: convert legacy milestones to checklist format ──
function migrateGoal(g: any): Goal {
  if (g.checklist) return g;
  const checklist: GoalCheckItem[] = (g.milestones || []).map((text: string, i: number) => ({
    id: Date.now().toString() + '_' + i, text, done: g.completedMilestones?.[i] ?? false,
  }));
  const doneCount = checklist.filter(c => c.done).length;
  return {
    ...g,
    timeframe: g.timeframe || 'short',
    checklist,
    log: g.log || [],
    progress: checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0,
  };
}

function GoalsTab({ goals, setGoals, t }: {
  goals: Goal[]; setGoals: (fn: (prev: Goal[]) => Goal[]) => void; t: Theme;
}) {
  // Migrate legacy goals on first render
  useEffect(() => {
    setGoals(prev => {
      const needsMigration = prev.some((g: any) => !g.checklist);
      return needsMigration ? prev.map(migrateGoal) : prev;
    });
  }, []);

  const addGoal = (timeframe: GoalTimeframe) => {
    const now = new Date().toISOString();
    setGoals(prev => [...prev, {
      id: Date.now().toString(), title: '', description: '', status: 'active' as GoalStatus,
      progress: 0, timeframe, checklist: [], log: [],
      createdAt: now, updatedAt: now,
    }]);
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g));
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const shortActive = goals.filter(g => (g.timeframe || 'short') === 'short' && g.status === 'active');
  const longActive = goals.filter(g => (g.timeframe || 'short') === 'long' && g.status === 'active');
  const done = goals.filter(g => g.status !== 'active');

  const sectionHead = (icon: string, label: string, count: number, suffix: string = 'active') => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 15, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.01em' }}>{label}</span>
      <span style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT }}>· {count} {suffix}</span>
    </div>
  );

  const addBtn = (tf: GoalTimeframe) => (
    <button onClick={() => addGoal(tf)} style={{
      background: 'transparent', border: `1px dashed ${t.border}`,
      color: t.textMuted, padding: '12px', borderRadius: CARD_RADIUS_SM, width: '100%',
      cursor: 'pointer', fontFamily: FONT, fontSize: 14, marginTop: 10,
      transition: APPLE_TRANSITION, boxSizing: 'border-box',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMuted; e.currentTarget.style.color = t.text; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
    >+ Add {tf === 'short' ? 'short-term' : 'long-term'} goal</button>
  );

  const emptyState = (tf: GoalTimeframe) => (
    <div style={{
      border: `1px dashed ${t.border}`, borderRadius: CARD_RADIUS_SM,
      padding: '20px 16px', textAlign: 'center', background: 'transparent',
    }}>
      <div style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT, marginBottom: 4 }}>
        No {tf === 'short' ? 'short-term' : 'long-term'} goals yet.
      </div>
      <button onClick={() => addGoal(tf)} style={{
        background: 'none', border: 'none', color: t.text, fontFamily: FONT_MEDIUM,
        fontSize: 14, cursor: 'pointer', padding: 0, marginTop: 2,
      }}>Add one →</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Short-term */}
      <div>
        {sectionHead('🎯', 'Short-term', shortActive.length)}
        {shortActive.length === 0 ? emptyState('short') : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {shortActive.map(g => <GoalCard key={g.id} goal={migrateGoal(g)} onUpdate={p => updateGoal(g.id, p)} onRemove={() => removeGoal(g.id)} t={t} />)}
            </div>
            {addBtn('short')}
          </>
        )}
      </div>

      {/* Long-term */}
      <div>
        {sectionHead('🌟', 'Long-term', longActive.length)}
        {longActive.length === 0 ? emptyState('long') : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {longActive.map(g => <GoalCard key={g.id} goal={migrateGoal(g)} onUpdate={p => updateGoal(g.id, p)} onRemove={() => removeGoal(g.id)} t={t} />)}
            </div>
            {addBtn('long')}
          </>
        )}
      </div>

      {/* Completed / Paused */}
      {done.length > 0 && (
        <div style={{ opacity: 0.6 }}>
          {sectionHead('✓', 'Completed / Paused', done.length, done.length === 1 ? 'goal' : 'goals')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {done.map(g => <GoalCard key={g.id} goal={migrateGoal(g)} onUpdate={p => updateGoal(g.id, p)} onRemove={() => removeGoal(g.id)} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal: g, onUpdate, onRemove, t }: {
  goal: Goal; onUpdate: (p: Partial<Goal>) => void; onRemove: () => void; t: Theme;
}) {
  // New goals (no title) start expanded so the user can fill them in.
  const [expanded, setExpanded] = useState(!g.title);
  const [hovered, setHovered] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newLog, setNewLog] = useState('');

  const checklist = g.checklist || [];
  const log = g.log || [];
  const doneCount = checklist.filter(c => c.done).length;
  const progress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;
  const allDone = checklist.length > 0 && doneCount === checklist.length;

  // Status pill styling (compact view)
  const statusStyles: Record<GoalStatus, { bg: string; text: string }> = {
    active: { bg: 'rgba(48,180,98,0.15)', text: '#2d8a56' },
    paused: { bg: 'rgba(245,158,11,0.15)', text: '#d97706' },
    completed: { bg: '#2d8a56', text: '#ffffff' },
  };
  const statusLabel: Record<GoalStatus, string> = {
    active: 'Active', paused: 'Paused', completed: 'Completed',
  };

  // Deadline display: "Jul 1 (62d)" or "62d overdue" or "no deadline"
  const deadlineDisplay = (() => {
    if (!g.deadline) return { label: 'no deadline', color: t.textMuted, overdue: false };
    const dt = new Date(g.deadline + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = dt.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)}d overdue`, color: '#ef4444', overdue: true };
    }
    if (diffDays === 0) {
      return { label: `${dateStr} (today)`, color: '#d97706', overdue: false };
    }
    return { label: `${dateStr} (${diffDays}d)`, color: t.textMuted, overdue: false };
  })();

  const isOverdueAndIncomplete = deadlineDisplay.overdue && progress < 100 && g.status === 'active';

  const addCheckItem = () => {
    if (!newItem.trim()) return;
    const item: GoalCheckItem = { id: Date.now().toString(), text: newItem.trim(), done: false };
    const updated = [...checklist, item];
    const d = updated.filter(c => c.done).length;
    onUpdate({ checklist: updated, progress: updated.length > 0 ? Math.round((d / updated.length) * 100) : 0 });
    setNewItem('');
  };

  const toggleCheck = (id: string) => {
    const updated = checklist.map(c => c.id === id ? { ...c, done: !c.done } : c);
    const d = updated.filter(c => c.done).length;
    onUpdate({ checklist: updated, progress: updated.length > 0 ? Math.round((d / updated.length) * 100) : 0 });
  };

  const removeCheck = (id: string) => {
    const updated = checklist.filter(c => c.id !== id);
    const d = updated.filter(c => c.done).length;
    onUpdate({ checklist: updated, progress: updated.length > 0 ? Math.round((d / updated.length) * 100) : 0 });
  };

  const addLogEntry = () => {
    if (!newLog.trim()) return;
    const entry: GoalLogEntry = { id: Date.now().toString(), text: newLog.trim(), date: localToday() };
    onUpdate({ log: [entry, ...log] });
    setNewLog('');
  };

  const removeLog = (id: string) => {
    onUpdate({ log: log.filter(l => l.id !== id) });
  };

  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // First unchecked item (the "next action")
  const nextAction = checklist.find(c => !c.done);

  // Goal-type emoji
  const goalEmoji = g.timeframe === 'long' ? '🌟' : '🎯';

  // Progress bar color
  const progressColor = isOverdueAndIncomplete ? '#ef4444' : progress === 100 ? '#2d8a56' : '#3b82f6';

  // ───────── COMPACT VIEW ─────────
  if (!expanded) {
    const titleDisplay = g.title.trim() || 'Untitled goal';
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          // Only toggle when clicking the card body, not interactive elements
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest('input')) return;
          setExpanded(true);
        }}
        style={{
          border: `1px solid ${t.border}`, borderRadius: CARD_RADIUS,
          padding: 16, background: t.cardBg, cursor: 'pointer',
          transition: APPLE_TRANSITION,
          boxShadow: hovered ? CARD_SHADOW : 'none',
          transform: hovered ? 'translateY(-1px)' : 'none',
        }}
      >
        {/* Top row: title + emoji + deadline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{goalEmoji}</span>
          <span style={{
            flex: 1, fontFamily: FONT_MEDIUM, fontSize: 15,
            color: g.title.trim() ? t.textStrong : t.textMuted,
            letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{titleDisplay}</span>
          <span style={{
            fontSize: 13, color: deadlineDisplay.color, fontFamily: FONT_MEDIUM,
            flexShrink: 0,
          }}>{deadlineDisplay.label}</span>
        </div>

        {/* Progress bar */}
        {checklist.length > 0 ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              height: 8, borderRadius: 4, background: t.accentSubtle, overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`, height: '100%', borderRadius: 4,
                background: progressColor,
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
            <div style={{ marginTop: 5, fontSize: 12, color: t.textMuted, fontFamily: FONT }}>
              {progress}% · {doneCount} of {checklist.length} done
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              height: 8, borderRadius: 4, background: t.accentSubtle, overflow: 'hidden',
            }} />
            <div style={{ marginTop: 5, fontSize: 12, color: t.textMuted, fontFamily: FONT }}>
              No checklist yet
            </div>
          </div>
        )}

        {/* Next action / all done / empty */}
        {checklist.length === 0 ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(true); }} style={{
            width: '100%', background: t.inputBg, border: `1px solid ${t.border}`,
            color: t.textMuted, padding: '10px 12px', borderRadius: CARD_RADIUS_SM,
            fontFamily: FONT, fontSize: 13, cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: APPLE_TRANSITION,
          }}>
            <span>↪ Add first action item</span>
            <span style={{ opacity: 0.6 }}>→</span>
          </button>
        ) : allDone && g.status === 'active' ? (
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ status: 'completed' }); }} style={{
            width: '100%', background: 'rgba(48,180,98,0.12)', border: `1px solid rgba(48,180,98,0.3)`,
            color: '#2d8a56', padding: '10px 12px', borderRadius: CARD_RADIUS_SM,
            fontFamily: FONT_MEDIUM, fontSize: 13, cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: APPLE_TRANSITION,
          }}>
            <span>✓ All actions done — mark goal complete?</span>
            <span>→</span>
          </button>
        ) : nextAction ? (
          <div style={{
            background: t.inputBg, border: `1px solid ${t.border}`,
            borderRadius: CARD_RADIUS_SM, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, flexShrink: 0,
            }}>↪ Next:</span>
            <span style={{
              flex: 1, fontSize: 13, color: t.text, fontFamily: FONT,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{nextAction.text}</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleCheck(nextAction.id); }}
              title="Mark done"
              style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${t.border}`, background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: t.textMuted, fontSize: 12, transition: APPLE_TRANSITION,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(48,180,98,0.5)';
                e.currentTarget.style.background = 'rgba(48,180,98,0.1)';
                e.currentTarget.style.color = '#2d8a56';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = t.textMuted;
              }}
            >☐</button>
          </div>
        ) : null}

        {/* Bottom row: status pill + log count + edit */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 12,
        }}>
          <span style={{
            fontSize: 12, fontFamily: FONT_MEDIUM, padding: '3px 9px', borderRadius: 999,
            background: statusStyles[g.status].bg, color: statusStyles[g.status].text,
          }}>{statusLabel[g.status]}</span>
          <span style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT }}>·</span>
          <span style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT }}>
            {log.length} {log.length === 1 ? 'log' : 'logs'}
          </span>
          <span style={{ flex: 1 }} />
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            style={{
              background: 'none', border: 'none', color: t.textMuted,
              fontFamily: FONT_MEDIUM, fontSize: 12, cursor: 'pointer', padding: '2px 4px',
              transition: APPLE_TRANSITION, display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; }}
          >✏ Edit</button>
        </div>
      </div>
    );
  }

  // ───────── EXPANDED EDIT VIEW ─────────
  const sectionLabel = (text: string) => (
    <div style={{
      fontSize: 11, fontFamily: FONT_MEDIUM, color: t.textMuted,
      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
    }}>{text}</div>
  );

  const segBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '7px 10px', borderRadius: 7,
    background: active ? t.cardBg : 'transparent',
    color: active ? t.textStrong : t.textMuted,
    border: 'none',
    fontFamily: FONT_MEDIUM, fontSize: 13, cursor: 'pointer',
    transition: APPLE_TRANSITION,
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' : 'none',
  });

  return (
    <div style={{
      border: `1px solid ${t.border}`, borderRadius: CARD_RADIUS,
      padding: 18, background: t.cardBg,
      boxShadow: CARD_SHADOW,
      transition: APPLE_TRANSITION,
    }}>
      {/* Header bar with collapse */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>{goalEmoji}</span>
        <span style={{
          flex: 1, fontFamily: FONT_MEDIUM, fontSize: 13, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>Editing goal</span>
        <button onClick={() => setExpanded(false)} style={{
          background: 'none', border: 'none', color: t.textMuted,
          fontFamily: FONT_MEDIUM, fontSize: 13, cursor: 'pointer', padding: '4px 8px',
          borderRadius: 6, transition: APPLE_TRANSITION,
        }}
          onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.background = t.inputBg; }}
          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = 'transparent'; }}
        >Done editing ✓</button>
      </div>

      {/* ── Goal section ── */}
      <div style={{ marginBottom: 18 }}>
        {sectionLabel('Goal')}
        <input value={g.title} onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Goal title..."
          style={{
            background: t.inputBg, border: `1px solid ${t.border}`, color: t.textStrong,
            fontFamily: FONT_MEDIUM, fontSize: 15, outline: 'none', width: '100%',
            padding: '9px 12px', borderRadius: CARD_RADIUS_SM, boxSizing: 'border-box',
            marginBottom: 8, transition: APPLE_TRANSITION, letterSpacing: '-0.01em',
          }}
          onFocus={e => { e.target.style.borderColor = t.textMuted; }}
          onBlur={e => { e.target.style.borderColor = t.border; }}
        />
        <TextArea value={g.description} onChange={v => onUpdate({ description: v })}
          placeholder="Why this matters and what 'done' looks like" t={t} minHeight={60} />
      </div>

      {/* ── Timeline section ── */}
      <div style={{ marginBottom: 18 }}>
        {sectionLabel('Timeline')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT, flexShrink: 0 }}>Target:</span>
          <input type="date" value={g.deadline || ''} onChange={e => onUpdate({ deadline: e.target.value })}
            style={{
              background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
              fontFamily: FONT, fontSize: 13, outline: 'none',
              padding: '6px 10px', borderRadius: 8, transition: APPLE_TRANSITION,
            }}
          />
          {g.deadline && (
            <span style={{ fontSize: 12, color: deadlineDisplay.color, fontFamily: FONT_MEDIUM }}>
              {deadlineDisplay.label}
            </span>
          )}
        </div>
        {/* Segmented status switcher */}
        <div style={{
          display: 'flex', gap: 2, padding: 3, background: t.accentSubtle,
          borderRadius: 9,
        }}>
          {(['active', 'paused', 'completed'] as GoalStatus[]).map(s => (
            <button key={s} onClick={() => onUpdate({ status: s })} style={segBtnStyle(g.status === s)}>
              {statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Action items section ── */}
      <div style={{ marginBottom: 18 }}>
        {sectionLabel(`Action items${checklist.length > 0 ? ` · ${doneCount}/${checklist.length}` : ''}`)}
        {checklist.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {checklist.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0',
              }}>
                <button onClick={() => toggleCheck(c.id)} style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${c.done ? 'rgba(48,180,98,0.5)' : t.border}`,
                  background: c.done ? 'rgba(48,180,98,0.15)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#2d8a56', fontSize: 12, transition: APPLE_TRANSITION,
                }}>{c.done ? '✓' : ''}</button>
                <span style={{
                  fontSize: 13, color: c.done ? t.textMuted : t.text, fontFamily: FONT,
                  textDecoration: c.done ? 'line-through' : 'none', flex: 1,
                }}>{c.text}</span>
                <button onClick={() => removeCheck(c.id)} style={{
                  background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
                  fontSize: 14, opacity: 0.5, padding: '2px 4px',
                }}>&times;</button>
              </div>
            ))}
          </div>
        )}
        <input value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCheckItem()}
          placeholder="Add an action item, press Enter..."
          style={{
            width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '8px 12px', borderRadius: CARD_RADIUS_SM,
            fontFamily: FONT, fontSize: 13, outline: 'none',
            boxSizing: 'border-box', transition: APPLE_TRANSITION,
          }}
          onFocus={e => { e.target.style.borderColor = t.textMuted; }}
          onBlur={e => { e.target.style.borderColor = t.border; }}
        />
      </div>

      {/* ── Progress log section ── */}
      <div style={{ marginBottom: 16 }}>
        {sectionLabel(`Progress log${log.length > 0 ? ` · ${log.length}` : ''}`)}
        <input value={newLog} onChange={e => setNewLog(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addLogEntry()}
          placeholder={log.length === 0 ? 'Log your first update, press Enter...' : 'Log an update, press Enter...'}
          style={{
            width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '8px 12px', borderRadius: CARD_RADIUS_SM,
            fontFamily: FONT, fontSize: 13, outline: 'none',
            boxSizing: 'border-box', marginBottom: log.length > 0 ? 10 : 0,
            transition: APPLE_TRANSITION,
          }}
          onFocus={e => { e.target.style.borderColor = t.textMuted; }}
          onBlur={e => { e.target.style.borderColor = t.border; }}
        />
        {log.length > 0 && (
          <div>
            {log.map(l => (
              <div key={l.id} style={{
                display: 'flex', gap: 10, padding: '5px 0', alignItems: 'start',
              }}>
                <span style={{
                  fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM,
                  flexShrink: 0, minWidth: 50, paddingTop: 1,
                }}>{fmtDate(l.date)}</span>
                <span style={{ fontSize: 13, color: t.text, fontFamily: FONT, flex: 1 }}>{l.text}</span>
                <button onClick={() => removeLog(l.id)} style={{
                  background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
                  fontSize: 14, opacity: 0.5, padding: '0 4px',
                }}>&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer: delete ── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        paddingTop: 12, borderTop: `1px solid ${t.border}`,
      }}>
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', color: '#ef4444',
          fontFamily: FONT, fontSize: 12, cursor: 'pointer', padding: '4px 8px',
          opacity: 0.75, transition: APPLE_TRANSITION, borderRadius: 6,
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'transparent'; }}
        >Delete goal</button>
      </div>
    </div>
  );
}

// ── Ideas Tab ──
function IdeasTab({ ideas, setIdeas, t }: {
  ideas: ProjectIdea[]; setIdeas: (fn: (prev: ProjectIdea[]) => ProjectIdea[]) => void; t: Theme;
}) {
  const [newTitle, setNewTitle] = useState('');

  const addIdea = () => {
    if (!newTitle.trim()) return;
    setIdeas(prev => [{
      id: Date.now().toString(), title: newTitle.trim(), description: '',
      tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }, ...prev]);
    setNewTitle('');
  };

  const updateIdea = (id: string, patch: Partial<ProjectIdea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i));
  };

  const removeIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div>
      {/* Quick capture */}
      <div style={{ marginBottom: 20 }}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addIdea()}
          placeholder="What's the idea? Press Enter to add..."
          style={{
            background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '12px 14px', borderRadius: 10, fontFamily: FONT, fontSize: 14,
            width: '100%', outline: 'none', transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = t.textMuted; }}
          onBlur={e => { e.target.style.borderColor = t.border; }}
        />
      </div>

      {/* Idea cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onUpdate={p => updateIdea(idea.id, p)}
            onRemove={() => removeIdea(idea.id)} t={t} />
        ))}
        {ideas.length === 0 && (
          <p style={{ color: t.textMuted, fontSize: 14, textAlign: 'center', padding: 32 }}>
            No ideas yet. Type one above and press Enter.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Idea Card ──
function IdeaCard({ idea, onUpdate, onRemove, t }: {
  idea: ProjectIdea; onUpdate: (p: Partial<ProjectIdea>) => void;
  onRemove: () => void; t: Theme;
}) {
  const [expanded, setExpanded] = useState(!!idea.description);
  const dateLabel = new Date(idea.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, background: t.cardBg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <input value={idea.title} onChange={e => onUpdate({ title: e.target.value })} style={{
            background: 'transparent', border: 'none', color: t.textStrong,
            fontFamily: FONT_MEDIUM, fontSize: 14, width: '100%', outline: 'none',
            padding: 0,
          }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 14, color: t.textMuted }}>{dateLabel}</span>
            {idea.tags.length > 0 && idea.tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: 14, padding: '1px 6px', borderRadius: 4,
                background: t.accentSubtle, color: t.textMuted,
              }}>{tag}</span>
            ))}
            <button onClick={() => setExpanded(!expanded)} style={{
              background: 'none', border: 'none', color: t.textMuted,
              cursor: 'pointer', fontSize: 14, fontFamily: FONT,
            }}>{expanded ? 'collapse' : 'expand'}</button>
          </div>
        </div>
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', color: t.textMuted,
          cursor: 'pointer', fontSize: 16, padding: '0 4px',
        }}>&times;</button>
      </div>
      {expanded && (
        <div style={{ marginTop: 10 }}>
          <TextArea value={idea.description} onChange={v => onUpdate({ description: v })}
            placeholder="Notes, links, brain dump..." t={t} minHeight={60} />
          <div style={{ marginTop: 6 }}>
            <input value={idea.tags.join(', ')}
              onChange={e => onUpdate({ tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="Tags (comma separated)"
              style={{
                background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
                padding: '5px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 14,
                width: '100%', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── One-time data seeding (runs once per key, never re-injects) ──
function runOneTimeSeed(
  key: string,
  contacts: NetworkContact[],
  journal: JournalEntry[],
): { contacts: NetworkContact[]; journal: JournalEntry[] } {
  const flag = `bb-seeded-${key}`;
  if (typeof window !== 'undefined' && localStorage.getItem(flag)) return { contacts, journal };

  let c = contacts;
  let j = journal;

  if (key === 'linear') {
    if (c.some(x => x.company === 'Linear')) { if (typeof window !== 'undefined') localStorage.setItem(flag, '1'); return { contacts: c, journal: j }; }
    const today = localToday();
    const people = [
      { name: 'Lena Vu Sawyer' }, { name: 'Sabin Roman' },
      { name: 'Tom Moor' }, { name: 'Mufeez Amjad' },
    ];
    c = [...c, ...people.map((p, i): NetworkContact => ({
      id: `linear-${Date.now()}-${i}`, name: p.name, company: 'Linear', role: '',
      category: 'awaiting-reply', urgency: 'waiting',
      whatTheySaid: '', actionNeeded: 'Wait for reply',
      whyReachOut: '', companyInfo: 'Project management tool for software teams', foundVia: 'LinkedIn',
      scoutingStatus: 'ready', outreachStatus: 'dm-sent',
      platform: 'LinkedIn', lastContactDate: today, nextAction: 'Wait for reply',
      notes: '', createdAt: new Date().toISOString(),
    }))];
  }

  if (key === 'offdeal') {
    if (c.some(x => x.company === 'Offdeal')) { if (typeof window !== 'undefined') localStorage.setItem(flag, '1'); return { contacts: c, journal: j }; }
    const today = localToday();
    const people = [
      { name: 'Alston Lin', role: 'CTO & Co-founder' },
      { name: 'Luis Ruiz Morel', role: 'Founding Engineer' },
    ];
    c = [...c, ...people.map((p, i): NetworkContact => ({
      id: `offdeal-${Date.now()}-${i}`, name: p.name, company: 'Offdeal', role: p.role,
      category: 'awaiting-reply', urgency: 'waiting',
      whatTheySaid: '', actionNeeded: 'Wait for reply',
      whyReachOut: '', companyInfo: '', foundVia: 'LinkedIn',
      scoutingStatus: 'ready', outreachStatus: 'dm-sent',
      platform: 'LinkedIn', lastContactDate: today, nextAction: 'Wait for reply',
      notes: 'Connection request sent with note', createdAt: new Date().toISOString(),
    }))];
  }

  if (key === 'ostium') {
    if (c.some(x => x.company === 'Ostium')) { if (typeof window !== 'undefined') localStorage.setItem(flag, '1'); return { contacts: c, journal: j }; }
    const today = localToday();
    const ostium: NetworkContact = {
      id: `ostium-${Date.now()}-0`, name: 'Shrey Paharia', company: 'Ostium', role: 'Senior Developer',
      category: 'awaiting-reply', urgency: 'waiting',
      whatTheySaid: '', actionNeeded: 'Wait for reply',
      whyReachOut: '', companyInfo: '$38B+ volume, backed by General Catalyst & Jump', foundVia: 'LinkedIn',
      scoutingStatus: 'ready', outreachStatus: 'dm-sent',
      platform: 'LinkedIn', lastContactDate: today, nextAction: 'Wait for reply',
      notes: 'Connection request sent with note', createdAt: new Date().toISOString(),
    };
    c = [...c, ostium];
  }

  if (key === 'vivek-apr9') {
    const apr9 = '2026-04-09';
    const existing = j.find(e => e.date === apr9);
    if (existing?.meetings?.some(m => m.person === 'Vivek')) { if (typeof window !== 'undefined') localStorage.setItem(flag, '1'); return { contacts: c, journal: j }; }
    const vivekMeeting: Meeting = {
      id: `vivek-${Date.now()}`, title: '30 min call', person: 'Vivek',
      time: '7:00 PM', notes: '7:00 - 7:30pm ET',
    };
    const entry = j.find(e => e.date === apr9);
    if (entry) {
      j = j.map(e => e.date === apr9
        ? { ...e, meetings: [...(e.meetings || []), vivekMeeting], updatedAt: new Date().toISOString() }
        : e);
    } else {
      j = [...j, { id: apr9, date: apr9, body: '', tomorrow: '', meetings: [vivekMeeting], updatedAt: new Date().toISOString() }];
    }
  }

  if (typeof window !== 'undefined') localStorage.setItem(flag, '1');
  return { contacts: c, journal: j };
}

/* ═══════════════════════════════════════════════════════════
   GOOGLE CALENDAR INTEGRATION
   ═══════════════════════════════════════════════════════════
   GOOGLE CALENDAR SETUP:
   1. Go to https://console.cloud.google.com/
   2. Create a new project (or select an existing one)
   3. Enable the Google Calendar API
   4. Create OAuth 2.0 credentials (Web application)
   5. Add the following to "Authorized JavaScript origins":
        - http://localhost:4321
        - https://www.ronnielgandhe.com
   6. Copy the Client ID and either:
        a) set VITE_GOOGLE_CLIENT_ID in your .env, OR
        b) replace 'PASTE_CLIENT_ID_HERE' below with the literal id
*/
const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) ||
  'PASTE_CLIENT_ID_HERE';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_TOKEN_KEY = 'bb-google-token';

interface GoogleEvent {
  id: string; summary: string; start: string; end: string;
  description?: string; htmlLink?: string;
}

interface GoogleTokenInfo {
  access_token: string; expires_at: number;
}

// Loads gapi/gis scripts (idempotent)
function loadGoogleScripts(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as any;
  if (w.__bbGapiLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const ensure = (src: string) => new Promise<void>((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = true; s.defer = true;
      s.onload = () => res();
      s.onerror = () => rej(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
    Promise.all([
      ensure('https://accounts.google.com/gsi/client'),
      ensure('https://apis.google.com/js/api.js'),
    ]).then(() => {
      w.__bbGapiLoaded = true;
      resolve();
    }).catch(reject);
  });
}

function useGoogleCalendar() {
  const [token, setToken] = useState<GoogleTokenInfo | null>(() => {
    try {
      const raw = localStorage.getItem(GOOGLE_TOKEN_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GoogleTokenInfo;
      if (parsed.expires_at < Date.now()) return null;
      return parsed;
    } catch { return null; }
  });
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenClientRef = useRef<any>(null);

  const isConfigured = GOOGLE_CLIENT_ID !== 'PASTE_CLIENT_ID_HERE' && !!GOOGLE_CLIENT_ID;

  // Initialize the token client lazily
  const ensureClient = useCallback(async () => {
    if (!isConfigured) throw new Error('Google Client ID not configured');
    await loadGoogleScripts();
    const w = window as any;
    if (!tokenClientRef.current && w.google?.accounts?.oauth2) {
      tokenClientRef.current = w.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (resp: any) => {
          if (resp.error) { setError(resp.error); return; }
          const info: GoogleTokenInfo = {
            access_token: resp.access_token,
            expires_at: Date.now() + (resp.expires_in ?? 3000) * 1000,
          };
          localStorage.setItem(GOOGLE_TOKEN_KEY, JSON.stringify(info));
          setToken(info);
        },
      });
    }
  }, [isConfigured]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      await ensureClient();
      tokenClientRef.current?.requestAccessToken();
    } catch (e: any) {
      setError(e?.message || 'Could not connect Google Calendar');
    }
  }, [ensureClient]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
    setToken(null);
    setEvents([]);
  }, []);

  // Fetch the next 7 days of events whenever token changes
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', now.toISOString());
    url.searchParams.set('timeMax', weekFromNow.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '25');
    fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
      .then(r => {
        if (r.status === 401) { disconnect(); throw new Error('Session expired'); }
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        const items = (data?.items || []) as any[];
        setEvents(items.map(e => ({
          id: e.id,
          summary: e.summary || '(No title)',
          start: e.start?.dateTime || e.start?.date || '',
          end: e.end?.dateTime || e.end?.date || '',
          description: e.description,
          htmlLink: e.htmlLink,
        })));
      })
      .catch(e => { if (!cancelled) setError(e?.message || 'Calendar fetch failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, disconnect]);

  return { token, events, loading, error, isConfigured, connect, disconnect };
}

/* ═══════════════════════════════════════════════════════════
   FINANCE TAB
   ═══════════════════════════════════════════════════════════ */

const ACCOUNT_TYPE_META: Record<AccountType, { label: string; icon: string }> = {
  checking: { label: 'Checking', icon: 'C' },
  savings: { label: 'Savings', icon: 'S' },
  tfsa: { label: 'TFSA', icon: 'T' },
  crypto: { label: 'Crypto', icon: '₿' },
  cash: { label: 'Cash', icon: '$' },
};

const DEFAULT_CATEGORIES = ['food', 'rent', 'transport', 'subs', 'salary', 'shopping', 'travel', 'misc'];

function fmtMoney(amount: number, currency: Currency): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: abs % 1 === 0 ? 0 : 2 });
  return `${sign}${currency === 'USD' ? '$' : 'CA$'}${formatted}`;
}

// Parse "Coffee 6 USD food" → { note, amount, currency, category, type }
function parseQuickTransaction(input: string): Omit<Transaction, 'id' | 'date' | 'createdAt'> | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Look for amount (first number, possibly with decimal, optional leading + or -)
  const amtMatch = trimmed.match(/(-?\$?\d+(?:\.\d{1,2})?)/);
  if (!amtMatch) return null;
  const rawAmt = amtMatch[1].replace('$', '');
  const amount = parseFloat(rawAmt);
  if (Number.isNaN(amount)) return null;
  const type: 'income' | 'expense' = amount < 0 || /\b(spent|paid|bought)\b/i.test(trimmed) ? 'expense'
    : /\b(income|earned|got|received|paid me)\b/i.test(trimmed) ? 'income' : 'expense';
  const tokens = trimmed.split(/\s+/);
  const currency: Currency = tokens.some(tok => /usd/i.test(tok)) ? 'USD'
    : tokens.some(tok => /cad/i.test(tok)) ? 'CAD' : 'USD';
  const noteParts: string[] = [];
  let category = '';
  for (const tok of tokens) {
    if (tok === amtMatch[1] || /^\$?\d/.test(tok)) continue;
    if (/^(usd|cad)$/i.test(tok)) continue;
    if (!category && DEFAULT_CATEGORIES.includes(tok.toLowerCase())) {
      category = tok.toLowerCase();
    } else {
      noteParts.push(tok);
    }
  }
  if (!category) category = 'misc';
  return {
    amount: Math.abs(amount),
    currency, type, category,
    note: noteParts.join(' '),
  };
}

function FinanceOverview({ finance, t }: { finance: FinanceData; t: Theme }) {
  const month = thisMonthKey();
  const monthlyTx = finance.transactions.filter(x => monthKey(x.date) === month);
  const incomeCAD = monthlyTx.filter(x => x.type === 'income').reduce((s, x) => s + toCAD(x.amount, x.currency), 0);
  const expenseCAD = monthlyTx.filter(x => x.type === 'expense').reduce((s, x) => s + toCAD(x.amount, x.currency), 0);
  const savingsRate = incomeCAD > 0 ? Math.max(0, Math.round((1 - expenseCAD / incomeCAD) * 100)) : 0;
  const netWorthCAD = finance.accounts.reduce((s, a) => s + toCAD(a.balance, a.currency), 0);
  const tfsaGoal = finance.goals.find(g => /tfsa/i.test(g.name));

  const Stat = ({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pos' | 'neg' }) => (
    <div style={{
      flex: 1, minWidth: 140, padding: '14px 16px',
      background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: CARD_RADIUS_SM,
    }}>
      <div style={{ fontSize: 11, color: t.textMuted, fontFamily: FONT_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontFamily: FONT_MEDIUM, color: tone === 'pos' ? '#22c55e' : tone === 'neg' ? '#ef4444' : t.textStrong, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{
      background: t.cardBg, borderRadius: CARD_RADIUS, padding: 20,
      border: `1px solid ${t.border}`, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Stat label="Net Worth" value={fmtMoney(Math.round(netWorthCAD), 'CAD')} sub={`across ${finance.accounts.length} accounts`} />
        <Stat label="In (this month)" value={fmtMoney(Math.round(incomeCAD), 'CAD')} tone="pos" />
        <Stat label="Out (this month)" value={fmtMoney(Math.round(expenseCAD), 'CAD')} tone="neg" />
        <Stat label="Savings Rate" value={`${savingsRate}%`} sub={savingsRate >= 50 ? 'on track' : 'push harder'} />
      </div>
      {tfsaGoal && tfsaGoal.targetAmount > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontFamily: FONT_MEDIUM, color: t.textStrong }}>{tfsaGoal.name}</span>
            <span style={{ fontSize: 12, color: t.textMuted }}>
              {fmtMoney(tfsaGoal.currentAmount, tfsaGoal.currency)} of {fmtMoney(tfsaGoal.targetAmount, tfsaGoal.currency)}
            </span>
          </div>
          <div style={{ height: 8, background: t.accentSubtle, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, (tfsaGoal.currentAmount / tfsaGoal.targetAmount) * 100))}%`,
              height: '100%', background: '#22c55e',
              transition: APPLE_TRANSITION,
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function FinanceAccounts({ finance, setFinance, t }: {
  finance: FinanceData; setFinance: (fn: (prev: FinanceData) => FinanceData) => void; t: Theme;
}) {
  const updateAccount = (id: string, patch: Partial<Account>) => {
    setFinance(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id
        ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a),
    }));
  };
  const addAccount = () => {
    setFinance(prev => ({
      ...prev,
      accounts: [...prev.accounts, {
        id: Date.now().toString(), name: '', type: 'checking',
        currency: 'CAD', balance: 0, updatedAt: new Date().toISOString(),
      }],
    }));
  };
  const removeAccount = (id: string) => {
    setFinance(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  };

  return (
    <div style={{
      background: t.cardBg, borderRadius: CARD_RADIUS, padding: 20,
      border: `1px solid ${t.border}`, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 17, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.01em' }}>Accounts</span>
        <button onClick={addAccount} style={{
          background: t.accentSubtle, border: 'none', color: t.textStrong,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          fontFamily: FONT_MEDIUM, fontSize: 12, transition: APPLE_TRANSITION,
        }}>+ Account</button>
      </div>
      {finance.accounts.length === 0 && (
        <p style={{ color: t.textMuted, fontSize: 13, padding: 20, textAlign: 'center' }}>No accounts yet. Add your first.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {finance.accounts.map(a => (
          <div key={a.id} style={{
            display: 'grid', gridTemplateColumns: '32px 1.5fr 1fr 80px 1fr 24px',
            gap: 10, alignItems: 'center', padding: '10px 12px',
            background: t.inputBg, borderRadius: CARD_RADIUS_SM,
            border: `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: t.accentSubtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontFamily: FONT_MEDIUM, color: t.textMuted,
            }}>{ACCOUNT_TYPE_META[a.type].icon}</div>
            <input value={a.name} onChange={e => updateAccount(a.id, { name: e.target.value })}
              placeholder="Account name" style={{
                background: 'transparent', border: 'none', color: t.textStrong,
                fontFamily: FONT_MEDIUM, fontSize: 13, outline: 'none', padding: 0,
              }} />
            <select value={a.type} onChange={e => updateAccount(a.id, { type: e.target.value as AccountType })}
              style={{
                background: 'transparent', border: 'none', color: t.textMuted,
                fontFamily: FONT, fontSize: 12, outline: 'none', cursor: 'pointer',
              }}>
              {(Object.keys(ACCOUNT_TYPE_META) as AccountType[]).map(k => (
                <option key={k} value={k}>{ACCOUNT_TYPE_META[k].label}</option>
              ))}
            </select>
            <select value={a.currency} onChange={e => updateAccount(a.id, { currency: e.target.value as Currency })}
              style={{
                background: 'transparent', border: 'none', color: t.textMuted,
                fontFamily: FONT, fontSize: 12, outline: 'none', cursor: 'pointer',
              }}>
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>
            <input value={a.balance} onChange={e => updateAccount(a.id, { balance: parseFloat(e.target.value) || 0 })}
              type="number" step="0.01" style={{
                background: 'transparent', border: 'none', color: t.textStrong,
                fontFamily: FONT_MEDIUM, fontSize: 13, outline: 'none', padding: 0,
                textAlign: 'right',
              }} />
            <button onClick={() => removeAccount(a.id)} style={{
              background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
              fontSize: 14, opacity: 0.5,
            }}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceTransactions({ finance, setFinance, t }: {
  finance: FinanceData; setFinance: (fn: (prev: FinanceData) => FinanceData) => void; t: Theme;
}) {
  const [quickInput, setQuickInput] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'date'>) => {
    const now = new Date().toISOString();
    const t: Transaction = {
      id: Date.now().toString(), date: localToday(),
      createdAt: now, ...tx,
    };
    setFinance(prev => ({ ...prev, transactions: [t, ...prev.transactions] }));
  };
  const updateTransaction = (id: string, patch: Partial<Transaction>) => {
    setFinance(prev => ({
      ...prev, transactions: prev.transactions.map(x => x.id === id ? { ...x, ...patch } : x),
    }));
  };
  const removeTransaction = (id: string) => {
    setFinance(prev => ({ ...prev, transactions: prev.transactions.filter(x => x.id !== id) }));
  };

  const handleQuickAdd = () => {
    if (!quickInput.trim()) return;
    const parsed = parseQuickTransaction(quickInput);
    if (parsed) {
      addTransaction(parsed);
      setQuickInput('');
    }
  };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  let visible = finance.transactions
    .filter(x => x.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (filterCat !== 'all') visible = visible.filter(x => x.category === filterCat);
  if (filterType !== 'all') visible = visible.filter(x => x.type === filterType);

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...finance.transactions.map(x => x.category).filter(Boolean)]));

  return (
    <div style={{
      background: t.cardBg, borderRadius: CARD_RADIUS, padding: 20,
      border: `1px solid ${t.border}`, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 17, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.01em' }}>Transactions</span>
        <span style={{ fontSize: 12, color: t.textMuted }}>last 30 days</span>
      </div>

      {/* Quick add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={quickInput} onChange={e => setQuickInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
          placeholder="e.g. Coffee 6 USD food"
          style={{
            flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '10px 14px', borderRadius: 10, fontFamily: FONT, fontSize: 13,
            outline: 'none', transition: APPLE_TRANSITION,
          }} />
        <button onClick={handleQuickAdd} style={{
          background: t.accentSubtle, border: 'none', color: t.textStrong,
          padding: '0 16px', borderRadius: 10, cursor: 'pointer',
          fontFamily: FONT_MEDIUM, fontSize: 13,
        }}>Add</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, fontSize: 12 }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value as any)} style={{
          background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
          padding: '6px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 12, outline: 'none',
        }}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
          background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
          padding: '6px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 12, outline: 'none',
        }}>
          <option value="all">All categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      {visible.length === 0 && (
        <p style={{ color: t.textMuted, fontSize: 13, padding: 20, textAlign: 'center' }}>No transactions in this range.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {visible.map(x => (
          <div key={x.id} style={{
            display: 'grid', gridTemplateColumns: '70px 1fr 80px 100px 24px',
            gap: 10, alignItems: 'center', padding: '8px 10px',
            borderRadius: 8, transition: APPLE_TRANSITION,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = t.accentSubtle; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <input type="date" value={x.date} onChange={e => updateTransaction(x.id, { date: e.target.value })}
              style={{
                background: 'transparent', border: 'none', color: t.textMuted,
                fontFamily: FONT, fontSize: 12, outline: 'none',
              }} />
            <input value={x.note} onChange={e => updateTransaction(x.id, { note: e.target.value })}
              placeholder="note" style={{
                background: 'transparent', border: 'none', color: t.text,
                fontFamily: FONT, fontSize: 13, outline: 'none', padding: 0,
              }} />
            <select value={x.category} onChange={e => updateTransaction(x.id, { category: e.target.value })}
              style={{
                background: 'transparent', border: 'none', color: t.textMuted,
                fontFamily: FONT, fontSize: 12, outline: 'none', cursor: 'pointer',
              }}>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{
              fontFamily: FONT_MEDIUM, fontSize: 13, textAlign: 'right',
              color: x.type === 'income' ? '#22c55e' : t.text,
            }}>
              {x.type === 'income' ? '+' : '-'}{fmtMoney(x.amount, x.currency)}
            </span>
            <button onClick={() => removeTransaction(x.id)} style={{
              background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
              fontSize: 14, opacity: 0.4,
            }}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceBudgets({ finance, setFinance, t }: {
  finance: FinanceData; setFinance: (fn: (prev: FinanceData) => FinanceData) => void; t: Theme;
}) {
  const month = thisMonthKey();
  const updateBudget = (id: string, patch: Partial<Budget>) => {
    setFinance(prev => ({
      ...prev, budgets: prev.budgets.map(b => b.id === id ? { ...b, ...patch } : b),
    }));
  };
  const addBudget = () => {
    setFinance(prev => ({
      ...prev, budgets: [...prev.budgets, {
        id: Date.now().toString(), category: 'misc', monthlyTarget: 0, currency: 'CAD',
      }],
    }));
  };
  const removeBudget = (id: string) => {
    setFinance(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  };

  return (
    <div style={{
      background: t.cardBg, borderRadius: CARD_RADIUS, padding: 20,
      border: `1px solid ${t.border}`, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 17, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.01em' }}>Budgets</span>
        <button onClick={addBudget} style={{
          background: t.accentSubtle, border: 'none', color: t.textStrong,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          fontFamily: FONT_MEDIUM, fontSize: 12,
        }}>+ Budget</button>
      </div>
      {finance.budgets.length === 0 && (
        <p style={{ color: t.textMuted, fontSize: 13, padding: 20, textAlign: 'center' }}>No budgets yet.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {finance.budgets.map(b => {
          const spent = finance.transactions
            .filter(x => x.category === b.category && monthKey(x.date) === month && x.type === 'expense')
            .reduce((s, x) => s + (x.currency === b.currency ? x.amount : toCAD(x.amount, x.currency) / (b.currency === 'USD' ? FX_USD_TO_CAD : 1)), 0);
          const pct = b.monthlyTarget > 0 ? Math.min(100, (spent / b.monthlyTarget) * 100) : 0;
          const color = pct < 80 ? '#22c55e' : pct < 100 ? '#eab308' : '#ef4444';
          return (
            <div key={b.id} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <input value={b.category} onChange={e => updateBudget(b.id, { category: e.target.value })}
                  style={{
                    background: 'transparent', border: 'none', color: t.textStrong,
                    fontFamily: FONT_MEDIUM, fontSize: 13, outline: 'none', padding: 0, flex: 1,
                  }} />
                <span style={{ fontFamily: FONT, fontSize: 12, color: t.textMuted }}>
                  {fmtMoney(Math.round(spent), b.currency)} /
                </span>
                <input value={b.monthlyTarget} onChange={e => updateBudget(b.id, { monthlyTarget: parseFloat(e.target.value) || 0 })}
                  type="number" step="1" style={{
                    background: 'transparent', border: 'none', color: t.text,
                    fontFamily: FONT_MEDIUM, fontSize: 13, outline: 'none', padding: 0, width: 80,
                    textAlign: 'right',
                  }} />
                <select value={b.currency} onChange={e => updateBudget(b.id, { currency: e.target.value as Currency })}
                  style={{
                    background: 'transparent', border: 'none', color: t.textMuted,
                    fontFamily: FONT, fontSize: 12, outline: 'none',
                  }}>
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                </select>
                <button onClick={() => removeBudget(b.id)} style={{
                  background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
                  fontSize: 14, opacity: 0.4,
                }}>&times;</button>
              </div>
              <div style={{ height: 6, background: t.accentSubtle, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', background: color,
                  transition: APPLE_TRANSITION,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinanceGoals({ finance, setFinance, t }: {
  finance: FinanceData; setFinance: (fn: (prev: FinanceData) => FinanceData) => void; t: Theme;
}) {
  const updateGoal = (id: string, patch: Partial<FinancialGoal>) => {
    setFinance(prev => ({
      ...prev, goals: prev.goals.map(g => g.id === id ? { ...g, ...patch } : g),
    }));
  };
  const addGoal = () => {
    setFinance(prev => ({
      ...prev, goals: [...prev.goals, {
        id: Date.now().toString(), name: '', targetAmount: 0, currentAmount: 0, currency: 'CAD',
      }],
    }));
  };
  const removeGoal = (id: string) => {
    setFinance(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  return (
    <div style={{
      background: t.cardBg, borderRadius: CARD_RADIUS, padding: 20,
      border: `1px solid ${t.border}`, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 17, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.01em' }}>Financial Goals</span>
        <button onClick={addGoal} style={{
          background: t.accentSubtle, border: 'none', color: t.textStrong,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          fontFamily: FONT_MEDIUM, fontSize: 12,
        }}>+ Goal</button>
      </div>
      {finance.goals.length === 0 && (
        <p style={{ color: t.textMuted, fontSize: 13, padding: 20, textAlign: 'center' }}>No financial goals yet.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {finance.goals.map(g => {
          const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
          return (
            <div key={g.id} style={{
              padding: 14, background: t.inputBg, borderRadius: CARD_RADIUS_SM,
              border: `1px solid ${t.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <input value={g.name} onChange={e => updateGoal(g.id, { name: e.target.value })}
                  placeholder="e.g. TFSA 2026" style={{
                    flex: 1, background: 'transparent', border: 'none', color: t.textStrong,
                    fontFamily: FONT_MEDIUM, fontSize: 14, outline: 'none', padding: 0,
                  }} />
                <button onClick={() => removeGoal(g.id)} style={{
                  background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
                  fontSize: 14, opacity: 0.4,
                }}>&times;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current</label>
                  <input value={g.currentAmount} onChange={e => updateGoal(g.id, { currentAmount: parseFloat(e.target.value) || 0 })}
                    type="number" step="1" style={{
                      width: '100%', background: 'transparent', border: 'none', color: t.text,
                      fontFamily: FONT_MEDIUM, fontSize: 13, outline: 'none', padding: 0,
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target</label>
                  <input value={g.targetAmount} onChange={e => updateGoal(g.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                    type="number" step="1" style={{
                      width: '100%', background: 'transparent', border: 'none', color: t.text,
                      fontFamily: FONT_MEDIUM, fontSize: 13, outline: 'none', padding: 0,
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Currency</label>
                  <select value={g.currency} onChange={e => updateGoal(g.id, { currency: e.target.value as Currency })}
                    style={{
                      width: '100%', background: 'transparent', border: 'none', color: t.text,
                      fontFamily: FONT, fontSize: 12, outline: 'none', padding: 0,
                    }}>
                    <option value="CAD">CAD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deadline</label>
                  <input type="date" value={g.deadline || ''} onChange={e => updateGoal(g.id, { deadline: e.target.value })}
                    style={{
                      width: '100%', background: 'transparent', border: 'none', color: t.text,
                      fontFamily: FONT, fontSize: 12, outline: 'none', padding: 0,
                    }} />
                </div>
              </div>
              <div style={{ height: 6, background: t.accentSubtle, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: pct >= 100 ? '#22c55e' : '#3b82f6',
                  transition: APPLE_TRANSITION,
                }} />
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4, textAlign: 'right' }}>{Math.round(pct)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinanceTab({ finance, setFinance, t }: {
  finance: FinanceData; setFinance: (fn: (prev: FinanceData) => FinanceData) => void; t: Theme;
}) {
  return (
    <div>
      <FinanceOverview finance={finance} t={t} />
      <FinanceAccounts finance={finance} setFinance={setFinance} t={t} />
      <FinanceTransactions finance={finance} setFinance={setFinance} t={t} />
      <FinanceBudgets finance={finance} setFinance={setFinance} t={t} />
      <FinanceGoals finance={finance} setFinance={setFinance} t={t} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD HOME — unified widget grid
   ═══════════════════════════════════════════════════════════ */

interface DashboardProps {
  journal: JournalEntry[];
  setJournal: (fn: (prev: JournalEntry[]) => JournalEntry[]) => void;
  contacts: NetworkContact[];
  tasks: Task[];
  goals: Goal[];
  finance: FinanceData;
  onNavigate: (tab: BlackbookTab) => void;
  t: Theme;
}

type BlackbookTab = 'dashboard' | 'journal' | 'network' | 'tasks' | 'goals' | 'ideas' | 'finance';

function Widget({ title, onClick, t, children, span }: {
  title: string; onClick?: () => void; t: Theme; children: ReactNode; span?: number;
}) {
  return (
    <button onClick={onClick} style={{
      gridColumn: span ? `span ${span}` : undefined,
      background: t.cardBg, border: `1px solid ${t.border}`,
      borderRadius: CARD_RADIUS, padding: 18,
      textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      transition: APPLE_TRANSITION, fontFamily: FONT,
      boxShadow: CARD_SHADOW, display: 'flex', flexDirection: 'column',
      minHeight: 130,
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.10)'; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = CARD_SHADOW; } }}
    >
      <div style={{
        fontSize: 11, fontFamily: FONT_MEDIUM, color: t.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
      }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </button>
  );
}

function TodayWidget({ t }: { t: Theme }) {
  const now = new Date();
  const day = now.toLocaleDateString('en', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <Widget title="Today" t={t}>
      <div style={{ fontSize: 36, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {now.getDate()}
      </div>
      <div style={{ fontSize: 13, color: t.text, marginTop: 4, fontFamily: FONT_MEDIUM }}>{day}</div>
      <div style={{ fontSize: 12, color: t.textMuted, marginTop: 'auto' }}>{dateStr}</div>
    </Widget>
  );
}

function WeatherWidget({ t }: { t: Theme }) {
  // Static stub for now. TODO: wire OpenWeather or similar.
  return (
    <Widget title="Weather · SF" t={t}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>☀</div>
        <div>
          <div style={{ fontSize: 28, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.03em' }}>72°</div>
          <div style={{ fontSize: 12, color: t.textMuted }}>Clear</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 'auto' }}>Stubbed — connect API</div>
    </Widget>
  );
}

function FinanceWidget({ finance, onClick, t }: { finance: FinanceData; onClick: () => void; t: Theme }) {
  const month = thisMonthKey();
  const monthlyTx = finance.transactions.filter(x => monthKey(x.date) === month);
  const incomeCAD = monthlyTx.filter(x => x.type === 'income').reduce((s, x) => s + toCAD(x.amount, x.currency), 0);
  const expenseCAD = monthlyTx.filter(x => x.type === 'expense').reduce((s, x) => s + toCAD(x.amount, x.currency), 0);
  const saved = incomeCAD > 0 ? Math.max(0, Math.round((1 - expenseCAD / incomeCAD) * 100)) : 0;
  return (
    <Widget title="Finance · This Month" onClick={onClick} t={t}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: t.textMuted }}>In</span>
          <span style={{ color: '#22c55e', fontFamily: FONT_MEDIUM }}>{fmtMoney(Math.round(incomeCAD), 'CAD')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: t.textMuted }}>Out</span>
          <span style={{ color: t.text, fontFamily: FONT_MEDIUM }}>{fmtMoney(Math.round(expenseCAD), 'CAD')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: t.textMuted }}>Saved</span>
          <span style={{ color: saved >= 50 ? '#22c55e' : '#eab308', fontFamily: FONT_MEDIUM }}>{saved}%</span>
        </div>
      </div>
    </Widget>
  );
}

function CalendarWidget({ journal, googleEvents, googleConfigured, googleConnected, googleLoading, onConnectGoogle, onClick, t }: {
  journal: JournalEntry[]; googleEvents: GoogleEvent[]; googleConfigured: boolean;
  googleConnected: boolean; googleLoading: boolean;
  onConnectGoogle: () => void; onClick: () => void; t: Theme;
}) {
  const today = localToday();
  // Local meetings from journal: next 7 days
  const localMeetings = journal
    .filter(e => e.date >= today)
    .flatMap(e => e.meetings.map(m => ({
      id: m.id, title: m.title || 'Untitled', date: e.date, time: m.time, source: 'local' as const,
    })))
    .filter(x => {
      const d = new Date(x.date + 'T12:00');
      const diff = (d.getTime() - new Date(today + 'T00:00').getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    });
  const googleItems = googleEvents.map(e => ({
    id: e.id, title: e.summary, date: e.start.slice(0, 10),
    time: e.start.includes('T') ? new Date(e.start).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : '',
    source: 'google' as const,
  }));
  const all = [...localMeetings, ...googleItems]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6);
  return (
    <Widget title="Calendar · Next 7 Days" onClick={onClick} t={t} span={2}>
      {!googleConfigured && (
        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8 }}>
          Google Calendar: paste Client ID in code (see comment near top of file)
        </div>
      )}
      {googleConfigured && !googleConnected && (
        <button onClick={(e) => { e.stopPropagation(); onConnectGoogle(); }} style={{
          background: t.accentSubtle, border: `1px solid ${t.border}`, color: t.textStrong,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          fontFamily: FONT_MEDIUM, fontSize: 12, marginBottom: 8, alignSelf: 'flex-start',
        }}>Connect Google Calendar</button>
      )}
      {googleLoading && <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Loading…</div>}
      {all.length === 0 && (
        <div style={{ fontSize: 12, color: t.textMuted, opacity: 0.6 }}>Nothing scheduled.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {all.map(m => {
          const isToday = m.date === today;
          const dateLabel = isToday ? 'Today' : new Date(m.date + 'T12:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
          return (
            <div key={m.source + m.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12 }}>
              <span style={{ color: isToday ? '#22c55e' : t.textMuted, fontFamily: FONT_MEDIUM, minWidth: 90 }}>
                {dateLabel}{m.time ? ` · ${m.time}` : ''}
              </span>
              <span style={{ color: t.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title}
              </span>
              {m.source === 'google' && <span style={{ fontSize: 9, color: t.textMuted, fontFamily: FONT_MEDIUM, textTransform: 'uppercase' }}>cal</span>}
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

function PrioritiesWidget({ tasks, setTasks, onClick, t }: {
  tasks: Task[]; setTasks: (fn: (prev: Task[]) => Task[]) => void; onClick: () => void; t: Theme;
}) {
  const top = tasks
    .filter(x => x.status === 'todo' && x.priority === 'high')
    .slice(0, 3);
  const fallback = top.length === 0
    ? tasks.filter(x => x.status === 'todo').slice(0, 3)
    : top;
  return (
    <Widget title="Today's Priorities" onClick={onClick} t={t}>
      {fallback.length === 0 && (
        <div style={{ fontSize: 12, color: t.textMuted, opacity: 0.6 }}>No tasks yet.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fallback.map(task => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => {
              setTasks(prev => prev.map(t => t.id === task.id
                ? { ...t, status: t.status === 'done' ? 'todo' : 'done', updatedAt: new Date().toISOString() } : t));
            }} style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${task.status === 'done' ? 'rgba(48,180,98,0.5)' : t.border}`,
              background: task.status === 'done' ? 'rgba(48,180,98,0.15)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2d8a56', fontSize: 11,
            }}>{task.status === 'done' ? '✓' : ''}</button>
            <span style={{
              fontSize: 12, color: task.status === 'done' ? t.textMuted : t.text,
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{task.title}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function GoalsWidget({ goals, onClick, t }: { goals: Goal[]; onClick: () => void; t: Theme }) {
  const active = goals.filter(g => g.status === 'active').slice(0, 3);
  return (
    <Widget title="Active Goals" onClick={onClick} t={t}>
      {active.length === 0 && (
        <div style={{ fontSize: 12, color: t.textMuted, opacity: 0.6 }}>No active goals.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.map(g => {
          const checklist = g.checklist || [];
          const doneCount = checklist.filter(c => c.done).length;
          const pct = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : (g.progress || 0);
          return (
            <div key={g.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: t.text, fontFamily: FONT_MEDIUM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{g.title || 'Untitled'}</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: t.accentSubtle, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: pct === 100 ? '#22c55e' : '#3b82f6', transition: APPLE_TRANSITION,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

function NetworkWidget({ contacts, onClick, t }: { contacts: NetworkContact[]; onClick: () => void; t: Theme }) {
  const replyNeeded = contacts.filter(c => c.category === 'reply-needed').length;
  const callsBooked = contacts.filter(c => c.category === 'call-booked').length;
  const awaiting = contacts.filter(c => c.category === 'awaiting-reply').length;
  return (
    <Widget title="Network Pulse" onClick={onClick} t={t}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: t.textMuted }}>Replies needed</span>
          <span style={{ color: replyNeeded > 0 ? '#ef4444' : t.text, fontFamily: FONT_MEDIUM }}>{replyNeeded}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: t.textMuted }}>Calls booked</span>
          <span style={{ color: t.text, fontFamily: FONT_MEDIUM }}>{callsBooked}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: t.textMuted }}>Awaiting reply</span>
          <span style={{ color: t.text, fontFamily: FONT_MEDIUM }}>{awaiting}</span>
        </div>
      </div>
    </Widget>
  );
}

function JournalWidget({ journal, setJournal, onClick, t }: {
  journal: JournalEntry[]; setJournal: (fn: (prev: JournalEntry[]) => JournalEntry[]) => void;
  onClick: () => void; t: Theme;
}) {
  const today = localToday();
  const entry = journal.find(e => e.date === today);
  const update = (body: string) => {
    if (entry) {
      setJournal(prev => prev.map(e => e.date === today
        ? { ...e, body, updatedAt: new Date().toISOString() } : e));
    } else {
      setJournal(prev => [...prev, {
        id: today, date: today, body, tomorrow: '', meetings: [],
        updatedAt: new Date().toISOString(),
      }]);
    }
  };
  return (
    <div onClick={onClick} style={{
      gridColumn: 'span 4',
      background: t.cardBg, border: `1px solid ${t.border}`,
      borderRadius: CARD_RADIUS, padding: 18, cursor: 'pointer',
      transition: APPLE_TRANSITION, fontFamily: FONT, boxShadow: CARD_SHADOW,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{
          fontSize: 11, fontFamily: FONT_MEDIUM, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>Journal · Today</span>
        <span style={{ fontSize: 11, color: t.textMuted }}>tap to expand</span>
      </div>
      <textarea
        value={entry?.body || ''}
        onChange={e => update(e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder="What did you do today? Wins, blockers, ideas..."
        rows={3}
        style={{
          width: '100%', background: t.inputBg, border: `1px solid ${t.border}`,
          color: t.text, padding: '10px 12px', borderRadius: 10,
          fontFamily: FONT, fontSize: 13, outline: 'none',
          boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5,
          letterSpacing: '-0.005em',
        }}
      />
    </div>
  );
}

function DashboardTab({
  journal, setJournal, contacts, tasks, setTasks, goals, finance, onNavigate,
  googleEvents, googleConfigured, googleConnected, googleLoading, onConnectGoogle, t,
}: DashboardProps & {
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
  googleEvents: GoogleEvent[]; googleConfigured: boolean;
  googleConnected: boolean; googleLoading: boolean;
  onConnectGoogle: () => void;
}) {
  const now = new Date();
  const heading = now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontFamily: FONT_MEDIUM, color: t.textStrong, letterSpacing: '-0.025em' }}>Today</div>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{heading}</div>
      </div>
      <div style={{
        display: 'grid', gap: 14,
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      }}>
        <TodayWidget t={t} />
        <WeatherWidget t={t} />
        <FinanceWidget finance={finance} onClick={() => onNavigate('finance')} t={t} />
        <NetworkWidget contacts={contacts} onClick={() => onNavigate('network')} t={t} />
        <CalendarWidget
          journal={journal}
          googleEvents={googleEvents}
          googleConfigured={googleConfigured}
          googleConnected={googleConnected}
          googleLoading={googleLoading}
          onConnectGoogle={onConnectGoogle}
          onClick={() => onNavigate('journal')}
          t={t}
        />
        <PrioritiesWidget tasks={tasks} setTasks={setTasks} onClick={() => onNavigate('tasks')} t={t} />
        <GoalsWidget goals={goals} onClick={() => onNavigate('goals')} t={t} />
        <JournalWidget journal={journal} setJournal={setJournal} onClick={() => onNavigate('journal')} t={t} />
      </div>
    </div>
  );
}

// ── Main Dashboard ──
export function BlackbookDashboard({ onClose, onLogout, passHash, transparent }: { onClose: () => void; onLogout?: () => void; passHash: string; transparent?: boolean }) {
  const baseTheme = useBlackbookTheme();
  // When transparent, override backgrounds to be see-through
  // Apple Control Center style: dark overlay bg, light frosted cards, dark text
  const t = transparent ? {
    ...baseTheme,
    bg: 'rgba(0,0,0,0.35)',
    cardBg: 'rgba(255,255,255,0.7)',
    inputBg: 'rgba(255,255,255,0.55)',
    border: 'rgba(0,0,0,0.12)',
    text: '#1c1917',
    textStrong: '#0c0a09',
    textMuted: 'rgba(0,0,0,0.6)',
    accentSubtle: 'rgba(0,0,0,0.08)',
  } : baseTheme;
  const [tab, setTab] = useState<BlackbookTab>('dashboard');
  const [journal, setJournal] = useState<JournalEntry[]>(() => load('journal', []));
  const [contacts, setContacts] = useState<NetworkContact[]>(() => load('contacts', DEFAULT_CONTACTS));
  const [ideas, setIdeas] = useState<ProjectIdea[]>(() => load('ideas', []));
  const [tasks, setTasks] = useState<Task[]>(() => load('tasks', []));
  const [goals, setGoals] = useState<Goal[]>(() => load('goals', []));
  const [finance, setFinance] = useState<FinanceData>(() => load('finance', DEFAULT_FINANCE));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'retrying'>('saved');
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveQueueRef = useRef(new SaveQueue());

  // Google Calendar
  const gcal = useGoogleCalendar();

  // Per-section timestamps — tracks when each section was last edited locally
  const sectionTs = useRef({ journal: '', contacts: '', ideas: '', tasks: '', goals: '', finance: '' });

  // Refs that always hold the latest state — used by sync and beforeunload
  const journalRef = useRef(journal);
  const contactsRef = useRef(contacts);
  const ideasRef = useRef(ideas);
  const tasksRef = useRef(tasks);
  const goalsRef = useRef(goals);
  const financeRef = useRef(finance);
  useEffect(() => { journalRef.current = journal; }, [journal]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);
  useEffect(() => { ideasRef.current = ideas; }, [ideas]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { goalsRef.current = goals; }, [goals]);
  useEffect(() => { financeRef.current = finance; }, [finance]);

  // Wire up save queue status
  useEffect(() => {
    saveQueueRef.current.onStatusChange = setSaveStatus;
    return () => { saveQueueRef.current.cancel(); };
  }, []);

  // Run migration once
  useEffect(() => { migrateIfNeeded(); migrateContactsV3(); migrateFinance(); }, []);

  // Load from cloud on mount — merge with localStorage using per-field timestamps
  useEffect(() => {
    loadFromCloud(passHash).then(cloud => {
      const localData: BlackbookData = {
        journal: load('journal', []),
        contacts: load('contacts', DEFAULT_CONTACTS),
        ideas: load('ideas', []),
        tasks: load('tasks', []),
        goals: load('goals', []),
        finance: load('finance', DEFAULT_FINANCE),
        journalUpdatedAt: load('journalUpdatedAt', ''),
        contactsUpdatedAt: load('contactsUpdatedAt', ''),
        ideasUpdatedAt: load('ideasUpdatedAt', ''),
        tasksUpdatedAt: load('tasksUpdatedAt', ''),
        goalsUpdatedAt: load('goalsUpdatedAt', ''),
        financeUpdatedAt: load('financeUpdatedAt', ''),
      };

      // Per-field merge: newest timestamp wins per section
      const merged = mergeCloudLocal(cloud, localData);
      let loadedJournal = merged.journal ?? [];
      let loadedContacts = merged.contacts ?? [];
      const loadedIdeas = merged.ideas ?? [];
      const loadedTasks = merged.tasks ?? [];
      const loadedGoals = merged.goals ?? [];
      const loadedFinance = (merged.finance && typeof merged.finance === 'object' && Array.isArray((merged.finance as any).accounts))
        ? merged.finance : DEFAULT_FINANCE;

      // Track section timestamps
      const now = new Date().toISOString();
      sectionTs.current = {
        journal: merged.journalUpdatedAt || now,
        contacts: merged.contactsUpdatedAt || now,
        ideas: merged.ideasUpdatedAt || now,
        tasks: merged.tasksUpdatedAt || now,
        goals: merged.goalsUpdatedAt || now,
        finance: merged.financeUpdatedAt || now,
      };

      // One-time seeds — only inject if this device hasn't seeded yet
      for (const key of ['linear', 'offdeal', 'ostium', 'vivek-apr9']) {
        const result = runOneTimeSeed(key, loadedContacts, loadedJournal);
        loadedContacts = result.contacts;
        loadedJournal = result.journal;
      }

      // Deduplicate before applying — prevents dirty cloud/localStorage data from showing dupes
      for (const entry of loadedJournal) {
        if (entry.meetings?.length > 1) {
          const seen = new Set<string>();
          entry.meetings = entry.meetings.filter(m => {
            const k = `${m.person}|${m.time}|${m.title}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        }
      }
      {
        const seen = new Set<string>();
        loadedContacts = loadedContacts.filter(c => {
          if (!c.name?.trim()) return false;
          const k = `${c.name}|${c.company}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      }

      // Migrate contacts to v3 format if needed
      loadedContacts = loadedContacts.map((c: any) => {
        if (c.category) return c;
        let category: ContactCategory = 'warm';
        let urgency: Urgency = 'later';
        const os = c.outreachStatus as string;
        if (os === 'dm-sent') { category = 'awaiting-reply'; urgency = 'waiting'; }
        else if (os === 'replied') { category = 'reply-needed'; urgency = 'soon'; }
        else if (os === 'call-scheduled') { category = 'call-booked'; urgency = 'now'; }
        else if (os === 'connected') { category = 'connected'; urgency = 'later'; }
        return { ...c, category, urgency, whatTheySaid: c.whatTheySaid || c.notes || '', actionNeeded: c.actionNeeded || c.nextAction || '' };
      });

      // Apply to state and cache locally
      setJournal(loadedJournal);
      setContacts(loadedContacts);
      setIdeas(loadedIdeas);
      setTasks(loadedTasks);
      setGoals(loadedGoals);
      setFinance(loadedFinance);
      save('journal', loadedJournal);
      save('contacts', loadedContacts);
      save('ideas', loadedIdeas);
      save('tasks', loadedTasks);
      save('goals', loadedGoals);
      save('finance', loadedFinance);
      save('journalUpdatedAt', sectionTs.current.journal);
      save('contactsUpdatedAt', sectionTs.current.contacts);
      save('ideasUpdatedAt', sectionTs.current.ideas);
      save('tasksUpdatedAt', sectionTs.current.tasks);
      save('goalsUpdatedAt', sectionTs.current.goals);
      save('financeUpdatedAt', sectionTs.current.finance);

      // Sync back to cloud (seeds/dedup may have cleaned data)
      const payload: BlackbookData = {
        journal: loadedJournal, contacts: loadedContacts, ideas: loadedIdeas,
        tasks: loadedTasks, goals: loadedGoals, finance: loadedFinance,
        journalUpdatedAt: sectionTs.current.journal,
        contactsUpdatedAt: sectionTs.current.contacts,
        ideasUpdatedAt: sectionTs.current.ideas,
        tasksUpdatedAt: sectionTs.current.tasks,
        goalsUpdatedAt: sectionTs.current.goals,
        financeUpdatedAt: sectionTs.current.finance,
      };
      saveToCloud(passHash, payload);
      setSynced(true);
      setSaveStatus('saved');
    });
  }, [passHash]);

  // Build the full payload from current refs + timestamps
  const buildPayload = useCallback((): BlackbookData => ({
    journal: journalRef.current,
    contacts: contactsRef.current,
    ideas: ideasRef.current,
    tasks: tasksRef.current,
    goals: goalsRef.current,
    finance: financeRef.current,
    journalUpdatedAt: sectionTs.current.journal,
    contactsUpdatedAt: sectionTs.current.contacts,
    ideasUpdatedAt: sectionTs.current.ideas,
    tasksUpdatedAt: sectionTs.current.tasks,
    goalsUpdatedAt: sectionTs.current.goals,
    financeUpdatedAt: sectionTs.current.finance,
  }), []);

  // Debounced sync with retry queue
  const syncToCloud = useCallback(() => {
    save('journal', journalRef.current);
    save('contacts', contactsRef.current);
    save('ideas', ideasRef.current);
    save('tasks', tasksRef.current);
    save('goals', goalsRef.current);
    save('finance', financeRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
    save('financeUpdatedAt', sectionTs.current.finance);
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveQueueRef.current.enqueue(() => saveToCloud(passHash, buildPayload()));
    }, 800);
  }, [passHash, buildPayload]);

  // Flush to cloud immediately — used on beforeunload / visibilitychange
  const flushToCloud = useCallback(() => {
    // Save to localStorage immediately (guaranteed)
    save('journal', journalRef.current);
    save('contacts', contactsRef.current);
    save('ideas', ideasRef.current);
    save('tasks', tasksRef.current);
    save('goals', goalsRef.current);
    save('finance', financeRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
    save('financeUpdatedAt', sectionTs.current.finance);
    // Fire-and-forget cloud save via fetch with keepalive
    const payload = buildPayload();
    fetch(`${SUPABASE_URL}/rest/v1/blackbook?pass_hash=eq.${passHash}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ data: payload, updated_at: new Date().toISOString() }),
      keepalive: true,
    }).catch(() => {});
  }, [passHash, buildPayload]);

  // Warn user if they try to close with unsaved changes
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    flushToCloud();
    if (saveQueueRef.current.hasPending() || saveStatus === 'saving' || saveStatus === 'retrying') {
      e.preventDefault();
    }
  }, [flushToCloud, saveStatus]);

  // Save to cloud on tab close / navigate away / mobile Safari pagehide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushToCloud();
    };
    const handlePageHide = () => flushToCloud();

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide); // mobile Safari
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [handleBeforeUnload, flushToCloud]);

  // Trigger sync when any data changes — update per-section timestamps
  useEffect(() => {
    if (!synced) return;
    sectionTs.current.journal = new Date().toISOString();
    syncToCloud();
  }, [journal]);
  useEffect(() => {
    if (!synced) return;
    sectionTs.current.contacts = new Date().toISOString();
    syncToCloud();
  }, [contacts]);
  useEffect(() => {
    if (!synced) return;
    sectionTs.current.ideas = new Date().toISOString();
    syncToCloud();
  }, [ideas]);
  useEffect(() => {
    if (!synced) return;
    sectionTs.current.tasks = new Date().toISOString();
    syncToCloud();
  }, [tasks]);
  useEffect(() => {
    if (!synced) return;
    sectionTs.current.goals = new Date().toISOString();
    syncToCloud();
  }, [goals]);
  useEffect(() => {
    if (!synced) return;
    sectionTs.current.finance = new Date().toISOString();
    syncToCloud();
  }, [finance]);

  return (
    <div style={{
      position: transparent ? 'relative' : 'fixed',
      inset: transparent ? undefined : 0,
      width: transparent ? '100%' : undefined,
      height: transparent ? '100%' : undefined,
      zIndex: transparent ? undefined : 10001,
      background: t.bg, color: t.text, fontFamily: FONT,
      fontSize: 15, overflow: 'auto',
      backdropFilter: transparent ? 'blur(40px)' : undefined,
      WebkitBackdropFilter: transparent ? 'blur(40px)' : undefined,
    }}>
      {/* Header — Apple-style top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: transparent
          ? 'rgba(255,255,255,0.55)'
          : t.bg,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: transparent ? '0.5px solid rgba(0,0,0,0.08)' : `1px solid ${t.border}`,
      }}>
        <div style={{
          padding: '14px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontSize: 17, fontFamily: FONT_MEDIUM,
              color: t.textStrong, letterSpacing: '-0.02em',
            }}>Blackbook</span>
            <span style={{
              color: t.textMuted, fontSize: 12,
              fontFamily: FONT, letterSpacing: '-0.005em',
            }}>
              {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SaveIndicator status={saveStatus} t={t} />
            {onLogout && <button onClick={onLogout} style={{
              background: t.accentSubtle, border: 'none',
              color: t.textMuted, cursor: 'pointer',
              padding: '6px 14px', borderRadius: 8,
              fontSize: 12, fontFamily: FONT_MEDIUM,
              transition: APPLE_TRANSITION,
            }}>Lock</button>}
            <button onClick={onClose} style={{
              background: t.accentSubtle, border: 'none',
              color: t.textMuted, cursor: 'pointer',
              padding: '6px 14px', borderRadius: 8,
              fontSize: 12, fontFamily: FONT_MEDIUM,
              transition: APPLE_TRANSITION,
            }}>Done</button>
          </div>
        </div>

        {/* Tabs — macOS segmented control */}
        <div style={{
          padding: '4px 24px 14px',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            background: t.accentSubtle, padding: 3, borderRadius: 10,
            border: `0.5px solid ${t.border}`,
          }}>
            {(['dashboard', 'journal', 'network', 'tasks', 'goals', 'ideas', 'finance'] as const).map(tb => {
              const active = tab === tb;
              return (
                <button key={tb} onClick={() => setTab(tb)} style={{
                  background: active ? t.cardBg : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: active ? t.textStrong : t.textMuted,
                  padding: '6px 14px', borderRadius: 8,
                  fontSize: 12, fontFamily: FONT_MEDIUM,
                  transition: APPLE_TRANSITION,
                  letterSpacing: '-0.005em',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}>
                  {tb.charAt(0).toUpperCase() + tb.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'dashboard' && (
          <DashboardTab
            journal={journal} setJournal={setJournal}
            contacts={contacts} tasks={tasks} setTasks={setTasks}
            goals={goals} finance={finance}
            googleEvents={gcal.events}
            googleConfigured={gcal.isConfigured}
            googleConnected={!!gcal.token}
            googleLoading={gcal.loading}
            onConnectGoogle={gcal.connect}
            onNavigate={setTab}
            t={t}
          />
        )}
        {tab === 'journal' && <JournalTab journal={journal} setJournal={setJournal} contacts={contacts} t={t} />}
        {tab === 'network' && <NetworkTab contacts={contacts} setContacts={setContacts} journal={journal} t={t} />}
        {tab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} t={t} />}
        {tab === 'goals' && <GoalsTab goals={goals} setGoals={setGoals} t={t} />}
        {tab === 'ideas' && <IdeasTab ideas={ideas} setIdeas={setIdeas} t={t} />}
        {tab === 'finance' && <FinanceTab finance={finance} setFinance={setFinance} t={t} />}
      </div>
      {transparent && <style>{`
        input::placeholder, textarea::placeholder {
          color: rgba(0,0,0,0.55) !important;
          opacity: 1 !important;
        }
        select { color: rgba(0,0,0,0.8) !important; }
        option { background: #fff; color: #1d1d1f; }
      `}</style>}
    </div>
  );
}

// ── Main Export ──
export default function Blackbook() {
  const [state, setState] = useState<'hidden' | 'password' | 'open'>('hidden');
  const [passHash, setPassHash] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (state === 'open' || state === 'password')) setState('hidden');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state]);

  // Hide page peel when blackbook is active
  useEffect(() => {
    if (state !== 'hidden') {
      document.body.classList.add('blackbook-active');
    } else {
      document.body.classList.remove('blackbook-active');
    }
    return () => document.body.classList.remove('blackbook-active');
  }, [state]);

  const handleUnlock = async (pw: string) => {
    const hash = await hashPass(pw);
    setPassHash(hash);
    setState('open');
  };

  return (
    <>
      <FingerprintIcon onClick={() => setState('password')} />
      {state === 'password' && (
        <PasswordGate onUnlock={handleUnlock} onClose={() => setState('hidden')} />
      )}
      {state === 'open' && <BlackbookDashboard onClose={() => setState('hidden')} onLogout={() => setState('password')} passHash={passHash} />}
    </>
  );
}
