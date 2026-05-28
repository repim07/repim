"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LangProvider, useLang } from "@/lib/i18n/LangContext";
import type { LangCode } from "@/lib/i18n/translations";
import {
  Search, Bell, Star, ArrowRight, CheckCircle,
  MapPin, ChevronRight, ChevronDown, Menu, X,
  Key, Heart, Phone, Mail, Globe, Share2, Link2,
  Handshake, Smartphone, Video, MessageSquare,
  Zap, Home, TreePine, Building, Briefcase,
  Wrench, BadgeCheck, Tag, Calendar, Send,
  User, Plus, Minus, ExternalLink,
} from "lucide-react";

// =============================================================================
// CONSTANTES STATIQUES (URLs, icones — pas traduites)
// =============================================================================

const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: "FR", label: "Francais", flag: "🇫🇷" },
  { code: "EN", label: "English",  flag: "🇬🇧" },
  { code: "AR", label: "عربي",     flag: "🇸🇦" },
  { code: "CH", label: "中文",      flag: "🇨🇳" },
];

const PARTNER_HREFS = [
  { key: "agence",           href: "/partenaires/inscription?categorie=agence" },
  { key: "promoteur",        href: "/partenaires/inscription?categorie=promoteur" },
  { key: "notaire",          href: "/partenaires/inscription?categorie=notaire" },
  { key: "cabinet_juridique",href: "/partenaires/inscription?categorie=cabinet_juridique" },
  { key: "assurance",        href: "/partenaires/inscription?categorie=assurance" },
  { key: "huissier",         href: "/partenaires/inscription?categorie=huissier" },
  { key: "architecte",       href: "/partenaires/inscription?categorie=architecte" },
  { key: "conseiller",       href: "/partenaires/inscription?categorie=conseiller" },
  { key: "autre",            href: "/partenaires/inscription?categorie=autre" },
];

// Labels partenaires fixes (toujours en francais dans le menu)
const PARTNER_LABELS = [
  "Agences immobilieres agreees",
  "Promoteurs immobiliers",
  "Notaires",
  "Cabinets juridiques specialises",
  "Assurances",
  "Huissiers de justice",
  "Architectes & Decorateurs",
  "Experts et conseillers immobiliers",
  "Autre professionnel",
];

const PROPERTY_ICONS = [TreePine, Home, Briefcase, Building, Wrench, BadgeCheck];
const FEATURE_ICONS  = [Zap, Video, MessageSquare, Bell];
const STEP_ICONS     = [Search, Video, Handshake];

// =============================================================================
// NAVBAR
// =============================================================================

function Navbar() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen]                     = useState(false);
  const [dropdown, setDropdown]             = useState(false);
  const [dropdownPos, setDropdownPos]       = useState({ top: 0, left: 0 });
  const [mobileDropdown, setMobileDropdown] = useState(false);
  const [langOpen, setLangOpen]             = useState(false);
  const [userInitials, setUserInitials]     = useState<string | null>(null);
  const [userEmail, setUserEmail]           = useState<string | null>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email ?? "";
        setUserEmail(email);
        const parts = email.split("@")[0].split(/[.\-_]/);
        setUserInitials(parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : email.slice(0, 2).toUpperCase());
      }
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { data } = await supabase.from("profiles").select("nom").eq("id", session.user.id).single();
      if (data?.nom) {
        const parts = (data.nom as string).trim().split(" ");
        setUserInitials(parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (data.nom as string).slice(0, 2).toUpperCase());
      }
    });
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setDropdown(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function scroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  }

  const NAV = [
    { label: t.nav.buy,     href: "/annonces?type=vente" },
    { label: t.nav.rent,    href: "/annonces?type=location" },
    { label: t.nav.sell,    href: "/annonces/new" },
    { label: t.nav.agents,  href: "#fonctionnalites" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <a href="/" className="flex items-center">
            <Image src="/logo-repim.png" alt="REPIM" width={120} height={40} className="h-10 w-auto object-contain" priority />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => scroll(e, link.href)}
                className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors">
                {link.label}
              </a>
            ))}

            {/* Partenaires dropdown */}
            <div className="relative">
              <button ref={btnRef}
                onClick={() => {
                  if (!dropdown && btnRef.current) {
                    const r = btnRef.current.getBoundingClientRect();
                    setDropdownPos({ top: r.bottom + 8, left: r.left + r.width / 2 - 144 });
                  }
                  setDropdown(!dropdown);
                }}
                aria-expanded={dropdown}
                className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors focus:outline-none">
                {t.nav.partners}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdown ? "rotate-180 text-orange-500" : ""}`} />
              </button>

              <div style={{ position: "fixed", top: dropdownPos.top, left: Math.max(8, dropdownPos.left), width: 288, zIndex: 9999, opacity: dropdown ? 1 : 0, pointerEvents: dropdown ? "auto" : "none", transform: dropdown ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.15s ease, transform 0.15s ease" }}
                className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
                <div className="py-2">
                  <p className="px-4 pt-1 pb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">{t.nav.ourPartners}</p>
                  {PARTNER_HREFS.map((item, i) => (
                    <a key={item.key} href={item.href} onClick={() => setDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-800 hover:bg-orange-50 hover:text-orange-600 font-medium transition-colors group/item">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-300 group-hover/item:bg-orange-500 flex-shrink-0 transition-colors" />
                      {PARTNER_LABELS[i]}
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
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-orange-500 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
                <span>{LANGUAGES.find((l) => l.code === lang)?.flag}</span>
                <span>{lang}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-50">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${l.code === lang ? "bg-orange-50 text-orange-600" : "text-stone-700 hover:bg-stone-50"}`}>
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                      {l.code === lang && <CheckCircle className="w-3 h-3 ml-auto text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar ou connexion */}
            {userInitials ? (
              <a href="/dashboard" title={userEmail ?? t.nav.mySpace}
                className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white text-xs font-bold transition-colors shadow-sm">
                {userInitials}
              </a>
            ) : (
              <a href="/auth/login" className="text-sm font-medium text-stone-700 hover:text-orange-500 transition-colors px-3 py-2">
                {t.nav.signIn}
              </a>
            )}

            <a href="/annonces/new"
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
              {t.nav.publish}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors" aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-stone-100 py-4 space-y-1">
            {NAV.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => { scroll(e, link.href); setOpen(false); }}
                className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                {link.label}
              </a>
            ))}
            <div>
              <button onClick={() => setMobileDropdown(!mobileDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                <span>{t.nav.partners}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdown ? "rotate-180 text-orange-500" : ""}`} />
              </button>
              {mobileDropdown && (
                <div className="mt-1 ml-3 border-l-2 border-orange-200 pl-3 space-y-0.5">
                  {PARTNER_HREFS.map((item, i) => (
                    <a key={item.key} href={item.href}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-stone-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                      <span className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                      {PARTNER_LABELS[i]}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile language */}
            <div className="px-3 py-2">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-2">Langue</p>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${l.code === lang ? "border-orange-400 bg-orange-50 text-orange-600" : "border-stone-200 text-stone-600 hover:border-orange-300"}`}>
                    <span>{l.flag}</span>
                    <span>{l.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              {userInitials ? (
                <a href="/dashboard" className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-orange-600">
                  <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">{userInitials}</span>
                  {t.nav.mySpace}
                </a>
              ) : (
                <a href="/auth/login" className="block text-center py-2.5 text-sm font-medium text-stone-700 hover:text-orange-500 transition-colors">
                  {t.nav.signIn}
                </a>
              )}
              <a href="/annonces/new" className="block text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                {t.nav.publish}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// =============================================================================
// HERO
// =============================================================================

function Hero() {
  const { t } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, start] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    start(() => router.push(`/annonces${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`));
  }

  return (
    <section id="hero" className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-orange-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              {t.hero.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight mb-4">
              {t.hero.h1}{" "}
              <span className="text-orange-500">{t.hero.h1b}</span>
              <br />{t.hero.h1c}
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed mb-4 max-w-xl">{t.hero.subtitle}</p>
            <p className="text-sm font-bold text-orange-700 tracking-widest uppercase mb-8">{t.hero.tagline}</p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.hero.placeholder}
                  className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none" />
              </div>
              <button type="submit" disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors whitespace-nowrap">
                <Search className="w-5 h-5" />
                {isPending ? "..." : t.hero.searchBtn}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
              {[t.hero.check1, t.hero.check2, t.hero.check3].map((c) => (
                <span key={c} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-orange-500" />{c}</span>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <a href="/auth/signup" className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                <Smartphone className="w-4 h-4" />{t.hero.ctaAndroid}
              </a>
              <a href="/auth/signup" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                <Globe className="w-4 h-4" />{t.hero.ctaWeb}
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden">
                <Image src="/villa-hero.jpeg" alt="Villa haut standing REPIM" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    {t.hero.available}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400">{t.hero.quickReport}</p>
                  <p className="text-sm font-bold text-stone-900">{t.hero.noFraud}</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400">{t.hero.userRating}</p>
                  <p className="text-sm font-bold text-stone-900">4,9 / 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {t.hero.stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 text-center hover:border-orange-200 hover:shadow-md transition-all">
              <p className="text-2xl lg:text-3xl font-extrabold text-orange-500 mb-1">{stat.value}</p>
              <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PROPERTY TYPES
// =============================================================================

function PropertyTypes() {
  const { t } = useLang();
  return (
    <section id="types-de-biens" className="py-16 bg-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">{t.propertyTypes.badge}</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">{t.propertyTypes.h2}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {t.propertyTypes.items.map((type, i) => {
            const Icon = PROPERTY_ICONS[i];
            const slugs = ["terrains", "villas", "affaires", "gestions", "renovations", "architecture"];
            return (
              <a key={type.label} href={`/annonces?categorie=${slugs[i]}`}
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

// =============================================================================
// FEATURES
// =============================================================================

function Features() {
  const { t } = useLang();
  return (
    <section id="fonctionnalites" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.features.badge}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
            {t.features.h2a}<br className="hidden sm:block" /> {t.features.h2b}
          </h2>
          <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">{t.features.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((feat, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={feat.title} className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-500 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// HOW IT WORKS
// =============================================================================

function HowItWorks() {
  const { t } = useLang();
  return (
    <section id="comment-ca-marche" className="py-20 lg:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.howItWorks.badge}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">{t.howItWorks.h2}</h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">{t.howItWorks.subtitle}</p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
          {t.howItWorks.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div key={step.title} className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-white border-4 border-orange-200 rounded-full flex items-center justify-center shadow-md">
                    <Icon className="w-9 h-9 text-orange-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <a href="/auth/signup" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors">
            {t.howItWorks.cta}<ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// TESTIMONIALS
// =============================================================================

function Testimonials() {
  const { t } = useLang();
  return (
    <section id="temoignages" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.testimonials.badge}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">{t.testimonials.h2}</h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">{t.testimonials.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.testimonials.items.map((item) => (
            <div key={item.name} className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-6 italic flex-1">&ldquo;{item.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold flex-shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// FAQ
// =============================================================================

function FAQ() {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.faq.badge}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">{t.faq.h2}</h2>
          <p className="mt-4 text-lg text-stone-500">{t.faq.subtitle}</p>
        </div>
        <div className="space-y-3">
          {t.faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`bg-white rounded-2xl border transition-all duration-200 ${isOpen ? "border-orange-300 shadow-md" : "border-stone-100 shadow-sm"}`}>
                <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                  <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-orange-600" : "text-stone-800"}`}>{item.q}</span>
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
          <p className="text-sm text-stone-400 mb-3">{t.faq.noAnswer}</p>
          <a href="#contact"
            onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            {t.faq.contactTeam}<ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// EVENTS
// =============================================================================

function Events() {
  const { t } = useLang();
  return (
    <section id="evenements" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.events.badge}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">{t.events.h2}</h2>
          <p className="mt-4 text-lg text-stone-500 max-w-xl mx-auto">{t.events.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.events.items.map((ev, i) => (
            <div key={i} className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${ev.typeCls}`}>
                  <Calendar className="w-3 h-3" />{ev.type}
                </span>
                <span className="text-xs text-stone-400 font-medium">{ev.date}</span>
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">{ev.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-5">{ev.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-500">{ev.seats}</span>
                <a href={ev.link} className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 group-hover:text-orange-500 transition-colors">
                  {t.events.register}<ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PROMO CODE
// =============================================================================

function PromoCode() {
  const { t } = useLang();
  const [code, setCode]   = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus(code.toUpperCase() === "REPIM2026" ? "ok" : "error");
  }

  return (
    <section id="promo" className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Tag className="w-3.5 h-3.5" />{t.promo.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t.promo.h2}</h2>
            <p className="text-orange-100 text-sm leading-relaxed max-w-sm">{t.promo.subtitle}</p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[360px]">
            <form onSubmit={handleCheck} className="flex gap-2">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                <Tag className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <input type="text" value={code}
                  onChange={(e) => { setCode(e.target.value); setStatus("idle"); }}
                  placeholder={t.promo.placeholder}
                  className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent uppercase tracking-widest font-semibold" />
              </div>
              <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
                {t.promo.apply}
              </button>
            </form>
            {status === "ok" && (
              <p className="mt-2 text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />{t.promo.ok}
              </p>
            )}
            {status === "error" && (
              <p className="mt-2 text-sm font-semibold text-orange-100 flex items-center gap-2">
                <X className="w-4 h-4" />{t.promo.err}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PRICING
// =============================================================================

function Pricing() {
  const { t } = useLang();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fallback = setTimeout(() => setInView(true), 800);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); clearTimeout(fallback); } }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <section id="tarifs" className="py-20 lg:py-28 bg-stone-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.pricing.badge}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">{t.pricing.h2}</h2>
          <p className="mt-4 text-lg text-stone-500">{t.pricing.subtitle}</p>
        </div>
        <div ref={sectionRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          {t.pricing.plans.map((plan, index) => (
            <div key={plan.label}
              style={{ animationDelay: `${index * 120}ms` }}
              className={["pricing-card group relative rounded-2xl border cursor-default transition-[transform,box-shadow,border-color] duration-300 ease-out", inView ? "in-view" : "", plan.highlight ? "pricing-card-glow bg-orange-500 border-orange-400 scale-105 p-7" : "bg-white border-stone-100 shadow-sm hover:scale-[1.04] hover:shadow-xl hover:border-orange-300 p-6"].join(" ")}>
              {plan.highlight && (
                <div className="pricing-badge absolute -top-3.5 left-1/2 whitespace-nowrap bg-orange-800 text-white text-xs font-extrabold px-4 py-1 rounded-full shadow-md">
                  {t.pricing.popular}
                </div>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${plan.highlight ? "text-orange-200" : "text-stone-400"}`}>{plan.label}</p>
              <div className={`transition-transform duration-300 ${plan.highlight ? "" : "group-hover:scale-105 origin-left"}`}>
                <p className={`text-4xl font-extrabold leading-none mb-1 ${plan.highlight ? "text-white" : "text-stone-900"}`}>{plan.price}</p>
                <p className={`text-xs mt-1 ${plan.highlight ? "text-orange-200" : "text-stone-400"}`}>{plan.devise}</p>
                <p className={`text-xs font-semibold mt-0.5 mb-6 ${plan.highlight ? "text-orange-200" : "text-stone-400"}`}>{plan.euro}</p>
              </div>
              <div className={`h-px mb-6 transition-all duration-500 ${plan.highlight ? "bg-orange-400" : "bg-stone-100 group-hover:bg-orange-200"}`} />
              <a href="/auth/signup"
                className={["pricing-btn-shimmer relative overflow-hidden block text-center text-sm font-bold py-2.5 rounded-xl transition-all duration-300", plan.highlight ? "bg-white text-orange-600 hover:bg-orange-50 hover:scale-[1.03] shadow-md" : "bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-[1.03] hover:shadow-md"].join(" ")}>
                {t.pricing.choosePlan}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-stone-400 mt-10">{t.pricing.freeNote}</p>
      </div>
    </section>
  );
}

// =============================================================================
// NEWSLETTER
// =============================================================================

function Newsletter() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [isPending, start] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    start(async () => { await new Promise((r) => setTimeout(r, 800)); setSent(true); });
  }

  return (
    <section id="newsletter" className="py-16 bg-white border-t border-stone-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Bell className="w-3.5 h-3.5" />{t.newsletter.badge}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">{t.newsletter.h2}</h2>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed">{t.newsletter.subtitle}</p>
        {sent ? (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-6 py-3 rounded-xl">
            <CheckCircle className="w-4 h-4" />{t.newsletter.success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.placeholder}
                className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none" />
            </div>
            <button type="submit" disabled={isPending}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
              <Send className="w-4 h-4" />{isPending ? "..." : t.newsletter.btn}
            </button>
          </form>
        )}
        <p className="mt-4 text-xs text-stone-400">{t.newsletter.privacy}</p>
      </div>
    </section>
  );
}

// =============================================================================
// CONTACT
// =============================================================================

function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [isPending, start] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => { await new Promise((r) => setTimeout(r, 900)); setSent(true); });
  }

  return (
    <section id="contact" className="py-20 lg:py-28 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          <div>
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">{t.contact.badge}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900 mb-5">{t.contact.h2}</h2>
            <p className="text-stone-500 text-base leading-relaxed mb-8">{t.contact.subtitle}</p>
            <div className="space-y-5">
              <a href="tel:+2250101042776" className="flex items-center gap-4 group">
                <div className="w-11 h-11 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">{t.contact.phoneLabel}</p>
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-orange-600 transition-colors">(+225) 01 01 042 776</p>
                  <p className="text-sm text-stone-500">07 04 111 53</p>
                </div>
              </a>
              <a href="mailto:repim.ci1986@gmail.com" className="flex items-center gap-4 group">
                <div className="w-11 h-11 bg-orange-100 group-hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">{t.contact.emailLabel}</p>
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-orange-600 transition-colors">repim.ci1986@gmail.com</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">{t.contact.addressLabel}</p>
                  <p className="text-sm font-semibold text-stone-800">{t.contact.address}</p>
                  <p className="text-xs text-stone-500">{t.contact.worldwide}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{t.contact.sent}</h3>
                <p className="text-sm text-stone-500">{t.contact.sentSub}</p>
                <button onClick={() => { setSent(false); setForm({ nom: "", email: "", message: "" }); }}
                  className="mt-5 text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                  {t.contact.again}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {([ { key: "nom", label: t.contact.name, type: "text", ph: t.contact.namePh, Icon: User }, { key: "email", label: t.contact.email, type: "email", ph: t.contact.emailPh, Icon: Mail } ] as { key: "nom"|"email"; label: string; type: string; ph: string; Icon: React.ElementType }[]).map(({ key, label, type, ph, Icon }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label} <span className="text-orange-500">*</span></label>
                    <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <input name={key} type={type} required value={form[key]} onChange={handleChange}
                        placeholder={ph}
                        className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">{t.contact.message} <span className="text-orange-500">*</span></label>
                  <textarea name="message" required value={form.message} onChange={handleChange}
                    rows={5} placeholder={t.contact.messagePh}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none" />
                </div>
                <button type="submit" disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  {isPending ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t.contact.sending}</>
                  ) : (
                    <><MessageSquare className="w-4 h-4" />{t.contact.send}</>
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

// =============================================================================
// FINAL CTA
// =============================================================================

function FinalCTA() {
  const { t } = useLang();
  return (
    <section id="rejoindre" className="py-20 lg:py-28 bg-orange-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-900/60 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Key className="w-3.5 h-3.5" />{t.finalCta.badge}
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
          {t.finalCta.h2}{" "}<span className="text-orange-400">{t.finalCta.h2b}</span>
        </h2>
        <p className="text-lg text-orange-200 mb-10 max-w-2xl mx-auto leading-relaxed">{t.finalCta.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/annonces" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-colors text-base">
            {t.finalCta.cta1}<ArrowRight className="w-5 h-5" />
          </a>
          <a href="/annonces/new" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-orange-700 hover:border-orange-500 text-orange-300 hover:text-orange-200 font-semibold px-8 py-4 rounded-xl transition-colors text-base">
            <Heart className="w-5 h-5" />{t.finalCta.cta2}
          </a>
        </div>
        <p className="mt-6 text-xs text-orange-700">{t.finalCta.tagline}</p>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

function Footer() {
  const { t } = useLang();

  function scroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-14 pb-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-stone-800">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <a href="/">
              <Image src="/logo-repim.png" alt="REPIM" width={110} height={36} className="h-9 w-auto object-contain mb-4 brightness-0 invert" />
            </a>
            <p className="text-sm leading-relaxed max-w-xs mb-3">{t.footer.tagline}</p>
            <p className="text-xs font-semibold text-orange-500 tracking-widest uppercase mb-5">{t.footer.tagline2}</p>
            <div className="flex items-center gap-3">
              {[Globe, Share2, Link2].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-stone-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors" aria-label="Social">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {t.footer.sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-sm font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} onClick={(e) => scroll(e, link.href)} className="text-sm hover:text-orange-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="tel:+2250101042776" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" />(+225) 01 01 042 776
            </a>
            <a href="tel:+2250704111753" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone className="w-4 h-4" />07 04 111 53
            </a>
            <a href="mailto:repim.ci1986@gmail.com" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Mail className="w-4 h-4" />repim.ci1986@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />{t.footer.available}
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <p>{t.footer.copyright}</p>
          <p className="flex items-center gap-1">{t.footer.made} <Heart className="w-3 h-3 text-orange-500 fill-orange-500 mx-0.5 inline" /></p>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// PAGE — wrappee dans LangProvider pour l'i18n complet
// =============================================================================

function LandingPageInner() {
  const { t } = useLang();
  return (
    <main className="min-h-screen font-sans antialiased" dir={t.dir}>
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

export default function LandingPage() {
  return (
    <LangProvider>
      <LandingPageInner />
    </LangProvider>
  );
}
