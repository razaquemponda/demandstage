import { Link } from "react-router-dom";
import { Music, Mail, Phone, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mb-16 md:mb-0">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold mb-3">
              <Music className="h-5 w-5 text-primary" />
              <span>Demand<span className="text-primary">Stage</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Where fans decide the next stage. Vote for the artist you want to see perform in your city.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/vote" className="hover:text-primary transition-colors">Vote Now</Link>
              <Link to="/results" className="hover:text-primary transition-colors">View Results</Link>
              <Link to="/sponsors" className="hover:text-primary transition-colors">For Sponsors</Link>
              <Link to="/events" className="hover:text-primary transition-colors">Upcoming Events</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/auth" className="hover:text-primary transition-colors">Sign Up / Login</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Contact Us</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href="mailto:contact@demandstage.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary" />
                contact@demandstage.com
              </a>
              <a className="flex items-center gap-2 hover:text-primary transition-colors" href="tel:+265 897 220 259">  
<Phone className="h-4 w-4 text-primary" />
                +265 (897) 220-259
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DemandStage. All rights reserved.
        </div>
      </div>
    </footer>);

}
