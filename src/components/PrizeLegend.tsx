import type { Prize } from '../constants/prizes';

interface PrizeLegendProps {
  prizes: Prize[];
}

export default function PrizeLegend({ prizes }: PrizeLegendProps) {
  return (
    <div className="prize-legend-container" aria-label="Prize identification guide">
      <div className="prize-legend-header">
        <span className="prize-legend-title">PRIZE GUIDE</span>
      </div>
      <div className="prize-legend-list">
        {prizes.map((prize) => (
          <div key={prize.id} className="prize-legend-item">
            <div className="prize-legend-badge" style={{ backgroundColor: prize.color }}>
              <img
                src={prize.image}
                alt={prize.name}
                className="prize-legend-img"
                loading="lazy"
              />
            </div>
            <div className="prize-legend-details">
              <span className="prize-legend-name">{prize.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
