interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export default function WhatsAppButton({
  phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '',
  defaultMessage = 'Hello BWOM, I am playing the raffle draw!',
}: WhatsAppButtonProps) {
  // Clean phone number (strip spaces, symbols, plus sign for wa.me link)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(defaultMessage);
  
  // If no phone number is provided yet, opens standard web/app WhatsApp share
  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <span className="whatsapp-ping" />
      <svg
        viewBox="0 0 32 32"
        className="whatsapp-icon"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A14 14 0 1 0 16 2zm0 25.5a11.5 11.5 0 0 1-5.9-1.6l-.4-.3-4.3 1.1 1.2-4.2-.3-.4A11.5 11.5 0 1 1 16 27.5zm6.3-8.6c-.3-.2-2-.1-2.3-1.1s-.4-1-.6-1-.4 0-.6 0-.6.1-.9.4-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.5 2.4 3.7 5.8 5.1c.8.3 1.4.5 1.9.7.8.2 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6s-.4-.2-.7-.4z" />
      </svg>
      <span className="whatsapp-tooltip">Chat with us</span>
    </a>
  );
}
