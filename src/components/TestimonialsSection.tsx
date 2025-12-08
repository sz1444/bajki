import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Kasia",
    role: "Mama 5-latka",
    quote: "Mój syn nie może się doczekać wieczorów! Bajkownik stały się naszym rytuałem przed snem. Bajki są cudowne i zawsze świeże.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    initials: "KM"
  },
  {
    name: "Tomek",
    role: "Tata 7-latki",
    quote: "Córka uwielbia, że może być bohaterką własnych historii. Jakość głosu jest niesamowita – brzmi jak prawdziwy lektor!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    initials: "TK"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Co Mówią Rodzice?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-secondary/20 border-none shadow-sm"
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-foreground/80 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
