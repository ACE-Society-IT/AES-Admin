import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Activity,
  Database,
  Server,
  ArrowRight,
  TrendingUp,
  LogOut,
  Clock,
  Layers,
  KeyRound,
  Sun,
  Moon,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import aesLogo from './assets/aes-logo.png';
import investomaniaLogo from './assets/InvestomaniaLogo.png';
import { GameProvider } from './context/GameContext.jsx';
import {
  authAdminDirect,
  fetchGameStateDirect,
  managePasskeyDirect,
  fetchModuleAccessDirect,
  toggleModuleLoginDirect,
  supabase
} from './lib/supabaseGameService.js';

// Dynamic Code-Split Lazy Imports for Fast Initial Hub Loading
const AdminPanel = lazy(() => import('./investomania/AdminPanel.jsx'));
const AdminDashboardShell = lazy(() => import('./defend-the-empire/components/AdminDashboardShell.jsx'));
const MonopolyAdminPanel = lazy(() => import('./market-monopoly/components/MonopolyAdminPanel.jsx'));

function AdminModuleFallback({ title = 'Connecting to Module Cockpit...' }) {
  return (
    <div className="admin-executive-hub min-h-screen flex items-center justify-center p-6">
      <div className="admin-card max-w-sm w-full p-8 text-center space-y-3.5 shadow-lg">
        <div className="w-8 h-8 mx-auto border-2 border-[#8D5B3A] border-t-transparent rounded-full animate-spin" />
        <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--ink-white)' }}>
          {title}
        </h3>
        <p className="text-xs font-mono" style={{ color: 'var(--ink-gray)' }}>
          Synchronizing tournament engine state...
        </p>
      </div>
    </div>
  );
}

// Spacious Executive Dual Theme: Brown, White, Black & Gray
const STYLES = `
  .admin-executive-hub {
    background-color: var(--canvas);
    color: var(--ink-white);
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    transition: background-color 160ms ease, color 160ms ease;
  }

  /* Dark Theme Tokens */
  .admin-executive-hub[data-theme="dark"] {
    --canvas: #0C0A09;
    --card: #181513;
    --card-inset: #221D1A;
    --card-hover: #26201D;
    --border: #332A25;
    --border-subtle: #29221E;
    --brown-primary: #8D5B3A;
    --brown-hover: #A56F48;
    --brown-border: #4D372B;
    --ink-white: #FFFFFF;
    --ink-bone: #F5EFEB;
    --ink-gray: #A8A29E;
    --ink-muted: #78716C;
    --accent-green: #16A34A;
    --accent-red: #DC2626;
    --accent-yellow: #EAB308;
    --pill-bg: #221D1A;
    --pill-text: #A8A29E;
    --pill-border: #332A25;
    --btn-sec-bg: #221D1A;
    --btn-sec-text: #F5EFEB;
    --btn-sec-border: #382E2B;
    --btn-sec-hover: #2C2521;
    --input-bg: #221D1A;
    --input-border: #382E2B;
    --input-text: #FFFFFF;
    --tag-border: #3D322C;
    --modal-bg: #181513;
    --modal-overlay: rgba(0, 0, 0, 0.75);
  }

  /* White / Light Theme Tokens */
  .admin-executive-hub[data-theme="light"] {
    --canvas: #F9F8F6;
    --card: #FFFFFF;
    --card-inset: #F4EFEB;
    --card-hover: #F8F5F1;
    --border: #E5DFD7;
    --border-subtle: #EDE8E2;
    --brown-primary: #8D5B3A;
    --brown-hover: #73482C;
    --brown-border: #D1B8A5;
    --ink-white: #1C1917;
    --ink-bone: #44403C;
    --ink-gray: #78716C;
    --ink-muted: #A8A29E;
    --accent-green: #15803D;
    --accent-red: #B91C1C;
    --accent-yellow: #B45309;
    --pill-bg: #F4EFEB;
    --pill-text: #57534E;
    --pill-border: #E5DFD7;
    --btn-sec-bg: #FFFFFF;
    --btn-sec-text: #1C1917;
    --btn-sec-border: #E5DFD7;
    --btn-sec-hover: #F4EFEB;
    --input-bg: #FFFFFF;
    --input-border: #E5DFD7;
    --input-text: #1C1917;
    --tag-border: #D8CEBE;
    --modal-bg: #FFFFFF;
    --modal-overlay: rgba(28, 25, 23, 0.45);
  }

  .admin-executive-hub .font-mono {
    font-family: 'JetBrains Mono', SFMono-Regular, monospace;
    font-variant-numeric: tabular-nums;
  }
  
  .admin-btn {
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 16px;
    cursor: pointer;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
    user-select: none;
  }
  
  .admin-btn-brown {
    background: var(--brown-primary);
    color: #FFFFFF;
    border-color: var(--brown-primary);
  }
  .admin-btn-brown:hover {
    background: var(--brown-hover);
    border-color: #B88057;
  }
  .admin-btn-brown:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  
  .admin-btn-secondary {
    background: var(--btn-sec-bg);
    color: var(--btn-sec-text);
    border: 1px solid var(--btn-sec-border);
  }
  .admin-btn-secondary:hover {
    background: var(--btn-sec-hover);
    border-color: var(--brown-border);
  }
  
  .admin-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    transition: background-color 160ms ease, border-color 160ms ease;
  }
  
  .admin-input {
    border: 1px solid var(--input-border);
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    background: var(--input-bg);
    color: var(--input-text);
    outline: none;
    transition: border-color 140ms ease;
  }
  .admin-input:focus {
    border-color: var(--brown-primary);
  }
  
  .admin-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    background: var(--pill-bg);
    border: 1px solid var(--pill-border);
    color: var(--pill-text);
  }
`;

function MasterHub({ isAuthenticated, setIsAuthenticated, isCheckingAuth, onLogout, passkey, setPasskey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [telemetry, setTelemetry] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Theme state: 'dark' vs 'light'
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('alphaace_admin_theme') || 'dark');

  // Credentials Management Modal State
  const [showCredModal, setShowCredModal] = useState(false);
  const [adminPasskeys, setAdminPasskeys] = useState([]);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [credLoading, setCredLoading] = useState(false);
  const [credMsg, setCredMsg] = useState({ text: '', type: '' });
  const [copiedKey, setCopiedKey] = useState(null);

  // Module Login Access State (investomania, defendTheEmpire, marketMonopoly)
  const [moduleAccess, setModuleAccess] = useState({
    investomania: true,
    defendTheEmpire: true,
    marketMonopoly: true
  });
  const [togglingModule, setTogglingModule] = useState(null);
  const [blockConfirmModal, setBlockConfirmModal] = useState({
    open: false,
    moduleKey: '',
    moduleTitle: ''
  });

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
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchTelemetry = useCallback(async () => {
    try {
      const state = await fetchGameStateDirect();
      if (state) {
        setTelemetry({
          status: 'HEALTHY',
          supabase: { status: 'CONNECTED', connected: true },
          round: state.currentRound || 1,
          phase: state.phase || 'PRE_ROUND'
        });
      }
    } catch {
      // background telemetry non-blocking
    }
  }, []);

  const fetchPasskeys = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('alphaace_admin_token') || sessionStorage.getItem('alphaace_admin_passkey') || '';
      if (!token) return;
      const list = await managePasskeyDirect(token, 'LIST');
      if (Array.isArray(list)) {
        setAdminPasskeys(list);
      }
    } catch {
      // Keep existing passkeys list if query fails
    }
  }, []);

  const fetchModuleAccess = useCallback(async () => {
    try {
      const access = await fetchModuleAccessDirect();
      if (access) {
        setModuleAccess(access);
      }
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTelemetry();
      fetchPasskeys();
      fetchModuleAccess();

      const handleVisibility = () => {
        if (!document.hidden) {
          fetchTelemetry();
          fetchModuleAccess();
        }
      };
      window.addEventListener('focus', handleVisibility);
      document.addEventListener('visibilitychange', handleVisibility);

      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchTelemetry();
          fetchModuleAccess();
        }
      }, 20000);

      // Realtime subscription to investomania_state changes to sync module access instantly
      let accessChannel = null;
      try {
        accessChannel = supabase
          .channel('admin-hub-module-access-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'investomania_state' },
            (payload) => {
              const s = payload?.new?.state_json;
              if (s) {
                setModuleAccess({
                  investomania: s.moduleAccess?.investomania ?? s.loginsEnabled ?? true,
                  defendTheEmpire: s.moduleAccess?.defendTheEmpire ?? true,
                  marketMonopoly: s.moduleAccess?.marketMonopoly ?? true
                });
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime module access channel error:', err.message);
      }

      return () => {
        window.removeEventListener('focus', handleVisibility);
        document.removeEventListener('visibilitychange', handleVisibility);
        clearInterval(interval);
        if (accessChannel) supabase.removeChannel(accessChannel);
      };
    }
  }, [isAuthenticated, fetchTelemetry, fetchPasskeys, fetchModuleAccess]);

  const handleToggleModuleClick = (moduleKey, moduleTitle, isCurrentlyOpen) => {
    if (isCurrentlyOpen) {
      // Blocking access requires confirmation because all logged-in contestants are logged out immediately
      setBlockConfirmModal({
        open: true,
        moduleKey,
        moduleTitle
      });
    } else {
      // Allowing access can be done immediately
      executeToggleModuleAccess(moduleKey, true);
    }
  };

  const executeToggleModuleAccess = async (moduleKey, enabled) => {
    const token =
      sessionStorage.getItem('alphaace_admin_token') ||
      sessionStorage.getItem('alphaace_admin_passkey') ||
      localStorage.getItem('alphaace_admin_token') ||
      localStorage.getItem('alphaace_admin_passkey') ||
      'pepe';

    setTogglingModule(moduleKey);
    try {
      const updatedAccess = await toggleModuleLoginDirect(token, moduleKey, enabled);
      if (updatedAccess) {
        setModuleAccess(updatedAccess);
      } else {
        setModuleAccess((prev) => ({ ...prev, [moduleKey]: !!enabled }));
      }
      setBlockConfirmModal({ open: false, moduleKey: '', moduleTitle: '' });
    } catch (err) {
      alert(`Failed to update access for ${moduleKey}: ${err.message || 'Error occurred'}`);
    } finally {
      setTogglingModule(null);
    }
  };

  // Robust Sign-In Handler (100% Supabase Native)
  const handleLogin = async (e) => {
    e.preventDefault();
    const key = (passkey || '').trim();
    if (!key) {
      setLoginError('Passkey is required.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const authData = await authAdminDirect(key);
      if (authData && authData.authenticated) {
        const token = key.trim();
        sessionStorage.setItem('alphaace_admin_token', token);
        sessionStorage.setItem('alphaace_admin_passkey', token);
        localStorage.setItem('alphaace_admin_token', token);
        localStorage.setItem('alphaace_admin_passkey', token);
        setPasskey(''); // Security: clear passkey from memory/input
        setIsAuthenticated(true);
        setLoginError('');

        // Redirect to intended route if user was redirected to login from a protected module
        const destination = location.state?.from?.pathname;
        if (destination && destination !== '/') {
          navigate(destination, { replace: true });
        }
      } else {
        setLoginError('Invalid administrator credentials. Access denied.');
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please verify admin passkey.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Robust Sign-Out Handler
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem('alphaace_admin_token');
      sessionStorage.removeItem('alphaace_admin_passkey');
      localStorage.removeItem('alphaace_admin_token');
      localStorage.removeItem('alphaace_admin_passkey');
      try { sessionStorage.clear(); } catch {}
      setPasskey('');
      setIsAuthenticated(false);
    }
    setShowCredModal(false);
  };

  // Create New Admin Credential (Stored directly in Supabase Cloud Vault)
  const handleCreatePasskey = async (e) => {
    e.preventDefault();
    const cleanKey = newKeyInput.trim();
    if (!cleanKey) {
      setCredMsg({ text: 'Passkey cannot be empty.', type: 'error' });
      return;
    }

    setCredLoading(true);
    setCredMsg({ text: '', type: '' });

    try {
      const token = sessionStorage.getItem('alphaace_admin_token') || sessionStorage.getItem('alphaace_admin_passkey') || '';
      if (!token) throw new Error('No active admin session found. Please log in.');
      const updatedList = await managePasskeyDirect(token, 'CREATE', cleanKey, newLabelInput.trim() || 'ADMIN');
      if (Array.isArray(updatedList)) {
        setAdminPasskeys(updatedList);
      }
      setCredMsg({
        text: `Credential created: "${cleanKey}" (Encrypted in Cloud Vault)`,
        type: 'success'
      });
      setNewKeyInput('');
      setNewLabelInput('');
      fetchPasskeys();
    } catch (err) {
      setCredMsg({ text: err.message || 'Error creating credential in Cloud Vault.', type: 'error' });
    } finally {
      setCredLoading(false);
    }
  };

  // Delete Admin Credential from Cloud Storage
  const handleDeletePasskey = async (targetKey) => {
    setCredMsg({ text: 'Revoking credential from Cloud Vault...', type: 'info' });

    try {
      const token = sessionStorage.getItem('alphaace_admin_token') || sessionStorage.getItem('alphaace_admin_passkey') || '';
      if (!token) throw new Error('No active admin session found. Please log in.');
      const updatedList = await managePasskeyDirect(token, 'DELETE', targetKey);
      if (Array.isArray(updatedList)) {
        setAdminPasskeys(updatedList);
      }
      setCredMsg({ text: 'Credential revoked from Cloud Vault.', type: 'success' });
      fetchPasskeys();
    } catch (err) {
      setCredMsg({ text: err.message || 'Failed to revoke credential.', type: 'error' });
      fetchPasskeys();
    }
  };

  // Random Passkey Generator Helper
  const generateRandomKey = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let res = 'adm_';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewKeyInput(res);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Authorization verification gate while checking stored session
  if (isCheckingAuth) {
    return (
      <div className="admin-executive-hub min-h-screen flex items-center justify-center p-6" data-theme={themeMode}>
        <style>{STYLES}</style>
        <div className="admin-card max-w-sm w-full p-8 text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}>
            <Activity className="w-5 h-5 animate-spin" style={{ color: 'var(--brown-primary)' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--ink-white)' }}>
              Verifying Authorization
            </h2>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--ink-gray)' }}>
              Authenticating administrator credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Admin Authentication Gate
  if (!isAuthenticated) {
    return (
      <div className="admin-executive-hub min-h-screen flex items-center justify-center p-6" data-theme={themeMode}>
        <style>{STYLES}</style>
        <div className="admin-card max-w-sm w-full p-8 relative">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="admin-btn admin-btn-secondary text-xs h-8 px-2.5"
              title={`Switch to ${themeMode === 'dark' ? 'White Theme' : 'Dark Theme'}`}
            >
              {themeMode === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#EAB308]" /> : <Moon className="w-3.5 h-3.5 text-[#8D5B3A]" />}
            </button>
          </div>

          <div className="text-center mb-6">
            <div
              className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
            >
              <Shield className="w-6 h-6" style={{ color: 'var(--brown-primary)' }} />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink-white)' }}>
              Master Admin Gateway
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-gray)' }}>
              Authorized tournament directors only
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#DC2626] dark:text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-gray)' }}>
                Admin Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter administrator passkey"
                  className="admin-input font-mono w-full pl-9"
                  disabled={loginLoading}
                  autoComplete="off"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-brown w-full h-10 text-xs font-semibold"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Unlock Console
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const supabaseConnected = telemetry?.supabase?.status === 'CONNECTED' || telemetry?.supabase?.connected;

  return (
    <div className="admin-executive-hub min-h-screen p-6 sm:p-10" data-theme={themeMode}>
      <style>{STYLES}</style>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Concise Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center p-2 shrink-0"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <img src={aesLogo} alt="AES 2026" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink-white)' }}>
                  AES Master Admin
                </h1>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                  style={{ background: 'var(--card-inset)', border: '1px solid var(--tag-border)', color: 'var(--brown-primary)' }}
                >
                  Admin Only
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Create / Manage Credentials Button */}
            <button
              type="button"
              onClick={() => {
                setShowCredModal(true);
                fetchPasskeys();
              }}
              className="admin-btn admin-btn-secondary text-xs h-8 px-3"
              title="Create & Manage Administrator Credentials"
            >
              <KeyRound className="w-3.5 h-3.5" style={{ color: 'var(--brown-primary)' }} />
              <span>Admin Credentials</span>
            </button>

            {/* Cloud Database Pill */}
            <div className="admin-pill">
              <Database className={`w-3.5 h-3.5 ${supabaseConnected ? 'text-[#16A34A]' : 'text-[#DC2626]'}`} />
              <span className="text-[11px]">
                DB: <strong className={supabaseConnected ? 'text-[#16A34A]' : 'text-[#DC2626]'}>{supabaseConnected ? 'ONLINE' : 'OFFLINE'}</strong>
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="admin-btn admin-btn-secondary text-xs h-8 px-2.5"
              title={`Switch to ${themeMode === 'dark' ? 'White Theme' : 'Dark Theme'}`}
            >
              {themeMode === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#EAB308]" /> : <Moon className="w-3.5 h-3.5 text-[#8D5B3A]" />}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="admin-btn admin-btn-secondary text-xs h-8 px-3"
              title="End Administrator Session"
            >
              <LogOut className="w-3.5 h-3.5" style={{ color: 'var(--ink-gray)' }} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Modules Selection Deck */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider" style={{ color: 'var(--ink-muted)' }}>
              Tournament Modules
            </h2>
            <span className="text-xs font-mono" style={{ color: 'var(--ink-muted)' }}>
              3 Active Modules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Module 1: Investomania Admin */}
            <div
              className="admin-card flex flex-col justify-between"
              style={{ borderTop: '3px solid var(--brown-primary)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center p-1.5"
                    style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
                  >
                    <img src={investomaniaLogo} alt="Investomania" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span
                    className="admin-pill text-[#16A34A]"
                    style={{ background: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.35)' }}
                  >
                    <Activity className="w-3 h-3 text-[#16A34A]" />
                    ACTIVE · PORT 4000
                  </span>
                </div>

                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--brown-primary)' }}>
                  Module 01
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-tight" style={{ color: 'var(--ink-white)' }}>
                  Investomania Admin
                </h3>
                <p className="text-xs mb-4" style={{ color: 'var(--ink-gray)' }}>
                  Financial simulation engine, PSX stocks, commodities, FX rates & offshore tax havens.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="p-2 rounded-lg text-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--ink-muted)' }}>Equities</div>
                    <div className="text-xs font-mono font-bold mt-0.5" style={{ color: 'var(--ink-white)' }}>20 Stocks</div>
                  </div>
                  <div className="p-2 rounded-lg text-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--ink-muted)' }}>Sync</div>
                    <div className="text-xs font-mono font-bold text-[#16A34A] mt-0.5">Live Sockets</div>
                  </div>
                </div>

                {/* Module 1 Access Control Block */}
                <div
                  className="p-3 rounded-lg mb-4 flex flex-col gap-2"
                  style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase" style={{ color: 'var(--ink-white)' }}>
                      Contestant Logins
                    </span>
                    {moduleAccess.investomania !== false ? (
                      <span
                        className="admin-pill text-[#16A34A]"
                        style={{ background: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.35)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                        LOGINS OPEN
                      </span>
                    ) : (
                      <span
                        className="admin-pill text-[#DC2626]"
                        style={{ background: 'rgba(220, 38, 38, 0.12)', borderColor: 'rgba(220, 38, 38, 0.35)' }}
                      >
                        <Lock className="w-3 h-3 text-[#DC2626]" />
                        LOGINS BLOCKED
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                    {moduleAccess.investomania !== false
                      ? 'Trading desks can sign in. Blocking will immediately sign out all active contestants.'
                      : 'Trading desk logins locked. Active contestants have been logged out.'}
                  </p>

                  <button
                    type="button"
                    disabled={togglingModule === 'investomania'}
                    onClick={() => handleToggleModuleClick('investomania', 'Investomania', moduleAccess.investomania !== false)}
                    className="admin-btn w-full justify-center text-xs py-1.5"
                    style={
                      moduleAccess.investomania !== false
                        ? {
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#DC2626',
                            borderColor: 'rgba(220, 38, 38, 0.3)'
                          }
                        : {
                            background: 'rgba(22, 163, 74, 0.08)',
                            color: '#16A34A',
                            borderColor: 'rgba(22, 163, 74, 0.3)'
                          }
                    }
                  >
                    {togglingModule === 'investomania' ? (
                      'Updating Access...'
                    ) : moduleAccess.investomania !== false ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Block Logins & Sign-ups
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        Allow Logins & Sign-ups
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/investomania')}
                className="admin-btn admin-btn-brown w-full justify-center text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Launch Investomania Admin
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Module 2: Defend the Empire Admin */}
            <div
              className="admin-card flex flex-col justify-between"
              style={{ borderTop: '3px solid var(--brown-primary)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                    style={{ background: 'var(--card-inset)', border: '1px solid var(--border)', color: 'var(--brown-primary)' }}
                  >
                    DTE
                  </div>
                  <span
                    className="admin-pill text-[#EAB308]"
                    style={{ background: 'rgba(234, 179, 8, 0.12)', borderColor: 'rgba(234, 179, 8, 0.35)' }}
                  >
                    <Clock className="w-3 h-3 text-[#EAB308]" />
                    WAR ROOM LIVE
                  </span>
                </div>

                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--brown-primary)' }}>
                  Module 02
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-tight" style={{ color: 'var(--ink-white)' }}>
                  Defend the Empire Admin
                </h3>
                <p className="text-xs mb-4" style={{ color: 'var(--ink-gray)' }}>
                  Geopolitical crisis war room, synchronized round clocks, option lockout & team valuations.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="p-2 rounded-lg text-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--ink-muted)' }}>Crises</div>
                    <div className="text-xs font-mono font-bold mt-0.5" style={{ color: 'var(--ink-white)' }}>4 Waves</div>
                  </div>
                  <div className="p-2 rounded-lg text-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--ink-muted)' }}>Clocks</div>
                    <div className="text-xs font-mono font-bold text-[#EAB308] mt-0.5">Synced</div>
                  </div>
                </div>

                {/* Module 2 Access Control Block */}
                <div
                  className="p-3 rounded-lg mb-4 flex flex-col gap-2"
                  style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase" style={{ color: 'var(--ink-white)' }}>
                      Contestant Logins
                    </span>
                    {moduleAccess.defendTheEmpire !== false ? (
                      <span
                        className="admin-pill text-[#16A34A]"
                        style={{ background: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.35)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                        LOGINS OPEN
                      </span>
                    ) : (
                      <span
                        className="admin-pill text-[#DC2626]"
                        style={{ background: 'rgba(220, 38, 38, 0.12)', borderColor: 'rgba(220, 38, 38, 0.35)' }}
                      >
                        <Lock className="w-3 h-3 text-[#DC2626]" />
                        LOGINS BLOCKED
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                    {moduleAccess.defendTheEmpire !== false
                      ? 'War Room delegations can sign in. Blocking will immediately sign out all contestants.'
                      : 'War Room logins locked. Active delegations have been logged out.'}
                  </p>

                  <button
                    type="button"
                    disabled={togglingModule === 'defendTheEmpire'}
                    onClick={() => handleToggleModuleClick('defendTheEmpire', 'Defend the Empire', moduleAccess.defendTheEmpire !== false)}
                    className="admin-btn w-full justify-center text-xs py-1.5"
                    style={
                      moduleAccess.defendTheEmpire !== false
                        ? {
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#DC2626',
                            borderColor: 'rgba(220, 38, 38, 0.3)'
                          }
                        : {
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#16A34A',
                            borderColor: 'rgba(22, 163, 74, 0.3)'
                          }
                    }
                  >
                    {togglingModule === 'defendTheEmpire' ? (
                      'Updating Access...'
                    ) : moduleAccess.defendTheEmpire !== false ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Block Logins & Sign-ups
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        Allow Logins & Sign-ups
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/defend')}
                className="admin-btn admin-btn-brown w-full justify-center text-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                Launch War Room Admin
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Module 3: Market Monopoly Admin */}
            <div
              className="admin-card flex flex-col justify-between"
              style={{ borderTop: '3px solid var(--brown-primary)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                    style={{ background: 'var(--card-inset)', border: '1px solid var(--border)', color: 'var(--brown-primary)' }}
                  >
                    MNP
                  </div>
                  <span
                    className="admin-pill text-[#16A34A]"
                    style={{ background: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.35)' }}
                  >
                    <Activity className="w-3 h-3 text-[#16A34A]" />
                    READY · 25 AREAS
                  </span>
                </div>

                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--brown-primary)' }}>
                  Module 03
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-tight" style={{ color: 'var(--ink-white)' }}>
                  Market Monopoly Admin
                </h3>
                <p className="text-xs mb-4" style={{ color: 'var(--ink-gray)' }}>
                  Karachi property auction record-keeper, 17 utilities, level upgrades & spin-wheel rent transfers.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="p-2 rounded-lg text-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--ink-muted)' }}>Properties</div>
                    <div className="text-xs font-mono font-bold mt-0.5" style={{ color: 'var(--ink-white)' }}>25 Karachi</div>
                  </div>
                  <div className="p-2 rounded-lg text-center" style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--ink-muted)' }}>Utilities</div>
                    <div className="text-xs font-mono font-bold text-[#16A34A] mt-0.5">17 Items</div>
                  </div>
                </div>

                {/* Module 3 Access Control Block */}
                <div
                  className="p-3 rounded-lg mb-4 flex flex-col gap-2"
                  style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase" style={{ color: 'var(--ink-white)' }}>
                      Contestant Logins
                    </span>
                    {moduleAccess.marketMonopoly !== false ? (
                      <span
                        className="admin-pill text-[#16A34A]"
                        style={{ background: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.35)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                        LOGINS OPEN
                      </span>
                    ) : (
                      <span
                        className="admin-pill text-[#DC2626]"
                        style={{ background: 'rgba(220, 38, 38, 0.12)', borderColor: 'rgba(220, 38, 38, 0.35)' }}
                      >
                        <Lock className="w-3 h-3 text-[#DC2626]" />
                        LOGINS BLOCKED
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                    {moduleAccess.marketMonopoly !== false
                      ? 'Monopoly teams can sign in. Blocking will immediately sign out all contestants.'
                      : 'Monopoly logins locked. Active contestants have been logged out.'}
                  </p>

                  <button
                    type="button"
                    disabled={togglingModule === 'marketMonopoly'}
                    onClick={() => handleToggleModuleClick('marketMonopoly', 'Market Monopoly', moduleAccess.marketMonopoly !== false)}
                    className="admin-btn w-full justify-center text-xs py-1.5"
                    style={
                      moduleAccess.marketMonopoly !== false
                        ? {
                            background: 'rgba(220, 38, 38, 0.08)',
                            color: '#DC2626',
                            borderColor: 'rgba(220, 38, 38, 0.3)'
                          }
                        : {
                            background: 'rgba(22, 163, 74, 0.08)',
                            color: '#16A34A',
                            borderColor: 'rgba(22, 163, 74, 0.3)'
                          }
                    }
                  >
                    {togglingModule === 'marketMonopoly' ? (
                      'Updating Access...'
                    ) : moduleAccess.marketMonopoly !== false ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Block Logins & Sign-ups
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        Allow Logins & Sign-ups
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/monopoly')}
                className="admin-btn admin-btn-brown w-full justify-center text-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                Open Monopoly Admin
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

          </div>
        </div>

        {/* Clean 1-Line Telemetry Footer */}
        <div
          className="admin-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span style={{ color: 'var(--ink-gray)' }}>
              ENGINE: <strong className="text-[#16A34A]">{telemetry?.investomaniaEngine || 'ONLINE'}</strong>
            </span>
            <span style={{ color: 'var(--ink-gray)' }}>
              TEAMS: <strong style={{ color: 'var(--ink-white)' }}>{telemetry?.supabase?.registeredTeams || 0}</strong>
            </span>
          </div>

          <div style={{ color: 'var(--ink-muted)' }}>
            AES 2026 Admin Architecture · Ports 4000/4001
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Blocking Module Logins */}
      {blockConfirmModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(4px)' }}
          onClick={() => setBlockConfirmModal({ open: false, moduleKey: '', moduleTitle: '' })}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 space-y-5 shadow-2xl"
            style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(220, 38, 38, 0.12)', border: '1px solid rgba(220, 38, 38, 0.35)' }}
              >
                <Lock className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--ink-white)' }}>
                  Block {blockConfirmModal.moduleTitle} Logins?
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Immediate Participant Disconnection
                </p>
              </div>
            </div>

            <div
              className="p-3.5 rounded-lg text-xs leading-relaxed space-y-2"
              style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--ink-bone)' }}>
                Are you sure you want to block logins and registrations for <strong>{blockConfirmModal.moduleTitle}</strong>?
              </p>
              <p className="text-[#DC2626] font-semibold">
                Warning: Any contestant currently signed into this module will be automatically signed out immediately in real time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBlockConfirmModal({ open: false, moduleKey: '', moduleTitle: '' })}
                className="admin-btn admin-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={togglingModule === blockConfirmModal.moduleKey}
                onClick={() => executeToggleModuleAccess(blockConfirmModal.moduleKey, false)}
                className="admin-btn text-xs font-bold"
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  borderColor: '#DC2626'
                }}
              >
                {togglingModule === blockConfirmModal.moduleKey ? (
                  'Disconnecting...'
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Confirm & Block Logins
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Credentials Management Modal */}
      {showCredModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCredModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl p-6 space-y-6"
            style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
                >
                  <KeyRound className="w-4 h-4" style={{ color: 'var(--brown-primary)' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--ink-white)' }}>
                    Admin Credentials
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--ink-gray)' }}>
                    Generate, assign, and revoke administrator passkeys
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCredModal(false)}
                className="p-1.5 rounded-lg hover:opacity-75"
                style={{ color: 'var(--ink-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Creation Form */}
            <form onSubmit={handleCreatePasskey} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase mb-1" style={{ color: 'var(--ink-gray)' }}>
                    New Passkey
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newKeyInput}
                      onChange={(e) => setNewKeyInput(e.target.value)}
                      placeholder="e.g. adm_judge9"
                      className="admin-input font-mono w-full text-xs"
                      disabled={credLoading}
                    />
                    <button
                      type="button"
                      onClick={generateRandomKey}
                      className="admin-btn admin-btn-secondary text-xs px-2.5 shrink-0"
                      title="Generate random secure passkey"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase mb-1" style={{ color: 'var(--ink-gray)' }}>
                    Role / Label
                  </label>
                  <input
                    type="text"
                    value={newLabelInput}
                    onChange={(e) => setNewLabelInput(e.target.value)}
                    placeholder="e.g. Lead Arbitrator"
                    className="admin-input text-xs w-full"
                    disabled={credLoading}
                  />
                </div>
              </div>

              {credMsg.text && (
                <div
                  className={`p-2 rounded-lg text-xs font-medium ${
                    credMsg.type === 'error'
                      ? 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-300'
                      : 'bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] dark:bg-green-950/30 dark:border-green-800/50 dark:text-green-300'
                  }`}
                >
                  {credMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="admin-btn admin-btn-brown w-full h-9 text-xs"
                disabled={credLoading}
              >
                <Plus className="w-3.5 h-3.5" />
                {credLoading ? 'Creating...' : 'Create Admin Credential'}
              </button>
            </form>

            {/* Active Credentials List */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono uppercase font-semibold" style={{ color: 'var(--ink-muted)' }}>
                Active Credentials ({adminPasskeys.length})
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {adminPasskeys.map((p, idx) => {
                  const keyVal = p.keyMask || p.key || (typeof p === 'string' ? p : 'adm••••key');
                  const deleteTarget = p.key || p.keyMask || p.id || (typeof p === 'string' ? p : '');
                  const labelVal = p.label || p.role || 'Admin Key';
                  const isLastKey = adminPasskeys.length <= 1;

                  return (
                    <div
                      key={p.id || p.key || idx}
                      className="p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
                      style={{ background: 'var(--card-inset)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-bold flex items-center gap-2" style={{ color: 'var(--ink-white)' }}>
                          <span>{keyVal}</span>
                          {copiedKey === keyVal ? (
                            <Check className="w-3 h-3 text-[#16A34A]" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(keyVal)}
                              className="text-[10px] hover:opacity-75 cursor-pointer"
                              style={{ color: 'var(--ink-muted)' }}
                              title="Copy passkey"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-gray)' }}>
                          {labelVal}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isLastKey}
                          onClick={() => handleDeletePasskey(deleteTarget)}
                          className={`p-1.5 rounded border border-transparent transition-colors ${
                            isLastKey
                              ? 'opacity-30 cursor-not-allowed text-gray-400'
                              : 'hover:bg-red-100 dark:hover:bg-red-950/40 text-[#DC2626] dark:text-red-400 hover:border-red-300 dark:hover:border-red-900 cursor-pointer'
                          }`}
                          title={isLastKey ? 'Cannot delete the only remaining admin passkey' : 'Revoke Credential'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvestomaniaAdminRoute({ onLogout }) {
  const navigate = useNavigate();

  return (
    <GameProvider>
      <div className="w-full min-h-screen">
        <Suspense fallback={<AdminModuleFallback title="Connecting to Investomania Engine..." />}>
          <AdminPanel onBackToHub={() => navigate('/')} onLogout={onLogout} />
        </Suspense>
      </div>
    </GameProvider>
  );
}

function PlaceholderModuleView({ name }) {
  const navigate = useNavigate();
  return (
    <div className="admin-executive-hub min-h-screen flex items-center justify-center p-8">
      <style>{STYLES}</style>
      <div className="admin-card max-w-sm w-full text-center p-8">
        <div
          className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
        >
          <Layers className="w-5 h-5" style={{ color: 'var(--brown-primary)' }} />
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink-white)' }}>
          {name} Admin Console
        </h2>
        <p className="text-xs mb-5" style={{ color: 'var(--ink-gray)' }}>
          This tournament module is provisioned and ready for drop-in.
        </p>
        <button
          onClick={() => navigate('/')}
          className="admin-btn admin-btn-brown w-full justify-center text-xs"
        >
          Return to Master Admin Hub
        </button>
      </div>
    </div>
  );
}

function DefendAdminRoute({ onLogout }) {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<AdminModuleFallback title="Connecting to War Room Command..." />}>
      <AdminDashboardShell onBackToHub={() => navigate('/')} onLogout={onLogout} />
    </Suspense>
  );
}

function MonopolyAdminRoute({ onLogout }) {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<AdminModuleFallback title="Opening Market Monopoly Admin..." />}>
      <MonopolyAdminPanel onBackToHub={() => navigate('/')} onLogout={onLogout} />
    </Suspense>
  );
}

function AdminProtectedRoute({ isAuthenticated, isCheckingAuth, children }) {
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="admin-executive-hub min-h-screen flex items-center justify-center p-6 bg-[#0C0A09] text-[#F9F8F6]">
        <style>{STYLES}</style>
        <div className="admin-card max-w-sm w-full p-8 text-center space-y-4">
          <div
            className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center"
            style={{ background: 'var(--card-inset)', border: '1px solid var(--border)' }}
          >
            <Activity className="w-5 h-5 animate-spin" style={{ color: 'var(--brown-primary)' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--ink-white)' }}>
              Verifying Authorization
            </h2>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--ink-gray)' }}>
              Authenticating administrator credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function AdminPageTitleSync() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '') {
      document.title = 'AES Master Admin';
    } else if (path.startsWith('/monopoly')) {
      document.title = 'Market Monopoly Admin';
    } else if (path.startsWith('/defend')) {
      document.title = 'Defend The Empire Admin';
    } else if (path.startsWith('/investomania')) {
      document.title = 'Investomania Admin';
    } else {
      document.title = 'AES Master Admin';
    }
  }, [location.pathname]);

  return null;
}

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel Crash Caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-executive-hub min-h-screen flex items-center justify-center p-6 bg-[#0C0A09] text-[#F5EFEB]">
          <div className="admin-card max-w-md w-full p-8 text-center space-y-4 border border-[#4D372B] bg-[#181513] rounded-2xl shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#2E0C16] border border-[#8B1428] flex items-center justify-center text-[#DC2626]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-serif text-[#FFFFFF]">
              Admin Panel Notice
            </h2>
            <p className="text-xs font-mono text-[#A8A29E] leading-relaxed">
              {this.state.error?.message || 'A navigation or rendering glitch occurred while switching tabs.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="admin-btn admin-btn-brown text-xs px-4 py-2"
              >
                Refresh View
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="admin-btn admin-btn-secondary text-xs px-4 py-2"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Passkey always starts empty so credentials are never pre-filled or visible
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const handleLogout = useCallback(() => {
    try {
      sessionStorage.removeItem('alphaace_admin_token');
      sessionStorage.removeItem('alphaace_admin_passkey');
      localStorage.removeItem('alphaace_admin_token');
      localStorage.removeItem('alphaace_admin_passkey');
      sessionStorage.clear();
      localStorage.removeItem('alphaace_admin_token');
      localStorage.removeItem('alphaace_admin_passkey');
    } catch {}
    setPasskey('');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const verifyActiveSession = async () => {
      const storedToken =
        sessionStorage.getItem('alphaace_admin_token') ||
        sessionStorage.getItem('alphaace_admin_passkey') ||
        localStorage.getItem('alphaace_admin_token') ||
        localStorage.getItem('alphaace_admin_passkey');

      if (!storedToken || !storedToken.trim()) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const authData = await authAdminDirect(storedToken.trim());
        if (isMounted) {
          if (authData && authData.authenticated) {
            setIsAuthenticated(true);
          } else {
            handleLogout();
          }
          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.warn('Admin token validation error:', err);
        if (isMounted) {
          handleLogout();
          setIsCheckingAuth(false);
        }
      }
    };

    verifyActiveSession();

    return () => {
      isMounted = false;
    };
  }, [handleLogout]);

  return (
    <AdminErrorBoundary>
      <BrowserRouter>
        <AdminPageTitleSync />
        <Routes>
          <Route
            path="/"
            element={
              <MasterHub
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
                isCheckingAuth={isCheckingAuth}
                onLogout={handleLogout}
                passkey={passkey}
                setPasskey={setPasskey}
              />
            }
          />
          <Route
            path="/investomania/*"
            element={
              <AdminProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <InvestomaniaAdminRoute onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/investomania"
            element={
              <AdminProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <InvestomaniaAdminRoute onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/defend/*"
            element={
              <AdminProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <DefendAdminRoute onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/defend"
            element={
              <AdminProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <DefendAdminRoute onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/monopoly/*"
            element={
              <AdminProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <MonopolyAdminRoute onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/monopoly"
            element={
              <AdminProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <MonopolyAdminRoute onLogout={handleLogout} />
              </AdminProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminErrorBoundary>
  );
}
