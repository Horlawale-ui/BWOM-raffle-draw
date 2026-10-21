export default function NameInputForm({
  name,
  setName,
  loading,
  isSpinning,
  status,
  onSubmit,
}) {
  return (
    <form className="raffle-form" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="customer-name">
        Enter your full name
      </label>
      <input
        id="customer-name"
        type="text"
        required
        value={name}
        disabled={loading || isSpinning}
        placeholder="Enter your full name"
        onChange={(event) => {
          setName(event.target.value)
          if (status !== 'idle') {
            status = 'idle'
          }
        }}
        className="name-input"
      />

      <button type="submit" className="primary-button" disabled={loading || isSpinning || !name.trim()}>
        {loading ? 'Verifying...' : isSpinning ? 'Spinning...' : 'Spin Wheel'}
      </button>
    </form>
  )
}
