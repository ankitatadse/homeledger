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

## ☁️ Free Cloud Database & Live Multi-Device Sync

HomeLedger supports two simple ways to sync expenses across all family members' devices in real time:

### Option 1: Instant Household Room Code (Zero Setup)
1. In HomeLedger, click **"Local Only"** or ⚙️ > **Cloud Sync Settings**.
2. Under **Instant Cloud Sync**, enter a shared Household Room Code (e.g. `sharma-family-2026`).
3. Open the app on your family member's phone or computer (or your live Vercel link), and enter the **exact same room code**.
4. Both devices are now linked to the same shared household ledger!

### Option 2: Google Firebase Firestore (Real-Time Live WebSockets)
For instant live screen updates without refreshing:
1. Create a free project at [Firebase Console](https://console.firebase.google.com) (100% free Spark plan).
2. Go to **Firestore Database** > Create Database (Start in *Test Mode*).
3. Under Project Settings, click **Web app (</>)** and copy your `projectId` and `apiKey`.
4. Paste them into HomeLedger under **Google Firebase Firestore** tab.
5. All devices now enjoy real-time WebSocket live sync!

---

## 🚀 How to Run Locally

### Method 1: Instant Browser Launch (No server needed)
Double-click [index.html](file:///C:/Users/ankitat/.gemini/antigravity/scratch/home-expense-tracker/index.html) or right-click and choose **Open with > Chrome / Edge / Firefox**.

### Method 2: Local Node.js Server
Open PowerShell in this directory and run:
```powershell
node server.js
```
Then visit: **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploy to Vercel (Free)

1. Push this project to a GitHub repository:
   ```powershell
   git remote add origin https://github.com/<username>/homeledger.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new), import your repository, and click **Deploy**.
3. Share the live `https://<your-project>.vercel.app` URL with your family!

---

## 📁 Workspace Setup
To continue developing or customizing this project in Antigravity, set this folder as your active workspace:
```
C:\Users\ankitat\.gemini\antigravity\scratch\home-expense-tracker
```
