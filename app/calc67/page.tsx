'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RotateCcw, 
  ChevronRight, 
  Trophy, 
  Share2, 
  History, 
  Settings, 
  Delete,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

// Constants
const TARGET_NUMBER = 67;
const APP_ID = "calc67-7c586";

interface OperationStep {
  op: string;
  num: number;
  prevResult: number;
  result: number;
}

interface LeaderboardEntry {
  id: string;
  displayName: string;
  operations: number;
  diversityScore: number;
}

export default function Calc67Page() {
  // State
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyStartingNumber, setDailyStartingNumber] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [currentOperator, setCurrentOperator] = useState<string | null>(null);
  const [history, setHistory] = useState<OperationStep[]>([]);
  const [hasSolvedToday, setHasSolvedToday] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [message, setMessage] = useState<string>("Enter a number and an operation.");
  const [isCoping, setIsCoping] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [isTagLocked, setIsTagLocked] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  const todayKey = new Date().toISOString().split('T')[0];

  // Utility: Diversity Score
  const calculateDiversity = useCallback((steps: OperationStep[]) => {
    return new Set(steps.map(s => s.op)).size;
  }, []);

  // Auth & Data Loading
  useEffect(() => {
    const init = async () => {
      if (!auth || !db) {
        setLoading(false);
        return;
      }
      try {
        const userCredential = await signInAnonymously(auth);
        setUserId(userCredential.user.uid);
        
        // Load Profile
        const profileRef = doc(db, `artifacts/${APP_ID}/users/${userCredential.user.uid}/profile`, 'data');
        const profileDoc = await getDoc(profileRef);
        
        let initialDisplayName = "";
        if (profileDoc.exists() && profileDoc.data().displayName) {
          initialDisplayName = profileDoc.data().displayName;
        } else {
          // Check local storage for legacy/cached tag
          initialDisplayName = localStorage.getItem('calc67-tag') || "";
        }
        setUserDisplayName(initialDisplayName);

        // Load Daily Challenge
        const dailyRef = doc(db, `artifacts/${APP_ID}/public/data/daily_numbers`, todayKey);
        const dailyDoc = await getDoc(dailyRef);
        
        let startingNum = 0;
        if (dailyDoc.exists()) {
          startingNum = dailyDoc.data().number;
        } else {
          // Generate seeded random starting number
          const seed = parseInt(todayKey.replace(/-/g, '').substring(4));
          const seededNum = (seed * 9301 + 49297) % 233280;
          startingNum = Math.floor((seededNum / 233280.0) * (10000 - 10 + 1)) + 10;
          await setDoc(dailyRef, { number: startingNum, date: todayKey });
        }
        setDailyStartingNumber(startingNum);
        setCurrentResult(startingNum);

        // Load Solve Status & Tag Lock
        const statusRef = doc(db, `artifacts/${APP_ID}/users/${userCredential.user.uid}/daily_challenges`, todayKey);
        const statusDoc = await getDoc(statusRef);
        
        if (statusDoc.exists()) {
           if (statusDoc.data().solved) {
             setHasSolvedToday(true);
             const solvedHistory = JSON.parse(statusDoc.data().history);
             setHistory(solvedHistory);
             setCurrentResult(statusDoc.data().result);
           }
           if (statusDoc.data().tagLocked) {
             setIsTagLocked(true);
             setUserDisplayName(statusDoc.data().displayName);
           }
        }

        // Determine if we should show reveal onboarding
        // Show if not solved AND tag not locked for today
        if (!statusDoc.exists() || !statusDoc.data().tagLocked) {
          setShowReveal(true);
        }

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [todayKey]);

  // Load Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!db) return;
    try {
      const scoresRef = collection(db, 'artifacts', APP_ID, 'leaderboard_scores', todayKey, 'scores');
      const q = query(
        scoresRef, 
        orderBy('diversityScore', 'desc'),
        orderBy('operations', 'asc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry));
      setLeaderboard(data);
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
  }, [todayKey]);

  useEffect(() => {
    if (showLeaderboardModal) fetchLeaderboard();
  }, [showLeaderboardModal, fetchLeaderboard]);

  // Game Logic
  const handleInput = (val: string) => {
    if (hasSolvedToday) return;

    if (!isNaN(parseFloat(val)) || val === '.') {
      if (currentInput === '' && val === '.') {
        setCurrentInput('0.');
      } else if (currentInput.includes('.') && val === '.') {
        return;
      } else {
        setCurrentInput(prev => prev === '0' && val !== '.' ? val : prev + val);
      }
    } else if (['+', '*', '/'].includes(val)) {
      setCurrentOperator(val);
      setMessage(`Operator ${val} selected. Ready to APPLY.`);
    } else if (val === 'DEL') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (val === 'AC') {
      setCurrentResult(dailyStartingNumber);
      setCurrentInput('');
      setCurrentOperator(null);
      setHistory([]);
      setMessage("Reset! Choose your first move.");
    }
  };

  const executeStep = async () => {
    if (hasSolvedToday || !currentOperator || currentInput === '' || !db) return;
    
    const operand2 = parseFloat(currentInput);
    if (isNaN(operand2)) return;

    // Anti-cheat
    if (currentOperator === '/' && currentResult === operand2) {
      setMessage("Cheat Detected: Cannot divide by self!");
      setCurrentInput('');
      return;
    }

    let nextResult = 0;
    if (currentOperator === '+') nextResult = currentResult + operand2;
    if (currentOperator === '*') nextResult = currentResult * operand2;
    if (currentOperator === '/') {
      if (operand2 === 0) {
        setMessage("Error: Division by zero!");
        return;
      }
      nextResult = currentResult / operand2;
    }

    if (currentOperator === '*' && Math.abs(operand2 - 1) < 0.0001 && Math.abs(nextResult - TARGET_NUMBER) < 0.0001) {
      setMessage("Cheat Detected: Trivial solution blocked.");
      return;
    }

    const newStep = {
      op: currentOperator,
      num: operand2,
      prevResult: currentResult,
      result: nextResult
    };

    const newHistory = [...history, newStep];
    setHistory(newHistory);
    setCurrentResult(nextResult);
    setCurrentInput('');
    setCurrentOperator(null);
    
    // Check Goal
    if (Math.abs(nextResult - TARGET_NUMBER) < 0.0001) {
      setHasSolvedToday(true);
      const diversity = calculateDiversity(newHistory);
      
      // Save
      if (userId) {
        const statusRef = doc(db, `artifacts/${APP_ID}/users/${userId}/daily_challenges`, todayKey);
        const fullExpr = `${dailyStartingNumber} ${newHistory.map(h => `${h.op} ${formatNum(h.num)}`).join(' ')} = ${formatNum(nextResult)}`;
        
        await setDoc(statusRef, {
          solved: true,
          date: todayKey,
          operations: newHistory.length,
          diversityScore: diversity,
          result: nextResult,
          history: JSON.stringify(newHistory),
          timestamp: Timestamp.now(),
          displayName: userDisplayName,
          expression: fullExpr
        }, { merge: true });

        const lbRef = doc(db, 'artifacts', APP_ID, 'leaderboard_scores', todayKey, 'scores', userId);
        await setDoc(lbRef, {
          userId,
          displayName: userDisplayName,
          operations: newHistory.length,
          diversityScore: diversity,
          timestamp: Timestamp.now()
        }, { merge: true });
        
        setShowLeaderboardModal(true);
      }
    } else {
      setMessage(`Step ${newHistory.length} applied. Current: ${formatNum(nextResult)}`);
    }
  };

  const formatNum = (n: number) => Number(n.toFixed(4)).toString();

  const shareResults = () => {
    if (!hasSolvedToday) return;
    const diversity = calculateDiversity(history);
    const emojis = history.map(h => h.op === '+' ? '🟢' : h.op === '*' ? '🟡' : '🔵').join(' ');
    
    const text = `🔢 Calc67 Daily: ${todayKey}\nTag: ${userDisplayName}\nStart: ${dailyStartingNumber}\nSteps: ${history.length} (Diversity: ${diversity})\n\n${emojis}\n\n#Calc67 #MathPuzzle\nhttps://zedf.co.uk/calc67`;
    
    navigator.clipboard.writeText(text);
    setIsCoping(true);
    setTimeout(() => setIsCoping(false), 2000);
  };

  const updateTag = async (newTag: string) => {
    const clean = newTag.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    if (clean.length !== 2) return;
    
    setUserDisplayName(clean);
    localStorage.setItem('calc67-tag', clean);
    
    if (userId && db) {
      const profileRef = doc(db, `artifacts/${APP_ID}/users/${userId}/profile`, 'data');
      await setDoc(profileRef, { displayName: clean }, { merge: true });
    }
  };

  const lockTagAndStart = async () => {
    if (userDisplayName.length !== 2) {
        setMessage("⚠️ Tag must be exactly 2 letters!");
        return;
    }
    
    setIsTagLocked(true);
    setShowReveal(false);
    
    if (userId && db) {
      const statusRef = doc(db, `artifacts/${APP_ID}/users/${userId}/daily_challenges`, todayKey);
      await setDoc(statusRef, { 
        tagLocked: true, 
        displayName: userDisplayName 
      }, { merge: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-cyan-400 font-medium animate-pulse">Loading daily challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pt-safe pb-safe selection:text-white pb-10">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all active:scale-95 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <div 
          onClick={() => !isTagLocked && setShowTagModal(true)}
          className={`bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 transition-all active:scale-95 ${isTagLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}`}
        >
          <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Tag</span>
          <span className="text-cyan-400 font-mono font-bold">{userDisplayName || '??'}</span>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header Section */}
        <section className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
          >
            Calc67
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-white/40 font-medium"
          >
            <span className="text-sm">TARGET</span>
            <div className="w-8 h-px bg-white/10" />
            <span className="text-2xl font-mono font-bold text-cyan-400">{TARGET_NUMBER}</span>
          </motion.div>
        </section>

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {!hasSolvedToday ? (
            <motion.div 
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Display Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <History 
                      className="w-5 h-5 text-white/20 hover:text-cyan-400 cursor-pointer transition-colors"
                      onClick={() => setShowHistoryModal(true)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Current Result</p>
                    <div className="text-6xl font-mono font-bold text-white tracking-tighter truncate">
                      {formatNum(currentResult)}
                    </div>
                  </div>

                  <div className="mt-8 flex items-end justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all ${currentOperator ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-white/5 text-white/20'}`}>
                        {currentOperator || '?'}
                      </div>
                      <div className="text-4xl font-mono font-bold text-white/50">
                        {currentInput || '0'}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">Total Steps</p>
                      <span className="text-cyan-400 font-mono font-bold text-xl">{history.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Box */}
              <div className="text-center h-4">
                <p className="text-white/40 text-sm font-medium">{message}</p>
              </div>

              {/* Advanced Calculator UI */}
              <div className="grid grid-cols-4 gap-3">
                {/* Operations Column */}
                <div className="col-span-4 grid grid-cols-4 gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                  <button onClick={() => handleInput('AC')} className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all active:scale-90">AC</button>
                  <button onClick={() => handleInput('DEL')} className="p-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl flex items-center justify-center transition-all active:scale-90"><Delete className="w-5 h-5"/></button>
                  <button onClick={() => handleInput('+')} className={`p-4 rounded-xl font-bold text-xl transition-all active:scale-95 ${currentOperator === '+' ? 'bg-cyan-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}>+</button>
                  <button onClick={() => handleInput('*')} className={`p-4 rounded-xl font-bold text-xl transition-all active:scale-95 ${currentOperator === '*' ? 'bg-cyan-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}>×</button>
                </div>

                {/* Keypad */}
                {[7, 8, 9, '/'].map((n) => (
                  <button 
                    key={n}
                    onClick={() => handleInput(n.toString())}
                    className={`p-6 rounded-2xl font-mono font-bold text-2xl transition-all active:scale-90 ${typeof n === 'string' ? (currentOperator === n ? 'bg-cyan-500 text-black' : 'bg-white/5 hover:bg-white/10 text-cyan-400') : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {n === '/' ? '÷' : n}
                  </button>
                ))}
                {[4, 5, 6, '.'].map((n) => (
                  <button 
                    key={n}
                    onClick={() => handleInput(n.toString())}
                    className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl font-mono font-bold text-2xl transition-all active:scale-90"
                  >
                    {n}
                  </button>
                ))}
                <div className="col-span-3 grid grid-cols-3 gap-3">
                   {[1, 2, 3].map((n) => (
                    <button 
                      key={n}
                      onClick={() => handleInput(n.toString())}
                      className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl font-mono font-bold text-2xl transition-all active:scale-90"
                    >
                      {n}
                    </button>
                  ))}
                  <button 
                    onClick={() => handleInput('0')}
                    className="col-span-2 p-6 bg-white/5 hover:bg-white/10 rounded-2xl font-mono font-bold text-2xl transition-all active:scale-90"
                  >
                    0
                  </button>
                  <button 
                    onClick={() => handleInput('.')}
                    className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl font-mono font-bold text-2xl transition-all active:scale-90 md:hidden"
                  >
                    .
                  </button>
                </div>

                <button 
                  onClick={executeStep}
                  className="p-4 bg-cyan-500 hover:bg-cyan-400 text-[#020617] rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-500/20"
                >
                  <ChevronRight className="w-6 h-6" />
                  Apply
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="solved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-cyan-500/20 to-transparent border border-cyan-500/30 rounded-3xl p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                  <Trophy className="w-10 h-10 text-[#020617]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black italic tracking-tighter">SUCCESS!</h2>
                  <p className="text-white/60 font-medium">You reached 67 today.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Steps</p>
                    <p className="text-2xl font-mono font-bold">{history.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Diversity</p>
                    <p className="text-2xl font-mono font-bold text-cyan-400">{calculateDiversity(history)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={shareResults}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isCoping ? "Copied Score!" : "Share Results"}
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowLeaderboardModal(true)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all active:scale-95"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <section className="bg-white/5 rounded-3xl p-6 border border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl">
                 <RotateCcw className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Starting Point</p>
                <p className="text-lg font-mono font-bold">{dailyStartingNumber}</p>
              </div>
           </div>
           <button 
            onClick={() => setShowHistoryModal(true)}
           className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-cyan-400 transition-colors">
              Log
           </button>
        </section>
      </main>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  Operation Log
                </h3>
                <X className="w-6 h-6 text-white/20 hover:text-white cursor-pointer" onClick={() => setShowHistoryModal(false)} />
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                <div className="flex items-center gap-3 text-white/40 text-sm">
                  <span className="w-6 text-center">#</span>
                  <span>Calculation</span>
                  <span className="ml-auto">Result</span>
                </div>
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                   <span className="w-6 text-center font-mono text-cyan-400/50">0</span>
                   <span className="font-mono text-white/40 italic">Initial Value</span>
                   <span className="ml-auto font-mono font-bold">{dailyStartingNumber}</span>
                </div>

                {history.map((step, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 group"
                  >
                    <span className="w-6 text-center font-mono text-white/20">{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-500 font-bold">{step.op}</span>
                      <span className="font-mono">{formatNum(step.num)}</span>
                    </div>
                    <span className="ml-auto font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">{formatNum(step.result)}</span>
                  </motion.div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-white/20 font-medium">No steps yet.</p>
                    <p className="text-[10px] uppercase font-bold text-white/10 tracking-widest">Empty History</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5">
                <button 
                  disabled={!hasSolvedToday}
                  onClick={shareResults}
                  className="w-full py-4 bg-cyan-500 disabled:bg-white/5 disabled:text-white/20 text-[#020617] font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isCoping ? "Copied!" : "Copy Results"}
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboardModal(false)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-400">
                  <Trophy className="w-5 h-5" />
                  Daily Champions
                </h3>
                <X className="w-6 h-6 text-white/20 hover:text-white cursor-pointer" onClick={() => setShowLeaderboardModal(false)} />
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                 <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Scoring System</p>
                    <p className="text-xs text-white/60">Sorted by <b>Diversity</b> then <b>Steps</b>.</p>
                 </div>

                 <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <div 
                        key={entry.id} 
                        className={`flex items-center gap-4 p-3 rounded-2xl border ${entry.id === userId ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 border-white/5'}`}
                      >
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-amber-600 text-black' : 'text-white/20'}`}>
                            {i + 1}
                         </div>
                         <div className="flex-grow">
                           <p className="font-mono font-bold text-cyan-400">{entry.displayName}</p>
                           <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Player</p>
                         </div>
                         <div className="text-right">
                            <div className="flex items-center gap-3">
                               <div className="text-center">
                                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Div</p>
                                  <p className="font-mono font-bold">{entry.diversityScore}</p>
                               </div>
                               <div className="text-center">
                                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Stp</p>
                                  <p className="font-mono font-bold">{entry.operations}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                    {leaderboard.length === 0 && (
                      <div className="text-center py-10 space-y-2">
                        <p className="text-white/20 font-medium">Be the first to solve!</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                 <button 
                  onClick={shareResults}
                  className="flex-grow py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                 >
                    {isCoping ? "Copied!" : "Share"}
                    <Share2 className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => !isTagLocked && setShowTagModal(true)}
                   className={`flex-grow py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isTagLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     Edit Tag
                     <Settings className="w-4 h-4" />
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Reveal Onboarding Modal */}
      <AnimatePresence>
        {showReveal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 bg-[#020617] backdrop-blur-xl"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="relative w-full max-w-md text-center space-y-12"
            >
               <div className="space-y-4">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-cyan-400 font-bold uppercase tracking-[0.4em] text-xs"
                  >
                    Challenge Revealed
                  </motion.p>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-7xl font-black italic tracking-tighter"
                  >
                    DAY {todayKey.split('-').slice(1).join('/')}
                  </motion.h2>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6"
                  >
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Target</p>
                    <p className="text-5xl font-mono font-black text-white">{TARGET_NUMBER}</p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-cyan-500/10 border border-cyan-500/30 rounded-3xl p-6"
                   >
                    <p className="text-[10px] font-bold text-cyan-400/40 uppercase tracking-widest mb-2">Start At</p>
                    <p className="text-5xl font-mono font-black text-cyan-400">{dailyStartingNumber}</p>
                  </motion.div>
               </div>

               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="space-y-6"
               >
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Identify Yourself</p>
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <input 
                            key={i}
                            type="text"
                            maxLength={1}
                            autoFocus={i === 0 && !userDisplayName[i]}
                            value={userDisplayName[i] || ''}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                if (/^[A-Z]$/.test(val) || val === '') {
                                    const next = userDisplayName.split('');
                                    next[i] = val;
                                    updateTag(next.join(''));
                                    if (val && i === 0) {
                                        (e.target.nextSibling as HTMLInputElement)?.focus();
                                    }
                                }
                            }}
                            className="w-16 h-20 bg-white/5 border-2 border-white/10 rounded-2xl text-4xl font-mono font-black text-center focus:border-cyan-500 focus:bg-cyan-500/10 transition-all outline-none"
                          />
                        ))}
                    </div>
                  </div>

                  <button 
                    disabled={userDisplayName.length !== 2}
                    onClick={lockTagAndStart}
                    className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-20 disabled:grayscale text-black font-black uppercase tracking-[0.2em] rounded-3xl transition-all active:scale-95 shadow-2xl shadow-cyan-500/40"
                  >
                    Enter Arena
                  </button>
               </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tag Edit Modal */}
      <AnimatePresence>
        {showTagModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               onBlur={() => setShowTagModal(false)}
               onClick={() => setShowTagModal(false)}
               className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
            >
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight">Update Tag</h3>
                  <X className="w-5 h-5 text-white/20 cursor-pointer" onClick={() => setShowTagModal(false)} />
               </div>
               
               <p className="text-sm text-white/40 leading-relaxed">Choose a 2-letter identifier for the leaderboard.</p>

               <div className="flex justify-center gap-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <input 
                      key={i}
                      type="text"
                      maxLength={1}
                      value={userDisplayName[i] || ''}
                      onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (/^[A-Z]$/.test(val) || val === '') {
                              const next = userDisplayName.split('');
                              next[i] = val;
                              updateTag(next.join(''));
                              if (val && i === 0) {
                                  (e.target.nextSibling as HTMLInputElement)?.focus();
                              }
                          }
                      }}
                      className="w-14 h-16 bg-white/5 border border-white/10 rounded-2xl text-3xl font-mono font-bold text-center focus:border-cyan-500 transition-all outline-none"
                    />
                  ))}
               </div>

               <button 
                onClick={() => setShowTagModal(false)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all"
               >
                 Confirm
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
