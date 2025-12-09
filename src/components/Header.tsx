import { Headphones } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";

const Header = () => {
  return (
    <header className="bg-white py-4 px-6 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-foreground/20 p-2 rounded-full">
            <Headphones className="h-6 w-6 text-black" />
          </div>
          <span className="text-xl font-extrabold text-black">
            Bajkownik
          </span>
        </div>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <a href="#jak-to-dziala" className="text-black/80 hover:text-black transition-colors font-medium">
              Jak to działa
            </a>
            <a href="#faq" className="text-black/80 hover:text-black transition-colors font-medium">
              FAQ
            </a>
            <a href="#footer" className="text-black/80 hover:text-black transition-colors font-medium">
              Kontakt
            </a>
          </nav>

          <AuthButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
