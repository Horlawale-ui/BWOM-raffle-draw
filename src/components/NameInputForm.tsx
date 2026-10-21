import type { FormEvent } from 'react';

interface NameInputFormProps {
  name: string;
  loading: boolean;
  isSpinning: boolean;
  submitLocked: boolean;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function NameInputForm({
  name,
  loading,
  isSpinning,
  submitLocked,
  onNameChange,
  onSubmit,
}: NameInputFormProps) {
  const isDisabled = loading || isSpinning || submitLocked || !name.trim();

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
        pattern="^[a-zA-Z0-9\\s\\-']+$"
        value={name}
        disabled={loading || isSpinning || submitLocked}
        placeholder="Enter your full name"
        aria-invalid={name.trim().length > 0 && !/^[a-zA-Z0-9\s\-']+$/.test(name.trim())}
        onChange={(event) => {
          onNameChange(event.target.value);
        }}
        className="name-input"
      />

      <button type="submit" className="primary-button" disabled={isDisabled}>
        {loading ? 'Verifying...' : isSpinning ? 'Spinning...' : submitLocked ? 'Please wait...' : 'Spin Wheel'}
      </button>
    </form>
  );
}
