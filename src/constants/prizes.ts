export interface Prize {
  id: number;
  name: string;
  color: string;
  textColor: string;
}

export const WHEEL_PRIZES: Prize[] = [
  { id: 1, name: '10% OFF Voucher', color: '#18181B', textColor: '#FFFFFF' },
  { id: 2, name: 'Free Merchandise', color: '#27272A', textColor: '#FFFFFF' },
  { id: 3, name: '$20 Store Credit', color: '#3F3F46', textColor: '#FFFFFF' },
  { id: 4, name: 'Free Shipping', color: '#52525B', textColor: '#FFFFFF' },
  { id: 5, name: 'Mystery Prize', color: '#18181B', textColor: '#FFFFFF' },
  { id: 6, name: '25% OFF Voucher', color: '#27272A', textColor: '#FFFFFF' },
  { id: 7, name: 'Special Gift Box', color: '#3F3F46', textColor: '#FFFFFF' },
  { id: 8, name: 'Better Luck Next Time', color: '#71717A', textColor: '#FFFFFF' },
];

export default WHEEL_PRIZES;
