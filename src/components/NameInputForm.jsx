import { useState } from 'react'
import { WHEEL_PRIZES } from './constants/prizes'
import { verifyPrize } from './utils/api'
import LogoHeader from './components/LogoHeader'
import NameInputForm from './components/NameInputForm'
import WheelComponent from './components/WheelComponent'
import PrizeResult from './components/PrizeResult'

const NOT_FOUND_MESSAGE =
  "We couldn't find your name in our purchase records. Place an order with us today to join our next draw!"
const ALREADY_SPUN_MESSAGE =
  'You have already spun the wheel for this order! Thank you for participating.'
const CONFIG_ERROR_MESSAGE = 'Raffle configuration is missing. Please contact support.'

export default function App() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [wonData, setWonData] = useState(null)
  const [cooldownUntil, setCooldownUntil] = useState(0)

  const apiUrl = import.meta.env.VITE_APPS_SCRIPT_URL?.trim() || ''

  const sanitizeName = (rawValue) => {
    const cleaned = rawValue
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/[^a-zA-Z0-9\s\-']/g, '')
      .slice(0, 50)

    return cleaned
  }

  const handleNameChange = (nextValue) => {
    const sanitized = sanitizeName(nextValue)
    setName(sanitized)

    if (status !== 'idle') {
      setStatus('idle')
    }

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const startWheelSpin = (data) => {
    setIsSpinning(true)

    let prizeIndex = WHEEL_PRIZES.findIndex(
      (prize) => prize.name.toLowerCase() === (data.prize || '').toLowerCase(),
    )

    if (prizeIndex === -1) {
      prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length)
    }

    const segmentAngle = 360 / WHEEL_PRIZES.length
    const segmentCenter = prizeIndex * segmentAngle + segmentAngle / 2
    const targetRotation = rotation + 360 * 5 + (360 - segmentCenter)

    setRotation(targetRotation)

    window.setTimeout(() => {
      setIsSpinning(false)
      setWonData(data)
      setStatus('won')
      setCooldownUntil(0)
    }, 4200)
  }

  const handleVerifyAndSpin = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      setStatus('not_found')
      setErrorMessage('Please enter a valid name between 2 and 50 characters.')
      return
    }

    if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmedName)) {
      setStatus('not_found')
      setErrorMessage('Name contains unsupported characters. Please use letters, numbers, spaces, hyphens, or apostrophes only.')
      return
    }

    const now = Date.now()
    if (loading || isSpinning || now < cooldownUntil) {
      return
    }

    if (!apiUrl) {
      setStatus('not_found')
      setErrorMessage(CONFIG_ERROR_MESSAGE)
      return
    }

    setLoading(true)
    setStatus('idle')
    setErrorMessage('')
    setCooldownUntil(now + 3000)

    try {
      const data = await verifyPrize(apiUrl, trimmedName)
      setLoading(false)

      if (data.status === 'success') {
        startWheelSpin(data)
      } else if (data.status === 'already_spun') {
        setStatus('already_spun')
        setErrorMessage(ALREADY_SPUN_MESSAGE)
      } else {
        setStatus('not_found')
        setErrorMessage(NOT_FOUND_MESSAGE)
      }
    } catch (error) {
      setLoading(false)
      setStatus('not_found')
      setErrorMessage(NOT_FOUND_MESSAGE)
    }
  }

  const resetForm = () => {
    setName('')
    setStatus('idle')
    setWonData(null)
    setErrorMessage('')
    setCooldownUntil(0)
  }

  return (
    <div className="app-shell">
      <div className="raffle-card">
        <LogoHeader />

        {status === 'won' && wonData ? (
          <PrizeResult prize={wonData.prize} name={wonData.name || name} onReset={resetForm} />
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
              cooldownActive={Date.now() < cooldownUntil}
              onNameChange={handleNameChange}
              onSubmit={handleVerifyAndSpin}
            />
          </>
        )}
      </div>
    </div>
  )
}
