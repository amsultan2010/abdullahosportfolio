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
    bg: '#000000', text: '#a3a3a3', textStrong: '#d6d3d1', textMuted: '#78716c',
    border: 'rgba(255,255,255,0.08)', cardBg: '#171717',
    inputBg: 'rgba(255,255,255,0.04)', accentSubtle: 'rgba(255,255,255,0.12)',
  } : {
    bg: '#f5f5f4', text: '#57534e', textStrong: '#44403c', textMuted: '#78716c',
    border: 'rgba(0,0,0,0.08)', cardBg: '#f5f5f5',
    inputBg: 'rgba(0,0,0,0.03)', accentSubtle: 'rgba(0,0,0,0.06)',
  };
}

// ── Types ──
interface Meeting {
  id: string; title: string; person: string; time: string; notes: string;
}

interface JournalEntry {
  id: string; date: string; body: string; tomorrow: string;
  meetings: Meeting[]; updatedAt: string;
}

type ScoutingStatus = 'researching' | 'ready' | 'archived';
type OutreachStatus = 'queued' | 'dm-sent' | 'replied' | 'call-scheduled' | 'call-done' | 'connected';

interface NetworkContact {
  id: string; name: string; company: string; role: string;
  whyReachOut: string; companyInfo: string; foundVia: string;
  scoutingStatus: ScoutingStatus; outreachStatus: OutreachStatus;
  platform: string; lastContactDate: string; nextAction: string;
  notes: string; createdAt: string;
}

interface ProjectIdea {
  id: string; title: string; description: string;
  tags: string[]; createdAt: string; updatedAt: string;
}

interface BlackbookData {
  journal: JournalEntry[]; contacts: NetworkContact[]; ideas: ProjectIdea[];
  // Per-section timestamps for field-level merge
  journalUpdatedAt?: string; contactsUpdatedAt?: string; ideasUpdatedAt?: string;
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
    // Migrate contacts
    const oldContacts = load<any[]>('contacts', []);
    if (oldContacts.length > 0) {
      const contacts: NetworkContact[] = oldContacts.map(c => ({
        id: c.id, name: c.name || '', company: c.company || '', role: c.role || '',
        whyReachOut: '', companyInfo: c.stage || '', foundVia: '',
        scoutingStatus: 'researching' as ScoutingStatus,
        outreachStatus: (c.status === 'cold' ? 'queued' : c.status === 'dmd' ? 'dm-sent' : 'queued') as OutreachStatus,
        platform: '', lastContactDate: c.lastContact || '', nextAction: c.nextAction || '',
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
    journalUpdatedAt: [cloud.journalUpdatedAt, local.journalUpdatedAt].filter(Boolean).sort().pop(),
    contactsUpdatedAt: [cloud.contactsUpdatedAt, local.contactsUpdatedAt].filter(Boolean).sort().pop(),
    ideasUpdatedAt: [cloud.ideasUpdatedAt, local.ideasUpdatedAt].filter(Boolean).sort().pop(),
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
        <span style={{ color: t.textMuted, fontSize: 12, fontWeight: 500, opacity: 0.6 }}>press enter</span>
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
      {label && <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 4 }}>{label}</label>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
        padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 13,
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
      fontSize: 11,
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
        <span style={{ fontSize: 13, color: t.textStrong, fontFamily: FONT_MEDIUM }}>{monthName}</span>
        <button onClick={next} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontFamily: FONT, fontSize: 16, padding: '2px 8px' }}>&rsaquo;</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: t.textMuted, padding: '4px 0', fontFamily: FONT }}>{d}</span>
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
              color: isSelected ? t.textStrong : t.text, fontFamily: FONT, fontSize: 12,
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
function MeetingRow({ meeting, onChange, onRemove, t }: {
  meeting: Meeting; onChange: (patch: Partial<Meeting>) => void; onRemove: () => void; t: Theme;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto', gap: 8, alignItems: 'start' }}>
      <Field value={meeting.time} onChange={v => onChange({ time: v })} placeholder="2:00 PM" t={t} />
      <Field value={meeting.title} onChange={v => onChange({ title: v })} placeholder="Meeting title" t={t} />
      <Field value={meeting.person} onChange={v => onChange({ person: v })} placeholder="With..." t={t} />
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
        fontSize: 14, padding: '6px 4px', marginTop: 1,
      }}>&times;</button>
    </div>
  );
}

// ── Journal Tab ──
function JournalTab({ journal, setJournal, t }: {
  journal: JournalEntry[]; setJournal: (fn: (prev: JournalEntry[]) => JournalEntry[]) => void; t: Theme;
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24 }}>
      {/* Writing area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <span style={{ fontSize: 15, color: t.textStrong, fontFamily: FONT_MEDIUM }}>{dayLabel}</span>
          {selectedDate === today && <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 8 }}>today</span>}
        </div>

        <div>
          <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 6 }}>What did you do?</label>
          <TextArea value={entry?.body || ''} onChange={v => updateEntry({ body: v })} placeholder="Write about your day..." t={t} />
        </div>

        <div>
          <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 6 }}>Plan for tomorrow</label>
          <TextArea value={entry?.tomorrow || ''} onChange={v => updateEntry({ tomorrow: v })} placeholder="What's the plan?" t={t} minHeight={80} />
        </div>

        {/* Meetings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM }}>Meetings</label>
            <button onClick={addMeeting} style={{
              background: 'none', border: 'none', color: t.textMuted,
              cursor: 'pointer', fontFamily: FONT, fontSize: 12,
            }}>+ add</button>
          </div>
          {(entry?.meetings || []).length === 0 && (
            <p style={{ color: t.textMuted, fontSize: 12, opacity: 0.6 }}>No meetings scheduled</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(entry?.meetings || []).map(m => (
              <MeetingRow key={m.id} meeting={m}
                onChange={patch => updateMeeting(m.id, patch)}
                onRemove={() => removeMeeting(m.id)} t={t} />
            ))}
          </div>
        </div>

        {/* Past entries */}
        {pastEntries.length > 0 && (
          <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16, marginTop: 8 }}>
            <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, marginBottom: 8, display: 'block' }}>Previous entries</label>
            {pastEntries.map(e => (
              <PastEntry key={e.date} entry={e} onSelect={() => setSelectedDate(e.date)} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Calendar sidebar */}
      <div style={{ borderLeft: `1px solid ${t.border}`, paddingLeft: 20 }}>
        <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate}
          journalDates={journalDates} t={t} />

        {/* Upcoming meetings */}
        <UpcomingMeetings journal={journal} onSelectDate={setSelectedDate} t={t} />
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
      <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 8 }}>Upcoming</label>
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
                <span style={{ fontSize: 11, color: isToday ? '#2d8a56' : t.textMuted, fontFamily: FONT_MEDIUM }}>{dateLabel}</span>
                {m.time && <span style={{ fontSize: 11, color: t.textMuted }}>{m.time}</span>}
              </div>
              <span style={{ fontSize: 12, color: t.text }}>{m.title || 'Untitled meeting'}</span>
              {m.person && <span style={{ fontSize: 11, color: t.textMuted }}>{m.person}</span>}
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
      <span style={{ fontSize: 12, color: t.textMuted }}>{dateLabel}</span>
      <span style={{ fontSize: 13, color: t.text, display: 'block', marginTop: 2 }}>
        {firstLine || 'Empty entry'}{firstLine.length >= 80 ? '...' : ''}
      </span>
    </button>
  );
}

// ── Network Tab ──
function NetworkTab({ contacts, setContacts, t }: {
  contacts: NetworkContact[]; setContacts: (fn: (prev: NetworkContact[]) => NetworkContact[]) => void; t: Theme;
}) {
  const [view, setView] = useState<'contacts' | 'outreach'>('outreach');

  const contactBookEntries = contacts.filter(c => c.outreachStatus === 'queued' && c.scoutingStatus !== 'archived');
  const outreachContacts = contacts.filter(c => c.outreachStatus !== 'queued');

  // Group outreach by company
  const outreachByCompany = outreachContacts.reduce<Record<string, NetworkContact[]>>((acc, c) => {
    const key = c.company || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const updateContact = (id: string, patch: Partial<NetworkContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };
  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };
  const addContact = () => {
    setContacts(prev => [...prev, {
      id: Date.now().toString(), name: '', company: '', role: '',
      whyReachOut: '', companyInfo: '', foundVia: '',
      scoutingStatus: 'researching', outreachStatus: 'queued',
      platform: '', lastContactDate: '', nextAction: '', notes: '',
      createdAt: new Date().toISOString(),
    }]);
  };
  const moveToOutreach = (id: string) => {
    updateContact(id, { outreachStatus: 'dm-sent', scoutingStatus: 'ready' });
    setView('outreach');
  };

  // Pipeline counts
  const dmSent = contacts.filter(c => c.outreachStatus === 'dm-sent').length;
  const replied = contacts.filter(c => c.outreachStatus === 'replied').length;
  const calls = contacts.filter(c => ['call-scheduled', 'call-done'].includes(c.outreachStatus)).length;
  const connected = contacts.filter(c => c.outreachStatus === 'connected').length;

  return (
    <div>
      {/* Pipeline summary */}
      <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16, fontFamily: FONT }}>
        {contactBookEntries.length} contacts &middot; {dmSent} DM sent &middot; {replied} replied &middot; {calls} calls &middot; {connected} connected
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
        {(['contacts', 'outreach'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? t.accentSubtle : 'transparent',
            border: 'none', color: view === v ? t.textStrong : t.textMuted,
            padding: '6px 14px', cursor: 'pointer', borderRadius: 6,
            fontSize: 13, fontFamily: FONT_MEDIUM, transition: 'all 0.15s',
          }}>{v === 'contacts' ? `Contact Book (${contactBookEntries.length})` : `Outreach (${outreachContacts.length})`}</button>
        ))}
      </div>

      {/* Contact Book view */}
      {view === 'contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contactBookEntries.map(c => (
            <ContactBookCard key={c.id} contact={c} onUpdate={p => updateContact(c.id, p)}
              onRemove={() => removeContact(c.id)} onMoveToOutreach={() => moveToOutreach(c.id)} t={t} />
          ))}
          {contactBookEntries.length === 0 && (
            <p style={{ color: t.textMuted, fontSize: 13, textAlign: 'center', padding: 32 }}>
              No contacts yet. Add someone you know.
            </p>
          )}
          <button onClick={addContact} style={{
            background: 'transparent', border: `1px dashed ${t.border}`,
            color: t.textMuted, padding: '12px', borderRadius: 10,
            cursor: 'pointer', fontFamily: FONT, fontSize: 13,
          }}>+ Add Contact</button>
        </div>
      )}

      {/* Outreach view — grouped by company */}
      {view === 'outreach' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(outreachByCompany).map(([company, people]) => (
            <CompanyOutreachCard key={company} company={company} contacts={people}
              onUpdate={updateContact} onRemove={removeContact} t={t} />
          ))}
          {outreachContacts.length === 0 && (
            <p style={{ color: t.textMuted, fontSize: 13, textAlign: 'center', padding: 32 }}>
              No active outreach yet. Move contacts from Contact Book when ready.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Contact Book Card ──
function ContactBookCard({ contact: c, onUpdate, onRemove, onMoveToOutreach, t }: {
  contact: NetworkContact; onUpdate: (p: Partial<NetworkContact>) => void;
  onRemove: () => void; onMoveToOutreach: () => void; t: Theme;
}) {
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <CompanyLogo company={c.company} t={t} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, flex: 1 }}>
            <Field label="Name" value={c.name} onChange={v => onUpdate({ name: v })} placeholder="First Last" t={t} />
            <Field label="Company" value={c.company} onChange={v => onUpdate({ company: v })} placeholder="Company" t={t} />
            <Field label="Role" value={c.role} onChange={v => onUpdate({ role: v })} placeholder="SWE, PM..." t={t} />
          </div>
        </div>
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer',
          fontSize: 16, padding: '0 4px', marginLeft: 8,
        }}>&times;</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 4 }}>Why reach out?</label>
          <TextArea value={c.whyReachOut} onChange={v => onUpdate({ whyReachOut: v })} placeholder="Why this person matters..." t={t} minHeight={60} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: t.textMuted, fontFamily: FONT_MEDIUM, display: 'block', marginBottom: 4 }}>Company info</label>
          <TextArea value={c.companyInfo} onChange={v => onUpdate({ companyInfo: v })} placeholder="Stage, what they do..." t={t} minHeight={60} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Field value={c.foundVia} onChange={v => onUpdate({ foundVia: v })} placeholder="Found via..." t={t} />
          <select value={c.scoutingStatus} onChange={e => onUpdate({ scoutingStatus: e.target.value as ScoutingStatus })} style={{
            background: t.inputBg, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 13, outline: 'none',
          }}>
            <option value="researching">Researching</option>
            <option value="ready">Ready</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        {c.scoutingStatus === 'ready' && (
          <button onClick={onMoveToOutreach} style={{
            background: t.accentSubtle, border: `1px solid ${t.border}`,
            color: t.textStrong, padding: '6px 14px', borderRadius: 8,
            cursor: 'pointer', fontFamily: FONT_MEDIUM, fontSize: 12,
          }}>Move to Outreach &rarr;</button>
        )}
      </div>
    </div>
  );
}

// ── Company Outreach Card (grouped by company) ──
const OUTREACH_STAGES: OutreachStatus[] = ['dm-sent', 'replied', 'call-scheduled', 'call-done', 'connected'];
const STAGE_LABELS: Record<OutreachStatus, string> = {
  'queued': 'Queued', 'dm-sent': 'DM Sent', 'replied': 'Replied',
  'call-scheduled': 'Call Sched.', 'call-done': 'Call Done', 'connected': 'Connected',
};

function CompanyOutreachCard({ company, contacts, onUpdate, onRemove, t }: {
  company: string; contacts: NetworkContact[];
  onUpdate: (id: string, p: Partial<NetworkContact>) => void;
  onRemove: (id: string) => void; t: Theme;
}) {
  // Furthest stage across all contacts in this company
  const bestStageIdx = Math.max(...contacts.map(c => OUTREACH_STAGES.indexOf(c.outreachStatus)));

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {/* Company header */}
      <div style={{
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${t.border}`, background: t.cardBg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CompanyLogo company={company} size={24} t={t} />
          <span style={{ fontFamily: FONT_MEDIUM, color: t.textStrong, fontSize: 14 }}>{company}</span>
          <span style={{ fontSize: 12, color: t.textMuted }}>{contacts.length} {contacts.length === 1 ? 'person' : 'people'}</span>
        </div>
        <a href={getLinkedInSearchUrl(company)} target="_blank" rel="noopener noreferrer" style={{
          fontSize: 11, color: t.textMuted, textDecoration: 'none',
          padding: '4px 10px', borderRadius: 6, border: `1px solid ${t.border}`,
          fontFamily: FONT_MEDIUM, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = t.textStrong; e.currentTarget.style.borderColor = t.textMuted; }}
          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; }}
        >Find People &rarr;</a>
      </div>

      {/* Company-level progress bar */}
      <div style={{ display: 'flex', gap: 0, padding: '0 16px', margin: '10px 0 4px' }}>
        {OUTREACH_STAGES.map((stage, i) => {
          const isActive = i <= bestStageIdx;
          return (
            <div key={stage} style={{
              flex: 1, height: 3, borderRadius: i === 0 ? '2px 0 0 2px' : i === OUTREACH_STAGES.length - 1 ? '0 2px 2px 0' : 0,
              background: isActive ? 'rgba(48, 180, 98, 0.35)' : t.accentSubtle,
              transition: 'background 0.2s',
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 8px', fontSize: 9, color: t.textMuted }}>
        <span>DM Sent</span><span>Connected</span>
      </div>

      {/* Individual contacts */}
      <div style={{ padding: '0 16px 12px' }}>
        {contacts.map(c => {
          const currentIdx = OUTREACH_STAGES.indexOf(c.outreachStatus);
          return (
            <div key={c.id} style={{
              padding: '10px 0', borderTop: `1px solid ${t.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT_MEDIUM, color: t.textStrong, fontSize: 13 }}>
                    {c.name || 'Unnamed'}
                  </span>
                  {c.role && <span style={{ fontSize: 12, color: t.textMuted }}>({c.role})</span>}
                  {c.lastContactDate && <span style={{ fontSize: 11, color: t.textMuted }}>&middot; {c.lastContactDate}</span>}
                </div>
                <button onClick={() => onRemove(c.id)} style={{
                  background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 14,
                }}>&times;</button>
              </div>

              {/* Per-person pipeline */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                {OUTREACH_STAGES.map((stage, i) => {
                  const isActive = i <= currentIdx;
                  return (
                    <button key={stage} onClick={() => onUpdate(c.id, { outreachStatus: stage })} style={{
                      flex: 1, padding: '4px 2px', borderRadius: 5, fontSize: 9,
                      fontFamily: FONT_MEDIUM, cursor: 'pointer', transition: 'all 0.15s',
                      background: isActive ? 'rgba(48, 180, 98, 0.12)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(48, 180, 98, 0.25)' : t.border}`,
                      color: isActive ? '#2d8a56' : t.textMuted,
                    }}>{STAGE_LABELS[stage]}</button>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <Field value={c.platform} onChange={v => onUpdate(c.id, { platform: v })} placeholder="Platform..." t={t} />
                <Field value={c.lastContactDate} onChange={v => onUpdate(c.id, { lastContactDate: v })} placeholder="Last contact..." t={t} />
                <Field value={c.nextAction} onChange={v => onUpdate(c.id, { nextAction: v })} placeholder="Next action..." t={t} />
              </div>
            </div>
          );
        })}
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
          <p style={{ color: t.textMuted, fontSize: 13, textAlign: 'center', padding: 32 }}>
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
            <span style={{ fontSize: 11, color: t.textMuted }}>{dateLabel}</span>
            {idea.tags.length > 0 && idea.tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 4,
                background: t.accentSubtle, color: t.textMuted,
              }}>{tag}</span>
            ))}
            <button onClick={() => setExpanded(!expanded)} style={{
              background: 'none', border: 'none', color: t.textMuted,
              cursor: 'pointer', fontSize: 11, fontFamily: FONT,
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
                padding: '5px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 12,
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
  const [tab, setTab] = useState<'journal' | 'network' | 'ideas'>('journal');
  const [journal, setJournal] = useState<JournalEntry[]>(() => load('journal', []));
  const [contacts, setContacts] = useState<NetworkContact[]>(() => load('contacts', DEFAULT_CONTACTS));
  const [ideas, setIdeas] = useState<ProjectIdea[]>(() => load('ideas', []));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'retrying'>('saved');
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveQueueRef = useRef(new SaveQueue());

  // Per-section timestamps — tracks when each section was last edited locally
  const sectionTs = useRef({ journal: '', contacts: '', ideas: '' });

  // Refs that always hold the latest state — used by sync and beforeunload
  const journalRef = useRef(journal);
  const contactsRef = useRef(contacts);
  const ideasRef = useRef(ideas);
  useEffect(() => { journalRef.current = journal; }, [journal]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);
  useEffect(() => { ideasRef.current = ideas; }, [ideas]);

  // Wire up save queue status
  useEffect(() => {
    saveQueueRef.current.onStatusChange = setSaveStatus;
    return () => { saveQueueRef.current.cancel(); };
  }, []);

  // Run migration once
  useEffect(() => { migrateIfNeeded(); }, []);

  // Load from cloud on mount — merge with localStorage using per-field timestamps
  useEffect(() => {
    loadFromCloud(passHash).then(cloud => {
      const localData: BlackbookData = {
        journal: load('journal', []),
        contacts: load('contacts', DEFAULT_CONTACTS),
        ideas: load('ideas', []),
        journalUpdatedAt: load('journalUpdatedAt', ''),
        contactsUpdatedAt: load('contactsUpdatedAt', ''),
        ideasUpdatedAt: load('ideasUpdatedAt', ''),
      };

      // Per-field merge: newest timestamp wins per section
      const merged = mergeCloudLocal(cloud, localData);
      let loadedJournal = merged.journal ?? [];
      let loadedContacts = merged.contacts ?? [];
      const loadedIdeas = merged.ideas ?? [];

      // Track section timestamps
      sectionTs.current = {
        journal: merged.journalUpdatedAt || new Date().toISOString(),
        contacts: merged.contactsUpdatedAt || new Date().toISOString(),
        ideas: merged.ideasUpdatedAt || new Date().toISOString(),
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

      // Apply to state and cache locally
      setJournal(loadedJournal);
      setContacts(loadedContacts);
      setIdeas(loadedIdeas);
      save('journal', loadedJournal);
      save('contacts', loadedContacts);
      save('ideas', loadedIdeas);
      save('journalUpdatedAt', sectionTs.current.journal);
      save('contactsUpdatedAt', sectionTs.current.contacts);
      save('ideasUpdatedAt', sectionTs.current.ideas);

      // Sync back to cloud (seeds/dedup may have cleaned data)
      const payload: BlackbookData = {
        journal: loadedJournal, contacts: loadedContacts, ideas: loadedIdeas,
        ...sectionTs.current,
        journalUpdatedAt: sectionTs.current.journal,
        contactsUpdatedAt: sectionTs.current.contacts,
        ideasUpdatedAt: sectionTs.current.ideas,
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
    journalUpdatedAt: sectionTs.current.journal,
    contactsUpdatedAt: sectionTs.current.contacts,
    ideasUpdatedAt: sectionTs.current.ideas,
  }), []);

  // Debounced sync with retry queue
  const syncToCloud = useCallback(() => {
    save('journal', journalRef.current);
    save('contacts', contactsRef.current);
    save('ideas', ideasRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
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
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: t.bg, color: t.text, fontFamily: FONT,
      fontSize: 14, overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontFamily: FONT_MEDIUM, color: t.textStrong }}>Ronniel's Blackbook</span>
          <span style={{ color: t.textMuted, fontSize: 13 }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SaveIndicator status={saveStatus} t={t} />
          <button onClick={onClose} style={{
            background: t.accentSubtle, border: 'none',
            color: t.textMuted, cursor: 'pointer', padding: '5px 12px', borderRadius: 6,
            fontSize: 12, fontFamily: FONT_MEDIUM,
          }}>Done</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 24px',
        borderBottom: `1px solid ${t.border}`,
      }}>
        {(['journal', 'network', 'ideas'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            background: 'transparent', border: 'none',
            borderBottom: tab === tb ? `2px solid ${t.textStrong}` : '2px solid transparent',
            color: tab === tb ? t.textStrong : t.textMuted,
            padding: '10px 16px', cursor: 'pointer',
            fontSize: 13, fontFamily: FONT_MEDIUM, transition: 'all 0.15s',
          }}>{tb.charAt(0).toUpperCase() + tb.slice(1)}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 940, margin: '0 auto' }}>
        {tab === 'journal' && <JournalTab journal={journal} setJournal={setJournal} t={t} />}
        {tab === 'network' && <NetworkTab contacts={contacts} setContacts={setContacts} t={t} />}
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
