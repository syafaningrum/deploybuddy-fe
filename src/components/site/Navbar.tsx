import { Rocket } from "lucide-react";
import { useState, useEffect } from "react";

const links = ["Product", "Features", "How It Works", "Providers", "Pricing", "Keys"];

export function Navbar() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = links.map((l) => l.toLowerCase().replace(/\s/g, "-"));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 shadow-card">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary glow">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-semibold tracking-tight">DeployBuddy</span>
        </a>
        <ul className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {links.map((l) => {
            const id = l.toLowerCase().replace(/\s/g, "-");
            const isActive = activeSection === id;
            return (
              <li key={l}>
                
                  href={`#${id}`}
                  className={`transition-colors ${
                    isActive
                      ? "font-semibold text-foreground"
                      : "hover:text-foreground"
                  }`}
                >
                  {l}
                </a>
              </li>
            );
          })}
        </ul>
        
       href={`#${id}`}
  className={["transition-colors", isActive ? "font-semibold text-foreground" : "hover:text-foreground"].join(" ")}
>
  {l}
</a>
}