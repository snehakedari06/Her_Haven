'use client';
import React from 'react';

function Page() {
  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden">
      <iframe
        src="http://localhost:5173"
        className="w-full h-full border-none"
        title="Therapy Bot"
        allow="autoplay; microphone"
      />
    </div>
  );
}

export default Page;
