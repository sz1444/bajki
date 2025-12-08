import { Keyboard, Cpu, Headphones, Pen } from "lucide-react";

const steps = [
  {
    icon: Keyboard,
    title: "1. Wpisz pomysł",
    description: "Opisz bohaterów, przygody lub morał, który chcesz przekazać swojemu dziecku.",
  },
  {
    icon: Pen,
    title: "2. Tworzymy bajkę",
    description: "Twój pomysł zamieniamy w wyjątkową, dopasowaną opowieść pełną magii i emocji.",
  },
  {
    icon: Headphones,
    title: "3. Słuchajcie razem",
    description: "Pobierz audiobook i ciesz się wspólnym czasem z dzieckiem.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="jak-to-dziala" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Jak to działa?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trzy proste kroki dzielą Cię od stworzenia wyjątkowej bajki dla Twojego dziecka
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="bg-card rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <step.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
