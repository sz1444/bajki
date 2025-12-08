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
    question: "Gwarancja Satysfakcji: Czy mogę zwrócić bajkę, jeśli maluchowi się nie spodoba?",
    answer: "Tak! Jesteśmy pewni jakości naszych historii, dlatego oferujemy pełną **Gwarancję Satysfakcji**. Jeśli w ciągu 14 dni od zakupu bajka nie spełni oczekiwań Twojego dziecka, zwrócimy Ci 100% kwoty, bez konieczności podawania przyczyny."
  },
  {
    question: "Jak długo trwa tworzenie tak spersonalizowanej bajki Premium?",
    answer: "Ze względu na głęboką personalizację, precyzyjne dopasowanie tonu narracji oraz generowanie bajki o zwiększonej długości (do 10 minut), proces pisania i nagrywania zajmuje **maksymalnie 10 minut**. Gwarantujemy, że warto czekać na tak unikalny produkt."
  },
  {
    question: "Czy mogę odsłuchać bajkę wielokrotnie i czy jest chroniona hasłem?",
    answer: "Po zakupie bajka jest Twoją własnością na zawsze. Możesz ją odsłuchiwać nieograniczoną liczbę razy i pobrać na dowolne urządzenie. Plik jest standardowym audiobookiem MP3, bez konieczności użycia haseł czy specjalnych aplikacji."
  },
  {
    question: "Co decyduje o jakości głosu lektora?",
    answer: "Używamy technologii syntezy mowy klasy Premium, która zapewnia ciepły, naturalny i emocjonalny głos lektora, idealnie dopasowany do narracji bajek. Głos jest wyraźny, intonacja płynna, co gwarantuje przyjemne doświadczenie słuchowe."
  },
  {
    question: "W jaki sposób mogę zapłacić?",
    answer: "Akceptujemy wszystkie popularne i bezpieczne metody płatności: karty kredytowe/debetowe, płatności mobilne, BLIK oraz przelewy online. Wszystkie transakcje są szyfrowane, aby zapewnić najwyższe bezpieczeństwo Twoich danych."
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
