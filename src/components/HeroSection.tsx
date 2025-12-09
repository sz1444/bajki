"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.png";
import { Play, Pause } from 'lucide-react';

// Plik audio z folderu public/
const exampleAudio = "/example-audio.mp3";

const HeroSection = () => {
  // 1. STANY DO KONTROLI AUDIO
  const [isPlaying, setIsPlaying] = useState(false);
  // Używamy useRef, aby utrzymać instancję Audio w trakcie renderowania
  const audioRef = useRef(null);

  // 2. INICJALIZACJA OBIEKTU AUDIO
  // Używamy useEffect, aby stworzyć obiekt Audio tylko raz po zamontowaniu komponentu
  useEffect(() => {
    audioRef.current = new Audio(exampleAudio);
    
    // Ustawienie nasłuchiwania na koniec pliku
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };

    // Czyszczenie zasobów przy odmontowaniu komponentu
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 3. FUNKCJA ODTWARZANIA/ZATRZYMYWANIA
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Ustawienie czasu odtwarzania na 0, aby zawsze zaczynać od początku
      audioRef.current.currentTime = 0; 
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Soft decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80  rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              Twórz magiczne{" "}
              <span className="text-primary">bajki audio</span>{" "}
              dla Twojego dziecka
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Stwórz wyjątkowe, personalizowane opowieści, które rozbudzą wyobraźnię i wywołają uśmiech na twarzy Twojego dziecka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <a href="#subscription">Dowiedz się więcej</a>
              </Button>
              
              {/* ZMIENIONY PRZYCISK Z FUNKCJĄ I IKONĄ */}
              <Button 
                variant="outline" 
                size="xl" 
                onClick={togglePlay} // <<< WŁĄCZENIE FUNKCJI ODTWARZANIA
                className="text-foreground border-border hover:bg-secondary hover:text-foreground relative pl-12"
              >
                {/* WIZUALNY FEEDBACK: IKONA ODTWARZANIA/PAUZY */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </span>
                {isPlaying ? "Zatrzymaj przykład" : "Posłuchaj Demo"}
              </Button>
              
            </div>
            
            {/* Trust badges */}
            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Bezpieczne dla dzieci
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Natychmiastowy dostęp
              </div>
            </div>
          </div>
          
          {/* Hero illustration */}
          <div className="flex-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-50" />
              <img
                src={typeof heroImage === 'string' ? heroImage : heroImage.src}
                alt="Dziecko słuchające bajki z przyjaznym smokiem"
                className="w-full max-w-lg mx-auto animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;