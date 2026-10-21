import { WHEEL_PRIZES } from '../constants/prizes';

interface PrizeResultProps {
  prize: string;
  name: string;
  onReset: () => void;
}

export default function PrizeResult({ prize, name, onReset }: PrizeResultProps) {
  const isTryAgain = prize.toLowerCase().includes('try again');
  const matchedPrize = WHEEL_PRIZES.find(
    (p) => p.name.toLowerCase() === prize.toLowerCase() || p.shortLabel.toLowerCase() === prize.toLowerCase()
  );
  const prizeImage = matchedPrize?.image;

  return (
    <div className="result-panel">
      <div className="result-badge">
        {prizeImage ? (
          <img src={prizeImage} alt={prize} className="w-12 h-12 object-contain" />
        ) : (
          isTryAgain ? '🔄' : '🎉'
        )}
      </div>
      <p className="eyebrow">{isTryAgain ? 'Keep going!' : 'Congratulations!'}</p>
      <h2>{prize}</h2>

      <div className="result-box">
        {isTryAgain ? (
          <>Thank you for participating, <strong>{name}</strong>! Watch out for our future customer giveaways.</>
        ) : (
          <>Please contact us with your name (<strong>{name}</strong>) to claim your prize.</>
        )}
      </div>

      {!isTryAgain && (
        <a
          href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `Hello BWOM! My name is ${name} and I just won "${prize}" in the customer raffle draw!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
          style={{ background: '#25d366', color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <span>Claim Prize on WhatsApp</span>
        </a>
      )}

      <button type="button" className="primary-button" style={!isTryAgain ? { background: '#f5f5f5', color: '#171717', border: '1px solid #e5e5e5' } : undefined} onClick={onReset}>
        Done
      </button>
    </div>
  );
}
