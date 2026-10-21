import type { Prize } from '../constants/prizes';

interface WheelComponentProps {
  rotation: number;
  prizes: Prize[];
  isSpinning: boolean;
}

export default function WheelComponent({ rotation, prizes, isSpinning }: WheelComponentProps) {
  const total = prizes.length;
  const angle = 360 / total;

  return (
    <div className="wheel-stage" aria-label="Prize wheel">
      <div className="wheel-pointer" aria-hidden="true" />

      <div className="wheel-shell">
        <div
          className={`wheel-rotator ${isSpinning ? 'spinning' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 200 200" className="wheel-svg" aria-hidden="true">
            <defs>
              <filter id="boldTextShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.95" />
              </filter>
            </defs>

            {prizes.map((prize, index) => {
              const start = index * angle;
              const end = (index + 1) * angle;

              // Arc math on 200x200 viewBox (center: 100, 100, radius: 99)
              const r = 99;
              const x1 = 100 + r * Math.cos((Math.PI * start) / 180);
              const y1 = 100 + r * Math.sin((Math.PI * start) / 180);
              const x2 = 100 + r * Math.cos((Math.PI * end) / 180);
              const y2 = 100 + r * Math.sin((Math.PI * end) / 180);

              const midAngle = start + angle / 2;

              return (
                <g key={prize.id} className="wheel-slice">
                  {/* Slice background */}
                  <path
                    d={`M 100 100 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Intelligently oriented text: always right-side up so it is never upside down */}
                  {(() => {
                    const label = prize.shortLabel || prize.name;
                    const words = label.split(' ');
                    let lines: string[] = [label];
                    if (words.length === 2) {
                      lines = [words[0], words[1]];
                    } else if (words.length === 3) {
                      lines = [`${words[0]} ${words[1]}`, words[2]];
                    }

                    const fontSize = lines.length > 1 ? 11.5 : 12.5;
                    const lineHeight = fontSize * 1.08;

                    // In visual screen space:
                    // SVG is rotated -90deg (270deg)
                    // The slice spoke in screen space is at screenAngle:
                    const screenAngle = ((midAngle - 90) % 360 + 360) % 360;

                    // Physical screen right side is where cos(screenAngle) > 0 (angles 0 to 90 and 270 to 360)
                    // Physical screen left side is where cos(screenAngle) < 0 (angles 90 to 270)
                    const isScreenRightSide = screenAngle < 90 || screenAngle > 270;

                    // On the screen right side, midAngle points towards the right rim.
                    // To have letters upright and readable, we rotate by midAngle and place x near 162.
                    // On the screen left side, we rotate by midAngle + 180 and place x near 38.
                    const textRotation = isScreenRightSide ? midAngle : midAngle + 180;
                    const centerX = isScreenRightSide ? 162 : 38;

                    return (
                      <g transform={`rotate(${textRotation}, 100, 100)`}>
                        <text
                          x={centerX}
                          y="100"
                          fill={prize.textColor}
                          fontSize={fontSize}
                          fontWeight="900"
                          letterSpacing="0.4px"
                          textAnchor="middle"
                          dominantBaseline="central"
                          filter="url(#boldTextShadow)"
                        >
                          {lines.length === 1 ? (
                            lines[0]
                          ) : (
                            lines.map((line, lineIdx) => {
                              const dy = lineIdx === 0 ? -lineHeight / 2 : lineHeight;
                              return (
                                <tspan key={lineIdx} x={centerX} dy={dy} textAnchor="middle">
                                  {line}
                                </tspan>
                              );
                            })
                          )}
                        </text>
                      </g>
                    );
                  })()}
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
