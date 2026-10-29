'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';

export function LoginDropdown() {
  const { signIn } = useSignIn();

  if (!signIn) return <h1>Not Available!</h1>;

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/user/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-full hover:bg-primary hover:text-white transition-all">
          Login / Join
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mr-2 bg-white/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-3 shadow-2xl shadow-primary/10 animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="text-primary/70 font-black uppercase tracking-[0.2em] text-[10px] px-4 py-3">Selection Portal</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/5 mx-2" />

        <div className="space-y-1 mt-2">
          <p className="px-4 text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Public Access</p>
          <DropdownMenuItem
            onClick={() => signInWith('oauth_google')}
            className="cursor-pointer rounded-2xl py-3 px-4 focus:bg-primary focus:text-white transition-all font-bold text-sm"
          >
            👤 Individual Login
          </DropdownMenuItem>
        </div>

        <div className="space-y-1 mt-4">
          <p className="px-4 text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Administrative</p>
          <Link href="/sign-in" className="block">
            <DropdownMenuItem className="cursor-pointer rounded-2xl py-3 px-4 focus:bg-primary focus:text-white transition-all font-bold text-sm">
              🔑 Official Sign In
            </DropdownMenuItem>
          </Link>
          <Link href="/sign-up" className="block">
            <DropdownMenuItem className="cursor-pointer rounded-2xl py-3 px-4 focus:bg-primary focus:text-white transition-all font-bold text-sm">
              📝 Official Registration
            </DropdownMenuItem>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
