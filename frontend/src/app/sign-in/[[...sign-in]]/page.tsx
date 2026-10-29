'use client';

import * as React from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormValues = z.infer<typeof SignInSchema>;

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: SignInFormValues) => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background p-6 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-foreground tracking-tighter italic">Official Portal</h1>
        <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-xs">Administrative Secure Access</p>
      </div>

      <div className="glass-card bg-white/80 p-10 rounded-[2.5rem] max-w-xl w-full shadow-2xl shadow-primary/10 border-primary/5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Email Terminal</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter credentials..."
                      className="rounded-2xl border-primary/10 focus:border-primary h-14 text-lg bg-white/50 px-6 font-medium placeholder:text-foreground/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Secure Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-2xl border-primary/10 focus:border-primary h-14 text-lg bg-white/50 px-6 font-medium placeholder:text-foreground/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-6 pt-4">
              <Button type="submit" className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest">
                Authorize →
              </Button>

              <Link
                href="/sign-up"
                className="text-center text-primary/60 hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px] underline underline-offset-8"
              >
                Request Official Account Registration
              </Link>
            </div>
          </form>
        </Form>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 max-w-sm">
        <span className="text-primary text-xl">🛡️</span>
        <p className="text-[10px] text-primary/60 font-medium uppercase tracking-widest leading-loose text-center">
          Encrypted session monitoring active. All administrative actions are logged for security.
        </p>
      </div>
    </div>
  );
}
