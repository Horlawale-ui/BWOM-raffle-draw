import type { Prize } from '../constants/prizes';

interface WheelComponentProps {
  rotation: number;
  prizes: Prize[];
  isSpinning: boolean;
}

export default function WheelComponent({ rotation, prizes, isSpinning }: WheelComponentProps) {
  return (
    <div className="wheel-stage" aria-label="Prize wheel">
      <div className="wheel-pointer" aria-hidden="true" />

      <div className="wheel-shell">
        <div
          className={`wheel-rotator ${isSpinning ? 'spinning' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 100 100" className="wheel-svg" aria-hidden="true">
            {prizes.map((prize, index) => {
              const total = prizes.length;
              const angle = 360 / total;
              const start = index * angle;
              const end = (index + 1) * angle;

              const x1 = 50 + 50 * Math.cos((Math.PI * start) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * start) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * end) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * end) / 180);

              const textAngle = start + angle / 2;
              const textX = 50 + 30 * Math.cos((Math.PI * textAngle) / 180);
              const textY = 50 + 30 * Math.sin((Math.PI * textAngle) / 180);

              return (
                <g key={prize.id}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="#f5f5f5"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill={prize.textColor}
                    fontSize="2.8"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                    className="wheel-text"
                  >
                    {prize.name.length > 12 ? `${prize.name.slice(0, 10)}..` : prize.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="wheel-center">
          <div className="wheel-center-dot" />
        </div>
      </div>
    </div>
  );
}
