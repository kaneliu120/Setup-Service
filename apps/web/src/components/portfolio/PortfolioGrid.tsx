'use client';

import { useState } from 'react';
import { X, Play } from 'lucide-react';

interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  media_url?: string;
  media_type: string;
  category?: string;
}

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);

  if (!items.length) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">Portfolio coming soon</p>
        <p className="text-sm mt-2">Check back later for our latest work</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setLightbox(item)}
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              {item.media_type === 'video' ? (
                <video
                  src={item.media_url || item.thumbnail_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                />
              ) : item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
                  🎨
                </div>
              )}
              {item.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
              {item.description && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>
              )}
              {item.category && (
                <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.media_type === 'video' ? (
              <video
                src={lightbox.media_url || lightbox.thumbnail_url}
                controls
                autoPlay
                className="w-full rounded-xl"
              />
            ) : (
              <img
                src={lightbox.media_url || lightbox.thumbnail_url}
                alt={lightbox.title}
                className="w-full rounded-xl"
              />
            )}
            <div className="mt-4 text-center">
              <h3 className="text-white font-semibold text-lg">{lightbox.title}</h3>
              {lightbox.description && (
                <p className="text-white/70 text-sm mt-1">{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
