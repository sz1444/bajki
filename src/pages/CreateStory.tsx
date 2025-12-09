import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query'; // Import useMutation
import { supabase } from '@/config/supabase'; // Załóż, że masz ten plik
import { toast } from 'sonner'; // Do wyświetlania powiadomień
import { useSubscription } from '@/lib/hooks/useSubscription';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, User, Wand2, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Lista kroków
const steps = [
  { number: 1, title: "Bohater & Kontekst", icon: User },
  { number: 2, title: "Styl & Fabuła", icon: Wand2 },
  { number: 3, title: "Morał & Długość", icon: Sparkles },
];

// Opcje (pozostawione bez zmian)
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
    const { hasActiveSubscription, canCreateStory, subscription, isLoading: subscriptionLoading } = useSubscription();
    const [currentStep, setCurrentStep] = useState(1);

    // Check subscription access
    useEffect(() => {
        if (subscriptionLoading) return;

        if (!hasActiveSubscription) {
            toast.error('Musisz mieć aktywną subskrypcję aby tworzyć bajki');
            navigate('/dashboard');
            return;
        }

        if (!canCreateStory) {
            toast.error(`Wykorzystałeś już limit bajek w tym miesiącu (${subscription?.stories_limit} bajek)`);
            navigate('/dashboard');
            return;
        }
    }, [hasActiveSubscription, canCreateStory, subscription, navigate, subscriptionLoading]);

    // Dodano "storyLength" (wymagane w walidacji, mimo braku pola w UI)
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
        storyLength: "standard", // Dodane, aby walidacja w kroku 3 działała
    });
    const [error, setError] = useState(""); 

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    // --- LOGIKA SUPABASE I MUTACJI ---
    
    // Funkcja do wysłania danych do Supabase
    const sendDataToSupabase = async (payload) => {
        // Musisz pobrać user_id z sesji Supabase
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Użytkownik nie jest zalogowany.");
        }

        // Dane do wstawienia do tabeli 'stories'
        const storyData = {
            user_id: user.id,
            title: `Bajka dla ${payload.childName}`, // Wstępny tytuł
            child_name: payload.childName,
            child_age: parseInt(payload.childAge),
            story_genre: payload.storyGenre,
            story_tone: payload.storyTone,
            story_lesson: payload.storyLesson,
            current_emotional_challenge: payload.currentEmotionalChallenge || null,
            favorite_food_place: payload.favoriteFoodPlace || null,
            pet_mascot: payload.petMascot || null,
            request_dialog_humor: payload.requestDialogHumor,
            siblings_friends: payload.siblingsFriends || null,
            form_data: payload, // Zapisujemy cały payload jako JSONB dla historii
            status: 'generating', // Ustawiamy status jako 'generating'
            story_text: 'Oczekuje na generację...', // Wstępny tekst
        };

        const { data, error } = await supabase
            .from('stories')
            .insert([storyData])
            .select(); // Dodaj .select() by uzyskać wstawiony obiekt

        if (error) {
            throw error;
        }

        // Increment stories_used_this_period counter for the subscription
        if (subscription && subscription.stories_limit !== null) {
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    stories_used_this_period: subscription.stories_used_this_period + 1
                })
                .eq('user_id', user.id);

            if (updateError) {
                console.error('Failed to update subscription counter:', updateError);
                // Don't throw error here - story was created successfully
            }
        }

        return data;
    };

    // Hook do obsługi wysyłania danych
    const mutation = useMutation({
        mutationFn: sendDataToSupabase,
        onSuccess: (data) => {
            toast.success("Bajka została zapisana! Przekierowuję do panelu...");
            console.log("Zapisany obiekt:", data[0]);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        },
        onError: (error) => {
            console.error("Błąd podczas zapisywania danych w Supabase:", error);
            setError(`Wystąpił błąd serwera: ${error.message}. Spróbuj ponownie.`);
            toast.error("Wystąpił błąd serwera podczas zapisywania danych.");
        },
    });

    // --- FUNKCJE WALIDACJI I NAWIGACJI ---
    
    const validateStep = (step) => {
        let requiredFields = [];
        if (step === 1) {
            requiredFields = ["childName", "childAge"];
        } else if (step === 2) {
            requiredFields = ["storyGenre", "storyTone"];
        } else if (step === 3) {
            // Uwaga: Pole storyLength nie istnieje w UI, ale jest wymagane w walidacji
            requiredFields = ["storyLesson", "storyLength"]; 
        }

        const missingFields = requiredFields.filter(field => {
            const value = formData[field];
            return (typeof value === 'string' || typeof value === 'number') && value.toString().trim() === "";
        });

        if (missingFields.length > 0) {
            setError("Proszę wypełnić wszystkie wymagane pola (*).");
            return false;
        }
        
        // Dodatkowa walidacja wieku
        if (step === 1) {
            const age = parseInt(formData.childAge);
            if (isNaN(age) || age < 1 || age > 12) {
                setError("Wiek musi być liczbą całkowitą w zakresie 1-12.");
                return false;
            }
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

    const handleSubmit = () => {
        if (validateStep(currentStep)) {
            // Wysłanie danych przez mutację
            mutation.mutate(formData);
        }
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

                {/* Krok 2 */}
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
                            Przesłanie
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
                        
                        {/* UWAGA: Pole storyLength jest wymagane w walidacji, ale brakuje w UI. 
                           Jeśli jest to stała wartość, można ją usunąć z walidacji 
                           lub dodać tutaj pole RadioGroup/Select.
                           Na potrzeby integracji, pozostawiam je w walidacji i stanie.
                        */}
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-10 pt-6 border-t border-border">
                    <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1 || mutation.isPending}
                    className="px-6"
                    >
                    Wstecz
                    </Button>
                    
                    {currentStep < 3 ? (
                    <Button 
                        variant="hero" 
                        onClick={nextStep} 
                        className="px-8"
                        disabled={mutation.isPending}
                    >
                        Dalej
                    </Button>
                    ) : (
                    <Button
                        variant="hero"
                        onClick={handleSubmit}
                        disabled={mutation.isPending} // Wyłącz przycisk podczas wysyłania
                        className="px-8"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Tworzenie bajki...
                            </>
                        ) : (
                            "Stwórz Bajkę"
                        )}
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