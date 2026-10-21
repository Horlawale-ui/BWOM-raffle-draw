export default function NameInputForm({
  name,
  loading,
  isSpinning,
  cooldownActive,
  onNameChange,
  onSubmit,
}) {
  const isDisabled = loading || isSpinning || cooldownActive || !name.trim()

  return (
    <form className="raffle-form" onSubmit={onSubmit} noValidate>
      <label className="sr-only" htmlFor="customer-name">
        Enter your full name
      </label>
      <input
        id="customer-name"
        type="text"
        inputMode="text"
        autoComplete="name"
        required
        minLength={2}
        maxLength={50}
        value={name}
        disabled={loading || isSpinning || cooldownActive}
        placeholder="Enter your full name"
        aria-invalid={name.trim().length > 0 && !/^[a-zA-Z0-9\s\-']+$/.test(name.trim())}
        onChange={(event) => {
          if (onNameChange) {
            onNameChange(event.target.value)
          }
        }}
        className="name-input"
      />

      <button type="submit" className="primary-button" disabled={isDisabled}>
        {loading ? 'Verifying...' : isSpinning ? 'Spinning...' : cooldownActive ? 'Please wait...' : 'Spin Wheel'}
      </button>
    </form>
  )
}

