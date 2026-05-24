import { useState, useMemo, useCallback } from 'react';

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

interface CalendarProps {
  windowMode?: boolean;
}

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const Calendar = ({ windowMode }: CalendarProps) => {
  const realToday = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(realToday.getFullYear(), realToday.getMonth(), realToday.getDate()));
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [showBooking, setShowBooking] = useState(false);

  const today = {
    year: realToday.getFullYear(),
    month: realToday.getMonth(),
    day: realToday.getDate(),
    dayOfWeek: realToday.getDay(),
  };

  const isToday = (y: number, m: number, d: number) =>
    d === today.day && m === today.month && y === today.year;

  // Navigation
  const goToPrev = useCallback(() => {
    setCurrentDate(prev => {
      if (viewMode === 'Day') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1);
      if (viewMode === 'Week') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7);
      if (viewMode === 'Month') return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return new Date(prev.getFullYear() - 1, 0, 1);
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      if (viewMode === 'Day') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      if (viewMode === 'Week') return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7);
      if (viewMode === 'Month') return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return new Date(prev.getFullYear() + 1, 0, 1);
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(today.year, today.month, today.day));
  }, [today.year, today.month, today.day]);

  // Header text
  const headerText = useMemo(() => {
    if (viewMode === 'Year') return `${currentDate.getFullYear()}`;
    if (viewMode === 'Month') return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'Week') {
      const start = getWeekStart(currentDate);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
      }
      if (start.getFullYear() === end.getFullYear()) {
        return `${MONTHS[start.getMonth()]} – ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
      }
      return `${MONTHS[start.getMonth()]} ${start.getFullYear()} – ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    // Day
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [viewMode, currentDate]);

  // Booking overlay
  if (showBooking) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#fff', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{
          height: '36px', minHeight: '36px', display: 'flex', alignItems: 'center',
          padding: '0 12px', borderBottom: '1px solid #e5e5e5', background: '#fafafa', gap: '8px',
        }}>
          <button onClick={() => setShowBooking(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px',
            color: '#007aff', fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '6px',
          }}>
            <span style={{ fontSize: '16px' }}>‹</span> Back to Calendar
          </button>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>Book a Meeting with Abdullah</span>
          <span style={{ flex: 1 }} />
          <span style={{ width: '120px' }} />
        </div>
        <iframe
          src="https://calendly.com/abdullah-placeholder?hide_gdpr_banner=1"
          style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
          title="Book a meeting"
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'transparent', fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: 'none',
    }}>
      {/* Toolbar — solid white to match calendar content */}
      <div style={{
        height: '38px', minHeight: '38px', display: 'flex', alignItems: 'center',
        padding: '0 14px', borderBottom: '1px solid #e5e5e5', background: '#fff', gap: '8px',
      }}>
        {/* Left: toolbar icons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ToolbarIcon>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="#444" strokeWidth="1.2" />
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="#444" strokeWidth="1.2" />
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="#444" strokeWidth="1.2" />
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="#444" strokeWidth="1.2" />
            </svg>
          </ToolbarIcon>
          <ToolbarIcon>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#444" strokeWidth="1.2" />
              <path d="M5 1.5V4.5" stroke="#444" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M11 1.5V4.5" stroke="#444" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </ToolbarIcon>
          <ToolbarIcon>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="#444" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </ToolbarIcon>
          <ToolbarIcon>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4" stroke="#444" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M12 4H8M12 4V8" stroke="#444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ToolbarIcon>
        </div>

        {/* Center: view mode segmented control */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '7px',
            padding: '2px', border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}>
            {(['Day', 'Week', 'Month', 'Year'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '3px 16px', borderRadius: '5px', border: 'none', fontSize: '12.5px',
                  fontWeight: mode === viewMode ? 500 : 400,
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  cursor: 'pointer',
                  background: mode === viewMode ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
                  color: mode === viewMode ? '#1a1a1a' : 'rgba(0, 0, 0, 0.5)',
                  boxShadow: mode === viewMode ? '0 0.5px 2px rgba(0,0,0,0.15), 0 0.5px 0.5px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Right: search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px',
          borderRadius: '7px', background: 'rgba(255, 255, 255, 0.5)', border: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#999" strokeWidth="1.5" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '12.5px', color: '#aaa', fontWeight: 300 }}>Search</span>
        </div>
      </div>

      {/* White content area below translucent toolbar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

      {/* Header + navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px 8px',
      }}>
        <h1 style={{
          fontSize: '26px', fontWeight: 700, color: '#1a1a1a', margin: 0,
          fontFamily: "'SF Pro Display', -apple-system, sans-serif", letterSpacing: '-0.3px',
        }}>
          <span style={{ fontWeight: 700 }}>{headerText.split(' ')[0]}</span>
          {headerText.includes(' ') && (
            <span style={{ fontWeight: 300 }}>{' '}{headerText.split(' ').slice(1).join(' ')}</span>
          )}
        </h1>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <NavButton onClick={goToPrev}>‹</NavButton>
          <button onClick={goToToday} style={{
            padding: '4px 12px', borderRadius: '6px', border: '1px solid #d0d0d0',
            background: '#fff', fontSize: '12px', fontWeight: 500, color: '#333', cursor: 'pointer',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            Today
          </button>
          <NavButton onClick={goToNext}>›</NavButton>
        </div>
      </div>

      {/* View content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {viewMode === 'Month' && <MonthView currentDate={currentDate} today={today} isToday={isToday} setCurrentDate={setCurrentDate} setViewMode={setViewMode} />}
        {viewMode === 'Year' && <YearView currentDate={currentDate} today={today} isToday={isToday} setCurrentDate={setCurrentDate} setViewMode={setViewMode} />}
        {viewMode === 'Week' && <WeekView currentDate={currentDate} today={today} isToday={isToday} />}
        {viewMode === 'Day' && <DayView currentDate={currentDate} today={today} isToday={isToday} />}
      </div>

      {/* Bottom bar */}
      <div style={{
        height: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderTop: '1px solid #e5e5e5', background: '#fafafa', padding: '0 16px', gap: '12px',
      }}>
        <span style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>Want to connect?</span>
        <button
          onClick={() => setShowBooking(true)}
          style={{
            padding: '6px 20px', borderRadius: '8px', border: 'none', background: '#007aff',
            color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0, 122, 255, 0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0066dd'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#007aff'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Book a Meeting
        </button>
      </div>
      </div>{/* close white content area */}
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// MONTH VIEW
// ────────────────────────────────────────────────────────────
function MonthView({ currentDate, today, isToday, setCurrentDate, setViewMode }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean;
  setCurrentDate: (d: Date) => void; setViewMode: (v: ViewMode) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <>
      {/* Day headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #e5e5e5', padding: '0 4px',
      }}>
        {DAYS_FULL.map((day) => (
          <div key={day} style={{
            textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#999',
            padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.3px',
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
        {grid.map((row, ri) => (
          <div key={ri} style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1,
            borderBottom: ri < grid.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}>
            {row.map((cell, ci) => {
              const todayCell = isToday(cell.year, cell.month, cell.day);
              return (
                <div key={ci} onClick={() => {
                  if (!cell.isCurrentMonth) setCurrentDate(new Date(cell.year, cell.month, 1));
                }} style={{
                  padding: '4px 6px', cursor: 'pointer',
                  borderRight: ci < 6 ? '1px solid #f5f5f5' : 'none',
                  transition: 'background 0.15s ease', position: 'relative', minHeight: '50px',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: cell.day === 1 && !todayCell ? 'flex-start' : 'flex-end', padding: '2px' }}>
                    {cell.day === 1 && !todayCell ? (
                      <span style={{ fontSize: '12px', fontWeight: 500, color: cell.isCurrentMonth ? '#666' : '#c0c0c0' }}>
                        {MONTHS[cell.month].slice(0, 3)} {cell.day}
                      </span>
                    ) : todayCell ? (
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: '#ff3b30',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{cell.day}</span>
                      </div>
                    ) : (
                      <span style={{
                        fontSize: '13px', fontWeight: 500,
                        color: cell.isCurrentMonth ? '#333' : '#c0c0c0', padding: '2px 4px',
                      }}>
                        {cell.day}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// YEAR VIEW
// ────────────────────────────────────────────────────────────
function YearView({ currentDate, today, isToday, setCurrentDate, setViewMode }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean;
  setCurrentDate: (d: Date) => void; setViewMode: (v: ViewMode) => void;
}) {
  const year = currentDate.getFullYear();

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '8px 24px 24px',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px 32px',
    }}>
      {Array.from({ length: 12 }, (_, m) => (
        <MiniMonth
          key={m}
          year={year}
          month={m}
          today={today}
          isToday={isToday}
          onClick={() => {
            setCurrentDate(new Date(year, m, 1));
            setViewMode('Month');
          }}
        />
      ))}
    </div>
  );
}

function MiniMonth({ year, month, today, isToday, onClick }: {
  year: number; month: number;
  today: { year: number; month: number; day: number };
  isToday: (y: number, m: number, d: number) => boolean;
  onClick: () => void;
}) {
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* Month name */}
      <div style={{
        fontSize: '13px', fontWeight: 600, color: '#ff3b30', marginBottom: '6px',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        {MONTHS[month]}
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
        {DAYS_SHORT.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: '9px', fontWeight: 600, color: '#999',
            padding: '1px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      {grid.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
          {row.map((cell, ci) => {
            const isTodayCell = isToday(cell.year, cell.month, cell.day);
            return (
              <div key={ci} style={{
                textAlign: 'center', padding: '1.5px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isTodayCell ? (
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#ff3b30',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{cell.day}</span>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '10px', fontWeight: 400,
                    color: cell.isCurrentMonth ? '#333' : '#ccc',
                    lineHeight: '18px',
                  }}>
                    {cell.day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// WEEK VIEW
// ────────────────────────────────────────────────────────────
function WeekView({ currentDate, today, isToday }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean;
}) {
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    return { date: d, dayName: DAYS_FULL[d.getDay()], dayNum: d.getDate(), isToday: isToday(d.getFullYear(), d.getMonth(), d.getDate()) };
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Day column headers */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', minHeight: '36px' }}>
        {/* Time gutter spacer */}
        <div style={{ width: '56px', minWidth: '56px', borderRight: '1px solid #e8e8e8' }} />
        {weekDays.map((d, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '6px 0 4px',
            borderRight: i < 6 ? '1px solid #f0f0f0' : 'none',
          }}>
            <span style={{
              fontSize: '11px', fontWeight: 600, color: d.isToday ? '#ff3b30' : '#999',
              letterSpacing: '0.3px',
            }}>
              {d.dayName}
            </span>
            {' '}
            <span style={{
              fontSize: '11px',
              fontWeight: d.isToday ? 700 : 400,
              color: d.isToday ? '#ff3b30' : '#666',
            }}>
              {d.dayNum}
            </span>
          </div>
        ))}
      </div>

      {/* All-day row */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', minHeight: '24px' }}>
        <div style={{
          width: '56px', minWidth: '56px', borderRight: '1px solid #e8e8e8',
          fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: '6px',
        }}>
          all-day
        </div>
        {weekDays.map((d, i) => (
          <div key={i} style={{
            flex: 1, borderRight: i < 6 ? '1px solid #f0f0f0' : 'none',
            background: (d.date.getDay() === 0 || d.date.getDay() === 6) ? '#fafafa' : 'transparent',
          }} />
        ))}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* Time gutter */}
          <div style={{ width: '56px', minWidth: '56px', borderRight: '1px solid #e8e8e8' }}>
            {HOURS.map((h) => (
              <div key={h} style={{
                height: '60px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                paddingRight: '6px', paddingTop: '0px',
              }}>
                {h > 0 && (
                  <span style={{
                    fontSize: '10px', color: '#999', fontWeight: 400,
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    lineHeight: 1, transform: 'translateY(-5px)',
                  }}>
                    {formatHour(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((d, i) => (
            <div key={i} style={{
              flex: 1, borderRight: i < 6 ? '1px solid #f0f0f0' : 'none',
              background: (d.date.getDay() === 0 || d.date.getDay() === 6) ? '#fafafa' : 'transparent',
            }}>
              {HOURS.map((h) => (
                <div key={h} style={{
                  height: '60px', borderBottom: '1px solid #f0f0f0',
                  position: 'relative',
                }}>
                  {/* Half-hour line */}
                  <div style={{
                    position: 'absolute', top: '30px', left: 0, right: 0,
                    height: '1px', background: '#f6f6f6',
                  }} />
                </div>
              ))}
            </div>
          ))}

          {/* Current time indicator */}
          {weekDays.some(d => d.isToday) && (() => {
            const todayIdx = weekDays.findIndex(d => d.isToday);
            const now = new Date();
            const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
            const topPx = minutesSinceMidnight; // 1px per minute
            return (
              <div style={{
                position: 'absolute',
                top: `${topPx}px`,
                left: `${56 + (todayIdx * ((100 - 56 * 100 / window.innerWidth) / 7))}%`,
                right: 0, height: '2px', zIndex: 2,
                pointerEvents: 'none',
              }}>
                {/* Red dot */}
                <div style={{
                  position: 'absolute', left: `${(todayIdx / 7) * 100}%`,
                  top: '-4px', width: '10px', height: '10px',
                  borderRadius: '50%', background: '#ff3b30',
                  transform: 'translateX(-5px)',
                }} />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DAY VIEW
// ────────────────────────────────────────────────────────────
function DayView({ currentDate, today, isToday }: {
  currentDate: Date; today: { year: number; month: number; day: number }; isToday: (y: number, m: number, d: number) => boolean;
}) {
  const dayIsToday = isToday(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const dayName = DAYS_FULL[currentDate.getDay()];
  const dayNum = currentDate.getDate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Day header */}
      <div style={{
        display: 'flex', borderBottom: '1px solid #e0e0e0', minHeight: '36px',
      }}>
        <div style={{ width: '56px', minWidth: '56px', borderRight: '1px solid #e8e8e8' }} />
        <div style={{
          flex: 1, textAlign: 'center', padding: '6px 0 4px',
        }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, color: dayIsToday ? '#ff3b30' : '#999',
            letterSpacing: '0.3px',
          }}>
            {dayName}
          </span>
          {' '}
          <span style={{
            fontSize: '12px', fontWeight: dayIsToday ? 700 : 400,
            color: dayIsToday ? '#ff3b30' : '#666',
          }}>
            {dayNum}
          </span>
        </div>
      </div>

      {/* All-day */}
      <div style={{
        display: 'flex', borderBottom: '1px solid #e0e0e0', minHeight: '24px',
      }}>
        <div style={{
          width: '56px', minWidth: '56px', borderRight: '1px solid #e8e8e8',
          fontSize: '10px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: '6px',
        }}>
          all-day
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* Time gutter */}
          <div style={{ width: '56px', minWidth: '56px', borderRight: '1px solid #e8e8e8' }}>
            {HOURS.map((h) => (
              <div key={h} style={{
                height: '60px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                paddingRight: '6px',
              }}>
                {h > 0 && (
                  <span style={{
                    fontSize: '10px', color: '#999', fontWeight: 400,
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    lineHeight: 1, transform: 'translateY(-5px)',
                  }}>
                    {formatHour(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div style={{ flex: 1 }}>
            {HOURS.map((h) => (
              <div key={h} style={{
                height: '60px', borderBottom: '1px solid #f0f0f0', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '30px', left: 0, right: 0,
                  height: '1px', background: '#f6f6f6',
                }} />
              </div>
            ))}
          </div>

          {/* Current time line */}
          {dayIsToday && (() => {
            const now = new Date();
            const topPx = now.getHours() * 60 + now.getMinutes();
            return (
              <div style={{
                position: 'absolute', top: `${topPx}px`,
                left: '50px', right: 0, height: '2px',
                background: '#ff3b30', zIndex: 2, pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute', left: '0', top: '-4px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#ff3b30', transform: 'translateX(-5px)',
                }} />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h === 12) return 'Noon';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

interface GridCell {
  day: number; month: number; year: number; isCurrentMonth: boolean;
}

function buildMonthGrid(year: number, month: number): GridCell[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const rows: GridCell[][] = [];
  let currentRow: GridCell[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const m = month - 1 < 0 ? 11 : month - 1;
    const y = month - 1 < 0 ? year - 1 : year;
    currentRow.push({ day: daysInPrevMonth - i, month: m, year: y, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    currentRow.push({ day: d, month, year, isCurrentMonth: true });
    if (currentRow.length === 7) { rows.push(currentRow); currentRow = []; }
  }

  // Next month
  if (currentRow.length > 0) {
    let nextDay = 1;
    const nm = month + 1 > 11 ? 0 : month + 1;
    const ny = month + 1 > 11 ? year + 1 : year;
    while (currentRow.length < 7) {
      currentRow.push({ day: nextDay++, month: nm, year: ny, isCurrentMonth: false });
    }
    rows.push(currentRow);
  }

  // Pad to 6 rows
  while (rows.length < 6) {
    const lastRow = rows[rows.length - 1];
    const last = lastRow[lastRow.length - 1];
    let nd = last.day + 1;
    let nm = last.month;
    let ny = last.year;
    const dim = new Date(ny, nm + 1, 0).getDate();
    if (nd > dim) { nd = 1; nm++; if (nm > 11) { nm = 0; ny++; } }
    const newRow: GridCell[] = [];
    for (let i = 0; i < 7; i++) {
      newRow.push({ day: nd, month: nm, year: ny, isCurrentMonth: false });
      nd++;
      const d2 = new Date(ny, nm + 1, 0).getDate();
      if (nd > d2) { nd = 1; nm++; if (nm > 11) { nm = 0; ny++; } }
    }
    rows.push(newRow);
  }

  return rows;
}

// ── UI Components ──
function ToolbarIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '24px', height: '24px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', borderRadius: '4px', cursor: 'default',
    }}>
      {children}
    </div>
  );
}

function NavButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d0d0d0',
      background: '#fff', fontSize: '18px', fontWeight: 300, color: '#333', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      fontFamily: "'SF Pro Text', -apple-system, sans-serif", transition: 'background 0.15s ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
    >
      {children}
    </button>
  );
}

export default Calendar;
