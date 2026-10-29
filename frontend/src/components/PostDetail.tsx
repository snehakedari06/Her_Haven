'use client';
import { cleanText, fetchCityName } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  CircleX,
  Nfc,
  CalendarDays,
  FileUser,
  PersonStanding,
  MapPin,
  TrendingUp,
  Loader2,
  Check,
} from 'lucide-react';
import CustomTimeline from './Timeline';
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  Name: string;
  Location: string;
  'Preferred way of contact': string;
  'Contact info': string;
  'Frequency of domestic violence': string;
  'Relationship with perpetrator': string;
  'Severity of domestic violence': string;
  'Nature of domestic violence': string;
  'Impact on children': string;
  'Culprit details': string;
  'Other info': string;
  status: string;
}

function PostDetail({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostById = async () => {
      try {
        const response = await fetch(`/api/postbyid/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      }
    };

    fetchPostById();
  }, [id]);

  useEffect(() => {
    if (post) {
      const cleanLoc = cleanText(post.Location);
      const [lat, lng] = cleanLoc.split(',').map(Number);

      const fetchCity = async () => {
        try {
          const cityName = await fetchCityName(lat, lng);
          setCity(cityName === 'Unknown location' || cityName === 'Location Pending' ? 'SRM University, Mangalagiri' : cityName);
        } catch (err) {
          console.error('Failed to fetch city name:', err);
        }
      };

      fetchCity();
    }
  }, [post]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }
  const cleanLoc = cleanText(post.Location);
  const [lat, lng] = cleanLoc.split(',').map(Number);
  const isValidLoc = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  // SRM University AP, Mangalagiri - exact GPS coordinates
  const DEFAULT_LAT = 16.4632075;
  const DEFAULT_LNG = 80.5064032;
  const mapLat = isValidLoc ? lat : DEFAULT_LAT;
  const mapLng = isValidLoc ? lng : DEFAULT_LNG;

  // Tight bbox for street-level zoom (0.003 = ~300m radius)
  const ZOOM = 0.003;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - ZOOM},${mapLat - ZOOM},${mapLng + ZOOM},${mapLat + ZOOM}&layer=mapnik&marker=${mapLat},${mapLng}`;

  const handleCloseIssue = async (issueId: string) => {
    try {
      const response = await fetch('/api/closeIssue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueId }),
      });

      if (!response.ok) {
        throw new Error('Failed to close issue');
      }

      // const data = await response.json();
      toast.success('Issue closed successfully');
      setPost((prevPost) =>
        prevPost ? { ...prevPost, status: 'closed' } : null
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl w-full mx-auto p-8 gap-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between w-full glass-card p-6 rounded-3xl">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter italic">{post.Name}</h1>
          <p className="text-foreground/50 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Official Incident Record</p>
        </div>
        {post.status === 'pending' && (
          <Button
            onClick={() => handleCloseIssue(post._id)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
          >
            <CircleX size={18} />
            <span>Close Issue</span>
          </Button>
        )}
        {post.status === 'closed' && (
          <Button className="flex items-center space-x-2 bg-green-500 text-white hover:bg-green-600 h-14 px-8 rounded-2xl shadow-xl shadow-green-500/20 font-black uppercase tracking-widest text-xs">
            <Check size={18} />
            <span>Issue Resolved</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Contact Channel', value: post['Preferred way of contact'], icon: Nfc, sub: post['Contact info'] },
          { label: 'Incident Flow', value: post['Frequency of domestic violence'], icon: CalendarDays, sub: post['Relationship with perpetrator'] },
          { label: 'Nature of Harm', value: post['Impact on children'], icon: PersonStanding, sub: `Severity: ${post['Severity of domestic violence']}` },
          { label: 'Subject Details', value: post['Culprit details'], icon: FileUser, sub: post['Other info'] },
          { label: 'Geographic Context', value: city || 'SRM University, Mangalagiri', icon: MapPin, sub: `Raw: ${post['Location']}` },
          { label: 'Operational Status', value: post.status, icon: TrendingUp, sub: 'Strategic resolution pending' }
        ].map((item, idx) => (
          <div key={idx} className="glass-card bg-white/70 p-6 rounded-[2rem] flex flex-col gap-4 group hover:shadow-primary/5 transition-all duration-500">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">{item.label}</h2>
              <item.icon className="text-primary group-hover:scale-110 transition-transform duration-300" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-black text-foreground/80 leading-tight mb-1">{item.value}</p>
              <p className="text-sm font-medium text-foreground/40">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        <div className="glass-card bg-white/40 p-2 rounded-[2.5rem] overflow-hidden shadow-2xl h-[450px]">
          <iframe
            width="100%"
            height="100%"
            className="rounded-[2rem] grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
          ></iframe>
        </div>
        <div className="glass-card bg-white/60 p-8 rounded-[2.5rem] shadow-2xl overflow-y-auto h-[450px] custom-scrollbar">
          <h1 className="text-center text-xl font-black uppercase tracking-[0.2em] text-foreground/80 mb-8 pb-4 border-b border-primary/10">
            Live Feed
          </h1>
          <CustomTimeline />
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
