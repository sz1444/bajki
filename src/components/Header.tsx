import { Headphones } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthButton } from "@/components/auth/AuthButton";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // If not on homepage, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Already on homepage, just scroll
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-white py-4 px-6 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <div className="bg-primary-foreground/20 p-2 rounded-full">
            <Headphones className="h-6 w-6 text-black" />
          </div>
          <span className="text-xl font-extrabold text-black">
            Bajkownik
          </span>
        </a>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#jak-to-dziala"
              onClick={(e) => handleSmoothScroll(e, 'jak-to-dziala')}
              className="text-black/80 hover:text-black transition-colors font-medium"
            >
              Jak to działa
            </a>
            <a
              href="#subscription"
              onClick={(e) => handleSmoothScroll(e, 'subscription')}
              className="text-black/80 hover:text-black transition-colors font-medium"
            >
              Cennik
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSmoothScroll(e, 'faq')}
              className="text-black/80 hover:text-black transition-colors font-medium"
            >
              FAQ
            </a>
            <a
              href="#footer"
              onClick={(e) => handleSmoothScroll(e, 'footer')}
              className="text-black/80 hover:text-black transition-colors font-medium"
            >
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
