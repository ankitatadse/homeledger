# 🏠 HomeLedger — Household & Family Expense Tracker

A modern, fast, and privacy-focused web application designed to track shared household expenses, calculate fair splits among family members, and settle outstanding balances in Indian Rupees (₹).

---

## 🌟 Key Features

1. **Equal & Flexible Expense Splitting**:
   - Record household expenses (Groceries, Electricity, WiFi, LPG Cylinder, Maintenance, Dining, etc.).
   - Choose who paid and select which family members share the expense.
   - Automatically calculates each member's exact fair share.

2. **Smart "Who Owes Whom" Debt Settlement**:
   - Minimal transaction solver that computes direct settlement transfers (e.g. *"Rahul pays You ₹1,450"*).
   - One-click **"⚡ Settle Up"** button to record settlements via UPI / GooglePay / NetBanking and zero out balances.
   - Celebration confetti animation upon completing a settlement.

3. **Real-time Household Dashboard**:
   - **Total Spent**: Month-to-date and all-time household spending.
   - **Your Paid vs Fair Share**: Clear breakdown of what you spent vs your personal contribution.
   - **Net Balance**: Instantly shows if you are owed money (in green) or owe money (in red).
   - **Monthly Budget Tracker**: Progress bar with visual alerts when approaching or exceeding limits.

4. **Interactive Visual Charts**:
   - **Spending by Category**: Interactive doughnut chart breaking down percentages and amounts.
   - **Monthly Trend & Member Comparison**: Compare spending month-over-month or compare contributions between family members.

5. **Search & Multi-criteria Filtering**:
   - Filter by timeframe (This Month, Last Month, Past 90 Days, All Time).
   - Filter by Category or Paid By member.
   - Search by keyword, description, or notes.
   - Sort by Date (newest/oldest) or Amount (highest/lowest).

6. **Privacy & Data Portability**:
   - All data is saved securely in your browser's `localStorage` (100% private, no external server required).
   - **Export to CSV / Excel**: Download a UTF-8 CSV statement ready for Microsoft Excel or Google Sheets.
   - **Backup & Restore**: Export full JSON backups and restore them anytime.
   - **Printable Monthly Statement**: Clean printer-friendly layout for household filing.

---

## 🚀 How to Run

### Method 1: Instant Browser Launch (No server needed)
Double-click [index.html](file:///C:/Users/ankitat/.gemini/antigravity/scratch/home-expense-tracker/index.html) or right-click and choose **Open with > Chrome / Edge / Firefox**.

### Method 2: Local Node.js Server
Open PowerShell in this directory and run:
```powershell
node server.js
```
Then visit: **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Workspace Setup
To continue developing or customizing this project in Antigravity, set this folder as your active workspace:
```
C:\Users\ankitat\.gemini\antigravity\scratch\home-expense-tracker
```
