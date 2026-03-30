import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════
   BLACKBOOK — Ronniel's hidden personal dashboard
   Password-gated, Supabase-synced, Apple-style clean UI
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://czdvtqqanvmgptginlwa.supabase.co';
const SUPABASE_ANON = 'sb_publishable_cNeHCMWzmLHmEfor6SDG3A_RJhF1SCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function hashPass(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const PASS = 'rg'; // change this

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ── Colors (Apple-inspired greys) ──
const C = {
  bg: 'rgba(28, 28, 30, 0.97)',
  surface: 'rgba(44, 44, 46, 0.8)',
  surfaceSolid: '#2c2c2e',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  text: '#f5f5f7',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textTertiary: 'rgba(255, 255, 255, 0.3)',
  accent: '#0a84ff',
  green: '#30d158',
  yellow: '#ffd60a',
  orange: '#ff9f0a',
  red: '#ff453a',
  purple: '#bf5af2',
  pink: '#ff375f',
  inputBg: 'rgba(255, 255, 255, 0.05)',
};

// ── Types ──
interface DayLog {
  date: string;
  wakeTime: string;
  gym: boolean;
  workoutType: string;
  calories: string;
  protein: string;
  hoursCoded: string;
  built: string;
  outreach: string;
  contentPosted: boolean;
  notes: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  stage: string;
  status: 'cold' | 'engaged' | 'dmd' | 'call' | 'referred';
  lastContact: string;
  nextAction: string;
  notes: string;
}

interface Project {
  id: string;
  name: string;
  status: 'not-started' | 'in-progress' | 'shipped';
  shipped: boolean;
  posted: boolean;
  traction: string;
  nextStep: string;
  priority: 'high' | 'medium' | 'low';
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

// ── Default data ──
const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: '', company: 'Alpaca', role: '', stage: 'Series B', status: 'cold', lastContact: '', nextAction: 'Find eng on LinkedIn', notes: '' },
  { id: '2', name: '', company: 'Composer', role: '', stage: 'Series A', status: 'cold', lastContact: '', nextAction: 'Find eng on LinkedIn', notes: '' },
  { id: '3', name: '', company: 'Ramp', role: '', stage: 'Series D', status: 'cold', lastContact: '', nextAction: 'Find eng on LinkedIn', notes: '' },
  { id: '4', name: '', company: 'Vercel', role: '', stage: 'Series D', status: 'cold', lastContact: '', nextAction: 'Find eng on LinkedIn', notes: '' },
  { id: '5', name: '', company: 'Mercury', role: '', stage: 'Series C', status: 'cold', lastContact: '', nextAction: 'Find eng on LinkedIn', notes: '' },
  { id: '6', name: '', company: 'Kalshi', role: '', stage: 'Series B', status: 'cold', lastContact: '', nextAction: 'Find eng on LinkedIn', notes: '' },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', name: 'Market Mood', status: 'in-progress', shipped: false, posted: false, traction: '', nextStep: 'Polish + deploy to Vercel', priority: 'high' },
  { id: '2', name: 'LinkedIn Games Solver', status: 'shipped', shipped: true, posted: false, traction: '7 organic users', nextStep: 'Proper launch + post', priority: 'high' },
  { id: '3', name: 'Trading Pipeline', status: 'in-progress', shipped: false, posted: false, traction: '2.75 PF backtest', nextStep: 'Run live on prop firm', priority: 'medium' },
  { id: '4', name: 'API Cost Scanner', status: 'not-started', shipped: false, posted: false, traction: '', nextStep: 'Research + build', priority: 'medium' },
  { id: '5', name: 'QuantZoo', status: 'in-progress', shipped: false, posted: false, traction: '', nextStep: 'Reframe as engineering', priority: 'low' },
  { id: '6', name: 'RonnielOS', status: 'shipped', shipped: true, posted: false, traction: 'Portfolio site', nextStep: 'Add real projects', priority: 'low' },
];

// ── Fingerprint SVG ──
function FingerprintIcon({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 3000); return () => clearTimeout(t); }, []);

  return (
    <button
      onClick={onClick}
      aria-label="Access"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        opacity: visible ? 0.06 : 0,
        transition: 'opacity 1.5s ease',
        padding: 8,
        color: '#fff',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.2'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.06'; }}
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

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (pw === PASS) {
      onUnlock(pw);
    } else {
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        animation: shake ? 'bb-shake 0.4s ease' : undefined,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
            <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 5.5 2 6 5"/>
            <path d="M9 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1 6-2 8"/>
            <path d="M12 12v4"/>
            <path d="M2 16c1-2 2.5-3.5 4-4.5"/>
            <path d="M18 14c.5 2 .5 4-.5 6"/>
            <path d="M22 20c-1-1.5-2-3.5-2-6"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="passphrase"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 10,
            padding: '12px 20px',
            color: C.text,
            fontSize: 15,
            fontFamily: FONT,
            outline: 'none',
            width: 240,
            textAlign: 'center',
            letterSpacing: 2,
          }}
        />
        <span style={{ color: C.textTertiary, fontSize: 12, fontWeight: 500, letterSpacing: 0.5 }}>press enter</span>
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

// ── Status badge ──
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    cold: '#8e8e93', engaged: C.yellow, dmd: C.accent,
    call: C.purple, referred: C.green,
    'not-started': '#8e8e93', 'in-progress': C.orange, shipped: C.green,
    high: C.red, medium: C.orange, low: '#8e8e93',
  };
  const col = colors[status] || '#8e8e93';
  return (
    <span style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 6,
      background: `${col}18`,
      color: col,
      fontWeight: 500, letterSpacing: 0.2,
    }}>{status.replace('-', ' ')}</span>
  );
}

// ── Daily Score ──
function calcScore(log: DayLog): number {
  let s = 0;
  if (log.gym) s += 2;
  const hrs = parseFloat(log.hoursCoded);
  if (!isNaN(hrs)) s += Math.min(hrs, 4);
  if (log.outreach.trim()) s += 2;
  if (log.contentPosted) s += 2;
  return s;
}

// ── Pill toggle button ──
function PillToggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(48, 209, 88, 0.15)' : C.inputBg,
      border: `1px solid ${active ? 'rgba(48, 209, 88, 0.3)' : C.border}`,
      color: active ? C.green : C.textTertiary,
      padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
      fontFamily: FONT, fontSize: 13, fontWeight: 500,
      transition: 'all 0.2s ease',
    }}>{label}</button>
  );
}

// ── Supabase sync helpers ──
async function loadFromCloud(passHash: string) {
  const { data } = await supabase
    .from('blackbook')
    .select('data')
    .eq('pass_hash', passHash)
    .single();
  return data?.data as { logs?: DayLog[]; contacts?: Contact[]; projects?: Project[] } | null;
}

async function saveToCloud(passHash: string, payload: { logs: DayLog[]; contacts: Contact[]; projects: Project[] }) {
  await supabase.from('blackbook').upsert({
    pass_hash: passHash,
    data: payload,
    updated_at: new Date().toISOString(),
  });
}

// ── Main Dashboard ──
function Dashboard({ onClose, passHash }: { onClose: () => void; passHash: string }) {
  const [tab, setTab] = useState<'log' | 'network' | 'projects'>('log');
  const [logs, setLogs] = useState<DayLog[]>(() => load('logs', []));
  const [contacts, setContacts] = useState<Contact[]>(() => load('contacts', DEFAULT_CONTACTS));
  const [projects, setProjects] = useState<Project[]>(() => load('projects', DEFAULT_PROJECTS));
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load from Supabase on mount — cloud wins over localStorage
  useEffect(() => {
    loadFromCloud(passHash).then(cloud => {
      if (cloud) {
        if (cloud.logs?.length) { setLogs(cloud.logs); save('logs', cloud.logs); }
        if (cloud.contacts?.length) { setContacts(cloud.contacts); save('contacts', cloud.contacts); }
        if (cloud.projects?.length) { setProjects(cloud.projects); save('projects', cloud.projects); }
      }
      setSynced(true);
    });
  }, [passHash]);

  // Debounced cloud save
  const syncToCloud = useCallback((l: DayLog[], c: Contact[], p: Project[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToCloud(passHash, { logs: l, contacts: c, projects: p });
    }, 1500);
  }, [passHash]);

  useEffect(() => { save('logs', logs); if (synced) syncToCloud(logs, contacts, projects); }, [logs]);
  useEffect(() => { save('contacts', contacts); if (synced) syncToCloud(logs, contacts, projects); }, [contacts]);
  useEffect(() => { save('projects', projects); if (synced) syncToCloud(logs, contacts, projects); }, [projects]);

  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === today);

  const addTodayLog = () => {
    if (todayLog) return;
    setLogs(prev => [...prev, {
      date: today, wakeTime: '', gym: false, workoutType: '', calories: '',
      protein: '', hoursCoded: '', built: '', outreach: '', contentPosted: false, notes: '',
    }]);
  };

  const updateLog = (date: string, patch: Partial<DayLog>) => {
    setLogs(prev => prev.map(l => l.date === date ? { ...l, ...patch } : l));
  };

  const addContact = () => {
    setContacts(prev => [...prev, {
      id: Date.now().toString(), name: '', company: '', role: '', stage: '',
      status: 'cold', lastContact: '', nextAction: '', notes: '',
    }]);
  };

  const updateContact = (id: string, patch: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  // Stats
  const weekLogs = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const weekScore = weekLogs.reduce((sum, l) => sum + calcScore(l), 0);
  const gymDays = weekLogs.filter(l => l.gym).length;
  const activeContacts = contacts.filter(c => c.status !== 'cold').length;
  const shippedProjects = projects.filter(p => p.shipped).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: C.bg,
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      color: C.text,
      fontFamily: FONT,
      fontSize: 14,
      overflow: 'auto',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 24px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>Blackbook</span>
          <span style={{ color: C.textTertiary, fontSize: 13 }}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: C.green }}>{weekScore} pts</span>
            <span style={{ color: C.textTertiary }}>Gym {gymDays}/7</span>
            <span style={{ color: C.textTertiary }}>Network {activeContacts}</span>
            <span style={{ color: C.textTertiary }}>Shipped {shippedProjects}</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: C.textSecondary, cursor: 'pointer', padding: '5px 12px', borderRadius: 6,
            fontSize: 12, fontFamily: FONT, fontWeight: 500,
          }}>Done</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 24px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {(['log', 'network', 'projects'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            color: tab === t ? C.text : C.textTertiary,
            padding: '7px 16px', cursor: 'pointer', borderRadius: 6,
            fontSize: 13, fontFamily: FONT, fontWeight: 500,
            transition: 'all 0.15s ease',
          }}>{t === 'log' ? 'Daily Log' : t === 'network' ? 'Network' : 'Projects'}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 920, margin: '0 auto' }}>

        {/* ── DAILY LOG ── */}
        {tab === 'log' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!todayLog && (
              <button onClick={addTodayLog} style={{
                background: C.inputBg, border: `1px solid ${C.borderLight}`,
                color: C.text, padding: '14px 20px', borderRadius: 10,
                cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 500,
              }}>+ Log Today</button>
            )}
            {[...logs].reverse().map(log => (
              <div key={log.date} style={{
                border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 18,
                background: log.date === today ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {new Date(log.date + 'T12:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ color: C.green, fontSize: 13, fontWeight: 500 }}>{calcScore(log)}/10</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  <Field label="Wake" value={log.wakeTime} onChange={v => updateLog(log.date, { wakeTime: v })} placeholder="7:00 AM" />
                  <div>
                    <label style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, display: 'block', marginBottom: 6 }}>Gym</label>
                    <PillToggle active={log.gym} label={log.gym ? 'Yes' : 'No'} onClick={() => updateLog(log.date, { gym: !log.gym })} />
                  </div>
                  <Field label="Workout" value={log.workoutType} onChange={v => updateLog(log.date, { workoutType: v })} placeholder="push / pull / legs" />
                  <Field label="Calories" value={log.calories} onChange={v => updateLog(log.date, { calories: v })} placeholder="2200" />
                  <Field label="Protein" value={log.protein} onChange={v => updateLog(log.date, { protein: v })} placeholder="150g" />
                  <Field label="Hours Coded" value={log.hoursCoded} onChange={v => updateLog(log.date, { hoursCoded: v })} placeholder="4" />
                  <Field label="Built" value={log.built} onChange={v => updateLog(log.date, { built: v })} placeholder="what did you ship?" />
                  <Field label="Outreach" value={log.outreach} onChange={v => updateLog(log.date, { outreach: v })} placeholder="who did you reach out to?" />
                  <div>
                    <label style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, display: 'block', marginBottom: 6 }}>Posted?</label>
                    <PillToggle active={log.contentPosted} label={log.contentPosted ? 'Yes' : 'No'} onClick={() => updateLog(log.date, { contentPosted: !log.contentPosted })} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Field label="Notes" value={log.notes} onChange={v => updateLog(log.date, { notes: v })} placeholder="anything else..." />
                </div>
              </div>
            ))}
            {logs.length === 0 && <p style={{ color: C.textTertiary, textAlign: 'center', padding: 48 }}>No logs yet. Start tracking today.</p>}
          </div>
        )}

        {/* ── NETWORK ── */}
        {tab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Network pills */}
            <div style={{
              border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 20, marginBottom: 4,
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(10, 132, 255, 0.12)', border: `1.5px solid rgba(10, 132, 255, 0.3)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: C.accent, fontWeight: 600,
              }}>YOU</div>
              {contacts.map(c => {
                const statusColors: Record<string, string> = {
                  cold: '#8e8e93', engaged: C.yellow, dmd: C.accent, call: C.purple, referred: C.green,
                };
                const col = statusColors[c.status] || '#8e8e93';
                return (
                  <div key={c.id} style={{
                    padding: '6px 14px', borderRadius: 20,
                    border: `1px solid ${col}30`,
                    background: `${col}10`,
                    fontSize: 12, fontWeight: 500,
                    color: c.status === 'cold' ? C.textTertiary : C.text,
                  }}>{c.name || c.company}</div>
                );
              })}
            </div>

            {/* Contact cards */}
            {contacts.map(c => (
              <div key={c.id} style={{
                border: `1px solid ${C.border}`, borderRadius: 12, padding: 16,
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'start',
              }}>
                <div>
                  <Field label="Name" value={c.name} onChange={v => updateContact(c.id, { name: v })} placeholder="First Last" />
                  <div style={{ marginTop: 8 }}>
                    <Field label="Company" value={c.company} onChange={v => updateContact(c.id, { company: v })} placeholder="Company" />
                  </div>
                </div>
                <div>
                  <Field label="Role" value={c.role} onChange={v => updateContact(c.id, { role: v })} placeholder="SWE, PM..." />
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, display: 'block', marginBottom: 6 }}>Status</label>
                    <select value={c.status} onChange={e => updateContact(c.id, { status: e.target.value as Contact['status'] })} style={{
                      display: 'block', background: C.surfaceSolid, border: `1px solid ${C.border}`,
                      color: C.text, padding: '7px 10px', borderRadius: 8, fontFamily: FONT, fontSize: 13, width: '100%',
                      outline: 'none',
                    }}>
                      <option value="cold">Cold</option>
                      <option value="engaged">Engaged</option>
                      <option value="dmd">DM'd</option>
                      <option value="call">Call</option>
                      <option value="referred">Referred</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Field label="Next Action" value={c.nextAction} onChange={v => updateContact(c.id, { nextAction: v })} placeholder="What's next?" />
                  <div style={{ marginTop: 8 }}>
                    <Field label="Notes" value={c.notes} onChange={v => updateContact(c.id, { notes: v })} placeholder="..." />
                  </div>
                </div>
                <button onClick={() => removeContact(c.id)} style={{
                  background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer',
                  fontSize: 16, padding: 4, marginTop: 12,
                }} title="Remove">&times;</button>
              </div>
            ))}
            <button onClick={addContact} style={{
              background: 'transparent', border: `1px dashed ${C.borderLight}`,
              color: C.textSecondary, padding: '12px', borderRadius: 10,
              cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500,
            }}>+ Add Contact</button>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map(p => (
              <div key={p.id} style={{
                border: `1px solid ${C.border}`, borderRadius: 12, padding: 16,
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                    <StatusBadge status={p.status} />
                    <StatusBadge status={p.priority} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Next Step" value={p.nextStep} onChange={v => updateProject(p.id, { nextStep: v })} placeholder="..." />
                    <Field label="Traction" value={p.traction} onChange={v => updateProject(p.id, { traction: v })} placeholder="users, metrics..." />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => updateProject(p.id, { shipped: !p.shipped })} style={{
                    background: p.shipped ? 'rgba(48, 209, 88, 0.12)' : C.inputBg,
                    border: `1px solid ${p.shipped ? 'rgba(48, 209, 88, 0.25)' : C.border}`,
                    color: p.shipped ? C.green : C.textTertiary,
                    padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                    fontFamily: FONT, fontSize: 11, fontWeight: 500,
                  }}>Ship</button>
                  <button onClick={() => updateProject(p.id, { posted: !p.posted })} style={{
                    background: p.posted ? 'rgba(10, 132, 255, 0.12)' : C.inputBg,
                    border: `1px solid ${p.posted ? 'rgba(10, 132, 255, 0.25)' : C.border}`,
                    color: p.posted ? C.accent : C.textTertiary,
                    padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                    fontFamily: FONT, fontSize: 11, fontWeight: 500,
                  }}>Post</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Input field ──
function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, display: 'block', marginBottom: 6 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        background: C.inputBg, border: `1px solid ${C.border}`,
        color: C.text, padding: '7px 10px', borderRadius: 8,
        fontFamily: FONT, fontSize: 13, width: '100%',
        outline: 'none', transition: 'border-color 0.2s',
      }} onFocus={e => { e.target.style.borderColor = 'rgba(10, 132, 255, 0.4)'; }}
         onBlur={e => { e.target.style.borderColor = C.border; }} />
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
