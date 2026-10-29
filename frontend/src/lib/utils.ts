import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to convert coordinates to city name
export const fetchCityName = async (lat: number, lng: number) => {
  if (isNaN(lat) || isNaN(lng)) return 'Unknown location';

  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    console.warn('OpenCage API key is missing');
    return 'Location Pending';
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${lat}%2C${lng}`
    );
    const data = await response.json();
    return data.results[0]?.components?.state || 'Unknown location';
  } catch (error) {
    console.error('Error fetching city name:', error);
    return 'Unknown location';
  }
};

export function cleanText(text: string) {
  return text.replace(/\s?\(.*?\)/g, '').trim(); // Removes anything inside parentheses
}
