'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Calc67Page() {
  return (
    <div className="w-full h-screen bg-[#0c1422] flex flex-col">
      <div className="bg-[#172033] p-4 flex items-center shadow-md z-10">
        <Link href="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <iframe 
        src="/calc67_static/index.html" 
        className="w-full flex-grow border-none"
        title="Calc67 Game"
      />
    </div>
  );
}
