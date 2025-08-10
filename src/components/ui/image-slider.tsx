'use client';

import { useState, useEffect } from 'react';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

interface ImageSliderProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

export function ImageSlider({ slides, autoPlay = true, interval = 5000 }: ImageSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (autoPlay && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!slides || slides.length === 0) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentSlideData.image})`
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full text-white text-center px-4">
        <div className="max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-bold mb-4 animate-fadeInUp">
            {currentSlideData.title}
          </h2>
          <h3 className="text-2xl md:text-3xl font-light mb-6 animate-fadeInUp animate-delay-200">
            {currentSlideData.subtitle}
          </h3>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto animate-fadeInUp animate-delay-400">
            {currentSlideData.description}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover-scale"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover-scale"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((currentSlide + 1) / slides.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}