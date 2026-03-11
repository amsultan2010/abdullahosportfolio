import { useState, useMemo } from 'react';

interface CalendarProps {
  windowMode?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = ({ windowMode }: CalendarProps) => {
  const realToday = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(realToday.getFullYear(), realToday.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [viewMode] = useState<'Month'>('Month');

  const today = {
    year: realToday.getFullYear(),
    month: realToday.getMonth(),
    day: realToday.getDate(),
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const rows: { day: number; month: number; year: number; isCurrentMonth: boolean }[][] = [];
    let currentRow: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      currentRow.push({
        day: daysInPrevMonth - i,
        month: month - 1 < 0 ? 11 : month - 1,
        year: month - 1 < 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      currentRow.push({ day: d, month, year, isCurrentMonth: true });
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    // Next month leading days
    if (currentRow.length > 0) {
      let nextDay = 1;
      while (currentRow.length < 7) {
        currentRow.push({
          day: nextDay++,
          month: month + 1 > 11 ? 0 : month + 1,
          year: month + 1 > 11 ? year + 1 : year,
          isCurrentMonth: false,
        });
      }
      rows.push(currentRow);
    }

    // Ensure we always have 6 rows for consistent height
    while (rows.length < 6) {
      const lastRow = rows[rows.length - 1];
      const lastCell = lastRow[lastRow.length - 1];
      let nextDay = lastCell.day + 1;
      let nextMonth = lastCell.month;
      let nextYear = lastCell.year;
      const daysInLastMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
      if (nextDay > daysInLastMonth) {
        nextDay = 1;
        nextMonth++;
        if (nextMonth > 11) { nextMonth = 0; nextYear++; }
      }
      const newRow: typeof currentRow = [];
      for (let i = 0; i < 7; i++) {
        newRow.push({ day: nextDay, month: nextMonth, year: nextYear, isCurrentMonth: false });
        nextDay++;
        const dim = new Date(nextYear, nextMonth + 1, 0).getDate();
        if (nextDay > dim) { nextDay = 1; nextMonth++; if (nextMonth > 11) { nextMonth = 0; nextYear++; } }
      }
      rows.push(newRow);
    }

    return rows;
  }, [year, month]);

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.year, today.month, 1));

  const isToday = (d: { day: number; month: number; year: number }) =>
    d.day === today.day && d.month === today.month && d.year === today.year;

  const isSelected = (d: { day: number; month: number; year: number }) =>
    selectedDate && d.day === selectedDate.getDate() && d.month === selectedDate.getMonth() && d.year === selectedDate.getFullYear();

  const handleDateClick = (d: { day: number; month: number; year: number; isCurrentMonth: boolean }) => {
    const clickedDate = new Date(d.year, d.month, d.day);
    setSelectedDate(clickedDate);
    // If clicking a date not in the current month, navigate to that month
    if (!d.isCurrentMonth) {
      setCurrentDate(new Date(d.year, d.month, 1));
    }
  };

  const handleBookMeeting = () => {
    setShowBooking(true);
  };

  // Booking overlay with Calendly
  if (showBooking) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {/* Back bar */}
        <div style={{
          height: '36px',
          minHeight: '36px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #e5e5e5',
          background: '#fafafa',
          gap: '8px',
        }}>
          <button
            onClick={() => setShowBooking(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#007aff',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            <span style={{ fontSize: '16px' }}>‹</span> Back to Calendar
          </button>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
            Book a Meeting with Ronnie
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ width: '120px' }} />
        </div>

        {/* Calendly iframe */}
        <iframe
          src="https://calendly.com/ronnielgandhe?hide_gdpr_banner=1"
          style={{
            flex: 1,
            width: '100%',
            border: 'none',
            background: '#fff',
          }}
          title="Book a meeting"
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: 'none',
    }}>
      {/* Toolbar */}
      <div style={{
        height: '36px',
        minHeight: '36px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #e5e5e5',
        background: '#fafafa',
        gap: '4px',
      }}>
        {/* Left: toolbar icons (decorative) */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginRight: '8px' }}>
          <ToolbarIcon>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="#666" strokeWidth="1.2" />
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="#666" strokeWidth="1.2" />
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="#666" strokeWidth="1.2" />
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="#666" strokeWidth="1.2" />
            </svg>
          </ToolbarIcon>
        </div>

        {/* Center: view mode tabs */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex',
            background: '#e8e8e8',
            borderRadius: '6px',
            padding: '1px',
            gap: '1px',
          }}>
            {['Day', 'Week', 'Month', 'Year'].map((mode) => (
              <button
                key={mode}
                style={{
                  padding: '3px 14px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  cursor: 'pointer',
                  background: mode === viewMode ? '#fff' : 'transparent',
                  color: mode === viewMode ? '#1a1a1a' : '#666',
                  boxShadow: mode === viewMode ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Right: search (decorative) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: '#f0f0f0',
          border: '1px solid #ddd',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#999" strokeWidth="1.5" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '12px', color: '#999' }}>Search</span>
        </div>
      </div>

      {/* Month header + navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px 8px',
      }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: 700,
          color: '#1a1a1a',
          margin: 0,
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          letterSpacing: '-0.3px',
        }}>
          {monthName} {year}
        </h1>
        <div style={{ flex: 1 }} />
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <NavButton onClick={goToPrev}>‹</NavButton>
          <button
            onClick={goToToday}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid #d0d0d0',
              background: '#fff',
              fontSize: '12px',
              fontWeight: 500,
              color: '#333',
              cursor: 'pointer',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}
          >
            Today
          </button>
          <NavButton onClick={goToNext}>›</NavButton>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #e5e5e5',
        padding: '0 4px',
      }}>
        {DAYS.map((day) => (
          <div key={day} style={{
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: 600,
            color: '#999',
            padding: '4px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 4px',
      }}>
        {calendarGrid.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              flex: 1,
              borderBottom: ri < calendarGrid.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            {row.map((cell, ci) => {
              const isTodayCell = isToday(cell);
              const isSelectedCell = isSelected(cell);
              return (
                <div
                  key={ci}
                  onClick={() => handleDateClick(cell)}
                  style={{
                    padding: '4px 6px',
                    cursor: 'pointer',
                    borderRight: ci < 6 ? '1px solid #f5f5f5' : 'none',
                    background: isSelectedCell ? 'rgba(0, 122, 255, 0.06)' : 'transparent',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                    minHeight: '60px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelectedCell) e.currentTarget.style.background = '#fafafa';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelectedCell) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: cell.day === 1 && !isTodayCell ? 'flex-start' : 'flex-end',
                    padding: '2px',
                  }}>
                    {cell.day === 1 && !isTodayCell ? (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: cell.isCurrentMonth ? '#666' : '#c0c0c0',
                      }}>
                        {new Date(cell.year, cell.month).toLocaleDateString('en-US', { month: 'short' })} {cell.day}
                      </span>
                    ) : isTodayCell ? (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ff3b30',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#fff',
                          lineHeight: 1,
                        }}>
                          {cell.day}
                        </span>
                      </div>
                    ) : (
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: cell.isCurrentMonth ? '#333' : '#c0c0c0',
                        padding: '2px 4px',
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

      {/* Bottom bar with "Book a Meeting" CTA */}
      <div style={{
        height: '44px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid #e5e5e5',
        background: '#fafafa',
        padding: '0 16px',
        gap: '12px',
      }}>
        <span style={{
          fontSize: '12px',
          color: '#888',
          fontWeight: 400,
        }}>
          Want to connect?
        </span>
        <button
          onClick={handleBookMeeting}
          style={{
            padding: '6px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#007aff',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0, 122, 255, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0066dd';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#007aff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Book a Meeting
        </button>
      </div>
    </div>
  );
};

// ── Helper Components ──

function ToolbarIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      cursor: 'default',
    }}>
      {children}
    </div>
  );
}

function NavButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: '1px solid #d0d0d0',
        background: '#fff',
        fontSize: '18px',
        fontWeight: 300,
        color: '#333',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
    >
      {children}
    </button>
  );
}

export default Calendar;
