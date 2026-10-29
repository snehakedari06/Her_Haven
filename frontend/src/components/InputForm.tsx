'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';

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
import { useClerk } from '@clerk/nextjs';
import { Loader2, LocateIcon } from 'lucide-react';
import axios from 'axios';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

const contactMethods = ['Phone', 'Email', 'Text message', 'In-person'];

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  phone: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  occurrenceDuration: z
    .string()
    .min(1, { message: 'Please specify a duration.' }),
  frequency: z.string().min(1, { message: 'Please specify a frequency.' }),
  visibleInjuries: z.enum(['Yes', 'No']),
  preferredContact: z
    .array(z.enum(['Phone', 'Email', 'Text message', 'In-person']))
    .min(1, {
      message: 'Please select at least one contact method.',
    }),
  currentSituation: z
    .string()
    .min(5, { message: 'Please describe the current situation.' }),
  culprit: z.string().min(5, { message: 'Please describe the culprit.' }),
});

// interface InputFormProps {
//   setResImage: (resImage: string) => void;
// }
// { setResImage }: InputFormProps
export function InputForm({
  setText,
  setTextGemma,
}: {
  setText: (resText: string) => void;
  setTextGemma: (resText: string) => void;
}) {
  const { user } = useClerk();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: user?.fullName || '',
      phone: '',
      location: { lat: 0, lng: 0 }, // Default to zero coordinates
      occurrenceDuration: '',
      frequency: '',
      visibleInjuries: 'No',
      preferredContact: [],
      currentSituation: '',
      culprit: '',
    },
  });

  const [occurrenceDuration, setOccurrenceDuration] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedContactMethods, setSelectedContactMethods] = useState<
    string[]
  >([]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Set the location as an object with lat and lng
          form.setValue('location', { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error fetching location:', error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true);
      const res = await axios.post('/api/generate-text', data);
      // setResImage(res.data.url);
      // console.log('Image generated:', res.data.url);
      console.log('res:', res.data);
      console.log('Text generated with gemini:', res.data.gemini_response);
      console.log('Text generated with gemma:', res.data.gemma_response);
      if (res.data.gemini_response && res.data.gemma_response) {
        setText(res.data.gemini_response);
        setTextGemma(res.data.gemma_response);
        setLoading(false);
      } else {
        console.log('Text setting failed');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl mx-auto space-y-8 w-full p-10 glass-card bg-white/80 rounded-[2.5rem] shadow-2xl shadow-primary/5 mb-20"
      >
        <div className="space-y-2 mb-8 text-center">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Report Incident</h2>
          <p className="text-foreground/50 font-medium">Please fill in the details securely.</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} className="h-12 rounded-xl border-primary/10 focus:border-primary bg-white/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Preferred Contact Method</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {contactMethods.map((method) => (
                    <div key={method} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${field.value.includes(method as any) ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-white/50 border-primary/5 text-foreground/60'}`}>
                      <Checkbox
                        checked={field.value.includes(
                          method as
                          | 'Phone'
                          | 'Email'
                          | 'Text message'
                          | 'In-person'
                        )}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, method]
                            : field.value.filter((item) => item !== method);
                          field.onChange(newValue);
                          setSelectedContactMethods(newValue);
                        }}
                      />
                      <span className="font-semibold text-sm">{method}</span>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedContactMethods.includes('Phone') && (
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 000-0000" {...field} className="h-12 rounded-xl border-primary/10 focus:border-primary bg-white/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Your Location</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Detecting location..."
                    value={field.value.lat === 0 ? '' : `Coordinates: ${field.value.lat.toFixed(4)}, ${field.value.lng.toFixed(4)}`}
                    readOnly
                    className="h-12 rounded-xl border-primary/10 focus:border-primary bg-white/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={getUserLocation}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
                  >
                    <LocateIcon className="h-5 w-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="occurrenceDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Duration</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4 p-4 rounded-2xl bg-secondary/50 border border-primary/5">
                    <Slider
                      {...field}
                      value={[occurrenceDuration]}
                      min={1}
                      max={120}
                      className="py-2"
                      onValueChange={(value) => {
                        setOccurrenceDuration(value[0]);
                        field.onChange(value[0]);
                      }}
                    />
                    <span className="text-center font-bold text-primary">{occurrenceDuration} months</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Frequency</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4 p-4 rounded-2xl bg-secondary/50 border border-primary/5">
                    <Slider
                      {...field}
                      value={[frequency]}
                      min={1}
                      max={30}
                      className="py-2"
                      onValueChange={(value) => {
                        setFrequency(value[0]);
                        field.onChange(value[0]);
                      }}
                    />
                    <span className="text-center font-bold text-primary">{frequency} times / month</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currentSituation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Current Situation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what's happening. Be as descriptive as possible..."
                  {...field}
                  className="min-h-[120px] rounded-2xl border-primary/10 focus:border-primary bg-white/50 resize-none leading-relaxed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="culprit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-primary/80 uppercase tracking-widest pl-1">Culprit Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Help us identify the person. Physical features, name if known, etc."
                  {...field}
                  className="min-h-[120px] rounded-2xl border-primary/10 focus:border-primary bg-white/50 resize-none leading-relaxed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-16 rounded-2xl text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Generate Secure Report
              <span className="text-2xl">✨</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
