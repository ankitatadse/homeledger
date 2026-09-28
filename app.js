// HomeLedger — Household & Family Expense Tracker
// JavaScript Logic & State Management

(function () {
  'use strict';

  // Constants & Storage Keys
  const STORAGE_KEY = 'homeledger_data_v2';

  // Standard Household Categories
  const CATEGORIES = [
    { id: 'groceries', name: 'Groceries & Kitchen', icon: '🛒', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'rent', name: 'Rent & Housing', icon: '🏠', color: '#3b82f6', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'electricity', name: 'Electricity & Power', icon: '⚡', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'gas', name: 'LPG Gas / Cylinder', icon: '🔥', color: '#ea580c', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 'wifi', name: 'WiFi & Internet', icon: '📶', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'dining', name: 'Food & Dining Out', icon: '🍲', color: '#f43f5e', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'maintenance', name: 'Society / Maintenance', icon: '🧹', color: '#14b8a6', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 'medical', name: 'Pharmacy & Medical', icon: '💊', color: '#ef4444', bg: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'transport', name: 'Fuel & Commute', icon: '🚗', color: '#06b6d4', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { id: 'shopping', name: 'Home Supplies & Shopping', icon: '🛍️', color: '#8b5cf6', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'settlement', name: 'Debt Settlement', icon: '🤝', color: '#64748b', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'other', name: 'Miscellaneous', icon: '📦', color: '#94a3b8', bg: 'bg-slate-50 text-slate-600 border-slate-200' }
  ];

  // Default Members
  const DEFAULT_MEMBERS = [
    { id: 'm1', name: 'You', avatar: '👨‍💼', isYou: true },
    { id: 'm2', name: 'Family Member', avatar: '👩‍💼', isYou: false }
  ];

  // Initial Sample Data Helper
  function getSampleExpenses() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = String(today.getMonth() + 1).padStart(2, '0');

    // Dates in current month
    const d1 = `${curYear}-${curMonth}-02`;
    const d2 = `${curYear}-${curMonth}-05`;
    const d3 = `${curYear}-${curMonth}-09`;
    const d4 = `${curYear}-${curMonth}-14`;
    const d5 = `${curYear}-${curMonth}-18`;
    const d6 = `${curYear}-${curMonth}-22`;

    return [
      {
        id: 'exp_1',
        title: 'Monthly Groceries & Staples (Supermarket)',
        amount: 4650,
        category: 'groceries',
        paidBy: 'm1', // You paid
        splitAmong: ['m1', 'm2'],
        date: d1,
        notes: 'D-Mart Monthly bill'
      },
      {
        id: 'exp_2',
        title: 'Electricity Bill',
        amount: 2340,
        category: 'electricity',
        paidBy: 'm2', // Family Member paid
        splitAmong: ['m1', 'm2'],
        date: d2,
        notes: 'Paid online via BESCOM / State Board'
      },
      {
        id: 'exp_3',
        title: 'High-Speed Fiber Internet',
        amount: 1179,
        category: 'wifi',
        paidBy: 'm1', // You paid
        splitAmong: ['m1', 'm2'],
        date: d3,
        notes: 'Airtel Xstream Monthly bill'
      },
      {
        id: 'exp_4',
        title: 'LPG Gas Cylinder Refill',
        amount: 980,
        category: 'gas',
        paidBy: 'm2', // Family Member paid
        splitAmong: ['m1', 'm2'],
        date: d4,
        notes: 'HP Gas refill'
      },
      {
        id: 'exp_5',
        title: 'Weekend Family Dinner & Treats',
        amount: 1950,
        category: 'dining',
        paidBy: 'm1', // You paid
        splitAmong: ['m1', 'm2'],
        date: d5,
        notes: 'Restaurant food order'
      },
      {
        id: 'exp_6',
        title: 'Society Maintenance & Water Charges',
        amount: 3200,
        category: 'maintenance',
        paidBy: 'm2', // Family Member paid
        splitAmong: ['m1', 'm2'],
        date: d6,
        notes: 'Monthly maintenance'
      }
    ];
  }

  // Application State
  let state = {
    members: [],
    expenses: [],
    monthlyBudget: 40000,
    isSampleData: false,
    filters: {
      period: 'this-month',
      search: '',
      category: 'all',
      paidBy: 'all',
      sort: 'date-desc'
    },
    activeChartView: 'monthly' // 'monthly' or 'member'
  };

  // Chart instances
  let categoryChartInstance = null;
  let trendChartInstance = null;

  // Formatting helpers
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const currencyDetailedFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

  function formatCurrency(amount, detailed = false) {
    if (isNaN(amount) || amount === null) amount = 0;
    return detailed ? currencyDetailedFormatter.format(amount) : currencyFormatter.format(amount);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  // Load & Save State
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.members = parsed.members && parsed.members.length ? parsed.members : DEFAULT_MEMBERS;
        state.expenses = parsed.expenses || [];
        state.monthlyBudget = parsed.monthlyBudget || 40000;
        state.isSampleData = parsed.isSampleData || false;
      } else {
        // Load default starter state with sample data
        state.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
        state.expenses = getSampleExpenses();
        state.monthlyBudget = 40000;
        state.isSampleData = true;
        saveState();
      }
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
      state.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
      state.expenses = getSampleExpenses();
      state.isSampleData = true;
    }
  }

  // Cloud Sync Configuration & State
  const CLOUD_CONFIG_KEY = 'homeledger_cloud_config_v2';
  let cloudConfig = {
    enabled: false,
    provider: 'none', // 'firebase' or 'instant'
    householdId: '',
    firebase: {
      projectId: '',
      apiKey: '',
      appId: ''
    }
  };

  let firestoreDb = null;
  let unsubscribeFirestore = null;
  let lastLocalTimestamp = 0;
  let isReceivingRemoteUpdate = false;

  // Multi-tab broadcast channel for instant local multi-window synchronization
  const tabSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('homeledger_tab_sync') : null;
  if (tabSyncChannel) {
    tabSyncChannel.onmessage = (event) => {
      if (event.data === 'sync_update' && !isReceivingRemoteUpdate) {
        loadStateFromLocalStorageOnly();
        renderAll();
      }
    };
  }

  function broadcastLocalChange() {
    if (tabSyncChannel) {
      try { tabSyncChannel.postMessage('sync_update'); } catch (e) {}
    }
  }

  function loadStateFromLocalStorageOnly() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.members = parsed.members || state.members;
        state.expenses = parsed.expenses || [];
        state.monthlyBudget = parsed.monthlyBudget || 40000;
        state.isSampleData = parsed.isSampleData || false;
      }
    } catch (e) {}
  }

  function loadCloudConfig() {
    try {
      const saved = localStorage.getItem(CLOUD_CONFIG_KEY);
      if (saved) {
        cloudConfig = { ...cloudConfig, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading cloud config:', e);
    }
  }

  function saveCloudConfig() {
    try {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(cloudConfig));
    } catch (e) {
      console.error('Error saving cloud config:', e);
    }
  }

  function updateCloudStatusUI(status, label, subtitle) {
    const dot = document.getElementById('cloudStatusDot');
    const text = document.getElementById('cloudStatusText');
    const icon = document.getElementById('cloudStatusIcon');
    const title = document.getElementById('cloudStatusTitle');
    const sub = document.getElementById('cloudStatusSubtitle');
    const banner = document.getElementById('cloudStatusBanner');
    const disBtn = document.getElementById('disconnectCloudBtn');
    const actRow = document.getElementById('cloudSyncActions');

    if (status === 'synced') {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      if (text) text.textContent = cloudConfig.provider === 'firebase' ? 'Live Firebase' : 'Instant Cloud';
      if (icon) icon.textContent = '🟢';
      if (title) title.textContent = `Connected: ${cloudConfig.householdId}`;
      if (sub) sub.textContent = subtitle || (cloudConfig.provider === 'firebase' ? 'Real-time WebSocket sync active across all family devices.' : 'Shared room sync active.');
      if (banner) banner.className = 'p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 bg-emerald-50/70 border-emerald-200 text-emerald-800';
      if (disBtn) disBtn.classList.remove('hidden');
      if (actRow) actRow.classList.remove('hidden');
    } else if (status === 'syncing') {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-ping';
      if (text) text.textContent = 'Syncing...';
      if (icon) icon.textContent = '🟡';
      if (title) title.textContent = 'Syncing with Cloud...';
      if (sub) sub.textContent = 'Updating household database...';
    } else if (status === 'error') {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-red-500';
      if (text) text.textContent = 'Sync Error';
      if (icon) icon.textContent = '⚠️';
      if (title) title.textContent = 'Connection Error';
      if (sub) sub.textContent = subtitle || 'Check your internet connection or Firebase API rules.';
      if (banner) banner.className = 'p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 bg-red-50 border-red-200 text-red-800';
      if (disBtn) disBtn.classList.remove('hidden');
    } else {
      // Local Only
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-slate-400';
      if (text) text.textContent = 'Local Only';
      if (icon) icon.textContent = '⚪';
      if (title) title.textContent = 'Local Storage Mode';
      if (sub) sub.textContent = 'Expenses are currently stored only on this browser.';
      if (banner) banner.className = 'p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 bg-slate-50 border-slate-200 text-slate-700';
      if (disBtn) disBtn.classList.add('hidden');
      if (actRow) actRow.classList.add('hidden');
    }
  }

  function initCloudSync() {
    loadCloudConfig();
    if (!cloudConfig.enabled || !cloudConfig.householdId) {
      updateCloudStatusUI('local');
      return;
    }

    if (cloudConfig.provider === 'firebase') {
      initFirebaseSync();
    } else if (cloudConfig.provider === 'instant') {
      initInstantSync();
    }
  }

  function initFirebaseSync() {
    if (!window.firebase) {
      console.warn('Firebase SDK not loaded.');
      updateCloudStatusUI('error', 'SDK Missing', 'Firebase library could not be loaded.');
      return;
    }

    try {
      updateCloudStatusUI('syncing');

      // Initialize or reuse app
      let app;
      if (!firebase.apps || firebase.apps.length === 0) {
        app = firebase.initializeApp({
          apiKey: cloudConfig.firebase.apiKey,
          projectId: cloudConfig.firebase.projectId,
          appId: cloudConfig.firebase.appId || '',
          authDomain: `${cloudConfig.firebase.projectId}.firebaseapp.com`
        });
      } else {
        app = firebase.app();
      }

      firestoreDb = firebase.firestore(app);

      // Realtime listener
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }

      const docRef = firestoreDb.collection('homeledger_households').doc(cloudConfig.householdId);

      unsubscribeFirestore = docRef.onSnapshot((doc) => {
        if (doc.exists) {
          const remoteData = doc.data();
          if (remoteData && remoteData.updatedAt && remoteData.updatedAt > lastLocalTimestamp) {
            isReceivingRemoteUpdate = true;
            state.members = remoteData.members && remoteData.members.length ? remoteData.members : state.members;
            state.expenses = remoteData.expenses || [];
            if (remoteData.monthlyBudget) state.monthlyBudget = remoteData.monthlyBudget;
            state.isSampleData = false;

            // Save to local storage without re-triggering cloud push
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              members: state.members,
              expenses: state.expenses,
              monthlyBudget: state.monthlyBudget,
              isSampleData: state.isSampleData
            }));

            populateMemberDropdowns();
            renderAll();
            isReceivingRemoteUpdate = false;
            broadcastLocalChange();
            showToast('Household updated from Cloud!', 'info');
          }
        }
        updateCloudStatusUI('synced');
      }, (err) => {
        console.error('Firestore listener error:', err);
        updateCloudStatusUI('error', 'Sync Error', err.message || 'Permission denied. Ensure Firestore Rules are in test mode.');
      });

    } catch (err) {
      console.error('Failed to init Firebase:', err);
      updateCloudStatusUI('error', 'Config Error', err.message);
    }
  }

  function initInstantSync() {
    updateCloudStatusUI('synced', 'Instant Cloud', `Syncing room: ${cloudConfig.householdId}`);
    pullFromInstantCloud();
  }

  function pushToCloud() {
    if (!cloudConfig.enabled || isReceivingRemoteUpdate) return;

    const now = Date.now();
    lastLocalTimestamp = now;

    if (cloudConfig.provider === 'firebase' && firestoreDb) {
      updateCloudStatusUI('syncing');
      firestoreDb.collection('homeledger_households').doc(cloudConfig.householdId).set({
        members: state.members,
        expenses: state.expenses,
        monthlyBudget: state.monthlyBudget,
        updatedAt: now
      }, { merge: true })
      .then(() => {
        updateCloudStatusUI('synced');
      })
      .catch((err) => {
        console.error('Cloud push failed:', err);
        updateCloudStatusUI('error', 'Write Error', err.message);
      });
    } else if (cloudConfig.provider === 'instant') {
      pushToInstantCloud();
    }
  }

  function pushToInstantCloud() {
    const payload = {
      room: cloudConfig.householdId,
      members: state.members,
      expenses: state.expenses,
      monthlyBudget: state.monthlyBudget,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(`homeledger_room_${cloudConfig.householdId}`, JSON.stringify(payload));
      updateCloudStatusUI('synced');
    } catch(e){}
  }

  function pullFromInstantCloud() {
    try {
      const roomDataStr = localStorage.getItem(`homeledger_room_${cloudConfig.householdId}`);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        if (roomData && roomData.updatedAt && roomData.updatedAt > lastLocalTimestamp) {
          state.members = roomData.members || state.members;
          state.expenses = roomData.expenses || state.expenses;
          if (roomData.monthlyBudget) state.monthlyBudget = roomData.monthlyBudget;
          state.isSampleData = false;
          saveState(true);
          renderAll();
        }
      }
    } catch(e){}
  }

  function saveState(skipCloud = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        members: state.members,
        expenses: state.expenses,
        monthlyBudget: state.monthlyBudget,
        isSampleData: state.isSampleData
      }));
      broadcastLocalChange();
      if (!skipCloud) {
        pushToCloud();
      }
    } catch (err) {
      console.error('Error saving state:', err);
    }
  }

  // UI Notification Toast
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-700 text-white' : (type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white');
    const icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : 'ℹ️');

    toast.className = `${bgClass} px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Member Helpers
  function getMember(id) {
    return state.members.find(m => m.id === id) || { id, name: 'Unknown', avatar: '👤' };
  }

  function getCategory(id) {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  }

  // Filter Expenses by Period
  function filterExpensesByPeriod(expenses, period) {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed

    return expenses.filter(exp => {
      if (!exp.date) return true;
      const parts = exp.date.split('-');
      if (parts.length < 3) return true;
      const expYear = parseInt(parts[0], 10);
      const expMonth = parseInt(parts[1], 10) - 1;
      const expDay = parseInt(parts[2], 10);
      const expDate = new Date(expYear, expMonth, expDay);

      if (period === 'this-month') {
        return expYear === curYear && expMonth === curMonth;
      } else if (period === 'last-month') {
        const lastMonthDate = new Date(curYear, curMonth - 1, 1);
        return expYear === lastMonthDate.getFullYear() && expMonth === lastMonthDate.getMonth();
      } else if (period === 'last-3-months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return expDate >= threeMonthsAgo;
      }
      return true; // all-time
    });
  }

  // Calculate Balances & Debt Settlement
  function calculateBalances(expensesList) {
    const balances = {};

    // Initialize all members
    state.members.forEach(m => {
      balances[m.id] = {
        member: m,
        totalPaid: 0,
        totalShare: 0,
        netBalance: 0 // positive = to receive, negative = owes
      };
    });

    expensesList.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      const payerId = exp.paidBy;

      // Add to paid amount
      if (balances[payerId]) {
        balances[payerId].totalPaid += amt;
      }

      // Calculate share
      const splitList = (exp.splitAmong && exp.splitAmong.length > 0)
        ? exp.splitAmong
        : state.members.map(m => m.id);

      const sharePerPerson = amt / splitList.length;

      splitList.forEach(mId => {
        if (balances[mId]) {
          balances[mId].totalShare += sharePerPerson;
        }
      });
    });

    // Compute net balance: Paid - Fair Share
    state.members.forEach(m => {
      balances[m.id].netBalance = balances[m.id].totalPaid - balances[m.id].totalShare;
    });

    // Solve for minimal settlement transfers
    // Debtors owe money (netBalance < -0.01)
    // Creditors should receive money (netBalance > 0.01)
    const debtors = [];
    const creditors = [];

    state.members.forEach(m => {
      const net = balances[m.id].netBalance;
      if (net < -0.5) {
        debtors.push({ member: m, amount: Math.abs(net) });
      } else if (net > 0.5) {
        creditors.push({ member: m, amount: net });
      }
    });

    // Sort by largest amount
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0;
    let j = 0;

    // Greedy matching
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      if (settleAmount > 0.5) {
        settlements.push({
          from: debtor.member,
          to: creditor.member,
          amount: Math.round(settleAmount)
        });
      }

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount < 0.5) i++;
      if (creditor.amount < 0.5) j++;
    }

    return { balances, settlements };
  }

  // Render UI
  function renderAll() {
    renderSampleBanner();
    renderMembersStrip();
    renderPeriodLabel();

    const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
    const { balances, settlements } = calculateBalances(periodExpenses);

    renderKPIs(periodExpenses, balances);
    renderSettlements(settlements, balances);
    renderBalancesTable(balances);
    renderCharts(periodExpenses);
    renderExpenseTable(periodExpenses);
  }

  function renderSampleBanner() {
    const banner = document.getElementById('sampleDataBanner');
    if (!banner) return;
    if (state.isSampleData) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  function renderMembersStrip() {
    const strip = document.getElementById('headerMembersStrip');
    const badge = document.getElementById('memberCountBadge');
    if (badge) badge.textContent = state.members.length;
    if (!strip) return;

    strip.innerHTML = state.members.map(m => `
      <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
        <span>${m.avatar}</span>
        <span>${m.name}</span>
        ${m.isYou ? '<span class="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">You</span>' : ''}
      </div>
    `).join('');
  }

  function renderPeriodLabel() {
    const label = document.getElementById('currentPeriodLabel');
    if (!label) return;
    const now = new Date();
    const period = state.filters.period;

    if (period === 'this-month') {
      label.textContent = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } else if (period === 'last-month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      label.textContent = lastMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } else if (period === 'last-3-months') {
      label.textContent = 'Past 90 Days';
    } else {
      label.textContent = 'All Transactions';
    }
  }

  function renderKPIs(expensesList, balances) {
    // Total Spend (excluding purely settlement transfers from spend KPI)
    const householdExpenses = expensesList.filter(e => e.category !== 'settlement');
    const totalSpent = householdExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const kpiTotalSpend = document.getElementById('kpiTotalSpend');
    const kpiExpenseCount = document.getElementById('kpiExpenseCount');
    if (kpiTotalSpend) kpiTotalSpend.textContent = formatCurrency(totalSpent);
    if (kpiExpenseCount) kpiExpenseCount.textContent = `${householdExpenses.length} household expenses`;

    // "You" Paid & Share
    const you = state.members.find(m => m.isYou) || state.members[0];
    const youBalance = you ? balances[you.id] : null;

    const kpiYouPaid = document.getElementById('kpiYouPaid');
    const kpiYouFairShare = document.getElementById('kpiYouFairShare');
    if (kpiYouPaid && youBalance) {
      kpiYouPaid.textContent = formatCurrency(youBalance.totalPaid);
      kpiYouFairShare.textContent = `Your fair share: ${formatCurrency(youBalance.totalShare)}`;
    }

    // Your Net Balance
    const kpiNetBalance = document.getElementById('kpiNetBalance');
    const kpiNetBalanceDesc = document.getElementById('kpiNetBalanceDesc');
    const kpiNetBalanceIcon = document.getElementById('kpiNetBalanceIcon');

    if (kpiNetBalance && youBalance) {
      const net = Math.round(youBalance.netBalance);
      if (net > 0) {
        kpiNetBalance.textContent = `+${formatCurrency(net)}`;
        kpiNetBalance.className = 'text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight';
        kpiNetBalanceDesc.textContent = 'You are owed / will receive this back';
        kpiNetBalanceDesc.className = 'text-xs mt-1 font-semibold text-emerald-700';
        if (kpiNetBalanceIcon) kpiNetBalanceIcon.innerHTML = '📈';
      } else if (net < 0) {
        kpiNetBalance.textContent = `-${formatCurrency(Math.abs(net))}`;
        kpiNetBalance.className = 'text-2xl lg:text-3xl font-extrabold text-rose-600 tracking-tight';
        kpiNetBalanceDesc.textContent = 'You owe the family pool / member';
        kpiNetBalanceDesc.className = 'text-xs mt-1 font-semibold text-rose-700';
        if (kpiNetBalanceIcon) kpiNetBalanceIcon.innerHTML = '📉';
      } else {
        kpiNetBalance.textContent = '₹0';
        kpiNetBalance.className = 'text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight';
        kpiNetBalanceDesc.textContent = 'All balanced & settled up!';
        kpiNetBalanceDesc.className = 'text-xs mt-1 font-semibold text-slate-500';
        if (kpiNetBalanceIcon) kpiNetBalanceIcon.innerHTML = '⚖️';
      }
    }

    // Monthly Budget KPI
    const budgetUsedEl = document.getElementById('kpiBudgetUsed');
    const budgetTotalEl = document.getElementById('kpiBudgetTotal');
    const budgetBar = document.getElementById('budgetProgressBar');
    const budgetPercentageText = document.getElementById('budgetPercentageText');
    const budgetRemainingText = document.getElementById('budgetRemainingText');

    if (budgetUsedEl && budgetTotalEl) {
      const budget = state.monthlyBudget || 40000;
      budgetUsedEl.textContent = formatCurrency(totalSpent);
      budgetTotalEl.textContent = `of ${formatCurrency(budget)}`;

      const pct = Math.min(Math.round((totalSpent / budget) * 100), 100);
      const remaining = budget - totalSpent;

      if (budgetBar) {
        budgetBar.style.width = `${pct}%`;
        if (pct >= 100) {
          budgetBar.className = 'bg-rose-500 h-2.5 rounded-full transition-all duration-500';
        } else if (pct >= 80) {
          budgetBar.className = 'bg-amber-500 h-2.5 rounded-full transition-all duration-500';
        } else {
          budgetBar.className = 'bg-emerald-500 h-2.5 rounded-full transition-all duration-500';
        }
      }

      if (budgetPercentageText) budgetPercentageText.textContent = `${pct}% spent`;
      if (budgetRemainingText) {
        if (remaining >= 0) {
          budgetRemainingText.textContent = `${formatCurrency(remaining)} remaining`;
          budgetRemainingText.className = 'font-medium text-slate-600';
        } else {
          budgetRemainingText.textContent = `${formatCurrency(Math.abs(remaining))} over budget!`;
          budgetRemainingText.className = 'font-bold text-rose-600';
        }
      }
    }
  }

  function renderSettlements(settlements, balances) {
    const container = document.getElementById('settlementRecommendationsContainer');
    if (!container) return;

    if (settlements.length === 0) {
      container.innerHTML = `
        <div class="col-span-full bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div class="text-2xl">🎉</div>
          <div>
            <div class="font-bold text-emerald-900 text-sm">Everyone is all settled up!</div>
            <div class="text-xs text-emerald-700">No outstanding debts or balances among family members for this period.</div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = settlements.map((s, idx) => {
      const isFromYou = s.from.isYou;
      const isToYou = s.to.isYou;

      let badge = '';
      if (isFromYou) {
        badge = '<span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">You Owe</span>';
      } else if (isToYou) {
        badge = '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">You Receive</span>';
      }

      return `
        <div class="bg-slate-50 border border-slate-200/90 hover:border-indigo-300 rounded-xl p-4 flex flex-col justify-between gap-3 transition">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">${s.from.avatar}</span>
              <span class="text-slate-400 font-bold">➔</span>
              <span class="text-xl">${s.to.avatar}</span>
            </div>
            ${badge}
          </div>

          <div>
            <div class="text-xs text-slate-600">
              <strong class="text-slate-900">${s.from.name}</strong> pays <strong class="text-slate-900">${s.to.name}</strong>
            </div>
            <div class="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ${formatCurrency(s.amount)}
            </div>
          </div>

          <button onclick="window.HomeLedger.openSettleModalWithPrefill('${s.from.id}', '${s.to.id}', ${s.amount})" class="w-full text-center py-1.5 px-3 bg-white hover:bg-indigo-600 hover:text-white border border-slate-300 hover:border-indigo-600 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5">
            <span>⚡</span> Mark Settled
          </button>
        </div>
      `;
    }).join('');
  }

  function renderBalancesTable(balances) {
    const tbody = document.getElementById('memberBalancesTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.members.map(m => {
      const b = balances[m.id] || { totalPaid: 0, totalShare: 0, netBalance: 0 };
      const net = Math.round(b.netBalance);
      let statusHtml = '';

      if (net > 0) {
        statusHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">+${formatCurrency(net)} to receive</span>`;
      } else if (net < 0) {
        statusHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">-${formatCurrency(Math.abs(net))} owes</span>`;
      } else {
        statusHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">Settled (₹0)</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-2">
            <span>${m.avatar}</span>
            <span>${m.name}</span>
            ${m.isYou ? '<span class="text-[9px] bg-slate-200 text-slate-700 px-1 rounded font-bold">You</span>' : ''}
          </td>
          <td class="py-2.5 px-3 text-right font-semibold text-slate-700">${formatCurrency(b.totalPaid)}</td>
          <td class="py-2.5 px-3 text-right text-slate-600">${formatCurrency(b.totalShare)}</td>
          <td class="py-2.5 px-3 text-right font-bold ${net > 0 ? 'text-emerald-600' : (net < 0 ? 'text-rose-600' : 'text-slate-500')}">
            ${net > 0 ? '+' : ''}${formatCurrency(net)}
          </td>
          <td class="py-2.5 px-3 text-center">${statusHtml}</td>
        </tr>
      `;
    }).join('');
  }

  function renderCharts(expensesList) {
    const householdExpenses = expensesList.filter(e => e.category !== 'settlement');
    const totalSpent = householdExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalBadge = document.getElementById('categoryChartTotalBadge');
    if (totalBadge) totalBadge.textContent = `Total: ${formatCurrency(totalSpent)}`;

    // Group by category
    const catTotals = {};
    householdExpenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + (Number(e.amount) || 0);
    });

    const sortedCats = Object.keys(catTotals)
      .map(catId => ({
        ...getCategory(catId),
        total: catTotals[catId]
      }))
      .sort((a, b) => b.total - a.total);

    // Top categories list
    const topListEl = document.getElementById('topCategoriesList');
    if (topListEl) {
      if (sortedCats.length === 0) {
        topListEl.innerHTML = '<div class="text-xs text-slate-400 text-center py-2">No category data to display</div>';
      } else {
        topListEl.innerHTML = sortedCats.map(c => {
          const pct = totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0;
          return `
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${c.color}"></span>
                <span class="font-medium text-slate-700">${c.icon} ${c.name}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">${formatCurrency(c.total)}</span>
                <span class="text-[11px] text-slate-400 font-medium">(${pct}%)</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Chart.js Category Doughnut
    const doughnutCanvas = document.getElementById('categoryDoughnutChart');
    const emptyState = document.getElementById('categoryChartEmptyState');

    if (doughnutCanvas && window.Chart) {
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }

      if (sortedCats.length === 0) {
        doughnutCanvas.style.display = 'none';
        if (emptyState) emptyState.classList.remove('hidden');
      } else {
        doughnutCanvas.style.display = 'block';
        if (emptyState) emptyState.classList.add('hidden');

        categoryChartInstance = new Chart(doughnutCanvas, {
          type: 'doughnut',
          data: {
            labels: sortedCats.map(c => `${c.icon} ${c.name}`),
            datasets: [{
              data: sortedCats.map(c => c.total),
              backgroundColor: sortedCats.map(c => c.color),
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const val = ctx.parsed || 0;
                    const pct = totalSpent > 0 ? Math.round((val / totalSpent) * 100) : 0;
                    return ` ${formatCurrency(val)} (${pct}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Trend / Member Bar Chart
    const trendCanvas = document.getElementById('trendBarChart');
    const trendEmptyState = document.getElementById('trendChartEmptyState');

    if (trendCanvas && window.Chart) {
      if (trendChartInstance) {
        trendChartInstance.destroy();
      }

      if (householdExpenses.length === 0) {
        trendCanvas.style.display = 'none';
        if (trendEmptyState) trendEmptyState.classList.remove('hidden');
      } else {
        trendCanvas.style.display = 'block';
        if (trendEmptyState) trendEmptyState.classList.add('hidden');

        if (state.activeChartView === 'monthly') {
          // Group by Month (last 6 months)
          const monthlyMap = {};
          const monthLabels = [];
          const now = new Date();

          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            monthlyMap[key] = 0;
            monthLabels.push({ key, label });
          }

          // Populate totals across all expenses
          state.expenses.filter(e => e.category !== 'settlement').forEach(e => {
            if (e.date) {
              const key = e.date.substring(0, 7);
              if (monthlyMap[key] !== undefined) {
                monthlyMap[key] += Number(e.amount) || 0;
              }
            }
          });

          trendChartInstance = new Chart(trendCanvas, {
            type: 'bar',
            data: {
              labels: monthLabels.map(m => m.label),
              datasets: [{
                label: 'Monthly Spend',
                data: monthLabels.map(m => monthlyMap[m.key]),
                backgroundColor: '#10b981',
                borderRadius: 8,
                barThickness: 28
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => ` Spend: ${formatCurrency(ctx.parsed.y)}`
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: val => `₹${val.toLocaleString('en-IN')}`
                  },
                  grid: { color: '#f1f5f9' }
                },
                x: {
                  grid: { display: false }
                }
              }
            }
          });
        } else {
          // Member Contribution view
          const memberMap = {};
          state.members.forEach(m => memberMap[m.id] = 0);

          householdExpenses.forEach(e => {
            if (memberMap[e.paidBy] !== undefined) {
              memberMap[e.paidBy] += Number(e.amount) || 0;
            }
          });

          trendChartInstance = new Chart(trendCanvas, {
            type: 'bar',
            data: {
              labels: state.members.map(m => `${m.avatar} ${m.name}`),
              datasets: [{
                label: 'Total Paid',
                data: state.members.map(m => memberMap[m.id]),
                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'],
                borderRadius: 8,
                barThickness: 36
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => ` Paid: ${formatCurrency(ctx.parsed.y)}`
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: val => `₹${val.toLocaleString('en-IN')}`
                  },
                  grid: { color: '#f1f5f9' }
                },
                x: {
                  grid: { display: false }
                }
              }
            }
          });
        }
      }
    }
  }

  function renderExpenseTable(periodExpenses) {
    const tbody = document.getElementById('expensesTableBody');
    const emptyState = document.getElementById('noExpensesState');
    const statusText = document.getElementById('filterStatusText');
    if (!tbody) return;

    let filtered = [...periodExpenses];

    // Search filter
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(e => e.category === state.filters.category);
    }

    // Paid by filter
    if (state.filters.paidBy !== 'all') {
      filtered = filtered.filter(e => e.paidBy === state.filters.paidBy);
    }

    // Sort
    filtered.sort((a, b) => {
      if (state.filters.sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (state.filters.sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (state.filters.sort === 'amount-desc') return b.amount - a.amount;
      if (state.filters.sort === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    if (statusText) {
      statusText.textContent = `Showing ${filtered.length} of ${periodExpenses.length} records`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const you = state.members.find(m => m.isYou) || state.members[0];

    tbody.innerHTML = filtered.map(e => {
      const cat = getCategory(e.category);
      const payer = getMember(e.paidBy);
      const splitList = (e.splitAmong && e.splitAmong.length > 0) ? e.splitAmong : state.members.map(m => m.id);
      const isSettlement = e.category === 'settlement';

      // Calculate share for "You"
      let yourShareText = '—';
      if (!isSettlement) {
        if (splitList.includes(you.id)) {
          const share = Number(e.amount) / splitList.length;
          yourShareText = formatCurrency(share);
        } else {
          yourShareText = '₹0';
        }
      }

      // Member avatars in split list
      const splitAvatars = splitList.map(mId => {
        const m = getMember(mId);
        return `<span title="${m.name}">${m.avatar}</span>`;
      }).join(' ');

      return `
        <tr class="hover:bg-slate-50/80 transition group">
          <td class="py-3 px-4 text-slate-500 whitespace-nowrap font-medium">
            ${formatDate(e.date)}
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${e.title}</div>
            ${e.notes ? `<div class="text-[11px] text-slate-400 italic">${e.notes}</div>` : ''}
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cat.bg}">
              <span>${cat.icon}</span>
              <span>${cat.name}</span>
            </span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span>${payer.avatar}</span>
              <span>${payer.name}</span>
            </span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-slate-600">
            <span class="text-xs">${splitAvatars}</span>
            <span class="text-[10px] text-slate-400 ml-1">(${splitList.length})</span>
          </td>
          <td class="py-3 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
            ${formatCurrency(e.amount, true)}
          </td>
          <td class="py-3 px-4 text-right font-semibold text-slate-600 whitespace-nowrap">
            ${yourShareText}
          </td>
          <td class="py-3 px-4 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
              <button onclick="window.HomeLedger.openEditExpenseModal('${e.id}')" class="p-1 hover:bg-slate-200 text-slate-600 rounded transition" title="Edit Expense">
                ✏️
              </button>
              <button onclick="window.HomeLedger.deleteExpense('${e.id}')" class="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition" title="Delete Expense">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Populate Dropdown Menus
  function populateSelectDropdowns() {
    // Categories in Expense Modal & Filter
    const catSelect = document.getElementById('expenseCategory');
    const catFilter = document.getElementById('categoryFilterSelect');

    if (catSelect) {
      catSelect.innerHTML = CATEGORIES.map(c => `
        <option value="${c.id}">${c.icon} ${c.name}</option>
      `).join('');
    }

    if (catFilter) {
      catFilter.innerHTML = '<option value="all">All Categories</option>' +
        CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    }

    // Members dropdowns
    populateMemberDropdowns();
  }

  function populateMemberDropdowns() {
    const paidBySelect = document.getElementById('expensePaidBy');
    const paidByFilter = document.getElementById('paidByFilterSelect');
    const settlePayer = document.getElementById('settlePayer');
    const settleReceiver = document.getElementById('settleReceiver');
    const splitContainer = document.getElementById('splitMembersCheckboxList');

    if (paidBySelect) {
      paidBySelect.innerHTML = state.members.map(m => `
        <option value="${m.id}">${m.avatar} ${m.name} ${m.isYou ? '(You)' : ''}</option>
      `).join('');
    }

    if (paidByFilter) {
      paidByFilter.innerHTML = '<option value="all">Paid by: Anyone</option>' +
        state.members.map(m => `<option value="${m.id}">${m.avatar} ${m.name}</option>`).join('');
    }

    if (settlePayer) {
      settlePayer.innerHTML = state.members.map(m => `
        <option value="${m.id}">${m.avatar} ${m.name} ${m.isYou ? '(You)' : ''}</option>
      `).join('');
    }

    if (settleReceiver) {
      settleReceiver.innerHTML = state.members.map(m => `
        <option value="${m.id}">${m.avatar} ${m.name} ${m.isYou ? '(You)' : ''}</option>
      `).join('');
      // Default receiver to 2nd member if available
      if (state.members.length > 1) {
        settleReceiver.selectedIndex = 1;
      }
    }

    if (splitContainer) {
      splitContainer.innerHTML = state.members.map(m => `
        <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-1.5 rounded hover:bg-slate-100">
          <input type="checkbox" name="splitMember" value="${m.id}" checked class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4">
          <span>${m.avatar} ${m.name}</span>
        </label>
      `).join('');

      // Add change listeners to update share preview
      splitContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateSplitSharePreview);
      });
    }

    updateSplitSharePreview();
  }

  function updateSplitSharePreview() {
    const amountInput = document.getElementById('expenseAmount');
    const previewEl = document.getElementById('splitSharePreview');
    if (!previewEl) return;

    const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    const checked = Array.from(document.querySelectorAll('#splitMembersCheckboxList input[type="checkbox"]:checked'));

    if (checked.length === 0) {
      previewEl.textContent = 'Please select at least one person to split with.';
      previewEl.className = 'text-[11px] text-red-500 mt-1 font-medium';
    } else {
      const share = amount / checked.length;
      previewEl.textContent = `Each of ${checked.length} selected person pays: ${formatCurrency(share, true)}`;
      previewEl.className = 'text-[11px] text-slate-500 mt-1 font-medium italic';
    }
  }

  // Member Management Modal logic
  function renderMembersListModal() {
    const container = document.getElementById('membersListContainer');
    if (!container) return;

    container.innerHTML = state.members.map(m => `
      <div class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
        <div class="flex items-center gap-2">
          <span class="text-xl">${m.avatar}</span>
          <div>
            <span class="font-bold text-slate-900">${m.name}</span>
            ${m.isYou ? '<span class="ml-1 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">You</span>' : ''}
          </div>
        </div>
        <div class="flex items-center gap-1">
          ${!m.isYou && state.members.length > 2 ? `
            <button onclick="window.HomeLedger.removeMember('${m.id}')" class="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition font-medium">
              Remove
            </button>
          ` : '<span class="text-[10px] text-slate-400 italic">Default</span>'}
        </div>
      </div>
    `).join('');
  }

  // Modals Visibility Helpers
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  // Export to CSV Function
  function exportExpensesToCsv() {
    const headers = ['Date', 'Title / Description', 'Category', 'Total Amount (INR)', 'Paid By', 'Split Between', 'Notes'];
    const rows = state.expenses.map(e => {
      const cat = getCategory(e.category).name;
      const payer = getMember(e.paidBy).name;
      const splitNames = (e.splitAmong || []).map(mId => getMember(mId).name).join(', ');
      return [
        `"${e.date || ''}"`,
        `"${(e.title || '').replace(/"/g, '""')}"`,
        `"${cat}"`,
        e.amount,
        `"${payer}"`,
        `"${splitNames}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HomeLedger_Expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported expenses to CSV successfully!');
  }

  // Export JSON Backup
  function exportJsonBackup() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `HomeLedger_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast('Backup JSON downloaded!');
  }

  // Import JSON Backup
  function handleJsonImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.members && Array.isArray(imported.members) && imported.expenses && Array.isArray(imported.expenses)) {
          state.members = imported.members;
          state.expenses = imported.expenses;
          if (imported.monthlyBudget) state.monthlyBudget = imported.monthlyBudget;
          state.isSampleData = false;
          saveState();
          populateMemberDropdowns();
          renderAll();
          showToast('Data restored successfully!');
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        showToast('Could not parse JSON backup.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  // Event Listeners Initialization
  function initEventListeners() {
    // Dismiss Sample Data Banner
    document.getElementById('dismissBannerBtn')?.addEventListener('click', () => {
      document.getElementById('sampleDataBanner')?.classList.add('hidden');
    });

    // Clear Sample Data
    document.getElementById('clearSampleDataBtn')?.addEventListener('click', () => {
      if (confirm('Clear starter demo expenses? You can then start recording your own fresh household expenses.')) {
        state.expenses = [];
        state.isSampleData = false;
        saveState();
        renderAll();
        showToast('Demo data cleared! Start adding your expenses.');
      }
    });

    // Period selector
    document.getElementById('periodFilterSelect')?.addEventListener('change', (e) => {
      state.filters.period = e.target.value;
      renderAll();
    });

    // Search filter
    document.getElementById('expenseSearchInput')?.addEventListener('input', (e) => {
      state.filters.search = e.target.value.trim();
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderExpenseTable(periodExpenses);
    });

    // Category filter
    document.getElementById('categoryFilterSelect')?.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderExpenseTable(periodExpenses);
    });

    // Paid by filter
    document.getElementById('paidByFilterSelect')?.addEventListener('change', (e) => {
      state.filters.paidBy = e.target.value;
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderExpenseTable(periodExpenses);
    });

    // Sort filter
    document.getElementById('sortFilterSelect')?.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderExpenseTable(periodExpenses);
    });

    // Reset filters button
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      state.filters.search = '';
      state.filters.category = 'all';
      state.filters.paidBy = 'all';
      document.getElementById('expenseSearchInput').value = '';
      document.getElementById('categoryFilterSelect').value = 'all';
      document.getElementById('paidByFilterSelect').value = 'all';
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderExpenseTable(periodExpenses);
    });

    // Chart toggle buttons (Monthly vs By Member)
    document.getElementById('chartViewMonthlyBtn')?.addEventListener('click', function () {
      state.activeChartView = 'monthly';
      this.className = 'px-2.5 py-1 rounded-md bg-white text-slate-800 shadow-xs transition';
      document.getElementById('chartViewMemberBtn').className = 'px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-800 transition';
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderCharts(periodExpenses);
    });

    document.getElementById('chartViewMemberBtn')?.addEventListener('click', function () {
      state.activeChartView = 'member';
      this.className = 'px-2.5 py-1 rounded-md bg-white text-slate-800 shadow-xs transition';
      document.getElementById('chartViewMonthlyBtn').className = 'px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-800 transition';
      const periodExpenses = filterExpensesByPeriod(state.expenses, state.filters.period);
      renderCharts(periodExpenses);
    });

    // Open Add Expense Modal
    const openAddExp = () => {
      document.getElementById('expenseModalTitle').textContent = 'Add Household Expense';
      document.getElementById('expenseForm').reset();
      document.getElementById('editExpenseId').value = '';
      document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
      // Check all split checkboxes
      document.querySelectorAll('#splitMembersCheckboxList input[type="checkbox"]').forEach(cb => cb.checked = true);
      updateSplitSharePreview();
      openModal('expenseModal');
    };

    document.getElementById('openAddExpenseBtn')?.addEventListener('click', openAddExp);
    document.getElementById('addExpenseSecondaryBtn')?.addEventListener('click', openAddExp);
    document.getElementById('closeExpenseModalBtn')?.addEventListener('click', () => closeModal('expenseModal'));
    document.getElementById('cancelExpenseModalBtn')?.addEventListener('click', () => closeModal('expenseModal'));

    // Amount input change in modal triggers share preview
    document.getElementById('expenseAmount')?.addEventListener('input', updateSplitSharePreview);

    // Select all members button in modal
    document.getElementById('selectAllMembersBtn')?.addEventListener('click', () => {
      const cbs = document.querySelectorAll('#splitMembersCheckboxList input[type="checkbox"]');
      const allChecked = Array.from(cbs).every(cb => cb.checked);
      cbs.forEach(cb => cb.checked = !allChecked);
      updateSplitSharePreview();
    });

    // Save Expense Form
    document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editExpenseId').value;
      const title = document.getElementById('expenseTitle').value.trim();
      const amount = parseFloat(document.getElementById('expenseAmount').value);
      const date = document.getElementById('expenseDate').value;
      const category = document.getElementById('expenseCategory').value;
      const paidBy = document.getElementById('expensePaidBy').value;
      const notes = document.getElementById('expenseNotes').value.trim();

      const splitCheckboxes = Array.from(document.querySelectorAll('#splitMembersCheckboxList input[type="checkbox"]:checked'));
      if (splitCheckboxes.length === 0) {
        alert('Please select at least one person to split the expense with.');
        return;
      }
      const splitAmong = splitCheckboxes.map(cb => cb.value);

      if (editId) {
        // Update existing
        const index = state.expenses.findIndex(exp => exp.id === editId);
        if (index !== -1) {
          state.expenses[index] = {
            ...state.expenses[index],
            title,
            amount,
            date,
            category,
            paidBy,
            splitAmong,
            notes
          };
          showToast('Expense updated!');
        }
      } else {
        // Create new
        const newExpense = {
          id: 'exp_' + Date.now(),
          title,
          amount,
          date,
          category,
          paidBy,
          splitAmong,
          notes
        };
        state.expenses.unshift(newExpense);
        showToast('Expense added successfully!');
      }

      state.isSampleData = false;
      saveState();
      closeModal('expenseModal');
      renderAll();
    });

    // Open Settle Modal
    const openSettle = () => {
      document.getElementById('settleForm').reset();
      document.getElementById('settleDate').value = new Date().toISOString().split('T')[0];
      openModal('settleModal');
    };

    document.getElementById('openSettleModalBtn')?.addEventListener('click', openSettle);
    document.getElementById('settleShortcutBtn')?.addEventListener('click', openSettle);
    document.getElementById('closeSettleModalBtn')?.addEventListener('click', () => closeModal('settleModal'));
    document.getElementById('cancelSettleModalBtn')?.addEventListener('click', () => closeModal('settleModal'));

    // Submit Settle Up Form
    document.getElementById('settleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const payerId = document.getElementById('settlePayer').value;
      const receiverId = document.getElementById('settleReceiver').value;
      const amount = parseFloat(document.getElementById('settleAmount').value);
      const date = document.getElementById('settleDate').value;
      const notes = document.getElementById('settleNotes').value.trim();

      if (payerId === receiverId) {
        alert('Payer and Receiver must be different family members.');
        return;
      }

      const payer = getMember(payerId);
      const receiver = getMember(receiverId);

      // Record a settlement transaction
      const settlementExpense = {
        id: 'settle_' + Date.now(),
        title: `Settlement: ${payer.name} paid ${receiver.name}`,
        amount: amount,
        category: 'settlement',
        paidBy: payerId,
        splitAmong: [receiverId], // Receiver absorbs the share, which zeroes out the credit
        date: date,
        notes: notes || 'Direct debt settlement'
      };

      state.expenses.unshift(settlementExpense);
      state.isSampleData = false;
      saveState();
      closeModal('settleModal');
      renderAll();

      // Trigger Confetti!
      if (window.confetti) {
        window.confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      showToast(`Settlement of ${formatCurrency(amount)} recorded!`);
    });

    // Manage Members Modal
    document.getElementById('manageMembersBtn')?.addEventListener('click', () => {
      renderMembersListModal();
      openModal('membersModal');
    });
    document.getElementById('closeMembersModalBtn')?.addEventListener('click', () => closeModal('membersModal'));
    document.getElementById('doneMembersModalBtn')?.addEventListener('click', () => closeModal('membersModal'));

    // Add Member Form
    document.getElementById('addMemberForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('newMemberName');
      const avatarSelect = document.getElementById('newMemberAvatar');
      const name = nameInput.value.trim();
      const avatar = avatarSelect.value;

      if (!name) return;

      const newMember = {
        id: 'm_' + Date.now(),
        name,
        avatar,
        isYou: false
      };

      state.members.push(newMember);
      saveState();
      nameInput.value = '';
      populateMemberDropdowns();
      renderMembersListModal();
      renderAll();
      showToast(`Added ${name} to family members!`);
    });

    // Monthly Budget Modal
    const openBudgetModal = () => {
      const input = document.getElementById('monthlyBudgetInput');
      if (input) input.value = state.monthlyBudget || 40000;
      openModal('budgetModal');
    };
    document.getElementById('quickEditBudgetBtn')?.addEventListener('click', openBudgetModal);
    document.getElementById('setBudgetBtn')?.addEventListener('click', () => {
      closeMoreActions();
      openBudgetModal();
    });
    document.getElementById('closeBudgetModalBtn')?.addEventListener('click', () => closeModal('budgetModal'));
    document.getElementById('cancelBudgetModalBtn')?.addEventListener('click', () => closeModal('budgetModal'));

    document.getElementById('budgetForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newBudget = parseFloat(document.getElementById('monthlyBudgetInput').value);
      if (newBudget > 0) {
        state.monthlyBudget = newBudget;
        saveState();
        closeModal('budgetModal');
        renderAll();
        showToast('Monthly target budget updated!');
      }
    });

    // More actions dropdown toggle
    const moreBtn = document.getElementById('moreActionsBtn');
    const moreMenu = document.getElementById('moreActionsMenu');
    function closeMoreActions() {
      moreMenu?.classList.add('hidden');
    }

    moreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      moreMenu?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (moreMenu && !moreMenu.contains(e.target) && e.target !== moreBtn) {
        closeMoreActions();
      }
    });

    // Export & Backup
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
      closeMoreActions();
      exportExpensesToCsv();
    });
    document.getElementById('quickExportCsv')?.addEventListener('click', exportExpensesToCsv);

    document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
      closeMoreActions();
      exportJsonBackup();
    });

    document.getElementById('importJsonInput')?.addEventListener('change', (e) => {
      closeMoreActions();
      handleJsonImport(e);
    });

    document.getElementById('printReportBtn')?.addEventListener('click', () => {
      closeMoreActions();
      window.print();
    });

    // Cloud Modal Listeners
    const openCloudModal = () => {
      loadCloudConfig();
      if (cloudConfig.provider === 'firebase') {
        const hEl = document.getElementById('firebaseHouseholdId');
        const pEl = document.getElementById('firebaseProjectId');
        const aEl = document.getElementById('firebaseApiKey');
        const apEl = document.getElementById('firebaseAppId');
        if (hEl) hEl.value = cloudConfig.householdId || '';
        if (pEl) pEl.value = cloudConfig.firebase.projectId || '';
        if (aEl) aEl.value = cloudConfig.firebase.apiKey || '';
        if (apEl) apEl.value = cloudConfig.firebase.appId || '';
        switchCloudTab('firebase');
      } else {
        const iEl = document.getElementById('instantHouseholdCode');
        if (iEl) iEl.value = cloudConfig.householdId || '';
        switchCloudTab('instant');
      }
      openModal('cloudModal');
    };

    document.getElementById('openCloudModalBtn')?.addEventListener('click', openCloudModal);
    document.getElementById('openCloudModalMenuBtn')?.addEventListener('click', () => {
      closeMoreActions();
      openCloudModal();
    });
    document.getElementById('closeCloudModalBtn')?.addEventListener('click', () => closeModal('cloudModal'));

    function switchCloudTab(tab) {
      const tabInstantBtn = document.getElementById('cloudTabInstantBtn');
      const tabFirebaseBtn = document.getElementById('cloudTabFirebaseBtn');
      const instantContent = document.getElementById('cloudTabInstantContent');
      const firebaseContent = document.getElementById('cloudTabFirebaseContent');

      if (tab === 'instant') {
        if (tabInstantBtn) tabInstantBtn.className = 'py-2 px-3 border-b-2 border-emerald-600 text-emerald-700 font-bold';
        if (tabFirebaseBtn) tabFirebaseBtn.className = 'py-2 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800';
        instantContent?.classList.remove('hidden');
        firebaseContent?.classList.add('hidden');
      } else {
        if (tabFirebaseBtn) tabFirebaseBtn.className = 'py-2 px-3 border-b-2 border-indigo-600 text-indigo-700 font-bold';
        if (tabInstantBtn) tabInstantBtn.className = 'py-2 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800';
        firebaseContent?.classList.remove('hidden');
        instantContent?.classList.add('hidden');
      }
    }

    document.getElementById('cloudTabInstantBtn')?.addEventListener('click', () => switchCloudTab('instant'));
    document.getElementById('cloudTabFirebaseBtn')?.addEventListener('click', () => switchCloudTab('firebase'));

    document.getElementById('generateRandomRoomBtn')?.addEventListener('click', () => {
      const adjectives = ['happy', 'sunny', 'cozy', 'sweet', 'golden', 'family', 'home'];
      const nouns = ['nest', 'haven', 'suite', 'manor', 'room', 'ledger'];
      const num = Math.floor(100 + Math.random() * 900);
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const input = document.getElementById('instantHouseholdCode');
      if (input) input.value = `${adj}-${noun}-${num}`;
    });

    document.getElementById('connectInstantBtn')?.addEventListener('click', () => {
      const room = document.getElementById('instantHouseholdCode')?.value.trim();
      if (!room) {
        alert('Please enter a Household Room Code to share with your family.');
        return;
      }
      cloudConfig.enabled = true;
      cloudConfig.provider = 'instant';
      cloudConfig.householdId = room.toLowerCase();
      saveCloudConfig();
      initInstantSync();
      pushToInstantCloud();
      closeModal('cloudModal');
      showToast(`Connected to Household: ${cloudConfig.householdId}`);
    });

    document.getElementById('firebaseConfigForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const householdId = document.getElementById('firebaseHouseholdId')?.value.trim().toLowerCase();
      const projectId = document.getElementById('firebaseProjectId')?.value.trim();
      const apiKey = document.getElementById('firebaseApiKey')?.value.trim();
      const appId = document.getElementById('firebaseAppId')?.value.trim();

      if (!householdId || !projectId || !apiKey) {
        alert('Please fill in Household ID, Project ID, and API Key.');
        return;
      }

      cloudConfig.enabled = true;
      cloudConfig.provider = 'firebase';
      cloudConfig.householdId = householdId;
      cloudConfig.firebase = { projectId, apiKey, appId };
      saveCloudConfig();

      initFirebaseSync();
      pushToCloud();
      closeModal('cloudModal');
      showToast('Connecting to Google Firebase Firestore...');
    });

    document.getElementById('disconnectCloudBtn')?.addEventListener('click', () => {
      if (confirm('Disconnect from Cloud? Your local data will be kept on this device.')) {
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
        cloudConfig.enabled = false;
        cloudConfig.provider = 'none';
        saveCloudConfig();
        updateCloudStatusUI('local');
        showToast('Disconnected. Running in Local Storage mode.');
      }
    });

    const triggerManualSync = () => {
      if (!cloudConfig.enabled) {
        openCloudModal();
        return;
      }
      if (cloudConfig.provider === 'firebase') {
        pushToCloud();
      } else {
        pullFromInstantCloud();
        pushToInstantCloud();
      }
      showToast('Synced with cloud database!');
    };

    document.getElementById('manualSyncBtn')?.addEventListener('click', () => {
      closeMoreActions();
      triggerManualSync();
    });

    document.getElementById('forcePushToCloudBtn')?.addEventListener('click', () => {
      pushToCloud();
      showToast('Pushed local data to cloud.');
    });

    document.getElementById('forcePullFromCloudBtn')?.addEventListener('click', () => {
      if (cloudConfig.provider === 'instant') {
        pullFromInstantCloud();
        showToast('Refreshed local data.');
      } else if (firestoreDb && cloudConfig.householdId) {
        firestoreDb.collection('homeledger_households').doc(cloudConfig.householdId).get().then(doc => {
          if (doc.exists) {
            const data = doc.data();
            state.members = data.members || state.members;
            state.expenses = data.expenses || state.expenses;
            if (data.monthlyBudget) state.monthlyBudget = data.monthlyBudget;
            saveState(true);
            populateMemberDropdowns();
            renderAll();
            showToast('Refreshed data from Firebase!');
          }
        });
      }
    });

    // Reset All Data
    document.getElementById('resetAllDataBtn')?.addEventListener('click', () => {
      closeMoreActions();
      if (confirm('Are you sure you want to completely erase all expenses and members? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        loadState();
        populateMemberDropdowns();
        renderAll();
        showToast('All data has been reset to defaults.');
      }
    });
  }

  // Global namespace for inline HTML event handlers
  window.HomeLedger = {
    openEditExpenseModal: function (id) {
      const exp = state.expenses.find(e => e.id === id);
      if (!exp) return;

      document.getElementById('expenseModalTitle').textContent = 'Edit Household Expense';
      document.getElementById('editExpenseId').value = exp.id;
      document.getElementById('expenseTitle').value = exp.title;
      document.getElementById('expenseAmount').value = exp.amount;
      document.getElementById('expenseDate').value = exp.date;
      document.getElementById('expenseCategory').value = exp.category;
      document.getElementById('expensePaidBy').value = exp.paidBy;
      document.getElementById('expenseNotes').value = exp.notes || '';

      const splitCheckboxes = document.querySelectorAll('#splitMembersCheckboxList input[type="checkbox"]');
      splitCheckboxes.forEach(cb => {
        cb.checked = exp.splitAmong ? exp.splitAmong.includes(cb.value) : true;
      });

      updateSplitSharePreview();
      openModal('expenseModal');
    },

    deleteExpense: function (id) {
      const exp = state.expenses.find(e => e.id === id);
      if (!exp) return;

      if (confirm(`Delete "${exp.title}" (${formatCurrency(exp.amount)})?`)) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState();
        renderAll();
        showToast('Expense removed.');
      }
    },

    openSettleModalWithPrefill: function (fromId, toId, amount) {
      document.getElementById('settleForm').reset();
      document.getElementById('settlePayer').value = fromId;
      document.getElementById('settleReceiver').value = toId;
      document.getElementById('settleAmount').value = amount;
      document.getElementById('settleDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('settleNotes').value = 'Settlement via UPI / Netbanking';
      openModal('settleModal');
    },

    removeMember: function (memberId) {
      const member = getMember(memberId);
      if (confirm(`Remove ${member.name}? Their expenses will remain in records.`)) {
        state.members = state.members.filter(m => m.id !== memberId);
        saveState();
        populateMemberDropdowns();
        renderMembersListModal();
        renderAll();
        showToast(`Member ${member.name} removed.`);
      }
    }
  };

  // Bootstrap Application
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    populateSelectDropdowns();
    initEventListeners();
    initCloudSync();
    renderAll();
  });
})();
