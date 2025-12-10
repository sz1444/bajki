import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Jak gwarantujecie bezpieczeństwo i jakość treści?",
    answer: "Każda bajka, zanim trafi do klienta, przechodzi przez nasz autorski, wielostopniowy system kontroli jakości. Gwarantujemy, że wszystkie historie są w 100% pozytywne, edukacyjne oraz pozbawione przemocy, strachu i wszelkich nieodpowiednich elementów."
  },
  {
    question: "Czy mogę anulować subskrypcję w każdej chwili?",
    answer: "Tak! Subskrypcję możesz anulować w dowolnym momencie, bez żadnych zobowiązań. Nie ma ukrytych opłat ani kar za rezygnację. Po anulowaniu zachowasz dostęp do wszystkich stworzonych bajek do końca opłaconego okresu rozliczeniowego."
  },
  {
    question: "Jak długo trwa tworzenie tak spersonalizowanej bajki Premium?",
    answer: "Ze względu na głęboką personalizację, precyzyjne dopasowanie tonu narracji oraz generowanie bajki o zwiększonej długości (do 10 minut), proces pisania i nagrywania zajmuje **maksymalnie 10 minut**. Gwarantujemy, że warto czekać na tak unikalny produkt."
  },
  {
    question: "Ile bajek mogę stworzyć w ramach subskrypcji?",
    answer: "W ramach subskrypcji możesz tworzyć **nielimitowaną** ilość bajek! Nie ma ograniczeń – twórz nowe historie tak często, jak chcesz. Wszystkie bajki możesz pobierać w formacie MP3 i PDF, odsłuchiwać wielokrotnie i zachować na swoich urządzeniach."
  },
  {
    question: "Co decyduje o jakości głosu lektora?",
    answer: "Używamy technologii syntezy mowy klasy Premium, która zapewnia ciepły, naturalny i emocjonalny głos lektora, idealnie dopasowany do narracji bajek. Głos jest wyraźny, intonacja płynna, co gwarantuje przyjemne doświadczenie słuchowe."
  },
  {
    question: "W jaki sposób mogę zapłacić?",
    answer: "Akceptujemy wyłącznie bezpieczne i popularne metody płatności kartami kredytowymi i debetowymi (Visa, Mastercard, etc.). Dzięki temu możemy zagwarantować ciągłość Twojej subskrypcji i wygodne, automatyczne odnowienia."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Najczęściej Zadawane Pytania
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background rounded-lg border-none shadow-sm px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
