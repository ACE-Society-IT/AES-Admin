import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  Sun,
  Moon,
  Activity,
  Layers,
  TrendingUp,
  Globe,
  Calendar,
  Users,
  Lock,
  Unlock,
  Menu,
  X,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';
import {
  supabase,
  fetchGameStateDirect,
  fetchTeamsDirect,
  phaseActionDirect,
  manageTeamDirect,
  manageStockDirect,
  manageCrisisDirect,
  updateHavenDirect,
  toggleProjectorResultsDirect
} from '../lib/supabaseGameService.js';
import { DEFAULT_TAX_HAVENS } from './constants/taxHavens.js';
import investomaniaLogo from '../assets/InvestomaniaLogo.png';
import aesLogo from '../assets/aes-logo.png';

export default function AdminPanel({ onBackToHub, onLogout }) {
  const { gameState } = useGame();
  
  // Mobile/Tablet Sidebar Window (Modal Drawer) state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Theme state: Minimalist Dual Theme (Dark Espresso vs Minimalist Warm White)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('alphaace_admin_theme') || localStorage.getItem('admin_theme_mode') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
    document.body.setAttribute('data-admin-theme', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0C0A09';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F9F8F6';
    }
    localStorage.setItem('alphaace_admin_theme', themeMode);
    localStorage.setItem('admin_theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    localStorage.setItem('alphaace_admin_theme', next);
    localStorage.setItem('admin_theme_mode', next);
  };

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation Tabs:
  // 'controls' | 'crises' | 'stocks' | 'havens' | 'rounds' | 'teams'
  const [adminTab, setAdminTab] = useState('controls');

  const [actionLoading, setActionLoading] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState('');

  // Overview Data (from /overview)
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminTeams, setAdminTeams] = useState([]);
  const [adminHavens, setAdminHavens] = useState([]);

  // Modal Dialogs
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamPasscode, setNewTeamPasscode] = useState('');
  const [newTeamBudget, setNewTeamBudget] = useState(100000);

  const [bulkBudgetValue, setBulkBudgetValue] = useState(100000);
  const [editingTeamPass, setEditingTeamPass] = useState({});
  const [editingTeamBudget, setEditingTeamBudget] = useState({});

  // Stock Filter & Form states
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stocksFilterSector, setStocksFilterSector] = useState('ALL');
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockCategory, setNewStockCategory] = useState('PSX Stock');
  const [newStockSector, setNewStockSector] = useState('Fuel & Power');
  const [newStockPrice, setNewStockPrice] = useState(100);
  const [newStockDesc, setNewStockDesc] = useState('');
  const [editingStockPrices, setEditingStockPrices] = useState({});

  // Crisis Authoring Studio State
  const [crisisRound, setCrisisRound] = useState(1);
  const [crisisNum, setCrisisNum] = useState(1);
  const [crisisHeadline, setCrisisHeadline] = useState('');
  const [crisisDesc, setCrisisDesc] = useState('');
  const [shockMode, setShockMode] = useState('percent'); // 'percent' | 'price'
  const [selectedStockSymbols, setSelectedStockSymbols] = useState([]);
  const [batchPercentInput, setBatchPercentInput] = useState(10);
  const [crisisImpacts, setCrisisImpacts] = useState({}); // { OGDC: -15, PPL: 10 }
  const [crisesViewTab, setCrisesViewTab] = useState('1'); // '1' | '2' | '3' | 'drafts'

  // Round Settings
  const [decryptSecInput, setDecryptSecInput] = useState(180);
  const [tradingSecInput, setTradingSecInput] = useState(300);
  const [autoPriceShockSecInput, setAutoPriceShockSecInput] = useState(60);

  // Teams Filter
  const [teamsSearchQuery, setTeamsSearchQuery] = useState('');

  const getEffectivePasskey = () => {
    const p = sessionStorage.getItem('alphaace_admin_passkey') || localStorage.getItem('alphaace_admin_passkey');
    if (p && p.trim()) return p.trim();

    const t = sessionStorage.getItem('alphaace_admin_token') || localStorage.getItem('alphaace_admin_token');
    if (t && t.trim()) return t.trim();

    return '';
  };

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('alphaace_admin_token') || localStorage.getItem('alphaace_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
    return headers;
  };

  // Generic Run Action Wrapper
  const runAction = async (asyncFn, actionLabel) => {
    setActionLoading(true);
    setLastActionStatus(`Running ${actionLabel}...`);
    try {
      await asyncFn();
      setLastActionStatus(`Success: ${actionLabel}`);
      addToast('Action Completed', actionLabel, 'success');
    } catch (err) {
      const errMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error(`[AdminPanel Action Failed: ${actionLabel}]`, errMsg, err);
      setLastActionStatus(`Failed: ${errMsg}`);
      addToast('Action Failed', errMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch Full Admin Overview (Teams, Havens, Telemetry)
  const fetchAdminOverview = async () => {
    try {
      const [directState, teamsList] = await Promise.all([
        fetchGameStateDirect().catch(() => null),
        fetchTeamsDirect().catch(() => [])
      ]);

      if (directState) {
        setAdminOverview(directState);
        if (Array.isArray(directState.taxChannels) && directState.taxChannels.length > 0) {
          setAdminHavens(directState.taxChannels);
        } else {
          setAdminHavens(DEFAULT_TAX_HAVENS);
        }
      }

      if (Array.isArray(teamsList) && teamsList.length > 0) {
        setAdminTeams(teamsList);
      } else if (directState?.teams) {
        const list = Array.isArray(directState.teams)
          ? directState.teams
          : Object.values(directState.teams);
        setAdminTeams(list);
      } else if (Array.isArray(directState?.leaderboard)) {
        setAdminTeams(directState.leaderboard);
      }
    } catch (err) {
      console.warn('Could not fetch admin overview from Supabase:', err);
    }
  };

  // Fetch Tax Havens
  const fetchTaxHavens = async () => {
    try {
      const directState = await fetchGameStateDirect();
      if (Array.isArray(directState?.taxChannels) && directState.taxChannels.length > 0) {
        setAdminHavens(directState.taxChannels);
      } else {
        setAdminHavens(DEFAULT_TAX_HAVENS);
      }
    } catch (err) {
      console.warn('Could not fetch tax havens from Supabase:', err);
      setAdminHavens(DEFAULT_TAX_HAVENS);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
    fetchTaxHavens();

    let channel = null;
    try {
      channel = supabase
        .channel('admin-overview-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'investomania_teams' },
          () => {
            fetchAdminOverview();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'investomania_state' },
          () => {
            fetchAdminOverview();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Admin realtime subscription warning:', e);
    }

    const handleVisibility = () => {
      if (!document.hidden) {
        fetchAdminOverview();
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    const poll = setInterval(() => {
      if (!document.hidden) {
        fetchAdminOverview();
      }
    }, 20000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(poll);
    };
  }, []);

  // Sync Round Settings inputs with gameState
  useEffect(() => {
    if (gameState?.roundSettings && gameState?.currentRound) {
      const current = gameState.roundSettings[gameState.currentRound] || {};
      if (current.decryptSeconds) setDecryptSecInput(current.decryptSeconds);
      if (current.tradingSeconds) setTradingSecInput(current.tradingSeconds);
      if (current.autoPriceShockSeconds) setAutoPriceShockSecInput(current.autoPriceShockSeconds);
    }
  }, [gameState?.roundSettings, gameState?.currentRound]);

  // Wall-Clock Accurate Countdown Ticker for Master Admin
  useEffect(() => {
    if (!gameState || gameState.isPaused) return;
    if (gameState.phase !== 'DECRYPT' && gameState.phase !== 'TRADING' && gameState.phase !== 'DECRYPTING') return;

    const ticker = setInterval(() => {
      setAdminOverview((prev) => {
        if (!prev || prev.isPaused) return prev;
        if (prev.roundEndsAt) {
          const rem = Math.max(0, Math.round((prev.roundEndsAt - Date.now()) / 1000));
          if (rem !== prev.remainingSeconds) {
            return { ...prev, remainingSeconds: rem };
          }
        } else if (prev.remainingSeconds > 0) {
          return { ...prev, remainingSeconds: Math.max(0, prev.remainingSeconds - 1) };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [gameState?.phase, gameState?.isPaused, gameState?.roundEndsAt]);

  // Automated Tournament Cycle Runner (Auto-Pilot)
  useEffect(() => {
    if (!gameState?.isAutoPilot || gameState?.isPaused || actionLoading) return;

    const remaining = gameState.remainingSeconds;
    const phase = gameState.phase;

    // 1. In DECRYPT phase: when countdown hits 0 -> auto open trading floor!
    if (phase === 'DECRYPT' && remaining !== undefined && remaining <= 0) {
      const curRound = gameState.currentRound || 1;
      const tradingSec = gameState.roundSettings?.[curRound]?.tradingSeconds || 300;
      handleFloorAction('START_TRADING', { customSeconds: tradingSec });
      return;
    }

    // 2. In TRADING phase: when countdown hits 0 -> ALWAYS close floor FIRST, then trigger price shock!
    if (phase === 'TRADING' && remaining !== undefined && remaining <= 0) {
      if (!gameState.activeCrisis?.priceChangeApplied) {
        handleFloorAction('AUTO_CLOSE_AND_SHOCK');
      }
      return;
    }
  }, [gameState?.isAutoPilot, gameState?.phase, gameState?.remainingSeconds, gameState?.isPaused, actionLoading]);

  // Clean Headline Helper: strips redundant "1. ", "Crisis 1: ", "#1 " prefixes
  const cleanHeadline = (text = '') => {
    if (!text) return '';
    return text.replace(/^(?:crisis\s*\d+[\s:\-–.]*|#?\d+[\s:\-–.]+)/i, '').trim();
  };

  const handleTestCloudConnection = async () => {
    setActionLoading(true);
    try {
      const directState = await fetchGameStateDirect();
      if (directState) {
        addToast(
          'Supabase Cloud Online',
          `Direct Supabase Connection Active (Round ${directState.currentRound || 1}, Status: HEALTHY)`,
          'success'
        );
        fetchAdminOverview();
      } else {
        addToast('Cloud Check Failed', 'Unable to ping Supabase cloud database', 'error');
      }
    } catch (err) {
      addToast('Cloud Check Error', err.message || 'Timeout contacting cloud database', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // All Stocks & Instruments
  const allStocks = gameState?.allStocks || gameState?.assets || [];
  const activeAssets = gameState?.assets || [];

  // Filtered Inventory Stocks
  const filteredInventoryStocks = useMemo(() => {
    let list = allStocks;
    if (stocksFilterSector !== 'ALL') {
      list = list.filter((s) => (s.sector || s.category) === stocksFilterSector);
    }
    const q = stockSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.sector && s.sector.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allStocks, stocksFilterSector, stockSearchQuery]);

  // Unique Sectors for Filters
  const uniqueSectors = useMemo(() => {
    const set = new Set();
    allStocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [allStocks]);

  // Master Floor Control Action
  const handleFloorAction = (actionName, payload = {}) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      await phaseActionDirect(key, actionName, payload);
      await fetchAdminOverview();
    }, `Executed ${actionName}`);
  };

  // Switch Round
  const handleSwitchRound = (targetRound) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      await phaseActionDirect(key, 'SWITCH_ROUND', { round: targetRound });
      await fetchAdminOverview();
    }, `Switched to Round ${targetRound}`);
  };

  // Reset Game Confirmation
  const handleResetGame = () => {
    if (window.confirm('WARNING: Reset entire Investomania game back to Round 1 initial state? Desks and active crisis cycles will be reset.')) {
      handleFloorAction('RESET_GAME');
    }
  };

  // Toggle Projector Results Reveal (Open / Close Projector Results)
  const handleToggleProjectorResults = () => {
    const key = getEffectivePasskey();
    const isRevealed = !!gameState?.isResultsRevealed;
    runAction(async () => {
      await toggleProjectorResultsDirect(key, !isRevealed);
      await fetchAdminOverview();
    }, isRevealed ? 'Closed Projector Results' : 'Opened Projector Results');
  };

  // Multi-Function Desk Sign-In Lock / Unlock
  const handleToggleLogins = () => {
    const key = getEffectivePasskey();
    const willEnable = !gameState?.loginsEnabled;
    runAction(async () => {
      await phaseActionDirect(key, 'TOGGLE_LOGINS');
      await fetchAdminOverview();
    }, willEnable ? 'Unlocked Desk Logins (Allow Sign-In)' : 'Locked Desk Logins (Block Sign-In)');
  };

  // Create Team
  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamPasscode.trim()) {
      addToast('Validation Error', 'Team Name and Passcode are required.', 'error');
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageTeamDirect(key, 'CREATE', {
        name: newTeamName.trim(),
        teamPasscode: newTeamPasscode.trim(),
        initialBudget: Number(newTeamBudget) || 100000
      });
      setNewTeamName('');
      setNewTeamPasscode('');
      setIsCreateTeamModalOpen(false);
      await fetchAdminOverview();
    }, `Created Team "${newTeamName.trim()}"`);
  };

  // Ban / Unban Team
  const handleToggleTeamBan = (teamId, currentlyBanned) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageTeamDirect(key, 'TOGGLE_BAN', { teamId });
      await fetchAdminOverview();
    }, `${currentlyBanned ? 'Unbanned' : 'Banned'} team ${teamId}`);
  };

  // Delete Team
  const handleDeleteTeam = (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to completely delete team "${teamName || teamId}"? This cannot be undone.`)) {
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageTeamDirect(key, 'DELETE', { teamId });
      await fetchAdminOverview();
    }, `Deleted team ${teamName || teamId}`);
  };

  // Reset Team Passcode
  const handleResetTeamPass = (teamId) => {
    const newPass = editingTeamPass[teamId];
    if (!newPass) {
      addToast('Error', 'Please enter a new passcode in the input first', 'error');
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageTeamDirect(key, 'RESET_PASSCODE', { teamId, newPasscode: newPass.trim() });
      await fetchAdminOverview();
    }, `Reset passcode for ${teamId}`);
  };

  // Update Single Team Cash / Budget
  const handleUpdateTeamBudget = (teamId) => {
    const cashVal = editingTeamBudget[teamId];
    if (cashVal === undefined || isNaN(Number(cashVal))) {
      addToast('Error', 'Please enter a valid cash amount', 'error');
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageTeamDirect(key, 'UPDATE_BUDGET', { teamId, budget: Number(cashVal) });
      await fetchAdminOverview();
    }, `Updated budget for ${teamId}`);
  };

  // Bulk Update All Teams Budget
  const handleBulkUpdateAllBudgets = () => {
    const budgetNum = Number(bulkBudgetValue);
    if (isNaN(budgetNum) || budgetNum < 0) {
      addToast('Error', 'Please enter a valid budget amount', 'error');
      return;
    }
    if (!window.confirm(`Reset ALL competitor desks to starting budget of PKR ${budgetNum.toLocaleString()}?`)) {
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageTeamDirect(key, 'UPDATE_ALL_BUDGETS', { budget: budgetNum });
      await fetchAdminOverview();
    }, `Reset all teams budget to PKR ${budgetNum.toLocaleString()}`);
  };

  // Update Offshore Tax Haven Settings
  const handleUpdateHaven = (haven) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      await updateHavenDirect(key, {
        channelId: haven.id,
        safeLimit: Number(haven.safeLimit),
        taxRatePercent: Number(haven.taxRatePercent),
        penaltyRatePercent: Number(haven.penaltyRatePercent)
      });
      await fetchTaxHavens();
      await fetchAdminOverview();
    }, `Updated Haven ${haven.city || haven.name} (Tax: ${haven.taxRatePercent}%, Safe Limit: $${Number(haven.safeLimit).toLocaleString()})`);
  };

  // Update Stock Price
  const handleUpdateStockPrice = (symbol) => {
    const newPriceVal = editingStockPrices[symbol];
    if (newPriceVal === undefined || isNaN(Number(newPriceVal)) || Number(newPriceVal) <= 0) {
      addToast('Error', 'Please enter a valid positive stock price', 'error');
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageStockDirect(key, 'UPDATE_PRICE', { symbol, newPrice: Number(newPriceVal) });
      await fetchAdminOverview();
    }, `Updated ${symbol} price to PKR ${Number(newPriceVal).toFixed(2)}`);
  };

  // Add Stock
  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    if (!newStockSymbol.trim() || !newStockName.trim()) {
      addToast('Error', 'Symbol and Name are required', 'error');
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageStockDirect(key, 'ADD', {
        symbol: newStockSymbol.trim().toUpperCase(),
        name: newStockName.trim(),
        category: newStockCategory,
        sector: newStockSector,
        basePrice: Number(newStockPrice) || 100,
        description: newStockDesc.trim() || undefined
      });
      setNewStockSymbol('');
      setNewStockName('');
      setNewStockPrice(100);
      setNewStockDesc('');
      await fetchAdminOverview();
    }, `Added instrument ${newStockSymbol.trim().toUpperCase()}`);
  };

  // Toggle Stock Halt
  const handleToggleStockHalt = (symbol) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageStockDirect(key, 'TOGGLE_HALT', { symbol });
      await fetchAdminOverview();
    }, `Toggled circuit breaker for ${symbol}`);
  };

  // Remove Stock
  const handleRemoveStock = (symbol) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${symbol} from the exchange inventory?`)) {
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageStockDirect(key, 'REMOVE', { symbol });
      await fetchAdminOverview();
    }, `Removed instrument ${symbol}`);
  };

  // Multi-Stock Shock Selector Helpers
  const toggleSelectStock = (sym) => {
    setSelectedStockSymbols((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSelectAllStocks = () => {
    if (selectedStockSymbols.length === allStocks.length) {
      setSelectedStockSymbols([]);
    } else {
      setSelectedStockSymbols(allStocks.map((s) => s.symbol));
    }
  };

  const handleSelectSector = (sector) => {
    const sectorSymbols = allStocks
      .filter((s) => (s.sector || s.category) === sector)
      .map((s) => s.symbol);
    const allSelected = sectorSymbols.every((s) => selectedStockSymbols.includes(s));
    if (allSelected) {
      setSelectedStockSymbols((prev) => prev.filter((s) => !sectorSymbols.includes(s)));
    } else {
      setSelectedStockSymbols((prev) => Array.from(new Set([...prev, ...sectorSymbols])));
    }
  };

  const applyBatchShock = (pct) => {
    if (selectedStockSymbols.length === 0) {
      addToast('No Stocks Selected', 'Please check one or more stock cards first.', 'error');
      return;
    }
    setCrisisImpacts((prev) => {
      const next = { ...prev };
      selectedStockSymbols.forEach((sym) => {
        next[sym] = Number(pct);
      });
      return next;
    });
    addToast('Batch Shock Applied', `Applied ${pct >= 0 ? `+${pct}%` : `${pct}%`} shock to ${selectedStockSymbols.length} instruments.`);
  };

  const handleSetIndividualStockShock = (sym, pct) => {
    setCrisisImpacts((prev) => {
      const next = { ...prev };
      if (pct === '' || isNaN(Number(pct))) {
        delete next[sym];
      } else {
        next[sym] = Number(pct);
      }
      return next;
    });
  };

  const handleSetPriceTargetShock = (sym, targetPrice) => {
    const stock = allStocks.find((s) => s.symbol === sym);
    if (!stock) return;
    const cur = Number(stock.price || stock.basePrice || 100);
    const target = Number(targetPrice);
    if (isNaN(target) || target <= 0 || cur <= 0) return;
    const pct = Number((((target - cur) / cur) * 100).toFixed(1));
    handleSetIndividualStockShock(sym, pct);
  };

  // Save Crisis to Scheduled Round
  const handleSaveCrisisToRound = (e) => {
    e.preventDefault();
    if (!crisisHeadline.trim() || !crisisDesc.trim()) {
      addToast('Error', 'Headline and briefing description are required.', 'error');
      return;
    }
    const key = getEffectivePasskey();
    const newCrisisObj = {
      round: Number(crisisRound),
      number: Number(crisisNum),
      title: crisisHeadline.trim(),
      description: crisisDesc.trim(),
      impacts: crisisImpacts
    };

    runAction(async () => {
      await manageCrisisDirect(key, 'ADD_CRISIS', { round: Number(crisisRound), crisis: newCrisisObj });
      setCrisisHeadline('');
      setCrisisDesc('');
      setCrisisImpacts({});
      setSelectedStockSymbols([]);
      await fetchAdminOverview();
    }, `Scheduled Crisis #${crisisNum} for Round ${crisisRound}`);
  };

  // Save Crisis as Draft
  const handleSaveCrisisDraft = () => {
    if (!crisisHeadline.trim() || !crisisDesc.trim()) {
      addToast('Error', 'Headline and description are required for drafts.', 'error');
      return;
    }
    const key = getEffectivePasskey();
    const draftObj = {
      id: `draft-${Date.now()}`,
      title: crisisHeadline.trim(),
      description: crisisDesc.trim(),
      round: Number(crisisRound),
      number: Number(crisisNum),
      impacts: crisisImpacts
    };

    runAction(async () => {
      await manageCrisisDirect(key, 'SAVE_DRAFT', { draft: draftObj });
      setCrisisHeadline('');
      setCrisisDesc('');
      setCrisisImpacts({});
      setSelectedStockSymbols([]);
      await fetchAdminOverview();
    }, `Saved Draft Crisis: ${crisisHeadline.trim()}`);
  };

  // Delete Draft Crisis
  const handleDeleteDraftCrisis = (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft crisis?')) return;
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageCrisisDirect(key, 'DELETE_DRAFT', { draftId });
      await fetchAdminOverview();
    }, `Deleted Draft Crisis`);
  };

  // Publish Draft Crisis
  const handlePublishDraftCrisis = (draft) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageCrisisDirect(key, 'PUBLISH_DRAFT', { draftId: draft.id });
      await fetchAdminOverview();
    }, `Published Draft Crisis to Round ${draft.round}`);
  };

  // Delete Scheduled Crisis
  const handleDeleteScheduledCrisis = (roundNum, crisisSeq, crisisId, index) => {
    if (!window.confirm(`Delete Crisis #${crisisSeq || index + 1} from Round ${roundNum}?`)) return;
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageCrisisDirect(key, 'REMOVE_CRISIS', {
        round: roundNum,
        crisisNumber: crisisSeq,
        crisisId: crisisId,
        index: index
      });
      await fetchAdminOverview();
    }, `Deleted Crisis #${crisisSeq || index + 1} from Round ${roundNum}`);
  };

  // Retract / Delete Active Crisis from Trading Floor
  const handleRetractActiveCrisis = () => {
    if (!window.confirm('Are you sure you want to retract and delete the active crisis from the trading floor?')) return;
    const key = getEffectivePasskey();
    runAction(async () => {
      await manageCrisisDirect(key, 'CLEAR_ACTIVE_CRISIS', {});
      await fetchAdminOverview();
    }, 'Retracted Active Crisis from Floor');
  };

  // Save Round Timers
  const handleSaveRoundSettings = (e) => {
    e.preventDefault();
    const key = getEffectivePasskey();
    runAction(async () => {
      const curRound = gameState?.currentRound || 1;
      const roundSettingsObj = {
        [curRound]: {
          decryptSeconds: Number(decryptSecInput),
          tradingSeconds: Number(tradingSecInput),
          autoPriceShockSeconds: Number(autoPriceShockSecInput)
        }
      };
      await phaseActionDirect(key, 'UPDATE_ROUND_SETTINGS', { roundSettings: roundSettingsObj });
      await fetchAdminOverview();
    }, `Updated Timers for Round ${gameState?.currentRound || 1}`);
  };

  // Filtered Teams Roster
  const filteredTeams = useMemo(() => {
    let list = [];
    if (Array.isArray(adminTeams) && adminTeams.length > 0) {
      list = adminTeams;
    } else if (adminTeams && typeof adminTeams === 'object') {
      list = Object.values(adminTeams);
    } else if (gameState?.teams) {
      list = Array.isArray(gameState.teams) ? gameState.teams : Object.values(gameState.teams);
    } else if (Array.isArray(gameState?.leaderboard)) {
      list = gameState.leaderboard;
    }

    const q = teamsSearchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.passcode && String(t.passcode).toLowerCase().includes(q))
    );
  }, [adminTeams, gameState?.teams, gameState?.leaderboard, teamsSearchQuery]);

  // Loading guard if gameState not connected yet
  if (!gameState) {
    return (
      <div className="editorial-canvas w-full min-h-screen flex items-center justify-center p-6" data-admin-theme={themeMode}>
        <div className="editorial-card p-8 text-center max-w-sm w-full space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-[#0F0F11] border-t-transparent rounded-full animate-spin" />
          <h2 className="font-serif text-lg font-semibold text-[#0F0F11]">
            Connecting to Investomania Engine...
          </h2>
          <p className="text-xs text-[#71717A]">
            Subscribing to WebSocket telemetry on port 4000.
          </p>
        </div>
      </div>
    );
  }

  const isTradingOpen = gameState.phase === 'TRADING' && !gameState.isPaused;
  const isFloorOpen = gameState.phase === 'TRADING';
  const currentCrises = gameState.crisesByRound?.[gameState.currentRound] || [];
  const draftCrises = gameState.draftCrises || [];
  const releasedCrisesList = gameState.releasedCrises || [];
  const activeCrisisObj = gameState.activeCrisis || (releasedCrisesList.length > 0 ? releasedCrisesList[0] : null);
  const hasReleasedCrisis = Boolean(activeCrisisObj);
  const isPriceShockApplied = Boolean(activeCrisisObj?.priceChangeApplied);
  const havensList = adminHavens.length > 0
    ? adminHavens
    : ((Array.isArray(gameState.taxChannels) && gameState.taxChannels.length > 0)
      ? gameState.taxChannels
      : DEFAULT_TAX_HAVENS);

  const formatTimer = (secs = 0) => {
    const s = Math.max(0, Math.floor(secs));
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  };

  return (
    <div
      className="editorial-canvas w-full min-h-screen transition-colors duration-150"
      data-admin-theme={themeMode}
    >
      {/* ============================================================== */}
      {/* FIXED TOAST NOTIFICATION STACK (TOP-RIGHT VIEWPORT) */}
      {/* ============================================================== */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-lg flex items-start justify-between gap-3 text-xs transition-all ${
              toast.type === 'error'
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                : toast.type === 'success'
                ? 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]'
                : 'bg-white border-[#E5E5E5] text-[#0F0F11]'
            }`}
          >
            <div>
              <strong className="block font-semibold">{toast.title}</strong>
              <span className="opacity-90 leading-tight block mt-0.5">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs font-mono font-bold opacity-75 hover:opacity-100 cursor-pointer p-0.5"
            >
              x
            </button>
          </div>
        ))}
      </div>



      {/* ============================================================== */}
      {/* MAIN CONTAINER: FULL SCREEN EDGE-TO-EDGE */}
      {/* ============================================================== */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* ============================================================== */}
        {/* TOP HEADER: BRAND, TELEMETRY & THEME TOGGLE */}
        {/* ============================================================== */}
        <header className="editorial-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {onBackToHub && (
              <button
                onClick={onBackToHub}
                className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3 shrink-0"
                title="Return to Master Admin Hub"
              >
                Back to Hub
              </button>
            )}
            <div className="w-10 h-10 rounded-lg border border-[#E5E5E5] flex items-center justify-center p-1 bg-white shrink-0">
              <img src={investomaniaLogo} alt="Investomania" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                  Investomania Engine · Port 4000
                </span>
                <span
                  className={`editorial-badge text-[10px] ${
                    adminOverview?.cloudSync?.status === 'CONNECTED'
                      ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]'
                      : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                  }`}
                >
                  CLOUD: {adminOverview?.cloudSync?.status || 'CONNECTED'}
                </span>
                <span className="editorial-badge bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7] text-[10px]">
                  AUTH: {localStorage.getItem('alphaace_admin_token') ? 'SESSION TOKEN' : 'MASTER KEY'}
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0F0F11] leading-tight">
                Mission Control Cockpit
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mobile & Tablet Sidebar Window Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="editorial-btn editorial-btn-dark text-xs py-2 px-3 font-semibold flex items-center gap-1.5 lg:hidden shadow-sm"
              title="Open Navigation Menu Window"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
              <span className="editorial-badge bg-[#73482C] text-white border-[#5D3720] text-[9px] py-0 px-1 ml-0.5 uppercase">
                {adminTab}
              </span>
            </button>

            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className="editorial-btn editorial-btn-outline text-xs py-2 px-3.5 font-semibold flex items-center gap-1.5"
              title={`Switch to ${themeMode === 'dark' ? 'White / Light' : 'Dark'} Theme`}
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>White Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#8D5B3A]" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>

            {/* Projector Window Link */}
            <a
              href={window.location.hostname.includes('localhost') ? 'http://localhost:5173/investomania/projector' : 'https://app.alphaace.com/investomania/projector'}
              target="_blank"
              rel="noreferrer"
              className="editorial-btn editorial-btn-outline text-xs py-2 px-3.5 font-semibold"
              title="Open Projector Display in new tab"
            >
              Open Projector ↗
            </a>

            {/* Open / Close Projector Results Toggle */}
            <button
              onClick={handleToggleProjectorResults}
              className={`editorial-btn text-xs py-2 px-3.5 font-semibold transition-all shadow-xs ${
                gameState?.isResultsRevealed
                  ? 'editorial-btn-red hover:bg-[#91180E]'
                  : 'editorial-btn-green hover:bg-[#1E7B48]'
              }`}
              title={
                gameState?.isResultsRevealed
                  ? 'Click to close/seal results on projector screen'
                  : 'Click to open/reveal live podium results on projector screen'
              }
            >
              {gameState?.isResultsRevealed ? 'Close Projector Results' : 'Open Projector Results'}
            </button>

            {/* Reset Game Button */}
            <button
              onClick={handleResetGame}
              className="editorial-btn editorial-btn-outline text-[#B42318] text-xs py-2 px-3"
              title="Reset game back to initial state"
            >
              Reset Game
            </button>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="editorial-btn editorial-btn-outline text-[#B42318] hover:bg-[#FEF3F2] dark:hover:bg-[#2E0C16] text-xs py-2 px-3 font-semibold transition-colors"
                title="Sign out of administrator console"
              >
                Sign Out
              </button>
            )}
          </div>
        </header>

        {/* ============================================================== */}
        {/* PRIMARY FLOOR CONTROLS & TIMERS (CLEANED UP NO DUPLICATES) */}
        {/* ============================================================== */}
        <section className="editorial-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase text-[#71717A]">
                Floor Operations:
              </span>
              <span className={`editorial-badge ${isTradingOpen ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]' : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'}`}>
                {gameState.phase}
              </span>
              <span className="font-mono text-xs font-semibold">
                Clock: <strong className="font-bold text-sm">{gameState.isUntimed ? '∞ UNTIMED' : formatTimer(gameState.remainingSeconds)}</strong>
              </span>
              <span className="font-mono text-[11px] text-[#71717A]">
                [{gameState.isPaused ? 'PAUSED' : 'RUNNING'}]
              </span>
            </div>

            {/* Round Switcher Pills */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-[#71717A] text-[11px] uppercase mr-1">Arena:</span>
              {[
                { r: 1, label: 'Round 1 (PSX)' },
                { r: 2, label: 'Round 2 (FX & Comm)' },
                { r: 3, label: 'Round 3 (Smuggling)' }
              ].map((rd) => (
                <button
                  key={rd.r}
                  onClick={() => handleSwitchRound(rd.r)}
                  className={`editorial-btn text-xs py-1 px-2.5 ${
                    Number(gameState.currentRound) === rd.r
                      ? 'editorial-btn-dark'
                      : 'editorial-btn-outline'
                  }`}
                >
                  {rd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons:
              1. SINGLE Toggle Button for Untimed Trading (Start vs Stop Floor)
              2. Pause / Resume Clock
              3. Start Decrypt Phase (3m)
              NOTE: Timed trading button is removed here because it exists in the manual crisis pipeline below!
          */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* SINGLE BUTTON: Open Floor (Start Trading) <-> Stop Floor (Lock Trading) */}
            {isTradingOpen ? (
              <button
                onClick={() => handleFloorAction('STOP_TRADING')}
                disabled={actionLoading}
                className="editorial-btn editorial-btn-red justify-center py-3 text-xs font-bold"
              >
                Stop Floor (Lock Trading)
              </button>
            ) : (
              <button
                onClick={() => handleFloorAction('START_TRADING_UNTIMED')}
                disabled={actionLoading}
                className="editorial-btn editorial-btn-green justify-center py-3 text-xs font-bold"
              >
                Open Floor (Start Trading)
              </button>
            )}

            {/* Pause / Resume */}
            <button
              onClick={() => handleFloorAction('PAUSE_RESUME')}
              disabled={actionLoading}
              className="editorial-btn editorial-btn-outline justify-center py-3 text-xs font-bold"
            >
              {gameState.isPaused ? 'Resume Clock' : 'Pause Clock'}
            </button>

            {/* Start Decrypt Phase (3m) */}
            <button
              onClick={() => handleFloorAction('START_DECRYPT')}
              disabled={actionLoading}
              className="editorial-btn editorial-btn-dark justify-center py-3 text-xs font-bold"
            >
              Start Decrypt Phase (3m)
            </button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* MOBILE & TABLET NAVIGATION DECK BAR (ZERO HORIZONTAL SCROLLBARS) */}
        {/* ============================================================== */}
        <div className="flex lg:hidden items-center justify-between gap-3 p-3.5 editorial-card">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="editorial-btn editorial-btn-dark text-xs py-2 px-3.5 flex items-center gap-2 shadow-sm shrink-0"
          >
            <Menu className="w-4 h-4" />
            <span>Navigation Window</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono uppercase text-[#71717A] hidden sm:inline">Active:</span>
            <span className="editorial-badge text-xs font-mono font-bold truncate">
              {adminTab === 'controls' ? 'Live Cockpit'
                : adminTab === 'crises' ? 'Crisis Studio'
                : adminTab === 'stocks' ? 'Stock Inventory'
                : adminTab === 'havens' ? 'Offshore Havens'
                : adminTab === 'rounds' ? 'Round Schedules'
                : 'Contestant Desks'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`editorial-badge text-[10px] ${gameState.loginsEnabled ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]' : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'}`}>
              {gameState.loginsEnabled ? 'DESKS OPEN' : 'DESKS LOCKED'}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB NAVIGATION & BODY WORKSPACE */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* DESKTOP PERMANENT LEFT SIDEBAR (HIDDEN ON TABLET & MOBILE) */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 editorial-card p-3 space-y-2 lg:sticky lg:top-5 self-start lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto no-scrollbar z-20">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase text-[#71717A] font-bold tracking-wider block">
                Admin Console Deck
              </span>
            </div>

            <nav className="flex flex-col gap-1.5 py-1">
              {[
                { id: 'controls', label: 'Live Cockpit', shortLabel: 'Cockpit', Icon: Activity, badge: gameState.phase },
                { id: 'crises', label: 'Crisis Studio', shortLabel: 'Crises', Icon: Layers, badge: `${currentCrises.length}+${draftCrises.length}` },
                { id: 'stocks', label: 'Stock Inventory', shortLabel: 'Stocks', Icon: TrendingUp, badge: allStocks.length },
                { id: 'havens', label: 'Offshore Havens (R3)', shortLabel: 'Havens', Icon: Globe, badge: `${havensList.length} Cities` },
                { id: 'rounds', label: 'Round Schedules', shortLabel: 'Rounds', Icon: Calendar, badge: 'R1-R3' },
                { id: 'teams', label: 'Contestant Desks', shortLabel: 'Teams', Icon: Users, badge: adminTeams.length || Object.keys(gameState?.teams || {}).length }
              ].map((tab) => {
                const active = adminTab === tab.id;
                const TabIcon = tab.Icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`editorial-btn w-full justify-between px-3 py-2 text-xs font-medium text-left whitespace-nowrap shrink-0 transition-all ${
                      active ? 'editorial-btn-dark shadow-sm' : 'editorial-btn-outline border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TabIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        active
                          ? 'border-[#5D3720] bg-[#73482C] text-[#FFFFFF]'
                          : 'border-[#E5E5E5] bg-[#F4EFEB] text-[#71717A]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Desk Sign-In Lock (Desktop) */}
            <div className="pt-3 border-t border-[#E5E5E5] mt-3 px-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#71717A] uppercase font-bold flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#71717A]" />
                  Desk Sign-In:
                </span>
                <span className={`editorial-badge text-[10px] ${gameState.loginsEnabled ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]' : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'}`}>
                  {gameState.loginsEnabled ? 'OPEN' : 'LOCKED'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleLogins}
                disabled={actionLoading}
                className={`editorial-btn w-full justify-center text-xs py-2 font-bold ${
                  gameState.loginsEnabled
                    ? 'editorial-btn-outline text-[#B42318] hover:bg-[#FEF3F2]'
                    : 'editorial-btn-green'
                }`}
              >
                {gameState.loginsEnabled ? 'Lock Desks (Disable Sign-In)' : 'Unlock Desks (Allow Sign-In)'}
              </button>
            </div>
          </aside>

          {/* RIGHT BODY: SELECTED TAB CONTENT */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-5">
            
            {/* ========================================================== */}
            {/* TAB 1: LIVE FLOOR COCKPIT */}
            {/* ========================================================== */}
            {adminTab === 'controls' && (
              <div className="space-y-5">
                
                {/* LIVE ACTIVE / RELEASED CRISIS SHOWCASE */}
                <div className="editorial-card p-5 sm:p-6 space-y-4 border-l-4 border-l-[var(--accent-brown)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          gameState.phase === 'DECRYPT' ? 'bg-[var(--accent-yellow)]' : gameState.phase === 'TRADING' ? 'bg-[var(--accent-green)]' : 'bg-[var(--text-muted)]'
                        }`} />
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          gameState.phase === 'DECRYPT' ? 'bg-[var(--accent-yellow)]' : gameState.phase === 'TRADING' ? 'bg-[var(--accent-green)]' : 'bg-[var(--text-muted)]'
                        }`} />
                      </span>
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                          Live Crisis Intelligence
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          Real-time geopolitical shock broadcasted to all trading desk terminals.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="editorial-badge">
                        ROUND {gameState.currentRound} · CRISIS #{activeCrisisObj?.number || gameState.currentCrisis || 1}
                      </span>
                      <span className={`editorial-badge text-[10px] font-mono font-bold ${
                        activeCrisisObj?.isLiveReleased || activeCrisisObj
                          ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]' 
                          : 'bg-[var(--accent-yellow-bg)] text-[var(--accent-yellow-text)] border-[var(--accent-yellow-border)]'
                      }`}>
                        {activeCrisisObj ? 'BROADCAST LIVE' : 'NO ACTIVE CRISIS'}
                      </span>
                      {activeCrisisObj && (
                        <>
                          <span className={`editorial-badge text-[10px] font-mono font-bold ${
                            isPriceShockApplied
                              ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                              : 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border-[var(--accent-red-border)]'
                          }`}>
                            {isPriceShockApplied ? '✓ SHOCK APPLIED' : '⏳ IMPACT PENDING'}
                          </span>
                          <button
                            type="button"
                            onClick={handleRetractActiveCrisis}
                            disabled={actionLoading}
                            className="editorial-btn editorial-btn-outline text-[#B42318] text-[10px] font-mono font-bold py-0.5 px-2 cursor-pointer shadow-xs"
                            title="Retract and delete active crisis from trading floor"
                          >
                            🗑️ Retract from Floor
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {activeCrisisObj ? (
                    <div className="space-y-3.5">
                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-[var(--card-inset)] border border-[var(--border-subtle)] text-[var(--accent-brown)]">
                          {activeCrisisObj.cipherCode || `CIPHER-R${gameState.currentRound}-0${activeCrisisObj.number || 1}`}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                          {activeCrisisObj.headline || activeCrisisObj.title || 'Market Crisis Event'}
                        </h3>
                      </div>

                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                        {activeCrisisObj.description}
                      </p>

                      {/* Stock Impact Shocks */}
                      {activeCrisisObj.impacts && Object.keys(activeCrisisObj.impacts).length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block mb-1.5">
                            Asset Shockwave Impacts ({Object.keys(activeCrisisObj.impacts).length} Securities):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(activeCrisisObj.impacts).map(([symbol, pct]) => {
                              const num = Number(pct);
                              const isPositive = num >= 0;
                              return (
                                <div
                                  key={symbol}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs font-bold ${
                                    isPositive
                                      ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                                      : 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border-[var(--accent-red-border)]'
                                  }`}
                                >
                                  <span>{symbol}</span>
                                  <span>{isPositive ? `+${num}%` : `${num}%`}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[var(--card-inset)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                      No crisis is currently released on the floor. Click "1. Release Crisis" below or select a draft crisis from the pipeline.
                    </div>
                  )}
                </div>

                {/* TOURNAMENT AUTO-CYCLE ENGINE (AUTO-PILOT) */}
                <div className={`editorial-card p-5 sm:p-6 space-y-4 border-2 transition-all ${
                  gameState.isAutoPilot 
                    ? 'border-[var(--accent-green-border)] bg-[var(--accent-green-bg)]/20 shadow-md ring-2 ring-[var(--accent-green-border)]/40' 
                    : 'border-[var(--border-subtle)] bg-[var(--card-bg)]'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-xs ${
                        gameState.isAutoPilot
                          ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border border-[var(--accent-green-border)] animate-pulse'
                          : 'bg-[var(--card-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                      }`}>
                        <RotateCcw className={`w-5 h-5 ${gameState.isAutoPilot ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                            Tournament Auto-Cycle Engine (Auto-Pilot)
                          </h3>
                          <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                            gameState.isAutoPilot
                              ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                              : 'bg-[var(--card-inset)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                          }`}>
                            {gameState.isAutoPilot ? '● AUTO-CYCLE ACTIVE' : '○ MANUAL MODE'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          Zero-manual operation: Automatically releases crisis without price shock ➔ runs decrypt window with floor locked ➔ opens trading floor ➔ auto-closes floor ➔ triggers price impact.
                        </p>
                      </div>
                    </div>

                    {/* Master Toggle Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFloorAction('TOGGLE_AUTO_CYCLE')}
                        disabled={actionLoading}
                        className={`editorial-btn text-xs py-2 px-4 font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all ${
                          gameState.isAutoPilot
                            ? 'editorial-btn-outline border-[var(--accent-red-border)] text-[var(--accent-red-text)] hover:bg-[var(--accent-red-bg)]'
                            : 'editorial-btn-green'
                        }`}
                      >
                        {gameState.isAutoPilot ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause Auto-Cycle</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Tournament Auto-Cycle</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Auto-Cycle Visual Sequence Pipeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* Stage 1: Decrypt Window */}
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      gameState.phase === 'DECRYPT' && !isPriceShockApplied
                        ? 'bg-[var(--accent-yellow-bg)]/40 border-[var(--accent-yellow-border)] ring-1 ring-[var(--accent-yellow-border)] font-bold'
                        : 'bg-[var(--card-inset)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold">1. Decrypt Window</span>
                        {gameState.phase === 'DECRYPT' && !isPriceShockApplied && (
                          <span className="text-[10px] font-mono text-[var(--accent-yellow-text)] font-extrabold animate-pulse">RUNNING</span>
                        )}
                      </div>
                      <p className="text-[11px] leading-tight">News broadcasted. Trading floor strictly locked.</p>
                      <div className="font-mono text-xs pt-1 font-bold">
                        {gameState.phase === 'DECRYPT' && !isPriceShockApplied ? formatTimer(gameState.remainingSeconds) : `${Math.round(decryptSecInput / 60)}m`}
                      </div>
                    </div>

                    {/* Stage 2: Trading Floor Open */}
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      gameState.phase === 'TRADING'
                        ? 'bg-[var(--accent-green-bg)]/40 border-[var(--accent-green-border)] ring-1 ring-[var(--accent-green-border)] font-bold'
                        : 'bg-[var(--card-inset)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold">2. Trading Floor</span>
                        {gameState.phase === 'TRADING' && (
                          <span className="text-[10px] font-mono text-[var(--accent-green-text)] font-extrabold animate-pulse">FLOOR OPEN</span>
                        )}
                      </div>
                      <p className="text-[11px] leading-tight">Desks execute live buy & sell orders.</p>
                      <div className="font-mono text-xs pt-1 font-bold">
                        {gameState.phase === 'TRADING' ? formatTimer(gameState.remainingSeconds) : `${Math.round(tradingSecInput / 60)}m`}
                      </div>
                    </div>

                    {/* Stage 3: Auto-Close Floor */}
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      isPriceShockApplied
                        ? 'bg-[var(--accent-green-bg)]/20 border-[var(--accent-green-border)] text-[var(--accent-green-text)]'
                        : 'bg-[var(--card-inset)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold">3. Auto-Lock Floor</span>
                        {isPriceShockApplied && <span className="text-[10px] font-mono font-bold">DONE</span>}
                      </div>
                      <p className="text-[11px] leading-tight">Floor ALWAYS closes before price impact executes.</p>
                      <div className="font-mono text-[11px] pt-1">Automatic Safety Lock</div>
                    </div>

                    {/* Stage 4: Trigger Price Impact */}
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      isPriceShockApplied
                        ? 'bg-[var(--accent-green-bg)]/30 border-[var(--accent-green-border)] text-[var(--accent-green-text)] font-bold'
                        : 'bg-[var(--card-inset)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold">4. Price Shockwave</span>
                        {isPriceShockApplied && <span className="text-[10px] font-mono font-bold">✓ APPLIED</span>}
                      </div>
                      <p className="text-[11px] leading-tight">Asset prices updated & net worth recalculated.</p>
                      <div className="font-mono text-[11px] pt-1">
                        {isPriceShockApplied ? 'Shocks Live' : 'Pending Floor Close'}
                      </div>
                    </div>
                  </div>

                  {/* Quick Cycle Timing Bar */}
                  <form onSubmit={handleSaveRoundSettings} className="p-3.5 rounded-lg bg-[var(--card-inset)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase text-[var(--text-muted)] font-bold">Decrypt:</span>
                        <input
                          type="number"
                          min={10}
                          max={600}
                          value={decryptSecInput}
                          onChange={(e) => setDecryptSecInput(e.target.value)}
                          className="editorial-input w-20 py-1 px-2 font-mono text-xs"
                        />
                        <span className="text-[10px] text-[var(--text-muted)]">sec ({Math.round(decryptSecInput / 60)}m)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase text-[var(--text-muted)] font-bold">Trading Floor:</span>
                        <input
                          type="number"
                          min={10}
                          max={900}
                          value={tradingSecInput}
                          onChange={(e) => setTradingSecInput(e.target.value)}
                          className="editorial-input w-20 py-1 px-2 font-mono text-xs"
                        />
                        <span className="text-[10px] text-[var(--text-muted)]">sec ({Math.round(tradingSecInput / 60)}m)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="editorial-btn editorial-btn-outline text-xs py-1 px-3 cursor-pointer"
                      >
                        Save Cycle Timings
                      </button>
                      {gameState.isAutoPilot && (
                        <button
                          type="button"
                          onClick={() => {
                            if (gameState.phase === 'DECRYPT') {
                              handleFloorAction('START_TRADING');
                            } else if (gameState.phase === 'TRADING') {
                              handleFloorAction('AUTO_CLOSE_AND_SHOCK');
                            }
                          }}
                          disabled={actionLoading}
                          className="editorial-btn editorial-btn-dark text-xs py-1 px-2.5 cursor-pointer"
                          title="Force-forward to next auto step immediately"
                        >
                          ⚡ Fast-Forward Step
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Manual Crisis Sequence Pipeline */}
                <div className="editorial-card p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        Crisis Announcement & Price Shock Sequence
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Standard Tournament Loop: 1. Release Crisis (Decrypt) → 2. Timed Trading Window → 3. Trigger Price Shock
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border ${
                        isFloorOpen
                          ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                          : 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border-[var(--accent-red-border)]'
                      }`}>
                        {isFloorOpen ? 'FLOOR OPEN' : 'FLOOR LOCKED'}
                      </span>
                    </div>
                  </div>

                  {/* 3 Step Manual Sequence Controls with Strict Dependent Unlocking */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Step 1: Release Crisis (Decrypt) */}
                    <div className={`editorial-card p-4 space-y-2.5 bg-[var(--card-inset)] border transition-all ${
                      hasReleasedCrisis ? 'border-[var(--accent-green-border)]' : 'border-[var(--border-subtle)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold block">
                          Step 1 · Decrypt Window ({gameState.roundSettings?.[gameState.currentRound]?.decryptSeconds ? `${Math.round(gameState.roundSettings[gameState.currentRound].decryptSeconds / 60)}m` : '3m'})
                        </span>
                        {hasReleasedCrisis && (
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-green-text)]">
                            ✓ ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Broadcasts crisis news without price impact. Floor is locked for analysis and decrypt countdown runs.
                      </p>
                      <button
                        onClick={() => handleFloorAction('START_DECRYPT')}
                        disabled={actionLoading}
                        className="editorial-btn editorial-btn-dark w-full justify-center text-xs py-2 shadow-xs cursor-pointer"
                      >
                        1. Release Crisis ({gameState.roundSettings?.[gameState.currentRound]?.decryptSeconds ? `${Math.round(gameState.roundSettings[gameState.currentRound].decryptSeconds / 60)}m` : '3m'} Decrypt)
                      </button>
                    </div>

                    {/* Step 2: Open Trading Floor (Timed Window) */}
                    <div className={`editorial-card p-4 space-y-2.5 bg-[var(--card-inset)] border transition-all ${
                      !hasReleasedCrisis
                        ? 'opacity-50 border-[var(--border-subtle)]'
                        : isFloorOpen
                        ? 'border-[var(--accent-green-border)] ring-1 ring-[var(--accent-green-border)]'
                        : 'border-[var(--border-subtle)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold block">
                          Step 2 · Trading Floor ({gameState.roundSettings?.[gameState.currentRound]?.tradingSeconds ? `${Math.round(gameState.roundSettings[gameState.currentRound].tradingSeconds / 60)}m` : '5m'})
                        </span>
                        {!hasReleasedCrisis ? (
                          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                            🔒 LOCKED (STEP 1)
                          </span>
                        ) : isFloorOpen ? (
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-green-text)]">
                            ✓ FLOOR OPEN
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-yellow-text)]">
                            READY TO OPEN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Unlocks when crisis is released. Admin can open or close trading floor at will; trading countdown runs.
                      </p>
                      {isFloorOpen ? (
                        <button
                          onClick={() => handleFloorAction('CLOSE_TRADING')}
                          disabled={!hasReleasedCrisis || actionLoading}
                          className="editorial-btn editorial-btn-outline border-[var(--accent-red-border)] text-[var(--accent-red-text)] w-full justify-center text-xs py-2 cursor-pointer"
                        >
                          🔒 Close Trading Floor
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFloorAction('START_TRADING')}
                          disabled={!hasReleasedCrisis || actionLoading}
                          className="editorial-btn editorial-btn-green w-full justify-center text-xs py-2 cursor-pointer shadow-xs"
                        >
                          2. Open Trading Floor
                        </button>
                      )}
                    </div>

                    {/* Step 3: Trigger Market Price Shock */}
                    <div className={`editorial-card p-4 space-y-2.5 bg-[var(--card-inset)] border transition-all ${
                      !hasReleasedCrisis || !isFloorOpen || isPriceShockApplied
                        ? 'opacity-50 border-[var(--border-subtle)]'
                        : 'border-[var(--accent-red-border)] ring-1 ring-[var(--accent-red-border)]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase font-bold block">
                          Step 3 · Instant Price Shock
                        </span>
                        {!hasReleasedCrisis ? (
                          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                            🔒 LOCKED (STEP 1)
                          </span>
                        ) : !isFloorOpen ? (
                          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                            🔒 LOCKED (OPEN FLOOR FIRST)
                          </span>
                        ) : isPriceShockApplied ? (
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-green-text)]">
                            ✓ SHOCK APPLIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-red-text)]">
                            READY TO SHOCK
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Unlocks after trading floor is opened. Applies percentage shocks to market prices and updates team portfolios live.
                      </p>
                      <button
                        onClick={() => handleFloorAction('TRIGGER_PRICE_SHOCK')}
                        disabled={!hasReleasedCrisis || !isFloorOpen || isPriceShockApplied || actionLoading}
                        className={`editorial-btn w-full justify-center text-xs py-2 transition-all ${
                          isPriceShockApplied
                            ? 'editorial-btn-outline text-[var(--text-muted)] cursor-not-allowed'
                            : 'editorial-btn-red shadow-xs cursor-pointer'
                        }`}
                      >
                        {isPriceShockApplied ? '✓ Price Shock Applied' : '3. Trigger Price Shock'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ALL CRISIS DRAFTS PIPELINE & INSTANT RELEASE IN CONTROL PANEL */}
                <div className="editorial-card p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                          Draft Crises Pipeline & Instant Release
                        </h3>
                        <span className="editorial-badge text-[10px] font-mono font-bold">
                          {draftCrises.length} Draft{draftCrises.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Pre-staged crisis scenarios. Select and click "Release to Floor" on any draft below to immediately broadcast it without price impact and initiate the decrypt window.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('crises')}
                      className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3 cursor-pointer"
                    >
                      + Create New Draft in Studio
                    </button>
                  </div>

                  {draftCrises.length === 0 ? (
                    <div className="p-6 rounded-lg bg-[var(--card-inset)] border border-[var(--border-subtle)] text-center space-y-2">
                      <p className="text-xs text-[var(--text-muted)]">
                        No draft crises currently in the pipeline.
                      </p>
                      <button
                        onClick={() => setActiveTab('crises')}
                        className="editorial-btn editorial-btn-dark text-xs py-1.5 px-3 cursor-pointer"
                      >
                        Open Crisis Studio to Author Drafts
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {draftCrises.map((draft) => {
                        const impacts = draft.impacts || {};
                        const impactEntries = Object.entries(impacts);
                        const isCurrentlyActive = activeCrisisObj && (
                          (activeCrisisObj.id && activeCrisisObj.id === draft.id) ||
                          (activeCrisisObj.headline && (activeCrisisObj.headline === draft.headline || activeCrisisObj.headline === draft.title))
                        );

                        return (
                          <div
                            key={draft.id}
                            className={`editorial-card p-4 flex flex-col justify-between space-y-3 transition-all ${
                              isCurrentlyActive
                                ? 'ring-2 ring-[var(--accent-brown)] bg-[var(--card-inset)]'
                                : 'bg-[var(--card-bg)] hover:border-[var(--text-muted)]'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="editorial-badge text-[10px] font-mono font-bold bg-[var(--accent-brown-bg)] text-[var(--accent-brown)] border border-[var(--accent-brown-border)]">
                                    ROUND {draft.round || 1}
                                  </span>
                                  <span className="editorial-badge text-[10px] font-mono font-bold bg-[var(--card-inset)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                                    CRISIS #{draft.number || 1}
                                  </span>
                                </div>
                                {isCurrentlyActive && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border border-[var(--accent-green-border)]">
                                    LIVE ON FLOOR
                                  </span>
                                )}
                              </div>

                              <h4 className="font-serif font-bold text-sm text-[var(--text-primary)] leading-snug">
                                {cleanHeadline(draft.headline || draft.title || 'Untitled Draft')}
                              </h4>

                              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                                {draft.description}
                              </p>

                              {/* Impacts Strip */}
                              {impactEntries.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {impactEntries.slice(0, 4).map(([sym, pct]) => {
                                    const num = Number(pct);
                                    const isPositive = num >= 0;
                                    return (
                                      <span
                                        key={sym}
                                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                          isPositive
                                            ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                                            : 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border-[var(--accent-red-border)]'
                                        }`}
                                      >
                                        {sym} {isPositive ? `+${num}%` : `${num}%`}
                                      </span>
                                    );
                                  })}
                                  {impactEntries.length > 4 && (
                                    <span className="font-mono text-[10px] text-[var(--text-muted)] self-center">
                                      +{impactEntries.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                              <button
                                onClick={() => handlePublishDraftCrisis(draft)}
                                disabled={actionLoading}
                                className="editorial-btn editorial-btn-green flex-1 justify-center text-xs py-1.5 cursor-pointer shadow-xs"
                              >
                                🚀 Release to Floor
                              </button>
                              <button
                                onClick={() => handleDeleteDraftCrisis(draft.id)}
                                disabled={actionLoading}
                                className="editorial-btn editorial-btn-outline text-[#B42318] text-xs py-1.5 px-2 cursor-pointer"
                                title="Delete Draft"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ROUND SCHEDULES & TIMING CONTROLS IN COCKPIT */}
                <div className="editorial-card p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        Round Schedules & Countdown Configuration
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Live duration controls for decryption, trading, and automated price shocks.
                      </p>
                    </div>

                    {/* Round Switcher Chips */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {[1, 2, 3].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleSwitchRound(r)}
                          disabled={actionLoading || gameState.currentRound === r}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            gameState.currentRound === r
                              ? 'bg-[var(--accent-brown)] text-white'
                              : 'editorial-btn-outline'
                          }`}
                        >
                          Round {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSaveRoundSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1 font-bold">
                          Decrypt Window (Sec)
                        </label>
                        <input
                          type="number"
                          value={decryptSecInput}
                          onChange={(e) => setDecryptSecInput(e.target.value)}
                          className="editorial-input w-full font-mono text-xs"
                        />
                        <div className="flex gap-1 mt-1 text-[10px] text-[var(--text-muted)]">
                          <button type="button" onClick={() => setDecryptSecInput(60)} className="hover:underline">60s</button> •
                          <button type="button" onClick={() => setDecryptSecInput(120)} className="hover:underline">120s</button> •
                          <button type="button" onClick={() => setDecryptSecInput(180)} className="hover:underline">180s (3m)</button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1 font-bold">
                          Trading Window (Sec)
                        </label>
                        <input
                          type="number"
                          value={tradingSecInput}
                          onChange={(e) => setTradingSecInput(e.target.value)}
                          className="editorial-input w-full font-mono text-xs"
                        />
                        <div className="flex gap-1 mt-1 text-[10px] text-[var(--text-muted)]">
                          <button type="button" onClick={() => setTradingSecInput(180)} className="hover:underline">3m</button> •
                          <button type="button" onClick={() => setTradingSecInput(300)} className="hover:underline">5m</button> •
                          <button type="button" onClick={() => setTradingSecInput(540)} className="hover:underline">9m (R3)</button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1 font-bold">
                          Auto Shock Timer (Sec)
                        </label>
                        <input
                          type="number"
                          value={autoPriceShockSecInput}
                          onChange={(e) => setAutoPriceShockSecInput(e.target.value)}
                          className="editorial-input w-full font-mono text-xs"
                        />
                        <div className="flex gap-1 mt-1 text-[10px] text-[var(--text-muted)]">
                          <button type="button" onClick={() => setAutoPriceShockSecInput(30)} className="hover:underline">30s</button> •
                          <button type="button" onClick={() => setAutoPriceShockSecInput(60)} className="hover:underline">60s</button> •
                          <button type="button" onClick={() => setAutoPriceShockSecInput(90)} className="hover:underline">90s</button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="editorial-btn editorial-btn-dark text-xs py-2 px-5"
                      >
                        Save Round Timers
                      </button>

                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Active in Round {gameState.currentRound}: Decrypt {gameState.roundSettings?.[gameState.currentRound]?.decryptSeconds || 180}s · Trading {gameState.roundSettings?.[gameState.currentRound]?.tradingSeconds || 300}s · Auto Shock {gameState.roundSettings?.[gameState.currentRound]?.autoPriceShockSeconds || 60}s
                      </span>
                    </div>
                  </form>
                </div>

                {/* Audit Ledger / Recent Events */}
                {gameState.recentLedger && gameState.recentLedger.length > 0 && (
                  <div className="editorial-card p-5 space-y-3">
                    <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                      Recent Operational Audit Log
                    </h3>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
                      {gameState.recentLedger.map((log, idx) => (
                        <div key={idx} className="p-2 rounded bg-[var(--card-inset)] border border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-primary)]">
                          <span>{log.description || log.message || JSON.stringify(log)}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 2: CRISIS AUTHORING STUDIO & INSTRUMENT SHOCKS */}
            {/* ========================================================== */}
            {adminTab === 'crises' && (
              <div className="space-y-5">
                
                {/* Crisis Authoring Form */}
                <div className="editorial-card p-5 sm:p-6 space-y-5">
                  <div className="border-b border-[#E5E5E5] pb-3">
                    <h2 className="font-serif text-xl font-bold text-[#0F0F11]">
                      Crisis Authoring Studio
                    </h2>
                    <p className="text-xs text-[#71717A]">
                      Draft custom market disruptions, geopolitics briefings, and configure percentage shocks or price shifts on securities.
                    </p>
                  </div>

                  <form onSubmit={handleSaveCrisisToRound} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                          Target Tournament Round
                        </label>
                        <select
                          value={crisisRound}
                          onChange={(e) => setCrisisRound(Number(e.target.value))}
                          className="editorial-input w-full font-mono text-xs"
                        >
                          <option value={1}>Round 1 (PSX Equities)</option>
                          <option value={2}>Round 2 (Commodities & FX)</option>
                          <option value={3}>Round 3 (Multi-Asset & Havens)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                          Crisis Sequence Number
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={crisisNum}
                          onChange={(e) => setCrisisNum(Number(e.target.value))}
                          className="editorial-input w-full font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Headline Announcement
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SBP Announces Emergency 200bps Policy Rate Cut"
                        value={crisisHeadline}
                        onChange={(e) => setCrisisHeadline(e.target.value)}
                        className="editorial-input w-full text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Full Intelligence Briefing / Description
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Detailed market dispatch, regulatory directive, or geopolitical escalation..."
                        value={crisisDesc}
                        onChange={(e) => setCrisisDesc(e.target.value)}
                        className="editorial-input w-full text-xs"
                      />
                    </div>

                    {/* ================================================== */}
                    {/* INSTRUMENT PERCENTAGE SHOCKS CARDS STUDIO */}
                    {/* ================================================== */}
                    <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
                        <div>
                          <span className="font-mono text-xs uppercase font-bold text-[#0F0F11] block">
                            Instrument Shocks Studio ({Object.keys(crisisImpacts).length} Configured)
                          </span>
                          <span className="text-[11px] text-[#71717A]">
                            Select stocks below to apply batch shocks, or adjust each card individually.
                          </span>
                        </div>

                        {/* Shock Mode Toggle */}
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => setShockMode('percent')}
                            className={`editorial-btn text-xs py-1 px-3 ${
                              shockMode === 'percent' ? 'editorial-btn-dark' : 'editorial-btn-outline'
                            }`}
                          >
                            % Percentage Mode
                          </button>
                          <button
                            type="button"
                            onClick={() => setShockMode('price')}
                            className={`editorial-btn text-xs py-1 px-3 ${
                              shockMode === 'price' ? 'editorial-btn-dark' : 'editorial-btn-outline'
                            }`}
                          >
                            PKR Price Target Mode
                          </button>
                        </div>
                      </div>

                      {/* Batch Selection & Preset Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#E5E5E5]">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllStocks}
                            className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2.5"
                          >
                            {selectedStockSymbols.length === allStocks.length ? 'Deselect All' : 'Select All'}
                          </button>

                          {uniqueSectors.map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => handleSelectSector(sec)}
                              className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2.5"
                            >
                              + {sec}
                            </button>
                          ))}
                        </div>

                        {/* Batch Shock Presets */}
                        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                          <span className="text-[#71717A] text-[10px] mr-1">Batch Presets:</span>
                          {[-25, -15, -10, -5, 0, 5, 10, 15, 25].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => applyBatchShock(pct)}
                              className={`editorial-btn text-[11px] py-1 px-2 ${
                                pct < 0 ? 'text-[#B42318] hover:bg-[#FEF3F2]' : pct > 0 ? 'text-[#027A48] hover:bg-[#ECFDF3]' : 'editorial-btn-outline'
                              }`}
                            >
                              {pct > 0 ? `+${pct}%` : `${pct}%`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stock Cards Grid (Showing All Tradable Stocks Across Rounds) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1">
                        {allStocks.map((stock) => {
                          const isSelected = selectedStockSymbols.includes(stock.symbol);
                          const shockVal = crisisImpacts[stock.symbol];
                          const hasShock = shockVal !== undefined && shockVal !== 0;
                          const currentPrice = Number(stock.price || stock.basePrice || 100);
                          const projectedPrice = currentPrice * (1 + (Number(shockVal || 0) / 100));

                          return (
                            <div
                              key={stock.symbol}
                              className={`editorial-card p-3 space-y-2 border transition-all ${
                                isSelected ? 'border-[#0F0F11] ring-1 ring-[#0F0F11]' : 'border-[#E5E5E5]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectStock(stock.symbol)}
                                    className="rounded border-[#E5E5E5]"
                                  />
                                  <span className="font-mono font-bold text-xs">{stock.symbol}</span>
                                </label>
                                <span className="text-[10px] font-mono text-[#71717A]">
                                  {stock.sector || stock.category}
                                </span>
                              </div>

                              <div className="text-[11px] text-[#71717A] truncate">{stock.name}</div>

                              {/* Price Comparison */}
                              <div className="flex items-baseline justify-between font-mono text-xs pt-1 border-t border-[#E5E5E5]">
                                <span className="text-[#71717A]">Cur: PKR {currentPrice.toFixed(1)}</span>
                                {hasShock && (
                                  <span className={`font-bold ${shockVal >= 0 ? 'text-[#027A48]' : 'text-[#B42318]'}`}>
                                    → PKR {projectedPrice.toFixed(1)}
                                  </span>
                                )}
                              </div>

                              {/* Shock Input (Percent or Direct Target Price) */}
                              <div className="pt-1">
                                {shockMode === 'percent' ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-[#71717A]">Shock:</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      placeholder="±%"
                                      value={shockVal !== undefined ? shockVal : ''}
                                      onChange={(e) => handleSetIndividualStockShock(stock.symbol, e.target.value)}
                                      className="editorial-input font-mono text-xs w-full py-1"
                                    />
                                    <span className="font-mono text-xs text-[#71717A]">%</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-[#71717A]">Target:</span>
                                    <input
                                      type="number"
                                      step="1"
                                      placeholder="PKR"
                                      value={hasShock ? projectedPrice.toFixed(1) : ''}
                                      onChange={(e) => handleSetPriceTargetShock(stock.symbol, e.target.value)}
                                      className="editorial-input font-mono text-xs w-full py-1"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Submit Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveCrisisDraft}
                        disabled={actionLoading}
                        className="editorial-btn editorial-btn-outline text-xs py-2 px-4"
                      >
                        Save to Drafts Pipeline
                      </button>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="editorial-btn editorial-btn-dark text-xs py-2 px-6"
                      >
                        Schedule Crisis #{crisisNum} into Round {crisisRound}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Crises Roster & Drafts View */}
                <div className="editorial-card p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        Crisis Intelligence & Drafts Pipeline
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Author, stage, and schedule crisis scenarios for each round with custom stock impacts.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setCrisesViewTab('drafts')}
                        className={`editorial-btn text-xs py-1.5 px-3 cursor-pointer ${
                          crisesViewTab === 'drafts' ? 'editorial-btn-dark' : 'editorial-btn-outline'
                        }`}
                      >
                        📋 Drafts ({draftCrises.length})
                      </button>
                      {[1, 2, 3].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setCrisesViewTab(String(r))}
                          className={`editorial-btn text-xs py-1.5 px-3 cursor-pointer ${
                            crisesViewTab === String(r) ? 'editorial-btn-dark' : 'editorial-btn-outline'
                          }`}
                        >
                          Round {r} ({(gameState.crisesByRound?.[r] || []).length})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drafts Tab */}
                  {crisesViewTab === 'drafts' && (
                    <div className="space-y-3.5">
                      {draftCrises.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[var(--text-muted)] rounded-xl bg-[var(--card-inset)] border border-[var(--border-subtle)]">
                          No draft crises currently in the pipeline. Use the authoring form above to create drafts.
                        </div>
                      ) : (
                        draftCrises.map((draft, idx) => {
                          const impacts = draft.impacts || {};
                          const impactEntries = Object.entries(impacts);
                          const title = cleanHeadline(draft.headline || draft.title || 'Untitled Market Crisis');
                          const roundNum = draft.round || 1;
                          const crisisNum = draft.number || idx + 1;

                          return (
                            <div key={draft.id} className="editorial-card p-5 space-y-3.5 bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] transition-all">
                              {/* Top Meta Badges: Round & Crisis Number */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="editorial-badge text-[11px] font-mono font-bold bg-[var(--accent-brown-bg)] text-[var(--accent-brown)] border border-[var(--accent-brown-border)]">
                                    ROUND {roundNum}
                                  </span>
                                  <span className="editorial-badge text-[11px] font-mono font-bold bg-[var(--card-inset)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                                    CRISIS #{crisisNum}
                                  </span>
                                  <span className="font-mono text-[11px] text-[var(--text-muted)] font-semibold">
                                    {draft.cipherCode || `CIPHER-R${roundNum}-0${crisisNum}`}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--card-inset)] text-[var(--accent-yellow-text)] border border-[var(--accent-yellow-border)]">
                                  DRAFT SCENARIO
                                </span>
                              </div>

                              {/* Main Headline (Clean & Prominently Highlighted) */}
                              <div>
                                <h4 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                                  {title}
                                </h4>
                              </div>

                              {/* Description / Briefing (Prominently Highlighted Container) */}
                              <div className="p-3.5 rounded-xl bg-[var(--card-inset)] border border-[var(--border-subtle)] space-y-1">
                                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                                  Intelligence Briefing
                                </span>
                                <p className="text-xs sm:text-sm text-[var(--text-primary)] font-rounded leading-relaxed">
                                  {draft.description}
                                </p>
                              </div>

                              {/* Stock Impact Shocks */}
                              {impactEntries.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                                    Asset Shockwave Impacts ({impactEntries.length} Securities):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {impactEntries.map(([sym, pct]) => {
                                      const num = Number(pct);
                                      const isPositive = num >= 0;
                                      return (
                                        <span
                                          key={sym}
                                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                                            isPositive
                                              ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                                              : 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border-[var(--accent-red-border)]'
                                          }`}
                                        >
                                          {sym}: {isPositive ? `+${num}%` : `${num}%`}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCrisisRound(roundNum);
                                    setCrisisNum(crisisNum);
                                    setCrisisHeadline(title);
                                    setCrisisDesc(draft.description || '');
                                    setCrisisImpacts(draft.impacts || {});
                                    setSelectedStockSymbols(Object.keys(draft.impacts || {}));
                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                  }}
                                  className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3 cursor-pointer"
                                >
                                  Load in Studio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePublishDraftCrisis(draft)}
                                  disabled={actionLoading}
                                  className="editorial-btn editorial-btn-green text-xs py-1.5 px-3 cursor-pointer shadow-xs"
                                >
                                  🚀 Release to Floor
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDraftCrisis(draft.id)}
                                  disabled={actionLoading}
                                  className="editorial-btn editorial-btn-outline text-[#B42318] text-xs py-1.5 px-2.5 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Scheduled Round Crises Tab */}
                  {crisesViewTab !== 'drafts' && (
                    <div className="space-y-3.5">
                      {(gameState.crisesByRound?.[Number(crisesViewTab)] || []).length === 0 ? (
                        <div className="p-8 text-center text-xs text-[var(--text-muted)] rounded-xl bg-[var(--card-inset)] border border-[var(--border-subtle)]">
                          No scheduled crises in Round {crisesViewTab} yet. Use the authoring form above to schedule crises for this round.
                        </div>
                      ) : (
                        (gameState.crisesByRound[Number(crisesViewTab)] || []).map((cr, idx) => {
                          const impacts = cr.impacts || {};
                          const impactEntries = Object.entries(impacts);
                          const title = cleanHeadline(cr.headline || cr.title || `Scheduled Crisis #${cr.number || idx + 1}`);
                          const roundNum = Number(crisesViewTab);
                          const crisisNum = cr.number || idx + 1;

                          return (
                            <div key={cr.number || idx} className="editorial-card p-5 space-y-3.5 bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] transition-all">
                              {/* Top Meta Badges: Round & Crisis Number */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="editorial-badge text-[11px] font-mono font-bold bg-[var(--accent-brown-bg)] text-[var(--accent-brown)] border border-[var(--accent-brown-border)]">
                                    ROUND {roundNum}
                                  </span>
                                  <span className="editorial-badge text-[11px] font-mono font-bold bg-[var(--card-inset)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                                    CRISIS #{crisisNum}
                                  </span>
                                  <span className="font-mono text-[11px] text-[var(--text-muted)] font-semibold">
                                    {cr.cipherCode || `CIPHER-R${roundNum}-0${crisisNum}`}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border border-[var(--accent-green-border)]">
                                  SCHEDULED
                                </span>
                              </div>

                              {/* Main Headline (Clean & Prominently Highlighted, NO #1 or 1 2 3 prepended) */}
                              <div>
                                <h4 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                                  {title}
                                </h4>
                              </div>

                              {/* Description / Briefing (Prominently Highlighted Container) */}
                              <div className="p-3.5 rounded-xl bg-[var(--card-inset)] border border-[var(--border-subtle)] space-y-1">
                                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                                  Intelligence Briefing
                                </span>
                                <p className="text-xs sm:text-sm text-[var(--text-primary)] font-rounded leading-relaxed">
                                  {cr.description}
                                </p>
                              </div>

                              {/* Stock Impact Shocks */}
                              {impactEntries.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                                    Asset Shockwave Impacts ({impactEntries.length} Securities):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {impactEntries.map(([sym, pct]) => {
                                      const num = Number(pct);
                                      const isPositive = num >= 0;
                                      return (
                                        <span
                                          key={sym}
                                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                                            isPositive
                                              ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border-[var(--accent-green-border)]'
                                              : 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border-[var(--accent-red-border)]'
                                          }`}
                                        >
                                          {sym}: {isPositive ? `+${num}%` : `${num}%`}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCrisisRound(roundNum);
                                    setCrisisNum(crisisNum);
                                    setCrisisHeadline(title);
                                    setCrisisDesc(cr.description || '');
                                    setCrisisImpacts(cr.impacts || {});
                                    setSelectedStockSymbols(Object.keys(cr.impacts || {}));
                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                  }}
                                  className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3 cursor-pointer"
                                >
                                  Load in Studio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleFloorAction('START_DECRYPT', { crisis: cr });
                                  }}
                                  disabled={actionLoading}
                                  className="editorial-btn editorial-btn-green text-xs py-1.5 px-3 cursor-pointer shadow-xs"
                                >
                                  🚀 Release to Floor
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScheduledCrisis(Number(crisesViewTab), cr.number, cr.id, idx)}
                                  disabled={actionLoading}
                                  className="editorial-btn editorial-btn-outline text-[#B42318] text-xs py-1.5 px-2.5 cursor-pointer"
                                  title="Delete Crisis from this Round"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 3: STOCKS & INSTRUMENTS INVENTORY */}
            {/* ========================================================== */}
            {adminTab === 'stocks' && (
              <div className="space-y-5">
                
                {/* Add New Instrument Form */}
                <div className="editorial-card p-5 sm:p-6 space-y-4">
                  <div className="border-b border-[#E5E5E5] pb-3">
                    <h3 className="font-serif text-lg font-bold text-[#0F0F11]">
                      Register New Instrument on Floor
                    </h3>
                    <p className="text-xs text-[#71717A]">
                      Add new PSX equities, global commodities, or foreign exchange currency pairs.
                    </p>
                  </div>

                  <form onSubmit={handleAddStockSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Symbol
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MEBL"
                        value={newStockSymbol}
                        onChange={(e) => setNewStockSymbol(e.target.value)}
                        className="editorial-input w-full font-mono text-xs uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Company Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Meezan Bank Limited"
                        value={newStockName}
                        onChange={(e) => setNewStockName(e.target.value)}
                        className="editorial-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Sector
                      </label>
                      <input
                        type="text"
                        placeholder="Banking / Fuel & Power"
                        value={newStockSector}
                        onChange={(e) => setNewStockSector(e.target.value)}
                        className="editorial-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Base Price (PKR)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newStockPrice}
                        onChange={(e) => setNewStockPrice(Number(e.target.value))}
                        className="editorial-input w-full font-mono text-xs"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="editorial-btn editorial-btn-dark w-full justify-center text-xs py-2"
                      >
                        + Add Instrument
                      </button>
                    </div>
                  </form>
                </div>

                {/* Instruments Inventory Table */}
                <div className="editorial-card p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#0F0F11]">
                        Exchange Securities Inventory ({allStocks.length})
                      </h3>
                      <p className="text-xs text-[#71717A]">
                        Live prices, circuit breaker halts, and price adjustment controls.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={stocksFilterSector}
                        onChange={(e) => setStocksFilterSector(e.target.value)}
                        className="editorial-input text-xs font-mono"
                      >
                        <option value="ALL">All Sectors</option>
                        {uniqueSectors.map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Filter symbol or name..."
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                        className="editorial-input text-xs w-48"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-[#E5E5E5] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] font-mono text-[11px] uppercase text-[#71717A]">
                        <tr>
                          <th className="py-2.5 px-3">Symbol</th>
                          <th className="py-2.5 px-3">Company / Asset</th>
                          <th className="py-2.5 px-3">Sector</th>
                          <th className="py-2.5 px-3">Current Price</th>
                          <th className="py-2.5 px-3">Halt Status</th>
                          <th className="py-2.5 px-3">Direct Price Edit</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {filteredInventoryStocks.map((stock) => (
                          <tr key={stock.symbol} className="hover:bg-[#FBFBFA]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0F0F11]">
                              {stock.symbol}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#52525B]">
                              {stock.name}
                            </td>
                            <td className="py-2.5 px-3 text-[#71717A]">
                              {stock.sector || stock.category}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0F0F11]">
                              PKR {Number(stock.price || stock.basePrice || 100).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`editorial-badge text-[10px] ${stock.isHalted ? 'bg-[#FEF3F2] text-[#B42318]' : 'bg-[#ECFDF3] text-[#027A48]'}`}>
                                {stock.isHalted ? 'HALTED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.5"
                                  placeholder={String(stock.price || 100)}
                                  onChange={(e) =>
                                    setEditingStockPrices((prev) => ({
                                      ...prev,
                                      [stock.symbol]: e.target.value
                                    }))
                                  }
                                  className="editorial-input font-mono text-xs w-24 py-1"
                                />
                                <button
                                  onClick={() => handleUpdateStockPrice(stock.symbol)}
                                  className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2"
                                >
                                  Update
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-1.5">
                              <button
                                onClick={() => handleToggleStockHalt(stock.symbol)}
                                className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2"
                              >
                                {stock.isHalted ? 'Resume' : 'Halt'}
                              </button>
                              <button
                                onClick={() => handleRemoveStock(stock.symbol)}
                                className="editorial-btn editorial-btn-outline text-[#B42318] text-[11px] py-1 px-2"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 4: ROUND 3 OFFSHORE TAX HAVENS & CITIES */}
            {/* ========================================================== */}
            {adminTab === 'havens' && (
              <div className="editorial-card p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#0F0F11]">
                      Round 3: 10 Offshore Tax Havens & Smuggling Cities
                    </h3>
                    <p className="text-xs text-[#71717A]">
                      Configure secret wire thresholds, statutory tax fee deductions, and regulatory interception penalties per city.
                    </p>
                  </div>
                  <button
                    onClick={fetchTaxHavens}
                    className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3"
                  >
                    Refresh Havens
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {havensList.map((haven) => (
                    <div key={haven.id} className="editorial-card p-4 space-y-3 bg-[#FAFAFA]">
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-[#0F0F11]">
                            {haven.city || haven.name}
                          </div>
                          <span className="text-[11px] font-mono text-[#71717A]">
                            {haven.country} · {haven.airportCode || 'AIR'}
                          </span>
                        </div>
                        <span className="editorial-badge text-[10px]">
                          CITY #{haven.id}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#52525B] line-clamp-2">
                        {haven.description}
                      </p>

                      <div className="space-y-2 pt-1 font-mono text-xs">
                        <div>
                          <label className="block text-[10px] uppercase text-[#71717A] font-bold mb-0.5">
                            Secret Safe Wire Limit ($)
                          </label>
                          <input
                            type="number"
                            step="1000"
                            value={haven.safeLimit !== undefined ? haven.safeLimit : 25000}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setAdminHavens((prev) =>
                                prev.map((h) => (h.id === haven.id ? { ...h, safeLimit: val } : h))
                              );
                            }}
                            className="editorial-input w-full font-mono text-xs py-1"
                          />
                          <span className="text-[10px] text-[#71717A] block mt-0.5">
                            Transfers above this limit trigger government interception!
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase text-[#71717A] font-bold mb-0.5">
                              Tax Fee (%)
                            </label>
                            <input
                              type="number"
                              step="1"
                              value={haven.taxRatePercent !== undefined ? haven.taxRatePercent : 20}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setAdminHavens((prev) =>
                                  prev.map((h) => (h.id === haven.id ? { ...h, taxRatePercent: val } : h))
                                );
                              }}
                              className="editorial-input w-full font-mono text-xs py-1"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase text-[#71717A] font-bold mb-0.5">
                              Interception Penalty (%)
                            </label>
                            <input
                              type="number"
                              step="1"
                              value={haven.penaltyRatePercent !== undefined ? haven.penaltyRatePercent : 40}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setAdminHavens((prev) =>
                                  prev.map((h) => (h.id === haven.id ? { ...h, penaltyRatePercent: val } : h))
                                );
                              }}
                              className="editorial-input w-full font-mono text-xs py-1"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpdateHaven(haven)}
                        className="editorial-btn editorial-btn-dark w-full justify-center text-xs py-1.5 mt-2"
                      >
                        Save Haven Parameters
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 5: ROUND SCHEDULES & TIMERS */}
            {/* ========================================================== */}
            {adminTab === 'rounds' && (
              <div className="editorial-card p-5 sm:p-6 space-y-5">
                <div className="border-b border-[#E5E5E5] pb-3">
                  <h3 className="font-serif text-xl font-bold text-[#0F0F11]">
                    Tournament Timers & Round Schedules
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Configure default phase countdown durations for Round 1, Round 2, and Round 3.
                  </p>
                </div>

                <form onSubmit={handleSaveRoundSettings} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Decrypt Time (Sec)
                      </label>
                      <input
                        type="number"
                        value={decryptSecInput}
                        onChange={(e) => setDecryptSecInput(e.target.value)}
                        className="editorial-input w-full font-mono text-xs"
                      />
                      <span className="text-[10px] text-[#71717A] mt-1 block">Default: 180s (3m)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Trading Window (Sec)
                      </label>
                      <input
                        type="number"
                        value={tradingSecInput}
                        onChange={(e) => setTradingSecInput(e.target.value)}
                        className="editorial-input w-full font-mono text-xs"
                      />
                      <span className="text-[10px] text-[#71717A] mt-1 block">R1/R2: 300s (5m), R3: 540s (9m)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1 font-bold">
                        Auto Shock Timer (Sec)
                      </label>
                      <input
                        type="number"
                        value={autoPriceShockSecInput}
                        onChange={(e) => setAutoPriceShockSecInput(e.target.value)}
                        className="editorial-input w-full font-mono text-xs"
                      />
                      <span className="text-[10px] text-[#71717A] mt-1 block">Default: 60s</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="editorial-btn editorial-btn-dark text-xs py-2 px-5"
                  >
                    Save Round Timers
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB 6: CONTESTANT TEAMS & DESKS */}
            {/* ========================================================== */}
            {adminTab === 'teams' && (
              <div className="editorial-card p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                      Contestant Desks & Security Passcodes
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Create new desks, ban disruptive teams, adjust starting cash, and reset passwords.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsCreateTeamModalOpen(true)}
                      className="editorial-btn editorial-btn-dark text-xs py-1.5 px-3"
                    >
                      + Create Team Desk
                    </button>
                    <input
                      type="text"
                      placeholder="Filter teams..."
                      value={teamsSearchQuery}
                      onChange={(e) => setTeamsSearchQuery(e.target.value)}
                      className="editorial-input text-xs w-48"
                    />
                  </div>
                </div>

                {/* Bulk Budget Reset Bar */}
                <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card-inset)] flex flex-wrap items-center justify-between gap-3 text-[var(--text-primary)]">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-[var(--text-muted)] uppercase text-[10px]">
                      Bulk Reset:
                    </span>
                    <span className="text-[var(--text-secondary)]">Set all desks cash to:</span>
                    <input
                      type="number"
                      step="5000"
                      value={bulkBudgetValue}
                      onChange={(e) => setBulkBudgetValue(e.target.value)}
                      className="editorial-input font-mono text-xs w-32 py-1"
                    />
                  </div>
                  <button
                    onClick={handleBulkUpdateAllBudgets}
                    className="editorial-btn editorial-btn-outline text-xs py-1 px-3"
                  >
                    Reset All Desks Budget
                  </button>
                </div>

                {/* Teams Roster Table */}
                <div className="overflow-x-auto border border-[var(--border-table)] rounded-lg">
                  <table className="w-full text-left text-xs editorial-table">
                    <thead className="bg-[var(--table-head-bg)] border-b border-[var(--border-table)] font-mono text-[11px] uppercase text-[var(--table-head-text)]">
                      <tr>
                        <th className="py-2.5 px-3">Desk Name / ID</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Liquid Cash</th>
                        <th className="py-2.5 px-3">Total Net Worth</th>
                        <th className="py-2.5 px-3">R1 / R2 Profit</th>
                        <th className="py-2.5 px-3">Passcode</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-table)]">
                      {filteredTeams.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-muted)]">
                            No competitor teams registered yet.
                          </td>
                        </tr>
                      ) : (
                        filteredTeams.map((team) => (
                          <tr key={team.id} className="hover:bg-[var(--table-row-hover)] transition-colors">
                            <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                              {team.name || team.id}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`editorial-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                                team.isBanned 
                                  ? 'bg-[var(--accent-red-bg)] text-[var(--accent-red-text)] border border-[var(--accent-red-border)]' 
                                  : 'bg-[var(--accent-green-bg)] text-[var(--accent-green-text)] border border-[var(--accent-green-border)]'
                              }`}>
                                {team.isBanned ? 'BANNED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="1000"
                                  placeholder={String(team.cash || 0)}
                                  onChange={(e) =>
                                    setEditingTeamBudget((prev) => ({
                                      ...prev,
                                      [team.id]: e.target.value
                                    }))
                                  }
                                  className="editorial-input font-mono text-xs w-28 py-1"
                                />
                                <button
                                  onClick={() => handleUpdateTeamBudget(team.id)}
                                  className="editorial-btn editorial-btn-outline text-[10px] py-1 px-1.5"
                                >
                                  Save
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">
                              PKR {Number(team.totalPortfolioValue || team.netWorth || team.cash || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                              R1: {team.round1Profit !== undefined ? `${team.round1Profit >= 0 ? '+' : ''}${team.round1Profit.toLocaleString()}` : '0'} • R2: {team.round2Profit !== undefined ? `${team.round2Profit >= 0 ? '+' : ''}${team.round2Profit.toLocaleString()}` : '0'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  defaultValue={team.passcode || ''}
                                  onChange={(e) =>
                                    setEditingTeamPass((prev) => ({
                                      ...prev,
                                      [team.id]: e.target.value
                                    }))
                                  }
                                  className="editorial-input font-mono text-xs w-20 py-1"
                                />
                                <button
                                  onClick={() => handleResetTeamPass(team.id)}
                                  className="editorial-btn editorial-btn-outline text-[10px] py-1 px-1.5"
                                >
                                  Reset
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5">
                              <button
                                onClick={() => handleToggleTeamBan(team.id, team.isBanned)}
                                className={`editorial-btn text-[11px] py-1 px-2.5 ${
                                  team.isBanned 
                                    ? 'editorial-btn-green' 
                                    : 'editorial-btn-outline text-[var(--accent-red-text)] border-[var(--border-subtle)] hover:bg-[var(--accent-red-bg)]'
                                }`}
                              >
                                {team.isBanned ? 'Unban' : 'Ban Desk'}
                              </button>
                              <button
                                onClick={() => handleDeleteTeam(team.id, team.name)}
                                className="editorial-btn editorial-btn-outline text-[var(--accent-red-text)] border-[var(--border-subtle)] hover:bg-[var(--accent-red-bg)] text-[11px] py-1 px-2.5"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: CREATE TEAM DESK */}
      {/* ============================================================== */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="editorial-card p-6 max-w-md w-full space-y-4 shadow-2xl border border-[var(--border-strong)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                Provision New Contestant Desk
              </h3>
              <button
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors"
              >
                x
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3 font-rounded">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] font-bold mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Team Alpha"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="editorial-input w-full text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] font-bold mb-1">
                  Desk Passcode
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234"
                  value={newTeamPasscode}
                  onChange={(e) => setNewTeamPasscode(e.target.value)}
                  className="editorial-input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[var(--text-muted)] font-bold mb-1">
                  Starting Cash (PKR)
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={newTeamBudget}
                  onChange={(e) => setNewTeamBudget(Number(e.target.value))}
                  className="editorial-input w-full font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamModalOpen(false)}
                  className="editorial-btn editorial-btn-outline text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="editorial-btn editorial-btn-dark text-xs py-2 px-5"
                >
                  Create Team Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MOBILE / TABLET NAVIGATION WINDOW (MODAL DIALOG) */}
      {/* ============================================================== */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div
            className="editorial-card w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col shadow-2xl rounded-2xl border border-[var(--border-subtle)]"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8D5B3A] text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1C1917] dark:text-[#FAFAFA]">
                    Admin Navigation Deck
                  </h3>
                  <p className="text-[11px] text-[#71717A]">
                    Select a floor module to switch view
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="editorial-btn editorial-btn-outline p-2 text-xs"
                title="Close Navigation Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Window Body: Vertical List of all 6 modules */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 no-scrollbar">
              {[
                { id: 'controls', label: 'Live Cockpit', desc: 'Phase timers, emergency stops & floor engine', Icon: Activity, badge: gameState.phase },
                { id: 'crises', label: 'Crisis Studio', desc: 'Authoring studio & stock shockwave triggers', Icon: Layers, badge: `${currentCrises.length}+${draftCrises.length}` },
                { id: 'stocks', label: 'Stock Inventory', desc: 'PSX equities, FX pairs & commodity contracts', Icon: TrendingUp, badge: allStocks.length },
                { id: 'havens', label: 'Offshore Havens (R3)', desc: 'Smuggling hubs, offshore cities & tax brackets', Icon: Globe, badge: `${havensList.length} Cities` },
                { id: 'rounds', label: 'Round Schedules', desc: 'R1-R3 durations, intervals & auto shocks', Icon: Calendar, badge: 'R1-R3' },
                { id: 'teams', label: 'Contestant Desks', desc: 'Portfolios, cash balances & team access', Icon: Users, badge: adminTeams.length || Object.keys(gameState?.teams || {}).length }
              ].map((tab) => {
                const active = adminTab === tab.id;
                const TabIcon = tab.Icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setAdminTab(tab.id);
                      setIsMobileNavOpen(false);
                    }}
                    className={`editorial-btn w-full justify-between p-3.5 text-xs font-medium text-left rounded-xl transition-all ${
                      active
                        ? 'editorial-btn-dark shadow-sm ring-1 ring-[#8D5B3A]'
                        : 'editorial-btn-outline hover:border-[#8D5B3A]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? 'bg-[#73482C] text-white' : 'bg-[#F4EFEB] dark:bg-[#221D1A] text-[#8D5B3A]'
                      }`}>
                        <TabIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold block text-sm">{tab.label}</span>
                        <span className="text-[11px] block opacity-75 truncate">{tab.desc}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 font-bold ${
                        active
                          ? 'border-[#5D3720] bg-[#73482C] text-[#FFFFFF]'
                          : 'border-[#E5E5E5] bg-[#F4EFEB] text-[#71717A]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Window Footer: Desk Sign-In Lock Controls */}
            <div className="p-4 border-t border-[#E5E5E5] bg-[#F4EFEB] dark:bg-[#221D1A] shrink-0 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] font-bold text-[#71717A] uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#71717A]" />
                  Contestant Sign-In Lock:
                </span>
                <span className={`editorial-badge text-[10px] ${gameState.loginsEnabled ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]' : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'}`}>
                  {gameState.loginsEnabled ? 'OPEN FOR SIGN-IN' : 'LOCKED'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleLogins}
                disabled={actionLoading}
                className={`editorial-btn w-full justify-center text-xs py-2.5 font-bold ${
                  gameState.loginsEnabled
                    ? 'editorial-btn-outline text-[#B42318] hover:bg-[#FEF3F2]'
                    : 'editorial-btn-green'
                }`}
              >
                {gameState.loginsEnabled ? 'Lock Desks (Disable Sign-In)' : 'Unlock Desks (Allow Sign-In)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
