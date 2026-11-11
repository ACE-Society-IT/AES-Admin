import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  supabase,
  fetchGameStateDirect,
  authAdminDirect,
  phaseActionDirect
} from '../lib/supabaseGameService.js';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [team, setTeam] = useState(() => {
    try {
      const saved = sessionStorage.getItem('investomania_team');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminPasscode, setAdminPasscode] = useState(() => 
    sessionStorage.getItem('alphaace_admin_token') || 
    localStorage.getItem('alphaace_admin_token') || 
    sessionStorage.getItem('alphaace_admin_passkey') || 
    localStorage.getItem('alphaace_admin_passkey') || 
    ''
  );

  // Support 3 modes: 'light' (Classic White), 'dark' (Classic Maroon Obsidian), 'aes' (AES Crimson Canvas + Crisp White Cards)
  const [theme, setTheme] = useState(() => sessionStorage.getItem('investomania_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('investomania_theme', theme);
  }, [theme]);

  // Cycles through: Light -> Dark -> AES Mix -> Light
  const toggleTheme = useCallback(() => {
    const cycle = {
      'light': 'dark',
      'dark': 'aes',
      'aes': 'light'
    };
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme((prev) => cycle[prev] || 'light');
      });
    } else {
      setTheme((prev) => cycle[prev] || 'light');
    }
  }, []);

  const setThemeMode = useCallback((mode) => {
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(mode);
      });
    } else {
      setTheme(mode);
    }
  }, []);

  // Fetch Authoritative State Directly from Supabase
  const fetchLatestState = useCallback(async (forceFresh = true) => {
    try {
      const directState = await fetchGameStateDirect(forceFresh);
      if (directState) {
        setGameState(directState);
      }
    } catch (err) {
      console.warn('[Admin GameContext] Supabase state fetch:', err.message);
    }
  }, []);

  // Realtime Supabase Subscription
  useEffect(() => {
    fetchLatestState(true);

    let channel = null;
    try {
      channel = supabase
        .channel('investomania-admin-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'investomania_state' },
          (payload) => {
            if (payload.new && payload.new.state_json) {
              setGameState(payload.new.state_json);
            } else {
              fetchLatestState(true);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'investomania_teams' },
          () => {
            fetchLatestState(true);
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[Admin GameContext] Realtime subscription error:', err.message);
    }

    const handleFocus = () => {
      if (!document.hidden) {
        fetchLatestState(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // Responsive failover heartbeat (4s) so admin dashboard never lags behind floor events
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        fetchLatestState(false);
      }
    }, 4000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(pollInterval);
    };
  }, [fetchLatestState]);

  // Wall-Clock Accurate Countdown Ticker
  useEffect(() => {
    if (!gameState || gameState.isPaused) return;
    if (gameState.phase !== 'DECRYPT' && gameState.phase !== 'TRADING' && gameState.phase !== 'DECRYPTING') return;

    const interval = setInterval(() => {
      setGameState((prev) => {
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

    return () => clearInterval(interval);
  }, [gameState?.phase, gameState?.isPaused, gameState?.roundEndsAt]);

  // Keep logged-in team synced whenever gameState updates
  useEffect(() => {
    if (team && gameState?.leaderboard) {
      const updated = gameState.leaderboard.find((t) => t.id === team.id);
      if (updated) {
        setTeam(updated);
        sessionStorage.setItem('investomania_team', JSON.stringify(updated));
      }
    }
  }, [gameState, team?.id]);

  const getStoredPasskey = () => {
    if (adminPasscode && adminPasscode.trim()) return adminPasscode.trim();
    const p = sessionStorage.getItem('alphaace_admin_passkey') || localStorage.getItem('alphaace_admin_passkey');
    if (p && p.trim()) return p.trim();
    const t = sessionStorage.getItem('alphaace_admin_token') || localStorage.getItem('alphaace_admin_token');
    if (t && t.trim()) return t.trim();
    return '';
  };

  const sendAdminPhaseAction = async (action, customSeconds, extraPayload = {}) => {
    const key = getStoredPasskey();
    const result = await phaseActionDirect(key, action, {
      customSeconds: customSeconds ? Number(customSeconds) : undefined,
      ...extraPayload
    });
    setGameState(result);
    return result;
  };

  const switchAdminRound = async (round) => {
    const key = getStoredPasskey();
    const result = await phaseActionDirect(key, 'SWITCH_ROUND', { round: Number(round) });
    setGameState(result);
    return result;
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        team,
        theme,
        setTheme: setThemeMode,
        toggleTheme,
        adminPasscode,
        setAdminPasscode,
        adminPasskey: adminPasscode,
        setAdminPasskey: setAdminPasscode,
        sendAdminPhaseAction,
        switchAdminRound
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
