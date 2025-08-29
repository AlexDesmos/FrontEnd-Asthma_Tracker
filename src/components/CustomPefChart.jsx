import React, { useMemo, useRef, useState } from 'react';
import '../css/CustomPefChart.css';

/**
 * Кастомный SVG-график ПЭФ.
 * Внутренний скролл по X, кламп тултипа по краям контейнера.
 */
export default function CustomPefChart({
  data = [],
  zones = null,
  height = 320,
  yStep = 25,
  minPxPerPoint = 56,
  maxXTicks = 8
}) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const ttRef = useRef(null);
  const [hover, setHover] = useState({ i: null, x: 0, y: 0, leftPx: 0, topPx: 0 });

  const M = { left: 56, right: 20, top: 18, bottom: 50 };
  const nSegments = Math.max(1, data.length - 1);
  const VB_WIDTH = Math.max(700, M.left + M.right + minPxPerPoint * nSegments);
  const VB_HEIGHT = height;
  const W = VB_WIDTH - M.left - M.right;
  const H = VB_HEIGHT - M.top - M.bottom;

  const labels = data.map(d => d.label);
  const values = data.map(d => Number(d.value) || 0);

  const { yMin, yMax, ticks } = useMemo(() => {
    const maxData = values.length ? Math.max(...values) : 0;
    const zoneMax = zones ? Math.max(
      zones.norm || 0,
      zones.green?.[1] || 0,
      zones.yellow?.[1] || 0,
      zones.red?.[1] || 0
    ) : 0;
    const baseMax = Math.max(maxData, zoneMax);
    const withPad = baseMax * 1.15;
    const ceilTo = (n, step) => Math.ceil(n / step) * step;
    const maxY = Math.max(yStep, ceilTo(withPad || yStep, yStep));

    const qty = 5;
    const step = Math.max(yStep, Math.round(maxY / qty / yStep) * yStep);
    const tks = []; for (let v = 0; v <= maxY; v += step) tks.push(v);
    return { yMin: 0, yMax: maxY, ticks: tks };
  }, [JSON.stringify(values), JSON.stringify(zones), yStep]);

  const xAt = (i) => {
    const n = Math.max(1, data.length - 1);
    return M.left + (W * (i / n));
  };
  const yAt = (val) => {
    const t = (val - yMin) / Math.max(1e-6, (yMax - yMin));
    return M.top + (H * (1 - t));
  };

  const linePath = useMemo(() => {
    if (!data.length) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)},${yAt(d.value)}`).join(' ');
  }, [JSON.stringify(values), data.length, W, H, yMin, yMax]);

  const zoneRects = useMemo(() => {
    if (!zones) return [];
    const make = (rng, cls) => {
      if (!rng || rng.length !== 2) return null;
      const [from, to] = rng;
      if (![from, to].every(v => Number.isFinite(v))) return null;
      const y1 = yAt(Math.max(from, yMin));
      const y2 = yAt(Math.min(to, yMax));
      const yTop = Math.min(y1, y2);
      const h = Math.abs(y1 - y2);
      if (h <= 0) return null;
      return { x: M.left, y: yTop, w: W, h, cls };
    };
    return [
      make(zones.red, 'pef-zone-red'),
      make(zones.yellow, 'pef-zone-yellow'),
      make(zones.green, 'pef-zone-green'),
    ].filter(Boolean);
  }, [JSON.stringify(zones), W, H, yMin, yMax]);

  const stepX = Math.max(1, Math.ceil(labels.length / Math.max(1, maxXTicks)));
  const showLabel = (i) => i % stepX === 0 || i === labels.length - 1;

  const placeTooltip = (pointX, pointY, i) => {
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const ttRect = ttRef.current ? ttRef.current.getBoundingClientRect() : { width: 160, height: 60 };
    const pad = 8;

    const leftRaw = (pointX / VB_WIDTH) * wrapRect.width - ttRect.width / 2;
    const leftPx = Math.max(pad, Math.min(wrapRect.width - ttRect.width - pad, leftRaw));

    const topRaw = (pointY / VB_HEIGHT) * wrapRect.height - ttRect.height - 10;
    const topPx = Math.max(pad, topRaw);

    setHover({ i, x: pointX, y: pointY, leftPx, topPx });
  };

  const handleHover = (clientX, rect) => {
    if (!data.length) return;
    const cursorX = clientX - rect.left;
    let bestI = 0, bestDist = Infinity;
    for (let i = 0; i < data.length; i++) {
      const xScreen = (xAt(i) / VB_WIDTH) * rect.width;
      const dx = Math.abs(cursorX - xScreen);
      if (dx < bestDist) { bestDist = dx; bestI = i; }
    }
    const px = xAt(bestI), py = yAt(data[bestI].value);
    placeTooltip(px, py, bestI);
  };

  const onMouseMove = (e) => {
    if (!svgRef.current) return;
    handleHover(e.clientX, svgRef.current.getBoundingClientRect());
  };
  const onTouchMove = (e) => {
    if (!svgRef.current || !e.touches?.length) return;
    handleHover(e.touches[0].clientX, svgRef.current.getBoundingClientRect());
  };
  const onLeave = () => setHover({ i: null, x: 0, y: 0, leftPx: 0, topPx: 0 });

  return (
    <div className="chart-scroll-x">
      <div className="chart-inner" style={{ width: `${VB_WIDTH}px` }}>
        <div className="pef-wrap" ref={wrapRef}>
          <svg
            ref={svgRef}
            className="pef-svg"
            viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
            width={VB_WIDTH}
            height={VB_HEIGHT}
            role="img"
            aria-label="График пикфлоуметрии"
            onMouseMove={onMouseMove}
            onMouseLeave={onLeave}
            onTouchStart={onTouchMove}
            onTouchMove={onTouchMove}
          >
            {/* сетка */}
            <g className="grid">
              {ticks.map((t, idx) => <line key={idx} x1={M.left} x2={M.left+W} y1={yAt(t)} y2={yAt(t)} />)}
            </g>

            {/* зоны */}
            {zoneRects.map((r, i) => (
              <g key={i} className={r.cls}><rect x={r.x} y={r.y} width={r.w} height={r.h} rx="2" ry="2" /></g>
            ))}

            {/* оси */}
            <g className="axis-y">
              <line x1={M.left} x2={M.left} y1={M.top} y2={M.top+H} />
              {ticks.map((t, idx) => (
                <g key={idx} transform={`translate(${M.left-8}, ${yAt(t)})`}>
                  <text textAnchor="end" dominantBaseline="middle">{t}</text>
                </g>
              ))}
            </g>
            <g className="axis-x">
              <line x1={M.left} x2={M.left+W} y1={M.top+H} y2={M.top+H} />
              {labels.map((l, i) => showLabel(i) && (
                <g key={i} transform={`translate(${xAt(i)}, ${M.top+H+16})`}>
                  <text textAnchor="middle">{l}</text>
                </g>
              ))}
            </g>

            {/* линия нормы */}
            {zones?.norm != null && Number.isFinite(zones.norm) && (
              <g className="pef-norm-line">
                <line x1={M.left} x2={M.left+W} y1={yAt(zones.norm)} y2={yAt(zones.norm)} />
                <text x={M.left+W} y={yAt(zones.norm)-6} textAnchor="end">Норма</text>
              </g>
            )}

            {/* линия ПЭФ */}
            {linePath && <g className="pef-line"><path d={linePath}/></g>}

            {/* точки */}
            <g className="points">
              {data.map((d, i) => (
                <circle key={i} cx={xAt(i)} cy={yAt(d.value)} r={4} className={i===hover.i ? 'pt active' : 'pt'} />
              ))}
            </g>
          </svg>

          {/* тултип */}
          {hover.i != null && (
            <div
              ref={ttRef}
              className="pef-tooltip"
              style={{ left: `${hover.leftPx}px`, top: `${hover.topPx}px` }}
            >
              <div className="tt-date">{data[hover.i].labelFull ?? data[hover.i].label}</div>
              <div className="tt-val">ПЭФ: {data[hover.i].value} л/мин</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
