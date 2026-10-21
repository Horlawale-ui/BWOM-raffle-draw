import { useEffect, useState } from 'react'
import { WHEEL_PRIZES } from './constants/prizes'
import { verifyPrize } from './utils/api'
import LogoHeader from './components/LogoHeader'
import NameInputForm from './components/NameInputForm'
import WheelComponent from './components/WheelComponent'
import PrizeResult from './components/PrizeResult'
import SettingsModal from './components/SettingsModal'

const NOT_FOUND_MESSAGE =
  "We couldn't find your name in our purchase records. Place an order with us today to join our next draw!"
const ALREADY_SPUN_MESSAGE =
  'You have already spun the wheel for this order! Thank you for participating.'

export default function App() {
  const [name, setName] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [wonData, setWonData] = useState(null)

  useEffect(() => {
    const savedUrl = localStorage.getItem('raffle_api_url')
    if (savedUrl) {
      setApiUrl(savedUrl)
    }
  }, [])

  const handleSaveSettings = (event) => {
    event.preventDefault()
    const trimmed = apiUrl.trim()
    localStorage.setItem('raffle_api_url', trimmed)
    setApiUrl(trimmed)
    setShowSettings(false)
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
    }, 4200)
  }

  const handleVerifyAndSpin = async (event) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    if (!apiUrl) {
      setShowSettings(true)
      return
    }

    setLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const data = await verifyPrize(apiUrl, name)
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
  }

  return (
    <div className="app-shell">
      <div className="raffle-card">
        <LogoHeader onSettingsClick={() => setShowSettings((current) => !current)} />

        {status === 'won' && wonData ? (
          <PrizeResult prize={wonData.prize} name={wonData.name || name} onReset={resetForm} />
        ) : (
          <>
            <WheelComponent rotation={rotation} prizes={WHEEL_PRIZES} isSpinning={isSpinning} />

            {status === 'not_found' && (
              <div className="message-box warning-box">
                <span aria-hidden="true">⚠</span>
                <p>{errorMessage}</p>
              </div>
            )}

            {status === 'already_spun' && (
              <div className="message-box success-box">
                <span aria-hidden="true">✓</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <NameInputForm
              name={name}
              setName={setName}
              loading={loading}
              isSpinning={isSpinning}
              status={status}
              onSubmit={handleVerifyAndSpin}
            />
          </>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          apiUrl={apiUrl}
          setApiUrl={setApiUrl}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  )
}
