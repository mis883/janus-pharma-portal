import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

interface HeroCarouselProps {
  banners: Banner[];
  onNavigateToCriticalCare: () => void;
  onNavigateToNewLaunches: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  banners,
  onNavigateToCriticalCare, 
  onNavigateToNewLaunches 
}) => {
  const [current, setCurrent] = useState(0);

  // Helper to map string link keys to actual functions
  const handleAction = (linkTo?: string) => {
      if (linkTo === 'Critical Care') onNavigateToCriticalCare();
      else if (linkTo === 'New') onNavigateToNewLaunches();
  };

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrent(current === 0 ? banners.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === banners.length - 1 ? 0 : current + 1);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden rounded-2xl shadow-xl group">
      {/* Slides */}
      {banners.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Background Image */}
          <img 
            src={slide.imageUrl} 
            alt={slide.headline}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className={`absolute inset-0 ${slide.overlayColor} flex items-center justify-center md:justify-start px-8 md:px-20`}>
            <div className="max-w-3xl text-center md:text-left text-white space-y-6">
                <h2 className="text-3xl md:text-6xl font-bold font-nexa leading-tight drop-shadow-md">
                    {slide.headline}
                </h2>
                <p className="text-lg md:text-2xl text-blue-50 font-light leading-relaxed drop-shadow-sm">
                    {slide.subheadline}
                </p>
                {slide.buttonText && (
                    <button 
                        onClick={() => handleAction(slide.linkTo)}
                        className="mt-6 px-8 py-4 bg-white text-[#0056b3] font-bold rounded-full hover:bg-blue-50 transition transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
                    >
                        {slide.buttonText} <ChevronRight size={20} />
                    </button>
                )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
            <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronLeft size={32} />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronRight size={32} />
            </button>
        </>
      )}

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {banners.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`h-2 rounded-full transition-all duration-300 shadow-sm ${index === current ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
      )}
    </div>
  );
};