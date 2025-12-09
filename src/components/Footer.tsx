import { Headphones, Mail, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
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

  return (
    <footer id="footer" className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <Headphones className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold">Bajkownik</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Tworzymy magiczne chwile dla dzieci i rodziców poprzez
              personalizowane bajki audio.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Nawigacja</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a
                  href="#jak-to-dziala"
                  onClick={(e) => handleSmoothScroll(e, 'jak-to-dziala')}
                  className="hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  Jak to działa
                </a>
              </li>
              <li>
                <a
                  href="#subscription"
                  onClick={(e) => handleSmoothScroll(e, 'subscription')}
                  className="hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  Cennik
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleSmoothScroll(e, 'faq')}
                  className="hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#footer"
                  onClick={(e) => handleSmoothScroll(e, 'footer')}
                  className="hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Kontakt</h4>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Mail className="w-4 h-4" />
              <a href="mailto:kontakt@Bajkownik" className="hover:text-primary-foreground transition-colors">
                kontakt@Bajkownik
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2024 Bajkownik. Wszystkie prawa zastrzeżone.</p>
          <p className="flex items-center gap-1">
            Stworzone z <Heart className="w-4 h-4 text-accent fill-accent" /> dla dzieci
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
