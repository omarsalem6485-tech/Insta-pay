import React from 'react';
import { motion } from 'motion/react';
import { Check, X, Share2, Printer, Copy, AlertCircle, Building2, User, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus } from '../types';

interface TransactionReceiptProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionReceipt({ transaction, isOpen, onClose }: TransactionReceiptProps) {
  if (!isOpen || !transaction) return null;

  const getTxTypeBadgeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.RECEIVED:
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case TransactionType.BILL_PAYMENT:
        return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case TransactionType.MOBILE_RECHARGE:
        return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      default:
        return 'bg-pink-500/15 text-pink-600 border-pink-500/30';
    }
  };

  const getTxTypeLabelAr = (type: TransactionType) => {
    switch (type) {
      case TransactionType.RECEIVED: return 'تحويل وارد';
      case TransactionType.TRANSFER_BANK: return 'تحويل لحساب بنكي';
      case TransactionType.TRANSFER_IPA: return 'تحويل لعنوان دفع';
      case TransactionType.TRANSFER_MOBILE: return 'تحويل لرقم هاتف';
      case TransactionType.TRANSFER_WALLET: return 'تحويل لمحفظة إلكترونية';
      case TransactionType.BILL_PAYMENT: return 'دفع فواتير';
      case TransactionType.MOBILE_RECHARGE: return 'شحن رصيد';
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple visual feedback
    alert('تم نسخ المرجع والعملية بنجاح!');
  };

  const handlePrint = () => {
    window.print();
  };

  const isIncome = transaction.type === TransactionType.RECEIVED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl text-slate-800 border border-slate-100"
      >
        {/* InstaPay Top Branding header */}
        <div className="bg-gradient-to-r from-pink-800 via-pink-700 to-rose-800 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center font-bold text-pink-700 text-sm tracking-wider shadow-inner">
              IP
            </div>
            <div>
              <h4 className="text-xs font-bold font-sans tracking-wide">instaPay</h4>
              <p className="text-[9px] text-pink-200 uppercase tracking-widest leading-none">Instant Payments</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-medium">إيصال رسمي</span>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Status Banner */}
        <div className="p-6 text-center border-b border-dashed border-slate-200 bg-slate-50 relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 mb-3">
            <Check size={32} strokeWidth={3} />
          </div>
          <h3 className="text-lg font-bold text-emerald-600">عملية ناجحة</h3>
          <p className="text-xs text-slate-500 mt-0.5">Transaction Completed Successfully</p>

          <div className="mt-4 text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
            <span>{isIncome ? '+' : '-'}</span>
            <span>{transaction.amount.toLocaleString('en-EG', { minimumFractionDigits: 2 })}</span>
            <span className="text-sm font-bold text-slate-500 mr-1">ج.م</span>
          </div>

          <div className="mt-2 flex items-center justify-center">
            <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${getTxTypeBadgeColor(transaction.type)}`}>
              {getTxTypeLabelAr(transaction.type)}
            </span>
          </div>

          {/* Cut-out receipt style details */}
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-slate-800 focus:outline-none" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-slate-800 focus:outline-none" />
        </div>

        {/* Receipt Core Details */}
        <div className="p-6 space-y-4 text-sm bg-white">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs">الرقم المرجعي للمعاملة:</span>
            <div className="flex items-center gap-1 text-left">
              <span className="font-mono text-xs font-bold text-slate-700">{transaction.referenceId}</span>
              <button 
                onClick={() => handleCopyToClipboard(transaction.referenceId)} 
                className="text-slate-400 hover:text-pink-600 p-0.5" 
                title="نسخ رقم التفويض"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* Sender Details */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center text-slate-400">
              <ArrowUpRight size={16} className="text-rose-500" />
              <span className="text-xs">المرسل (من):</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-xs">{transaction.senderNameAr || 'أماني محمد فؤاد'}</p>
              {transaction.senderNameEn && <p className="text-[10px] text-slate-400">{transaction.senderNameEn}</p>}
            </div>
          </div>

          {/* Receiver Details */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center text-slate-400">
              <ArrowDownLeft size={16} className="text-emerald-500" />
              <span className="text-xs">المستلم (إلى):</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800 text-xs">{transaction.receiverNameAr || transaction.titleAr}</p>
              {transaction.receiverNameEn && <p className="text-[10px] text-slate-400">{transaction.receiverNameEn}</p>}
              {transaction.receiverAccountOrIpa && (
                <p className="font-mono text-[10px] text-pink-600 font-semibold mt-0.5 bg-pink-50/50 px-1.5 py-0.5 rounded border border-pink-100 inline-block text-left">
                  {transaction.receiverAccountOrIpa}
                </p>
              )}
            </div>
          </div>

          {transaction.bankNameAr && (
            <>
              <div className="h-[1px] bg-slate-100" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center text-slate-400">
                  <Building2 size={16} />
                  <span className="text-xs">البنك المستلم:</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700 text-xs">{transaction.bankNameAr}</p>
                </div>
              </div>
            </>
          )}

          <div className="h-[1px] bg-slate-100" />

          {/* Timestamp Details */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">تاريخ ووقت المعاملة:</span>
            <span className="font-mono text-xs text-slate-600">
              {new Date(transaction.date).toLocaleString('ar-EG', {
                timeZone: 'Africa/Cairo',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </span>
          </div>

          {transaction.note && (
            <>
              <div className="h-[1px] bg-slate-100" />
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs">ملاحظة / الغرض:</span>
                <span className="text-slate-600 text-xs font-semibold max-w-[200px] text-left">{transaction.note}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer info & Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          <div className="flex justify-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 active:scale-95 transition"
            >
              <Printer size={15} />
              <span>طباعة الإيصال</span>
            </button>
            <button 
              onClick={() => handleCopyToClipboard(`تفاصيل إيصال انستا باي: عميل أماني محمد فؤاد، المبلغ ${transaction.amount} ج.م، مرجع ${transaction.referenceId}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-pink-600 hover:bg-pink-700 text-xs font-bold rounded-xl text-white shadow-md shadow-pink-500/10 active:scale-95 transition"
            >
              <Share2 size={15} />
              <span>مشاركة الإيصال</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-400">
            <p>شبكة المدفوعات اللحظية المصرية - تطبيق انستا باي المرخص والمنظم</p>
            <p className="mt-0.5">بواسطة شركة بنوك مصر بالتنسيق وبإشراف البنك المركزي المصري</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
