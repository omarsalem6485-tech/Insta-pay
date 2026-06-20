export interface UserProfile {
  name: string;
  ipa: string; // Instant Payment Address (e.g., amany.fouad@instapay)
  mobile: string;
  defaultBalance: number;
}

export enum TransactionType {
  TRANSFER_BANK = 'TRANSFER_BANK',
  TRANSFER_IPA = 'TRANSFER_IPA',
  TRANSFER_MOBILE = 'TRANSFER_MOBILE',
  TRANSFER_WALLET = 'TRANSFER_WALLET',
  RECEIVED = 'RECEIVED',
  BILL_PAYMENT = 'BILL_PAYMENT',
  MOBILE_RECHARGE = 'MOBILE_RECHARGE',
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface Transaction {
  id: string;
  referenceId: string;
  type: TransactionType;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  amount: number;
  date: string; // ISO String
  status: TransactionStatus;
  senderNameAr?: string;
  senderNameEn?: string;
  receiverNameAr?: string;
  receiverNameEn?: string;
  receiverAccountOrIpa?: string;
  bankNameAr?: string;
  bankNameEn?: string;
  note?: string;
}

export interface BankAccount {
  id: string;
  bankNameAr: string;
  bankNameEn: string;
  accountNumber: string; // Masked e.g. **** 1234
  balance: number;
  isDefault: boolean;
  cardBrand: 'visa' | 'mastercard' | 'meeza';
  cardColor: string; // hex or gradient
}

export interface Bill {
  id: string;
  providerAr: string;
  providerEn: string;
  categoryAr: string;
  categoryEn: string;
  amount: number;
  dueDate: string;
}
