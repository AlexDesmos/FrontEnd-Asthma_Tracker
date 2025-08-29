import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../css/CustomAttacksChart.css';

export default function CustomAttacksChart({
  data = [],
  height = 250,
  minPxPerPoint = 42,
  maxXTicks = 8
}) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const ttRef = useRef(null);

  const [hover, setHover] = useState({ i: null, x: 0, y: 0, leftPx: 0, topPx: 0 });

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [wrapW, setWrapW] = useState(0);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setWrapW(r.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const M = { left: 48, right: 20, top: 18, bottom: 34 };
  const nSegments = Math.max(1, data.length - 1);
  const VB_WIDTH_BASE = M.left + M.right + minPxPerPoint * nSegments;

  const VB_WIDTH = isMobile
    ? Math.max(320, wrapW || 320)
    : Math.max(700, VB_WIDTH_BASE);

  const VB_HEIGHT = height;
  const W = VB_WIDTH - M.left - M.right;
  const H = VB_HEIGHT - M.top - M.bottom;

  const labels = data.map(d => d.label);
  const yMin = 1, yMax = 5;
  const ticks = [1, 2, 3, 4, 5];

  const xAt = (i) => {
    const n = Math.max(1, data.length - 1);
    return M.left + (W * (i / n));
  };
  const yAt = (v) => {
    const t = (v - yMin) / (yMax - yMin);
    return M.top + (H * (1 - t));
  };

  const linePath = useMemo(() => {
    if (!data.length) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)},${yAt(d.value)}`).join(' ');
  }, [data, W, H]);

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
        <div className="attacks-wrap" ref={wrapRef}>
          <svg
            ref={svgRef}
            className="attacks-svg"
            viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
            width={VB_WIDTH}
            height={VB_HEIGHT}
            role="img"
            aria-label="График приступов"
            onMouseMove={onMouseMove}
            onMouseLeave={onLeave}
            onTouchStart={onTouchMove}
            onTouchMove={onTouchMove}
          >
            <g className="grid">
              {ticks.map((t, idx) => <line key={idx} x1={M.left} x2={M.left+W} y1={yAt(t)} y2={yAt(t)} />)}
            </g>

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

            {linePath && (
              <g className="attacks-line">
                <path d={linePath} fill="none" />
              </g>
            )}

            <g className="points">
              {data.map((d, i) => (
                <circle key={i} cx={xAt(i)} cy={yAt(d.value)} r={4} className={i===hover.i ? 'pt active' : 'pt'} />
              ))}
            </g>
          </svg>

          {hover.i != null && (
            <div
              ref={ttRef}
              className="attacks-tooltip"
              style={{ left: `${hover.leftPx}px`, top: `${hover.topPx}px` }}
            >
              <div className="tt-date">{data[hover.i].labelFull ?? data[hover.i].label}</div>
              <div className="tt-val">Шкала: {data[hover.i].value}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
