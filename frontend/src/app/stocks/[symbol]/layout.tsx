import React from 'react';

export function generateStaticParams() {
  return [
    { symbol: 'FDX' },
    { symbol: 'DAL' },
    { symbol: 'AAL' },
    { symbol: 'XLE' },
    { symbol: 'JBHT' },
    { symbol: 'CORN' },
    { symbol: 'SOYB' },
    { symbol: 'UNG' },
    { symbol: 'XLU' }
  ];
}

export default function StockLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
