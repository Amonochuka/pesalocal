// src/services/parser/pdfParser.ts
import * as pdfjs from "pdfjs-dist";
import { mpesaPatterns } from "./mpesaPatterns";
import type { Transaction } from "../storage/db";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

export interface ParseResult {
  transactions: Transaction[];
  summary: {
    openingBalance: number;
    closingBalance: number;
    totalInflow: number;
    totalOutflow: number;
    totalFees: number;
    transactionCount: number;
  };
}

export class MpesaStatementParser {
  private calculateFee(amount: number, type: string): number {
    let baseFee = 0;

    if (type.includes("Send Money")) {
      baseFee = mpesaPatterns.fees.sendMoney(amount);
    } else if (type.includes("Paybill")) {
      baseFee = mpesaPatterns.fees.paybill(amount);
    } else if (type.includes("Buy Goods")) {
      baseFee = mpesaPatterns.fees.buyGoods(amount);
    } else if (type.includes("Withdraw")) {
      baseFee = mpesaPatterns.fees.withdraw(amount);
    }

    // Add 20% excise duty
    return Math.round(baseFee * 1.2);
  }

  private detectType(description: string): string {
    if (mpesaPatterns.typeDetection.sendMoney.test(description))
      return "Send Money";
    if (mpesaPatterns.typeDetection.receiveMoney.test(description))
      return "Receive Money";
    if (mpesaPatterns.typeDetection.paybill.test(description)) return "Paybill";
    if (mpesaPatterns.typeDetection.buyGoods.test(description))
      return "Buy Goods";
    if (mpesaPatterns.typeDetection.withdraw.test(description))
      return "Withdrawal";
    if (mpesaPatterns.typeDetection.airtime.test(description)) return "Airtime";
    if (mpesaPatterns.typeDetection.fuliza.test(description)) return "Fuliza";
    return "Other";
  }

  private extractCounterparty(description: string, type: string): string {
    let match;

    if (type === "Send Money") {
      match = description.match(mpesaPatterns.counterparty.fromSend);
    } else if (type === "Receive Money") {
      match = description.match(mpesaPatterns.counterparty.fromReceive);
    } else if (type === "Paybill") {
      match = description.match(mpesaPatterns.counterparty.fromPaybill);
    }

    return match ? match[1].trim() : "Unknown";
  }

  private parseTransactions(text: string): Transaction[] {
    const transactions: Transaction[] = [];
    const lines = text.split("\n");

    let currentTransaction: Partial<Transaction> = {};

    for (const line of lines) {
      // Look for transaction patterns
      const match = line.match(mpesaPatterns.transaction.full);
      if (match) {
        // If we have a previous transaction, save it
        if (currentTransaction.receiptNumber) {
          const amount = currentTransaction.amount || 0;
          const type = currentTransaction.category || "Other";
          const fee = this.calculateFee(amount, type);

          transactions.push({
            id: crypto.randomUUID(),
            receiptNumber: currentTransaction.receiptNumber || "",
            completionTime: currentTransaction.completionTime || new Date(),
            amount,
            fee,
            totalImpact: amount + fee,
            balance: currentTransaction.balance || 0,
            category: type,
            counterparty: currentTransaction.counterparty || "Unknown",
            description: currentTransaction.description || "",
            type: "personal",
            isFlagged: false,
          });
        }

        // Parse new transaction
        const parts = line.split(/\s+/);
        const dateStr = parts[0] + " " + parts[1];
        const receipt = parts[2];
        const description = parts.slice(3, -3).join(" ");
        const amount = parseFloat(parts[parts.length - 3].replace(/,/g, ""));
        const balance = parseFloat(parts[parts.length - 1].replace(/,/g, ""));

        const type = this.detectType(description);
        const counterparty = this.extractCounterparty(description, type);

        currentTransaction = {
          receiptNumber: receipt,
          completionTime: new Date(dateStr),
          amount,
          balance,
          category: type,
          counterparty,
          description,
        };
      }
    }

    // Add the last transaction
    if (currentTransaction.receiptNumber) {
      const amount = currentTransaction.amount || 0;
      const type = currentTransaction.category || "Other";
      const fee = this.calculateFee(amount, type);

      transactions.push({
        id: crypto.randomUUID(),
        receiptNumber: currentTransaction.receiptNumber || "",
        completionTime: currentTransaction.completionTime || new Date(),
        amount,
        fee,
        totalImpact: amount + fee,
        balance: currentTransaction.balance || 0,
        category: type,
        counterparty: currentTransaction.counterparty || "Unknown",
        description: currentTransaction.description || "",
        type: "personal",
        isFlagged: false,
      });
    }

    return transactions;
  }

  private calculateSummary(
    transactions: Transaction[],
  ): ParseResult["summary"] {
    let openingBalance = 0;
    let closingBalance = 0;
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalFees = 0;

    if (transactions.length > 0) {
      // Sort by date to get first and last
      const sorted = [...transactions].sort(
        (a, b) => a.completionTime.getTime() - b.completionTime.getTime(),
      );

      // Estimate opening balance (balance of first transaction minus its impact)
      const first = sorted[0];
      openingBalance = first.balance - (first.amount + first.fee);

      // Closing balance is balance of last transaction
      closingBalance = sorted[sorted.length - 1].balance;

      // Calculate totals
      for (const tx of transactions) {
        if (tx.amount > 0) {
          totalInflow += tx.amount;
        } else {
          totalOutflow += Math.abs(tx.amount);
        }
        totalFees += tx.fee;
      }
    }

    return {
      openingBalance,
      closingBalance,
      totalInflow,
      totalOutflow,
      totalFees,
      transactionCount: transactions.length,
    };
  }

  async parse(file: File, password: string): Promise<ParseResult> {
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Load PDF with password
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        password,
      });

      const pdf = await loadingTask.promise;

      // Extract text from all pages
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      // Parse transactions
      const transactions = this.parseTransactions(fullText);

      // Calculate summary
      const summary = this.calculateSummary(transactions);

      return { transactions, summary };
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error("Failed to parse PDF. Check password or file format.");
    }
  }
}
