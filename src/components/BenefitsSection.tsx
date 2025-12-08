import { Shield, Mic, Lightbulb, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Shield,
    title: "Bezpieczeństwo Treści",
    description: "Wszystkie bajki są bezpieczne i odpowiednie dla dzieci w każdym wieku."
  },
  {
    icon: Mic,
    title: "Naturalny Głos Lektora",
    description: "Ciepła, kojąca narracja, która otula malucha i sprawia, że każda bajka staje się wyjątkowym przeżyciem."
  },
  {
    icon: Lightbulb,
    title: "Rozwijaj Wyobraźnię",
    description: "Każda historia jest unikalna i pobudza kreatywność Twojego dziecka."
  },
  {
    icon: Star,
    title: "Spersonalizowane Bajki",
    description: "Twórz historie z imieniem dziecka jako głównego bohatera."
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Dlaczego Dzieci i Rodzice Kochają Bajkownik?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="bg-background border-none shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
