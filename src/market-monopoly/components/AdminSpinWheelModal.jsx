import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Trophy, AlertCircle, CheckCircle2, Coins, ArrowDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { fetchMonopolyStore, invalidateAdminMonopolyCache } from '../lib/monopolyAdminService.js';
import { KARACHI_PROPERTIES, computePropertyRent } from '../data/monopolyData.js';

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

const SLICE_PALETTE = [
  { bg: '#701020', text: '#F8EEE1' },
  { bg: '#2A1215', text: '#F1CA7E' },
  { bg: '#8B1E32', text: '#FFF8F6' },
  { bg: '#47131C', text: '#E8DCC6' },
  { bg: '#5E1B21', text: '#F1CA7E' }
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
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch {}
}

function playFinishSound(isWin = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = isWin ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
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
  initialTeam,
  onStoreUpdated
}) {
  const [currentTeam, setCurrentTeam] = useState(initialTeam);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [spinError, setSpinError] = useState('');
  const tickIntervalRef = useRef(null);

  useEffect(() => {
    setCurrentTeam(initialTeam);
    setOutcome(null);
    setSpinError('');
  }, [initialTeam]);

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  if (!isOpen || !store || !currentTeam) return null;

  const properties = store.properties || KARACHI_PROPERTIES;
  const totalSlices = properties.length || 25;
  const sliceAngle = 360 / totalSlices;
  const activeWave = Number(store.currentWheelRound || 1);

  const waveSpins = store.wheelSpinsByRound?.[activeWave] || {};
  const unspunTeams = (store.teams || []).filter(
    (t) => !waveSpins[t.id] && String(t.id) !== String(currentTeam.id)
  );

  const handleStartSpin = async () => {
    if (isSpinning) return;
    setSpinError('');
    setOutcome(null);
    setIsSpinning(true);

    try {
      // 1. Execute spin on Supabase backend
      const { data: res, error } = await supabase.rpc('monopoly_execute_wheel_spin', {
        p_team_id: String(currentTeam.id),
        p_property_id: 0
      });

      if (error) throw error;
      if (!res || !res.ok) {
        throw new Error(res?.error || 'Wheel spin rejected by server.');
      }

      const landedPropId = Number(res.propertyId);
      const winningIndex = properties.findIndex((p) => Number(p.id) === landedPropId);
      const safeIndex = winningIndex !== -1 ? winningIndex : 0;

      // 2. Compute exact rotation physics to point at winning slice
      const sliceCenter = (safeIndex + 0.5) * sliceAngle;
      const desiredMod = (360 - sliceCenter + 360) % 360;
      const currentMod = ((wheelRotation % 360) + 360) % 360;
      let deltaAngle = desiredMod - currentMod;
      if (deltaAngle <= 0) deltaAngle += 360;

      const nextRotation = wheelRotation + 360 * 5 + deltaAngle;
      setWheelRotation(nextRotation);

      // 3. Audio tick feedback during deceleration
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      let tickCount = 0;
      tickIntervalRef.current = setInterval(() => {
        tickCount += 1;
        playTickSound();
        if (tickCount >= 28) {
          clearInterval(tickIntervalRef.current);
        }
      }, 150);

      // 4. Reveal result after 4.5s deceleration animation
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
      }, 4500);
    } catch (err) {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      setIsSpinning(false);
      setSpinError(err.message || 'Execution error during wheel spin.');
    }
  };

  const handleSelectNextTeam = (next) => {
    setCurrentTeam(next);
    setOutcome(null);
    setSpinError('');
  };

  const landedProp = outcome
    ? properties.find((p) => Number(p.id) === Number(outcome.propertyId))
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => !isSpinning && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#140207] border-2 border-[#ECC37A] rounded-2xl shadow-2xl overflow-hidden text-[#F8EEE1] flex flex-col lg:flex-row max-h-[94vh]"
        >
          {/* LEFT: WHEEL CANVAS & SPINNER ARENA */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col items-center justify-between gap-4 border-b lg:border-b-0 lg:border-r border-[#ECC37A]/25 overflow-y-auto">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between gap-2 border-b border-[#ECC37A]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#701020] text-[#F1CA7E] border border-[#F1CA7E]/40">
                  Wave #{activeWave}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-[#F8EEE1] leading-tight">
                    Karachi Property Wheel
                  </h3>
                  <p className="text-[11px] font-mono text-[#F1CA7E]/80">
                    Live Admin Spin Wheel for {currentTeam.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSpinning}
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#2A0812] hover:bg-[#701020] text-[#F8EEE1] flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                title="Close Wheel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SVG Interactive Wheel Component */}
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] my-2 select-none">
              {/* TOP POINTER */}
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-xl">
                <div className="w-4 h-6 bg-gradient-to-b from-[#FFF2CC] to-[#ECC37A] clip-polygon border border-[#47131C] shadow-lg flex items-center justify-center">
                  <ArrowDown className="w-3.5 h-3.5 text-[#2A0812]" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ECC37A] border-2 border-[#140207] -mt-1" />
              </div>

              {/* WHEEL SVG */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full drop-shadow-2xl"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning
                    ? 'transform 4.5s cubic-bezier(0.12, 0.8, 0.18, 1)'
                    : 'none'
                }}
              >
                {/* Outer Ring Rim */}
                <circle cx="200" cy="200" r="196" fill="#140207" stroke="#ECC37A" strokeWidth="6" />
                <circle cx="200" cy="200" r="189" fill="none" stroke="#701020" strokeWidth="4" />

                {/* 25 Property Slices */}
                {properties.map((prop, idx) => {
                  const startAngle = idx * sliceAngle;
                  const endAngle = (idx + 1) * sliceAngle;
                  const path = createSlicePath(200, 200, 185, startAngle, endAngle);
                  const palette = SLICE_PALETTE[idx % SLICE_PALETTE.length];
                  const midAngle = startAngle + sliceAngle / 2;
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
                      <g
                        transform={`translate(${textCoord.x}, ${textCoord.y}) rotate(${midAngle + 90})`}
                      >
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={palette.text}
                          fontSize="7"
                          fontWeight="700"
                          fontFamily="sans-serif"
                          letterSpacing="0.2px"
                        >
                          #{prop.id} {shortName.length > 12 ? shortName.slice(0, 10) + '..' : shortName}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Center Hub */}
                <circle cx="200" cy="200" r="42" fill="#1C050B" stroke="#ECC37A" strokeWidth="4" />
                <circle cx="200" cy="200" r="34" fill="#701020" stroke="#FFF2CC" strokeWidth="1.5" />
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
                  fontFamily="sans-serif"
                >
                  WAVE #{activeWave}
                </text>
              </svg>
            </div>

            {/* Spin Trigger Button */}
            <div className="w-full flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleStartSpin}
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-[#052E16] shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-[#052E16]" />
                    <span>Wheel is Spinning...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4 text-[#052E16]" />
                    <span>Spin Wheel for {currentTeam.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: OUTCOME BREAKDOWN & NEXT TEAMS */}
          <div className="w-full lg:w-96 p-5 sm:p-6 bg-[#0E0105] flex flex-col justify-between gap-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Active Spinner Team Banner */}
              <div className="p-3.5 rounded-xl bg-[#1C050B] border border-[#ECC37A]/30 space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F1CA7E]">
                  Current Spinner
                </span>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#F8EEE1] font-serif">
                    {currentTeam.name}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#2A0812] border border-[#ECC37A]/40 text-xs font-mono text-[#F1CA7E] font-bold">
                    Rs {currentTeam.cash}L
                  </span>
                </div>
              </div>

              {/* Error Message if any */}
              {spinError && (
                <div className="p-3 rounded-lg bg-[#3F0A12] border border-[#F87171] text-[#FECACA] text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F87171] mt-0.5" />
                  <span>{spinError}</span>
                </div>
              )}

              {/* Live Outcome Banner */}
              {outcome ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-2 space-y-3 ${
                    outcome.status === 'PAID_RENT'
                      ? 'bg-[#29070D] border-[#F87171]'
                      : outcome.status === 'OWN_PROPERTY'
                      ? 'bg-[#0B2516] border-[#4ADE80]'
                      : 'bg-[#151D2A] border-[#60A5FA]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70">
                      Spin Result
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        outcome.status === 'PAID_RENT'
                          ? 'bg-[#DC2626] text-white'
                          : outcome.status === 'OWN_PROPERTY'
                          ? 'bg-[#16A34A] text-white'
                          : 'bg-[#2563EB] text-white'
                      }`}
                    >
                      {outcome.status === 'PAID_RENT'
                        ? 'Rent Deducted'
                        : outcome.status === 'OWN_PROPERTY'
                        ? 'Own Property'
                        : 'Unclaimed Territory'}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-white">
                      #{outcome.propertyId} {outcome.propertyName}
                    </h5>
                    <p className="text-xs text-white/80 font-mono mt-0.5">
                      {landedProp?.category || 'Karachi Sector'} | Zone {landedProp?.zone || 'Prime'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/70">Owner:</span>
                      <strong className="text-white">
                        {outcome.ownerTeamName || 'Unowned / State Property'}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Rent Amount:</span>
                      <strong
                        className={
                          outcome.status === 'PAID_RENT' ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'
                        }
                      >
                        {outcome.status === 'PAID_RENT'
                          ? `-Rs ${outcome.rentAmount} Lakh`
                          : 'Rs 0 Lakh'}
                      </strong>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-white/10">
                      <span className="text-white/70">New Cash:</span>
                      <strong className="text-[#FDE047]">
                        Rs {outcome.spinnerNewCash} Lakh
                      </strong>
                    </div>
                  </div>
                </motion.div>
              ) : isSpinning ? (
                <div className="p-6 rounded-xl bg-[#1C050B] border border-[#ECC37A]/20 text-center space-y-2">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#ECC37A]" />
                  <p className="text-xs font-mono text-[#F1CA7E]">
                    Calculating outcome and broadcasting to classroom projector...
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#1C050B]/60 border border-[#ECC37A]/20 text-center text-xs font-mono text-[#F1CA7E]/70">
                  Click the green button to trigger the wheel spin. Outcome will display here and broadcast live on the classroom projector screen.
                </div>
              )}

              {/* Waiting Teams Queue */}
              {unspunTeams.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ECC37A]/20">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F1CA7E] block">
                    Next Eligible Teams ({unspunTeams.length} Remaining):
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {unspunTeams.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={isSpinning}
                        onClick={() => handleSelectNextTeam(t)}
                        className="w-full text-left p-2 rounded-lg bg-[#1C050B] hover:bg-[#2A0812] border border-[#ECC37A]/20 hover:border-[#ECC37A]/60 flex items-center justify-between text-xs transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <span className="font-bold text-[#F8EEE1]">{t.name}</span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[#F1CA7E]">
                          <span>Rs {t.cash}L</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#ECC37A]/20">
              <button
                type="button"
                disabled={isSpinning}
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#2A0812] hover:bg-[#3F0A1B] text-[#F8EEE1] border border-[#ECC37A]/40 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Done / Close
              </button>

              {outcome && unspunTeams.length > 0 && (
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleSelectNextTeam(unspunTeams[0])}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#ECC37A] hover:bg-[#F1CA7E] text-[#140207] transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Spin Next Team</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
