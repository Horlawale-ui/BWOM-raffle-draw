export interface Prize {
  id: number;
  name: string;
  shortLabel: string;
  image: string;
  color: string;
  textColor: string;
}

export const WHEEL_PRIZES: Prize[] = [
  { id: 1, name: 'Wireless mouse', shortLabel: 'Wireless Mouse', image: '/prizes/mouse.svg', color: '#1E293B', textColor: '#FFFFFF' },
  { id: 2, name: '5k discount voucher', shortLabel: '5k Voucher', image: '/prizes/voucher5k.svg', color: '#064E3B', textColor: '#34D399' },
  { id: 3, name: '10k discount voucher', shortLabel: '10k Voucher', image: '/prizes/voucher10k.svg', color: '#78350F', textColor: '#FBBF24' },
  { id: 4, name: 'Laptop stand', shortLabel: 'Laptop Stand', image: '/prizes/laptopstand.svg', color: '#334155', textColor: '#FFFFFF' },
  { id: 5, name: 'Free stickers', shortLabel: 'Free Stickers', image: '/prizes/stickers.svg', color: '#581C87', textColor: '#F472B6' },
  { id: 6, name: 'Pouch', shortLabel: 'Pouch', image: '/prizes/pouch.svg', color: '#047857', textColor: '#A7F3D0' },
  { id: 7, name: 'Try again', shortLabel: 'Try Again', image: '/prizes/tryagain.svg', color: '#7F1D1D', textColor: '#FECACA' },
  { id: 8, name: 'iPhone 17 Pro Max', shortLabel: 'iPhone 17 Pro', image: '/prizes/iphone.svg', color: '#000000', textColor: '#FACC15' },
];

export default WHEEL_PRIZES;
