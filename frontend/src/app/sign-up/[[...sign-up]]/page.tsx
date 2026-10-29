'use client';

import * as React from 'react';
import { useSignUp, useUser } from '@clerk/nextjs';
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
import toast from 'react-hot-toast';
import Link from 'next/link';

// Extend the schema to include name and phone number fields
const SignUpSchema = z.object({
  emailAddress: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  code: z.string().optional(),
});

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  // const { user } = useAuth();
  const { user } = useUser();
  const [verifying, setVerifying] = React.useState(false);
  const [needsMetadataUpdate, setNeedsMetadataUpdate] = React.useState(false);

  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      emailAddress: '',
      password: '',
      name: '',
      phoneNumber: '',
      code: '',
    },
  });

  const handleSubmit = async (data: SignUpFormValues) => {
    if (!isLoaded) return;

    try {
      // Start sign-up process with email, password, name, and phone number
      await signUp.create({
        emailAddress: data.emailAddress,
        password: data.password,
        // split name into first and last name
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ')[1],
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setVerifying(true); // Move to the verification step
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      // Display specific errors to the user in the form
      if (err.errors) {
        err.errors.forEach((error: any) => {
          if (error.meta?.paramName === 'email_address' || error.code === 'form_identifier_exists') {
            form.setError('emailAddress', { message: error.message });
          } else if (error.meta?.paramName === 'password' || error.code === 'form_password_pwned') {
            form.setError('password', { message: error.message });
          } else if (error.meta?.paramName === 'first_name' || error.meta?.paramName === 'last_name') {
            form.setError('name', { message: error.message });
          } else {
            toast.error(error.message);
          }
        });
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleVerify = async (data: SignUpFormValues) => {
    if (!isLoaded || !data.code) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        // console.log(user);
        setNeedsMetadataUpdate(true);

        toast.success('Sign up successful!'); // Display success message
        router.push('/');
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      console.error('Error:', JSON.stringify(err, null, 2));
      if (err.errors) {
        err.errors.forEach((error: any) => {
          if (error.meta?.paramName === 'code') {
            form.setError('code', { message: error.message });
          } else {
            toast.error(error.message);
          }
        });
      } else {
        toast.error('Verification failed. Please check the code.');
      }
    }
  };

  React.useEffect(() => {
    // Update metadata once user becomes available and needs update
    if (user && needsMetadataUpdate) {
      user
        .update({
          unsafeMetadata: {
            phone: form.getValues('phoneNumber'),
            isAdmin: true,
          },
        })
        .then(() => {
          setNeedsMetadataUpdate(false); // Reset flag
        })
        .catch((err) => {
          console.error(
            'Failed to update metadata:',
            JSON.stringify(err, null, 2)
          );
        });
    }
  }, [user, needsMetadataUpdate, form]);

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background p-6 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic">Verify Identity</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-xs">Secure Verification Sequence</p>
        </div>

        <div className="glass-card bg-white/80 p-10 rounded-[2.5rem] max-w-xl w-full shadow-2xl shadow-primary/10 border-primary/5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleVerify)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 123456"
                        className="rounded-2xl border-primary/10 focus:border-primary h-14 text-center text-2xl tracking-[0.5em] bg-white/50 font-black placeholder:text-foreground/10 placeholder:tracking-normal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest">
                Confirm Identity →
              </Button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background py-20 px-6 animate-in fade-in duration-700">
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-5xl font-black text-foreground tracking-tighter italic">Register Official</h1>
        <p className="text-foreground/40 font-bold uppercase tracking-[0.3em] text-xs">Establish Administrative Credentials</p>
      </div>

      <div className="glass-card bg-white/80 p-10 rounded-[3rem] max-w-xl w-full shadow-2xl shadow-primary/10 border-primary/5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div id="clerk-captcha"></div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Official Name" className="rounded-2xl border-primary/10 focus:border-primary h-14 text-lg bg-white/50 px-6 font-medium placeholder:text-foreground/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Secure Contact No.</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 ...."
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
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Email Terminal</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="credentials@safemail.com"
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
                  <FormLabel className="font-black text-primary/60 uppercase tracking-widest text-[10px] ml-1">Security Key (Password)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-2xl border-primary/10 focus:border-primary h-14 text-lg bg-white/50 px-6 font-medium placeholder:text-foreground/20"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[9px] text-primary/40 font-bold uppercase tracking-widest mt-2 ml-1">
                    Req: 8+ Chars, Symbols, Numbers
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-6 pt-4">
              <Button type="submit" className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest">
                Initialize Account →
              </Button>

              <Link
                href="/sign-in"
                className="text-center text-primary/60 hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px] underline underline-offset-8"
              >
                Existing Official? Sign In Here
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
