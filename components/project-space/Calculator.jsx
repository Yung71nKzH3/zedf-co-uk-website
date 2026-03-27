import React, { useState } from 'react';

export const Calculator = () => {
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);

  const handleNum = (num) => {
    if (current === '0' && num !== '.') {
      setCurrent(num);
    } else {
      if (num === '.' && current.includes('.')) return;
      setCurrent(current + num);
    }
  };

  const calculate = (a, b, op) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return '';
    switch (op) {
      case '+': return (numA + numB).toString();
      case '-': return (numA - numB).toString();
      case '×': return (numA * numB).toString();
      case '÷': return numB === 0 ? 'Error' : (numA / numB).toString();
      default: return b;
    }
  };

  const handleOp = (op) => {
    if (current === 'Error') return;
    if (operator && previous && current !== '') {
      const result = calculate(previous, current, operator);
      setPrevious(result);
      setCurrent('');
      setOperator(op);
    } else {
      setPrevious(current || previous);
      setCurrent('');
      setOperator(op);
    }
  };

  const handleEqual = () => {
    if (operator && previous && current) {
      setCurrent(calculate(previous, current, operator));
      setPrevious(null);
      setOperator(null);
    }
  };

  const handleClear = () => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
  };

  const handleDelete = () => {
    if (current === 'Error') {
      handleClear();
      return;
    }
    if (current.length > 1) {
      setCurrent(current.slice(0, -1));
    } else {
      setCurrent('0');
    }
  };

  const btnClass = "p-3 rounded-xl font-display text-lg transition-all active:scale-95 flex items-center justify-center";
  const numClass = `${btnClass} bg-white/5 hover:bg-white/10 text-white`;
  const opClass = `${btnClass} bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20`;
  const actionClass = `${btnClass} bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/20`;

  return (
    <div className="w-full max-w-[280px] mx-auto bg-black/40 p-5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Display */}
      <div className="bg-black/60 rounded-2xl p-4 mb-4 text-right border border-white/5 h-24 flex flex-col justify-end">
        <div className="text-white/40 text-xs font-mono h-4 mb-1">
          {previous} {operator}
        </div>
        <div className="text-3xl text-white font-mono tracking-wider truncate">
          {current || '0'}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={handleClear} className={`${actionClass} col-span-2`}>AC</button>
        <button onClick={handleDelete} className={actionClass}>DEL</button>
        <button onClick={() => handleOp('÷')} className={opClass}>÷</button>

        <button onClick={() => handleNum('7')} className={numClass}>7</button>
        <button onClick={() => handleNum('8')} className={numClass}>8</button>
        <button onClick={() => handleNum('9')} className={numClass}>9</button>
        <button onClick={() => handleOp('×')} className={opClass}>×</button>

        <button onClick={() => handleNum('4')} className={numClass}>4</button>
        <button onClick={() => handleNum('5')} className={numClass}>5</button>
        <button onClick={() => handleNum('6')} className={numClass}>6</button>
        <button onClick={() => handleOp('-')} className={opClass}>-</button>

        <button onClick={() => handleNum('1')} className={numClass}>1</button>
        <button onClick={() => handleNum('2')} className={numClass}>2</button>
        <button onClick={() => handleNum('3')} className={numClass}>3</button>
        <button onClick={() => handleOp('+')} className={opClass}>+</button>

        <button onClick={() => handleNum('0')} className={`${numClass} col-span-2`}>0</button>
        <button onClick={() => handleNum('.')} className={numClass}>.</button>
        <button onClick={handleEqual} className={`${opClass} bg-indigo-500/40 hover:bg-indigo-500/50 text-white`}>=</button>
      </div>
    </div>
  );
};
