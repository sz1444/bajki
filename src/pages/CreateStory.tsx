import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Check, User, Wand2, Sparkles, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Lista kroków
const steps = [
  { number: 1, title: "Bohater & Kontekst", icon: User },
  { number: 2, title: "Styl & Fabuła", icon: Wand2 },
  { number: 3, title: "Morał & Długość", icon: Sparkles },
];

// DODANE NOWE GATUNKI
const storyGenreOptions = [
    { value: "magiczny_realizm", label: "Magiczny realizm (Rzeczywistość + Czar)" },
    { value: "klasyczna_basn", label: "Klasyczna baśń (Królowie, Smoki, Las)" },
    { value: "przygoda_historyczna", label: "Przygoda historyczna / Fantastyka naukowa" },
    { value: "krytyczna_przygoda", label: "Kryminał / Tajemnicza zagadka" },
    { value: "podroz_kosmiczna", label: "Podróż kosmiczna / Futurystyczny świat" },
    { value: "fantastyka_zwierzeta", label: "Fantastyka ze zwierzętami (Mówiące zwierzęta)" },
    { value: "komedia_absurdalna", label: "Komedia absurdalna / Nonsens" },
];

const storyToneOptions = [
    { value: "relaksacyjny_usypiajacy", label: "Relaksacyjny / Na dobranoc" },
    { value: "dynamiczny_motywujacy", label: "Dynamiczny / Motywujący" },
    { value: "ciekawy_edukacyjny", label: "Ciekawy / Naukowa zagadka" },
];

const CreateStory = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        childName: "",
        childAge: "",
        siblingsFriends: "",
        petMascot: "", 
        favoriteFoodPlace: "",
        currentEmotionalChallenge: "",
        storyGenre: "",
        storyTone: "",
        requestDialogHumor: false,
        storyLesson: "",
        storyLength: "medium", 
    });
    const [error, setError] = useState(""); 

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    // Funkcja walidacji
    const validateStep = (step) => {
        let requiredFields = [];
        if (step === 1) {
            requiredFields = ["childName", "childAge"];
        } else if (step === 2) {
            requiredFields = ["storyGenre", "storyTone"];
        } else if (step === 3) {
            requiredFields = ["storyLesson", "storyLength"];
        }

        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return typeof value === 'string' && value.trim() === "";
        });

        if (missingFields.length > 0) {
            setError("Proszę wypełnić wszystkie wymagane pola (*).");
            return false;
        }
        setError("");
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const isFieldInvalid = (field) => {
        const isRequired = 
          (currentStep === 1 && (field === "childName" || field === "childAge")) ||
          (currentStep === 2 && (field === "storyGenre" || field === "storyTone")) || 
          (currentStep === 3 && (field === "storyLesson" || field === "storyLength"));
          
        return isRequired && formData[field].toString().trim() === "" && error !== "";
    };

    return (
        <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12 md:py-20">
            <div className="container mx-auto px-4">
            {/* Step indicators */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-4 md:gap-8">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            currentStep >= step.number 
                            ? "bg-accent text-accent-foreground" 
                            : "bg-secondary text-muted-foreground"
                        }`}
                        >
                        {currentStep > step.number ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <step.icon className="w-5 h-5" />
                        )}
                        </div>
                        <span className={`mt-2 text-sm font-medium ${
                        currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                        }`}>
                        {step.title}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`hidden md:block w-16 lg:w-24 h-0.5 mx-4 ${
                        currentStep > step.number ? "bg-accent" : "bg-secondary"
                        }`} />
                    )}
                    </div>
                ))}
                </div>
            </div>

            {/* Form card */}
            <Card className="max-w-2xl mx-auto border-none shadow-lg bg-background">
                <CardContent className="p-8 md:p-10">
                
                {/* Komunikat o błędzie */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Krok 1 */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-foreground mb-6">
                            Bohater i Kontekst Rodzinny
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="childName">Imię głównego bohatera *</Label>
                            <Input 
                            id="childName"
                            value={formData.childName}
                            onChange={(e) => handleInputChange("childName", e.target.value)}
                            className={`h-12 ${isFieldInvalid('childName') ? 'border-red-500' : ''}`}
                            placeholder="np. Zosia, Kasia, Jaś"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="childAge">Wiek bohatera *</Label>
                            <Input 
                            id="childAge"
                            type="number"
                            min="1"
                            max="12"
                            value={formData.childAge}
                            onChange={(e) => handleInputChange("childAge", e.target.value)}
                            className={`h-12 ${isFieldInvalid('childAge') ? 'border-red-500' : ''}`}
                            placeholder="Wymagane"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="siblingsFriends">Imiona rodzeństwa / przyjaciół (opcjonalnie)</Label>
                            <Input 
                            id="siblingsFriends"
                            value={formData.siblingsFriends}
                            onChange={(e) => handleInputChange("siblingsFriends", e.target.value)}
                            className="h-12"
                            placeholder="np. Ania i Max"
                            />
                        </div>
                        
                        {/* POLE: ZWIERZAK/MASKOTKA */}
                        <div className="space-y-2">
                            <Label htmlFor="petMascot">Ulubiony zwierzak / maskotka (opcjonalnie)</Label>
                            <Input 
                            id="petMascot"
                            value={formData.petMascot}
                            onChange={(e) => handleInputChange("petMascot", e.target.value)}
                            className="h-12"
                            placeholder="np. pies Maks, pluszowy miś Misiek"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="favoriteFoodPlace">Ulubiona potrawa / miejsce (opcjonalnie)</Label>
                            <Input 
                            id="favoriteFoodPlace"
                            value={formData.favoriteFoodPlace}
                            onChange={(e) => handleInputChange("favoriteFoodPlace", e.target.value)}
                            className="h-12"
                            placeholder="np. plac zabaw 'Rakieta', pizza z ananasem"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currentEmotionalChallenge">Aktualne wyzwanie emocjonalne (opcjonalnie)</Label>
                            <Input 
                            id="currentEmotionalChallenge"
                            placeholder="np. strach przed ciemnością, nauka dzielenia się"
                            value={formData.currentEmotionalChallenge}
                            onChange={(e) => handleInputChange("currentEmotionalChallenge", e.target.value)}
                            className="h-12"
                            />
                        </div>
                    </div>
                )}

                {/* Krok 2 (ZModyfikowany) */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-foreground mb-6">
                            Styl, Emocje i Fabuła
                        </h2>

                        <div className="space-y-3">
                            <Label>Gatunek / Styl bajki *</Label>
                            <select 
                                value={formData.storyGenre}
                                onChange={(e) => handleInputChange("storyGenre", e.target.value)}
                                className={`w-full h-12 border rounded-lg px-3 ${isFieldInvalid('storyGenre') ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Wybierz</option>
                                {/* Użycie rozszerzonej listy */}
                                {storyGenreOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <Label>Preferowany ton historii *</Label>
                            <select 
                                value={formData.storyTone}
                                onChange={(e) => handleInputChange("storyTone", e.target.value)}
                                className={`w-full h-12 border rounded-lg px-3 ${isFieldInvalid('storyTone') ? 'border-red-500' : 'border-border'}`}
                            >
                                <option value="">Wybierz</option>
                                {storyToneOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input 
                                type="checkbox"
                                id="dialogHumor"
                                checked={formData.requestDialogHumor}
                                onChange={(e) => handleInputChange("requestDialogHumor", e.target.checked)}
                                className="w-4 h-4 text-accent border-border rounded focus:ring-accent/50"
                            />
                            <Label htmlFor="dialogHumor">Więcej dialogu / humoru (opcjonalne)</Label>
                        </div>
                    </div>
                )}

                {/* Krok 3 */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-foreground mb-6">
                            Przesłanie i Długość
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="storyLesson">Kluczowe przesłanie *</Label>
                            <Input 
                            id="storyLesson"
                            value={formData.storyLesson}
                            onChange={(e) => handleInputChange("storyLesson", e.target.value)}
                            className={`h-12 ${isFieldInvalid('storyLesson') ? 'border-red-500' : ''}`}
                            placeholder="np. Nauka cierpliwości i dzielenia się, nauka nowego słówka w języku angielskim"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Docelowa długość opowieści *</Label>
                            <RadioGroup 
                                value={formData.storyLength} 
                                onValueChange={(value) => handleInputChange("storyLength", value)}
                                className="space-y-3"
                            >
                                {["short", "medium", "long"].map((len) => (
                                <div key={len} className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${formData.storyLength === len ? 'border-accent ring-2 ring-accent/50' : 'border-border hover:border-accent/50'}`}>
                                    <RadioGroupItem value={len} id={len} />
                                    <Label htmlFor={len} className="cursor-pointer flex-1">
                                    {len === "short" ? "Krótka (~5 min)" : len === "medium" ? "Średnia (~10 min)" : "Długa (~15 min)"}
                                    </Label>
                                </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-10 pt-6 border-t border-border">
                    <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6"
                    >
                    Wstecz
                    </Button>
                    
                    {currentStep < 3 ? (
                    <Button variant="hero" onClick={nextStep} className="px-8">
                        Dalej
                    </Button>
                    ) : (
                    <Button 
                        variant="hero" 
                        onClick={() => {
                            if (validateStep(currentStep)) {
                                // Tutaj logika do wysłania danych i przekierowania do płatności
                                console.log("Finalne dane do wysłania (z maskotką):", formData); 
                                // navigate("/payment"); 
                            }
                        }}
                        className="px-8"
                    >
                        Stwórz Bajkę za 29,99 zł
                    </Button>
                    )}
                </div>
                </CardContent>
            </Card>
            </div>
        </main>
        <Footer />

        </div>
    );
};

export default CreateStory;