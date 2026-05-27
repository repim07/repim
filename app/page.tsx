"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  Bell,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Key,
  Heart,
  Phone,
  Mail,
  Globe,
  Share2,
  Link2,
  Handshake,
  Smartphone,
  Video,
  MessageSquare,
  Zap,
  Home,
  TreePine,
  Building,
  Briefcase,
  Wrench,
  BadgeCheck,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Acheter",  href: "/annonces?type=vente" },
  { label: "Louer",    href: "/annonces?type=location" },
  { label: "Vendre",   href: "/annonces/new" },
  { label: "Agents",   href: "#fonctionnalites" },
];

const PARTENAIRES: { label: string; href: string }[] = [
  { label: "Agences immobilières agréées",      href: "/partenaires/inscription?categorie=agence" },
  { label: "Promoteurs immobiliers",            href: "/partenaires/inscription?categorie=promoteur" },
  { label: "Notaires",                          href: "/partenaires/inscription?categorie=notaire" },
  { label: "Cabinets juridiques spécialisés",   href: "/partenaires/inscription?categorie=cabinet_juridique" },
  { label: "Assurances",                        href: "/partenaires/inscription?categorie=assurance" },
  { label: "Huissiers de justice",              href: "/partenaires/inscription?categorie=huissier" },
  { label: "Architectes & Décorateurs",         href: "/partenaires/inscription?categorie=architecte" },
  { label: "Experts et conseillers immobiliers",href: "/partenaires/inscription?categorie=conseiller" },
  { label: "Autre professionnel",               href: "/partenaires/inscription?categorie=autre" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Matching automatique",
    description:
      "Notre algorithme analyse vos critères et vous propose en temps réel les biens qui correspondent exactement à votre profil et à votre budget.",
  },
  {
    icon: Video,
    title: "Visites virtuelles",
    description:
      "Visitez des biens à distance depuis votre téléphone ou ordinateur. Économisez du temps et filtrez vos choix avant de vous déplacer.",
  },
  {
    icon: MessageSquare,
    title: "Chat intégré",
    description:
      "Échangez directement avec les propriétaires, gérants ou agents depuis l'application. Rapide, sécurisé et sans intermédiaire inutile.",
  },
  {
    icon: Bell,
    title: "Notifications ciblées",
    description:
      "Soyez alerté dès qu'un bien correspondant à votre recherche est publié. Ne manquez plus jamais une opportunité immobilière.",
  },
];

const PROPERTY_TYPES = [
  { icon: TreePine,   label: "Terrains",               slug: "terrains",   description: "Particulier, communautaire, bail, agences" },
  { icon: Home,       label: "Villas & Appartements",  slug: "villas",     description: "Vente ou location, toutes gammes" },
  { icon: Briefcase,  label: "Opportunités d'Affaires", slug: "affaires",  description: "Décapage, bornage, viabilisation, lotissement" },
  { icon: Building,   label: "Gestions Immobilières",  slug: "gestions",   description: "Suivi complet de vos biens" },
  { icon: Wrench,     label: "Rénovations",             slug: "renovations",description: "Mise en relation avec les professionnels" },
  { icon: BadgeCheck, label: "Architecture & Déco",    slug: "architecture",description: "Architectes, décorateurs, design d'intérieur" },
];

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Recherchez",
    description:
      "Définissez vos critères : ville, quartier, budget, surface, standing. Parcourez des milliers d'annonces vérifiées, avec photos et localisation sur carte.",
  },
  {
    number: "02",
    icon: Video,
    title: "Visitez",
    description:
      "Planifiez une visite physique ou virtuelle directement via l'app. Chattez avec le propriétaire ou l'agent, posez vos questions en temps réel.",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Concrétisez",
    description:
      "Finalisez votre transaction en toute sécurité. Documents vérifiés, contrat de bail ou de vente, enregistrement automatique chez le notaire.",
  },
];

const STATS = [
  { value: "100%",   label: "Annonces vérifiées par notre équipe" },
  { value: "2 500+", label: "Agents & agences certifiés" },
  { value: "1,5 M",  label: "Diaspora ivoirienne ciblée" },
  { value: "150+",   label: "Promoteurs & investisseurs" },
];

const TESTIMONIALS = [
  {
    name: "Amina K.",
    role: "Locataire — Abidjan",
    avatar: "AK",
    rating: 5,
    text: "REPIM m'a permis de trouver mon appartement en moins de 3 semaines. Le matching automatique m'a envoyé exactement ce que je cherchais sans perdre de temps.",
  },
  {
    name: "Moussa D.",
    role: "Investisseur immobilier",
    avatar: "MD",
    rating: 5,
    text: "J'ai géré deux transactions depuis la diaspora grâce aux visites virtuelles. La transparence et la sécurité de REPIM m'ont vraiment rassuré.",
  },
  {
    name: "Sophie L.",
    role: "Propriétaire vendeur",
    avatar: "SL",
    rating: 5,
    text: "J'ai publié mon bien et reçu des demandes qualifiées le lendemain. Le tableau de bord pour gérer mes annonces est vraiment intuitif.",
  },
];

const PLANS = [
  { label: "Mensuel",     price: "20 000",  devise: "XOF/mois",   euro: "30,49 €",   highlight: false },
  { label: "Trimestriel", price: "56 500",  devise: "XOF/trim.",  euro: "86,14 €",   highlight: false },
  { label: "Semestriel",  price: "115 000", devise: "XOF/6 mois", euro: "175,33 €",  highlight: true  },
  { label: "Annuel",      price: "200 000", devise: "XOF/an",     euro: "304,90 €",  highlight: false },
];

const FOOTER_LINKS = {
  Plateforme: [
    { label: "Acheter",         href: "/annonces?type=vente" },
    { label: "Louer",           href: "/annonces?type=location" },
    { label: "Vendre",          href: "/annonces/new" },
    { label: "Estimer mon bien", href: "#tarifs" },
  ],
  Aide: [
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "FAQ",                href: "#" },
    { label: "Contact",            href: "mailto:contact@repim.app" },
    { label: "Blog immobilier",    href: "#" },
  ],
  Légal: [
    { label: "CGU",                         href: "/conditions-generales" },
    { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
    { label: "Mentions légales",             href: "/mentions-legales" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen]                   = useState(false);
  const [dropdown, setDropdown]           = useState(false);
  const [dropdownPos, setDropdownPos]     = useState({ top: 0, left: 0 });
  const [mobileDropdown, setMobileDropdown] = useState(false);
  const dropdownRef    = useRef<HTMLDivElement>(null);
  const btnRef         = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <a href="/" className="flex items-center">
            <Image src="/logo-repim.png" alt="REPIM" width={120} height={40}
              className="h-10 w-auto object-contain" priority />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href}
                onClick={(e) => smoothScroll(e, link.href)}
                className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors">
                {link.label}
              </a>
            ))}

            {/* Dropdown Partenaires */}
            <div ref={dropdownRef} className="relative">
              <button
                ref={btnRef}
                onClick={() => {
                  if (!dropdown && btnRef.current) {
                    const r = btnRef.current.getBoundingClientRect();
                    setDropdownPos({ top: r.bottom + 8, left: r.left + r.width / 2 - 144 });
                  }
                  setDropdown(!dropdown);
                }}
                aria-expanded={dropdown} aria-haspopup="true"
                className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors focus:outline-none">
                Partenaires
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdown ? "rotate-180 text-orange-500" : ""}`} />
              </button>

              {/* position:fixed pour sortir du stacking context du header */}
              <div
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  left: Math.max(8, dropdownPos.left),
                  width: 288,
                  zIndex: 9999,
                  opacity: dropdown ? 1 : 0,
                  pointerEvents: dropdown ? 'auto' : 'none',
                  transform: dropdown ? 'translateY(0)' : 'translateY(-8px)',
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                }}
                className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden"
              >
                <div className="py-2">
                  <p className="px-4 pt-1 pb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
                    Nos partenaires
                  </p>
                  {PARTENAIRES.map((item) => (
                    <a key={item.label} href={item.href}
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-800 hover:bg-orange-50 hover:text-orange-600 font-medium transition-colors group/item">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-300 group-hover/item:bg-orange-500 flex-shrink-0 transition-colors" />
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/auth/login"
              className="text-sm font-medium text-stone-700 hover:text-orange-500 transition-colors px-3 py-2">
              Se connecter
            </a>
            <a href="/annonces/new"
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
              Publier une annonce
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {open && (
          <div className="md:hidden border-t border-stone-100 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href}
                onClick={(e) => { smoothScroll(e, link.href); setOpen(false); }}
                className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                {link.label}
              </a>
            ))}
            <div>
              <button onClick={() => setMobileDropdown(!mobileDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                <span>Partenaires</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdown ? "rotate-180 text-orange-500" : ""}`} />
              </button>
              {mobileDropdown && (
                <div className="mt-1 ml-3 border-l-2 border-orange-200 pl-3 space-y-0.5">
                  {PARTENAIRES.map((item) => (
                    <a key={item.label} href={item.href}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-stone-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                      <span className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <a href="/auth/login"
                className="block text-center py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 transition-colors">
                Se connecter
              </a>
              <a href="/annonces/new"
                className="block text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                Publier une annonce
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, start] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    start(() => {
      router.push(`/annonces${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
    });
  }

  return (
    <section id="hero" className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-orange-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              L&apos;immobilier digital de référence en Afrique
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight mb-4">
              Vos recherches immobilières{" "}
              <span className="text-orange-500">enfin simplifiées.</span>
              <br />Donnez vie à vos projets.
            </h1>

            <p className="text-sm font-semibold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 tracking-wide">
                La référence de ton Repère
              </span>
            </p>

            <p className="text-lg text-stone-600 leading-relaxed mb-4 max-w-xl">
              REPIM digitalise l&apos;ensemble du parcours immobilier — de la recherche à la signature. Annonces fiables, matching automatique, visites virtuelles et transactions sécurisées.
            </p>

            <p className="text-sm font-bold text-orange-700 tracking-widest uppercase mb-8">
              Sécurité · Impact · Simplicité
            </p>

            {/* Barre de recherche fonctionnelle */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ville, quartier, commune..."
                  className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors whitespace-nowrap">
                <Search className="w-5 h-5" />
                {isPending ? "…" : "Rechercher"}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-orange-500" />Annonces vérifiées</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-orange-500" />Mises en relation sécurisées</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-orange-500" />Disponible sur Android / iOS / Web</span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <a href="/auth/signup"
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                <Smartphone className="w-4 h-4" />
                Android & iOS
              </a>
              <a href="/auth/signup"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                <Globe className="w-4 h-4" />
                Web App
              </a>
            </div>
          </div>

          {/* Visuel */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden">
                <Image
                  src="/villa-hero.jpg"
                  alt="Villa haut standing — REPIM"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay gradient subtil en bas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Disponible sur REPIM · Abidjan
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400">Signalement rapide</p>
                  <p className="text-sm font-bold text-stone-900">Zéro tolérance arnaque</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400">Note utilisateurs</p>
                  <p className="text-sm font-bold text-stone-900">4,9 / 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 text-center hover:border-orange-200 hover:shadow-md transition-all">
              <p className="text-2xl lg:text-3xl font-extrabold text-orange-500 mb-1">{stat.value}</p>
              <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PropertyTypes() {
  return (
    <section id="types-de-biens" className="py-16 bg-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Ce que vous trouvez sur REPIM</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            Tous types de biens, une seule plateforme
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <a key={type.label} href={`/annonces?categorie=${type.slug}`}
                className="group flex flex-col items-center text-center bg-orange-900/50 hover:bg-orange-500 border border-orange-800 hover:border-orange-400 rounded-2xl p-4 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 bg-orange-800 group-hover:bg-orange-400 rounded-xl flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6 text-orange-300 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-bold text-orange-100 group-hover:text-white mb-1">{type.label}</p>
                <p className="text-xs text-orange-400 group-hover:text-orange-100 leading-tight transition-colors">{type.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="fonctionnalites" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Fonctionnalités intelligentes</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
            Tout ce dont vous avez besoin,
            <br className="hidden sm:block" /> au même endroit
          </h2>
          <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">
            REPIM réunit les meilleurs outils pour simplifier chaque étape de votre projet immobilier en Afrique.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title}
                className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-20 lg:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">En 3 étapes</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">Comment ça marche ?</h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">
            De la recherche à la signature, REPIM vous accompagne à chaque étape de votre projet immobilier.
          </p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-white border-4 border-orange-200 rounded-full flex items-center justify-center shadow-md">
                    <Icon className="w-9 h-9 text-orange-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <a href="/auth/signup"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors">
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="temoignages" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Témoignages</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">Ils ont trouvé avec REPIM</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name}
              className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fallback : affiche les cartes après 800ms si l'observer ne se déclenche pas
    const fallback = setTimeout(() => setInView(true), 800);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); clearTimeout(fallback); } },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <section id="tarifs" className="py-20 lg:py-28 bg-stone-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Tarifs</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
            Un accès premium, sans mauvaise surprise
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            Gratuit pour les locataires et acheteurs · Abonnement pour les professionnels et propriétaires
          </p>
        </div>

        <div ref={sectionRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          {PLANS.map((plan, index) => (
            <div key={plan.label}
              style={{ animationDelay: `${index * 120}ms` }}
              className={[
                "pricing-card group relative rounded-2xl border cursor-default",
                "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                inView ? "in-view" : "",
                plan.highlight
                  ? "pricing-card-glow bg-orange-500 border-orange-400 scale-105 p-7"
                  : "bg-white border-stone-100 shadow-sm hover:scale-[1.04] hover:shadow-xl hover:border-orange-300 p-6",
              ].join(" ")}
            >
              {plan.highlight && (
                <div className="pricing-badge absolute -top-3.5 left-1/2 whitespace-nowrap bg-orange-800 text-white text-xs font-extrabold px-4 py-1 rounded-full shadow-md">
                  ⭐ Populaire
                </div>
              )}

              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${plan.highlight ? "text-orange-200" : "text-stone-400"}`}>
                {plan.label}
              </p>

              <div className={`transition-transform duration-300 ${plan.highlight ? "" : "group-hover:scale-105 origin-left"}`}>
                <p className={`text-4xl font-extrabold leading-none mb-1 ${plan.highlight ? "text-white" : "text-stone-900"}`}>
                  {plan.price}
                </p>
                <p className={`text-xs mt-1 ${plan.highlight ? "text-orange-200" : "text-stone-400"}`}>{plan.devise}</p>
                <p className={`text-xs font-semibold mt-0.5 mb-6 ${plan.highlight ? "text-orange-200" : "text-stone-400"}`}>
                  ≈ {plan.euro}
                </p>
              </div>

              <div className={`h-px mb-6 transition-all duration-500 ${plan.highlight ? "bg-orange-400" : "bg-stone-100 group-hover:bg-orange-200"}`} />

              <a href="/auth/signup"
                className={[
                  "pricing-btn-shimmer relative overflow-hidden block text-center text-sm font-bold",
                  "py-2.5 rounded-xl transition-all duration-300",
                  plan.highlight
                    ? "bg-white text-orange-600 hover:bg-orange-50 hover:scale-[1.03] shadow-md"
                    : "bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-[1.03] hover:shadow-md",
                ].join(" ")}
              >
                Choisir ce plan
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-10">
          Recherche et navigation gratuites pour tous les utilisateurs · Sans engagement
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="rejoindre" className="py-20 lg:py-28 bg-orange-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-900/60 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Key className="w-3.5 h-3.5" />
          La référence de l&apos;immobilier digital en Afrique
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
          Votre prochain chez-vous{" "}
          <span className="text-orange-400">commence ici.</span>
        </h2>
        <p className="text-lg text-orange-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Rejoignez des milliers d&apos;utilisateurs qui font confiance à REPIM pour leurs projets immobiliers. Transparence, rapidité et sécurité dans un secteur en pleine transformation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/annonces"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-colors text-base">
            Trouver mon bien
            <ArrowRight className="w-5 h-5" />
          </a>
          <a href="/annonces/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-orange-700 hover:border-orange-500 text-orange-300 hover:text-orange-200 font-semibold px-8 py-4 rounded-xl transition-colors text-base">
            <Heart className="w-5 h-5" />
            Publier une annonce
          </a>
        </div>
        <p className="mt-6 text-xs text-orange-700">
          Sécurité · Impact · Simplicité · Disponible sur Android, iOS & Web
        </p>
      </div>
    </section>
  );
}

function Footer() {
  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-14 pb-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-stone-800">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <a href="/">
              <Image src="/logo-repim.png" alt="REPIM" width={110} height={36}
                className="h-9 w-auto object-contain mb-4 brightness-0 invert" />
            </a>
            <p className="text-sm leading-relaxed max-w-xs mb-3">
              La marketplace immobilière qui digitalise le parcours immobilier en Afrique — de la recherche à la signature.
            </p>
            <p className="text-xs font-semibold text-orange-500 tracking-widest uppercase mb-5">
              Sécurité · Impact · Simplicité
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Share2, Link2].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 bg-stone-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Réseau social">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white text-sm font-semibold mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      onClick={(e) => smoothScroll(e, link.href)}
                      className="text-sm hover:text-orange-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="tel:+2250704111753" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" />
              +225 07 04 11 17 53
            </a>
            <a href="mailto:contact@repim.app" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Mail className="w-4 h-4" />
              contact@repim.app
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            Disponible en Côte d&apos;Ivoire et en Afrique
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} REPIM. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-orange-500 fill-orange-500 mx-0.5" /> pour l&apos;immobilier africain
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen font-sans antialiased">
      <Navbar />
      <Hero />
      <PropertyTypes />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
