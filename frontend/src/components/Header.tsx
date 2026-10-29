import Image from 'next/image';
import React from 'react';
import banner from '../assets/banner.png';

function Header() {
  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full px-6">
      <div className="flex flex-col lg:flex-row items-center mt-16 md:mt-24 gap-12 lg:gap-32">
        <div className="flex flex-col gap-8 flex-1">
          <h1 className="font-black text-5xl md:text-6xl text-foreground leading-[1.1] tracking-tight">
            Empower Your Support Experience with{' '}
            <span className="text-primary italic">SupportSafe</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed font-medium">
            At <span className="text-primary/80 font-bold">SupportSafe</span>, we&apos;re dedicated to ensuring every issue gets
            the attention it deserves. Securely report incidents, monitor
            real-time updates, and join a resilient community.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-4">
            <button className="px-10 py-4 bg-primary text-primary-foreground text-xl rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all duration-300 font-bold border-2 border-primary">
              Register
            </button>
            <button className="px-10 py-4 text-primary text-xl rounded-2xl border-2 border-primary hover:bg-primary/5 active:scale-95 transition-all duration-300 font-bold">
              Report Now
            </button>
          </div>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 border-background bg-secondary flex items-center justify-center text-xs font-bold text-primary`}>
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-foreground/50 text-sm font-semibold">Joined by 2,000+ support seekers</p>
          </div>
        </div>
        <div className="relative group flex-1 flex justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-500" />
          <Image
            src={banner}
            width={600}
            height={600}
            alt="banner"
            className="relative z-10 scale-x-[-1] drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
