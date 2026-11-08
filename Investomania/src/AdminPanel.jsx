import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { TactileButton, MiniSparkline } from '../components/ui/EasyComponents.jsx';
import { formatTimer } from './TradingPortal.jsx';

export default function AdminPanel() {
  const navigate = useNavigate();
  const {
    gameState,
    adminPasskey,
    setAdminPasskey,
    sendAdminPhaseAction,
    switchAdminRound,
    theme,
    toggleTheme
  } = useGame();

  const savedPass = localStorage.getItem('investomania_admin_pass') || adminPasskey || '';
  const [passInput, setPassInput] = useState(savedPass || 'admin123');
  const [isUnlocked, setIsUnlocked] = useState(() => Boolean(savedPass));
  const [adminTab, setAdminTab] = useState('controls'); // 'controls' | 'crises' | 'stocks' | 'rounds' | 'teams'
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Stock form state
  const [stockSym, setStockSym] = useState('');
  const [stockName, setStockName] = useState('');
  const [stockDesc, setStockDesc] = useState('');
  const [stockCat, setStockCat] = useState('PSX Stock');
  const [stockSec, setStockSec] = useState('Energy');
  const [stockRound, setStockRound] = useState(1);
  const [stockPrice, setStockPrice] = useState(100);
  const [stocksFilterRound, setStocksFilterRound] = useState('ALL');

  // Crisis Management form state
  const [crisisRound, setCrisisRound] = useState(1);
  const [crisisNum, setCrisisNum] = useState(1);
  const [crisisHeadline, setCrisisHeadline] = useState('');
  const [crisisDesc, setCrisisDesc] = useState('');
  const [crisisImpactSym, setCrisisImpactSym] = useState('');
  const [crisisImpactPct, setCrisisImpactPct] = useState(10);
  const [crisisImpacts, setCrisisImpacts] = useState({});
  const [crisesViewTab, setCrisesViewTab] = useState('1'); // '1' | '2' | '3' | 'drafts'

  // Round Setup form state (Timers)
  const [roundTimers, setRoundTimers] = useState({
    1: { decryptSeconds: 180, tradingSeconds: 300, autoPriceShockSeconds: 60 },
    2: { decryptSeconds: 180, tradingSeconds: 300, autoPriceShockSeconds: 60 },
    3: { decryptSeconds: 180, tradingSeconds: 540, autoPriceShockSeconds: 90 }
  });

  // Offshore Haven management state
  const [adminHavens, setAdminHavens] = useState([]);

  // Teams overview state
  const [adminTeams, setAdminTeams] = useState([]);
  const [editingTeamPass, setEditingTeamPass] = useState({});

  // Crisis selection & custom timing controls
  const [selectedCrisisToRelease, setSelectedCrisisToRelease] = useState('');
  const [customDecryptDurationMinutes, setCustomDecryptDurationMinutes] = useState(3);
  const [customTradingDurationMinutes, setCustomTradingDurationMinutes] = useState(5);

  // Admin passkey management
  const [adminPasskeysList, setAdminPasskeysList] = useState([]);
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  const [newPasskeyLabel, setNewPasskeyLabel] = useState('');
  const [creatingPasskey, setCreatingPasskey] = useState(false);
  const [passkeyNotice, setPasskeyNotice] = useState(null);

  const getEffectivePasskey = () => {
    return adminPasskey || localStorage.getItem('investomania_admin_pass') || 'admin123';
  };

  const fetchAdminOverview = async (keyOverride) => {
    const key = keyOverride || getEffectivePasskey();
    try {
      const res = await fetch(`/overview?passkey=${encodeURIComponent(key)}`);
      const json = await res.json();
      if (json.ok && json.data) {
        if (json.data.adminHavens) setAdminHavens(json.data.adminHavens);
        if (json.data.teams) setAdminTeams(json.data.teams);
        if (json.data.roundSettings) {
          setRoundTimers((prev) => ({ ...prev, ...json.data.roundSettings }));
        }
        if (json.data.adminPasskeys) {
          setAdminPasskeysList(json.data.adminPasskeys);
        }
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchAdminOverview();
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (gameState?.roundSettings) {
      setRoundTimers((prev) => ({ ...prev, ...gameState.roundSettings }));
    }
  }, [gameState?.roundSettings]);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    try {
      const keyToVerify = passInput.trim();
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: keyToVerify, passcode: keyToVerify })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Invalid Admin Passkey');
      if (typeof setAdminPasskey === 'function') {
        setAdminPasskey(keyToVerify);
      }
      localStorage.setItem('investomania_admin_pass', keyToVerify);
      setIsUnlocked(true);
      setStatusMsg('Admin Console Unlocked.');
      fetchAdminOverview(keyToVerify);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  const runAction = async (fn, label) => {
    setErrorMsg('');
    setStatusMsg('');
    try {
      await fn();
      setStatusMsg(`Success: ${label}`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Add Stock
  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!stockSym || !stockName) return;
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/stock/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey: key,
          passcode: key,
          symbol: stockSym,
          name: stockName,
          description: stockDesc,
          category: stockCat,
          sector: stockSec,
          round: Number(stockRound),
          basePrice: Number(stockPrice)
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to add stock');
      setStockSym('');
      setStockName('');
      setStockDesc('');
    }, `Added ${stockSym.toUpperCase()} to Round ${stockRound}`);
  };

  // Remove Stock
  const handleRemoveStock = async (symbol) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/stock/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key, passcode: key, symbol })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to remove stock');
    }, `Removed stock ${symbol}`);
  };

  // Add impact to crisis
  const addImpactToCrisis = () => {
    if (!crisisImpactSym) return;
    setCrisisImpacts((prev) => ({
      ...prev,
      [crisisImpactSym.toUpperCase()]: Number(crisisImpactPct)
    }));
    setCrisisImpactSym('');
  };

  // Save Crisis to Round Schedule
  const handleSaveCrisisToRound = async (e) => {
    e.preventDefault();
    if (!crisisHeadline || !crisisDesc) return;
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/crisis/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey: key,
          passcode: key,
          round: Number(crisisRound),
          crisisNumber: Number(crisisNum),
          headline: crisisHeadline,
          description: crisisDesc,
          impacts: crisisImpacts
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to save crisis');
      setCrisisHeadline('');
      setCrisisDesc('');
      setCrisisImpacts({});
    }, `Saved Crisis #${crisisNum} for Round ${crisisRound}`);
  };

  // Save Crisis as Draft
  const handleSaveDraftCrisis = async () => {
    if (!crisisHeadline || !crisisDesc) {
      setErrorMsg('Headline and Description are required to save a draft.');
      return;
    }
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/crisis/draft/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey: key,
          passcode: key,
          draft: {
            round: Number(crisisRound),
            crisisNumber: Number(crisisNum),
            headline: crisisHeadline,
            description: crisisDesc,
            impacts: crisisImpacts
          }
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to save draft');
      setCrisisHeadline('');
      setCrisisDesc('');
      setCrisisImpacts({});
    }, 'Saved Crisis Draft');
  };

  // Delete Draft Crisis
  const handleDeleteDraft = async (draftId) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/crisis/draft/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key, passcode: key, draftId })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to delete draft');
    }, 'Deleted Crisis Draft');
  };

  // Publish Draft Crisis
  const handlePublishDraft = async (draft, triggerImmediately = false) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/crisis/draft/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey: key,
          passcode: key,
          draftId: draft.id,
          targetRound: draft.round,
          triggerImmediately
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to publish draft');
    }, `Published Draft to Round ${draft.round}${triggerImmediately ? ' & Triggered Live' : ''}`);
  };

  // Remove Scheduled Crisis
  const handleRemoveCrisis = async (round, num) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/crisis/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key, passcode: key, round, crisisNumber: num })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to remove crisis');
    }, `Removed Crisis #${num} from Round ${round}`);
  };

  // Save Round Timers
  const handleSaveRoundTimers = async (e) => {
    e.preventDefault();
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/round-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key, passcode: key, roundSettings: roundTimers })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to update round timers');
    }, 'Updated Tournament Timing Setup');
  };

  // Update Tax Haven Safe Limits
  const handleUpdateHaven = async (haven) => {
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/tax-haven/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey: key,
          passcode: key,
          channelId: haven.id,
          safeLimit: Number(haven.safeLimit),
          taxRatePercent: Number(haven.taxRatePercent),
          penaltyRatePercent: Number(haven.penaltyRatePercent)
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to update haven');
      if (json.data?.havens) setAdminHavens(json.data.havens);
    }, `Updated Secret Wire Threshold for ${haven.city || haven.name} to $${Number(haven.safeLimit).toLocaleString()}`);
  };

  // Reset Team Passcode
  const handleResetTeamPass = async (teamId) => {
    const newPass = editingTeamPass[teamId];
    if (!newPass) return;
    const key = getEffectivePasskey();
    runAction(async () => {
      const res = await fetch('/api/admin/team/reset-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: key, teamId, newPasscode: newPass })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to reset passcode');
      fetchAdminOverview(key);
    }, `Reset passcode for ${teamId}`);
  };

  // Loading Guard
  if (!gameState) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <div className="surface-box rounded-[32px] p-8 text-center space-y-4">
          <div className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
            Connecting to Investomania Engine...
          </div>
          <p className="text-xs font-rounded opacity-75">
            Establishing realtime link to local server and game state...
          </p>
        </div>
      </div>
    );
  }

  // Passkey Gateway (If locked)
  if (!isUnlocked) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md surface-box rounded-[36px] p-8 space-y-5"
        >
          <div className="text-center space-y-1">
            <div className="inline-flex rounded-full bg-[#5E1B21] text-[#D9BB7C] px-3.5 py-1 text-xs font-rounded font-bold">
              Organizers Only
            </div>
            <h1 className="font-display text-2xl" style={{ color: 'var(--text-main)' }}>
              Game Master Access
            </h1>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
              Enter the admin passkey to configure stocks, crises, and manage live rounds.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-2xl bg-[#B83A3A]/15 text-[#B83A3A] px-4 py-2 text-xs font-rounded font-bold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <input
              type="password"
              required
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Enter Admin Passkey (default: admin123)"
              className="w-full capsule-card rounded-full px-5 py-3 text-sm font-rounded font-bold focus:outline-none"
              style={{ color: 'var(--text-main)' }}
            />
            <TactileButton
              type="submit"
              className="w-full rounded-full py-3 bg-[#5E1B21] text-[#FAF7F5] font-display font-semibold text-sm shadow-md"
            >
              Verify Passkey
            </TactileButton>
          </form>

          <div className="text-center">
            <TactileButton
              onClick={() => navigate('/market')}
              className="text-xs font-rounded font-semibold text-[#D9BB7C] underline"
            >
              ← Back to Trading Floor
            </TactileButton>
          </div>
        </motion.div>
      </div>
    );
  }

  const allStocks = gameState?.allStocks || [];
  const currentCrises = gameState?.crisesByRound?.[gameState?.currentRound || 1] || [];
  const draftCrises = gameState?.draftCrises || [];
  const isTradingOpen = gameState.phase === 'TRADING' && !gameState.isPaused;

  const filteredInventoryStocks = allStocks.filter((s) => {
    if (stocksFilterRound === 'ALL') return true;
    return Number(s.round || 1) === Number(stocksFilterRound);
  });

  return (
    <div className="w-full min-h-screen p-3 sm:p-5 lg:p-7">
      <div className="w-full flex flex-col lg:flex-row gap-5 items-start">
        {/* ============================================================ */}
        {/* ADMIN SIDEBAR NAVIGATION */}
        {/* ============================================================ */}
        <aside className="surface-box rounded-[32px] p-4 flex lg:flex-col justify-between w-full lg:w-64 lg:sticky lg:top-5 lg:min-h-[calc(100vh-3.5rem)] shrink-0">
          <div className="flex lg:flex-col items-center lg:items-stretch gap-4 w-full">
            {/* Header Brand */}
            <div className="flex items-center gap-3 px-2 pt-1">
              <div className="w-11 h-11 rounded-full bg-[#5E1B21] text-[#D9BB7C] flex items-center justify-center font-display font-bold text-lg shadow-md shrink-0">
                GM
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-base font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                  Game Master
                </div>
                <span className="text-xs font-rounded font-semibold" style={{ color: 'var(--text-sub)' }}>
                  Round {gameState?.currentRound} • Crisis #{gameState?.currentCrisis}
                </span>
              </div>
            </div>

            {/* Quick Live Floor Status Badge */}
            <div className="capsule-card rounded-2xl p-3 hidden lg:block space-y-1">
              <div className="flex items-center justify-between text-xs font-rounded font-bold">
                <span style={{ color: 'var(--text-sub)' }}>Phase:</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isTradingOpen ? 'bg-[#3B7A57] text-white' : 'bg-[#B83A3A] text-white'
                  }`}
                >
                  {gameState.phase}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-rounded font-bold">
                <span style={{ color: 'var(--text-sub)' }}>Clock:</span>
                <span className="font-mono text-sm" style={{ color: 'var(--text-main)' }}>
                  {formatTimer(gameState.remainingSeconds)}
                </span>
              </div>
              {typeof gameState.priceShockCountdown === 'number' && gameState.priceShockCountdown > 0 && (
                <div className="text-[10px] text-[#D9BB7C] font-bold text-center bg-[#5E1B21]/30 rounded-lg py-1">
                  ⚡ Auto Shock: {gameState.priceShockCountdown}s
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="flex lg:flex-col gap-1.5 flex-wrap flex-1" aria-label="Admin Navigation">
              {[
                { id: 'controls', label: 'Live Control', badge: gameState.phase },
                { id: 'crises', label: 'Crises Hub', badge: `${currentCrises.length}+${draftCrises.length}` },
                { id: 'stocks', label: 'Stocks & Assets', badge: allStocks.length },
                { id: 'rounds', label: 'Rounds Setup', badge: `R1-R3` },
                { id: 'teams', label: 'Teams & Passcodes', badge: adminTeams.length || Object.keys(gameState?.teams || {}).length },
                { id: 'passkeys', label: 'Admin Passkeys', badge: adminPasskeysList.length || 1 }
              ].map((tab) => {
                const active = adminTab === tab.id;
                return (
                  <TactileButton
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`rounded-full px-4 py-3 flex items-center justify-between gap-2.5 text-xs font-rounded font-bold transition-all ${
                      active ? 'bg-[#5E1B21] text-[#FAF7F5] shadow-sm' : 'hover:opacity-100 opacity-80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                        active ? 'bg-[#D9BB7C] text-[#1A080C]' : 'capsule-inset'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </TactileButton>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Actions */}
          <div className="hidden lg:flex flex-col gap-2 pt-4 border-t border-[#9E7B81]/25">
            <TactileButton
              onClick={() => navigate('/market')}
              className="w-full rounded-full py-2 px-3 capsule-card text-xs font-rounded font-bold text-center"
            >
              Floor Portal →
            </TactileButton>

            <TactileButton
              onClick={toggleTheme}
              className="w-full rounded-full py-2 px-3 bg-[#2B1117] text-[#D9BB7C] text-xs font-rounded font-semibold text-center"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </TactileButton>

            <TactileButton
              onClick={() => {
                setIsUnlocked(false);
                if (typeof setAdminPasskey === 'function') setAdminPasskey('');
                localStorage.removeItem('investomania_admin_pass');
              }}
              className="w-full rounded-full py-2 px-3 capsule-card text-xs font-rounded font-semibold text-[#B83A3A] hover:bg-[#B83A3A]/10 text-center"
            >
              Lock Console
            </TactileButton>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN WORKSPACE CONTENT AREA */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* Status / Alert Banner */}
          {(statusMsg || errorMsg) && (
            <div
              className={`rounded-full px-6 py-2.5 text-xs font-rounded font-bold text-center ${
                errorMsg ? 'bg-[#B83A3A]/15 text-[#B83A3A]' : 'bg-[#3B7A57]/15 text-[#2D6344]'
              }`}
            >
              {errorMsg || statusMsg}
            </div>
          )}

          {/* TAB 1: LIVE CONTROL ROOM */}
          {adminTab === 'controls' && (
            <div className="space-y-5">
              {/* Cockpit Status Bar */}
              <div className="surface-box rounded-[32px] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl" style={{ color: 'var(--text-main)' }}>
                      Mission Control Cockpit
                    </h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                      Round {gameState.currentRound} of 3 • Active Crisis #{gameState.currentCrisis} of{' '}
                      {gameState.totalCrisesInRound}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`rounded-full px-4 py-1.5 text-xs font-rounded font-bold ${
                        isTradingOpen ? 'bg-[#3B7A57] text-white' : 'bg-[#B83A3A] text-white'
                      }`}
                    >
                      {gameState.phase}
                    </span>
                    <span className="rounded-full bg-[#2B1117] text-[#D9BB7C] px-5 py-1.5 font-mono font-bold text-base">
                      {formatTimer(gameState.remainingSeconds)}
                    </span>
                    <span className="rounded-full capsule-card px-3.5 py-1.5 text-xs font-rounded font-bold">
                      {gameState.isPaused ? '⏸️ PAUSED' : '▶️ RUNNING'}
                    </span>
                  </div>
                </div>

                {/* PROJECTOR CONTROLS CARD */}
                <div className="capsule-card rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-3 border border-[#9E7B81]/20">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#5E1B21] text-[#D9BB7C] flex items-center justify-center font-bold text-lg">
                      
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                        Main Hall Projector Screen
                      </h4>
                      <p className="text-xs font-rounded" style={{ color: 'var(--text-sub)' }}>
                        Launch fullscreen broadcast display or toggle dramatic emergency alerts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TactileButton
                      onClick={() => window.open('/projector', '_blank')}
                      className="rounded-full px-4 py-2 bg-[#5E1B21] text-[#FAF7F5] font-display text-xs"
                    >
                      Open Projector Window ↗
                    </TactileButton>
                    <TactileButton
                      onClick={() =>
                        runAction(
                          () => sendAdminPhaseAction('TOGGLE_PROJECTOR_ALERT'),
                          'Toggled Projector Alert Banner'
                        )
                      }
                      className={`rounded-full px-4 py-2 text-xs font-rounded font-bold ${
                        gameState.projectorAlert ? 'bg-[#B83A3A] text-white' : 'capsule-inset'
                      }`}
                    >
                      {gameState.projectorAlert ? 'Clear Alert' : 'Trigger Projector Alert'}
                    </TactileButton>
                  </div>
                </div>

                {/* PRIMARY FLOOR CONTROLS (TRADING ON/OFF & ROUND PHASES) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {/* Start Trading / Open Floor */}
                  <TactileButton
                    onClick={() =>
                      runAction(
                        () => sendAdminPhaseAction('START_TRADING'),
                        `Floor Opened (${gameState.currentRound === 3 ? '9m' : '5m'})`
                      )
                    }
                    className="rounded-full py-3.5 bg-[#3B7A57] text-white font-display text-xs shadow-md"
                  >
                    Open Floor (Start Trading)
                  </TactileButton>

                  {/* Lock Floor / Stop Trading */}
                  <TactileButton
                    onClick={() =>
                      runAction(() => sendAdminPhaseAction('LOCK_TRADING'), 'Floor Locked (Trading Off)')
                    }
                    className="rounded-full py-3.5 bg-[#B83A3A] text-white font-display text-xs shadow-md"
                  >
                    Stop Floor (Lock Trading)
                  </TactileButton>

                  {/* Pause / Resume Round Clock */}
                  <TactileButton
                    onClick={() =>
                      runAction(
                        () => sendAdminPhaseAction(gameState?.isPaused ? 'RESUME' : 'PAUSE'),
                        gameState?.isPaused ? 'Resumed Clock' : 'Paused Clock'
                      )
                    }
                    className="rounded-full py-3.5 capsule-card font-display text-xs font-bold"
                  >
                    {gameState?.isPaused ? '▶️ Resume Clock' : '⏸️ Pause Clock'}
                  </TactileButton>

                  {/* Start Decrypt Phase */}
                  <TactileButton
                    onClick={() =>
                      runAction(() => sendAdminPhaseAction('START_DECRYPT'), 'Started 3m Decrypt Phase')
                    }
                    className="rounded-full py-3.5 bg-[#5E1B21] text-[#FAF7F5] font-display text-xs shadow-md"
                  >
                    Start Decrypt Phase (3m)
                  </TactileButton>
                </div>

                {/* Round Switcher */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#9E7B81]/20">
                  <span className="text-xs font-rounded font-bold" style={{ color: 'var(--text-sub)' }}>
                    Round Switcher:
                  </span>
                  {[1, 2, 3].map((r) => (
                    <TactileButton
                      key={r}
                      onClick={() => runAction(() => switchAdminRound(r), `Switched to Round ${r}`)}
                      className={`rounded-full px-4 py-1.5 text-xs font-rounded font-bold ${
                        gameState?.currentRound === r
                          ? 'bg-[#5E1B21] text-[#D9BB7C]'
                          : 'capsule-card'
                      }`}
                    >
                      Round {r} ({r === 1 ? 'PSX' : r === 2 ? 'FX & Comm' : 'Smuggling'})
                    </TactileButton>
                  ))}
                  <TactileButton
                    onClick={() => runAction(() => sendAdminPhaseAction('RESET_GAME'), 'Reset Tournament Floor')}
                    className="ml-auto rounded-full px-4 py-1.5 capsule-card text-[#B83A3A] text-xs font-rounded font-bold hover:bg-[#B83A3A]/10"
                  >
                    Reset Game
                  </TactileButton>
                </div>
              </div>

              {/* CRISIS & PRICE SHOCK TRIGGER WORKFLOW */}
              <div className="surface-box rounded-[32px] p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9E7B81]/20 pb-3">
                  <div>
                    <h3 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                      Crisis Announcement &amp; Price Shock Sequence
                    </h3>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                      Investomania sequence: Release crisis decrypt &rarr; Open trading floor &rarr; Trigger market price shock
                    </p>
                  </div>
                  <span className="rounded-full bg-[#5E1B21] text-[#D9BB7C] px-3.5 py-1 text-xs font-rounded font-bold">
                    Round {gameState.currentRound} • Crisis #{gameState.currentCrisis} of {gameState.totalCrisesInRound || currentCrises.length || 8}
                  </span>
                </div>

                {/* CRISIS SELECTOR & TIMING CONFIGURATION BAR */}
                <div className="capsule-card rounded-2xl p-4.5 space-y-4 border border-[#9E7B81]/25">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    {/* Crisis Dropdown Selection */}
                    <div className="lg:col-span-6 space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center justify-between">
                        <span>Select Crisis to Release (Drafts &amp; Scheduled)</span>
                        <span className="font-mono text-[10px] text-[#D9BB7C]">
                          {draftCrises.length} Drafts • {currentCrises.length} Scheduled
                        </span>
                      </label>
                      <select
                        value={selectedCrisisToRelease}
                        onChange={(e) => setSelectedCrisisToRelease(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#9E7B81]/30 bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-rounded font-bold outline-none cursor-pointer focus:border-[#D9BB7C]"
                      >
                        <option value="">
                          Current Active Crisis: #{gameState.currentCrisis} {gameState.activeCrisis?.cipherCode ? `(${gameState.activeCrisis.cipherCode} - ${gameState.activeCrisis.headline})` : ''}
                        </option>

                        {/* Scheduled Crises for Current Round */}
                        {currentCrises.length > 0 && (
                          <optgroup label={`Scheduled Round ${gameState.currentRound} Crises`}>
                            {currentCrises.map((c) => (
                              <option key={`scheduled_${c.number}`} value={`scheduled_${c.number}`}>
                                #{c.number} • [{c.cipherCode}] {c.headline}
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {/* All Draft Crises */}
                        {draftCrises.length > 0 && (
                          <optgroup label="Draft Crises (from Crises Hub)">
                            {draftCrises.map((d) => (
                              <option key={`draft_${d.id}`} value={`draft_${d.id}`}>
                                Draft R{d.round} • #{d.crisisNumber} [{d.cipherCode}] {d.headline}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    {/* Decrypt Phase Timer Input */}
                    <div className="lg:col-span-3 space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center justify-between">
                        <span>Decrypt Clock (Minutes)</span>
                        <span className="font-mono text-[10px] text-[#D9BB7C]">Floor Locked</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={customDecryptDurationMinutes}
                          onChange={(e) => setCustomDecryptDurationMinutes(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#9E7B81]/30 bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-mono font-bold outline-none focus:border-[#D9BB7C]"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-sub)]">
                          min
                        </span>
                      </div>
                    </div>

                    {/* Trading Phase Timer Input */}
                    <div className="lg:col-span-3 space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center justify-between">
                        <span>Trading Clock (Minutes)</span>
                        <span className="font-mono text-[10px] text-[#3B7A57]">Floor Open</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={customTradingDurationMinutes}
                          onChange={(e) => setCustomTradingDurationMinutes(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#9E7B81]/30 bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-mono font-bold outline-none focus:border-[#D9BB7C]"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-sub)]">
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected or Active Crisis Preview Card */}
                {(() => {
                  let previewCrisis = gameState.activeCrisis;
                  let isDraftSelected = false;

                  if (selectedCrisisToRelease.startsWith('draft_')) {
                    const dId = selectedCrisisToRelease.replace('draft_', '');
                    const foundDraft = draftCrises.find((d) => d.id === dId);
                    if (foundDraft) {
                      previewCrisis = foundDraft;
                      isDraftSelected = true;
                    }
                  } else if (selectedCrisisToRelease.startsWith('scheduled_')) {
                    const cNum = Number(selectedCrisisToRelease.replace('scheduled_', ''));
                    const foundSched = currentCrises.find((c) => c.number === cNum);
                    if (foundSched) previewCrisis = foundSched;
                  }

                  if (!previewCrisis) {
                    return (
                      <div className="capsule-card rounded-2xl p-4 text-center text-xs opacity-75">
                        No crisis configured for this round. Add one in the Crises Hub!
                      </div>
                    );
                  }

                  const targetNum = previewCrisis.crisisNumber || previewCrisis.number || gameState.currentCrisis;
                  const releasedEntry = (gameState.releasedCrises || []).find(
                    (c) => c.number === targetNum && c.round === gameState.currentRound
                  );

                  return (
                    <div className="capsule-card rounded-2xl p-5 space-y-3 text-xs font-rounded border border-[#9E7B81]/25">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#D9BB7C] font-mono px-2.5 py-0.5 rounded-lg bg-[#5E1B21]">
                            {previewCrisis.cipherCode}
                          </span>
                          <span className="font-mono text-[11px] opacity-75">
                            Round {previewCrisis.round || gameState.currentRound} • Crisis #{targetNum}
                          </span>
                          {isDraftSelected && (
                            <span className="px-2 py-0.5 rounded-md bg-[#D9BB7C]/20 border border-[#D9BB7C]/40 text-[#D9BB7C] font-mono text-[10px] font-bold">
                              Draft Ready
                            </span>
                          )}
                        </div>

                        {releasedEntry ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B7A57]/20 border border-[#3B7A57]/40 text-[#3B7A57] font-bold text-xs">
                              <span className="w-2 h-2 rounded-full bg-[#3B7A57] animate-pulse" />
                              News Released: Active
                            </span>
                            {releasedEntry.priceChangeApplied ? (
                              <span className="px-2.5 py-1 rounded-full bg-[#D9BB7C]/20 border border-[#D9BB7C]/40 text-[#D9BB7C] font-bold text-xs">
                                Price Shock Applied
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-[#B83A3A]/20 border border-[#B83A3A]/40 text-[#B83A3A] font-bold text-xs">
                                Shock Pending
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full capsule-inset font-bold text-xs opacity-70">
                            News Not Yet Released
                          </span>
                        )}
                      </div>

                      <h4 className="font-display text-base font-bold" style={{ color: 'var(--text-main)' }}>
                        {previewCrisis.headline}
                      </h4>
                      <p style={{ color: 'var(--text-sub)' }}>{previewCrisis.description}</p>

                      {/* Stock Impacts Preview */}
                      {previewCrisis.impacts && Object.keys(previewCrisis.impacts).length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">Configured Impacts on Stocks:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(previewCrisis.impacts).map(([s, p]) => (
                              <span
                                key={s}
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  p >= 0 ? 'bg-[#3B7A57]/20 text-[#3B7A57]' : 'bg-[#B83A3A]/20 text-[#B83A3A]'
                                }`}
                              >
                                {s}: {p >= 0 ? `+${p}%` : `${p}%`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 3-STEP MANUAL SEQUENCE CONTROLS */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-sub)]">
                    <span>MANUAL SEQUENCE CONTROLS (GATED BY TIMING &amp; STATE)</span>
                    <span className="font-mono text-[11px] text-[#D9BB7C]">
                      Clock: {formatTimer(gameState.remainingSeconds)} ({gameState.phase})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Step 1: Release Crisis & Start Decrypt Timer */}
                    <TactileButton
                      onClick={() => {
                        const decryptSec = customDecryptDurationMinutes * 60;
                        if (selectedCrisisToRelease.startsWith('draft_')) {
                          const dId = selectedCrisisToRelease.replace('draft_', '');
                          const draft = draftCrises.find((d) => d.id === dId);
                          if (draft) {
                            runAction(async () => {
                              const key = getEffectivePasskey();
                              const res = await fetch('/api/admin/crisis/draft/publish', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  passkey: key,
                                  passcode: key,
                                  draftId: draft.id,
                                  targetRound: draft.round || gameState.currentRound,
                                  triggerImmediately: true
                                })
                              });
                              const json = await res.json();
                              if (!json.ok) throw new Error(json.error || 'Failed to publish draft');
                              await sendAdminPhaseAction('START_DECRYPT', decryptSec);
                            }, `Released Draft Crisis #${draft.crisisNumber} (${customDecryptDurationMinutes}m Decrypt Timer Started)`);
                            return;
                          }
                        }

                        let crisisNum = gameState.currentCrisis;
                        if (selectedCrisisToRelease.startsWith('scheduled_')) {
                          crisisNum = Number(selectedCrisisToRelease.replace('scheduled_', ''));
                        }

                        runAction(
                          async () => {
                            await sendAdminPhaseAction('TRIGGER_CRISIS', decryptSec, { crisisNumber: crisisNum });
                            await sendAdminPhaseAction('START_DECRYPT', decryptSec);
                          },
                          `Released Crisis #${crisisNum} (${customDecryptDurationMinutes}m Decrypt Clock Started)`
                        );
                      }}
                      className="rounded-2xl py-3.5 px-4 btn-primary font-display text-xs shadow-md flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <span className="font-bold tracking-wide">1. Release Crisis</span>
                      <span className="text-[10px] opacity-80 font-normal">
                        Starts {customDecryptDurationMinutes}m Decrypt (Floor Closed)
                      </span>
                    </TactileButton>

                    {/* Step 2: Open Trading Floor */}
                    {(() => {
                      const isDecryptActive = gameState.phase === 'DECRYPTING';
                      const isTradingActive = gameState.phase === 'TRADING';
                      const canOpenTrading = isDecryptActive || (!isTradingActive && (gameState.releasedCrises || []).length > 0);

                      return (
                        <TactileButton
                          disabled={!canOpenTrading && !isTradingActive}
                          onClick={() => {
                            const tradeSec = customTradingDurationMinutes * 60;
                            runAction(
                              () => sendAdminPhaseAction('START_TRADING', tradeSec),
                              `Opened Trading Floor for ${customTradingDurationMinutes} Minutes`
                            );
                          }}
                          className={`rounded-2xl py-3.5 px-4 font-display text-xs shadow-md flex flex-col items-center justify-center gap-1 text-center transition-all ${
                            isTradingActive
                              ? 'bg-[#3B7A57] text-white border border-[#3B7A57]/60'
                              : canOpenTrading
                              ? 'bg-[#2E7D52] hover:bg-[#256643] text-white'
                              : 'capsule-card opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-bold tracking-wide">
                            {isTradingActive ? 'Trading Floor Open' : '2. Open Trading Floor'}
                          </span>
                          <span className="text-[10px] opacity-80 font-normal">
                            {isTradingActive
                              ? `${formatTimer(gameState.remainingSeconds)} Remaining`
                              : canOpenTrading
                              ? `Unlock & Start ${customTradingDurationMinutes}m Window`
                              : 'Unlocks After Crisis Release'}
                          </span>
                        </TactileButton>
                      );
                    })()}

                    {/* Step 3: Trigger Price Shock Now */}
                    {(() => {
                      const releasedEntry = (gameState.releasedCrises || []).find(
                        (c) => c.number === gameState.currentCrisis && c.round === gameState.currentRound
                      );
                      const isShockApplied = Boolean(releasedEntry?.priceChangeApplied);

                      return (
                        <TactileButton
                          disabled={isShockApplied}
                          onClick={() =>
                            runAction(
                              () => sendAdminPhaseAction('APPLY_PRICE_SHOCK'),
                              `Triggered Market Price Shock for Crisis #${gameState.currentCrisis}`
                            )
                          }
                          className={`rounded-2xl py-3.5 px-4 font-display text-xs shadow-md flex flex-col items-center justify-center gap-1 text-center transition-all ${
                            isShockApplied
                              ? 'capsule-card opacity-50 cursor-not-allowed text-[var(--text-sub)]'
                              : 'bg-[#2B1117] text-[#D9BB7C] border border-[#D9BB7C]/40 hover:bg-[#3D141E]'
                          }`}
                        >
                          <span className="font-bold tracking-wide">
                            {isShockApplied ? 'Shock Already Applied' : '3. Trigger Price Shock'}
                          </span>
                          <span className="text-[10px] opacity-80 font-normal">
                            {isShockApplied ? 'Floor Shift Completed' : 'Apply Instant Market Price Shifts'}
                          </span>
                        </TactileButton>
                      );
                    })()}
                  </div>
                </div>

                {/* AUTOMATED WORKFLOW ENGINE (FROM INVESTOR FORUM) */}
                <div className="capsule-card rounded-2xl p-5 space-y-4 border border-[#D9BB7C]/30 bg-gradient-to-r from-[#2B1117]/60 via-[#1C060A]/80 to-[#2B1117]/60">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9E7B81]/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-[#5E1B21] text-[#D9BB7C] flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                        AUTO
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-[#D9BB7C]">
                          Automated Crisis &amp; Trading Floor Pipeline
                        </h4>
                        <p className="text-[11px] font-rounded text-[var(--text-sub)]">
                          Zero-touch cycle: Crisis Release (Decrypt closed) &rarr; Open Trading Floor &rarr; Auto Price Impact
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold ${
                        gameState.autoPilot !== false
                          ? 'bg-[#3B7A57]/20 border border-[#3B7A57]/50 text-[#3B7A57]'
                          : 'bg-[#B83A3A]/20 border border-[#B83A3A]/50 text-[#B83A3A]'
                      }`}>
                        Auto-Cycle: {gameState.autoPilot !== false ? 'ENABLED' : 'PAUSED'}
                      </span>
                      <TactileButton
                        onClick={() =>
                          runAction(
                            () => sendAdminPhaseAction('TOGGLE_AUTOPILOT'),
                            gameState.autoPilot !== false ? 'Automated Pipeline Paused' : 'Automated Pipeline Enabled'
                          )
                        }
                        className={`rounded-full px-4 py-1.5 font-display text-xs ${
                          gameState.autoPilot !== false
                            ? 'bg-[#B83A3A] text-white hover:bg-[#9E2F2F]'
                            : 'bg-[#3B7A57] text-white hover:bg-[#2F6547]'
                        }`}
                      >
                        {gameState.autoPilot !== false ? 'Pause Auto-Cycle' : 'Enable Auto-Cycle'}
                      </TactileButton>
                    </div>
                  </div>

                  {/* Visual Timeline Pipeline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-rounded">
                    <div className={`p-3 rounded-xl border ${
                      gameState.phase === 'DECRYPTING'
                        ? 'border-[#D9BB7C] bg-[#D9BB7C]/10 text-[var(--text-main)] shadow-sm'
                        : 'border-[#9E7B81]/20 bg-[var(--surface-2)]/40 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#D9BB7C]">1. Decrypt Window</span>
                        <span className="font-mono text-[11px]">
                          {customDecryptDurationMinutes}m Closed
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-sub)] mt-1">
                        Crisis broadcasted, trading strictly locked so contestants analyze news.
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      gameState.phase === 'TRADING'
                        ? 'border-[#3B7A57] bg-[#3B7A57]/15 text-[var(--text-main)] shadow-sm'
                        : 'border-[#9E7B81]/20 bg-[var(--surface-2)]/40 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#3B7A57]">2. Trading Window</span>
                        <span className="font-mono text-[11px]">
                          {customTradingDurationMinutes}m Open
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-sub)] mt-1">
                        Floor opens automatically. Live order placement across all instruments.
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      gameState.phase === 'COMPLETED'
                        ? 'border-[#B83A3A] bg-[#B83A3A]/15 text-[var(--text-main)] shadow-sm'
                        : 'border-[#9E7B81]/20 bg-[var(--surface-2)]/40 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#B83A3A]">3. Price Impact</span>
                        <span className="font-mono text-[11px]">Auto Shift</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-sub)] mt-1">
                        Timer expires &rarr; Floor pauses &rarr; Stock shifts apply instantly &rarr; Next crisis begins.
                      </p>
                    </div>
                  </div>

                  {/* Immediate Trigger Shortcut Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#9E7B81]/15">
                    <div className="text-[11px] text-[var(--text-sub)] font-mono">
                      Current sequence clock: <strong className="text-[#D9BB7C]">{formatTimer(gameState.remainingSeconds)}</strong> ({gameState.phase})
                    </div>
                    <div className="flex items-center gap-2">
                      <TactileButton
                        onClick={() =>
                          runAction(
                            () => sendAdminPhaseAction('TRIGGER_NEXT_CRISIS_AUTOMATED'),
                            'Triggered Next Crisis in Automated Flow'
                          )
                        }
                        className="rounded-full px-4 py-2 bg-[#D9BB7C] text-[#2B1117] font-display text-xs font-bold shadow-md hover:bg-[#E5CB8C]"
                      >
                        Trigger Next Crisis (Auto-Cycle)
                      </TactileButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRISES HUB & DRAFT CRISES */}
          {adminTab === 'crises' && (
            <div className="space-y-5">
              <div className="surface-box rounded-[32px] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9E7B81]/20 pb-3">
                  <div>
                    <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                      Crises Hub & Event Architect
                    </h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                      Manage scheduled crises per round, configure % price impacts, and author drafts.
                    </p>
                  </div>

                  {/* Sub Tabs */}
                  <div className="flex items-center gap-1.5 capsule-inset p-1 rounded-full">
                    {['1', '2', '3', 'drafts'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCrisesViewTab(v)}
                        className={`rounded-full px-3.5 py-1 text-xs font-rounded font-bold transition-all ${
                          crisesViewTab === v ? 'bg-[#5E1B21] text-[#D9BB7C]' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {v === 'drafts' ? `Drafts (${draftCrises.length})` : `Round ${v}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Crisis Builder Form */}
                  <div className="lg:col-span-6 capsule-card rounded-[28px] p-5 space-y-3 text-xs font-rounded">
                    <h3 className="font-display text-lg" style={{ color: 'var(--text-main)' }}>
                      Create Crisis Event
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold mb-1">Target Round</label>
                        <select
                          value={crisisRound}
                          onChange={(e) => setCrisisRound(Number(e.target.value))}
                          className="w-full capsule-inset rounded-xl p-2 font-bold"
                        >
                          <option value={1}>Round 1 (PSX)</option>
                          <option value={2}>Round 2 (Commodities/FX)</option>
                          <option value={3}>Round 3 (Combined)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Crisis Number (1-10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={crisisNum}
                          onChange={(e) => setCrisisNum(Number(e.target.value))}
                          className="w-full capsule-inset rounded-xl p-2 font-bold"
                        >
                        </input>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Breaking Headline</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. State Bank Hikes Policy Rate by 250 bps"
                        value={crisisHeadline}
                        onChange={(e) => setCrisisHeadline(e.target.value)}
                        className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Intelligence Narrative</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Explain macro impact so contestants can decrypt it..."
                        value={crisisDesc}
                        onChange={(e) => setCrisisDesc(e.target.value)}
                        className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    {/* Price Impact Selector */}
                    <div className="space-y-2 border-t border-[#9E7B81]/20 pt-2">
                      <label className="block font-bold">Configure % Price Impact on Stocks</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Symbol (e.g. OGDC)"
                          value={crisisImpactSym}
                          onChange={(e) => setCrisisImpactSym(e.target.value)}
                          className="w-1/2 capsule-inset rounded-xl p-2 font-bold uppercase"
                        />
                        <input
                          type="number"
                          step="0.5"
                          placeholder="% Change (e.g. 10 or -8)"
                          value={crisisImpactPct}
                          onChange={(e) => setCrisisImpactPct(Number(e.target.value))}
                          className="w-1/3 capsule-inset rounded-xl p-2 font-bold"
                        />
                        <TactileButton
                          type="button"
                          onClick={addImpactToCrisis}
                          className="rounded-xl px-3 bg-[#5E1B21] text-white font-bold text-xs"
                        >
                          Add %
                        </TactileButton>
                      </div>

                      {/* Quick Preset Deltas */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[+25, +15, +10, +5, -5, -10, -15, -25].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setCrisisImpactPct(pct)}
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold capsule-inset hover:bg-[#5E1B21] hover:text-white"
                          >
                            {pct > 0 ? `+${pct}%` : `${pct}%`}
                          </button>
                        ))}
                      </div>

                      {/* Configured impacts badges */}
                      {Object.keys(crisisImpacts).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(crisisImpacts).map(([sym, pct]) => (
                            <span
                              key={sym}
                              className="rounded-full bg-[#5E1B21] text-[#D9BB7C] px-2.5 py-0.5 text-xs font-bold flex items-center gap-1.5"
                            >
                              <span>
                                {sym}: {pct > 0 ? '+' : ''}{pct}%
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCrisisImpacts((prev) => {
                                    const next = { ...prev };
                                    delete next[sym];
                                    return next;
                                  });
                                }}
                                className="text-white hover:text-[#B83A3A]"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <TactileButton
                        onClick={handleSaveCrisisToRound}
                        className="rounded-full py-3 bg-[#5E1B21] text-[#FAF7F5] font-display text-xs shadow-md"
                      >
                        Save to Round Schedule
                      </TactileButton>
                      <TactileButton
                        type="button"
                        onClick={handleSaveDraftCrisis}
                        className="rounded-full py-3 capsule-inset text-xs font-rounded font-bold"
                      >
                        Save as Draft
                      </TactileButton>
                    </div>
                  </div>

                  {/* Crises List (Scheduled or Drafts) */}
                  <div className="lg:col-span-6 space-y-3">
                    <h3 className="font-display text-lg" style={{ color: 'var(--text-main)' }}>
                      {crisesViewTab === 'drafts'
                        ? `Draft Crises (${draftCrises.length})`
                        : `Round ${crisesViewTab} Scheduled Crises`}
                    </h3>

                    {crisesViewTab === 'drafts' ? (
                      draftCrises.length === 0 ? (
                        <div className="capsule-card rounded-2xl p-6 text-center text-xs opacity-70">
                          No draft crises currently saved. Author one on the left and click "Save as Draft".
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {draftCrises.map((d) => (
                            <div key={d.id} className="capsule-card rounded-2xl p-4 space-y-2 text-xs font-rounded">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-[#D9BB7C]">
                                  Draft • Round {d.round} (Crisis #{d.crisisNumber})
                                </span>
                                <div className="flex gap-1.5">
                                  <TactileButton
                                    onClick={() => handlePublishDraft(d, false)}
                                    className="rounded-full px-2.5 py-0.5 bg-[#3B7A57] text-white text-[10px] font-bold"
                                  >
                                    Publish
                                  </TactileButton>
                                  <TactileButton
                                    onClick={() => handlePublishDraft(d, true)}
                                    className="rounded-full px-2.5 py-0.5 bg-[#5E1B21] text-[#D9BB7C] text-[10px] font-bold"
                                  >
                                    Publish & Trigger
                                  </TactileButton>
                                  <button
                                    onClick={() => handleDeleteDraft(d.id)}
                                    className="text-[#B83A3A] font-bold text-xs hover:underline ml-1"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <h4 className="font-display text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                                {d.headline}
                              </h4>
                              <p className="opacity-80 text-[11px]">{d.description}</p>
                              {d.impacts && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {Object.entries(d.impacts).map(([s, p]) => (
                                    <span key={s} className="px-2 py-0.5 rounded-full bg-[#2B1117] text-[#D9BB7C] font-bold text-[10px]">
                                      {s}: {p > 0 ? `+${p}%` : `${p}%`}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      // Scheduled Round Crises
                      (() => {
                        const targetCrises = gameState?.crisesByRound?.[Number(crisesViewTab)] || [];
                        return targetCrises.length === 0 ? (
                          <div className="capsule-card rounded-2xl p-6 text-center text-xs opacity-70">
                            No crises scheduled for Round {crisesViewTab}. Create one on the left.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {targetCrises.map((c) => (
                              <div key={c.number} className="capsule-card rounded-2xl p-4 space-y-1.5 text-xs font-rounded">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-[#5E1B21]">Crisis #{c.number}</span>
                                  <button
                                    onClick={() => handleRemoveCrisis(Number(crisesViewTab), c.number)}
                                    className="text-[#B83A3A] font-bold"
                                  >
                                    Delete
                                  </button>
                                </div>
                                <h4 className="font-display text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                                  {c.headline}
                                </h4>
                                <p className="opacity-80">{c.description}</p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {Object.entries(c.impacts || {}).map(([s, p]) => (
                                    <span key={s} className="px-2 py-0.5 rounded-full bg-[#2B1117] text-[#D9BB7C] font-bold text-xs">
                                      {s}: {p > 0 ? '+' : ''}{p}%
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOCKS & ASSETS INVENTORY */}
          {adminTab === 'stocks' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form to Add Stock */}
                <div className="lg:col-span-5 surface-box rounded-[32px] p-6 space-y-4">
                  <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                    Add Asset to Trading Floor
                  </h2>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                    Add PSX Stocks for Round 1, Commodities/FX for Round 2, or cross-listed assets for Round 3.
                  </p>

                  <form onSubmit={handleAddStock} className="space-y-3 text-xs font-rounded">
                    <div>
                      <label className="block font-bold mb-1">Asset Symbol</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="e.g. OGDC or GOLD"
                        value={stockSym}
                        onChange={(e) => setStockSym(e.target.value)}
                        className="w-full capsule-inset rounded-xl p-2.5 font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Company / Asset Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oil & Gas Development Co."
                        value={stockName}
                        onChange={(e) => setStockName(e.target.value)}
                        className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Asset Description</label>
                      <input
                        type="text"
                        placeholder="Brief business summary or market fundamentals..."
                        value={stockDesc}
                        onChange={(e) => setStockDesc(e.target.value)}
                        className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold mb-1">Category</label>
                        <select
                          value={stockCat}
                          onChange={(e) => setStockCat(e.target.value)}
                          className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                        >
                          <option value="PSX Stock">PSX Stock</option>
                          <option value="Commodity">Commodity</option>
                          <option value="Currency Pair">Currency Pair</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Sector</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Energy or Tech"
                          value={stockSec}
                          onChange={(e) => setStockSec(e.target.value)}
                          className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold mb-1">Floor Round</label>
                        <select
                          value={stockRound}
                          onChange={(e) => setStockRound(Number(e.target.value))}
                          className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                        >
                          <option value={1}>Round 1 (PSX)</option>
                          <option value={2}>Round 2 (Commodities/FX)</option>
                          <option value={3}>Round 3 (Combined)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Base Price ($)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          value={stockPrice}
                          onChange={(e) => setStockPrice(Number(e.target.value))}
                          className="w-full capsule-inset rounded-xl p-2.5 font-bold"
                        />
                      </div>
                    </div>

                    <TactileButton
                      type="submit"
                      className="w-full rounded-full py-3 bg-[#5E1B21] text-[#FAF7F5] font-display font-semibold text-sm shadow-md"
                    >
                      Add Asset to Round {stockRound}
                    </TactileButton>
                  </form>
                </div>

                {/* List of Configured Stocks */}
                <div className="lg:col-span-7 surface-box rounded-[32px] p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                        Configured Securities ({filteredInventoryStocks.length})
                      </h2>
                      <span className="text-xs font-rounded font-semibold" style={{ color: 'var(--text-sub)' }}>
                        Realtime synced across floor desks
                      </span>
                    </div>

                    {/* Filter by Round */}
                    <div className="flex items-center gap-1.5 capsule-inset p-1 rounded-full text-xs font-rounded font-bold">
                      {['ALL', '1', '2', '3'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setStocksFilterRound(r)}
                          className={`rounded-full px-3 py-1 transition-all ${
                            stocksFilterRound === r ? 'bg-[#5E1B21] text-[#D9BB7C]' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {r === 'ALL' ? 'All' : `R${r}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredInventoryStocks.length === 0 ? (
                    <div className="capsule-card rounded-2xl p-8 text-center text-xs font-rounded opacity-70">
                      No assets found for the selected filter. Add instruments using the form on the left!
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {filteredInventoryStocks.map((s) => (
                        <div
                          key={s.symbol}
                          className="capsule-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-rounded"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-[#5E1B21] text-[#D9BB7C] flex items-center justify-center font-bold text-sm">
                              {s.symbol.slice(0, 4)}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                                  {s.symbol} — {s.name}
                                </span>
                                <span className="rounded-full bg-[#C4B8A3]/30 text-[#5E1B21] px-2 py-0.5 text-[10px] font-bold">
                                  R{s.round || 1} • {s.sector}
                                </span>
                              </div>
                              <p className="text-[11px] opacity-75 line-clamp-1">{s.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="hidden sm:block">
                              <MiniSparkline series={s.history || [s.basePrice]} isPositive={(s.changePercent || 0) >= 0} />
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                                ${Number(s.price).toFixed(2)}
                              </div>
                              <span
                                className={`text-[10px] font-bold ${
                                  (s.changePercent || 0) >= 0 ? 'text-[#3B7A57]' : 'text-[#B83A3A]'
                                }`}
                              >
                                {(s.changePercent || 0) >= 0 ? '+' : ''}{Number(s.changePercent || 0).toFixed(2)}%
                              </span>
                            </div>

                            <button
                              onClick={() => handleRemoveStock(s.symbol)}
                              className="text-[#B83A3A] font-bold text-xs hover:underline ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROUNDS SETUP & TIMING */}
          {adminTab === 'rounds' && (
            <div className="space-y-5">
              {/* Timing Setup Form */}
              <div className="surface-box rounded-[32px] p-6 space-y-4">
                <div className="border-b border-[#9E7B81]/20 pb-3">
                  <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                    Tournament Timing Setup & Auto-Trigger Configurations
                  </h2>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                    Configure the countdown clocks for each round. Set auto-trigger price shock delays (or set to 0 for manual trigger only).
                  </p>
                </div>

                <form onSubmit={handleSaveRoundTimers} className="space-y-4 text-xs font-rounded">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((r) => (
                      <div key={r} className="capsule-card rounded-2xl p-4 space-y-3 border border-[#9E7B81]/20">
                        <div className="flex items-center justify-between font-bold text-sm text-[#D9BB7C]">
                          <span>Round {r}</span>
                          <span className="text-[11px] opacity-75">
                            {r === 1 ? 'PSX Stocks' : r === 2 ? 'Commodities/FX' : 'Smuggling'}
                          </span>
                        </div>

                        <div>
                          <label className="block font-bold mb-1">Decrypt Phase (Seconds)</label>
                          <input
                            type="number"
                            min="30"
                            step="10"
                            value={roundTimers[r]?.decryptSeconds || 180}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRoundTimers((prev) => ({
                                ...prev,
                                [r]: { ...prev[r], decryptSeconds: val }
                              }));
                            }}
                            className="w-full capsule-inset rounded-xl p-2 font-bold"
                          />
                          <span className="text-[10px] opacity-75">e.g. 180s = 3 minutes</span>
                        </div>

                        <div>
                          <label className="block font-bold mb-1">Trading Phase (Seconds)</label>
                          <input
                            type="number"
                            min="60"
                            step="30"
                            value={roundTimers[r]?.tradingSeconds || 300}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRoundTimers((prev) => ({
                                ...prev,
                                [r]: { ...prev[r], tradingSeconds: val }
                              }));
                            }}
                            className="w-full capsule-inset rounded-xl p-2 font-bold"
                          />
                          <span className="text-[10px] opacity-75">e.g. 300s = 5m, 540s = 9m</span>
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-[#D9BB7C]">
                            Auto Price Shock Delay (Seconds)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="15"
                            value={roundTimers[r]?.autoPriceShockSeconds ?? 60}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRoundTimers((prev) => ({
                                ...prev,
                                [r]: { ...prev[r], autoPriceShockSeconds: val }
                              }));
                            }}
                            className="w-full capsule-inset rounded-xl p-2 font-bold"
                          />
                          <span className="text-[10px] opacity-75">0 = Manual trigger only</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <TactileButton
                    type="submit"
                    className="rounded-full px-6 py-3 bg-[#5E1B21] text-[#FAF7F5] font-display text-xs shadow-md"
                  >
                    Save Tournament Timings
                  </TactileButton>
                </form>
              </div>

              {/* Round 3 Offshore Havens & Secret Safe Wire Limits */}
              <div className="surface-box rounded-[32px] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9E7B81]/20 pb-3">
                  <div>
                    <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                      Round 3 Offshore Havens & Secret Wire Limits (Game Master Only)
                    </h2>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                      Set secret radar thresholds for each haven. Contestants DO NOT see these amounts. If they smuggle more than this limit, the government tracks and busts them!
                    </p>
                  </div>
                  <TactileButton
                    onClick={() => fetchAdminOverview()}
                    className="rounded-full px-4 py-1.5 capsule-card text-xs font-rounded font-bold"
                  >
                    Refresh Havens
                  </TactileButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(adminHavens.length > 0 ? adminHavens : gameState?.taxChannels || []).map((haven) => (
                    <div key={haven.id} className="capsule-card rounded-2xl p-4 space-y-3 text-xs font-rounded border border-[#9E7B81]/20">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm flex items-center gap-2">
                          <span>{haven.flag || '📍'}</span>
                          <span>{haven.city || haven.name}</span>
                        </span>
                        <span className="rounded-full bg-[#5E1B21] text-[#D9BB7C] px-2.5 py-0.5 text-[11px] font-bold">
                          {haven.riskLevel}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#D9BB7C]">
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
                            className="w-full capsule-inset rounded-xl p-2 font-bold text-sm"
                          />
                          <span className="text-[10px] opacity-75">
                            If team wires more than this, they get caught!
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold">Tax Fee (%)</label>
                            <input
                              type="number"
                              step="1"
                              value={haven.taxRatePercent || 20}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setAdminHavens((prev) =>
                                  prev.map((h) => (h.id === haven.id ? { ...h, taxRatePercent: val } : h))
                                );
                              }}
                              className="w-full capsule-inset rounded-xl p-1.5 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold">Penalty Fine (%)</label>
                            <input
                              type="number"
                              step="5"
                              value={haven.penaltyRatePercent || 40}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setAdminHavens((prev) =>
                                  prev.map((h) => (h.id === haven.id ? { ...h, penaltyRatePercent: val } : h))
                                );
                              }}
                              className="w-full capsule-inset rounded-xl p-1.5 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <TactileButton
                        onClick={() => handleUpdateHaven(haven)}
                        className="w-full rounded-full py-2 bg-[#5E1B21] text-[#FAF7F5] font-rounded font-bold text-xs"
                      >
                        Save Secret Limit
                      </TactileButton>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TEAMS & PASSCODES */}
          {adminTab === 'teams' && (
            <div className="surface-box rounded-[32px] p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9E7B81]/20 pb-3">
                <div>
                  <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                    Registered Teams & Desk Passcodes
                  </h2>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
                    View all competitor desks, live portfolio valuations, and reset forgotten student passcodes.
                  </p>
                </div>
                <TactileButton
                  onClick={() => fetchAdminOverview()}
                  className="rounded-full px-4 py-1.5 capsule-card text-xs font-rounded font-bold"
                >
                  Refresh Teams
                </TactileButton>
              </div>

              {adminTeams.length === 0 ? (
                <div className="capsule-card rounded-2xl p-6 text-center text-xs opacity-75">
                  No teams registered yet. Competitors will populate here when they sign in with their team name.
                </div>
              ) : (
                <div className="space-y-3">
                  {adminTeams.map((t) => (
                    <div
                      key={t.id}
                      className="capsule-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-rounded"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#5E1B21] text-[#D9BB7C] flex items-center justify-center font-bold text-sm">
                          {t.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-display font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                            {t.name}
                          </div>
                          <div className="text-[11px] opacity-75">
                            Cash: ${Number(t.cash || 0).toLocaleString()} • Holdings: {Object.keys(t.holdings || {}).length}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] opacity-75 block">Passcode</span>
                          <span className="font-mono font-bold text-xs bg-[#2B1117] text-[#D9BB7C] px-2.5 py-1 rounded-full">
                            {t.passcode || 'team123'}
                          </span>
                        </div>

                        {/* Reset passcode input */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="New code"
                            value={editingTeamPass[t.id] || ''}
                            onChange={(e) =>
                              setEditingTeamPass((prev) => ({ ...prev, [t.id]: e.target.value }))
                            }
                            className="w-24 capsule-inset rounded-xl p-1.5 text-xs font-mono font-bold"
                          />
                          <TactileButton
                            onClick={() => handleResetTeamPass(t.id)}
                            className="rounded-xl px-2.5 py-1.5 bg-[#5E1B21] text-white text-[11px] font-bold"
                          >
                            Update
                          </TactileButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ADMIN PASSKEYS MANAGEMENT */}
          {adminTab === 'passkeys' && (
            <div className="surface-box rounded-[32px] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#9E7B81]/20 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#5E1B21] text-[#D9BB7C] flex items-center justify-center font-bold text-xs">
                      KEY
                    </span>
                    <h2 className="font-display text-xl" style={{ color: 'var(--text-main)' }}>
                      Admin Passkeys &amp; Access Control
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-sub)] mt-1">
                    Manage master and organizer passkeys. Anyone with one of these passkeys has administrative access to the tournament floor.
                  </p>
                </div>
              </div>

              {/* Status Notice */}
              {passkeyNotice && (
                <div
                  className={`p-3 rounded-xl text-xs font-rounded font-bold flex items-center justify-between border ${
                    passkeyNotice.type === 'error'
                      ? 'bg-[#B83A3A]/15 border-[#B83A3A]/40 text-[#B83A3A]'
                      : 'bg-[#3B7A57]/15 border-[#3B7A57]/40 text-[#3B7A57]'
                  }`}
                >
                  <span>{passkeyNotice.text}</span>
                  <button
                    onClick={() => setPasskeyNotice(null)}
                    className="ml-2 text-xs font-bold opacity-75 hover:opacity-100 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Create Passkey Form Card */}
              <div className="capsule-card rounded-2xl p-5 space-y-4 border border-[#9E7B81]/25">
                <h4 className="font-display text-sm font-bold text-[#D9BB7C]">
                  Create New Admin Passkey
                </h4>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newPasskeyInput.trim()) {
                      setPasskeyNotice({ type: 'error', text: 'Passkey cannot be empty.' });
                      return;
                    }
                    if (newPasskeyInput.trim().length < 4) {
                      setPasskeyNotice({ type: 'error', text: 'Passkey must be at least 4 characters.' });
                      return;
                    }

                    setCreatingPasskey(true);
                    setPasskeyNotice(null);
                    const key = getEffectivePasskey();
                    try {
                      const res = await fetch('/passkey/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          passkey: key,
                          passcode: key,
                          newPasskey: newPasskeyInput.trim(),
                          label: newPasskeyLabel.trim() || 'Co-Admin Passkey'
                        })
                      });
                      const json = await res.json();
                      if (!json.ok) throw new Error(json.error || 'Failed to create passkey');
                      if (json.data?.passkeys) setAdminPasskeysList(json.data.passkeys);
                      setNewPasskeyInput('');
                      setNewPasskeyLabel('');
                      setPasskeyNotice({
                        type: 'success',
                        text: `New admin passkey created successfully and activated.`
                      });
                    } catch (err) {
                      setPasskeyNotice({ type: 'error', text: err.message });
                    } finally {
                      setCreatingPasskey(false);
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                >
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
                      Passkey Code (Secret)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ALPHA2026 or AES-COCKPIT-9"
                      value={newPasskeyInput}
                      onChange={(e) => setNewPasskeyInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#9E7B81]/30 bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-mono font-bold outline-none focus:border-[#D9BB7C]"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
                      Label / Role Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Judge or Stage Floor Marshal"
                      value={newPasskeyLabel}
                      onChange={(e) => setNewPasskeyLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#9E7B81]/30 bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-rounded font-bold outline-none focus:border-[#D9BB7C]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <TactileButton
                      type="submit"
                      disabled={creatingPasskey}
                      className="w-full py-2.5 rounded-xl btn-primary font-display text-xs shadow-md disabled:opacity-50"
                    >
                      {creatingPasskey ? 'Creating...' : 'Create Admin Key'}
                    </TactileButton>
                  </div>
                </form>
              </div>

              {/* Active Admin Passkeys Table */}
              <div className="capsule-card rounded-2xl overflow-hidden border border-[#9E7B81]/25">
                <div className="p-4 border-b border-[#9E7B81]/20 flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[var(--text-main)]">
                    Active Authorized Admin Keys ({adminPasskeysList.length || 1})
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-sub)]">
                    Full Cockpit Authority
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-rounded">
                    <thead className="border-b border-[#9E7B81]/20 text-[10px] font-mono uppercase tracking-wider text-[var(--text-sub)] bg-[var(--bg-inset)]/30">
                      <tr>
                        <th className="py-2.5 px-4">Passkey String</th>
                        <th className="py-2.5 px-4">Label / Role</th>
                        <th className="py-2.5 px-4">Created At</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#9E7B81]/15">
                      {adminPasskeysList.map((entry, idx) => {
                        const isCurrentInUse = entry.key === passInput.trim() || entry.key === adminPasskey;
                        const isOnlyOne = adminPasskeysList.length <= 1;

                        return (
                          <tr key={entry.key || idx} className="hover:bg-[var(--row-hover)] transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#D9BB7C]">
                              <span className="px-2 py-1 rounded bg-[#5E1B21]/30 border border-[#D9BB7C]/30 text-xs">
                                {entry.key}
                              </span>
                              {isCurrentInUse && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#3B7A57]/20 border border-[#3B7A57]/40 text-[#3B7A57] text-[10px] font-bold">
                                  Current Session
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-[var(--text-main)]">
                              {entry.label || 'Master Key'}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-sub)]">
                              {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'System Boot'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                disabled={isOnlyOne}
                                onClick={async () => {
                                  if (!window.confirm(`Are you sure you want to delete admin passkey "${entry.key}"?`)) {
                                    return;
                                  }
                                  const key = getEffectivePasskey();
                                  try {
                                    const res = await fetch('/passkey/delete', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        passkey: key,
                                        passcode: key,
                                        keyToDelete: entry.key
                                      })
                                    });
                                    const json = await res.json();
                                    if (!json.ok) throw new Error(json.error || 'Failed to delete passkey');
                                    if (json.data?.passkeys) setAdminPasskeysList(json.data.passkeys);
                                    setPasskeyNotice({
                                      type: 'success',
                                      text: `Admin passkey "${entry.key}" deleted successfully.`
                                    });
                                  } catch (err) {
                                    setPasskeyNotice({ type: 'error', text: err.message });
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  isOnlyOne
                                    ? 'opacity-40 cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-sub)]'
                                    : 'bg-[#B83A3A]/20 hover:bg-[#B83A3A]/30 text-[#B83A3A]'
                                }`}
                              >
                                {isOnlyOne ? 'Protected' : 'Revoke'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
