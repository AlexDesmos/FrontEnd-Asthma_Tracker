import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import '../css/CustomMedicineHeatmap.css';

/**
 * props:
 * - rows: [{ key, title, sub, data:[{date,dateFull,count,times[]}] }]
 * - dates: [{ label, labelFull, iso }]
 * - height?: number
 * - cellMinWidth?: number
 * - bottomSafe?: number   // "запретная" нижняя зона (px) — высота нижней панели. По умолчанию 96.
 */
export default function CustomMedicineHeatmap({
  rows = [],
  dates = [],
  height = 320,
  cellMinWidth = 64,
  bottomSafe = 96, // нижняя панель/табы
}) {
  const wrapRef = useRef(null);
  const ttRef = useRef(null);

  // responsive
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

  // tooltip
  const [tooltip, setTooltip] = useState(null); // {x,y, html}
  const [pinned, setPinned] = useState(false);

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

  /** Вычисляем позицию тултипа относительно ВЬЮПОРТА с авто-флипом вверх/вниз */
  const calcPositionByCell = useCallback((cellEl) => {
    const pad = 8; // "внешний" отступ от краёв
    const arrowGap = 8; // зазор между ячейкой и тултипом

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const safeBottom = bottomSafe + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0);

    const rect = cellEl.getBoundingClientRect();
    // Базовая ширина/высота тултипа (если ещё не отрисован)
    let tw = 240, th = 120;
    if (ttRef.current) {
      const tr = ttRef.current.getBoundingClientRect();
      tw = tr.width;
      th = tr.height;
    }

    // Пытаемся поставить СНИЗУ от ячейки, центрируя по X
    let x = rect.left + rect.width / 2 - tw / 2;
    let y = rect.bottom + arrowGap;

    // Если снизу не влезает — ставим ВЫШЕ ячейки
    if (y + th > vh - safeBottom - pad) {
      y = rect.top - th - arrowGap;
    }
    // Если и сверху не влезает — "прижимаем" к верхнему/нижнему краю
    if (y < pad) y = pad;
    if (y + th > vh - safeBottom - pad) y = vh - safeBottom - pad - th;

    // Кламп по ширине вьюпорта
    if (x < pad) x = pad;
    if (x + tw > vw - pad) x = vw - pad - tw;

    return { x, y };
  }, [bottomSafe]);

  const showTooltipByCell = useCallback((cell, rowTitle, cellEl) => {
    const pos = calcPositionByCell(cellEl);
    setTooltip({ x: pos.x, y: pos.y, html: makeHtml(rowTitle, cell) });
  }, [calcPositionByCell]);

  // при изменении размеров окна — поправить позицию закреплённого тултипа (если есть ref)
  useEffect(() => {
    const onWinResize = () => {
      if (!pinned || !ttRef.current) return;
      // если закреплён — оставим на месте, но не даём вылезти за края
      const tr = ttRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 8;
      const safeBottom = bottomSafe + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0);

      const nx = Math.max(pad, Math.min(tooltip.x, vw - pad - tr.width));
      const ny = Math.max(pad, Math.min(tooltip.y, vh - safeBottom - pad - tr.height));
      if (nx !== tooltip.x || ny !== tooltip.y) {
        setTooltip(t => t ? { ...t, x: nx, y: ny } : t);
      }
    };
    window.addEventListener('resize', onWinResize);
    return () => window.removeEventListener('resize', onWinResize);
  }, [pinned, tooltip, bottomSafe]);

  const onCellEnter = (e, cell, rowTitle) => {
    if (pinned) return;
    showTooltipByCell(cell, rowTitle, e.currentTarget);
  };
  const onCellLeave = () => { if (!pinned) setTooltip(null); };

  const onCellClick = (e, cell, rowTitle) => {
    e.stopPropagation();
    setPinned(true);
    showTooltipByCell(cell, rowTitle, e.currentTarget);
    e.currentTarget?.blur?.();
  };
  const onCellTouch = (e, cell, rowTitle) => {
    e.stopPropagation();
    setPinned(true);
    showTooltipByCell(cell, rowTitle, e.currentTarget);
    e.currentTarget?.blur?.();
  };
  const onKeyDown = (e, cell, rowTitle) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setPinned(true);
      showTooltipByCell(cell, rowTitle, e.currentTarget);
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
                  onMouseEnter: (e) => onCellEnter(e, cell, rowTitle),
                  onMouseLeave: onCellLeave,
                  onClick: (e) => onCellClick(e, cell, rowTitle),
                  onTouchStart: (e) => onCellTouch(e, cell, rowTitle),
                  onKeyDown: (e) => onKeyDown(e, cell, rowTitle),
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
        <div
          ref={ttRef}
          className="med-heat-tooltip"
          style={{ left: tooltip.x, top: tooltip.y, position: 'fixed' }} // фикс к вьюпорту
        >
          <div dangerouslySetInnerHTML={{ __html: tooltip.html }} />
        </div>
      )}
    </div>
  );
}
