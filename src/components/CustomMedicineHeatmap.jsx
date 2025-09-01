import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import '../css/CustomMedicineHeatmap.css';

export default function CustomMedicineHeatmap({ rows = [], dates = [], height = 320, cellMinWidth = 64 }) {
  const wrapRef = useRef(null);
  const ttRef = useRef(null);

  const [wrapW, setWrapW] = useState(1024);
  const isMobile = wrapW < 540;
  const isTablet = wrapW >= 540 && wrapW < 900;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWrapW(e.contentRect?.width || window.innerWidth);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const [tooltip, setTooltip] = useState(null);
  const [pinned, setPinned] = useState(false);

  const clampToWrap = useCallback((x, y) => {
    const wrap = wrapRef.current;
    if (!wrap) return { x, y };
    const r = wrap.getBoundingClientRect();
    const tt = ttRef.current;
    const pad = 6;

    let w = 180, h = 120;
    if (tt) {
      const tr = tt.getBoundingClientRect();
      w = tr.width;
      h = tr.height;
    }

    const maxX = r.width - w - pad;
    const maxY = r.height - h - pad;
    return {
      x: Math.max(pad, Math.min(x, Math.max(pad, maxX))),
      y: Math.max(pad, Math.min(y, Math.max(pad, maxY))),
    };
  }, []);

  const posFromEvent = useCallback((e, fallbackEl) => {
    const wrapRect = wrapRef.current?.getBoundingClientRect?.() || { left: 0, top: 0 };
    let clientX, clientY;
    if (e && typeof e.clientX === 'number') {
      clientX = e.clientX; clientY = e.clientY;
    } else if (e?.touches?.[0]) {
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
    } else if (fallbackEl) {
      const r = fallbackEl.getBoundingClientRect();
      clientX = r.left + r.width / 2; clientY = r.top + r.height / 2;
    } else {
      clientX = wrapRect.left + 10; clientY = wrapRect.top + 10;
    }
    const x = clientX - wrapRect.left + 8;
    const y = clientY - wrapRect.top + 8;
    return clampToWrap(x, y);
  }, [clampToWrap]);

  const makeHtml = (rowTitle, cell) => {
    const timesHtml = cell.times && cell.times.length
      ? `<div class="tt-list">${cell.times.map(t => `<div class="tt-row">• ${t}</div>`).join('')}</div>`
      : `<div class="tt-muted">Нет временных отметок</div>`;
    return `
      <div class="tt-title">${rowTitle}</div>
      <div class="tt-date">${cell.dateFull}</div>
      <div class="tt-count">Записей: <b>${cell.count}</b></div>
      ${timesHtml}
    `;
  };

  const showTooltip = useCallback((e, cell, rowTitle, targetEl) => {
    const { x, y } = posFromEvent(e, targetEl);
    setTooltip({ x, y, html: makeHtml(rowTitle, cell) });
  }, [posFromEvent]);

  useEffect(() => {
    if (!tooltip) return;
    const adj = clampToWrap(tooltip.x, tooltip.y);
    if (adj.x !== tooltip.x || adj.y !== tooltip.y) {
      setTooltip(t => ({ ...t, ...adj }));
    }
    const onWinResize = () => {
      setTooltip(t => t ? clampToWrap(t.x, t.y) : t);
    };
    window.addEventListener('resize', onWinResize);
    return () => window.removeEventListener('resize', onWinResize);
  }, [tooltip, clampToWrap]);

  const onCellEnter = (e, cell, rowTitle, el) => { if (!pinned) showTooltip(e, cell, rowTitle, el); };
  const onCellMove  = (e) => {
    if (!tooltip || pinned || !e?.clientX) return;
    const wrapRect = wrapRef.current?.getBoundingClientRect?.() || { left: 0, top: 0 };
    const x = e.clientX - wrapRect.left + 8;
    const y = e.clientY - wrapRect.top + 8;
    const adj = clampToWrap(x, y);
    setTooltip(t => t ? { ...t, ...adj } : t);
  };
  const onCellLeave = () => { if (!pinned) setTooltip(null); };

  const onCellClick = (e, cell, rowTitle, el) => {
    e.stopPropagation();
    setPinned(true);
    showTooltip(e, cell, rowTitle, el);
    if (e.currentTarget?.blur) e.currentTarget.blur();
  };

  const onCellTouch = (e, cell, rowTitle, el) => {
    e.stopPropagation();
    setPinned(true);
    showTooltip(e, cell, rowTitle, el);
    if (e.currentTarget?.blur) e.currentTarget.blur();
  };

  const onKeyDown    = (e, cell, rowTitle, el) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setPinned(true);
      showTooltip(e, cell, rowTitle, el);
    }
  };

  const onWrapClick = () => { setPinned(false); setTooltip(null); };

  // GRID TEMPLATE
  const gridTemplate = useMemo(() => {
    if (isMobile)       return `minmax(120px, 1.3fr) repeat(${dates.length}, 1fr)`;
    if (isTablet)       return `minmax(160px, 1.1fr) repeat(${dates.length}, 1fr)`;
    const cols = [`minmax(220px, 1fr)`].concat(Array(dates.length).fill(`minmax(${cellMinWidth}px, 1fr)`));
    return cols.join(' ');
  }, [dates.length, cellMinWidth, isMobile, isTablet]);

  const rowTitleMaxLines = isMobile ? 2 : 3;

  return (
    <div
      ref={wrapRef}
      className={`med-heat-wrap ${isMobile ? 'is-mobile' : isTablet ? 'is-tablet' : 'is-desktop'}`}
      style={{ height }}
      onMouseMove={onCellMove}
      onMouseLeave={onCellLeave}
      onClick={onWrapClick}
    >
      <div className="med-heat-grid" style={{ gridTemplateColumns: gridTemplate }}>
        {/* Заголовки */}
        <div className="med-heat-head med-heat-left">Лекарство</div>
        {dates.map((d, idx) => (
          <div key={`head-${idx}`} className="med-heat-head med-heat-date">{d.label}</div>
        ))}

        {/* Строки */}
        {rows.map((row) => {
          const rowTitle = `${row.title}${row.sub ? `, ${row.sub}` : ''}`;
          return (
            <React.Fragment key={row.key}>
              <div className="med-heat-left med-heat-leftcell">
                <div className="med-title" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: rowTitleMaxLines,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{row.title}</div>
                {row.sub ? <div className="med-sub">{row.sub}</div> : null}
              </div>
              {row.data.map((cell, ci) => {
                const cls = cell.count === 0
                  ? 'med-cell zero'
                  : (cell.count === 1 ? 'med-cell one' : (cell.count <= 3 ? 'med-cell few' : 'med-cell many'));
                const handlers = {
                  onMouseEnter: (e) => onCellEnter(e, cell, rowTitle, e.currentTarget),
                  onClick: (e) => onCellClick(e, cell, rowTitle, e.currentTarget),
                  onTouchStart: (e) => onCellTouch(e, cell, rowTitle, e.currentTarget),
                  onKeyDown: (e) => onKeyDown(e, cell, rowTitle, e.currentTarget),
                };
                return (
                  <div
                    key={`${row.key}-c-${ci}`}
                    className={cls}
                    tabIndex={0}
                    aria-label={`${rowTitle}. ${cell.dateFull}. Записей: ${cell.count}`}
                    {...handlers}
                  >
                    {cell.count > 0 ? <span className="med-count">{cell.count}</span> : <span className="med-dot">—</span>}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {tooltip && (
        <div ref={ttRef} className="med-heat-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div dangerouslySetInnerHTML={{ __html: tooltip.html }} />
        </div>
      )}
    </div>
  );
}
