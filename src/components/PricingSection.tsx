"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { toast } from "sonner";

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePlanClick = (planType: string) => {
    if (!user) {
      toast.error("Musisz się zalogować aby wybrać plan subskrypcji");
      setShowAuthModal(true);
      return;
    }
    navigate(`/checkout?plan=${planType}`);
  };

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    <section id="subscription" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">

        {/* Nagłówek Sekcji */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Wybierz Swój Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nielimitowany dostęp do spersonalizowanych bajek najwyższej jakości.
            Bez zobowiązań – anuluj w dowolnym momencie.
          </p>
        </div>

        {/* Plany Cenowe */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {/* Plan Basic */}
          <Card className="relative border border-secondary transition-all duration-300 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Plan Basic
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">19.99</span>
                  <span className="text-muted-foreground">PLN / miesiąc</span>
                </div>
              </div>

              {/* Lista Korzyści */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>4 audiobooki</strong> na miesiąc
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Pełna <strong>personalizacja</strong> (imię, kontekst, morał)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Wersje <strong>Audio MP3</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>Standardowy Lektor</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Anulowanie <strong>w dowolnym momencie</strong>
                  </span>
                </li>
              </ul>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={() => handlePlanClick('basic')}
              >
                Rozpocznij Basic
              </Button>
            </CardContent>
          </Card>

          {/* Plan Miesięczny */}
          <Card className="relative border border-secondary transition-all duration-300 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Plan Premium
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">59.99</span>
                  <span className="text-muted-foreground">PLN / miesiąc</span>
                </div>
              </div>

              {/* Lista Korzyści */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>Nielimitowane</strong> bajki 10-minutowe
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Pełna <strong>personalizacja</strong> (imię, kontekst, morał)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Generowanie wersji <strong>Audio MP3</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>Premium Lektor</strong> – głos lektora najwyższej jakości
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Anulowanie <strong>w dowolnym momencie</strong>
                  </span>
                </li>
              </ul>

              <Button
                variant="hero"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={() => handlePlanClick('premium')}
              >
                Rozpocznij Premium
              </Button>
            </CardContent>
          </Card>

          {/* Plan Roczny (Wyróżniony) */}
          <Card className="relative border-2 border-primary shadow-2xl transform md:scale-105 bg-card">

            {/* Badge "Oszczędzasz" */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg inline-flex items-center gap-2">
                <Zap className="w-4 h-4" fill="currentColor" />
                NAJPOPULARNIEJSZY
              </span>
            </div>

            <CardContent className="p-8 pt-10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Plan Roczny Premium
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-primary">49.99</span>
                  <span className="text-muted-foreground">PLN / miesiąc</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Płatność roczna: <span className="font-semibold text-foreground">599 PLN</span>
                </p>
                <p className="text-sm text-primary font-semibold mt-1">
                  Oszczędzasz 120 PLN rocznie!
                </p>
              </div>

              {/* Lista Korzyści */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>Nielimitowane</strong> bajki 10-minutowe
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Pełna <strong>personalizacja</strong> (imię, kontekst, morał)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Generowanie wersji <strong>Audio MP3</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>Premium Lektor</strong> – głos lektora najwyższej jakości
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    Anulowanie <strong>w dowolnym momencie</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-foreground">
                    <strong>Najlepsza cena</strong> – oszczędzasz 120 PLN
                  </span>
                </li>
              </ul>

              <Button
                variant="hero"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={() => handlePlanClick('annual')}
              >
                Wybierz Plan Roczny
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Dodatkowe Informacje */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dołącz do tysięcy rodziców, którzy codziennie tworzą wyjątkowe bajki dla swoich dzieci.
            Bez ryzyka – możesz anulować w dowolnym momencie.
          </p>
        </div>

      </div>
    </section>
    </>
  );
};

export default PricingSection;
