import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { WHEEL_PRIZES, type Prize } from './constants/prizes';
import { verifyPrize, type PrizeApiResponse } from './utils/api';
import LogoHeader from './components/LogoHeader';
import NameInputForm from './components/NameInputForm';
import WheelComponent from './components/WheelComponent';
import PrizeResult from './components/PrizeResult';
import WhatsAppButton from './components/WhatsAppButton';

const ALLOWED_NAME_PATTERN = /^[a-zA-Z0-9\s'.-]+$/;
const NOT_FOUND_MESSAGE =
  "We couldn't find your name in our purchase records. Place an order with us today to join our next draw!";
const ALREADY_SPUN_MESSAGE =
  'You have already participated in this raffle draw. Thank you for your support!';
const CONFIG_ERROR_MESSAGE =
  'Raffle configuration is missing. Please set the VITE_APPS_SCRIPT_URL environment variable.';

type AppStatus = 'idle' | 'not_found' | 'already_spun' | 'won';

export default function App() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonData, setWonData] = useState<PrizeApiResponse | null>(null);
  const [submitLocked, setSubmitLocked] = useState(false);

  // Automatically dismiss error messages and warning status after 10 seconds
  useEffect(() => {
    if (!errorMessage && status !== 'not_found' && status !== 'already_spun') {
      return;
    }

    const timer = window.setTimeout(() => {
      setErrorMessage('');
      if (status === 'not_found' || status === 'already_spun') {
        setStatus('idle');
      }
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [errorMessage, status]);

  const apiUrl = useMemo(() => import.meta.env.VITE_APPS_SCRIPT_URL?.trim() ?? '', []);

  const sanitizeName = (value: string): string => {
    return value
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/[^a-zA-Z0-9\s'.-]/g, '')
      .slice(0, 50);
  };

  const handleNameChange = (nextValue: string) => {
    const sanitized = sanitizeName(nextValue);
    setName(sanitized);

    if (status !== 'idle') {
      setStatus('idle');
    }

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const startWheelSpin = (data: PrizeApiResponse) => {
    setIsSpinning(true);

    let prizeIndex = WHEEL_PRIZES.findIndex(
      (prize: Prize) => prize.name.toLowerCase() === (data.prize || '').toLowerCase(),
    );

    if (prizeIndex === -1) {
      prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    }

    const segmentAngle = 360 / WHEEL_PRIZES.length;
    const segmentCenter = prizeIndex * segmentAngle + segmentAngle / 2;
    const targetRotation = rotation + 360 * 5 + (360 - segmentCenter);

    setRotation(targetRotation);

    window.setTimeout(() => {
      setIsSpinning(false);
      setWonData(data);
      setStatus('won');
      setSubmitLocked(false);
    }, 4200);
  };

  const handleVerifyAndSpin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      setStatus('not_found');
      setErrorMessage('Please enter a valid name between 2 and 50 characters.');
      return;
    }

    if (!ALLOWED_NAME_PATTERN.test(trimmedName)) {
      setStatus('not_found');
      setErrorMessage(
        'Name contains unsupported characters. Please use letters, numbers, spaces, hyphens, or apostrophes only.',
      );
      return;
    }

    if (loading || isSpinning || submitLocked) {
      return;
    }

    if (!apiUrl) {
      setStatus('not_found');
      setErrorMessage(CONFIG_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');
    setSubmitLocked(true);

    try {
      const data = await verifyPrize(apiUrl, trimmedName);
      setLoading(false);

      if (data.status === 'success') {
        startWheelSpin(data);
      } else if (data.status === 'already_spun') {
        // If not delivered yet, show the prize they won!
        if (!data.delivered && data.prize) {
          setWonData(data);
          setStatus('won');
        } else {
          // If already delivered, show already participated message
          setStatus('already_spun');
          setErrorMessage(ALREADY_SPUN_MESSAGE);
        }
      } else {
        setStatus('not_found');
        setErrorMessage(NOT_FOUND_MESSAGE);
      }
    } catch (error) {
      setLoading(false);
      setStatus('not_found');
      setErrorMessage(NOT_FOUND_MESSAGE);
    } finally {
      window.setTimeout(() => {
        setSubmitLocked(false);
      }, 3000);
    }
  };

  const resetForm = () => {
    setName('');
    setStatus('idle');
    setWonData(null);
    setErrorMessage('');
    setSubmitLocked(false);
  };

  return (
    <div className="app-shell">
      <div className="raffle-card">
        <LogoHeader />

        {status === 'won' && wonData ? (
          <PrizeResult prize={wonData.prize || '10% OFF Voucher'} name={wonData.name || name} onReset={resetForm} />
        ) : (
          <>
            <WheelComponent rotation={rotation} prizes={WHEEL_PRIZES} isSpinning={isSpinning} />

            {status === 'not_found' && (
              <div className="message-box warning-box" role="alert">
                <span aria-hidden="true">⚠</span>
                <p>{errorMessage}</p>
              </div>
            )}

            {status === 'already_spun' && (
              <div className="message-box success-box" role="status">
                <span aria-hidden="true">✓</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <NameInputForm
              name={name}
              loading={loading}
              isSpinning={isSpinning}
              submitLocked={submitLocked}
              onNameChange={handleNameChange}
              onSubmit={handleVerifyAndSpin}
            />
          </>
        )}
      </div>

      {/* Floating WhatsApp Quick Contact Popup */}
      <WhatsAppButton />
    </div>
  );
}
