import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ArrowUpRight, ArrowDownLeft, Building2, QrCode, Eye, EyeOff, 
  Smartphone, Plus, Search, Filter, ArrowDown, ArrowUp, CheckCircle2, 
  Wallet, CreditCard, ChevronLeft, ChevronRight, CircleDollarSign, 
  AlertCircle, Calendar, Wifi, Sparkles, Share2, Send, HelpCircle, 
  LogOut, Menu, Languages, X, Check, Landmark, RefreshCw, Layers, FileText
} from 'lucide-react';

import { UserProfile, BankAccount, Transaction, TransactionType, TransactionStatus, Bill } from './types';
import { INITIAL_PROFILE, INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_BILLS } from './data';
import PINPad from './components/PINPad';
import TransactionReceipt from './components/TransactionReceipt';

export default function App() {
  // Application State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  
  // Interactive Simulator Controls
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Phone Emulator Controls
  const [phoneScreen, setPhoneScreen] = useState<'splash' | 'home' | 'send' | 'bills' | 'recharge' | 'accounts' | 'qr'>('splash');
  const [selectedMobileCardIndex, setSelectedMobileCardIndex] = useState<number>(0);
  
  // PinPad State
  const [isPinPadOpen, setIsPinPadOpen] = useState<boolean>(false);
  const [pinPadData, setPinPadData] = useState<{
    amount: number;
    onSuccess: () => void;
    titleAr: string;
    titleEn: string;
  } | null>(null);

  // Send Money Form State
  const [sendType, setSendType] = useState<'ipa' | 'mobile' | 'bank' | 'card'>('ipa');
  const [receiverDestination, setReceiverDestination] = useState<string>('');
  const [receiverNameInput, setReceiverNameInput] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [sendNote, setSendNote] = useState<string>('');
  const [sendSourceAccountId, setSendSourceAccountId] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [sendFormError, setSendFormError] = useState<string>('');

  // Mobile Recharge Form State
  const [rechargeOperator, setRechargeOperator] = useState<'vodafone' | 'orange' | 'etisalat' | 'we'>('vodafone');
  const [rechargePhone, setRechargePhone] = useState<string>('');
  const [rechargeValue, setRechargeValue] = useState<string>('');
  const [rechargeSourceCard, setRechargeSourceCard] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [rechargeError, setRechargeError] = useState<string>('');

  // New Card State (Simulation)
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);
  const [newCardBank, setNewCardBank] = useState<string>('cib');
  const [newCardNumber, setNewCardNumber] = useState<string>('');
  const [newCardBalance, setNewCardBalance] = useState<string>('5000');

  // Trigger Phone Splash Screen delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhoneScreen('home');
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Compute Total Live Balance across all mock bank accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Helper: Get transaction type labels and icons
  const getTxDetails = (type: TransactionType) => {
    switch (type) {
      case TransactionType.RECEIVED:
        return { label: 'وارد', icon: <ArrowDownLeft className="text-emerald-500" />, color: 'text-emerald-500 bg-emerald-500/10' };
      case TransactionType.BILL_PAYMENT:
        return { label: 'فاتورة', icon: <FileText className="text-amber-500" />, color: 'text-amber-500 bg-amber-500/10' };
      case TransactionType.MOBILE_RECHARGE:
        return { label: 'شحن', icon: <Smartphone className="text-blue-500" />, color: 'text-blue-500 bg-blue-500/10' };
      default:
        return { label: 'تحويل', icon: <ArrowUpRight className="text-rose-500" />, color: 'text-rose-500 bg-rose-500/10' };
    }
  };

  // Helper to generate a realistic InstaPay Ref ID
  const generateRefId = () => {
    const dateStr = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 12);
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `IP${dateStr}${randomSuffix}`;
  };

  // Action: Add simulated deposit (faucet tool for simulation convenience)
  const handleSimulateDeposit = (accountId: string, amount: number) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    }));

    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      referenceId: generateRefId(),
      type: TransactionType.RECEIVED,
      titleAr: `رصيد مضاف إلى ${account.bankNameAr}`,
      titleEn: `Deposit Added to ${account.bankNameEn}`,
      subtitleAr: 'إيداع محاكاة مباشر',
      subtitleEn: 'Simulated direct deposit',
      amount: amount,
      date: new Date().toISOString(),
      status: TransactionStatus.SUCCESS,
      senderNameAr: 'منظومة الدفع التجريبية',
      senderNameEn: 'Simulation Faucet Engine',
      receiverNameAr: profile.name,
      receiverNameEn: 'Amany Mohamed Fouad',
      receiverAccountOrIpa: profile.ipa,
      bankNameAr: account.bankNameAr,
      bankNameEn: account.bankNameEn,
      note: 'محاكاة اختبار رصيد الحساب',
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Action: Launch PINPad to confirm send money
  const handleInitiateSendMoney = () => {
    setSendFormError('');
    const amt = parseFloat(sendAmount);
    if (isNaN(amt) || amt <= 0) {
      setSendFormError('برجاء إدخال قيمة تحويل صحيحة');
      return;
    }

    if (!receiverDestination) {
      setSendFormError('برجاء إدخال عنوان الهاتف، الحساب، أو عنوان الدفع المستهدف');
      return;
    }

    // Identify source card & verify sufficiency of funds
    const sourceAcc = accounts.find(a => a.id === sendSourceAccountId);
    if (!sourceAcc || sourceAcc.balance < amt) {
      setSendFormError('رصيد الحساب الحالي غير كافٍ لإجراء هذه المعاملة');
      return;
    }

    // Configure PIN pad sequence
    setPinPadData({
      amount: amt,
      titleAr: 'تأكيد التحويل اللحظي',
      titleEn: 'Confirm Instant Transfer',
      onSuccess: () => {
        // PIN verified, make the transfer
        executeTransfer(amt, sourceAcc);
      }
    });
    setIsPinPadOpen(true);
  };

  // Action: Execute transfer upon valid PIN entry
  const executeTransfer = (amount: number, sourceAcc: BankAccount) => {
    // 1. Deduct from selected source bank account
    setAccounts(prev => prev.map(acc => {
      if (acc.id === sourceAcc.id) {
        return { ...acc, balance: acc.balance - amount };
      }
      return acc;
    }));

    // 2. Map Transfer labels based on type
    let titleAr = '';
    let titleEn = '';
    let subAr = '';
    let subEn = '';
    let txType = TransactionType.TRANSFER_IPA;

    if (sendType === 'ipa') {
      titleAr = `تحويل إلى ${receiverNameInput || receiverDestination}`;
      titleEn = `Transfer to ${receiverNameInput || receiverDestination}`;
      subAr = `عنوان الدفع اللحظي ${receiverDestination}`;
      subEn = `Instant address ${receiverDestination}`;
      txType = TransactionType.TRANSFER_IPA;
    } else if (sendType === 'mobile') {
      titleAr = `تحويل لمحفظة ${receiverDestination}`;
      titleEn = `Wallet transfer to ${receiverDestination}`;
      subAr = `عبر رقم الهاتف المحمول`;
      subEn = `Via Mobile Phone Number`;
      txType = TransactionType.TRANSFER_WALLET;
    } else if (sendType === 'card') {
      titleAr = `تحويل لبطاقة بنكية`;
      titleEn = `Transfer to Debit Card`;
      subAr = `رقم البطاقة المستهدفة ${receiverDestination.slice(-4)}`;
      subEn = `Card ending in ${receiverDestination.slice(-4)}`;
      txType = TransactionType.TRANSFER_BANK;
    } else {
      titleAr = `تحويل لحساب بنكي`;
      titleEn = `Standard Bank Transfer`;
      subAr = `حساب مستهدف ${receiverDestination}`;
      subEn = `Target account ${receiverDestination}`;
      txType = TransactionType.TRANSFER_BANK;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      referenceId: generateRefId(),
      type: txType,
      titleAr: titleAr,
      titleEn: titleEn,
      subtitleAr: subAr,
      subtitleEn: subEn,
      amount: amount,
      date: new Date().toISOString(),
      status: TransactionStatus.SUCCESS,
      senderNameAr: profile.name,
      senderNameEn: 'Amany Mohamed Fouad',
      receiverNameAr: receiverNameInput || receiverDestination,
      receiverNameEn: receiverNameInput || receiverDestination,
      receiverAccountOrIpa: receiverDestination,
      bankNameAr: sourceAcc.bankNameAr,
      bankNameEn: sourceAcc.bankNameEn,
      note: sendNote || 'تم التحويل بنجاح من تطبيق انشتا باي',
    };

    // 3. Append to transaction history and reset forms
    setTransactions(prev => [newTx, ...prev]);
    setIsPinPadOpen(false);
    setPhoneScreen('home');
    
    // Auto-open recipe modal to feel extremely rewarding
    setSelectedTx(newTx);

    // Reset fields
    setSendAmount('');
    setReceiverDestination('');
    setReceiverNameInput('');
    setSendNote('');
  };

  // Action: Pay active utility bill
  const handlePayBill = (bill: Bill) => {
    const sourceAcc = accounts.find(a => a.isDefault) || accounts[0];
    if (sourceAcc.balance < bill.amount) {
      alert('الرصيد في حسابك الافتراضي غير كافٍ لسداد هذه الفاتورة');
      return;
    }

    setPinPadData({
      amount: bill.amount,
      titleAr: `سداد فاتورة ${bill.providerAr}`,
      titleEn: `Pay ${bill.providerEn} Bill`,
      onSuccess: () => {
        // Deduct
        setAccounts(prev => prev.map(acc => {
          if (acc.id === sourceAcc.id) {
            return { ...acc, balance: acc.balance - bill.amount };
          }
          return acc;
        }));

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          referenceId: generateRefId(),
          type: TransactionType.BILL_PAYMENT,
          titleAr: `سداد فاتورة ${bill.providerAr}`,
          titleEn: `Utility Bill Paid: ${bill.providerEn}`,
          subtitleAr: bill.categoryAr,
          subtitleEn: bill.categoryEn,
          amount: bill.amount,
          date: new Date().toISOString(),
          status: TransactionStatus.SUCCESS,
          senderNameAr: profile.name,
          senderNameEn: 'Amany Mohamed Fouad',
          bankNameAr: sourceAcc.bankNameAr,
          bankNameEn: sourceAcc.bankNameEn,
          note: `سداد فوري رقمي رقم مرجع المدفوعات للشركة`,
        };

        setTransactions(prev => [newTx, ...prev]);
        setBills(prev => prev.filter(b => b.id !== bill.id));
        setIsPinPadOpen(false);
        setPhoneScreen('home');
        setSelectedTx(newTx);
      }
    });

    setIsPinPadOpen(true);
  };

  // Action: Initiate Mobile Recharge
  const handleInitiateRecharge = () => {
    setRechargeError('');
    const value = parseFloat(rechargeValue);
    if (isNaN(value) || value <= 0) {
      setRechargeError('برجاء إدخال فيمة كارت شحن صحيحة');
      return;
    }

    if (!rechargePhone || rechargePhone.length < 11) {
      setRechargeError('برجاء إدخال رقم هاتف محمول صحيح (11 رقم)');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === rechargeSourceCard);
    if (!sourceAcc || sourceAcc.balance < value) {
      setRechargeError('رصيد البطاقة لا يكفي لشحن هذا المبلغ');
      return;
    }

    setPinPadData({
      amount: value,
      titleAr: `شحن رصيد ${rechargeOperator.toUpperCase()}`,
      titleEn: `${rechargeOperator.toUpperCase()} Top Up`,
      onSuccess: () => {
        setAccounts(prev => prev.map(acc => {
          if (acc.id === sourceAcc.id) {
            return { ...acc, balance: acc.balance - value };
          }
          return acc;
        }));

        const providerNames = {
          vodafone: { ar: 'فودافون كاش كارت شحن', en: 'Vodafone Recharge' },
          orange: { ar: 'أورنج كارت شحن', en: 'Orange Recharge' },
          etisalat: { ar: 'اتصالات كارت شحن', en: 'Etisalat Recharge' },
          we: { ar: 'المصرية للاتصالات WE شحن', en: 'WE Telecom Recharge' },
        };

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          referenceId: generateRefId(),
          type: TransactionType.MOBILE_RECHARGE,
          titleAr: providerNames[rechargeOperator].ar,
          titleEn: providerNames[rechargeOperator].en,
          subtitleAr: `شحن رصيد طائر للرقم ${rechargePhone}`,
          subtitleEn: `Recharge airtime for ${rechargePhone}`,
          amount: value,
          date: new Date().toISOString(),
          status: TransactionStatus.SUCCESS,
          senderNameAr: profile.name,
          senderNameEn: 'Amany Mohamed Fouad',
          bankNameAr: sourceAcc.bankNameAr,
          bankNameEn: sourceAcc.bankNameEn,
          note: `شحن رصيد هوائي فوري للرقم ${rechargePhone}`,
        };

        setTransactions(prev => [newTx, ...prev]);
        setIsPinPadOpen(false);
        setPhoneScreen('home');
        setSelectedTx(newTx);

        // Reset
        setRechargeValue('');
        setRechargePhone('');
      }
    });

    setIsPinPadOpen(true);
  };

  // Action: Create and Link a Virtual Card
  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseFloat(newCardBalance);
    if (!newCardNumber || isNaN(balNum)) {
      alert('برجاء استكمال بيانات البطاقة للشحن');
      return;
    }

    const bankDetails = {
      cib: { 
        nameAr: 'البنك التجاري الدولي (CIB)', 
        nameEn: 'CIB Egypt',
        color: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        brand: 'visa' as const
      },
      alex: { 
        nameAr: 'بنك الإسكندرية', 
        nameEn: 'Bank of Alexandria',
        color: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
        brand: 'meeza' as const
      },
      qnb: { 
        nameAr: 'بنك قطر الوطني QNB', 
        nameEn: 'QNB Alahli',
        color: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
        brand: 'mastercard' as const
      }
    };

    const selBank = bankDetails[newCardBank as keyof typeof bankDetails];

    const newAcc: BankAccount = {
      id: `card-${Date.now()}`,
      bankNameAr: selBank.nameAr,
      bankNameEn: selBank.nameEn,
      accountNumber: `•••• •••• •••• ${newCardNumber.slice(-4) || '7412'}`,
      balance: balNum,
      isDefault: false,
      cardBrand: selBank.brand,
      cardColor: selBank.color,
    };

    setAccounts(prev => [...prev, newAcc]);
    setIsAddCardOpen(false);
    setNewCardNumber('');
    setNewCardBalance('5000');
  };

  // Filter and Search Transactions for main table
  const filteredTransactions = transactions.filter(tx => {
    // Search match
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      tx.titleAr.toLowerCase().includes(query) ||
      tx.titleEn.toLowerCase().includes(query) ||
      tx.referenceId.toLowerCase().includes(query) ||
      (tx.receiverAccountOrIpa && tx.receiverAccountOrIpa.toLowerCase().includes(query)) ||
      (tx.receiverNameAr && tx.receiverNameAr.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Filter type match
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'IN') return tx.type === TransactionType.RECEIVED;
    if (activeFilter === 'OUT') return tx.type !== TransactionType.RECEIVED;
    if (activeFilter === 'BILLS') return tx.type === TransactionType.BILL_PAYMENT;
    if (activeFilter === 'MOBILE') return tx.type === TransactionType.MOBILE_RECHARGE;
    return true;
  });

  // Calculate quick stats for analytics panel
  const totalInbound = transactions
    .filter(tx => tx.type === TransactionType.RECEIVED && tx.status === TransactionStatus.SUCCESS)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutbound = transactions
    .filter(tx => tx.type !== TransactionType.RECEIVED && tx.status === TransactionStatus.SUCCESS)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans tracking-normal relative overflow-x-hidden pb-16" dir="rtl">
      
      {/* Background radial highlight - Vibrant Palette (Vivid Deep Blue and Vibrant Pink) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#E91E63]/10 blur-[180px] -z-10" />
      <div className="absolute top-[20%] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#1A237E]/45 blur-[160px] -z-10" />
      <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full bg-[#E91E63]/8 blur-[160px] -z-10" />

      {/* Egyptian Central Regulatory Header banner */}
      <div className="bg-[#0f1225] border-b border-[#E91E63]/15 text-xs px-4 py-2.5 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Authentic Egyptian Flag Accent */}
          <div className="flex flex-col h-3.5 w-6 border border-slate-700/50 overflow-hidden rounded-[2px]">
            <div className="flex-1 bg-[#C8102E]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-black" />
          </div>
          <p className="text-slate-300 font-medium">
            شبكة المدفوعات اللحظية المصرية (IPN) • مرخص من <span className="text-[#E91E63] font-bold">البنك المركزي المصري</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-slate-300 font-medium">
          <span>التاريخ والوقت: {new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}</span>
          <span className="hidden md:inline bg-[#E91E63]/10 text-[#E91E63] text-[11px] px-3 py-0.5 rounded-full border border-[#E91E63]/25 font-bold">
            تطبيق تجريبي معتمد
          </span>
        </div>
      </div>
 
       {/* Main Container */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
         
         {/* Navigation & Brand bar */}
         <div className="flex justify-between items-center py-4 border-b border-[#1A237E]/40 mb-8">
           <div className="flex items-center gap-3">
             <span className="h-11 w-11 text-xl font-bold bg-gradient-to-tr from-[#1A237E] via-[#5C1149] to-[#E91E63] flex items-center justify-center rounded-2xl text-white shadow-xl shadow-[#E91E63]/15">
               IP
             </span>
             <div>
               <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f39ec0] to-[#E91E63]">
                   instaPay
                 </h1>
                 <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">نشط</span>
               </div>
               <p className="text-[11px] text-slate-400">حسابات كبار العملاء المدمجة</p>
             </div>
           </div>

          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-4">
            <div className="flex items-center gap-2.5 pr-2 pl-4">
              <div className="h-8 w-8 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400 border border-pink-500/20">
                <User size={16} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-100">{profile.name}</p>
                <p className="text-[10px] text-pink-400 font-mono tracking-xs">{profile.ipa}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setPhoneScreen('splash');
                setTimeout(() => setPhoneScreen('home'), 1500);
              }}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition" 
              title="إعادة تشغيل المحاكي"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Master Responsive Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: WEB ADMINISTRATION DASHBOARD (7 out of 12)    */}
          {/* ========================================================= */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            
            {/* Quick Summary Banner Card */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-xs">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 rounded-full blur-[40px] -z-10" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-bold bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">رصيد الحساب المتاح الموحد</span>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-4xl font-black text-slate-100">
                      {showBalance 
                        ? totalBalance.toLocaleString('en-EG', { minimumFractionDigits: 2 })
                        : '••••••••••'
                      }
                    </span>
                    <span className="text-base font-bold text-pink-400">ج.م</span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-slate-500 hover:text-pink-400 p-1.5 hover:bg-slate-800/60 rounded-lg transition"
                    >
                      {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    إجمالي محفظة السيولة موزعة على {accounts.length} حسابات بنكية مفعلة
                  </p>
                </div>

                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                  <div className="flex bg-slate-950/80 rounded-2xl p-3 border border-slate-800/50 flex-1 md:flex-none">
                    <ArrowDownLeft className="text-emerald-500 mr-1 ml-2" size={20} />
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none">إجمالي الوارد</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">+{totalInbound.toLocaleString('en-EG', { maximumFractionDigits: 2 })} ج.م</p>
                    </div>
                  </div>
                  <div className="flex bg-slate-950/80 rounded-2xl p-3 border border-slate-800/50 flex-1 md:flex-none">
                    <ArrowUpRight className="text-rose-500 mr-1 ml-2" size={20} />
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none">إجمالي الصادر</p>
                      <p className="text-sm font-bold text-rose-400 mt-1">-{totalOutbound.toLocaleString('en-EG', { maximumFractionDigits: 2 })} ج.م</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid for Cards Section and Spending Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Bank Card quick visual preview list */}
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 shadow-lg backdrop-blur-xs flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-200">البطاقات والحسابات المربوطة ({accounts.length})</h3>
                  <button 
                    onClick={() => setIsAddCardOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-white hover:bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/20 transition"
                  >
                    <Plus size={12} />
                    <span>ربط بطاقة</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {accounts.map((acc) => (
                    <div 
                      key={acc.id}
                      className="p-3 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center relative overflow-hidden group"
                    >
                      {/* Brand decorative background */}
                      <div className="absolute right-0 top-0 h-full w-1.5" style={{ background: acc.cardColor }} />

                      <div>
                        <p className="text-xs font-extrabold text-slate-200">{acc.bankNameAr}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{acc.accountNumber}</p>
                        <p className="text-xs font-bold text-pink-400 mt-1">{acc.balance.toLocaleString('en-EG', { minimumFractionDigits: 2 })} ج.م</p>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700">
                          {acc.cardBrand}
                        </span>
                        
                        {/* Interactive Deposit/Refill shortcut */}
                        <button
                          onClick={() => handleSimulateDeposit(acc.id, 5000)}
                          className="text-[9px] bg-emerald-500/10 text-emerald-400 py-1 px-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                          title="إضافة رصيد محاكاة"
                        >
                          إيداع 5,000+
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphical Expenditure breakdown via pristine native SVG */}
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 shadow-lg backdrop-blur-xs">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex justify-between items-center">
                  <span>تحليل المصروفات التقريبي</span>
                  <span className="text-[10px] text-slate-400 font-medium">الشهر الحالي</span>
                </h3>

                {/* SVG Visual Chart */}
                <div className="h-[140px] flex items-end justify-between px-4 pb-2 border-b border-slate-800">
                  {/* Category 1: Transfers */}
                  <div className="flex flex-col items-center gap-2 flex-grow">
                    <div className="w-8 bg-gradient-to-t from-pink-800 to-pink-500 rounded-t-lg transition-all hover:scale-105 duration-300 relative group cursor-pointer" style={{ height: '80%' }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        15,300 ج.م
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">تحويلات</span>
                  </div>

                  {/* Category 2: Bills */}
                  <div className="flex flex-col items-center gap-2 flex-grow">
                    <div className="w-8 bg-gradient-to-t from-amber-800 to-amber-500 rounded-t-lg transition-all hover:scale-105 duration-300 relative group cursor-pointer" style={{ height: '45%' }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        2,050 ج.م
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">فواتير</span>
                  </div>

                  {/* Category 3: Mobile Mobile */}
                  <div className="flex flex-col items-center gap-2 flex-grow">
                    <div className="w-8 bg-gradient-to-t from-blue-800 to-blue-500 rounded-t-lg transition-all hover:scale-105 duration-300 relative group cursor-pointer" style={{ height: '20%' }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        150 ج.م
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">شحن هوائي</span>
                  </div>

                  {/* Category 4: Deposits */}
                  <div className="flex flex-col items-center gap-2 flex-grow">
                    <div className="w-8 bg-gradient-to-t from-emerald-800 to-emerald-500 rounded-t-lg transition-all hover:scale-105 duration-300 relative group cursor-pointer" style={{ height: '95%' }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        20,000 ج.م
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">وارد</span>
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-[11px] text-slate-400 px-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block" /> صادر</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> وارد</span>
                </div>
              </div>
            </div>

            {/* Bill List Box Container */}
            {bills.length > 0 && (
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 shadow-lg backdrop-blur-xs">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-200">فواتير مستحقة الدفع الفوري ({bills.length})</h3>
                  </div>
                  <span className="text-xs text-amber-400 font-medium">سدد في الموعد لتجنب الغرامة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bills.map(bill => (
                    <div 
                      key={bill.id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">{bill.providerAr}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{bill.categoryAr}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400">{bill.amount.toFixed(2)} ج.م</span>
                          <span className="text-[9px] text-slate-500">• استحقاق {bill.dueDate}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handlePayBill(bill)}
                        className="py-1.5 px-3 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-bold rounded-xl text-xs transition shadow-md shadow-pink-600/10 cursor-pointer"
                      >
                        سداد سريع
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Master Transactions Ledger */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur-xs">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-200">الأرشيف الكامل للعمليات والتحويلات</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">انقر على أي عملية لعرض وتحميل إيصال المدفوعات اللحظية المعتمد</p>
                </div>
                
                {/* Search Box Inputs */}
                <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800/80 focus-within:border-pink-500/50 transition">
                  <Search size={14} className="text-slate-500 ml-2" />
                  <input 
                    type="text"
                    placeholder="ابحث برقم مرجعي أو اسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full md:w-36"
                  />
                </div>
              </div>

              {/* Filtering Pills Row */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5" dir="rtl">
                {[
                  { value: 'ALL', label: 'الكل' },
                  { value: 'IN', label: 'الوارد' },
                  { value: 'OUT', label: 'الصادر والتحويلات' },
                  { value: 'BILLS', label: 'الفواتير' },
                  { value: 'MOBILE', label: 'شحن الهواتف' }
                ].map((pill) => (
                  <button
                    key={pill.value}
                    onClick={() => setActiveFilter(pill.value)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border ${
                      activeFilter === pill.value 
                        ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-500/10' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Transactions List Ledger */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                    <AlertCircle className="mx-auto text-slate-600 mb-2" size={24} />
                    <p className="text-xs">لم نجد أي عمليات تطابق معايير البحث والفلترة المحددة</p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const details = getTxDetails(tx.type);
                    const isIncome = tx.type === TransactionType.RECEIVED;
                    return (
                      <div 
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="p-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-2xl flex justify-between items-center transition duration-150 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${details.color}`}>
                            {details.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200 group-hover:text-pink-400 transition">
                              {tx.titleAr}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-500 font-mono tracking-xs">{tx.referenceId}</span>
                              <span className="text-[10px] text-slate-500">•</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(tx.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount visual representation */}
                        <div className="text-left">
                          <p className={`text-xs font-black font-sans leading-none ${isIncome ? 'text-emerald-500' : 'text-slate-200'}`}>
                            {isIncome ? '+' : '-'}
                            {tx.amount.toLocaleString('en-EG', { minimumFractionDigits: 2 })}
                          </p>
                          <span className="text-[9px] text-slate-500 uppercase">ج.م</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: PREMIUM SMARTPHONE EMULATOR (5 out of 12)    */}
          {/* ========================================================= */}
          <div className="col-span-1 lg:col-span-5 flex justify-center sticky top-6">
            
            {/* The smartphone casing */}
            <div className="w-[330px] h-[670px] bg-slate-950 rounded-[55px] p-2.5 relative border-[5px] border-slate-800 shadow-[0_0_40px_rgba(219,39,119,0.15)] ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
              
              {/* Dynamic Island on screen */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2 border border-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-auto border border-slate-800" />
              </div>

              {/* Speaker / Notch lines decoration */}
              <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-900 rounded-full z-40" />

              {/* Physical side buttons layout (aesthetic) */}
              <div className="absolute -left-1.5 top-28 w-1 h-10 bg-slate-800 rounded-r-xs" />
              <div className="absolute -left-1.5 top-44 w-1 h-12 bg-slate-800 rounded-r-xs" />
              <div className="absolute -left-1.5 top-[220px] w-1 h-12 bg-slate-800 rounded-r-xs" />
              <div className="absolute -right-1.5 top-36 w-1 h-16 bg-slate-850 rounded-l-xs" />

              {/* Screen Canvas Container inside Phone casing */}
              <div className="flex-1 bg-[#0c0e17] rounded-[45px] overflow-hidden flex flex-col relative" dir="rtl">
                
                {/* Simulated status bar */}
                <div className="h-9 px-6 pt-2 text-slate-400 flex justify-between items-center text-[10px] font-bold z-30 select-none bg-slate-950/30">
                  <span className="font-mono">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <div className="flex items-center gap-1.5">
                    <Wifi size={10} className="text-white" />
                    <span>5G</span>
                    <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-[1px] flex items-center">
                      <div className="h-full w-[85%] bg-emerald-500 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Interactive Phone screen routers */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                  
                  {/* SCREEN 1: SPLASH SCREEN BOOT */}
                  {phoneScreen === 'splash' && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-b from-pink-900 via-pink-950 to-slate-950 flex flex-col justify-between items-center p-8 z-30 text-center"
                    >
                      <div />
                      
                      <div className="space-y-4">
                        <motion.div 
                          animate={{ scale: [0.95, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="mx-auto h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center"
                        >
                          <span className="text-4xl font-black bg-gradient-to-tr from-pink-700 to-rose-500 bg-clip-text text-transparent">
                            IP
                          </span>
                        </motion.div>
                        
                        <div>
                          <h2 className="text-2xl font-black tracking-wider text-slate-100 font-sans">
                            instaPay
                          </h2>
                          <p className="text-xs text-pink-300 font-semibold mt-1">شبكة المدفوعات اللحظية المصرية</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-400 font-medium">بإشراف وبترخيص من</p>
                        <p className="text-xs font-bold text-slate-200">البنك المركزي المصري</p>
                        <div className="h-1 w-16 bg-pink-500/30 rounded-full mx-auto overflow-hidden">
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="h-full w-full bg-pink-500" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SCREEN 2: MAIN HOME OVERVIEW */}
                  {phoneScreen === 'home' && (
                    <div className="p-4 space-y-4 flex flex-col">
                      
                      {/* Top Welcome Title */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-pink-600/20 rounded-full flex items-center justify-center border border-pink-500/30 text-pink-400 font-extrabold text-xs">
                            أ
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 leading-none">أهلاً بك،</p>
                            <p className="text-xs font-black text-slate-200 mt-1">{profile.name.split(' ')[0]}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* QR Code trigger shortcut */}
                          <button 
                            onClick={() => setPhoneScreen('qr')}
                            className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                            title="رمز QR الخاص بي"
                          >
                            <QrCode size={14} />
                          </button>
                          
                          <span className="text-[9px] bg-pink-500/20 text-pink-400 font-bold border border-pink-500/20 px-1.5 py-0.5 rounded-md">
                            تجريبي
                          </span>
                        </div>
                      </div>

                      {/* Phone Balance Display Slider Card */}
                      <div className="bg-gradient-to-br from-pink-700 via-pink-800 to-rose-900 rounded-2xl p-4 shadow-xl text-white relative overflow-hidden group">
                        
                        {/* Vector lines overlay */}
                        <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent -z-10" />

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-white/20 text-white/90 font-bold px-2 py-0.5 rounded-full">
                            رصيد الحساب اللحظي
                          </span>
                          <span className="text-[9px] text-pink-200 font-semibold">تطبيق آمن</span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-2xl font-black font-sans">
                            {showBalance 
                              ? accounts[selectedMobileCardIndex].balance.toLocaleString('en-EG', { minimumFractionDigits: 2 })
                              : '••••••••'
                            }
                          </span>
                          <span className="text-xs font-bold text-pink-200">ج.م</span>
                          <button 
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-white/80 hover:text-white p-1"
                          >
                            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>

                        {/* Cards carousel dot markers */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-1 font-semibold text-white/90">
                            <Landmark size={10} />
                            <span>{accounts[selectedMobileCardIndex].bankNameAr}</span>
                          </div>

                          <div className="flex gap-1">
                            {accounts.map((_, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setSelectedMobileCardIndex(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${selectedMobileCardIndex === idx ? 'bg-white w-3' : 'bg-white/40'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Main Actions Services Grid */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">الخدمات السريعة اللحظية</h4>
                        
                        <div className="grid grid-cols-3 gap-2">
                          
                          {/* Send Money button */}
                          <button
                            onClick={() => setPhoneScreen('send')}
                            className="bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-850 flex flex-col items-center text-center gap-1.5 transition active:scale-95"
                          >
                            <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                              <Send size={15} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-200">إرسال نقود</span>
                          </button>

                          {/* Pay Bills button */}
                          <button
                            onClick={() => setPhoneScreen('bills')}
                            className="bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-850 flex flex-col items-center text-center gap-1.5 transition active:scale-95"
                          >
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                              <FileText size={15} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-200">دفع فواتير</span>
                          </button>

                          {/* Mobile Recharge */}
                          <button
                            onClick={() => setPhoneScreen('recharge')}
                            className="bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-850 flex flex-col items-center text-center gap-1.5 transition active:scale-95"
                          >
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <Smartphone size={15} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-200">شحن رصيد</span>
                          </button>

                        </div>
                      </div>

                      {/* Linked Bank Accounts Quick List */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-bold uppercase">الحسابات والعمليات</span>
                          <button 
                            onClick={() => setPhoneScreen('accounts')} 
                            className="text-pink-400 font-bold hover:underline"
                          >
                            إدارة الكل
                          </button>
                        </div>

                        {/* Recent Transactions list (short snippet of 3 items for mobile screen size efficiency) */}
                        <div className="space-y-2">
                          {transactions.slice(0, 3).map(tx => {
                            const isInc = tx.type === TransactionType.RECEIVED;
                            const amtText = isInc ? `+${tx.amount}` : `-${tx.amount}`;
                            return (
                              <div
                                key={tx.id}
                                onClick={() => setSelectedTx(tx)}
                                className="p-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-850 flex justify-between items-center transition cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg text-xs ${isInc ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-400'}`}>
                                    {isInc ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-100 line-clamp-1">{tx.titleAr}</p>
                                    <p className="text-[8px] text-slate-500 mt-0.5">{new Date(tx.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-black ${isInc ? 'text-emerald-400' : 'text-slate-200'}`}>
                                  {amtText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Simulated Security badge for InstaPay */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850/50 text-center space-y-1.5">
                        <div className="flex items-center justify-center gap-1.5 text-[9px] text-pink-400 font-bold">
                          <CheckCircle2 size={11} />
                          <span>تحت إشراف مباشر للبنك المركزي</span>
                        </div>
                        <p className="text-[8px] text-slate-500">
                          جميع البيانات والرموز السريعة مشفرة ولا يتم تخزينها في المحاكي تماشيا مع قواعد الأمن السيبراني
                        </p>
                      </div>

                    </div>
                  )}

                  {/* SCREEN 3: SEND MONEY FORM */}
                  {phoneScreen === 'send' && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Send size={12} className="text-pink-400" />
                          <span>إرسال نقود لحظية</span>
                        </h3>
                        <button 
                          onClick={() => setPhoneScreen('home')} 
                          className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800"
                        >
                          رجوع
                        </button>
                      </div>

                      {/* Filter of transfer methods */}
                      <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900 rounded-lg">
                        {[
                          { id: 'ipa', label: 'عنوان' },
                          { id: 'mobile', label: 'هاتف' },
                          { id: 'bank', label: 'حساب' },
                          { id: 'card', label: 'بطاقة' }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => {
                              setSendType(btn.id as any);
                              setReceiverDestination('');
                            }}
                            className={`text-[9px] py-1 rounded font-bold transition ${sendType === btn.id ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {/* Target input dynamic */}
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">
                            {sendType === 'ipa' && 'عنوان الدفع اللحظي (IPA):'}
                            {sendType === 'mobile' && 'رقم هاتف مستلم المحفظة:'}
                            {sendType === 'bank' && 'رقم الحساب البنكي / IBAN:'}
                            {sendType === 'card' && 'رقم بطاقة ميزة أو ديبت (16 رقم):'}
                          </label>
                          <input 
                            type="text"
                            placeholder={
                              sendType === 'ipa' ? 'name@instapay' :
                              sendType === 'mobile' ? 'مثال: 01012345678' :
                              sendType === 'bank' ? 'EG3000...' : '5078 •••• •••• ••••'
                            }
                            value={receiverDestination}
                            onChange={(e) => setReceiverDestination(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">اسم المستفيد (أو جهة الملاحظة):</label>
                          <input 
                            type="text"
                            placeholder="مثال: يوسف محمد فؤاد"
                            value={receiverNameInput}
                            onChange={(e) => setReceiverNameInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        {/* Amount */}
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">قيمة التحويل (ج.م):</label>
                          <div className="relative">
                            <input 
                              type="number"
                              placeholder="0.00"
                              value={sendAmount}
                              onChange={(e) => setSendAmount(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 pl-10 text-sm font-bold text-slate-200 focus:outline-none focus:border-pink-500 text-left"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold leading-none">ج.م</span>
                          </div>
                        </div>

                        {/* Choose funding card */}
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">خصم من حساب:</label>
                          <select 
                            value={sendSourceAccountId}
                            onChange={(e) => setSendSourceAccountId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.bankNameAr} ({acc.balance.toLocaleString('en-EG', { maximumFractionDigits: 0 })} جم)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Error message */}
                        {sendFormError && (
                          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center text-[9px] text-rose-400 font-bold flex items-center justify-center gap-1">
                            <AlertCircle size={10} />
                            <span>{sendFormError}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleInitiateSendMoney}
                          className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-600/10 transition"
                        >
                          تحويل لحظي آمن
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 4: UTILITY BILLS SCREEN */}
                  {phoneScreen === 'bills' && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <FileText size={12} className="text-amber-500" />
                          <span>سداد فواتير فورية</span>
                        </h3>
                        <button 
                          onClick={() => setPhoneScreen('home')} 
                          className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800"
                        >
                          رجوع
                        </button>
                      </div>

                      {bills.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 space-y-2">
                          <CheckCircle2 className="text-emerald-500 mx-auto" size={24} />
                          <p className="text-xs font-bold">تم سداد جميع الفواتير بنجاح!</p>
                          <p className="text-[9px]">لا يوجد أي فواتير مستحقة الدفع حالياً</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bills.map(bill => (
                            <div 
                              key={bill.id} 
                              className="p-3 bg-slate-900 rounded-xl border border-slate-850 space-y-2.5"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-200">{bill.providerAr}</p>
                                  <p className="text-[8px] text-slate-500 mt-0.5">{bill.categoryAr}</p>
                                </div>
                                <span className="text-[10px] font-black text-amber-400">{bill.amount.toFixed(2)} جم</span>
                              </div>

                              <button
                                onClick={() => handlePayBill(bill)}
                                className="w-full py-1.5 bg-slate-950 hover:bg-pink-600 hover:border-pink-500 text-slate-300 hover:text-white border border-slate-800 text-[10px] font-bold rounded-lg transition"
                              >
                                سداد فوري بالرقم السري
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCREEN 5: MOBILE RECHARGE */}
                  {phoneScreen === 'recharge' && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Smartphone size={12} className="text-blue-400" />
                          <span>شحن رصيد هوائي</span>
                        </h3>
                        <button 
                          onClick={() => setPhoneScreen('home')} 
                          className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800"
                        >
                          رجوع
                        </button>
                      </div>

                      {/* Choose network provider */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">اختر شركة المحمول:</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'vodafone', name: 'فودافون', border: 'border-rose-600 bg-rose-600/10 text-rose-400' },
                              { id: 'orange', name: 'أورنج', border: 'border-orange-500 bg-orange-500/10 text-orange-400' },
                              { id: 'etisalat', name: 'اتصالات', border: 'border-emerald-600 bg-emerald-600/10 text-emerald-400' },
                              { id: 'we', name: 'WE', border: 'border-purple-600 bg-purple-600/10 text-purple-400' }
                            ].map(op => (
                              <button
                                key={op.id}
                                type="button"
                                onClick={() => setRechargeOperator(op.id as any)}
                                className={`text-[9px] py-1.5 rounded-lg font-extrabold border transition ${
                                  rechargeOperator === op.id 
                                    ? op.border 
                                    : 'border-slate-800 bg-slate-900 text-slate-400'
                                }`}
                              >
                                {op.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">رقم الهاتف المحمول (11 رقم):</label>
                          <input 
                            type="text"
                            placeholder="01xxxxxxxxx"
                            value={rechargePhone}
                            onChange={(e) => setRechargePhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500 text-left font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">قيمة كارت الشحن (ج.م):</label>
                          <input 
                            type="number"
                            placeholder="قيمة الشحن"
                            value={rechargeValue}
                            onChange={(e) => setRechargeValue(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-1">خصم من حساب:</label>
                          <select 
                            value={rechargeSourceCard}
                            onChange={(e) => setRechargeSourceCard(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.bankNameAr} ({acc.balance.toFixed(0)} جم)
                              </option>
                            ))}
                          </select>
                        </div>

                        {rechargeError && (
                          <p className="text-[9px] text-rose-400 font-bold text-center">{rechargeError}</p>
                        )}

                        <button
                          onClick={handleInitiateRecharge}
                          className="w-full py-2 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                        >
                          تأكيد ودفع
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 6: LINKED ACCOUNTS MANAGEMENT */}
                  {phoneScreen === 'accounts' && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Landmark size={12} className="text-pink-400" />
                          <span>الحسابات المصرفية المربوطة</span>
                        </h3>
                        <button 
                          onClick={() => setPhoneScreen('home')} 
                          className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800"
                        >
                          رجوع
                        </button>
                      </div>

                      <div className="space-y-3">
                        {accounts.map(acc => (
                          <div 
                            key={acc.id}
                            className="p-3 bg-gradient-to-l from-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500" style={{ background: acc.cardColor }} />
                            <div className="flex justify-between items-center text-[10px]">
                              <p className="font-bold text-slate-200">{acc.bankNameAr}</p>
                              <span className="text-[8px] uppercase font-bold text-slate-400">{acc.cardBrand}</span>
                            </div>
                            <p className="text-[9px] font-mono text-slate-500">{acc.accountNumber}</p>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-850">
                              <span className="text-[10px] text-slate-400">الرصيد:</span>
                              <span className="text-xs font-bold text-pink-400">{acc.balance.toLocaleString('ar-EG')} جم</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SCREEN 7: MY QR CODE */}
                  {phoneScreen === 'qr' && (
                    <div className="p-4 space-y-4 flex flex-col justify-between items-center h-full">
                      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <QrCode size={12} className="text-pink-400" />
                          <span>رمز الاستجابة السريع QR</span>
                        </h3>
                        <button 
                          onClick={() => setPhoneScreen('home')} 
                          className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800"
                        >
                          إغلاق
                        </button>
                      </div>

                      <div className="py-4 text-center space-y-3">
                        <div className="p-4 bg-white rounded-3xl inline-block shadow-xl shadow-pink-500/5">
                          {/* Beautiful SVG representation of a simulated QR Code with pink colors */}
                          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Outer square path of QR code */}
                            <path d="M5 5H25V10H10V25H5V5ZM10 10H20V20H10V10ZM75 5H95V25H90V10H80V5ZM80 10H90V20H80V10ZM5 75H10V90H25V95H5V75ZM10 80H20V90H10V80ZM75 95H95V75H90V90H80V95ZM85 85H90V90H85V85Z" fill="#31112c"/>
                            {/* Center branding square */}
                            <rect x="38" y="38" width="24" height="24" rx="6" fill="#be185d" />
                            <text x="50" y="52" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">IP</text>
                            {/* Inner random pixels */}
                            <path d="M30 15H35V25H30V15ZM45 10H50V20H45V10ZM60 15H65V30H60V15ZM70 20H75V25H70V20ZM15 35H25V40H15V35ZM30 35H40V45H30V35ZM50 35H55V50H50V35ZM15 45H20V60H15V45ZM25 50H30V55H25V50ZM65 45H75V50H65V45ZM70 55H75V65H70V55ZM5 65H15V70H5V65ZM30 60H35V75H30V60ZM40 65H55V70H40V65ZM45 75H50V85H45V75ZM55 75H65V80H55V75ZM60 85H70V90H60V85Z" fill="#a21c4b" />
                          </svg>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-100">{profile.name}</p>
                          <p className="text-[10px] text-pink-400 font-mono select-all decoration-dotted underline">{profile.ipa}</p>
                        </div>
                      </div>

                      <div className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-center">
                        <p className="text-[9px] text-slate-400">
                          اعرض هذا الرمز لأي مستخدم انستا باي آخر لمسح الرمز وتحويل الأموال لك فورياً دون إدخال بيانات يدوياً
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Home Indicator bar on simulated screen bottom */}
                <div 
                  onClick={() => setPhoneScreen('home')}
                  className="h-6 pb-2 flex items-center justify-center cursor-pointer select-none bg-slate-950/40"
                >
                  <div className="w-24 h-1 bg-slate-700 hover:bg-pink-500 transition-all rounded-full" />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* ADD CARD MODAL FORM SHEET                                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isAddCardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl"
            >
              <button 
                onClick={() => setIsAddCardOpen(false)}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <CreditCard className="text-pink-500" size={18} />
                <span>ربط بطاقة / حساب مصرفي جديد</span>
              </h3>

              <form onSubmit={handleAddNewCard} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اختر البنك المصرفي:</label>
                  <select 
                    value={newCardBank}
                    onChange={(e) => setNewCardBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                  >
                    <option value="cib">البنك التجاري الدولي (CIB)</option>
                    <option value="alex">بنك الإسكندرية (AlexBank)</option>
                    <option value="qnb">بنك قطر الوطني (QNB Alahli)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">رقم بطاقة الخصم أو ميزة (16 رقم):</label>
                  <input 
                    type="text" 
                    maxLength={16}
                    placeholder="5078000011112222"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-mono text-left"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">رصيد البداية المتاح للبطاقة (ج.م):</label>
                  <input 
                    type="number" 
                    placeholder="رصيد الحساب المتاح"
                    value={newCardBalance}
                    onChange={(e) => setNewCardBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-bold"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 text-[10px] text-slate-400">
                  <p className="font-bold text-pink-400">ملحوظة أمنية تجريبية:</p>
                  <p className="mt-0.5">يربط المحاكي بطاقتك بنجاح محليا فقط من أجل عمليات النقل والدفع السهلة ولا يتم مشاركتها خارجيا.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  ربط وتفعيل البطاقة فورا
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PIN PAD COMPONENT DIALOG                                  */}
      {/* ========================================================= */}
      {pinPadData && (
        <PINPad 
          isOpen={isPinPadOpen}
          amount={pinPadData.amount}
          titleAr={pinPadData.titleAr}
          titleEn={pinPadData.titleEn}
          onClose={() => setIsPinPadOpen(false)}
          onSuccess={pinPadData.onSuccess}
        />
      )}

      {/* ========================================================= */}
      {/* DETAILED TRANSACTION RECEIPT MODAL                         */}
      {/* ========================================================= */}
      <TransactionReceipt 
        isOpen={selectedTx !== null}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

    </div>
  );
}
