// src/services/parser/mpesaPatterns.ts
export const mpesaPatterns = {
  // Transaction patterns
  transaction: {
    // Full transaction line
    full: /(\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{2})\s+([A-Z0-9]+)\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/g,

    // Individual components
    date: /(\d{1,2}-\d{1,2}-\d{4})/,
    time: /(\d{1,2}:\d{2})/,
    receipt: /([A-Z0-9]{10})/,
    amount: /([\d,]+\.\d{2})/g,
  },

  // Fee calculation based on transaction type and amount
  fees: {
    sendMoney: (amount: number) => {
      if (amount <= 100) return 0;
      if (amount <= 500) return 11;
      if (amount <= 2500) return 30;
      if (amount <= 70000) return 52;
      return 108;
    },

    withdraw: (amount: number) => {
      if (amount <= 100) return 10;
      if (amount <= 2500) return 29;
      if (amount <= 5000) return 33;
      if (amount <= 10000) return 39;
      if (amount <= 20000) return 67;
      if (amount <= 35000) return 87;
      if (amount <= 50000) return 97;
      return 107;
    },

    paybill: (amount: number) => {
      if (amount <= 100) return 0;
      if (amount <= 500) return 7;
      if (amount <= 1000) return 13;
      if (amount <= 1500) return 23;
      if (amount <= 2500) return 33;
      if (amount <= 3500) return 53;
      if (amount <= 5000) return 57;
      if (amount <= 7500) return 78;
      return 87;
    },

    buyGoods: (amount: number) => {
      if (amount <= 100) return 0;
      if (amount <= 500) return 7;
      if (amount <= 1000) return 13;
      if (amount <= 1500) return 23;
      if (amount <= 2500) return 33;
      return 53;
    },
  },

  // Transaction type detection
  typeDetection: {
    sendMoney: /Sent to|Send to|Transferred to/i,
    receiveMoney: /Received from|Received from/i,
    paybill: /Paid to .+? (Paybill|Pay Bill)/i,
    buyGoods: /Paid to .+? (Buy Goods|Till)/i,
    withdraw: /Withdraw|Withdrawal/i,
    airtime: /Airtime purchase/i,
    fuliza: /Fuliza|Overdraft/i,
  },

  // Counterparty extraction
  counterparty: {
    fromSend: /Sent to (.+?)(?:\s+on|\s+at|$)/i,
    fromReceive: /Received from (.+?)(?:\s+on|\s+at|$)/i,
    fromPaybill: /Paid to (.+?)(?:\s+on|\s+at|$)/i,
  },
};
