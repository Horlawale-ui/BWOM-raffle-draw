export default function LogoHeader({ onSettingsClick }) {
  return (
    <div className="brand-header">
      <button
        type="button"
        className="settings-button"
        onClick={onSettingsClick}
        aria-label="Open raffle settings"
      >
        ⚙
      </button>

      <div className="brand-mark" aria-label="Company logo">
        BWOM
      </div>
      <h1 className="brand-title">Customer Raffle Draw</h1>
    </div>
  )
}
