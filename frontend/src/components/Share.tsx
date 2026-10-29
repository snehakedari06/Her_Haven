import React from 'react';
import { Button } from './ui/button';
import { ShareIcon } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

interface ShareProps {
  imageURL: string;
  resText: string;
  setShared: (shared: boolean) => void;
}

function Share({ imageURL, resText, setShared }: ShareProps) {
  const [encodedImage, setEncodedImage] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleCommonFunction = async () => {
    setIsProcessing(true);
    try {
      console.log('Starting processing for share/save...');

      // 1. Encode text in image (Steganography)
      const encodeRes = await axios.post('/api/encode', {
        resImage: imageURL,
        resText: resText,
      });
      const newEncodedImage = encodeRes.data.encodedImage;
      setEncodedImage(newEncodedImage);

      // 2. Decompose text for database
      const decomposeReq = await axios.post('/api/decompose', {
        resText: resText,
      });

      // 3. Save to database
      const data = {
        ...decomposeReq.data.decomposed,
        status: 'pending',
        originalImage: imageURL,
        encodedImage: newEncodedImage,
        reportText: resText,
        timestamp: new Date().toISOString(),
      };

      await axios.post('/api/save', data);

      return newEncodedImage;
    } catch (error) {
      console.error('Error in handleCommonFunction:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImageFile = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImage = async () => {
    let imgToDownload = encodedImage;
    if (!imgToDownload) {
      imgToDownload = (await handleCommonFunction()) || imageURL;
    }
    downloadImageFile(imgToDownload, `SupportSafe_Report_${Date.now()}.png`);
    setShared(true);
  };

  const handleShareTelegram = async () => {
    let img = encodedImage;
    if (!img) img = (await handleCommonFunction()) || imageURL;

    // Download the report image first (Data URL works fine)
    downloadImageFile(img, `SupportSafe_Telegram_${Date.now()}.png`);

    const shareUrl = window.location.origin;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(
      "I've securely reported an incident via SupportSafe. Help is on the way."
    )}`;
    window.open(telegramShareUrl, '_blank');
    setShared(true);
  };

  const handleShareTwitter = async () => {
    // 1. Open Twitter IMMEDIATELY
    window.open('https://twitter.com/intent/tweet', '_blank');

    // 2. Ensure we have the encoded image (Data URL) before downloading
    let imgToShare = encodedImage;
    if (!imgToShare) {
      imgToShare = await handleCommonFunction();
    }

    // Fallback to imageURL if encoding fails
    imgToShare = imgToShare || imageURL;

    if (imgToShare) {
      downloadImageFile(imgToShare, `Haven_Report_${Date.now()}.png`);
    }

    setShared(true);
  };

  return (
    <div className="flex flex-col items-center gap-10 py-8 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-foreground tracking-tighter italic">Secure & Reflect</h2>
        <p className="text-foreground/50 font-medium max-w-lg mx-auto text-lg leading-relaxed">
          Your report is encrypted using advanced steganography and is ready for secure sharing.
        </p>
      </div>

      <div className="relative w-full max-w-[450px] aspect-square shadow-[0_32px_64px_-15px_rgba(255,100,150,0.2)] rounded-[3rem] overflow-hidden border-[12px] border-white group">
        <img
          src={encodedImage || imageURL}
          alt="Generated Image"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => {
            console.error("Share image failed to load:", imageURL);
            (e.target as HTMLImageElement).src = "https://placehold.co/600x600?text=Image+Load+Failed";
          }}
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-md flex items-center justify-center">
            <div className="bg-white/90 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-primary font-black uppercase tracking-widest text-xs">Encrypting Data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Twitter share section — prominent & separate */}
      <div className="w-full max-w-2xl bg-foreground text-background rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl border border-white/10 group">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-white font-black text-2xl flex items-center justify-center sm:justify-start gap-3">
            <span className="text-3xl">𝕏</span> Share Awareness
          </p>
          <p className="text-white/40 text-sm mt-2 font-medium">
            📥 The image will auto-download. Click post and pick the latest file from your folder.
          </p>
        </div>
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-black h-16 px-10 rounded-2xl text-lg shrink-0 shadow-xl shadow-primary/20 active:scale-95 transition-all w-full sm:w-auto"
          onClick={handleShareTwitter}
          disabled={isProcessing}
        >
          POST TO X →
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
        <Button
          variant="outline"
          className="flex items-center gap-3 h-16 border-2 border-primary/10 bg-white/50 hover:bg-primary/5 hover:border-primary/30 transition-all font-black uppercase tracking-widest text-xs text-primary rounded-2xl"
          onClick={downloadImage}
          disabled={isProcessing}
        >
          <ShareIcon size={18} className="rotate-180" />
          Download
        </Button>

        <Button
          variant="default"
          className="flex items-center gap-3 h-16 bg-[#0088cc] hover:bg-[#0077b5] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-[#0088cc]/20 transition-all"
          onClick={handleShareTelegram}
          disabled={isProcessing}
        >
          Telegram
        </Button>

        <Button
          variant="default"
          className="flex items-center gap-3 h-16 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-[#bc1888]/20 transition-all"
          onClick={downloadImage} // Instagram optimization: download first
          disabled={isProcessing}
        >
          Instagram
        </Button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 max-w-md">
        <span className="text-primary text-xl">🛡️</span>
        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-relaxed">
          The secret report data is hidden deep inside the image pixels using high-bit steganography.
        </p>
      </div>
    </div>
  );
}

export default Share;
