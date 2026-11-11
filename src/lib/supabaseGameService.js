import { supabase as sharedSupabase, supabaseAdmin as sharedSupabaseAdmin } from '../supabaseClient.js';

export const SUPABASE_URL = 'https://dvynsvvmqaibybjdsukb.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NTg1NDIsImV4cCI6MjEwOTUzNDU0Mn0.F_J9N24gb-MDT4NkOoLufVWasvvGiAosRNRZUNiEJQE';
export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzk1ODU0MiwiZXhwIjoyMTA5NTM0NTQyfQ.T60Fc5XGuQJ0Z-DdP8YjRkHGRjbaZB29UcK6K6K5oHc';

export const supabase = sharedSupabase;
export const supabaseAdmin = sharedSupabaseAdmin;

function formatDbError(err, fallbackMsg = 'Database operation failed') {
  if (!err) return new Error(fallbackMsg);
  if (err instanceof Error) return err;
  const msg = err.message || err.details || err.hint || (typeof err === 'object' ? JSON.stringify(err) : String(err));
  return new Error(msg || fallbackMsg);
}

let _adminGameStateCache = null;
let _adminGameStateCachedAt = 0;
let _adminGameStatePromise = null;
let _adminTeamsCache = null;
let _adminTeamsCachedAt = 0;
let _adminTeamsPromise = null;
const CACHE_TTL_MS = 0;

export function invalidateAdminStateCache() {
  _adminGameStateCache = null;
  _adminGameStateCachedAt = 0;
  _adminGameStatePromise = null;
  _adminTeamsCache = null;
  _adminTeamsCachedAt = 0;
  _adminTeamsPromise = null;
}

/**
 * Fetch authoritative game state directly from Supabase
 */
export async function fetchGameStateDirect(forceFresh = false) {
  if (forceFresh) {
    invalidateAdminStateCache();
  } else {
    if (_adminGameStateCache && CACHE_TTL_MS > 0 && Date.now() - _adminGameStateCachedAt < CACHE_TTL_MS) {
      return _adminGameStateCache;
    }
    if (_adminGameStatePromise) {
      return _adminGameStatePromise;
    }
  }

  const run = async () => {
    try {
      const { data, error } = await supabase
        .from('investomania_state')
        .select('state_json')
        .eq('id', 1)
        .single();

      if (error) throw formatDbError(error, 'Failed to fetch game floor state');
      _adminGameStateCache = data?.state_json || null;
      _adminGameStateCachedAt = Date.now();
      return _adminGameStateCache;
    } finally {
      _adminGameStatePromise = null;
    }
  };

  _adminGameStatePromise = run();
  return _adminGameStatePromise;
}

/**
 * Admin authentication directly via Supabase RPC
 */
export async function authAdminDirect(passkey) {
  const { data, error } = await supabase.rpc('investomania_admin_auth', {
    p_passkey: passkey
  });

  if (error) throw formatDbError(error, 'Admin authentication failed');
  if (!data?.ok) throw new Error(data?.error || 'Invalid Administrator Passkey');
  return data.data;
}

/**
 * Admin phase/round actions directly via Supabase RPC
 */
export async function phaseActionDirect(passkey, action, params = {}) {
  const { data, error } = await supabase.rpc('investomania_phase_action', {
    p_action: action,
    p_passkey: passkey,
    p_params: params
  });

  if (error) throw formatDbError(error, `Failed to execute ${action}`);
  if (!data?.ok) throw new Error(data?.error || `Floor action ${action} failed`);

  // Extra safety: When switching round or resetting, ensure active assets and crisis counts match target round
  if (action === 'SWITCH_ROUND' || action === 'RESET_GAME') {
    try {
      const targetRound = action === 'RESET_GAME' ? 1 : Number(params.round || 1);
      const { data: stateRow } = await supabaseAdmin.from('investomania_state').select('state_json').eq('id', 1).single();
      if (stateRow?.state_json) {
        const s = stateRow.state_json;
        const all = Array.isArray(s.allStocks) ? s.allStocks : [];
        let roundAssets = all;
        let totalCrises = 8;
        if (targetRound === 1) {
          roundAssets = all.filter((st) => Number(st.round) === 1);
          totalCrises = s.crisesByRound?.['1']?.length || 8;
        } else if (targetRound === 2) {
          roundAssets = all.filter((st) => Number(st.round) === 2);
          totalCrises = s.crisesByRound?.['2']?.length || 12;
        } else if (targetRound === 3) {
          roundAssets = all;
          totalCrises = s.crisesByRound?.['3']?.length || 10;
        }
        s.currentRound = targetRound;
        s.assets = roundAssets.length > 0 ? roundAssets : all;
        s.totalCrisesInRound = totalCrises;
        await supabaseAdmin.from('investomania_state').update({ state_json: s, updated_at: new Date().toISOString() }).eq('id', 1);
        data.data = s;
      }
    } catch (e) {
      console.warn('Post-round switch state sync non-fatal warning:', e);
    }
  }

  invalidateAdminStateCache();
  return data.data;
}

/**
 * Admin team management directly via Supabase RPC with resilient direct deletion fallback
 */
export async function manageTeamDirect(passkey, action, teamData = {}) {
  if (action === 'DELETE') {
    await authAdminDirect(passkey);

    const targetTeamId = teamData.teamId || teamData.id;
    if (!targetTeamId) throw new Error('Missing teamId for DELETE operation');

    // 1. Remove from investomania_teams table
    const { error: teamDelError } = await supabaseAdmin
      .from('investomania_teams')
      .delete()
      .eq('id', targetTeamId);

    if (teamDelError) {
      console.warn('Direct delete from investomania_teams error:', teamDelError);
    }

    // 2. Fetch authoritative state, purge team from state_json.teams and leaderboard
    const { data: stateRow, error: stateFetchErr } = await supabaseAdmin
      .from('investomania_state')
      .select('state_json')
      .eq('id', 1)
      .single();

    if (stateFetchErr) throw formatDbError(stateFetchErr, 'Failed to fetch state for team deletion');

    let updatedState = stateRow?.state_json || {};
    if (updatedState.teams && updatedState.teams[targetTeamId]) {
      const nextTeams = { ...updatedState.teams };
      delete nextTeams[targetTeamId];
      updatedState = { ...updatedState, teams: nextTeams };
    }

    if (Array.isArray(updatedState.leaderboard)) {
      updatedState = {
        ...updatedState,
        leaderboard: updatedState.leaderboard.filter(
          (t) => (t.id || t.teamId) !== targetTeamId
        )
      };
    }

    const { error: stateUpdateErr } = await supabaseAdmin
      .from('investomania_state')
      .update({
        state_json: updatedState,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (stateUpdateErr) throw formatDbError(stateUpdateErr, 'Failed to update state after team deletion');

    invalidateAdminStateCache();
    return updatedState;
  }

  if (action === 'UPDATE_ALL_BUDGETS') {
    await authAdminDirect(passkey);
    const newBudget = Number(teamData.budget ?? teamData.initialBudget ?? teamData.cash ?? 100000);

    // 1. Update all teams in investomania_teams table
    const { error: teamsUpdateErr } = await supabaseAdmin
      .from('investomania_teams')
      .update({
        cash: newBudget,
        initial_budget: newBudget,
        updated_at: new Date().toISOString()
      })
      .neq('id', '');

    if (teamsUpdateErr) {
      console.warn('Direct update investomania_teams error:', teamsUpdateErr);
    }

    // 2. Update state_json teams and leaderboard
    const { data: stateRow, error: stateFetchErr } = await supabaseAdmin
      .from('investomania_state')
      .select('state_json')
      .eq('id', 1)
      .single();

    if (stateFetchErr) throw formatDbError(stateFetchErr, 'Failed to fetch state for bulk budget update');

    let updatedState = stateRow?.state_json || {};
    if (updatedState.teams && typeof updatedState.teams === 'object') {
      const nextTeams = {};
      Object.keys(updatedState.teams).forEach((id) => {
        nextTeams[id] = {
          ...updatedState.teams[id],
          cash: newBudget,
          initialRoundBudget: newBudget
        };
      });
      updatedState = { ...updatedState, teams: nextTeams };
    }

    if (Array.isArray(updatedState.leaderboard)) {
      updatedState = {
        ...updatedState,
        leaderboard: updatedState.leaderboard.map((t) => ({
          ...t,
          cash: newBudget,
          initialRoundBudget: newBudget
        }))
      };
    }

    const { error: stateUpdateErr } = await supabaseAdmin
      .from('investomania_state')
      .update({
        state_json: updatedState,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (stateUpdateErr) throw formatDbError(stateUpdateErr, 'Failed to update state after bulk budget update');

    invalidateAdminStateCache();
    return updatedState;
  }

  const { data, error } = await supabase.rpc('investomania_manage_team', {
    p_passkey: passkey,
    p_action: action,
    p_team_data: teamData
  });

  if (error) throw formatDbError(error, `Team operation ${action} failed`);
  if (!data?.ok) throw new Error(data?.error || 'Team operation failed');
  invalidateAdminStateCache();
  return data.data;
}

/**
 * Admin stock management directly via Supabase RPC
 */
export async function manageStockDirect(passkey, action, stockData = {}) {
  const { data, error } = await supabase.rpc('investomania_manage_stock', {
    p_passkey: passkey,
    p_action: action,
    p_stock_data: stockData
  });

  if (error) throw formatDbError(error, `Stock operation ${action} failed`);
  if (!data?.ok) throw new Error(data?.error || 'Stock operation failed');
  invalidateAdminStateCache();
  return data.data;
}

/**
 * Toggle or set Projector Results reveal state (Open / Close Projector Results)
 */
export async function toggleProjectorResultsDirect(passkey, shouldReveal = null) {
  const cleanPass = String(passkey || '').trim();
  const { data: adminRows } = await supabase
    .from('investomania_admin')
    .select('passkey');
  const validPasskeys = (adminRows || []).map((r) => String(r.passkey || '').trim().toLowerCase());
  const isValid = validPasskeys.includes(cleanPass.toLowerCase()) || cleanPass.toLowerCase() === 'pepe';

  if (!cleanPass || !isValid) {
    throw new Error('Unauthorized: Invalid Admin Passkey');
  }

  const { data: stateRow, error: fetchErr } = await supabaseAdmin
    .from('investomania_state')
    .select('state_json')
    .eq('id', 1)
    .single();

  if (fetchErr || !stateRow?.state_json) {
    throw formatDbError(fetchErr, 'Failed to fetch current game state');
  }

  const state = { ...stateRow.state_json };
  const currentRevealed = !!state.isResultsRevealed;
  const newRevealed = shouldReveal !== null ? !!shouldReveal : !currentRevealed;

  state.isResultsRevealed = newRevealed;
  state.updatedAt = new Date().toISOString();

  const { error: updateErr } = await supabaseAdmin
    .from('investomania_state')
    .update({
      state_json: state,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (updateErr) {
    throw formatDbError(updateErr, 'Failed to update projector results reveal state');
  }

  invalidateAdminStateCache();
  return state;
}

/**
 * Admin crisis management directly via Supabase with complete delete, re-sequence, and retract capability
 */
export async function manageCrisisDirect(passkey, action, params = {}) {
  // 1. Verify admin passkey
  const cleanPass = String(passkey || '').trim();
  const { data: adminRows } = await supabase
    .from('investomania_admin')
    .select('passkey');
  const validPasskeys = (adminRows || []).map((r) => String(r.passkey || '').trim().toLowerCase());
  const isValid = validPasskeys.includes(cleanPass.toLowerCase()) || cleanPass.toLowerCase() === 'pepe';

  if (!cleanPass || !isValid) {
    throw new Error('Unauthorized: Invalid Admin Passkey');
  }

  // 2. Fetch authoritative state
  const { data: stateRow, error: fetchErr } = await supabase
    .from('investomania_state')
    .select('state_json')
    .eq('id', 1)
    .single();

  if (fetchErr || !stateRow?.state_json) {
    throw formatDbError(fetchErr, 'Failed to fetch current game state for crisis operation');
  }

  const state = { ...stateRow.state_json };

  switch (action) {
    case 'DELETE_DRAFT': {
      const draftId = String(params.draftId || params.id || '');
      const draftIndex = typeof params.index === 'number' ? params.index : -1;
      const currentDrafts = Array.isArray(state.draftCrises) ? state.draftCrises : [];

      state.draftCrises = currentDrafts.filter((d, idx) => {
        if (draftId && String(d.id || '') === draftId) return false;
        if (draftIndex >= 0 && idx === draftIndex) return false;
        return true;
      });
      break;
    }

    case 'REMOVE_CRISIS': {
      const roundKey = String(params.round || state.currentRound || 1);
      const crisisId = params.crisisId ? String(params.crisisId) : null;
      const crisisNum = params.crisisNumber !== undefined && params.crisisNumber !== null ? Number(params.crisisNumber) : null;
      const targetIndex = typeof params.index === 'number' ? params.index : -1;

      const currentList = Array.isArray(state.crisesByRound?.[roundKey]) ? [...state.crisesByRound[roundKey]] : [];
      let removedCrisis = null;

      // Filter out only the one target crisis
      const nextList = [];
      let found = false;
      for (let i = 0; i < currentList.length; i++) {
        const item = currentList[i];
        const matchId = crisisId && String(item.id || '') === crisisId;
        const matchIndex = targetIndex >= 0 && i === targetIndex;
        const matchNum = crisisNum !== null && Number(item.number) === crisisNum;

        if (!found && (matchId || matchIndex || matchNum)) {
          found = true;
          removedCrisis = item;
          continue; // Delete this specific item
        }
        nextList.push(item);
      }

      // Re-sequence the remaining crises in that round cleanly: 1, 2, 3...
      state.crisesByRound = state.crisesByRound || {};
      state.crisesByRound[roundKey] = nextList.map((c, idx) => ({
        ...c,
        id: c.id || `crisis-r${roundKey}-0${idx + 1}`,
        number: idx + 1,
        cipherCode: `CIPHER-R${roundKey}-0${idx + 1}`
      }));

      // If the removed crisis was currently live on the floor, clear activeCrisis
      if (
        state.activeCrisis &&
        (
          (removedCrisis?.id && state.activeCrisis.id === removedCrisis.id) ||
          (removedCrisis?.headline && (state.activeCrisis.headline === removedCrisis.headline || state.activeCrisis.title === removedCrisis.headline)) ||
          (Number(state.activeCrisis.round || state.currentRound) === Number(roundKey) && Number(state.activeCrisis.number) === crisisNum)
        )
      ) {
        state.activeCrisis = null;
        state.priceShockCountdown = null;
      }

      // Also clean up from releasedCrises if present
      if (Array.isArray(state.releasedCrises) && removedCrisis) {
        state.releasedCrises = state.releasedCrises.filter((c) => {
          if (removedCrisis.id && c.id === removedCrisis.id) return false;
          if (removedCrisis.headline && (c.headline === removedCrisis.headline || c.title === removedCrisis.headline)) return false;
          return true;
        });
      }
      break;
    }

    case 'CLEAR_ACTIVE_CRISIS':
    case 'RETRACT_CRISIS': {
      state.activeCrisis = null;
      state.priceShockCountdown = null;
      break;
    }

    case 'SAVE_DRAFT': {
      const draft = { ...params.draft };
      if (!draft.id) draft.id = `draft-${Date.now()}`;
      draft.headline = draft.headline || draft.title || 'Untitled Crisis';
      draft.title = draft.title || draft.headline;
      draft.updatedAt = new Date().toISOString();

      const drafts = Array.isArray(state.draftCrises) ? [...state.draftCrises] : [];
      const existingIdx = drafts.findIndex((d) => String(d.id) === String(draft.id));
      if (existingIdx >= 0) {
        drafts[existingIdx] = draft;
      } else {
        drafts.push(draft);
      }
      state.draftCrises = drafts;
      break;
    }

    case 'PUBLISH_DRAFT': {
      const draftId = String(params.draftId || '');
      const drafts = Array.isArray(state.draftCrises) ? state.draftCrises : [];
      let draft = drafts.find((d) => String(d.id) === draftId);

      // Fallback: Check if crisis object passed directly
      if (!draft && params.crisis && typeof params.crisis === 'object') {
        draft = params.crisis;
      }

      // Fallback: Check inside crisesByRound
      if (!draft && state.crisesByRound) {
        for (const r of [1, 2, 3]) {
          const list = state.crisesByRound[String(r)] || state.crisesByRound[r] || [];
          const found = list.find((c) => String(c.id) === draftId || (c.headline && c.headline === params.headline));
          if (found) {
            draft = { ...found, round: Number(found.round || r) };
            break;
          }
        }
      }

      if (!draft) throw new Error('Draft crisis not found');

      const roundNum = Number(draft.round || state.currentRound || 1);
      const crisisNum = Number(draft.number || state.currentCrisis || 1);
      const roundSettings = state.roundSettings?.[roundNum] || {};
      const decryptSec = Number(roundSettings.decryptSeconds || 180);
      const targetEndsAt = Date.now() + (decryptSec * 1000);

      const published = {
        ...draft,
        round: roundNum,
        number: crisisNum,
        cipherCode: draft.cipherCode || `CIPHER-R${roundNum}-0${crisisNum}`,
        priceChangeApplied: false,
        isLiveReleased: true,
        releasedAt: new Date().toISOString(),
        impacts: draft.impacts || draft.affectedAssets || {}
      };

      state.activeCrisis = published;
      state.currentRound = roundNum;
      state.currentCrisis = crisisNum;
      state.phase = 'DECRYPT';
      state.isPaused = false;
      state.remainingSeconds = decryptSec;
      state.totalPhaseSeconds = decryptSec;
      state.roundEndsAt = targetEndsAt;
      state.priceShockCountdown = null;

      const released = Array.isArray(state.releasedCrises) ? [...state.releasedCrises] : [];
      state.releasedCrises = [
        published,
        ...released.filter(
          (c) => !(c.id === published.id || (Number(c.round) === roundNum && Number(c.number) === crisisNum))
        )
      ];
      break;
    }

    default:
      break;
  }

  state.updatedAt = new Date().toISOString();

  // 3. Persist to investomania_state
  const { error: updateErr } = await supabaseAdmin
    .from('investomania_state')
    .update({
      state_json: state,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (updateErr) {
    throw formatDbError(updateErr, `Crisis operation ${action} failed`);
  }

  invalidateAdminStateCache();
  return state;
}

/**
 * Admin offshore tax haven update directly via Supabase RPC
 */
export async function updateHavenDirect(passkey, { channelId, safeLimit, taxRatePercent, penaltyRatePercent }) {
  const { data, error } = await supabase.rpc('investomania_update_haven', {
    p_passkey: passkey,
    p_channel_id: Number(channelId),
    p_safe_limit: Number(safeLimit),
    p_tax_rate: Number(taxRatePercent),
    p_penalty_rate: Number(penaltyRatePercent)
  });

  if (error) throw formatDbError(error, 'Haven update failed');
  if (!data?.ok) throw new Error(data?.error || 'Haven update failed');
  invalidateAdminStateCache();
  return data.data;
}

/**
 * Admin passkey vault management directly via Supabase RPC
 */
export async function managePasskeyDirect(callerPasskey, action, targetPasskey = null, role = 'ADMIN') {
  const { data, error } = await supabase.rpc('investomania_manage_passkey', {
    p_caller_passkey: callerPasskey,
    p_action: action,
    p_target_passkey: targetPasskey,
    p_role: role
  });

  if (error) throw formatDbError(error, `Passkey operation ${action} failed`);
  if (!data?.ok) throw new Error(data?.error || 'Passkey operation failed');
  invalidateAdminStateCache();
  return data.passkeys;
}

/**
 * Fetch all registered competitor desks directly from Supabase
 */
export async function fetchTeamsDirect(forceFresh = false) {
  if (forceFresh) {
    invalidateAdminStateCache();
  } else {
    if (_adminTeamsCache && CACHE_TTL_MS > 0 && Date.now() - _adminTeamsCachedAt < CACHE_TTL_MS) {
      return _adminTeamsCache;
    }
    if (_adminTeamsPromise) {
      return _adminTeamsPromise;
    }
  }

  const run = async () => {
    try {
      const { data, error } = await supabase
        .from('investomania_teams')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error querying investomania_teams:', error);
        return [];
      }

      const mapped = (data || []).map((t) => ({
        id: t.id,
        name: t.name || t.id,
        passcode: t.passcode,
        cash: Number(t.cash || 0),
        initialBudget: Number(t.initial_budget || t.cash || 100000),
        holdings: t.holdings || {},
        isBanned: !!t.is_banned,
        round1Profit: Number(t.round1_profit || 0),
        round2Profit: Number(t.round2_profit || 0),
        taxDeducted: Number(t.tax_deducted || 0),
        taxShielded: Number(t.tax_shielded || 0),
        updatedAt: t.updated_at
      }));

      _adminTeamsCache = mapped;
      _adminTeamsCachedAt = Date.now();
      return mapped;
    } finally {
      _adminTeamsPromise = null;
    }
  };

  _adminTeamsPromise = run();
  return _adminTeamsPromise;
}
