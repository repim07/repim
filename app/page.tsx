"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Bell,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Tag,
  Calendar,
  Send,
  User,
  Plus,
  Minus,
  ExternalLink,
} from "lucide-react";

// =============================================================================
// DATA
// =============================================================================

const NAV_LINKS = [
  { label: "Acheter",  href: "/annonces?type=vente" },
  { label: "Louer",    href: "/annonces?type=location" },
  { label: "Vendre",   href: "/annonces/new" },
  { label: "Agents",   href: "#fonctionnalites" },
];

const PARTENAIRES: { label: string; href: string }[] = [
  { label: "Agences immobilieres agreees",      href: "/partenaires/inscription?categorie=agence" },
  { label: "Promoteurs immobiliers",            href: "/partenaires/inscription?categorie=promoteur" },
  { label: "Notaires",                          href: "/partenaires/inscription?categorie=notaire" },
  { label: "Cabinets juridiques specialises",   href: "/partenaires/inscription?categorie=cabinet_juridique" },
  { label: "Assurances",                        href: "/partenaires/inscription?categorie=assurance" },
  { label: "Huissiers de justice",              href: "/partenaires/inscription?categorie=huissier" },
  { label: "Architectes & Decorateurs",         href: "/partenaires/inscription?categorie=architecte" },
  { label: "Experts et conseillers immobiliers", href: "/partenaires/inscription?categorie=conseiller" },
  { label: "Autre professionnel",               href: "/partenaires/inscription?categorie=autre" },
];

const LANGUAGES = [
  { code: "FR", label: "Francais",  flag: "🇫🇷" },
  { code: "EN", label: "English",   flag: "🇬🇧" },
  { code: "AR", label: "عربي", flag: "🇸🇦" },
  { code: "CH", label: "中文",   flag: "🇨🇳" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Matching automatique",
    description:
      "Notre algorithme analyse vos criteres et vous propose en temps reel les biens qui correspondent exactement a votre profil et a votre budget.",
  },
  {
    icon: Video,
    title: "Visites virtuelles",
    description:
      "Visitez des biens a distance depuis votre telephone ou ordinateur. Economisez du temps et filtrez vos choix avant de vous deplacer.",
  },
  {
    icon: MessageSquare,
    title: "Chat integre",
    description:
      "Echangez directement avec les proprietaires, gerants ou agents depuis l'application. Rapide, securise et sans intermediaire inutile.",
  },
  {
    icon: Bell,
    title: "Notifications ciblees",
    description:
      "Soyez alerte des qu'un bien correspondant a votre recherche est publie. Ne manquez plus jamais une opportunite immobiliere.",
  },
];

const PROPERTY_TYPES = [
  { icon: TreePine,   label: "Terrains",               slug: "terrains",   description: "Particulier, communautaire, bail, agences" },
  { icon: Home,       label: "Villas & Appartements",  slug: "villas",     description: "Vente ou location, toutes gammes" },
  { icon: Briefcase,  label: "Opportunites d'Affaires", slug: "affaires",  description: "Decapage, bornage, viabilisation, lotissement" },
  { icon: Building,   label: "Gestions Immobilieres",  slug: "gestions",   description: "Suivi complet de vos biens" },
  { icon: Wrench,     label: "Renovations",             slug: "renovations", description: "Mise en relation avec les professionnels" },
  { icon: BadgeCheck, label: "Architecture & Deco",    slug: "architecture", description: "Architectes, decorateurs, design d'interieur" },
];

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Recherchez",
    description:
      "Definissez vos criteres : ville, quartier, budget, surface, standing. Parcourez des milliers d'annonces verifiees, avec photos et localisation sur carte.",
  },
  {
    number: "02",
    icon: Video,
    title: "Visitez",
    description:
      "Planifiez une visite physique ou virtuelle directement via l'app. Chattez avec le proprietaire ou l'agent, posez vos questions en temps reel.",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Concretisez",
    description:
      "Finalisez votre transaction en toute securite. Documents verifies, contrat de bail ou de vente, enregistrement automatique chez le notaire.",
  },
];

const STATS = [
  { value: "100%",   label: "Annonces verifiees par notre equipe" },
  { value: "2 500+", label: "Agents & agences certifies" },
  { value: "1,5 M",  label: "Diaspora ivoirienne ciblee" },
  { value: "150+",   label: "Promoteurs & investisseurs" },
];

const TESTIMONIALS = [
  {
    name: "Amina K.",
    role: "Locataire — Abidjan",
    avatar: "AK",
    rating: 5,
    text: "REPIM m'a permis de trouver mon appartement en moins de 3 semaines. Le matching automatique m'a envoye exactement ce que je cherchais sans perdre de temps.",
  },
  {
    name: "Moussa D.",
    role: "Investisseur immobilier",
    avatar: "MD",
    rating: 5,
    text: "J'ai gere deux transactions depuis la diaspora grace aux visites virtuelles. La transparence et la securite de REPIM m'ont vraiment rassure.",
  },
  {
    name: "Sophie L.",
    role: "Proprietaire vendeur",
    avatar: "SL",
    rating: 5,
    text: "J'ai publie mon bien et recu des demandes qualifiees le lendemain. Le tableau de bord pour gerer mes annonces est vraiment intuitif.",
  },
  {
    name: "Yves K.",
    role: "PRO Agence — Cocody",
    avatar: "YK",
    rating: 5,
    text: "En tant qu'agence certifiee REPIM, j'ai triple mon volume de contacts en 2 mois. La plateforme attire des clients serieux et bien informes.",
  },
];

const PLANS = [
  { label: "Mensuel",     price: "20 000",  devise: "XOF/mois",   euro: "30,49 EUR",   highlight: false },
  { label: "Trimestriel", price: "56 500",  devise: "XOF/trim.",  euro: "86,14 EUR",   highlight: false },
  { label: "Semestriel",  price: "115 000", devise: "XOF/6 mois", euro: "175,33 EUR",  highlight: true  },
  { label: "Annuel",      price: "200 000", devise: "XOF/an",     euro: "304,90 EUR",  highlight: false },
];

const FAQ_ITEMS = [
  {
    q: "REPIM est-il gratuit pour les chercheurs ?",
    a: "Oui, la navigation, la recherche et la consultation des annonces sont totalement gratuites pour les locataires et acheteurs. Seuls les professionnels (agences, promoteurs, proprietaires) souscrivent a un abonnement pour publier des annonces.",
  },
  {
    q: "Comment fonctionne la verification des annonces ?",
    a: "Chaque annonce est soumise a une verification manuelle par notre equipe avant publication. Les professionnels doivent fournir un dossier KYC complet (pieces d'identite, agrement MCLU, RCCM pour les agences). Cela garantit zero arnaque sur la plateforme.",
  },
  {
    q: "Puis-je visiter un bien a distance ?",
    a: "Absolument. REPIM propose des visites virtuelles integrees pour la plupart des biens disponibles. Vous pouvez aussi planifier une visite physique directement depuis la fiche du bien.",
  },
  {
    q: "Combien de temps dure la validation de mon dossier KYC ?",
    a: "La validation prend generalement entre 24 et 48 heures ouvrables. Vous recevez une notification par email et dans votre tableau de bord des que votre dossier est traite.",
  },
  {
    q: "Comment contacter le proprietaire ou l'agent d'un bien ?",
    a: "Depuis la fiche d'un bien, vous pouvez envoyer un message via le chat integre, appeler directement ou demander une visite. Toutes les communications sont tracees pour votre securite.",
  },
  {
    q: "Est-ce que REPIM est disponible en dehors de Cote d'Ivoire ?",
    a: "REPIM est actuellement concentre sur la Cote d'Ivoire, mais la plateforme est accessible partout dans le monde. Les membres de la diaspora ivoirienne peuvent rechercher, favoriser et contacter des vendeurs sans se deplacer.",
  },
  {
    q: "Comment utiliser un code promo ?",
    a: "Lors de la souscription a un abonnement, entrez votre code promo dans le champ dedie avant de valider le paiement. La reduction s'applique immediatement. Les codes sont valables une seule fois et ne sont pas cumulables.",
  },
  {
    q: "Puis-je changer mon abonnement en cours de periode ?",
    a: "Oui, vous pouvez passer a un plan superieur a tout moment depuis votre tableau de bord. La difference de montant est proratisee. Le passage a un plan inferieur prend effet a la prochaine echeance.",
  },
];

const EVENTS = [
  {
    date: "15 Juin 2026",
    type: "Webinaire",
    typeCls: "bg-blue-100 text-blue-700",
    title: "Investir dans l'immobilier ivoirien depuis la diaspora",
    desc: "Conseils pratiques, financement, pieges a eviter — avec un expert REPIM et un notaire invite.",
    seats: "Places limitees",
    link: "#",
  },
  {
    date: "28 Juin 2026",
    type: "Salon",
    typeCls: "bg-green-100 text-green-700",
    title: "Salon REPIM Abidjan 2026 — Edition Speciale",
    desc: "Rencontrez plus de 50 agences et promoteurs certifies en un seul lieu. Entree gratuite sur inscription.",
    seats: "Inscription gratuite",
    link: "#",
  },
  {
    date: "10 Juil. 2026",
    type: "Atelier",
    typeCls: "bg-orange-100 text-orange-700",
    title: "Comprendre le dossier KYC : guide pas a pas",
    desc: "Session pratique pour les nouveaux professionnels : comment preparer et deposer votre dossier en 30 minutes.",
    seats: "20 participants max",
    link: "#",
  },
];

const FOOTER_LINKS = {
  Plateforme: [
    { label: "Acheter",         href: "/annonces?type=vente" },
    { label: "Louer",           href: "/annonces?type=location" },
    { label: "Vendre",          href: "/annonces/new" },
    { label: "Estimer mon bien", href: "#tarifs" },
  ],
  Aide: [
    { label: "Comment ca marche", href: "#comment-ca-marche" },
    { label: "FAQ",                href: "#faq" },
    { label: "Contact",            href: "#contact" },
    { label: "Blog immobilier",    href: "#" },
  ],
  Legal: [
    { label: "CGU",                        href: "/conditions-generales" },
    { label: "Confidentialite",            href: "/politique-de-confidentialite" },
    { label: "Mentions legales",           href: "/mentions-legales" },
  ],
};

// =============================================================================
// COMPONENTS
// =============================================================================

function Navbar() {
  const [open, setOpen]                   = useState(false);
  const [dropdown, setDropdown]           = useState(false);
  const [dropdownPos, setDropdownPos]     = useState({ top: 0, left: 0 });
  const [mobileDropdown, setMobileDropdown] = useState(false);
  const [langOpen, setLangOpen]           = useState(false);
  const [lang, setLang]                   = useState(LANGUAGES[0]);
  const [userInitials, setUserInitials]   = useState<string | null>(null);
  const [userEmail, setUserEmail]         = useState<string | null>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const btnRef       = useRef<HTMLButtonElement>(null);
  const langRef      = useRef<HTMLDivElement>(null);

  // Fetch auth session client-side
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email ?? "";
        setUserEmail(email);
        // Try to build initials from email
        const parts = email.split("@")[0].split(/[.\-_]/);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : email.slice(0, 2).toUpperCase();
        setUserInitials(initials);
      }
    });
  }, []);

  // Fetch nom from profiles for better initials
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nom")
        .eq("id", session.user.id)
        .single();
      if (data?.nom) {
        const parts = (data.nom as string).trim().split(" ");
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : (data.nom as string).slice(0, 2).toUpperCase();
        setUserInitials(initials);
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
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

              <div
                style={{
                  position: "fixed",
                  top: dropdownPos.top,
                  left: Math.max(8, dropdownPos.left),
                  width: 288,
                  zIndex: 9999,
                  opacity: dropdown ? 1 : 0,
                  pointerEvents: dropdown ? "auto" : "none",
                  transform: dropdown ? "translateY(0)" : "translateY(-8px)",
                  transition: "opacity 0.15s ease, transform 0.15s ease",
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

            {/* Language selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-orange-500 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <span>{lang.flag}</span>
                <span>{lang.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-50">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${l.code === lang.code ? "bg-orange-50 text-orange-600" : "text-stone-700 hover:bg-stone-50"}`}>
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                      {l.code === lang.code && <CheckCircle className="w-3 h-3 ml-auto text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth: avatar si connecte, sinon lien */}
            {userInitials ? (
              <a href="/dashboard" title={userEmail ?? "Mon espace"}
                className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white text-xs font-bold transition-colors shadow-sm">
                {userInitials}
              </a>
            ) : (
              <a href="/auth/login"
                className="text-sm font-medium text-stone-700 hover:text-orange-500 transition-colors px-3 py-2">
                Se connecter
              </a>
            )}

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

            {/* Mobile language selector */}
            <div className="px-3 py-2">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-2">Langue</p>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => setLang(l)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${l.code === lang.code ? "border-orange-400 bg-orange-50 text-orange-600" : "border-stone-200 text-stone-600 hover:border-orange-300"}`}>
                    <span>{l.flag}</span>
                    <span>{l.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              {userInitials ? (
                <a href="/dashboard"
                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-orange-600">
                  <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">{userInitials}</span>
                  Mon espace
                </a>
              ) : (
                <a href="/auth/login"
                  className="block text-center py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 transition-colors">
                  Se connecter
                </a>
              )}
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
              L&apos;immobilier digital de reference en Afrique
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight mb-4">
              Vos recherches immobilieres{" "}
              <span className="text-orange-500">enfin simplifiees.</span>
              <br />Donnez vie a vos projets.
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed mb-4 max-w-xl">
              REPIM digitalise l&apos;ensemble du parcours immobilier &mdash; de la recherche a la signature. Annonces fiables, matching automatique, visites virtuelles et transactions securisees.
            </p>

            <p className="text-sm font-bold text-orange-700 tracking-widest uppercase mb-8">
              Securite &middot; Impact &middot; Simplicite
            </p>

            {/* Search bar */}
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
                {isPending ? "..." : "Rechercher"}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-orange-500" />Annonces verifiees</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-orange-500" />Mises en relation securisees</span>
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

          {/* Visual */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden">
                <Image
                  src="/villa-hero.jpg"
                  alt="Villa haut standing REPIM"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Disponible sur REPIM &middot; Abidjan
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400">Signalement rapide</p>
                  <p className="text-sm font-bold text-stone-900">Zero tolerance arnaque</p>
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
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Fonctionnalites intelligentes</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
            Tout ce dont vous avez besoin,
            <br className="hidden sm:block" /> au meme endroit
          </h2>
          <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">
            REPIM reunit les meilleurs outils pour simplifier chaque etape de votre projet immobilier en Afrique.
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
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">En 3 etapes</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">Comment ca marche ?</h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">
            De la recherche a la signature, REPIM vous accompagne a chaque etape de votre projet immobilier.
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
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Temoignages</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">Ils ont trouve avec REPIM</h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">
            Des milliers d&apos;utilisateurs font confiance a REPIM pour leurs projets immobiliers.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name}
              className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-6 italic flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold flex-shrink-0">
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

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
            Questions frequentes
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            Tout ce que vous devez savoir sur REPIM.
          </p>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}
                className={`bg-white rounded-2xl border transition-all duration-200 ${isOpen ? "border-orange-300 shadow-md" : "border-stone-100 shadow-sm"}`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-orange-600" : "text-stone-800"}`}>
                    {item.q}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-500"}`}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-stone-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-stone-400 mb-3">Vous ne trouvez pas votre reponse ?</p>
          <a href="#contact"
            onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            Contactez notre equipe
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section id="evenements" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Webinaires & Salons</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
            Evenements a venir
          </h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">
            Rencontrez nos experts, participez aux salons et decouvrez les opportunites immobilieres en Cote d&apos;Ivoire.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {EVENTS.map((ev, i) => (
            <div key={i}
              className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${ev.typeCls}`}>
                  <Calendar className="w-3 h-3" />
                  {ev.type}
                </span>
                <span className="text-xs text-stone-400 font-medium">{ev.date}</span>
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">{ev.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-5">{ev.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-500">{ev.seats}</span>
                <a href={ev.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 group-hover:text-orange-500 transition-colors">
                  S&apos;inscrire
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoCode() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    // Simulation — a brancher a une vraie API promo
    if (code.toUpperCase() === "REPIM2026") {
      setStatus("ok");
    } else {
      setStatus("error");
    }
  }

  return (
    <section id="promo" className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Tag className="w-3.5 h-3.5" />
              Code promotionnel
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Vous avez un code promo ?
            </h2>
            <p className="text-orange-100 text-sm leading-relaxed max-w-sm">
              Entrez votre code pour beneficier d&apos;une reduction exclusive sur votre abonnement REPIM PRO. Valable sur tous les plans.
            </p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[360px]">
            <form onSubmit={handleCheck} className="flex gap-2">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                <Tag className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setStatus("idle"); }}
                  placeholder="Ex : REPIM2026"
                  className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent uppercase tracking-widest font-semibold"
                />
              </div>
              <button type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
                Appliquer
              </button>
            </form>
            {status === "ok" && (
              <p className="mt-2 text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Code valide ! Reduction appliquee a la souscription.
              </p>
            )}
            {status === "error" && (
              <p className="mt-2 text-sm font-semibold text-orange-100 flex items-center gap-2">
                <X className="w-4 h-4" /> Code invalide ou expire. Veuillez reessayer.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
            Un acces premium, sans mauvaise surprise
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            Gratuit pour les locataires et acheteurs &middot; Abonnement pour les professionnels et proprietaires
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
                  Populaire
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
                  {plan.euro}
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
          Recherche et navigation gratuites pour tous les utilisateurs &middot; Sans engagement
        </p>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, start] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    start(async () => {
      // Simulation — a brancher a une liste email (Mailchimp, Resend, etc.)
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
    });
  }

  return (
    <section id="newsletter" className="py-16 bg-white border-t border-stone-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Bell className="w-3.5 h-3.5" />
          Newsletter immobiliere
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">
          Restez informes des nouvelles opportunites
        </h2>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed">
          Recevez chaque semaine les meilleures annonces, les actualites du marche ivoirien et les invitations a nos evenements.
        </p>
        {sent ? (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-6 py-3 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            Merci ! Vous recevrez notre prochaine newsletter.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none"
              />
            </div>
            <button type="submit" disabled={isPending}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
              <Send className="w-4 h-4" />
              {isPending ? "..." : "S'abonner"}
            </button>
          </form>
        )}
        <p className="mt-4 text-xs text-stone-400">
          Pas de spam. Desinscription en un clic. Donnees protegees.
        </p>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [isPending, start] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      // Simulation — a brancher a une server action ou Resend
      await new Promise((r) => setTimeout(r, 900));
      setSent(true);
    });
  }

  return (
    <section id="contact" className="py-20 lg:py-28 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: infos */}
          <div>
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Contact</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900 mb-5">
              Parlons de votre projet
            </h2>
            <p className="text-stone-500 text-base leading-relaxed mb-8">
              Une question sur la plateforme, un partenariat, une assistance technique ? Notre equipe vous repond sous 24h.
            </p>
            <div className="space-y-5">
              <a href="tel:+2250101042776"
                className="flex items-center gap-4 group">
                <div className="w-11 h-11 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">Telephone</p>
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-orange-600 transition-colors">
                    (+225) 01 01 042 776
                  </p>
                  <p className="text-sm text-stone-500">07 04 111 53</p>
                </div>
              </a>
              <a href="mailto:repim.ci1986@gmail.com"
                className="flex items-center gap-4 group">
                <div className="w-11 h-11 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-orange-600 transition-colors">
                    repim.ci1986@gmail.com
                  </p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">Adresse</p>
                  <p className="text-sm font-semibold text-stone-800">Abidjan, Cote d&apos;Ivoire</p>
                  <p className="text-xs text-stone-500">Accessible partout dans le monde</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">Message envoye !</h3>
                <p className="text-sm text-stone-500">Notre equipe vous repondra dans les 24 heures.</p>
                <button onClick={() => { setSent(false); setForm({ nom: "", email: "", message: "" }); }}
                  className="mt-5 text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Votre nom <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input name="nom" type="text" required value={form.nom} onChange={handleChange}
                      placeholder="Jean Konan"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Email <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      placeholder="votre@email.com"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Message <span className="text-orange-500">*</span>
                  </label>
                  <textarea name="message" required value={form.message} onChange={handleChange}
                    rows={5} placeholder="Decrivez votre demande..."
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none" />
                </div>
                <button type="submit" disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
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
          Securite &middot; Impact &middot; Simplicite
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
          Votre prochain chez-vous{" "}
          <span className="text-orange-400">commence ici.</span>
        </h2>
        <p className="text-lg text-orange-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Rejoignez des milliers d&apos;utilisateurs qui font confiance a REPIM pour leurs projets immobiliers. Transparence, rapidite et securite dans un secteur en pleine transformation.
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
          Securite &middot; Impact &middot; Simplicite &middot; Disponible sur Android, iOS & Web
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
              La marketplace immobiliere qui digitalise le parcours immobilier en Afrique &mdash; de la recherche a la signature.
            </p>
            <p className="text-xs font-semibold text-orange-500 tracking-widest uppercase mb-5">
              Securite &middot; Impact &middot; Simplicite
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Share2, Link2].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 bg-stone-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Reseau social">
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
            <a href="tel:+2250101042776" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" />
              (+225) 01 01 042 776
            </a>
            <a href="tel:+2250704111753" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" />
              07 04 111 53
            </a>
            <a href="mailto:repim.ci1986@gmail.com" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Mail className="w-4 h-4" />
              repim.ci1986@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            Disponible en Cote d&apos;Ivoire et en Afrique
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <p>&copy; {new Date().getFullYear()} REPIM. Tous droits reserves.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-orange-500 fill-orange-500 mx-0.5" /> pour l&apos;immobilier africain
          </p>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function LandingPage() {
  return (
    <main className="min-h-screen font-sans antialiased">
      <Navbar />
      <Hero />
      <PropertyTypes />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Events />
      <PromoCode />
      <Pricing />
      <Newsletter />
      <Contact />
      <FinalCTA />
      <Footer />
    </main>
  );
}
