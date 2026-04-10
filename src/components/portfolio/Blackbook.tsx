import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════
   BLACKBOOK — Ronniel's hidden personal dashboard
   Password-gated, Supabase-synced, theme-matched
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://czdvtqqanvmgptginlwa.supabase.co';
const SUPABASE_ANON = 'sb_publishable_cNeHCMWzmLHmEfor6SDG3A_RJhF1SCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function hashPass(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const PASS = 'ilovefluffy123!';
const FONT = "'NeueMontreal-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MEDIUM = "'NeueMontreal-Medium', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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

interface JournalEntry {
  id: string; date: string; body: string; tomorrow: string;
  meetings: Meeting[]; updatedAt: string;
}

// Legacy types (kept for migration)
type ScoutingStatus = 'researching' | 'ready' | 'archived';
type OutreachStatus = 'queued' | 'dm-sent' | 'replied' | 'call-scheduled' | 'call-done' | 'connected';

// Contact system — value type (what they can do) + temperature (how active)
type ContactValue = 'can-refer' | 'can-hire' | 'can-intro' | 'can-advise' | 'networking' | 'archived';
type ContactTemp = 'hot' | 'warm' | 'cold';
// Keep old types as aliases for backward compat
type ContactCategory = ContactValue;
type Urgency = ContactTemp;

interface NetworkContact {
  id: string; name: string; company: string; role: string;
  // New fields
  category: ContactValue; urgency: ContactTemp;
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

interface Goal {
  id: string; title: string; description: string; status: GoalStatus;
  progress: number; milestones: string[]; completedMilestones: boolean[];
  createdAt: string; updatedAt: string;
}

interface ProjectIdea {
  id: string; title: string; description: string;
  tags: string[]; createdAt: string; updatedAt: string;
}

interface BlackbookData {
  journal: JournalEntry[]; contacts: NetworkContact[]; ideas: ProjectIdea[];
  tasks: Task[]; goals: Goal[];
  journalUpdatedAt?: string; contactsUpdatedAt?: string; ideasUpdatedAt?: string;
  tasksUpdatedAt?: string; goalsUpdatedAt?: string;
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
    journalUpdatedAt: [cloud.journalUpdatedAt, local.journalUpdatedAt].filter(Boolean).sort().pop(),
    contactsUpdatedAt: [cloud.contactsUpdatedAt, local.contactsUpdatedAt].filter(Boolean).sort().pop(),
    ideasUpdatedAt: [cloud.ideasUpdatedAt, local.ideasUpdatedAt].filter(Boolean).sort().pop(),
    tasksUpdatedAt: [cloud.tasksUpdatedAt, local.tasksUpdatedAt].filter(Boolean).sort().pop(),
    goalsUpdatedAt: [cloud.goalsUpdatedAt, local.goalsUpdatedAt].filter(Boolean).sort().pop(),
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
};

function getCompanyLogo(company: string) {
  const domain = COMPANY_DOMAINS[company.toLowerCase()];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
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

  return (
    <button onClick={onClick} aria-label="Access" style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      background: 'none', border: 'none', cursor: 'pointer',
      opacity: visible ? 0.15 : 0, transition: 'opacity 1.5s ease',
      padding: 8, color: isDark ? '#78716c' : '#78716c',
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.35'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.15'; }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
function PasswordGate({ onUnlock, onClose }: { onUnlock: (pw: string) => void; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useBlackbookTheme();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (pw === PASS) { onUnlock(pw); }
    else { setShake(true); setPw(''); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: t.bg, backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT,
    }} onClick={onClose}>
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
        <span style={{ color: t.textMuted, fontSize: 14, fontWeight: 500, opacity: 0.6 }}>press enter</span>
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

// ── Shared Field ──
function Field({ label, value, onChange, placeholder, t }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; t: Theme;
}) {
  return (
    <div>
      {label && <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 4 }}>{label}</label>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
        padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 14,
        width: '100%', outline: 'none', transition: 'border-color 0.2s',
        boxSizing: 'border-box',
      }}
        onFocus={e => { e.target.style.borderColor = t.textMuted; }}
        onBlur={e => { e.target.style.borderColor = t.border; }}
      />
    </div>
  );
}

// ── Shared TextArea ──
function TextArea({ value, onChange, placeholder, t, minHeight = 120 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; t: Theme; minHeight?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
      background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
      padding: '10px 12px', borderRadius: 8, fontFamily: FONT, fontSize: 14,
      width: '100%', outline: 'none', resize: 'vertical', minHeight,
      lineHeight: '1.6', transition: 'border-color 0.2s', boxSizing: 'border-box',
      wordBreak: 'break-word', overflowWrap: 'break-word',
    }}
      onFocus={e => { e.target.style.borderColor = t.textMuted; }}
      onBlur={e => { e.target.style.borderColor = t.border; }}
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
  }, []);

  const entry = journal.find(e => e.date === selectedDate);
  const journalDates = new Set(journal.map(e => e.date));

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

  const dayLabel = new Date(selectedDate + 'T12:00').toLocaleDateString('en', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div>
      {/* Calendar + Upcoming — top section */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${t.border}` }}>
        <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate}
          journalDates={journalDates} t={t} />
        <UpcomingMeetings journal={journal} onSelectDate={setSelectedDate} t={t} />
      </div>

      {/* Day header */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 16, color: t.textStrong, fontFamily: FONT_MEDIUM }}>{dayLabel}</span>
        {selectedDate === today && <span style={{ fontSize: 14, color: t.textMuted, marginLeft: 8 }}>today</span>}
      </div>

      {/* Meetings first — most actionable */}
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

      {/* Journal writing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 6 }}>What did you do?</label>
          <TextArea value={entry?.body || ''} onChange={v => updateEntry({ body: v })} placeholder="Write about your day..." t={t} />
        </div>

        <div>
          <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 6 }}>Plan for tomorrow</label>
          <TextArea value={entry?.tomorrow || ''} onChange={v => updateEntry({ tomorrow: v })} placeholder="What's the plan?" t={t} minHeight={80} />
        </div>

        {/* Past entries */}
        {pastEntries.length > 0 && (
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16, marginTop: 8 }}>
            <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, marginBottom: 8, display: 'block' }}>Previous entries</label>
            {pastEntries.map(e => (
              <PastEntry key={e.date} entry={e} onSelect={() => setSelectedDate(e.date)} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Upcoming Meetings ──
function UpcomingMeetings({ journal, onSelectDate, t }: {
  journal: JournalEntry[]; onSelectDate: (d: string) => void; t: Theme;
}) {
  const today = localToday();
  const upcoming = journal
    .filter(e => e.date >= today && e.meetings.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap(e => e.meetings.map(m => ({ ...m, date: e.date })))
    .slice(0, 8);

  if (upcoming.length === 0) return null;

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
      <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 8 }}>Upcoming</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {upcoming.map(m => {
          const isToday = m.date === today;
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
                {m.time && <span style={{ fontSize: 14, color: t.textMuted }}>{m.time}</span>}
              </div>
              <span style={{ fontSize: 14, color: t.text }}>{m.title || 'Untitled meeting'}</span>
              {m.person && <span style={{ fontSize: 14, color: t.textMuted }}>{m.person}</span>}
              {m.link && (
                <a href={m.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
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

// ── Network Tab (category-based, person-first) ──
// Temperature colors (shown as left bar on cards)
const TEMP_COLORS: Record<ContactTemp, string> = {
  hot: '#ef4444', warm: '#f59e0b', cold: '#6b7280',
};
// Keep old name for backward compat
const URGENCY_COLORS = TEMP_COLORS as Record<string, string>;

// Value-based grouping
const VALUE_META: { key: ContactValue; label: string; accent: string; emoji: string }[] = [
  { key: 'can-refer', label: 'Can Refer', accent: '#2d8a56', emoji: '→' },
  { key: 'can-hire', label: 'Can Hire', accent: '#2563eb', emoji: '★' },
  { key: 'can-intro', label: 'Can Intro', accent: '#8b5cf6', emoji: '⟷' },
  { key: 'can-advise', label: 'Can Advise', accent: '#f59e0b', emoji: '◆' },
  { key: 'networking', label: 'Networking', accent: '#6b7280', emoji: '○' },
];
const CATEGORY_META = VALUE_META;

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
      id, name: '', company: '', role: '', category: 'networking', urgency: 'warm',
      whatTheySaid: '', actionNeeded: '', notes: '', createdAt: new Date().toISOString(),
    }]);
    setExpandedCard(id);
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
      id, name: parsed.name, company: '', role: '', category: 'networking', urgency: 'warm',
      whatTheySaid: '', actionNeeded: '', linkedinUrl: parsed.linkedinUrl,
      notes: '', createdAt: new Date().toISOString(),
    }]);
    setExpandedCard(id);
    setPasteUrl('');
    setPasteStatus(`Added ${parsed.name}`);
    setTimeout(() => setPasteStatus(null), 2500);
    // Try to fetch company in background
    tryFetchLinkedInCompany(parsed.linkedinUrl, (company) => {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, company: c.company || company } : c));
    });
  };

  const active = contacts.filter(c => c.category !== 'archived');
  const archived = contacts.filter(c => c.category === 'archived');
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

  const filteredArchived = filter
    ? filter.startsWith('tag:')
      ? archived.filter(c => (c.tags || []).includes(filter.slice(4)))
      : archived.filter(c => `${c.name} ${c.company}`.toLowerCase().includes(filter.toLowerCase()))
    : archived;

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
        {(['outreach', 'contacts'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? t.accentSubtle : 'transparent',
            border: 'none', color: view === v ? t.textStrong : t.textMuted,
            padding: '6px 14px', cursor: 'pointer', borderRadius: 6,
            fontSize: 14, fontFamily: FONT_MEDIUM, transition: 'all 0.15s',
          }}>{v === 'outreach' ? `Network (${active.length})` : `Archived (${archived.length})`}</button>
        ))}
      </div>

      {/* LinkedIn paste-to-add */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={pasteUrl} onChange={e => setPasteUrl(e.target.value)}
            onPaste={e => {
              const text = e.clipboardData.getData('text');
              if (text.includes('linkedin.com/in/')) {
                e.preventDefault();
                addFromLinkedIn(text);
              }
            }}
            onKeyDown={e => { if (e.key === 'Enter' && pasteUrl) addFromLinkedIn(pasteUrl); }}
            placeholder="Paste a LinkedIn URL to add contact..."
            style={{
              flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
              padding: '8px 12px', borderRadius: 8, fontFamily: FONT, fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }} />
        </div>
        {pasteStatus && (
          <div style={{
            fontSize: 12, fontFamily: FONT_MEDIUM, marginTop: 4, padding: '2px 0',
            color: pasteStatus.startsWith('Added') ? '#2d8a56' : pasteStatus.includes('already') ? t.textMuted : '#ef4444',
          }}>{pasteStatus}</div>
        )}
      </div>

      {/* Filter */}
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by name or company..."
        style={{
          background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
          padding: '8px 12px', borderRadius: 8, fontFamily: FONT, fontSize: 14,
          outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 16,
        }} />

      {/* Tag filter */}
      {(() => {
        const allTags = [...new Set(contacts.flatMap(c => c.tags || []))];
        if (allTags.length === 0) return null;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setFilter(filter === `tag:${tag}` ? '' : `tag:${tag}`)} style={{
                background: filter === `tag:${tag}` ? `${TAG_COLORS[tag] || t.textMuted}22` : 'transparent',
                border: `1px solid ${filter === `tag:${tag}` ? (TAG_COLORS[tag] || t.textMuted) : t.border}`,
                color: TAG_COLORS[tag] || t.textMuted,
                padding: '3px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: FONT_MEDIUM, fontSize: 11,
                transition: 'all 0.15s',
              }}>{tag}</button>
            ))}
          </div>
        );
      })()}

      {/* Upcoming meetings with contacts */}
      {journal && (() => {
        const today = localToday();
        const upcoming = journal
          .filter(e => e.date >= today && e.meetings.length > 0)
          .sort((a, b) => a.date.localeCompare(b.date))
          .flatMap(e => e.meetings.map(m => ({ ...m, date: e.date })))
          .filter(m => m.contactId || contacts.some(c => c.name === m.person))
          .slice(0, 6);
        if (upcoming.length === 0) return null;
        return (
          <div style={{
            background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 10,
            padding: '12px 14px', marginBottom: 16,
          }}>
            <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Upcoming meetings
            </label>
            {upcoming.map(m => {
              const isToday = m.date === today;
              const dateLabel = isToday ? 'Today' : new Date(m.date + 'T12:00').toLocaleDateString('en', { month: 'short', day: 'numeric' });
              const contact = m.contactId ? contacts.find(c => c.id === m.contactId) : contacts.find(c => c.name === m.person);
              return (
                <div key={m.id + m.date} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                  <span style={{ fontSize: 13, color: isToday ? '#2d8a56' : t.textMuted, fontFamily: FONT_MEDIUM, minWidth: 50 }}>{dateLabel}</span>
                  {m.time && <span style={{ fontSize: 13, color: t.textMuted }}>{m.time}</span>}
                  <span style={{ fontSize: 14, color: t.textStrong, fontFamily: FONT_MEDIUM }}>{m.title || 'Meeting'}</span>
                  <span style={{ fontSize: 13, color: t.textMuted }}>w/ {m.person}</span>
                  {contact?.company && <span style={{ fontSize: 12, color: t.textMuted, opacity: 0.7 }}>({contact.company})</span>}
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 11, fontFamily: FONT_MEDIUM, color: '#2d8a56', textDecoration: 'none', marginLeft: 'auto',
                    }}>Join</a>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Outreach view */}
      {view === 'outreach' && (
        <>
          {/* Summary counts */}
          <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 14, fontFamily: FONT, display: 'flex', gap: 14 }}>
            {CATEGORY_META.map(cm => (
              <span key={cm.key}><span style={{ color: cm.accent, fontFamily: FONT_MEDIUM }}>{counts[cm.key as keyof typeof counts] || 0}</span> {cm.label.split(' ')[0].toLowerCase()}</span>
            ))}
          </div>

          {/* Category sections */}
          {CATEGORY_META.map(cm => {
            const sectionContacts = filtered.filter(c => c.category === cm.key);
            if (sectionContacts.length === 0) return null;
            const isCollapsed = collapsed[cm.key];
            return (
              <div key={cm.key} style={{ marginBottom: 16 }}>
                <button onClick={() => setCollapsed(p => ({ ...p, [cm.key]: !p[cm.key] }))} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: cm.accent }} />
                  <span style={{ fontFamily: FONT_MEDIUM, fontSize: 14, color: t.textStrong, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {cm.label}
                  </span>
                  <span style={{ fontSize: 14, color: t.textMuted }}>({sectionContacts.length})</span>
                  <span style={{ fontSize: 14, color: t.textMuted, marginLeft: 'auto' }}>{isCollapsed ? '+' : '-'}</span>
                </button>
                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {sectionContacts.map(c => (
                      <ContactCard key={c.id} contact={c} expanded={expandedCard === c.id}
                        onToggle={() => setExpandedCard(expandedCard === c.id ? null : c.id)}
                        onUpdate={p => updateContact(c.id, p)} onRemove={() => removeContact(c.id)} t={t} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Archived view */}
      {view === 'contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredArchived.length === 0 && (
            <p style={{ color: t.textMuted, fontSize: 14, textAlign: 'center', padding: 32 }}>
              No archived contacts.
            </p>
          )}
          {filteredArchived.map(c => (
            <ContactCard key={c.id} contact={c} expanded={expandedCard === c.id}
              onToggle={() => setExpandedCard(expandedCard === c.id ? null : c.id)}
              onUpdate={p => updateContact(c.id, p)} onRemove={() => removeContact(c.id)} t={t} />
          ))}
        </div>
      )}

      {/* Add contact */}
      <button onClick={addContact} style={{
        background: 'transparent', border: `1px dashed ${t.border}`,
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

  const urgColor = URGENCY_COLORS[c.urgency];

  return (
    <div style={{
      border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden',
      display: 'flex', cursor: 'pointer',
    }} onClick={onToggle}>
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
                  <option value="can-refer">Can Refer</option>
                  <option value="can-hire">Can Hire</option>
                  <option value="can-intro">Can Intro</option>
                  <option value="can-advise">Can Advise</option>
                  <option value="networking">Networking</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 3 }}>Temperature</label>
                <select value={c.urgency} onChange={e => onUpdate({ urgency: e.target.value as ContactTemp })} style={{
                  background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
                  padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 14, outline: 'none', width: '100%',
                }}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
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
      borderRadius: 8, transition: 'background 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = t.accentSubtle; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
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
function GoalsTab({ goals, setGoals, t }: {
  goals: Goal[]; setGoals: (fn: (prev: Goal[]) => Goal[]) => void; t: Theme;
}) {
  const addGoal = () => {
    const now = new Date().toISOString();
    setGoals(prev => [...prev, {
      id: Date.now().toString(), title: '', description: '', status: 'active',
      progress: 0, milestones: [], completedMilestones: [],
      createdAt: now, updatedAt: now,
    }]);
  };
  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g));
  };
  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const active = goals.filter(g => g.status === 'active');
  const other = goals.filter(g => g.status !== 'active');

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {active.map(g => <GoalCard key={g.id} goal={g} onUpdate={p => updateGoal(g.id, p)} onRemove={() => removeGoal(g.id)} t={t} />)}
      </div>
      {other.length > 0 && (
        <div style={{ marginTop: 20, opacity: 0.6 }}>
          <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, marginBottom: 8, display: 'block' }}>Paused / Completed</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {other.map(g => <GoalCard key={g.id} goal={g} onUpdate={p => updateGoal(g.id, p)} onRemove={() => removeGoal(g.id)} t={t} />)}
          </div>
        </div>
      )}
      <button onClick={addGoal} style={{
        background: 'transparent', border: `1px dashed ${t.border}`,
        color: t.textMuted, padding: '12px', borderRadius: 10, width: '100%',
        cursor: 'pointer', fontFamily: FONT, fontSize: 14, marginTop: 16,
      }}>+ Add Goal</button>
    </div>
  );
}

function GoalCard({ goal: g, onUpdate, onRemove, t }: {
  goal: Goal; onUpdate: (p: Partial<Goal>) => void; onRemove: () => void; t: Theme;
}) {
  const [newMilestone, setNewMilestone] = useState('');
  const statusColors = { active: '#2d8a56', paused: '#f59e0b', completed: '#2d8a56' };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    onUpdate({
      milestones: [...(g.milestones || []), newMilestone.trim()],
      completedMilestones: [...(g.completedMilestones || []), false],
    });
    setNewMilestone('');
  };

  const toggleMilestone = (i: number) => {
    const completed = [...(g.completedMilestones || [])];
    completed[i] = !completed[i];
    const doneCount = completed.filter(Boolean).length;
    const total = g.milestones?.length || 1;
    onUpdate({ completedMilestones: completed, progress: Math.round((doneCount / total) * 100) });
  };

  const removeMilestone = (i: number) => {
    const milestones = [...(g.milestones || [])];
    const completed = [...(g.completedMilestones || [])];
    milestones.splice(i, 1);
    completed.splice(i, 1);
    const doneCount = completed.filter(Boolean).length;
    const total = milestones.length || 1;
    onUpdate({ milestones, completedMilestones: completed, progress: Math.round((doneCount / total) * 100) });
  };

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
        <input value={g.title} onChange={e => onUpdate({ title: e.target.value })} placeholder="Goal title..."
          style={{
            background: 'transparent', border: 'none', color: t.textStrong,
            fontFamily: FONT_MEDIUM, fontSize: 14, outline: 'none', flex: 1, padding: 0,
          }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 14, fontFamily: FONT_MEDIUM, padding: '2px 8px', borderRadius: 4,
            background: `${statusColors[g.status]}22`, color: statusColors[g.status],
          }}>{g.status}</span>
          <button onClick={onRemove} style={{
            background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 14,
          }}>&times;</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: t.accentSubtle, overflow: 'hidden' }}>
          <div style={{ width: `${g.progress}%`, height: '100%', background: 'rgba(48, 180, 98, 0.5)', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, minWidth: 32 }}>{g.progress}%</span>
      </div>

      {/* Description */}
      <TextArea value={g.description} onChange={v => onUpdate({ description: v })} placeholder="What does this goal look like when done?" t={t} minHeight={40} />

      {/* Milestones */}
      <div style={{ marginTop: 10 }}>
        <label style={{ fontSize: 14, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 4 }}>Milestones</label>
        {(g.milestones || []).map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <button onClick={() => toggleMilestone(i)} style={{
              width: 14, height: 14, borderRadius: 3, flexShrink: 0,
              border: `1.5px solid ${g.completedMilestones?.[i] ? 'rgba(48, 180, 98, 0.5)' : t.border}`,
              background: g.completedMilestones?.[i] ? 'rgba(48, 180, 98, 0.15)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2d8a56', fontSize: 14,
            }}>{g.completedMilestones?.[i] ? '✓' : ''}</button>
            <span style={{
              fontSize: 14, color: g.completedMilestones?.[i] ? t.textMuted : t.text,
              fontFamily: FONT, textDecoration: g.completedMilestones?.[i] ? 'line-through' : 'none', flex: 1,
            }}>{m}</span>
            <button onClick={() => removeMilestone(i)} style={{
              background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 14, opacity: 0.5,
            }}>&times;</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMilestone()}
            placeholder="Add milestone..." style={{
              flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
              padding: '5px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 14, outline: 'none',
            }} />
        </div>
      </div>

      {/* Status */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <select value={g.status} onChange={e => onUpdate({ status: e.target.value as GoalStatus })} style={{
          background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
          padding: '5px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 14, outline: 'none',
        }}>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
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
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, padding: 14 }}>
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
    c = [...c, ...people.map((p, i) => ({
      id: `linear-${Date.now()}-${i}`, name: p.name, company: 'Linear', role: '',
      whyReachOut: '', companyInfo: 'Project management tool for software teams', foundVia: 'LinkedIn',
      scoutingStatus: 'ready' as ScoutingStatus, outreachStatus: 'dm-sent' as OutreachStatus,
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
    c = [...c, ...people.map((p, i) => ({
      id: `offdeal-${Date.now()}-${i}`, name: p.name, company: 'Offdeal', role: p.role,
      whyReachOut: '', companyInfo: '', foundVia: 'LinkedIn',
      scoutingStatus: 'ready' as ScoutingStatus, outreachStatus: 'dm-sent' as OutreachStatus,
      platform: 'LinkedIn', lastContactDate: today, nextAction: 'Wait for reply',
      notes: 'Connection request sent with note', createdAt: new Date().toISOString(),
    }))];
  }

  if (key === 'ostium') {
    if (c.some(x => x.company === 'Ostium')) { if (typeof window !== 'undefined') localStorage.setItem(flag, '1'); return { contacts: c, journal: j }; }
    const today = localToday();
    c = [...c, {
      id: `ostium-${Date.now()}-0`, name: 'Shrey Paharia', company: 'Ostium', role: 'Senior Developer',
      whyReachOut: '', companyInfo: '$38B+ volume, backed by General Catalyst & Jump', foundVia: 'LinkedIn',
      scoutingStatus: 'ready' as ScoutingStatus, outreachStatus: 'dm-sent' as OutreachStatus,
      platform: 'LinkedIn', lastContactDate: today, nextAction: 'Wait for reply',
      notes: 'Connection request sent with note', createdAt: new Date().toISOString(),
    }];
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

// ── Main Dashboard ──
function Dashboard({ onClose, passHash }: { onClose: () => void; passHash: string }) {
  const t = useBlackbookTheme();
  const [tab, setTab] = useState<'journal' | 'network' | 'tasks' | 'goals' | 'ideas'>('journal');
  const [journal, setJournal] = useState<JournalEntry[]>(() => load('journal', []));
  const [contacts, setContacts] = useState<NetworkContact[]>(() => load('contacts', DEFAULT_CONTACTS));
  const [ideas, setIdeas] = useState<ProjectIdea[]>(() => load('ideas', []));
  const [tasks, setTasks] = useState<Task[]>(() => load('tasks', []));
  const [goals, setGoals] = useState<Goal[]>(() => load('goals', []));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'retrying'>('saved');
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveQueueRef = useRef(new SaveQueue());

  // Per-section timestamps — tracks when each section was last edited locally
  const sectionTs = useRef({ journal: '', contacts: '', ideas: '', tasks: '', goals: '' });

  // Refs that always hold the latest state — used by sync and beforeunload
  const journalRef = useRef(journal);
  const contactsRef = useRef(contacts);
  const ideasRef = useRef(ideas);
  const tasksRef = useRef(tasks);
  const goalsRef = useRef(goals);
  useEffect(() => { journalRef.current = journal; }, [journal]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);
  useEffect(() => { ideasRef.current = ideas; }, [ideas]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { goalsRef.current = goals; }, [goals]);

  // Wire up save queue status
  useEffect(() => {
    saveQueueRef.current.onStatusChange = setSaveStatus;
    return () => { saveQueueRef.current.cancel(); };
  }, []);

  // Run migration once
  useEffect(() => { migrateIfNeeded(); migrateContactsV3(); }, []);

  // Load from cloud on mount — merge with localStorage using per-field timestamps
  useEffect(() => {
    loadFromCloud(passHash).then(cloud => {
      const localData: BlackbookData = {
        journal: load('journal', []),
        contacts: load('contacts', DEFAULT_CONTACTS),
        ideas: load('ideas', []),
        tasks: load('tasks', []),
        goals: load('goals', []),
        journalUpdatedAt: load('journalUpdatedAt', ''),
        contactsUpdatedAt: load('contactsUpdatedAt', ''),
        ideasUpdatedAt: load('ideasUpdatedAt', ''),
        tasksUpdatedAt: load('tasksUpdatedAt', ''),
        goalsUpdatedAt: load('goalsUpdatedAt', ''),
      };

      // Per-field merge: newest timestamp wins per section
      const merged = mergeCloudLocal(cloud, localData);
      let loadedJournal = merged.journal ?? [];
      let loadedContacts = merged.contacts ?? [];
      const loadedIdeas = merged.ideas ?? [];
      const loadedTasks = merged.tasks ?? [];
      const loadedGoals = merged.goals ?? [];

      // Track section timestamps
      const now = new Date().toISOString();
      sectionTs.current = {
        journal: merged.journalUpdatedAt || now,
        contacts: merged.contactsUpdatedAt || now,
        ideas: merged.ideasUpdatedAt || now,
        tasks: merged.tasksUpdatedAt || now,
        goals: merged.goalsUpdatedAt || now,
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

      // Migrate contacts to new value-based system
      const OLD_TO_VALUE: Record<string, ContactValue> = {
        'call-booked': 'networking', 'reply-needed': 'networking', 'warm': 'networking',
        'awaiting-reply': 'networking', 'connected': 'networking',
      };
      const OLD_TO_TEMP: Record<string, ContactTemp> = {
        'now': 'hot', 'soon': 'hot', 'later': 'warm', 'waiting': 'cold',
      };
      loadedContacts = loadedContacts.map((c: any) => {
        // Map old categories to new value types if they match old names
        let category = c.category || 'networking';
        let urgency = c.urgency || 'warm';
        if (OLD_TO_VALUE[category]) category = OLD_TO_VALUE[category];
        if (OLD_TO_TEMP[urgency]) urgency = OLD_TO_TEMP[urgency];
        // Handle contacts with no category at all (very old format)
        if (!c.category && c.outreachStatus) {
          category = 'networking';
          urgency = c.outreachStatus === 'dm-sent' ? 'cold' : 'warm';
        }
        return { ...c, category, urgency, whatTheySaid: c.whatTheySaid || c.notes || '', actionNeeded: c.actionNeeded || c.nextAction || '' };
      });

      // Apply to state and cache locally
      setJournal(loadedJournal);
      setContacts(loadedContacts);
      setIdeas(loadedIdeas);
      setTasks(loadedTasks);
      setGoals(loadedGoals);
      save('journal', loadedJournal);
      save('contacts', loadedContacts);
      save('ideas', loadedIdeas);
      save('tasks', loadedTasks);
      save('goals', loadedGoals);
      save('journalUpdatedAt', sectionTs.current.journal);
      save('contactsUpdatedAt', sectionTs.current.contacts);
      save('ideasUpdatedAt', sectionTs.current.ideas);
      save('tasksUpdatedAt', sectionTs.current.tasks);
      save('goalsUpdatedAt', sectionTs.current.goals);

      // Sync back to cloud (seeds/dedup may have cleaned data)
      const payload: BlackbookData = {
        journal: loadedJournal, contacts: loadedContacts, ideas: loadedIdeas,
        tasks: loadedTasks, goals: loadedGoals,
        journalUpdatedAt: sectionTs.current.journal,
        contactsUpdatedAt: sectionTs.current.contacts,
        ideasUpdatedAt: sectionTs.current.ideas,
        tasksUpdatedAt: sectionTs.current.tasks,
        goalsUpdatedAt: sectionTs.current.goals,
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
    journalUpdatedAt: sectionTs.current.journal,
    contactsUpdatedAt: sectionTs.current.contacts,
    ideasUpdatedAt: sectionTs.current.ideas,
    tasksUpdatedAt: sectionTs.current.tasks,
    goalsUpdatedAt: sectionTs.current.goals,
  }), []);

  // Debounced sync with retry queue
  const syncToCloud = useCallback(() => {
    save('journal', journalRef.current);
    save('contacts', contactsRef.current);
    save('ideas', ideasRef.current);
    save('tasks', tasksRef.current);
    save('goals', goalsRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
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
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: t.bg, color: t.text, fontFamily: FONT,
      fontSize: 15, overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, fontFamily: FONT_MEDIUM, color: t.textStrong }}>Ronniel's Blackbook</span>
          <span style={{ color: t.textMuted, fontSize: 13 }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SaveIndicator status={saveStatus} t={t} />
          <button onClick={onClose} style={{
            background: t.accentSubtle, border: 'none',
            color: t.textMuted, cursor: 'pointer', padding: '5px 12px', borderRadius: 6,
            fontSize: 14, fontFamily: FONT_MEDIUM,
          }}>Done</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 24px',
        borderBottom: `1px solid ${t.border}`,
      }}>
        {(['journal', 'network', 'tasks', 'goals', 'ideas'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            background: 'transparent', border: 'none',
            borderBottom: tab === tb ? `2px solid ${t.textStrong}` : '2px solid transparent',
            color: tab === tb ? t.textStrong : t.textMuted,
            padding: '10px 16px', cursor: 'pointer',
            fontSize: 14, fontFamily: FONT_MEDIUM, transition: 'all 0.15s',
          }}>{tb.charAt(0).toUpperCase() + tb.slice(1)}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 940, margin: '0 auto' }}>
        {tab === 'journal' && <JournalTab journal={journal} setJournal={setJournal} contacts={contacts} t={t} />}
        {tab === 'network' && <NetworkTab contacts={contacts} setContacts={setContacts} journal={journal} t={t} />}
        {tab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} t={t} />}
        {tab === 'goals' && <GoalsTab goals={goals} setGoals={setGoals} t={t} />}
        {tab === 'ideas' && <IdeasTab ideas={ideas} setIdeas={setIdeas} t={t} />}
      </div>
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
      {state === 'open' && <Dashboard onClose={() => setState('hidden')} passHash={passHash} />}
    </>
  );
}
