import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Trophy, AlertCircle, Coins, ArrowDown, Users, Building2, ChevronRight } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { fetchMonopolyStore, invalidateAdminMonopolyCache } from '../lib/monopolyAdminService.js';
import { KARACHI_PROPERTIES } from '../data/monopolyData.js';

const SHORT_PROPERTY_NAMES = {
  1: 'DHA Phase 6',
  2: 'Clifton Blk 5',
  3: 'Gulshan 13-D',
  4: 'N. Nazimabad H',
  5: 'PECHS Blk 2',
  6: 'Bahadurabad',
  7: 'Saddar',
  8: 'Tariq Road',
  9: 'Shahrah-e-Faisal',
  10: 'Korangi Ind.',
  11: 'SITE Ind.',
  12: 'Malir Cantt',
  13: 'Scheme 33',
  14: 'Surjani Town',
  15: 'Orangi Town',
  16: 'Lyari',
  17: 'Manora',
  18: 'Port Qasim',
  19: 'KU Road',
  20: 'Jinnah Airport',
  21: 'Kharadar',
  22: 'FB Area Blk 15',
  23: 'Karsaz',
  24: 'Boat Basin',
  25: 'Hyderi Market'
};

const PROP_SLICE_PALETTE = [
  { bg: '#701020', text: '#F8EEE1' },
  { bg: '#2A1215', text: '#F1CA7E' },
  { bg: '#8B1E32', text: '#FFF8F6' },
  { bg: '#47131C', text: '#E8DCC6' },
  { bg: '#5E1B21', text: '#F1CA7E' }
];

const TEAM_SLICE_PALETTE = [
  { bg: '#8B1E32', text: '#FFF8F6', accent: '#ECC37A' }, // Crimson
  { bg: '#1E3A8A', text: '#EFF6FF', accent: '#93C5FD' }, // Sapphire Blue
  { bg: '#14532D', text: '#F0FDF4', accent: '#86EFAC' }, // Emerald Green
  { bg: '#78350F', text: '#FFFBEB', accent: '#FDE047' }, // Amber Gold
  { bg: '#581C87', text: '#FAF5FF', accent: '#D8B4FE' }, // Royal Purple
  { bg: '#0F766E', text: '#F0FDFA', accent: '#5EEAD4' }, // Teal
  { bg: '#9A3412', text: '#FFF7ED', accent: '#FDBA74' }, // Burnt Orange
  { bg: '#831843', text: '#FDF2F8', accent: '#F472B6' }, // Rose Pink
  { bg: '#312E81', text: '#EEF2FF', accent: '#A5B4FC' }, // Indigo
  { bg: '#365314', text: '#F7FEE7', accent: '#BEF264' }  // Lime Green
];

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const rad = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function createSlicePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', cx, cy, 'L', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
}

function playTickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch {}
}

function playFinishSound(isSafe = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = isSafe ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
    });
  } catch {}
}

export default function AdminSpinWheelModal({
  isOpen,
  onClose,
  store,
  onStoreUpdated,
  autoStart = false
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [propWheelRotation, setPropWheelRotation] = useState(0);
  const [teamWheelRotation, setTeamWheelRotation] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [spinError, setSpinError] = useState('');
  const tickIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setOutcome(null);
      setSpinError('');
      if (autoStart) {
        handleStartSpin();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  if (!isOpen || !store) return null;

  const properties = store.properties || KARACHI_PROPERTIES;
  const totalPropSlices = properties.length || 25;
  const propSliceAngle = 360 / totalPropSlices;

  const teams = store.teams || [];
  const totalTeamSlices = Math.max(1, teams.length);
  const teamSliceAngle = 360 / totalTeamSlices;

  const activeWave = Number(store.currentWheelRound || 1);
  const waveSpins = store.wheelSpinsByRound?.[activeWave] || {};
  const unspunCount = teams.filter((t) => !waveSpins[t.id]).length;

  const handleStartSpin = async () => {
    if (isSpinning) return;
    setSpinError('');
    setOutcome(null);
    setIsSpinning(true);

    try {
      // Execute spin with empty teamId -> server automatically picks an unspun team & random property
      const { data: res, error } = await supabase.rpc('monopoly_execute_wheel_spin', {
        p_team_id: '',
        p_property_id: 0
      });

      if (error) throw error;
      if (!res || !res.ok) {
        throw new Error(res?.error || 'Wheel spin rejected by server.');
      }

      // 1. Calculate Property Landing Angle (under top pointer)
      const landedPropId = Number(res.propertyId);
      const winningPropIndex = properties.findIndex((p) => Number(p.id) === landedPropId);
      const safePropIndex = winningPropIndex !== -1 ? winningPropIndex : 0;
      const propSliceCenter = (safePropIndex + 0.5) * propSliceAngle;
      const propDesiredMod = (360 - propSliceCenter + 360) % 360;
      const propCurrentMod = ((propWheelRotation % 360) + 360) % 360;
      let propDelta = propDesiredMod - propCurrentMod;
      if (propDelta <= 0) propDelta += 360;
      const nextPropRotation = propWheelRotation + 360 * 5 + propDelta;
      setPropWheelRotation(nextPropRotation);

      // 2. Calculate Team Landing Angle (under top pointer)
      const landedTeamId = String(res.teamId || res.spinRecord?.teamId || '');
      const winningTeamIndex = teams.findIndex((t) => String(t.id) === landedTeamId);
      const safeTeamIndex = winningTeamIndex !== -1 ? winningTeamIndex : 0;
      const teamSliceCenter = (safeTeamIndex + 0.5) * teamSliceAngle;
      const teamDesiredMod = (360 - teamSliceCenter + 360) % 360;
      const teamCurrentMod = ((teamWheelRotation % 360) + 360) % 360;
      let teamDelta = teamDesiredMod - teamCurrentMod;
      if (teamDelta <= 0) teamDelta += 360;
      // Team wheel spins 6 full rotations (slight stagger for maximum drama)
      const nextTeamRotation = teamWheelRotation + 360 * 6 + teamDelta;
      setTeamWheelRotation(nextTeamRotation);

      // 3. Audio tick feedback during spin
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      let tickCount = 0;
      tickIntervalRef.current = setInterval(() => {
        tickCount += 1;
        playTickSound();
        if (tickCount >= 32) {
          clearInterval(tickIntervalRef.current);
        }
      }, 145);

      // 4. Reveal result after 4.8s deceleration animation
      setTimeout(async () => {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        setIsSpinning(false);
        setOutcome(res);
        playFinishSound(res.status !== 'PAID_RENT');

        // Reveal result to spectator screens and broadcast live
        try {
          await supabase.rpc('monopoly_reveal_wheel_result');
        } catch (e) {
          console.error('monopoly_reveal_wheel_result error:', e);
        }

        // Authoritatively refresh admin store
        invalidateAdminMonopolyCache();
        const fresh = await fetchMonopolyStore(true);
        if (onStoreUpdated && fresh) {
          onStoreUpdated(fresh);
        }
      }, 4900);
    } catch (err) {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setSpinError(err.message || 'Execution error during wheel spin.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={() => !isSpinning && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#140207] border-2 border-[#ECC37A] rounded-3xl shadow-2xl overflow-hidden text-[#F8EEE1] flex flex-col max-h-[96vh]"
        >
          {/* TOP HEADER */}
          <div className="p-4 sm:p-5 border-b border-[#ECC37A]/25 flex items-center justify-between gap-4 bg-[#1C050B]">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#701020] text-[#F1CA7E] border border-[#F1CA7E]/40">
                Wave #{activeWave}
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#F8EEE1] leading-tight">
                  Dual Wheel Arena: Property &amp; Team Spin
                </h3>
                <p className="text-xs font-mono text-[#F1CA7E]/80">
                  The wheel spins both the target property and the payer team.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-mono bg-[#2A0812] border border-[#ECC37A]/30 text-[#F1CA7E]">
                {teams.length - unspunCount} / {teams.length} Spun
              </span>
              <button
                type="button"
                disabled={isSpinning}
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-[#2A0812] hover:bg-[#701020] text-[#F8EEE1] flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                title="Close Wheel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DUAL WHEELS ARENA */}
          <div className="relative flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
              {/* WHEEL 1: KARACHI PROPERTY WHEEL */}
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#0E0105] border border-[#ECC37A]/30 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-[#ECC37A]" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#F1CA7E]">
                    Wheel 1: Karachi Property
                  </span>
                </div>

                <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] select-none">
                  {/* Top Pointer */}
                  <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-xl">
                    <div className="w-4 h-6 bg-gradient-to-b from-[#FFF2CC] to-[#ECC37A] clip-polygon border border-[#47131C] shadow-lg flex items-center justify-center">
                      <ArrowDown className="w-3.5 h-3.5 text-[#2A0812]" />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ECC37A] border-2 border-[#140207] -mt-1" />
                  </div>

                  {/* SVG Property Wheel */}
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full drop-shadow-2xl"
                    style={{
                      transform: `rotate(${propWheelRotation}deg)`,
                      transition: isSpinning
                        ? 'transform 4.4s cubic-bezier(0.12, 0.8, 0.18, 1)'
                        : 'none'
                    }}
                  >
                    <circle cx="200" cy="200" r="196" fill="#140207" stroke="#ECC37A" strokeWidth="6" />
                    <circle cx="200" cy="200" r="189" fill="none" stroke="#701020" strokeWidth="4" />

                    {properties.map((prop, idx) => {
                      const startAngle = idx * propSliceAngle;
                      const endAngle = (idx + 1) * propSliceAngle;
                      const path = createSlicePath(200, 200, 185, startAngle, endAngle);
                      const palette = PROP_SLICE_PALETTE[idx % PROP_SLICE_PALETTE.length];
                      const midAngle = startAngle + propSliceAngle / 2;
                      const textCoord = polarToCartesian(200, 200, 138, midAngle);
                      const shortName = SHORT_PROPERTY_NAMES[prop.id] || prop.name;

                      return (
                        <g key={prop.id}>
                          <path
                            d={path}
                            fill={palette.bg}
                            stroke="#ECC37A"
                            strokeWidth="0.8"
                            strokeOpacity="0.5"
                          />
                          <g transform={`translate(${textCoord.x}, ${textCoord.y}) rotate(${midAngle + 90})`}>
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={palette.text}
                              fontSize="7"
                              fontWeight="700"
                              fontFamily="sans-serif"
                            >
                              #{prop.id} {shortName.length > 12 ? shortName.slice(0, 10) + '..' : shortName}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Center Hub */}
                    <circle cx="200" cy="200" r="40" fill="#1C050B" stroke="#ECC37A" strokeWidth="3" />
                    <circle cx="200" cy="200" r="32" fill="#701020" stroke="#FFF2CC" strokeWidth="1.5" />
                    <text
                      x="200"
                      y="196"
                      textAnchor="middle"
                      fill="#F1CA7E"
                      fontSize="8"
                      fontWeight="900"
                      fontFamily="monospace"
                      letterSpacing="1px"
                    >
                      KARACHI
                    </text>
                    <text
                      x="200"
                      y="207"
                      textAnchor="middle"
                      fill="#FFF"
                      fontSize="7"
                      fontWeight="700"
                    >
                      PROPERTY
                    </text>
                  </svg>
                </div>
              </div>

              {/* WHEEL 2: TEAM WHEEL (WHO PAYS RENT) */}
              <div className="flex flex-col items-center p-4 rounded-2xl bg-[#0E0105] border border-[#ECC37A]/30 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#F1CA7E]" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#F1CA7E]">
                    Wheel 2: Team (Who Pays Rent)
                  </span>
                </div>

                <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] select-none">
                  {/* Top Pointer */}
                  <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-xl">
                    <div className="w-4 h-6 bg-gradient-to-b from-[#FFF2CC] to-[#ECC37A] clip-polygon border border-[#47131C] shadow-lg flex items-center justify-center">
                      <ArrowDown className="w-3.5 h-3.5 text-[#2A0812]" />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ECC37A] border-2 border-[#140207] -mt-1" />
                  </div>

                  {/* SVG Team Wheel */}
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full drop-shadow-2xl"
                    style={{
                      transform: `rotate(${teamWheelRotation}deg)`,
                      transition: isSpinning
                        ? 'transform 5.0s cubic-bezier(0.1, 0.82, 0.2, 1)'
                        : 'none'
                    }}
                  >
                    <circle cx="200" cy="200" r="196" fill="#140207" stroke="#ECC37A" strokeWidth="6" />
                    <circle cx="200" cy="200" r="189" fill="none" stroke="#2A0812" strokeWidth="4" />

                    {totalTeamSlices === 1 ? (
                      <circle cx="200" cy="200" r="185" fill={TEAM_SLICE_PALETTE[0].bg} />
                    ) : (
                      teams.map((t, idx) => {
                        const startAngle = idx * teamSliceAngle;
                        const endAngle = (idx + 1) * teamSliceAngle;
                        const path = createSlicePath(200, 200, 185, startAngle, endAngle);
                        const palette = TEAM_SLICE_PALETTE[idx % TEAM_SLICE_PALETTE.length];
                        const midAngle = startAngle + teamSliceAngle / 2;
                        const textCoord = polarToCartesian(200, 200, 126, midAngle);

                        return (
                          <g key={t.id}>
                            <path
                              d={path}
                              fill={palette.bg}
                              stroke="#ECC37A"
                              strokeWidth="1.2"
                              strokeOpacity="0.6"
                            />
                            <g transform={`translate(${textCoord.x}, ${textCoord.y}) rotate(${midAngle + 90})`}>
                              <text
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={palette.text}
                                fontSize={totalTeamSlices > 8 ? '8' : totalTeamSlices > 5 ? '9' : '11'}
                                fontWeight="800"
                                fontFamily="sans-serif"
                              >
                                {t.name.length > 11 ? t.name.slice(0, 10) + '..' : t.name}
                              </text>
                              <text
                                y="11"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={palette.accent}
                                fontSize="7.5"
                                fontWeight="700"
                                fontFamily="monospace"
                              >
                                Rs {t.cash}L
                              </text>
                            </g>
                          </g>
                        );
                      })
                    )}

                    {/* Center Hub */}
                    <circle cx="200" cy="200" r="40" fill="#1C050B" stroke="#ECC37A" strokeWidth="3" />
                    <circle cx="200" cy="200" r="32" fill="#1E3A8A" stroke="#FFF2CC" strokeWidth="1.5" />
                    <text
                      x="200"
                      y="196"
                      textAnchor="middle"
                      fill="#93C5FD"
                      fontSize="8"
                      fontWeight="900"
                      fontFamily="monospace"
                      letterSpacing="1px"
                    >
                      PAYER
                    </text>
                    <text
                      x="200"
                      y="207"
                      textAnchor="middle"
                      fill="#FFF"
                      fontSize="7"
                      fontWeight="700"
                    >
                      TEAM
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {spinError && (
              <div className="p-3 rounded-xl bg-[#3F0A12] border border-[#F87171] text-[#FECACA] text-xs font-mono flex items-start gap-2 max-w-xl mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#F87171] mt-0.5" />
                <span>{spinError}</span>
              </div>
            )}

            {/* IN-SPIN STATUS BANNER */}
            {isSpinning && (
              <div className="p-4 rounded-2xl bg-[#0E0105] border border-[#ECC37A]/30 text-center space-y-1.5 max-w-md mx-auto">
                <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#ECC37A]" />
                <h4 className="text-sm font-bold font-serif text-[#F8EEE1]">
                  Both Wheels Spinning Live...
                </h4>
                <p className="text-xs font-mono text-[#F1CA7E]/70">
                  Selecting target property &amp; payer team randomly.
                </p>
              </div>
            )}

            {/* SLEEK POPUP DIALOG OF TEAM NAME AND PROPERTY */}
            <AnimatePresence>
              {outcome && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md bg-[#1C050B] border-2 border-[#ECC37A] rounded-2xl shadow-2xl p-6 text-center space-y-4"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#701020] border border-[#F1CA7E]/40 text-[#F1CA7E] text-[11px] font-mono font-bold uppercase tracking-wider">
                      Wheel Outcome
                    </div>

                    {/* TEAM NAME (WHO WAS SPUN) */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#F1CA7E]/70 font-semibold block">
                        Spun Team (Payer)
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
                        {outcome.teamName}
                      </h2>
                      <span className="text-xs font-mono text-[#F1CA7E] font-bold">
                        Cash: Rs {outcome.spinnerNewCash}L
                      </span>
                    </div>

                    <div className="w-12 h-0.5 bg-[#ECC37A]/30 mx-auto" />

                    {/* LANDED PROPERTY */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#F1CA7E]/70 font-semibold block">
                        Landed On Property
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#ECC37A] leading-tight">
                        #{outcome.propertyId} {outcome.propertyName}
                      </h3>
                      <span className="text-xs font-mono text-[#F8EEE1]/70 block">
                        Owner: <strong className="text-white">{outcome.ownerTeamName || 'Unowned / State Land'}</strong>
                      </span>
                    </div>

                    {/* SETTLEMENT BADGE */}
                    <div className={`p-3 rounded-xl border text-xs font-mono font-bold ${
                      outcome.status === 'PAID_RENT'
                        ? 'bg-[#3F0A12] border-[#F87171] text-[#FECACA]'
                        : outcome.status === 'OWN_PROPERTY'
                        ? 'bg-[#0E2E1D] border-[#22C55E] text-[#86EFAC]'
                        : 'bg-[#151D2A] border-[#60A5FA] text-[#BFDBFE]'
                    }`}>
                      {outcome.status === 'PAID_RENT' ? (
                        <div>
                          <div className="text-sm font-black text-[#F87171]">-Rs {outcome.rentAmount} Lakh Rent Paid</div>
                          <div className="text-[11px] font-normal text-white/80 mt-0.5">
                            Paid to {outcome.ownerTeamName}
                          </div>
                        </div>
                      ) : outcome.status === 'OWN_PROPERTY' ? (
                        <div>
                          <div className="text-sm font-black text-[#4ADE80]">Rs 0 Rent (Own Property)</div>
                          <div className="text-[11px] font-normal text-white/80 mt-0.5">
                            Safe on own territory
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-black text-[#60A5FA]">Rs 0 Rent (Unclaimed)</div>
                          <div className="text-[11px] font-normal text-white/80 mt-0.5">
                            Unclaimed public territory
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS IN POPUP */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setOutcome(null)}
                        className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#2A0812] hover:bg-[#3F0A1B] text-[#F8EEE1] border border-[#ECC37A]/40 transition-colors cursor-pointer"
                      >
                        View Wheels
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOutcome(null);
                          handleStartSpin();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-[#052E16] shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Spin Next</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM ACTIONS BAR */}
          <div className="p-4 sm:p-5 border-t border-[#ECC37A]/25 bg-[#1C050B] flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-[#F1CA7E]/80 hidden sm:inline">
              Click &quot;Spin Dual Wheel&quot; to execute random property and team spin.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSpinning}
                onClick={onClose}
                className="flex-1 sm:flex-initial py-3 px-5 rounded-xl font-bold text-xs bg-[#2A0812] hover:bg-[#3F0A1B] text-[#F8EEE1] border border-[#ECC37A]/40 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isSpinning}
                onClick={handleStartSpin}
                className="flex-1 sm:flex-initial py-3 px-7 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-[#052E16] shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-[#052E16]" />
                    <span>Wheels Spinning...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4 text-[#052E16]" />
                    <span>Spin Dual Wheel (Property + Team)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
