import { useEffect, useState } from 'react';
import { CURRENCY_SYMBOLS } from '../../utils/constants';

interface FloatingCurrency {
  id: number;
  symbol: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export const BackgroundAnimation = () => {
  const [currencies, setCurrencies] = useState<FloatingCurrency[]>([]);

  useEffect(() => {
    // Generate random floating currencies
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      symbol: CURRENCY_SYMBOLS[Math.floor(Math.random() * CURRENCY_SYMBOLS.length)],
      x: Math.random() * 100,
      size: 20 + Math.random() * 40,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
    }));
    setCurrencies(generated);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Bank Building Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 via-background-dark to-background-dark" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-bank-pattern opacity-30" />
      
      {/* Floating Currency Symbols */}
      {currencies.map((currency) => (
        <div
          key={currency.id}
          className="absolute text-primary-gold/20 font-bold animate-float"
          style={{
            left: `${currency.x}%`,
            fontSize: `${currency.size}px`,
            bottom: '-50px',
            animation: `float-up ${currency.duration}s linear infinite`,
            animationDelay: `${currency.delay}s`,
          }}
        >
          {currency.symbol}
        </div>
      ))}
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-blue/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-gold/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
