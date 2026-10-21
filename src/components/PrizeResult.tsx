interface PrizeResultProps {
  prize: string;
  name: string;
  onReset: () => void;
}

export default function PrizeResult({ prize, name, onReset }: PrizeResultProps) {
  return (
    <div className="result-panel">
      <div className="result-badge">🎉</div>
      <p className="eyebrow">Congratulations!</p>
      <h2>{prize}</h2>

      <div className="result-box">
        Please contact us with your name (<strong>{name}</strong>) to claim your prize.
      </div>

      <button type="button" className="primary-button" onClick={onReset}>
        Done
      </button>
    </div>
  );
}
