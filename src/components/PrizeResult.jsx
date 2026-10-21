export default function PrizeResult({ prize, name, onReset }) {
  return (
    <div className="result-panel">
      <div className="result-badge">🎉</div>
      <p className="eyebrow">Congratulations!</p>
      <h2>{prize || '10% OFF Voucher'}</h2>

      <div className="result-box">
        Please contact us with your name (<strong>{name}</strong>) to claim your prize.
      </div>

      <button type="button" className="primary-button" onClick={onReset}>
        Done
      </button>
    </div>
  )
}
