import { supabase } from '../../supabaseClient.js';
import {
  KARACHI_PROPERTIES,
  KARACHI_UTILITIES,
  DEFAULT_MONOPOLY_TEAMS,
  STARTING_BUDGET_LAKH,
  computePropertyRent,
  computePropertyValuation
} from '../data/monopolyData.js';

export function getInitialStore() {
  return {
    currentRound: 1,
    activeAuctionPropertyId: 1,
    currentWheelRound: 1,
    wheelSpinsByRound: {},
    lastWheelResult: null,
    teams: [],
    properties: KARACHI_PROPERTIES.map((p) => ({
      ...p,
      ownerTeamId: null,
      ownerTeamName: null,
      purchasePrice: 0,
      upgradeLevel: 0,
      attachedUtilities: []
    })),
    transactions: [],
    updatedAt: Date.now()
  };
}

export function hydrateMonopolyState(rawState) {
  const fallback = getInitialStore();
  if (!rawState || typeof rawState !== 'object') return fallback;

  const teams = (Array.isArray(rawState.teams) ? rawState.teams : []).map((t) => ({
    ...t,
    username: (t.username || t.name || '').toLowerCase().replace(/\s+/g, '_'),
    cash: Number(t.cash ?? t.startingBudget ?? STARTING_BUDGET_LAKH),
    startingBudget: Number(t.startingBudget ?? t.starting_budget ?? STARTING_BUDGET_LAKH),
    ownedResources: Array.isArray(t.ownedResources)
      ? t.ownedResources
      : Array.isArray(t.owned_resources)
      ? t.owned_resources
      : []
  }));

  const mergedProps = KARACHI_PROPERTIES.map((baseProp) => {
    const savedProp = (rawState.properties || []).find(
      (p) => Number(p.id) === Number(baseProp.id)
    );
    const ownerTeam = savedProp?.ownerTeamId
      ? teams.find(
          (t) =>
            String(t.id) === String(savedProp.ownerTeamId) ||
            (savedProp.ownerTeamName &&
              t.name.toLowerCase() === String(savedProp.ownerTeamName).toLowerCase())
        )
      : null;

    const openingValue =
      savedProp?.openingValue !== undefined && Number(savedProp.openingValue) > 0
        ? Number(savedProp.openingValue)
        : Number(baseProp.openingValue);
    const level3Target =
      savedProp?.level3Target !== undefined && Number(savedProp.level3Target) > 0
        ? Number(savedProp.level3Target)
        : Number(baseProp.level3Target);
    const valueIncreasePerLevel =
      savedProp?.valueIncreasePerLevel !== undefined && Number(savedProp.valueIncreasePerLevel) >= 0
        ? Number(savedProp.valueIncreasePerLevel)
        : Math.round((level3Target - openingValue) / 3);
    const rentValues =
      Array.isArray(savedProp?.rentValues) && savedProp.rentValues.length === 4
        ? savedProp.rentValues.map(Number)
        : baseProp.rentValues.map(Number);
    const rentIncreasePerLevel =
      savedProp?.rentIncreasePerLevel !== undefined && Number(savedProp.rentIncreasePerLevel) >= 0
        ? Number(savedProp.rentIncreasePerLevel)
        : Math.round((rentValues[3] - rentValues[0]) / 3);
    const upgradeCosts =
      Array.isArray(savedProp?.upgradeCosts) && savedProp.upgradeCosts.length === 3
        ? savedProp.upgradeCosts.map(Number)
        : baseProp.upgradeCosts.map(Number);

    return {
      ...baseProp,
      openingValue,
      level3Target,
      valueIncreasePerLevel,
      rentValues,
      rentIncreasePerLevel,
      upgradeCosts,
      maxLevel: 3,
      ownerTeamId: ownerTeam ? ownerTeam.id : savedProp?.ownerTeamId || null,
      ownerTeamName: ownerTeam ? ownerTeam.name : savedProp?.ownerTeamName || null,
      purchasePrice: Number(savedProp?.purchasePrice || 0),
      upgradeLevel: Math.min(3, Math.max(0, Number(savedProp?.upgradeLevel || 0))),
      attachedUtilities: Array.isArray(savedProp?.attachedUtilities)
        ? savedProp.attachedUtilities.map(Number)
        : []
    };
  });

  return {
    currentRound: Number(rawState.currentRound || 1),
    activeAuctionPropertyId: Number(rawState.activeAuctionPropertyId || 1),
    currentWheelRound: Number(rawState.currentWheelRound || 1),
    wheelSpinsByRound:
      rawState.wheelSpinsByRound && typeof rawState.wheelSpinsByRound === 'object'
        ? rawState.wheelSpinsByRound
        : {},
    lastWheelResult: rawState.lastWheelResult || null,
    teams,
    properties: mergedProps,
    transactions: (Array.isArray(rawState.transactions) ? rawState.transactions : []).filter(
      (tx) => tx.type !== 'TEAM_CREATED' && tx.type !== 'TEAM_DELETED'
    ),
    updatedAt: rawState.updatedAt || Date.now()
  };
}

// Local in-memory caching to optimize Admin response times and avoid duplicate round-trips
let _adminCachedStore = null;
let _adminCachedAt = 0;
const ADMIN_CACHE_TTL_MS = 1000;

export function invalidateAdminMonopolyCache() {
  _adminCachedStore = null;
  _adminCachedAt = 0;
}

export async function fetchMonopolyStore(forceFresh = false) {
  if (!forceFresh && _adminCachedStore && Date.now() - _adminCachedAt < ADMIN_CACHE_TTL_MS) {
    return _adminCachedStore;
  }

  const [stateRes, teamsRes] = await Promise.all([
    supabase.from('monopoly_state').select('state_json').eq('id', 1).maybeSingle(),
    supabase.from('monopoly_teams').select('id, name, username, passcode, cash, starting_budget, owned_resources').order('updated_at', { ascending: true })
  ]);

  if (stateRes.error) {
    throw new Error(`Supabase fetchMonopolyStore error: ${stateRes.error.message}`);
  }

  const dbTeams = Array.isArray(teamsRes.data)
    ? teamsRes.data.map((row) => ({
        id: String(row.id),
        name: row.name,
        username: (row.username || row.name || '').toLowerCase().replace(/\s+/g, '_'),
        passcode: String(row.passcode || '1234'),
        cash: Number(row.cash ?? row.starting_budget ?? STARTING_BUDGET_LAKH),
        startingBudget: Number(row.starting_budget ?? STARTING_BUDGET_LAKH),
        ownedResources: Array.isArray(row.owned_resources) ? row.owned_resources : []
      }))
    : null;

  let result;
  if (stateRes.data?.state_json && typeof stateRes.data.state_json === 'object') {
    const raw = { ...stateRes.data.state_json };
    // Authoritative teams list comes from monopoly_teams table if available, otherwise raw.teams
    if (dbTeams !== null) {
      raw.teams = dbTeams;
    } else if (!Array.isArray(raw.teams)) {
      raw.teams = [];
    }
    result = hydrateMonopolyState(raw);
  } else {
    const initial = getInitialStore();
    if (dbTeams && dbTeams.length > 0) {
      initial.teams = dbTeams;
    }
    await persistMonopolyStore(initial);
    result = initial;
  }

  _adminCachedStore = result;
  _adminCachedAt = Date.now();
  return result;
}

export async function persistMonopolyStore(nextStore) {
  const hydrated = hydrateMonopolyState({ ...nextStore, updatedAt: Date.now() });

  _adminCachedStore = hydrated;
  _adminCachedAt = Date.now();

  const compact = {
    currentRound: hydrated.currentRound,
    activeAuctionPropertyId: hydrated.activeAuctionPropertyId,
    currentWheelRound: hydrated.currentWheelRound || 1,
    wheelSpinsByRound: hydrated.wheelSpinsByRound || {},
    lastWheelResult: hydrated.lastWheelResult,
    teams: hydrated.teams,
    properties: hydrated.properties.map((p) => ({
      id: p.id,
      openingValue: Number(p.openingValue || 0),
      level3Target: Number(p.level3Target || 0),
      valueIncreasePerLevel: Number(p.valueIncreasePerLevel || 0),
      rentIncreasePerLevel: Number(p.rentIncreasePerLevel || 0),
      rentValues: Array.isArray(p.rentValues) ? p.rentValues.map(Number) : [15, 25, 38, 55],
      upgradeCosts: Array.isArray(p.upgradeCosts) ? p.upgradeCosts.map(Number) : [10, 15, 20],
      ownerTeamId: p.ownerTeamId || null,
      ownerTeamName: p.ownerTeamName || null,
      purchasePrice: Number(p.purchasePrice || 0),
      upgradeLevel: Math.min(3, Math.max(0, Number(p.upgradeLevel || 0))),
      attachedUtilities: Array.isArray(p.attachedUtilities) ? p.attachedUtilities : []
    })),
    transactions: (hydrated.transactions || [])
      .filter((tx) => tx.type !== 'TEAM_CREATED' && tx.type !== 'TEAM_DELETED')
      .slice(0, 120),
    updatedAt: hydrated.updatedAt
  };

  if (Array.isArray(hydrated.teams)) {
    if (hydrated.teams.length > 0) {
      const teamRows = hydrated.teams.map((t) => ({
        id: String(t.id),
        name: t.name,
        username: (t.username || t.name || '').toLowerCase().replace(/\s+/g, '_'),
        passcode: String(t.passcode || '1234'),
        cash: Number(t.cash || 0),
        starting_budget: Number(t.startingBudget || STARTING_BUDGET_LAKH),
        owned_resources: Array.isArray(t.ownedResources) ? t.ownedResources : [],
        updated_at: new Date().toISOString()
      }));
      await supabase.from('monopoly_teams').upsert(teamRows, { onConflict: 'id' });
    }
  }

  if (Array.isArray(hydrated.properties) && hydrated.properties.length > 0) {
    const propRows = hydrated.properties.map((p) => ({
      id: Number(p.id),
      name: p.name,
      category: p.category,
      opening_value: Number(p.openingValue || 0),
      level3_target: Number(p.level3Target || 0),
      upgrade_costs: p.upgradeCosts || [10, 15, 20],
      rent_values: p.rentValues || [15, 25, 38, 55],
      recommended_utilities: p.recommendedUtilities || [],
      owner_team_id: p.ownerTeamId || null,
      purchase_price: Number(p.purchasePrice || 0),
      upgrade_level: Number(p.upgradeLevel || 0),
      attached_utilities: p.attachedUtilities || [],
      updated_at: new Date().toISOString()
    }));
    await supabase.from('monopoly_properties').upsert(propRows, { onConflict: 'id' });
  }

  const { error: stateErr } = await supabase
    .from('monopoly_state')
    .upsert(
      {
        id: 1,
        state_json: compact,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

  if (stateErr) {
    throw new Error(`Supabase persistMonopolyStore error: ${stateErr.message}`);
  }

  return hydrated;
}

/**
 * Admin: Assign a Property to a Team (Round 1 Auction / Direct Assignment) via Supabase
 */
export async function recordAuctionWin({ store, propertyId, teamId, bidAmount }) {
  const latest = await fetchMonopolyStore();
  const prop = latest.properties.find((p) => Number(p.id) === Number(propertyId));
  const team = latest.teams.find((t) => String(t.id) === String(teamId));
  const price = Number(bidAmount);

  if (!prop) throw new Error('Select a property.');
  if (!team) throw new Error('Choose the winning team.');
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Enter a valid price in Lakhs.');
  }
  if (team.cash < price) {
    throw new Error(`${team.name} only has Rs ${team.cash} Lakh available.`);
  }

  const nextTeams = latest.teams.map((t) => {
    if (prop.ownerTeamId && String(t.id) === String(prop.ownerTeamId)) {
      return { ...t, cash: Number((t.cash + Number(prop.purchasePrice || 0)).toFixed(2)) };
    }
    return t;
  }).map((t) => {
    if (String(t.id) === String(team.id)) {
      return { ...t, cash: Number((t.cash - price).toFixed(2)) };
    }
    return t;
  });

  const nextProps = latest.properties.map((p) =>
    Number(p.id) === Number(prop.id)
      ? {
          ...p,
          openingValue: price,
          level3Target: Math.round(price + 3 * Number(p.valueIncreasePerLevel || 25)),
          ownerTeamId: team.id,
          ownerTeamName: team.name,
          purchasePrice: price
        }
      : p
  );

  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'AUCTION_WIN',
    teamId: team.id,
    teamName: team.name,
    propertyId: prop.id,
    propertyName: prop.name,
    amount: price,
    note: `${team.name} acquired ${prop.name} for Rs ${price} Lakh (Rs ${price}L deducted automatically)`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    team_id: tx.teamId,
    team_name: tx.teamName,
    property_id: tx.propertyId,
    property_name: tx.propertyName,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  const nextUnsold = nextProps.find((p) => !p.ownerTeamId);

  return persistMonopolyStore({
    ...latest,
    activeAuctionPropertyId: nextUnsold ? nextUnsold.id : prop.id,
    teams: nextTeams,
    properties: nextProps,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Give One or Multiple Selected Properties AND/OR Resources to a Team in One Click (Auto-Deducts Total Cash)
 */
export async function assignMultiplePropertiesToTeam({
  store,
  propertyIds = [],
  resourceIds = [],
  teamId
}) {
  const latest = await fetchMonopolyStore();
  const team = latest.teams.find((t) => String(t.id) === String(teamId));
  if (!team) throw new Error('Select a team first.');

  const propIdList = (Array.isArray(propertyIds) ? propertyIds : []).map(Number);
  const resIdList = (Array.isArray(resourceIds) ? resourceIds : []).map(Number);

  if (propIdList.length === 0 && resIdList.length === 0) {
    throw new Error('Select at least one property or resource card.');
  }

  const selectedProps = latest.properties.filter((p) => propIdList.includes(Number(p.id)));
  const selectedResources = KARACHI_UTILITIES.filter((u) => resIdList.includes(Number(u.id)));

  const totalPropsCost = selectedProps.reduce((sum, p) => sum + Number(p.openingValue || 0), 0);
  const totalResCost = selectedResources.reduce((sum, u) => sum + Number(u.cost || 0), 0);
  const totalCost = totalPropsCost + totalResCost;

  if (team.cash < totalCost) {
    throw new Error(
      `${team.name} needs Rs ${totalCost} Lakh, but only has Rs ${team.cash} Lakh.`
    );
  }

  // Refund any previous owners if reassigning properties, then deduct totalCost and add new resources to target team
  let nextTeams = latest.teams.map((t) => ({ ...t }));
  selectedProps.forEach((prop) => {
    if (prop.ownerTeamId && String(prop.ownerTeamId) !== String(team.id)) {
      nextTeams = nextTeams.map((t) =>
        String(t.id) === String(prop.ownerTeamId)
          ? { ...t, cash: Number((t.cash + Number(prop.purchasePrice || 0)).toFixed(2)) }
          : t
      );
    }
  });

  const newResourceInstances = selectedResources.map((util, idx) => ({
    instanceId: `res_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    utilityId: util.id,
    name: util.name,
    category: util.category,
    bidPrice: Number(util.cost || 0),
    attachedToPropertyId: null,
    attachedToPropertyName: null
  }));

  nextTeams = nextTeams.map((t) =>
    String(t.id) === String(team.id)
      ? {
          ...t,
          cash: Number((t.cash - totalCost).toFixed(2)),
          ownedResources: [...(t.ownedResources || []), ...newResourceInstances]
        }
      : t
  );

  const nextProps = latest.properties.map((p) => {
    if (propIdList.includes(Number(p.id))) {
      const price = Number(p.openingValue || 0);
      return {
        ...p,
        ownerTeamId: team.id,
        ownerTeamName: team.name,
        purchasePrice: price
      };
    }
    return p;
  });

  const newTxs = [];
  const nowBase = Date.now();

  if (selectedProps.length > 0) {
    const propNames = selectedProps.map((p) => p.name).join(', ');
    const propTx = {
      id: `tx_${nowBase}_p_${Math.random().toString(36).slice(2, 6)}`,
      type: 'AUCTION_WIN',
      category: 'PROPERTY',
      teamId: team.id,
      teamName: team.name,
      propertyId: selectedProps[0]?.id || null,
      propertyName: propNames,
      items: selectedProps.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.openingValue || 0)
      })),
      amount: totalPropsCost,
      cashBefore: Number(team.cash),
      cashAfter: Number((team.cash - totalPropsCost).toFixed(2)),
      note: `${team.name} received ${selectedProps.length > 1 ? `${selectedProps.length} Properties` : 'Property'}: ${propNames} (Deducted Rs ${totalPropsCost} Lakh)`,
      createdAt: new Date(nowBase).toISOString()
    };
    newTxs.push(propTx);
    await supabase.from('monopoly_transactions').upsert({
      id: propTx.id,
      type: propTx.type,
      team_id: propTx.teamId,
      team_name: propTx.teamName,
      property_id: propTx.propertyId,
      property_name: propTx.propertyName,
      amount: propTx.amount,
      note: propTx.note,
      created_at: propTx.createdAt
    });
  }

  if (selectedResources.length > 0) {
    const resNames = selectedResources.map((u) => u.name).join(', ');
    const resTx = {
      id: `tx_${nowBase + 1}_r_${Math.random().toString(36).slice(2, 6)}`,
      type: 'RESOURCE_BID_WIN',
      category: 'RESOURCE',
      teamId: team.id,
      teamName: team.name,
      utilityId: selectedResources[0]?.id || null,
      utilityName: resNames,
      items: selectedResources.map((u) => ({
        id: u.id,
        name: u.name,
        category: u.category,
        price: Number(u.cost || 0)
      })),
      amount: totalResCost,
      cashBefore: Number((team.cash - totalPropsCost).toFixed(2)),
      cashAfter: Number((team.cash - totalCost).toFixed(2)),
      note: `${team.name} received ${selectedResources.length > 1 ? `${selectedResources.length} Resources` : 'Resource'}: ${resNames} (Deducted Rs ${totalResCost} Lakh)`,
      createdAt: new Date(nowBase + 1).toISOString()
    };
    newTxs.push(resTx);
    await supabase.from('monopoly_transactions').upsert({
      id: resTx.id,
      type: resTx.type,
      team_id: resTx.teamId,
      team_name: resTx.teamName,
      utility_id: resTx.utilityId,
      utility_name: resTx.utilityName,
      amount: resTx.amount,
      note: resTx.note,
      created_at: resTx.createdAt
    });
  }

  return persistMonopolyStore({
    ...latest,
    teams: nextTeams,
    properties: nextProps,
    transactions: [...newTxs, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Update Property Settings (Money/Price, Level-Up Value Increase, Base Rent, Rent Increase per Level, Max Level 3)
 */
export async function updatePropertySettingsAdmin({
  store,
  propertyId,
  openingValue,
  valueIncreasePerLevel,
  baseRent,
  rentIncreasePerLevel,
  upgradeCostPerLevel,
  upgradeLevel
}) {
  const latest = await fetchMonopolyStore();
  const prop = latest.properties.find((p) => Number(p.id) === Number(propertyId));
  if (!prop) throw new Error('Property not found.');

  const nextPrice =
    openingValue !== undefined && Number(openingValue) > 0
      ? Number(openingValue)
      : Number(prop.openingValue);
  const nextValInc =
    valueIncreasePerLevel !== undefined && Number(valueIncreasePerLevel) >= 0
      ? Number(valueIncreasePerLevel)
      : Number(prop.valueIncreasePerLevel || 25);
  const nextBaseRent =
    baseRent !== undefined && Number(baseRent) >= 0
      ? Number(baseRent)
      : Number(prop.rentValues?.[0] || 15);
  const nextRentInc =
    rentIncreasePerLevel !== undefined && Number(rentIncreasePerLevel) >= 0
      ? Number(rentIncreasePerLevel)
      : Number(prop.rentIncreasePerLevel || 10);
  const nextUpgradeCost =
    upgradeCostPerLevel !== undefined && Number(upgradeCostPerLevel) > 0
      ? Number(upgradeCostPerLevel)
      : Number(prop.upgradeCosts?.[0] || 15);
  const nextLvl =
    upgradeLevel !== undefined
      ? Math.min(3, Math.max(0, Number(upgradeLevel)))
      : Math.min(3, Math.max(0, Number(prop.upgradeLevel || 0)));

  const nextRentValues = [
    Math.round(nextBaseRent),
    Math.round(nextBaseRent + nextRentInc),
    Math.round(nextBaseRent + nextRentInc * 2),
    Math.round(nextBaseRent + nextRentInc * 3)
  ];
  const nextLevel3Target = Math.round(nextPrice + nextValInc * 3);
  const nextUpgradeCosts = [
    Math.round(nextUpgradeCost),
    Math.round(nextUpgradeCost),
    Math.round(nextUpgradeCost)
  ];

  const nextProps = latest.properties.map((p) =>
    Number(p.id) === Number(prop.id)
      ? {
          ...p,
          openingValue: nextPrice,
          valueIncreasePerLevel: nextValInc,
          level3Target: nextLevel3Target,
          rentIncreasePerLevel: nextRentInc,
          rentValues: nextRentValues,
          upgradeCosts: nextUpgradeCosts,
          upgradeLevel: nextLvl,
          maxLevel: 3
        }
      : p
  );

  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'PROPERTY_SETTINGS',
    propertyId: prop.id,
    propertyName: prop.name,
    amount: nextPrice,
    note: `Updated ${prop.name}: Price Rs ${nextPrice}L | +Rs ${nextValInc}L/lvl | Rent Rs ${nextBaseRent}L (+Rs ${nextRentInc}L/lvl, Max Lvl 3)`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    property_id: tx.propertyId,
    property_name: tx.propertyName,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  return persistMonopolyStore({
    ...latest,
    properties: nextProps,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Remove / Refund a Property Sale
 */
export async function revokePropertySale({ store, propertyId }) {
  const latest = await fetchMonopolyStore();
  const prop = latest.properties.find((p) => Number(p.id) === Number(propertyId));
  if (!prop || !prop.ownerTeamId) {
    throw new Error('This property is not assigned to any team.');
  }

  const prevOwner = latest.teams.find((t) => String(t.id) === String(prop.ownerTeamId));
  const refund = Number(prop.purchasePrice || 0);

  const nextTeams = latest.teams.map((t) => {
    if (String(t.id) === String(prop.ownerTeamId)) {
      const nextRes = (t.ownedResources || []).map((r) =>
        Number(r.attachedToPropertyId) === Number(prop.id)
          ? { ...r, attachedToPropertyId: null, attachedToPropertyName: null }
          : r
      );
      return {
        ...t,
        cash: Number((t.cash + refund).toFixed(2)),
        ownedResources: nextRes
      };
    }
    return t;
  });

  const nextProps = latest.properties.map((p) =>
    Number(p.id) === Number(prop.id)
      ? {
          ...p,
          ownerTeamId: null,
          ownerTeamName: null,
          purchasePrice: 0,
          upgradeLevel: 0,
          attachedUtilities: []
        }
      : p
  );

  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'SALE_REVOKED',
    teamId: prevOwner?.id,
    teamName: prevOwner?.name,
    propertyId: prop.id,
    propertyName: prop.name,
    amount: refund,
    note: `Admin removed ${prop.name} from ${prevOwner?.name || 'team'} (Refunded Rs ${refund} Lakh)`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    team_id: tx.teamId,
    team_name: tx.teamName,
    property_id: tx.propertyId,
    property_name: tx.propertyName,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  return persistMonopolyStore({
    ...latest,
    teams: nextTeams,
    properties: nextProps,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Give a Bid Resource / Utility to a Team & Auto-Deduct Bid Money via Supabase
 */
export async function recordResourceBidWin({ store, utilityId, teamId, bidAmount }) {
  const latest = await fetchMonopolyStore();
  const util = KARACHI_UTILITIES.find((u) => Number(u.id) === Number(utilityId));
  const team = latest.teams.find((t) => String(t.id) === String(teamId));
  const price = Number(bidAmount);

  if (!util) throw new Error('Select a resource.');
  if (!team) throw new Error('Choose the winning team.');
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Enter a valid resource bid amount in Lakhs.');
  }
  if (team.cash < price) {
    throw new Error(`${team.name} only has Rs ${team.cash} Lakh available.`);
  }

  const newInstance = {
    instanceId: `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    utilityId: util.id,
    name: util.name,
    category: util.category,
    bidPrice: price,
    attachedToPropertyId: null,
    attachedToPropertyName: null
  };

  const nextTeams = latest.teams.map((t) =>
    String(t.id) === String(team.id)
      ? {
          ...t,
          cash: Number((t.cash - price).toFixed(2)),
          ownedResources: [...(t.ownedResources || []), newInstance]
        }
      : t
  );

  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'RESOURCE_BID_WIN',
    teamId: team.id,
    teamName: team.name,
    utilityId: util.id,
    utilityName: util.name,
    amount: price,
    note: `${team.name} won resource ${util.name} for Rs ${price} Lakh (Rs ${price}L deducted automatically)`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    team_id: tx.teamId,
    team_name: tx.teamName,
    utility_id: tx.utilityId,
    utility_name: tx.utilityName,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  return persistMonopolyStore({
    ...latest,
    teams: nextTeams,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Remove a Bid Resource from a Team & Refund Bid Money
 */
export async function revokeResourceBid({ store, teamId, instanceId }) {
  const latest = await fetchMonopolyStore();
  const team = latest.teams.find((t) => String(t.id) === String(teamId));
  if (!team) throw new Error('Team not found.');

  const targetRes = (team.ownedResources || []).find((r) => String(r.instanceId) === String(instanceId));
  if (!targetRes) throw new Error('Resource entry not found on team.');

  const refund = Number(targetRes.bidPrice || 0);

  const nextTeams = latest.teams.map((t) =>
    String(t.id) === String(team.id)
      ? {
          ...t,
          cash: Number((t.cash + refund).toFixed(2)),
          ownedResources: (t.ownedResources || []).filter((r) => String(r.instanceId) !== String(instanceId))
        }
      : t
  );

  const nextProps = latest.properties.map((p) => {
    if (
      targetRes.attachedToPropertyId &&
      Number(p.id) === Number(targetRes.attachedToPropertyId)
    ) {
      const nextAttached = (p.attachedUtilities || []).filter(
        (uId) => Number(uId) !== Number(targetRes.utilityId)
      );
      return {
        ...p,
        attachedUtilities: nextAttached,
        upgradeLevel: Math.min(3, nextAttached.length)
      };
    }
    return p;
  });

  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'RESOURCE_REVOKED',
    teamId: team.id,
    teamName: team.name,
    utilityId: targetRes.utilityId,
    utilityName: targetRes.name,
    amount: refund,
    note: `Admin removed ${targetRes.name} from ${team.name} (Refunded Rs ${refund} Lakh)`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    team_id: tx.teamId,
    team_name: tx.teamName,
    utility_id: tx.utilityId,
    utility_name: tx.utilityName,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  return persistMonopolyStore({
    ...latest,
    teams: nextTeams,
    properties: nextProps,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Release Next Wheel Spin Wave (Spin #2, Spin #3, etc.)
 */
export async function releaseNextWheelSpinAdmin({ store }) {
  const latest = await fetchMonopolyStore();
  const nextWave = Number(latest.currentWheelRound || 1) + 1;
  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'WHEEL_RELEASE',
    amount: 0,
    note: `Admin released Wheel Spin #${nextWave} for all teams`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  return persistMonopolyStore({
    ...latest,
    currentWheelRound: nextWave,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Direct Cash Adjustment
 */
export async function adjustTeamCashAdmin({ store, teamId, deltaAmount, reason = '' }) {
  const latest = await fetchMonopolyStore();
  const team = latest.teams.find((t) => String(t.id) === String(teamId));
  const delta = Number(deltaAmount);
  if (!team || !Number.isFinite(delta) || delta === 0) {
    throw new Error('Select a team and enter a non-zero Lakh amount.');
  }

  const nextTeams = latest.teams.map((t) =>
    String(t.id) === String(team.id) ? { ...t, cash: Number((t.cash + delta).toFixed(2)) } : t
  );

  const tx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'ADMIN_CASH_ADJUST',
    teamId: team.id,
    teamName: team.name,
    amount: Math.abs(delta),
    note: `Admin ${delta > 0 ? 'added' : 'deducted'} Rs ${Math.abs(delta)} Lakh ${delta > 0 ? 'to' : 'from'} ${team.name}${reason ? ` (${reason})` : ''}`,
    createdAt: new Date().toISOString()
  };

  await supabase.from('monopoly_transactions').upsert({
    id: tx.id,
    type: tx.type,
    team_id: tx.teamId,
    team_name: tx.teamName,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt
  });

  return persistMonopolyStore({
    ...latest,
    teams: nextTeams,
    transactions: [tx, ...(latest.transactions || [])]
  });
}

/**
 * Admin: Add New Team / User with Username & Passcode in Supabase
 */
export async function addNewTeamAdmin({ store, name, username, passcode, startingCash }) {
  const latest = await fetchMonopolyStore();
  const cleanName = (name || '').trim();
  const cleanUser = (username || cleanName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const cleanCode = (passcode || '1234').trim();
  const budget = Number(startingCash) > 0 ? Number(startingCash) : STARTING_BUDGET_LAKH;

  if (!cleanName) throw new Error('Enter a team name.');
  if (!cleanUser) throw new Error('Enter a username.');
  if (!cleanCode) throw new Error('Enter a passcode.');

  const duplicate = latest.teams.find(
    (t) =>
      t.name.toLowerCase() === cleanName.toLowerCase() ||
      (t.username && t.username.toLowerCase() === cleanUser.toLowerCase())
  );
  if (duplicate) {
    throw new Error(`Team "${cleanName}" or username "${cleanUser}" already exists.`);
  }

  const newTeam = {
    id: `mm_team_${Date.now().toString(36)}`,
    name: cleanName,
    username: cleanUser,
    passcode: cleanCode,
    cash: budget,
    startingBudget: budget,
    ownedResources: []
  };

  await supabase.from('monopoly_teams').upsert(
    {
      id: String(newTeam.id),
      name: newTeam.name,
      username: newTeam.username,
      passcode: String(newTeam.passcode),
      cash: Number(newTeam.cash),
      starting_budget: Number(newTeam.startingBudget),
      owned_resources: [],
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  return persistMonopolyStore({
    ...latest,
    teams: [...latest.teams, newTeam]
  });
}

/**
 * Admin: Delete Team and Release Any Owned Properties
 */
export async function deleteTeamAdmin({ store, teamId }) {
  const latest = await fetchMonopolyStore();
  const target = latest.teams.find((t) => String(t.id) === String(teamId));
  if (!target) throw new Error('Team not found.');

  const nextTeams = latest.teams.filter((t) => String(t.id) !== String(teamId));
  const nextProps = latest.properties.map((p) =>
    String(p.ownerTeamId) === String(teamId)
      ? {
          ...p,
          ownerTeamId: null,
          ownerTeamName: null,
          purchasePrice: 0,
          upgradeLevel: 0,
          attachedUtilities: []
        }
      : p
  );

  await supabase
    .from('monopoly_properties')
    .update({
      owner_team_id: null,
      purchase_price: 0,
      upgrade_level: 0,
      attached_utilities: []
    })
    .eq('owner_team_id', String(teamId));

  await supabase.from('monopoly_teams').delete().eq('id', String(teamId));

  return persistMonopolyStore({
    ...latest,
    teams: nextTeams,
    properties: nextProps
  });
}

export async function resetMonopolyGameAdmin() {
  await supabase
    .from('monopoly_properties')
    .update({
      owner_team_id: null,
      purchase_price: 0,
      upgrade_level: 0,
      attached_utilities: []
    })
    .gte('id', 1);

  await supabase.from('monopoly_teams').delete().neq('id', '');
  await supabase.from('monopoly_transactions').delete().neq('id', '');

  const fresh = getInitialStore();
  return persistMonopolyStore(fresh);
}

export function computeTeamSummary(team, properties = []) {
  const owned = (properties || []).filter(
    (p) =>
      (p.ownerTeamId && String(p.ownerTeamId) === String(team.id)) ||
      (p.ownerTeamName &&
        team.name &&
        String(p.ownerTeamName).toLowerCase() === String(team.name).toLowerCase())
  );
  const propVal = owned.reduce((sum, p) => sum + computePropertyValuation(p), 0);
  const propSpent = owned.reduce((sum, p) => sum + Number(p.purchasePrice || p.openingValue || 0), 0);
  const ownedResList = Array.isArray(team?.ownedResources) ? team.ownedResources : [];
  const resSpent = ownedResList.reduce((sum, r) => sum + Number(r.bidPrice || 0), 0);
  const unattachedResVal = ownedResList
    .filter((r) => !r.attachedToPropertyId)
    .reduce((sum, r) => sum + Number(r.bidPrice || 0), 0);
  const totalRentPotential = owned.reduce((sum, p) => sum + computePropertyRent(p), 0);
  const cash = Number(team?.cash || 0);
  const startingBudget = Number(team?.startingBudget ?? STARTING_BUDGET_LAKH);
  const totalDeducted = Number((propSpent + resSpent).toFixed(2));
  const netWorth = Number((cash + propVal + unattachedResVal).toFixed(2));

  return {
    ...team,
    cash,
    startingBudget,
    totalDeducted,
    propertySpent: propSpent,
    resourceSpent: resSpent,
    resourceCount: ownedResList.length,
    propertyCount: owned.length,
    propertyValuation: propVal,
    totalRentPotential,
    totalRentPower: totalRentPotential,
    netWorth,
    ownedProperties: owned
  };
}
