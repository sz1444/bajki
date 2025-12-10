import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Star, Shield } from "lucide-react"; 

const CallToActionBanner = () => {
    
    return (
        <div className="text-center">
            <div className="bg-white px-8 py-16 md:py-20 transition-all">
                
                <h3 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                    Niech Magia Zacznie Się Już Dziś!
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    To bajka, jakiej Twoje dziecko jeszcze nie słyszało.
                    **Opowieść stworzona, by trwać.**
                </p>

                {/* Sekcja Korzyści w formie ikon */}
                <div className="flex justify-center flex-wrap gap-6 mb-10">
                    <div className="flex flex-col items-center p-3">
                        <Star className="w-8 h-8 text-accent mb-2" />
                        <span className="text-sm font-semibold">10 Minut Magii</span>
                        <span className="text-xs text-muted-foreground">Najdłuższe historie</span>
                    </div>
                    <div className="flex flex-col items-center p-3">
                        <Shield className="w-8 h-8 text-accent mb-2" />
                        <span className="text-sm font-semibold">Anuluj Kiedy Chcesz</span>
                        <span className="text-xs text-muted-foreground">Bez Zobowiązań</span>
                    </div>
                    <div className="flex flex-col items-center p-3">
                        <Heart className="w-8 h-8 text-accent mb-2" />
                        <span className="text-sm font-semibold">Unikalna Treść</span>
                        <span className="text-xs text-muted-foreground">Tylko dla Niego/Niej</span>
                    </div>
                </div>
                <Button variant="hero" size="xl" asChild>
                    <a href="#subscription">Zobacz więcej</a>
                </Button>
            </div>
        </div>
    );
};

export default CallToActionBanner;