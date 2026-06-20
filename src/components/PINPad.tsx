import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Delete, X, Lock } from 'lucide-react';

interface PINPadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  titleAr?: string;
  titleEn?: string;
  amount: number;
}

export default function PINPad({ isOpen, onClose, onSuccess, titleAr, titleEn, amount }: PINPadProps) {
  const [pin, setPin] = useState<string>('');
  const [shuffleKeys, setShuffleKeys] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Shuffle the numeric keypad whenever open for security simulation
  useEffect(() => {
    if (isOpen) {
      const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      const shuffled = [...keys].sort(() => Math.random() - 0.5);
      setShuffleKeys(shuffled);
      setPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: number) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    if (pin.length === 6) {
      // Any 6-digit PIN works for simulation, but check if correct pin
      // We can mock that 123456 or any 6 digit pin is authorized
      onSuccess();
    } else {
      setErrorMsg('برجاء إدخال الرقم السري المكون من 6 أرقام');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 text-white shadow-2xl"
      >
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <div className="px-6 pt-8 pb-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/15 text-pink-500">
            <Shield size={24} className="animate-pulse" />
          </div>
          
          <h3 className="mt-3 text-lg font-bold text-slate-100">
            {titleAr || 'الرقم السري للشبكة (IPN PIN)'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {titleEn || 'Enter Your Registered 6-Digit IPN PIN'}
          </p>

          <div className="mt-4 inline-block px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-sm">
            <span className="text-slate-400">القيمة: </span>
            <span className="font-mono text-pink-400 font-bold">{amount.toLocaleString('en-EG', { minimumFractionDigits: 2 })} ج.م</span>
          </div>

          {/* Masked PIN Input */}
          <div className="mt-6 flex justify-center gap-3">
            {[...Array(6)].map((_, idx) => {
              const isFilled = pin.length > idx;
              return (
                <div 
                  key={idx}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-all duration-150 ${
                    isFilled 
                      ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_12px_rgba(236,72,153,0.3)]' 
                      : 'border-slate-700 bg-slate-800/40'
                  }`}
                >
                  {isFilled && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-3 w-3 rounded-full bg-pink-500" 
                    />
                  )}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <p className="mt-2 text-xs text-red-400 text-center font-medium animate-pulse">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Secure Keypad */}
        <div className="bg-slate-950/80 p-5 border-t border-slate-800/60 rounded-b-3xl">
          <div className="grid grid-cols-3 gap-3">
            {shuffleKeys.map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="flex items-center justify-center h-14 rounded-2xl bg-slate-800/60 border border-slate-800/20 text-xl font-semibold text-slate-100 hover:bg-slate-700 active:scale-95 transition-all text-center"
              >
                {num}
              </button>
            ))}
            
            {/* Action buttons */}
            <button
              onClick={handleDelete}
              className="flex items-center justify-center h-14 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/40 active:scale-95 transition-all"
              title="مسح"
            >
              <Delete size={20} />
            </button>
            
            <button
              onClick={() => handleKeyPress(0)}
              className="hidden" // Handled, just placeholder to match grid if shuffling already sorted
            >
              0
            </button>

            <button
              onClick={handleConfirm}
              className="col-span-1 flex items-center justify-center h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold active:scale-95 transition-all text-sm gap-1"
            >
              <span>تأكيد</span>
            </button>
          </div>

          {/* Secure disclaimer */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center">
            <Lock size={12} className="text-pink-500" />
            <span>بإشراف البنك المركزي المصري - معاملة آمنة ومفرومة</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
