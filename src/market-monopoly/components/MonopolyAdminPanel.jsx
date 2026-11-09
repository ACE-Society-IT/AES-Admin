import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import {
  KARACHI_UTILITIES,
  computePropertyValuation,
  computePropertyRent
} from '../data/monopolyData.js';
import {
  fetchMonopolyStore,
  updateCachedAdminMonopolyStore,
  invalidateAdminMonopolyCache,
  persistMonopolyStore,
  recordAuctionWin,
  assignMultiplePropertiesToTeam,
  revokePropertySale,
  updatePropertySettingsAdmin,
  recordResourceBidWin,
  revokeResourceBid,
  releaseNextWheelSpinAdmin,
  triggerWheelSpinAdmin,
  deleteWheelSpinAdmin,
  resetWheelSpinsAdmin,
  deleteWheelSpinByIdAdmin,
  adjustTeamCashAdmin,
  addNewTeamAdmin,
  deleteTeamAdmin,
  resetMonopolyGameAdmin,
  toggleShowRankingsAdmin,
  getInitialStore,
  computeTeamSummary
} from '../lib/monopolyAdminService.js';
import AdminSpinWheelModal from './AdminSpinWheelModal.jsx';
import { RotateCw } from 'lucide-react';
import aesLogo from '../../assets/aes-logo.png';

function AdminPropertySvgBanner({ category = 'Residential', level = 0 }) {
  // Ultra-lightweight 3D isometric representation based on the reference design
  // Low-end friendly vector rendering
  const strokeLine = '#22050D';
  const groundTop = '#2D0A14';
  const groundEdge = '#8B1428';
  const wallFront = '#FBF5E8';
  const wallSide = '#E5D5BC';
  const roofColor = '#ECC37A';
  const roofSide = '#D4A85B';
  const windowFill = '#4D0E1C';

  return (
    <svg viewBox="0 0 280 135" className="w-full h-24 select-none pointer-events-none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="admPlinth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E0C16" />
          <stop offset="100%" stopColor="#1B050D" />
        </linearGradient>
      </defs>
      <rect width="280" height="135" rx="14" fill="url(#admPlinth)" />

      {/* 3D Isometric Platform */}
      <polygon points="32,98 140,126 140,131 32,103" fill="#1A040B" stroke="#120207" strokeWidth="1" />
      <polygon points="248,98 140,126 140,131 248,103" fill="#110207" stroke="#120207" strokeWidth="1" />
      <polygon points="140,68 248,98 140,126 32,98" fill={groundTop} stroke={groundEdge} strokeWidth="1.8" strokeLinejoin="round" />
      <polyline points="42,99 140,124 238,99" fill="none" stroke="#100206" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4" />
      <polyline points="42,98 140,123 238,98" fill="none" stroke="#ECC37A" strokeWidth="1.2" strokeOpacity="0.8" strokeDasharray="5 4" />

      {/* 3D Left Cottage */}
      <rect x="70" y="64" width="28" height="26" fill={wallFront} stroke={strokeLine} strokeWidth="1.2" />
      <polygon points="98,64 104,58 104,84 98,90" fill={wallSide} stroke={strokeLine} strokeWidth="1.2" />
      <polygon points="68,64 84,52 100,64" fill={roofColor} stroke={strokeLine} strokeWidth="1.2" />
      <polygon points="84,52 90,46 106,58 100,64" fill={roofSide} stroke={strokeLine} strokeWidth="1.2" />
      <rect x="77" y="72" width="12" height="11" fill={windowFill} stroke={strokeLine} strokeWidth="0.8" />

      {/* 3D Center Main Building */}
      <rect x="105" y="38" width="42" height="52" fill={wallFront} stroke={strokeLine} strokeWidth="1.4" />
      <polygon points="147,38 168,42 168,85 147,90" fill={wallSide} stroke={strokeLine} strokeWidth="1.4" />
      <polygon points="102,38 128,24 150,38" fill={roofColor} stroke={strokeLine} strokeWidth="1.4" />
      <polygon points="128,24 150,34 171,42 150,38" fill={roofSide} stroke={strokeLine} strokeWidth="1.4" />
      {/* Windows */}
      <rect x="112" y="46" width="9" height="8" fill={windowFill} />
      <rect x="129" y="46" width="9" height="8" fill={windowFill} />
      <rect x="112" y="59" width="9" height="8" fill={windowFill} />
      <rect x="129" y="59" width="9" height="8" fill={windowFill} />
      <rect x="119" y="72" width="14" height="18" fill={windowFill} />

      {/* 3D Right Tower with Spire & Beacon */}
      <rect x="173" y="29" width="28" height="61" fill={wallFront} stroke={strokeLine} strokeWidth="1.4" />
      <polygon points="201,29 209,24 209,79 201,88" fill={wallSide} stroke={strokeLine} strokeWidth="1.4" />
      <polygon points="170,29 187,14 204,29" fill={roofColor} stroke={strokeLine} strokeWidth="1.4" />
      <polygon points="187,14 195,11 212,24 204,29" fill={roofSide} stroke={strokeLine} strokeWidth="1.4" />
      <line x1="187" y1="5" x2="187" y2="14" stroke="#ECC37A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="187" cy="4" r="3.5" fill="#ECC37A" stroke={strokeLine} strokeWidth="1" />
      <rect x="179" y="37" width="7" height="7" fill={windowFill} />
      <rect x="189" y="37" width="7" height="7" fill={windowFill} />
      <rect x="179" y="50" width="7" height="7" fill={windowFill} />
      <rect x="189" y="50" width="7" height="7" fill={windowFill} />

      {/* 3 Golden Spheres on the front-left edge */}
      <circle cx="58" cy="104" r="3.8" fill="#ECC37A" stroke={strokeLine} strokeWidth="1.2" />
      <circle cx="72" cy="107.6" r="3.8" fill="#ECC37A" stroke={strokeLine} strokeWidth="1.2" />
      <circle cx="86" cy="111.2" r="3.8" fill="#ECC37A" stroke={strokeLine} strokeWidth="1.2" />
    </svg>
  );
}

export default function MonopolyAdminPanel({ onBackToHub, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('investomania_admin_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
    document.body.setAttribute('data-admin-theme', themeMode);
    try {
      localStorage.setItem('investomania_admin_theme', themeMode);
    } catch {}
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0C0A09';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F9F8F6';
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [store, setStore] = useState(null);

  // Sync admin activeTab with URL /monopoly/:tab
  const validAdminTabs = useMemo(
    () => ['give_properties', 'properties', 'resources', 'teams', 'wheel', 'history'],
    []
  );

  const getAdminTabFromPath = useCallback(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (validAdminTabs.includes(lastSeg)) return lastSeg;
    return 'give_properties';
  }, [location.pathname, validAdminTabs]);

  const [activeTab, setActiveTabState] = useState(getAdminTabFromPath);

  useEffect(() => {
    const tabFromUrl = getAdminTabFromPath();
    if (tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [location.pathname, getAdminTabFromPath, activeTab]);

  const setActiveTab = useCallback((newTab) => {
    setActiveTabState(newTab);
    navigate(`/monopoly/${newTab}`, { replace: true });
  }, [navigate]);

  const [feedback, setFeedback] = useState(null);

  // Give Properties & Resources Tab: Multi-Select Property IDs, Resource IDs & Target Team
  const [selectedGivePropIds, setSelectedGivePropIds] = useState([]);
  const [selectedGiveResIds, setSelectedGiveResIds] = useState([]);
  const [giveTargetTeamId, setGiveTargetTeamId] = useState('');

  // Selected Property in the Property Settings Tab
  const [selectedPropertyId, setSelectedPropertyId] = useState(1);
  const [assignAmount, setAssignAmount] = useState('');
  const [editValueInc, setEditValueInc] = useState('');
  const [editBaseRent, setEditBaseRent] = useState('');
  const [editRentInc, setEditRentInc] = useState('');
  const [editLevel, setEditLevel] = useState(0);

  // Selected Resource / Utility in the Resources Tab Side Panel
  const [selectedResourceId, setSelectedResourceId] = useState(1);
  const [resourceTeamId, setResourceTeamId] = useState('');
  const [resourceBidAmount, setResourceBidAmount] = useState('18');
  const [resourceSearch, setResourceSearch] = useState('');

  const [propertySearch, setPropertySearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'SOLD'

  // Users / Teams State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamUsername, setNewTeamUsername] = useState('');
  const [newTeamPasscode, setNewTeamPasscode] = useState('');
  const [newTeamCash, setNewTeamCash] = useState('500');
  const [cashDeltaMap, setCashDeltaMap] = useState({});

  const notify = (text, type = 'ok') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3200);
  };

  const [storeError, setStoreError] = useState(null);

  const refreshStore = useCallback(async (forceFresh = false) => {
    try {
      const loaded = await fetchMonopolyStore(forceFresh);
      if (loaded) {
        setStore(loaded);
        setStoreError(null);
      }
    } catch (err) {
      console.error('Supabase refreshStore error:', err);
      setStoreError(err.message || 'Unable to connect to tournament database');
    }
  }, []);

  useEffect(() => {
    refreshStore(true);

    const handleDbChange = () => {
      invalidateAdminMonopolyCache();
      refreshStore(true);
    };

    const sub = supabase
      .channel('monopoly_admin_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monopoly_state', filter: 'id=eq.1' },
        (payload) => {
          if (payload?.new?.state_json) {
            const updated = updateCachedAdminMonopolyStore(payload.new.state_json);
            if (updated) {
              setStore(updated);
              setStoreError(null);
            }
          }
          handleDbChange();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monopoly_teams' },
        handleDbChange
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monopoly_properties' },
        handleDbChange
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monopoly_transactions' },
        handleDbChange
      )
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        invalidateAdminMonopolyCache();
        refreshStore(true);
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshStore(true);
      }
    }, 6000);

    return () => {
      supabase.removeChannel(sub);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(pollInterval);
    };
  }, [refreshStore]);

  const teamSummaries = useMemo(() => {
    if (!store) return [];
    return (store.teams || [])
      .map((t) => computeTeamSummary(t, store.properties))
      .sort((a, b) => b.netWorth - a.netWorth);
  }, [store]);

  const filteredProperties = useMemo(() => {
    if (!store) return [];
    return store.properties.filter((p) => {
      if (propertyFilter === 'AVAILABLE' && p.ownerTeamId) return false;
      if (propertyFilter === 'SOLD' && !p.ownerTeamId) return false;
      if (!propertySearch.trim()) return true;
      const q = propertySearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q)
      );
    });
  }, [store, propertyFilter, propertySearch]);

  const selectedProperty = useMemo(() => {
    if (!store) return null;
    return (
      store.properties.find((p) => Number(p.id) === Number(selectedPropertyId)) ||
      store.properties[0] ||
      null
    );
  }, [store, selectedPropertyId]);

  // Populate side panel inputs whenever the Admin clicks a different property card
  useEffect(() => {
    if (!selectedProperty) return;
    setAssignAmount(String(selectedProperty.openingValue || 100));
    const valInc =
      selectedProperty.valueIncreasePerLevel !== undefined
        ? selectedProperty.valueIncreasePerLevel
        : Math.round(((selectedProperty.level3Target || selectedProperty.openingValue * 1.6) - selectedProperty.openingValue) / 3);
    setEditValueInc(String(valInc));
    const baseR = selectedProperty.rentValues?.[0] ?? 15;
    setEditBaseRent(String(baseR));
    const rentInc =
      selectedProperty.rentIncreasePerLevel !== undefined
        ? selectedProperty.rentIncreasePerLevel
        : Math.round(((selectedProperty.rentValues?.[3] ?? baseR + 30) - baseR) / 3);
    setEditRentInc(String(rentInc));
    setEditLevel(Math.min(3, Math.max(0, Number(selectedProperty.upgradeLevel || 0))));
  }, [selectedProperty?.id]);

  const selectedResource = useMemo(() => {
    return (
      KARACHI_UTILITIES.find((u) => Number(u.id) === Number(selectedResourceId)) ||
      KARACHI_UTILITIES[0]
    );
  }, [selectedResourceId]);

  const filteredResources = useMemo(() => {
    if (!resourceSearch.trim()) return KARACHI_UTILITIES;
    const q = resourceSearch.toLowerCase();
    return KARACHI_UTILITIES.filter(
      (u) => u.name.toLowerCase().includes(q) || u.category.toLowerCase().includes(q)
    );
  }, [resourceSearch]);

  const handleSelectResourceCard = (util) => {
    setSelectedResourceId(util.id);
    setResourceBidAmount(String(util.cost || 15));
  };

  const handleAssignSelectedResource = async (e) => {
    if (e) e.preventDefault();
    if (!selectedResource) return;
    if (!resourceTeamId) {
      notify('Select a team in the side panel first.', 'err');
      return;
    }
    const bidAmt = Number(resourceBidAmount || selectedResource.cost);
    if (!Number.isFinite(bidAmt) || bidAmt <= 0) {
      notify('Enter a valid resource bid amount in Lakhs.', 'err');
      return;
    }
    try {
      const updated = await recordResourceBidWin({
        store,
        utilityId: selectedResource.id,
        teamId: resourceTeamId,
        bidAmount: bidAmt
      });
      setStore(updated);
      notify(`${selectedResource.name} given to team (Rs ${bidAmt}L deducted automatically)`);
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const handleRevokeResource = async (teamId, instanceId) => {
    try {
      const updated = await revokeResourceBid({ store, teamId, instanceId });
      setStore(updated);
      notify('Resource removed from team and bid money refunded.');
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const handleSelectPropertyCard = (prop) => {
    setSelectedPropertyId(prop.id);
    setAssignAmount(String(prop.openingValue || 100));
    const valInc =
      prop.valueIncreasePerLevel !== undefined
        ? prop.valueIncreasePerLevel
        : Math.round(((prop.level3Target || prop.openingValue * 1.6) - prop.openingValue) / 3);
    setEditValueInc(String(valInc));
    const baseR = prop.rentValues?.[0] ?? 15;
    setEditBaseRent(String(baseR));
    const rentInc =
      prop.rentIncreasePerLevel !== undefined
        ? prop.rentIncreasePerLevel
        : Math.round(((prop.rentValues?.[3] ?? baseR + 30) - baseR) / 3);
    setEditRentInc(String(rentInc));
    setEditLevel(Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0))));
  };

  const handleSwitchRound = async (roundNum) => {
    if (!store) return;
    const updated = await persistMonopolyStore({
      ...store,
      currentRound: roundNum
    });
    setStore(updated);
    notify(`Switched to Round ${roundNum}`);
  };

  // Toggle a Property Card in the Multi-Select Give Tab
  const toggleGivePropertySelection = (propId) => {
    const idNum = Number(propId);
    setSelectedGivePropIds((prev) =>
      prev.includes(idNum) ? prev.filter((id) => id !== idNum) : [...prev, idNum]
    );
  };

  // Toggle a Resource Card in the Multi-Select Give Tab
  const toggleGiveResourceSelection = (utilId) => {
    const idNum = Number(utilId);
    setSelectedGiveResIds((prev) =>
      prev.includes(idNum) ? prev.filter((id) => id !== idNum) : [...prev, idNum]
    );
  };

  // Give All Selected Properties AND/OR Resources to the Chosen Team in One Click
  const handleGiveSelectedPropertiesToTeam = async (e) => {
    if (e) e.preventDefault();
    if (selectedGivePropIds.length === 0 && selectedGiveResIds.length === 0) {
      notify('Select one or more properties or resources first.', 'err');
      return;
    }
    if (!giveTargetTeamId) {
      notify('Select a team in the side panel first.', 'err');
      return;
    }

    try {
      const updated = await assignMultiplePropertiesToTeam({
        store,
        propertyIds: selectedGivePropIds,
        resourceIds: selectedGiveResIds,
        teamId: giveTargetTeamId
      });
      setStore(updated);
      const pCount = selectedGivePropIds.length;
      const rCount = selectedGiveResIds.length;
      setSelectedGivePropIds([]);
      setSelectedGiveResIds([]);
      notify(
        `Sent ${pCount ? `${pCount} propert${pCount === 1 ? 'y' : 'ies'}` : ''}${
          pCount && rCount ? ' & ' : ''
        }${rCount ? `${rCount} resource${rCount === 1 ? '' : 's'}` : ''} to team!`
      );
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  // Save Property Settings (Money, Level-Up Increase, Rent Increase, Max Level 3)
  const handleSavePropertySettings = async (e) => {
    if (e) e.preventDefault();
    if (!selectedProperty) return;
    try {
      const updated = await updatePropertySettingsAdmin({
        store,
        propertyId: selectedProperty.id,
        openingValue: Number(assignAmount || selectedProperty.openingValue),
        valueIncreasePerLevel: Number(editValueInc || 25),
        baseRent: Number(editBaseRent || 15),
        rentIncreasePerLevel: Number(editRentInc || 10),
        upgradeLevel: editLevel
      });
      setStore(updated);
      notify(`Saved settings for ${selectedProperty.name} (Max Level 3)`);
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const handleUndoSale = async (propId) => {
    try {
      const updated = await revokePropertySale({ store, propertyId: propId });
      setStore(updated);
      notify('Property removed from team and cash refunded.');
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  // Create Team / User
  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      const updated = await addNewTeamAdmin({
        store,
        name: newTeamName,
        username: newTeamUsername,
        passcode: newTeamPasscode,
        startingCash: newTeamCash
      });
      setStore(updated);
      setNewTeamName('');
      setNewTeamUsername('');
      setNewTeamPasscode('');
      notify('Team created in Supabase.');
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  // Delete Team / User
  const [confirmDeleteTeamId, setConfirmDeleteTeamId] = useState(null);

  const handleDeleteTeam = async (team) => {
    try {
      const updated = await deleteTeamAdmin({ store, teamId: team.id });
      setStore(updated);
      setConfirmDeleteTeamId(null);
      if (String(giveTargetTeamId) === String(team.id)) {
        setGiveTargetTeamId('');
      }
      if (String(resourceTeamId) === String(team.id)) {
        setResourceTeamId('');
      }
      notify(`Deleted team "${team.name}".`);
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  // Quick Cash Adjust on Team Card
  const handleQuickCashAdjust = async (teamId, sign = 1) => {
    const rawVal = Number(cashDeltaMap[teamId]);
    if (!Number.isFinite(rawVal) || rawVal <= 0) {
      notify('Enter a Lakh amount first.', 'err');
      return;
    }
    try {
      const updated = await adjustTeamCashAdmin({
        store,
        teamId,
        deltaAmount: rawVal * sign,
        reason: 'Admin adjustment'
      });
      setStore(updated);
      setCashDeltaMap((prev) => ({ ...prev, [teamId]: '' }));
      notify('Balance updated.');
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const handleToggleShowRankings = async () => {
    try {
      const updated = await toggleShowRankingsAdmin({ store });
      setStore(updated);
      notify(updated.showRankings ? 'Rankings are now VISIBLE to participants.' : 'Rankings are now HIDDEN from participants.');
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const [isSpinningWheelAdmin, setIsSpinningWheelAdmin] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);

  const activeWave = Number(store?.currentWheelRound || 1);
  const unspunTeams = useMemo(() => {
    if (!store?.teams) return [];
    const waveSpins = store?.wheelSpinsByRound?.[activeWave] || {};
    return store.teams.filter((t) => !waveSpins[t.id]);
  }, [store?.teams, store?.wheelSpinsByRound, activeWave]);

  const handleResetSpins = async () => {
    if (!window.confirm('Are you sure you want to reset all wheel spins? This will clear the spin history and counter.')) {
      return;
    }
    try {
      setIsSpinningWheelAdmin(true);
      const fresh = await resetWheelSpinsAdmin();
      setStore(fresh);
      notify('Wheel spins history reset.');
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setIsSpinningWheelAdmin(false);
    }
  };

  const handleDeleteSpinById = async (spinId, teamName, propName) => {
    if (!window.confirm(`Delete Spin for ${teamName} (${propName})? Rent will be refunded.`)) {
      return;
    }
    try {
      setIsSpinningWheelAdmin(true);
      const fresh = await deleteWheelSpinByIdAdmin(spinId);
      setStore(fresh);
      notify(`Deleted spin for ${teamName}. Rent refunded.`);
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setIsSpinningWheelAdmin(false);
    }
  };

  const handleDeleteTeamSpin = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete ${teamName}'s spin for Wave #${activeWave}? This will reverse rent settlement and restore ${teamName} to the spin selection.`)) {
      return;
    }
    try {
      setIsSpinningWheelAdmin(true);
      const updated = await deleteWheelSpinAdmin({ round: activeWave, teamId });
      setStore(updated);
      notify(`Deleted spin for ${teamName}. Rent settlement reversed & team restored to queue.`);
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setIsSpinningWheelAdmin(false);
    }
  };

  const handleTriggerAllTeamsSpin = async () => {
    try {
      setIsSpinningWheelAdmin(true);
      const updated = await triggerWheelSpinAdmin({ teamId: 'ALL' });
      setStore(updated);
      notify(`Wheel spun for ALL teams simultaneously! Outlines & rent deducted.`);
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setIsSpinningWheelAdmin(false);
    }
  };

  // Release Next Spin Wave
  const handleReleaseNextWheelSpin = async () => {
    try {
      const updated = await releaseNextWheelSpinAdmin({ store });
      setStore(updated);
      notify(`Wheel Spin #${updated.currentWheelRound} released to all teams.`);
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  const [confirmResetGame, setConfirmResetGame] = useState(false);

  const handleResetGame = async () => {
    try {
      const updated = await resetMonopolyGameAdmin();
      setStore(updated);
      setConfirmResetGame(false);
      setSelectedGivePropIds([]);
      setSelectedGiveResIds([]);
      setGiveTargetTeamId('');
      notify('Game reset (all teams, properties, and transactions cleared).');
    } catch (err) {
      notify(err.message, 'err');
    }
  };

  if (!store) {
    return (
      <div className="editorial-canvas w-full min-h-screen flex items-center justify-center p-6" data-admin-theme={themeMode}>
        <div className="editorial-card p-6 text-center max-w-sm w-full space-y-3.5 shadow-xl">
          {storeError ? (
            <div className="space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#FEF3F2] border border-[#FECDCA] flex items-center justify-center text-[#B42318] font-bold text-sm">
                !
              </div>
              <p className="text-xs font-mono text-[#B42318] font-bold">Failed to load Market Monopoly store</p>
              <p className="text-[11px] font-mono text-[#71717A] leading-relaxed">{storeError}</p>
              <button
                type="button"
                onClick={() => refreshStore(true)}
                className="editorial-btn editorial-btn-dark text-xs py-2 px-3 w-full justify-center"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-8 h-8 mx-auto border-2 border-[#8D5B3A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-[#71717A]">Loading Market Monopoly Admin...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const soldCount = (store.properties || []).filter((p) => p.ownerTeamId).length;
  const currentWheelRound = Number(store.currentWheelRound || 1);

  return (
    <div className="editorial-canvas w-full min-h-screen transition-colors duration-150" data-admin-theme={themeMode}>
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div
            className={`p-3 rounded-lg border shadow-lg text-xs font-mono font-semibold ${
              feedback.type === 'err'
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                : 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]'
            }`}
          >
            {feedback.text}
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* TOP HEADER */}
        <header className="editorial-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="editorial-btn editorial-btn-outline text-xs py-1.5 px-3 shrink-0"
              >
                Back to Hub
              </button>
            )}
            <div className="w-10 h-10 rounded-lg border border-[#E5E5E5] flex items-center justify-center p-1 bg-white shrink-0">
              <img src={aesLogo} alt="Market Monopoly" className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] tracking-wider">
                  Market Monopoly
                </span>
                <span className="editorial-badge text-[10px]">
                  Sold: {soldCount}/25
                </span>
                <span className="editorial-badge text-[10px]">
                  Teams: {store.teams.length}
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0F0F11] leading-tight">
                Market Monopoly Admin
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSwitchRound(1)}
              className={`editorial-btn text-xs py-2 px-3 font-semibold ${
                store.currentRound === 1 ? 'editorial-btn-dark' : 'editorial-btn-outline'
              }`}
            >
              Round 1 (Auction)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRound(2)}
              className={`editorial-btn text-xs py-2 px-3 font-semibold ${
                store.currentRound === 2 ? 'editorial-btn-dark' : 'editorial-btn-outline'
              }`}
            >
              Round 2 (Utilities & Wheel)
            </button>

                        {/* Rankings Visibility Toggle */}
            <button
              type="button"
              onClick={handleToggleShowRankings}
              className={`editorial-btn text-xs py-2 px-3 font-semibold transition-all ${
                store.showRankings
                  ? 'editorial-btn-dark ring-2 ring-[#027A48]'
                  : 'editorial-btn-outline text-[#B42318] border-[#B42318]/40'
              }`}
            >
              {store.showRankings ? 'Rankings: Visible' : 'Rankings: Hidden'}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="editorial-btn editorial-btn-outline text-xs py-2 px-3 font-semibold"
            >
              {themeMode === 'dark' ? 'White Theme' : 'Dark Theme'}
            </button>

            {confirmResetGame ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetGame}
                  className="editorial-btn editorial-btn-red text-xs py-2 px-3 font-bold"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetGame(false)}
                  className="editorial-btn editorial-btn-outline text-xs py-2 px-2.5"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResetGame(true)}
                className="editorial-btn editorial-btn-outline text-[#B42318] text-xs py-2 px-3 font-semibold"
              >
                Reset
              </button>
            )}

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

        {/* MAIN WORKSPACE WITH LEFT SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-3 xl:col-span-2 editorial-card p-3 space-y-1.5 lg:sticky lg:top-5">
            {[
              { id: 'give_properties', label: 'Give Properties', badge: `${soldCount}/25` },
              { id: 'properties', label: 'Property Settings', badge: '25' },
              {
                id: 'resources',
                label: 'Resources (Bid)',
                badge: `${(store.teams || []).reduce((sum, t) => sum + (t.ownedResources?.length || 0), 0)}`
              },
              { id: 'teams', label: 'Users & Teams', badge: (store.teams || []).length },
              { id: 'wheel', label: 'Spin Wheel', badge: `#${currentWheelRound}` },
              { id: 'history', label: 'History', badge: (store.transactions || []).length }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`editorial-btn w-full justify-between px-3 py-2.5 text-xs font-semibold text-left ${
                    active ? 'editorial-btn-dark' : 'editorial-btn-outline border-transparent'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
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
          </aside>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-9 xl:col-span-10 space-y-5">
            {/* ============================================================= */}
            {/* TAB 1: GIVE PROPERTIES & RESOURCES TO TEAM IN ONE CLICK       */}
            {/* ============================================================= */}
            {activeTab === 'give_properties' && (() => {
              const selectedPropsList = store.properties.filter((p) =>
                selectedGivePropIds.includes(Number(p.id))
              );
              const selectedResList = KARACHI_UTILITIES.filter((u) =>
                selectedGiveResIds.includes(Number(u.id))
              );
              const totalSelectedPrice =
                selectedPropsList.reduce((sum, p) => sum + Number(p.openingValue || 0), 0) +
                selectedResList.reduce((sum, u) => sum + Number(u.cost || 0), 0);
              const totalSelectedCount = selectedPropsList.length + selectedResList.length;

              return (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                  {/* Left: Small Multi-Selectable Property Cards (25) + Resource Cards (17) */}
                  <div className="xl:col-span-8 space-y-4">
                    {/* 1. PROPERTIES (25 SMALL CARDS) */}
                    <div className="space-y-2">
                      <div className="editorial-card p-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold uppercase text-[#0F0F11]">
                          1. Select Properties ({selectedGivePropIds.length} selected)
                        </span>
                        {(selectedGivePropIds.length > 0 || selectedGiveResIds.length > 0) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGivePropIds([]);
                              setSelectedGiveResIds([]);
                            }}
                            className="editorial-btn editorial-btn-outline text-[11px] py-1 px-2.5"
                          >
                            Clear All ({totalSelectedCount})
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                        {store.properties.map((prop) => {
                          const owner = store.teams.find(
                            (t) =>
                              String(t.id) === String(prop.ownerTeamId) ||
                              (prop.ownerTeamName &&
                                String(t.name).toLowerCase() === String(prop.ownerTeamName).toLowerCase())
                          );
                          const isChecked = selectedGivePropIds.includes(Number(prop.id));

                          return (
                            <div
                              key={prop.id}
                              onClick={() => toggleGivePropertySelection(prop.id)}
                              className={`editorial-card p-2.5 cursor-pointer select-none transition-all flex flex-col justify-between gap-1.5 ${
                                isChecked
                                  ? 'ring-2 ring-[#8D5B3A] border-[#8D5B3A] bg-[#8D5B3A]/10'
                                  : 'hover:border-[#8D5B3A]/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] font-bold text-[#71717A]">
                                  #{prop.id}
                                </span>
                                {isChecked ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8D5B3A] text-white">
                                    Selected
                                  </span>
                                ) : owner ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] truncate max-w-[75px]">
                                    {owner.name}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[9px] text-[#71717A]">
                                    Rs {prop.openingValue}L
                                  </span>
                                )}
                              </div>

                              <div className="text-xs font-bold text-[#0F0F11] leading-snug line-clamp-2">
                                {prop.name}
                              </div>

                              {owner && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUndoSale(prop.id);
                                  }}
                                  className="text-[10px] font-mono text-[#B42318] hover:underline text-left pt-0.5"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. RESOURCES (17 SMALL CARDS IN THE SAME TAB) */}
                    <div className="space-y-2 pt-2">
                      <div className="editorial-card p-3 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold uppercase text-[#0F0F11]">
                          2. Select Resources ({selectedGiveResIds.length} selected)
                        </span>
                        <span className="font-mono text-[11px] text-[#71717A]">
                          Each resource levels up a property (+1 Lvl)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                        {KARACHI_UTILITIES.map((util) => {
                          const isChecked = selectedGiveResIds.includes(Number(util.id));
                          const ownedCount = store.teams.reduce(
                            (cnt, t) =>
                              cnt +
                              (t.ownedResources || []).filter((r) => Number(r.utilityId) === Number(util.id))
                                .length,
                            0
                          );

                          return (
                            <div
                              key={util.id}
                              onClick={() => toggleGiveResourceSelection(util.id)}
                              className={`editorial-card p-2.5 cursor-pointer select-none transition-all flex flex-col justify-between gap-1.5 ${
                                isChecked
                                  ? 'ring-2 ring-[#8D5B3A] border-[#8D5B3A] bg-[#8D5B3A]/10'
                                  : 'hover:border-[#8D5B3A]/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] font-bold text-[#8D5B3A]">
                                  R#{util.id}
                                </span>
                                {isChecked ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8D5B3A] text-white">
                                    Selected
                                  </span>
                                ) : (
                                  <span className="font-mono text-[9px] text-[#71717A]">
                                    Rs {util.cost}L
                                  </span>
                                )}
                              </div>

                              <div className="text-xs font-bold text-[#0F0F11] leading-snug line-clamp-2">
                                {util.name}
                              </div>

                              <div className="flex items-center justify-between text-[9px] font-mono text-[#71717A]">
                                <span>{util.category}</span>
                                {ownedCount > 0 && (
                                  <span className="text-[#16A34A] font-bold">×{ownedCount}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Panel: Select Team & Give Selected Properties + Resources */}
                  <div className="xl:col-span-4 editorial-card p-4 xl:sticky xl:top-5 space-y-4">
                    <div className="pb-2.5 border-b border-[#E5E5E5]">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] block">
                        One-Click Assignment
                      </span>
                      <h3 className="text-base font-bold text-[#0F0F11]">
                        Give Selected to Team
                      </h3>
                    </div>

                    {/* Selected Properties & Resources List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#71717A]">
                          Selected ({selectedPropsList.length} Prop · {selectedResList.length} Res)
                        </span>
                        <strong className="text-[#0F0F11]">
                          Total: Rs {totalSelectedPrice}L
                        </strong>
                      </div>

                      {totalSelectedCount === 0 ? (
                        <div className="p-3 rounded-lg border border-dashed border-[#E5E5E5] text-xs font-mono text-[#71717A] text-center">
                          Click any properties and/or resources on the left, then select a team below.
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                          {selectedPropsList.map((p) => (
                            <div
                              key={`prop_${p.id}`}
                              className="p-2 rounded border border-[#E5E5E5] flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-semibold text-[#0F0F11] truncate">
                                [Prop #{p.id}] {p.name}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-[11px] font-bold">
                                  Rs {p.openingValue}L
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleGivePropertySelection(p.id)}
                                  className="text-[10px] font-mono text-[#B42318] hover:underline"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}

                          {selectedResList.map((u) => (
                            <div
                              key={`res_${u.id}`}
                              className="p-2 rounded border border-[#E5E5E5] flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-semibold text-[#8D5B3A] truncate">
                                [Res #{u.id}] {u.name}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-[11px] font-bold">
                                  Rs {u.cost}L
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleGiveResourceSelection(u.id)}
                                  className="text-[10px] font-mono text-[#B42318] hover:underline"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Select Team Dropdown & Give Button */}
                    <form onSubmit={handleGiveSelectedPropertiesToTeam} className="space-y-3 pt-2 border-t border-[#E5E5E5]">
                      <div>
                        <label className="block font-mono text-[10px] uppercase font-bold text-[#71717A] mb-1">
                          Select Team
                        </label>
                        <select
                          value={giveTargetTeamId}
                          onChange={(e) => setGiveTargetTeamId(e.target.value)}
                          className="editorial-input text-xs py-2 px-2.5 w-full"
                          required
                        >
                          <option value="">Choose team...</option>
                          {store.teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} (Cash: Rs {t.cash}L)
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={totalSelectedCount === 0}
                        className="editorial-btn editorial-btn-dark w-full justify-center py-2.5 text-xs font-bold disabled:opacity-50"
                      >
                        Give Selected to Team
                        {totalSelectedPrice > 0 ? ` (-Rs ${totalSelectedPrice}L)` : ''}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* TAB 2: PROPERTY SETTINGS (PRICE, LEVEL-UP & RENT, MAX LVL 3)  */}
            {/* ============================================================= */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {/* Filter Bar */}
                <div className="editorial-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    placeholder="Search 25 properties..."
                    className="editorial-input text-xs py-1.5 px-3 w-full sm:max-w-xs"
                  />

                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'ALL', label: `All (25)` },
                      { id: 'AVAILABLE', label: `Available (${25 - soldCount})` },
                      { id: 'SOLD', label: `Assigned (${soldCount})` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPropertyFilter(f.id)}
                        className={`editorial-btn text-xs py-1.5 px-3 ${
                          propertyFilter === f.id ? 'editorial-btn-dark' : 'editorial-btn-outline'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Split: Small Property Cards Grid (Left) + Property Settings Side Panel (Right) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                  {/* Small Compact Clickable Property Cards */}
                  <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {filteredProperties.map((prop) => {
                      const owner = store.teams.find(
                        (t) =>
                          String(t.id) === String(prop.ownerTeamId) ||
                          (prop.ownerTeamName &&
                            String(t.name).toLowerCase() === String(prop.ownerTeamName).toLowerCase())
                      );
                      const isSelected = Number(selectedProperty?.id) === Number(prop.id);
                      const currentRent = computePropertyRent(prop);

                      return (
                        <button
                          key={prop.id}
                          type="button"
                          onClick={() => handleSelectPropertyCard(prop)}
                          className={`editorial-card overflow-hidden text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'ring-2 ring-[#8D5B3A] border-[#8D5B3A]'
                              : 'hover:border-[#8D5B3A]/60'
                          }`}
                        >
                          {/* Compact Architectural SVG Header */}
                          <div className="relative w-full h-14 overflow-hidden border-b border-[#E5E5E5]">
                            <AdminPropertySvgBanner category={prop.category} />
                            <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between gap-1">
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-white">
                                #{prop.id}
                              </span>
                              {owner ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] truncate max-w-[90px]">
                                  {owner.name}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/65 text-white/90">
                                  Open
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Compact Body */}
                          <div className="p-2.5 space-y-1.5 w-full">
                            <div className="text-xs font-bold text-[#0F0F11] truncate" title={prop.name}>
                              {prop.name}
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                              <span>Rs {prop.openingValue}L</span>
                              <span className="text-[#16A34A] font-bold">Rent {currentRent}L</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-[#71717A] pt-0.5 border-t border-[#E5E5E5]">
                              <span>{prop.category.split('/')[0].trim()}</span>
                              <span>Lvl {prop.upgradeLevel || 0}/3</span>
                            </div>
                            {/* Resource Level-Up Progress Line */}
                            <div className="w-full h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
                              <div
                                className="h-full bg-[#8D5B3A] transition-all duration-300"
                                style={{ width: `${(Math.min(3, prop.upgradeLevel || 0) / 3) * 100}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Side Panel: Property Settings Only (Price, Level-Up & Rent, Max Level 3) */}
                  {selectedProperty && (() => {
                    const previewPrice = Number(assignAmount || selectedProperty.openingValue || 0);
                    const previewValInc = Number(editValueInc || 0);
                    const previewBaseRent = Number(editBaseRent || 0);
                    const previewRentInc = Number(editRentInc || 0);
                    const attachedCount = (selectedProperty.attachedUtilities || []).length;

                    return (
                      <div className="xl:col-span-4 editorial-card overflow-hidden xl:sticky xl:top-5 space-y-0">
                        {/* Selected Property Header */}
                        <div className="relative w-full h-24 overflow-hidden border-b border-[#E5E5E5]">
                          <AdminPropertySvgBanner category={selectedProperty.category} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 text-white">
                                Property #{selectedProperty.id} · {selectedProperty.category}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#8D5B3A] text-white">
                                Max Level 3
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white leading-tight">
                              {selectedProperty.name}
                            </h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <form onSubmit={handleSavePropertySettings} className="space-y-3.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] block">
                              Property Settings (Price, Level-Up & Rent)
                            </span>

                            {/* Level-Up Progress Line Driven by Attached Bid Resources */}
                            <div className="p-2.5 rounded-lg border border-[#E5E5E5] space-y-1.5">
                              <div className="flex items-center justify-between font-mono text-[10px]">
                                <span className="text-[#71717A]">
                                  Resource Progress ({attachedCount}/3 Resources)
                                </span>
                                <strong className="text-[#8D5B3A]">
                                  Level {editLevel} / 3 Max
                                </strong>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {[1, 2, 3].map((step) => (
                                  <div
                                    key={step}
                                    className={`h-2 rounded-sm transition-colors ${
                                      Number(editLevel) >= step ? 'bg-[#8D5B3A]' : 'bg-[#E5E5E5]'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="block font-mono text-[10px] text-[#71717A] mb-1">
                                  Property Price (Lakhs)
                                </label>
                                <input
                                  type="number"
                                  step="1"
                                  min="1"
                                  value={assignAmount}
                                  onChange={(e) => setAssignAmount(e.target.value)}
                                  className="editorial-input font-mono text-xs py-1.5 px-2.5 w-full font-bold"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-mono text-[10px] text-[#71717A] mb-1">
                                  Value + / Level (L)
                                </label>
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={editValueInc}
                                  onChange={(e) => setEditValueInc(e.target.value)}
                                  className="editorial-input font-mono text-xs py-1.5 px-2.5 w-full"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-mono text-[10px] text-[#71717A] mb-1">
                                  Base Rent (Lvl 0) (L)
                                </label>
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={editBaseRent}
                                  onChange={(e) => setEditBaseRent(e.target.value)}
                                  className="editorial-input font-mono text-xs py-1.5 px-2.5 w-full"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block font-mono text-[10px] text-[#71717A] mb-1">
                                  Rent + / Level (L)
                                </label>
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={editRentInc}
                                  onChange={(e) => setEditRentInc(e.target.value)}
                                  className="editorial-input font-mono text-xs py-1.5 px-2.5 w-full"
                                  required
                                />
                              </div>
                            </div>

                            {/* Level 0 -> Level 3 Progression Preview */}
                            <div className="rounded-lg border border-[#E5E5E5] p-2.5 space-y-1 font-mono text-[11px]">
                              <div className="grid grid-cols-3 text-[10px] text-[#71717A] pb-1 border-b border-[#E5E5E5]">
                                <span>Resources</span>
                                <span className="text-center">Property Value</span>
                                <span className="text-right">Rent</span>
                              </div>
                              {[0, 1, 2, 3].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`grid grid-cols-3 py-0.5 ${
                                    Number(editLevel) === lvl ? 'font-bold text-[#8D5B3A]' : ''
                                  }`}
                                >
                                  <span>{lvl === 0 ? 'Base (0/3)' : `Lvl ${lvl} (${lvl}/3)`}</span>
                                  <span className="text-center">
                                    Rs {Math.round(previewPrice + lvl * previewValInc)}L
                                  </span>
                                  <span className="text-right text-[#16A34A]">
                                    Rs {Math.round(previewBaseRent + lvl * previewRentInc)}L
                                  </span>
                                </div>
                              ))}
                            </div>

                            <button
                              type="submit"
                              className="editorial-btn editorial-btn-dark w-full justify-center py-2 text-xs font-semibold"
                            >
                              Save Property Settings
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: BID RESOURCES (17) — CLICK RESOURCE & ASSIGN TO TEAM   */}
            {/* ============================================================= */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                {/* Resource Search Bar */}
                <div className="editorial-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="Search 17 bid resources..."
                    className="editorial-input text-xs py-1.5 px-3 w-full sm:max-w-xs"
                  />
                  <span className="font-mono text-xs text-[#71717A]">
                    Click a resource card, set bid amount, and assign to the winning team
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                  {/* Left: Compact Clickable 17 Resource Cards */}
                  <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {filteredResources.map((util) => {
                      const isSelected = Number(selectedResource?.id) === Number(util.id);
                      const assignedCount = store.teams.reduce(
                        (cnt, t) =>
                          cnt +
                          (t.ownedResources || []).filter((r) => Number(r.utilityId) === Number(util.id))
                            .length,
                        0
                      );

                      return (
                        <button
                          key={util.id}
                          type="button"
                          onClick={() => handleSelectResourceCard(util)}
                          className={`editorial-card p-3 text-left transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'ring-2 ring-[#8D5B3A] border-[#8D5B3A]'
                              : 'hover:border-[#8D5B3A]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#8D5B3A] text-white">
                              #{util.id}
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#E5E5E5] text-[#71717A]">
                              Sold: {assignedCount}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-[#0F0F11] truncate" title={util.name}>
                              {util.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#71717A]">
                              {util.category}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-[#E5E5E5]">
                            <span>Base: Rs {util.cost}L</span>
                            <span className="text-[#16A34A] font-bold">+1 Lvl</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Side Panel: Assign Bid Resource to Team & Auto-Deduct Money */}
                  {selectedResource && (() => {
                    const previewResPrice = Number(resourceBidAmount || selectedResource.cost || 0);
                    const holderRecords = [];
                    store.teams.forEach((t) => {
                      (t.ownedResources || []).forEach((r) => {
                        if (Number(r.utilityId) === Number(selectedResource.id)) {
                          holderRecords.push({
                            teamId: t.id,
                            teamName: t.name,
                            ...r
                          });
                        }
                      });
                    });

                    return (
                      <div className="xl:col-span-4 editorial-card p-4 xl:sticky xl:top-5 space-y-4">
                        <div className="pb-3 border-b border-[#E5E5E5] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold uppercase text-[#8D5B3A]">
                              Resource #{selectedResource.id} · {selectedResource.category}
                            </span>
                            <span className="editorial-badge text-[10px] font-mono">
                              +1 Property Level
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#0F0F11]">
                            {selectedResource.name}
                          </h3>
                          <p className="text-xs text-[#71717A]">
                            {selectedResource.description}
                          </p>
                        </div>

                        {/* Assign Resource to Winning Team (Auto-Deduct Bid Money) */}
                        <form onSubmit={handleAssignSelectedResource} className="space-y-3">
                          <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] block">
                            Give Resource to Team (From Bid)
                          </span>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-mono text-[10px] text-[#71717A] mb-1">
                                Bid Amount (Lakhs)
                              </label>
                              <input
                                type="number"
                                step="1"
                                min="1"
                                value={resourceBidAmount}
                                onChange={(e) => setResourceBidAmount(e.target.value)}
                                className="editorial-input font-mono text-xs py-1.5 px-2.5 w-full font-bold"
                                required
                              />
                            </div>

                            <div>
                              <label className="block font-mono text-[10px] text-[#71717A] mb-1">
                                Select Team
                              </label>
                              <select
                                value={resourceTeamId}
                                onChange={(e) => setResourceTeamId(e.target.value)}
                                className="editorial-input text-xs py-1.5 px-2 w-full"
                                required
                              >
                                <option value="">Choose team...</option>
                                {store.teams.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} (Rs {t.cash}L)
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="editorial-btn editorial-btn-dark w-full justify-center py-2 text-xs font-semibold"
                          >
                            Give Resource to Team & Deduct Rs {previewResPrice}L
                          </button>
                        </form>

                        {/* Teams Holding This Resource */}
                        <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
                          <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] block">
                            Assigned Copies ({holderRecords.length})
                          </span>
                          {holderRecords.length === 0 ? (
                            <p className="text-xs font-mono text-[#71717A]">
                              No team owns this resource yet.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-56 overflow-y-auto">
                              {holderRecords.map((rec) => (
                                <div
                                  key={rec.instanceId}
                                  className="p-2 rounded border border-[#E5E5E5] flex items-center justify-between gap-2 text-xs"
                                >
                                  <div>
                                    <strong className="text-[#0F0F11] block">{rec.teamName}</strong>
                                    <span className="font-mono text-[10px] text-[#71717A]">
                                      Paid Rs {rec.bidPrice}L ·{' '}
                                      {rec.attachedToPropertyName
                                        ? `On ${rec.attachedToPropertyName}`
                                        : 'In Inventory'}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeResource(rec.teamId, rec.instanceId)}
                                    className="editorial-btn editorial-btn-outline text-[#B42318] text-[10px] py-1 px-2"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: CREATE & DELETE USERS / TEAMS                          */}
            {/* ============================================================= */}
            {activeTab === 'teams' && (
              <div className="space-y-5">
                {/* Create User / Team Form */}
                <div className="editorial-card p-5 space-y-3">
                  <h2 className="text-sm font-bold uppercase font-mono text-[#71717A]">
                    Create User / Team
                  </h2>
                  <form onSubmit={handleAddTeam} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Team Name"
                      className="editorial-input text-xs py-2 px-3"
                      required
                    />
                    <input
                      type="text"
                      value={newTeamUsername}
                      onChange={(e) => setNewTeamUsername(e.target.value)}
                      placeholder="Username (e.g. alpha_1)"
                      className="editorial-input font-mono text-xs py-2 px-3"
                    />
                    <input
                      type="text"
                      value={newTeamPasscode}
                      onChange={(e) => setNewTeamPasscode(e.target.value)}
                      placeholder="Passcode (e.g. 1234)"
                      className="editorial-input font-mono text-xs py-2 px-3"
                      required
                    />
                    <input
                      type="number"
                      step="1"
                      value={newTeamCash}
                      onChange={(e) => setNewTeamCash(e.target.value)}
                      placeholder="Starting Cash (Lakhs)"
                      className="editorial-input font-mono text-xs py-2 px-3"
                      required
                    />
                    <button
                      type="submit"
                      className="editorial-btn editorial-btn-dark justify-center text-xs font-semibold py-2"
                    >
                      Create Team
                    </button>
                  </form>
                </div>

                {/* Users / Teams Cards */}
                {teamSummaries.length === 0 ? (
                  <div className="editorial-card p-8 text-center space-y-1">
                    <p className="text-sm font-bold text-[#0F0F11]">
                      No teams created yet
                    </p>
                    <p className="text-xs font-mono text-[#71717A]">
                      Use the form above to create participating teams with a username, passcode, and starting cash.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamSummaries.map((team, idx) => (
                      <div key={team.id} className="editorial-card p-5 space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#71717A]">
                                #{idx + 1}
                              </span>
                              <h3 className="text-base font-bold text-[#0F0F11]">
                                {team.name}
                              </h3>
                            </div>
                            <span className="font-mono text-xs text-[#71717A]">
                              Username: <strong>{team.username || team.name}</strong> · Passcode: <strong>{team.passcode}</strong>
                            </span>
                          </div>

                          {confirmDeleteTeamId === team.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(team)}
                                className="editorial-btn editorial-btn-red text-xs py-1 px-2.5 font-bold"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTeamId(null)}
                                className="editorial-btn editorial-btn-outline text-xs py-1 px-2"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTeamId(team.id)}
                              className="editorial-btn editorial-btn-outline text-[#B42318] text-xs py-1 px-2.5"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg border border-[#E5E5E5] text-center font-mono text-xs">
                          <div>
                            <span className="text-[10px] text-[#71717A] block">Cash</span>
                            <strong>Rs {team.cash}L</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#71717A] block">Deducted</span>
                            <strong className="text-[#B42318]">-Rs {team.totalDeducted || 0}L</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#71717A] block">Land ({team.propertyCount})</span>
                            <strong className="text-[#16A34A]">Rs {team.propertyValuation}L</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#71717A] block">Net Worth</span>
                            <strong>Rs {team.netWorth}L</strong>
                          </div>
                        </div>

                        {/* Owned Properties Pills */}
                        {team.ownedProperties.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {team.ownedProperties.map((p) => (
                              <span key={p.id} className="editorial-badge text-[10px] font-mono">
                                {p.name} (Lvl {p.upgradeLevel})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Owned Resources Pills */}
                        {(team.ownedResources || []).length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(team.ownedResources || []).map((r) => (
                              <span
                                key={r.instanceId}
                                className="px-2 py-0.5 rounded border border-[#E5E5E5] text-[10px] font-mono text-[#71717A]"
                              >
                                {r.name} (Rs {r.bidPrice}L)
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quick Cash Balance Control */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="number"
                            step="1"
                            value={cashDeltaMap[team.id] || ''}
                            onChange={(e) =>
                              setCashDeltaMap((prev) => ({ ...prev, [team.id]: e.target.value }))
                            }
                            placeholder="Amount (L)"
                            className="editorial-input font-mono text-xs py-1.5 px-2.5 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickCashAdjust(team.id, 1)}
                            className="editorial-btn editorial-btn-green text-xs py-1.5 px-3"
                          >
                            + Add Cash
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickCashAdjust(team.id, -1)}
                            className="editorial-btn editorial-btn-red text-xs py-1.5 px-3"
                          >
                            - Deduct
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 3: SPIN WHEEL RELEASE & RESULTS                           */}
            {/* ============================================================= */}
            {activeTab === 'wheel' && (
              <div className="space-y-6">
                {/* Header & Main Spin Button */}
                <div className="editorial-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] font-bold">
                        Live Dual Wheel Arena
                      </span>
                      <span className="editorial-badge text-[10px] bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] font-bold">
                        {Array.isArray(store.wheelSpinsHistory) ? store.wheelSpinsHistory.length : 0} Spins Completed
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[#0F0F11]">
                      Classroom Wheel Spin Controls
                    </h2>
                    <p className="text-xs font-mono text-[#71717A] mt-1">
                      Dual Wheel spins both the Karachi Property and the Paying Team at random. Results animate live on the Classroom Projector.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsWheelModalOpen(true)}
                      className="editorial-btn editorial-btn-green py-3.5 px-8 text-sm font-black flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4 text-[#052E16]" />
                      <span>Spin the Wheel</span>
                    </button>

                    {Array.isArray(store.wheelSpinsHistory) && store.wheelSpinsHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetSpins}
                        className="editorial-btn editorial-btn-outline py-2.5 px-4 text-xs font-bold text-[#DC2626] border border-[#FDA29B] bg-[#FEF3F2] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                      >
                        Reset Spins
                      </button>
                    )}
                  </div>
                </div>

                {/* SPIN HISTORY LOG */}
                <div className="editorial-card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#0F0F11]">
                        Wheel Spin Activity Log ({Array.isArray(store.wheelSpinsHistory) ? store.wheelSpinsHistory.length : 0} Spins)
                      </h3>
                      <p className="text-xs font-mono text-[#71717A] mt-0.5">
                        Chronological log of all spins. Deleting a spin automatically refunds rent to the tenant.
                      </p>
                    </div>
                  </div>

                  {Array.isArray(store.wheelSpinsHistory) && store.wheelSpinsHistory.length > 0 ? (
                    <div className="divide-y divide-[#E4E4E7] max-h-[480px] overflow-y-auto pr-1">
                      {[...store.wheelSpinsHistory].reverse().map((spin, idx) => {
                        const spinNumber = spin.spinNumber || (store.wheelSpinsHistory.length - idx);
                        return (
                          <div key={spin.id || idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-[#1C050B] text-[#F1CA7E] font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-[#ECC37A]/40">
                                #{spinNumber}
                              </span>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm font-bold text-[#0F0F11] font-serif">
                                    {spin.teamName}
                                  </strong>
                                  <span className="text-[10px] font-mono text-[#71717A]">
                                    landed on
                                  </span>
                                  <span className="font-mono font-bold text-[#8D5B3A]">
                                    #{spin.propertyId} {spin.propertyName}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-[#71717A] flex items-center gap-2 flex-wrap">
                                  <span>Owner: <strong className="text-[#0F0F11]">{spin.ownerTeamName || 'Unclaimed'}</strong></span>
                                  <span>·</span>
                                  <span>{new Date(spin.timestamp || Date.now()).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center">
                              <span className={`editorial-badge text-xs font-mono font-bold ${
                                spin.status === 'PAID_RENT'
                                  ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                                  : spin.status === 'OWN_PROPERTY'
                                  ? 'bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5]'
                                  : 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]'
                              }`}>
                                {spin.status === 'PAID_RENT'
                                  ? `- Rs ${spin.rentAmount}L Rent Paid`
                                  : spin.status === 'OWN_PROPERTY'
                                  ? '0L (Own Property)'
                                  : '0L (Unclaimed)'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDeleteSpinById(spin.id, spin.teamName, spin.propertyName)}
                                className="editorial-btn text-[11px] py-1.5 px-3 font-bold text-[#DC2626] border border-[#FDA29B] bg-[#FEF3F2] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                                title="Delete this spin and refund rent"
                              >
                                Undo Spin
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center mx-auto text-[#71717A]">
                        <RotateCw className="w-5 h-5 text-[#71717A]" />
                      </div>
                      <div className="space-y-1">
                        <strong className="text-sm font-bold text-[#0F0F11] block">
                          No Wheel Spins Executed Yet
                        </strong>
                        <p className="text-xs text-[#71717A]">
                          Click &quot;Spin the Wheel&quot; above to launch the Dual Wheel. Results will stream here and on the classroom projector.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* TEAM IMPACT SUMMARY */}
                <div className="editorial-card p-6 space-y-4">
                  <h3 className="text-base font-bold text-[#0F0F11]">
                    Team Rent Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(store.teams || []).map((t) => {
                      const history = Array.isArray(store.wheelSpinsHistory) ? store.wheelSpinsHistory : [];
                      const spinsAsTenant = history.filter((s) => String(s.teamId) === String(t.id));
                      const spinsAsLandlord = history.filter(
                        (s) => String(s.ownerTeamId) === String(t.id) && s.status === 'PAID_RENT'
                      );
                      const totalRentPaid = spinsAsTenant.reduce((acc, s) => acc + Number(s.rentAmount || 0), 0);
                      const totalRentEarned = spinsAsLandlord.reduce((acc, s) => acc + Number(s.rentAmount || 0), 0);

                      return (
                        <div key={t.id} className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <strong className="text-sm font-bold text-[#0F0F11] font-sans truncate">{t.name}</strong>
                            <span className="text-[10px] text-[#71717A]">Cash: Rs {t.cash}L</span>
                          </div>
                          <div className="space-y-1 text-[11px] pt-1 border-t border-[#E4E4E7]">
                            <div className="flex justify-between">
                              <span className="text-[#71717A]">Times Spun:</span>
                              <strong className="text-[#0F0F11]">{spinsAsTenant.length}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#71717A]">Rent Paid:</span>
                              <strong className="text-[#DC2626]">Rs {totalRentPaid.toFixed(1)}L</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#71717A]">Rent Earned:</span>
                              <strong className="text-[#16A34A]">Rs {totalRentEarned.toFixed(1)}L</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 4: TRANSACTION HISTORY (PROPERTIES, RESOURCES & PORTFOLIOS) */}
            {/* ============================================================= */}
            {activeTab === 'history' && (() => {
              const allTxs = Array.isArray(store.transactions) ? store.transactions : [];
              const propTxs = allTxs.filter(
                (tx) =>
                  tx.type === 'AUCTION_WIN' ||
                  tx.type === 'SALE_REVOKED' ||
                  tx.category === 'PROPERTY'
              );
              const resTxs = allTxs.filter(
                (tx) =>
                  tx.type === 'RESOURCE_BID_WIN' ||
                  tx.type === 'RESOURCE_REVOKED' ||
                  tx.type === 'RESOURCE_LEVEL_UP' ||
                  tx.category === 'RESOURCE'
              );
              const totalCashInPlay = teamSummaries.reduce((s, t) => s + Number(t.cash || 0), 0);
              const totalDeductedAll = teamSummaries.reduce(
                (s, t) => s + Number(t.totalDeducted || 0),
                0
              );
              const totalPortfolioAll = teamSummaries.reduce(
                (s, t) => s + Number(t.netWorth || 0),
                0
              );

              return (
                <div className="space-y-5">
                  {/* Top Summary Metrics */}
                  <div className="editorial-card p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5]">
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold text-[#71717A] block">
                          Tournament Ledger
                        </span>
                        <h2 className="text-lg font-bold text-[#0F0F11]">
                          Money, Deducted Money, Properties & Resources History
                        </h2>
                      </div>
                      <span className="editorial-badge font-mono text-xs">
                        Total Events: {allTxs.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                      <div className="p-3.5 rounded-lg border border-[#E5E5E5]">
                        <span className="text-[10px] uppercase text-[#71717A] block">
                          Total Team Cash
                        </span>
                        <strong className="text-base font-bold text-[#0F0F11]">
                          Rs {totalCashInPlay}L
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-lg border border-[#E5E5E5]">
                        <span className="text-[10px] uppercase text-[#B42318] block">
                          Total Deducted Money
                        </span>
                        <strong className="text-base font-bold text-[#B42318]">
                          -Rs {totalDeductedAll}L
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-lg border border-[#E5E5E5]">
                        <span className="text-[10px] uppercase text-[#71717A] block">
                          Properties / Resources Given
                        </span>
                        <strong className="text-base font-bold text-[#0F0F11]">
                          {soldCount} Props ·{' '}
                          {store.teams.reduce((s, t) => s + (t.ownedResources?.length || 0), 0)} Res
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-lg border border-[#E5E5E5]">
                        <span className="text-[10px] uppercase text-[#16A34A] block">
                          Combined Portfolio Value
                        </span>
                        <strong className="text-base font-bold text-[#16A34A]">
                          Rs {totalPortfolioAll}L
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Two Headline Columns: Properties Headline vs Resources Headline */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Properties Headline */}
                    <div className="editorial-card p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold text-[#16A34A] block">
                            Properties Headline
                          </span>
                          <h3 className="text-sm font-bold text-[#0F0F11]">
                            Properties Assigned to Teams ({propTxs.length})
                          </h3>
                        </div>
                      </div>
                      {propTxs.length === 0 ? (
                        <p className="text-xs font-mono text-[#71717A] py-4">
                          No property assignments recorded yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#E5E5E5] max-h-80 overflow-y-auto pr-1">
                          {propTxs.map((tx) => (
                            <div key={tx.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <span className="font-bold text-[#0F0F11] block">{tx.note}</span>
                                <span className="text-[10px] font-mono text-[#71717A] block">
                                  {tx.teamName ? `Team: ${tx.teamName} · ` : ''}
                                  {new Date(tx.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              {Number(tx.amount) > 0 && (
                                <span
                                  className={`font-mono font-bold shrink-0 ${
                                    tx.type === 'SALE_REVOKED' ? 'text-[#16A34A]' : 'text-[#B42318]'
                                  }`}
                                >
                                  {tx.type === 'SALE_REVOKED'
                                    ? `+Rs ${tx.amount}L`
                                    : `-Rs ${tx.amount}L`}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Resources Headline */}
                    <div className="editorial-card p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold text-[#8D5B3A] block">
                            Resources Headline
                          </span>
                          <h3 className="text-sm font-bold text-[#0F0F11]">
                            Resources Assigned & Level-Ups ({resTxs.length})
                          </h3>
                        </div>
                      </div>
                      {resTxs.length === 0 ? (
                        <p className="text-xs font-mono text-[#71717A] py-4">
                          No resource assignments recorded yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#E5E5E5] max-h-80 overflow-y-auto pr-1">
                          {resTxs.map((tx) => (
                            <div key={tx.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <span className="font-bold text-[#0F0F11] block">{tx.note}</span>
                                <span className="text-[10px] font-mono text-[#71717A] block">
                                  {tx.teamName ? `Team: ${tx.teamName} · ` : ''}
                                  {new Date(tx.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              {Number(tx.amount) > 0 && (
                                <span
                                  className={`font-mono font-bold shrink-0 ${
                                    tx.type === 'RESOURCE_REVOKED'
                                      ? 'text-[#16A34A]'
                                      : 'text-[#B42318]'
                                  }`}
                                >
                                  {tx.type === 'RESOURCE_REVOKED'
                                    ? `+Rs ${tx.amount}L`
                                    : `-Rs ${tx.amount}L`}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complete Chronological Activity Feed */}
                  <div className="editorial-card p-5 space-y-3">
                    <h2 className="text-xs font-mono uppercase font-bold text-[#71717A]">
                      All Recent Activity ({allTxs.length})
                    </h2>
                    {allTxs.length === 0 ? (
                      <p className="text-xs font-mono text-[#71717A]">No activity yet.</p>
                    ) : (
                      <div className="divide-y divide-[#E5E5E5] max-h-[540px] overflow-y-auto pr-1">
                        {allTxs.map((tx) => (
                          <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="editorial-badge text-[9px] font-mono">
                                  {tx.type}
                                </span>
                                {tx.teamName && (
                                  <span className="font-mono text-[10px] font-bold text-[#8D5B3A]">
                                    {tx.teamName}
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-[#71717A]">
                                  {new Date(tx.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <span className="font-semibold text-[#0F0F11] block">{tx.note}</span>
                            </div>
                            {Number(tx.amount) > 0 && (
                              <span className="font-mono font-bold text-[#0F0F11] shrink-0">
                                Rs {tx.amount}L
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {isWheelModalOpen && (
        <AdminSpinWheelModal
          isOpen={isWheelModalOpen}
          onClose={() => setIsWheelModalOpen(false)}
          store={store}
          onStoreUpdated={(fresh) => setStore(fresh)}
        />
      )}
    </div>
  );
}
