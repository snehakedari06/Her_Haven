'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton'; // Assuming Skeleton component is from your UI library
import { SparklesIcon } from 'lucide-react';
import Link from 'next/link';

// Zod validation schema for form
const FormSchema = z.object({
  generatedText: z.string(),
  imagePrompt: z
    .string()
    .min(3, { message: 'Please specify the image prompt.' }),
});

export default function ImageGen({
  text,
  textGemma,
  setResImage,
}: {
  text: string;
  textGemma: string;
  setResImage: (resImage: string) => void;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      generatedText: text || '',
      imagePrompt: '',
    },
  });

  const [imageOptions, setImageOptions] = useState<string[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const promptSuggestions = [
    'Good Morning',
    'Good Night',
    'Sunset',
    'Mountains',
    'Ocean',
  ];
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true); // Start loading state
    try {
      const res = await axios.post('/api/generate-image', data);
      console.log('Image options generated:', res.data.images); // Assuming API returns images array
      setImageOptions(res.data.images); // Set multiple image options
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('imagePrompt', suggestion);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Set the selected image as final
    setResImage(imageUrl); // Update the parent component with the final image URL
  };

  const handleTextOptionClick = (text: string) => {
    setSelectedText(text);
    if (text === textGemma) {
      setSelectedModel('gemma');
    } else {
      setSelectedModel('gemini');
    }
    form.setValue('generatedText', text);
  };

  // Handle image upload from device
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setResImage(base64); // Pass directly to Share step
    };
    reader.readAsDataURL(file);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto space-y-12 w-full mb-20"
      >
        <FormField
          control={form.control}
          name="generatedText"
          render={({ field }) => (
            <FormItem className="w-full">
              <div className="text-center mb-8">
                <FormLabel className="text-3xl font-black text-foreground tracking-tight">1. Choose Your Narrative</FormLabel>
                <p className="text-foreground/50 font-medium mt-2">Select the AI-generated report that best represents the situation.</p>
              </div>
              <FormControl>
                {!selectedText ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full pt-2">
                    {[text, textGemma].map((textOption, index) => (
                      <div
                        key={index}
                        onClick={() => handleTextOptionClick(textOption)}
                        className="cursor-pointer glass-card bg-white/70 p-8 rounded-[2rem] hover:border-primary/50 hover:shadow-primary/5 transition-all duration-500 group relative flex flex-col h-[420px]"
                      >
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-foreground/70 text-base leading-relaxed whitespace-pre-line font-medium italic">
                          "{textOption}"
                        </div>
                        <div className="mt-6 pt-6 border-t border-primary/10 flex justify-center">
                          <span
                            className={`${textOption === textGemma
                              ? 'bg-accent/20 text-accent-foreground'
                              : 'bg-primary/10 text-primary'
                              } text-xs font-black uppercase tracking-[0.2em] rounded-full py-2 px-6`}
                          >
                            {textOption === textGemma ? 'Gemma Intelligence' : 'Gemini Vision'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative group glass-card p-2 rounded-[2rem]">
                    <Textarea
                      {...field}
                      value={selectedText}
                      rows={10}
                      className="rounded-[1.5rem] border-transparent focus:border-primary/20 bg-white/50 transition-all text-foreground/80 leading-relaxed text-lg font-medium p-6"
                    />
                    <Button
                      onClick={() => setSelectedText('')}
                      variant="ghost"
                      size="sm"
                      className="absolute top-6 right-6 text-primary hover:text-primary hover:bg-primary/10 rounded-full font-bold"
                    >
                      Change Selection
                    </Button>
                  </div>
                )}
              </FormControl>
              {selectedText && (
                <div className="flex items-center gap-2 font-black text-primary/50 float-right text-[10px] uppercase tracking-widest mt-4 pr-2">
                  <SparklesIcon size={14} className="text-primary" />
                  <span>
                    Crafted with{' '}
                    <span className="text-primary underline underline-offset-4 tracking-normal">
                      {selectedModel}
                    </span>
                  </span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="glass-card bg-white/60 p-10 rounded-[2.5rem] space-y-8 border-primary/5 shadow-2xl shadow-primary/5">
          <FormField
            control={form.control}
            name="imagePrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-black text-foreground tracking-tight">2. Visualize the Context</FormLabel>
                <FormControl>
                  <Input
                    className="rounded-2xl border-primary/10 focus:border-primary h-14 text-lg bg-white/80 px-6 font-medium placeholder:text-foreground/30"
                    placeholder="A safe haven, morning sunrise, peaceful mountains..."
                    {...field}
                  />
                </FormControl>
                <div className="flex flex-wrap gap-3 pt-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-white border border-primary/10 text-primary/70 text-xs font-bold px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-16 text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">
            Create Visual Gallery ✨
          </Button>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-6 py-4">
          <div className="flex-1 h-px bg-primary/10" />
          <span className="text-primary/30 text-xs font-black tracking-[0.3em]">OR</span>
          <div className="flex-1 h-px bg-primary/10" />
        </div>

        {/* Import from Device */}
        <div className="glass-card bg-white/40 p-10 rounded-[2.5rem] border-dashed border-2 border-primary/20 hover:border-primary/40 transition-all text-center">
          <p className="text-xl font-black text-foreground tracking-tight mb-2">📁 Import Private Media</p>
          <p className="text-sm text-foreground/50 font-medium mb-8">Upload a personal image to securely embed your report.</p>
          <label className="cursor-pointer inline-block">
            <div className="flex items-center gap-4 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
              <span className="text-2xl">📷</span>
              <span>BROWSE DEVICE</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleDeviceImageUpload}
            />
          </label>
          {selectedImage && !imageOptions && (
            <div className="mt-8 flex flex-col items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping mb-2" />
              <p className="text-sm text-green-600 font-black tracking-widest uppercase">Securing Medium...</p>
              <img src={selectedImage} alt="Uploaded" className="w-48 h-48 object-cover rounded-[2rem] border-4 border-white shadow-2xl mt-4" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="mt-12 space-y-8 text-center bg-white/40 p-12 rounded-[3rem] border border-primary/5">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h2 className="text-2xl font-black text-primary tracking-tight">Painting Your Narrative...</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-[2rem] bg-primary/5" />
              ))}
            </div>
          </div>
        ) : imageOptions && imageOptions.length > 0 ? (
          <div className="mt-12 mb-20 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-foreground tracking-tight italic">Curated Visuals</h2>
              <p className="text-foreground/50 font-medium mt-2">Select the frame that will hold your secure report.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {imageOptions.map((imageUrl, index) => (
                <div
                  key={index}
                  className="cursor-pointer group relative"
                  onClick={() => handleImageSelect(imageUrl)}
                >
                  <div className="relative w-full h-80 overflow-hidden rounded-[2.5rem] shadow-xl group-hover:shadow-3xl group-hover:-translate-y-2 transition-all duration-500 border-4 border-white">
                    <img
                      src={imageUrl}
                      alt={`Potential Backdrop ${index + 1}`}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                      <span className="bg-white text-primary font-black px-6 py-2 rounded-full text-xs tracking-widest">SELECT FRAME</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </Form>
  );
}
