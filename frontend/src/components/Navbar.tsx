'use client';
import Link from 'next/link';
import React from 'react';
import { LoginDropdown } from './LoginDropdown';
import { ModeToggle } from './ModeToggle';
import SignOut from './SignOut';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

function Navbar() {
  const pathname = usePathname(); // Get current path
  const { user } = useClerk();

  // Function to check if a link is active
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="w-full h-20 p-4 flex items-center justify-between border-b bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300">
      <Link
        href={'/'}
        className="font-bold text-2xl tracking-tight hover:opacity-80 transition-all duration-200"
      >
        <span className="text-primary">Support</span><span className="text-foreground/80 font-medium">Safe</span>
      </Link>
      <div className="flex items-center justify-center gap-10 font-semibold text-foreground/60">
        <Link
          href="/"
          className={`${isActive('/')
            ? 'text-primary'
            : 'hover:text-primary/80'
            } transition-all duration-200 relative group`}
        >
          Home
          <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
        </Link>
        {!user?.unsafeMetadata.isAdmin && (
          <Link
            href="/create-post"
            className={`${isActive('/create-post')
              ? 'text-primary'
              : 'hover:text-primary/80'
              } transition-all duration-200 relative group`}
          >
            Create Post
            <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${isActive('/create-post') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
          </Link>
        )}
        {(user?.unsafeMetadata as { isAdmin: boolean })?.isAdmin && (
          <Link
            href="/dashboard"
            className={`${isActive('/dashboard')
              ? 'text-primary'
              : 'hover:text-primary/80'
              } transition-all duration-200 relative group`}
          >
            Dashboard
            <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${isActive('/dashboard') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
          </Link>
        )}
        <Link
          href="/lawbot"
          className={`${isActive('/lawbot')
            ? 'text-primary'
            : 'hover:text-primary/80'
            } transition-all duration-200 relative group`}
        >
          Law Bot
          <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${isActive('/lawbot') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
        </Link>
        <Link
          href="/therapybot"
          className={`${isActive('/therapybot')
            ? 'text-primary'
            : 'hover:text-primary/80'
            } transition-all duration-200 relative group`}
        >
          Therapy Bot
          <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary transition-transform duration-300 ${isActive('/therapybot') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <div className="h-6 w-px bg-border mx-2" />
        {!user ? <LoginDropdown /> : <SignOut />}
      </div>
    </nav>
  );
}

export default Navbar;
