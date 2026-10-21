export default function SettingsModal({ apiUrl, setApiUrl, onClose, onSave }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="settings-modal">
        <h3>Configure Backend API</h3>

        <form onSubmit={onSave} className="settings-form">
          <label htmlFor="api-url">Google Apps Script Web App URL</label>
          <input
            id="api-url"
            type="url"
            required
            placeholder="https://script.google.com/macros/s/.../exec"
            value={apiUrl}
            onChange={(event) => setApiUrl(event.target.value)}
          />

          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button small-button">
              Save URL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
