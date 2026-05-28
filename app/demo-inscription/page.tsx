'use client'

// ============================================================
// REPIM — Parcours d'inscription complet (simulation)
//
// FICHIER  : app/demo-inscription/page.tsx
// URL      : http://localhost:3000/demo-inscription
//
// Ce composant est AUTONOME : il ne fait aucun appel serveur.
// C'est une simulation complète du parcours en 4 étapes :
//
//   ÉTAPE 1 — Sélection du profil        (4 cartes cliquables)
//   ÉTAPE 2 — Formulaire dynamique        (champs conditionnels par rôle)
//   ÉTAPE 3 — Chargement simulé           (spinner 2 secondes)
//   ÉTAPE 4 — Écran de succès            (aperçu du dashboard personnalisé)
// ============================================================

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Building2, Home, Users, UserCheck,
  Mail, Phone, Lock, User, Briefcase, FileText,
  Upload, Eye, EyeOff, ArrowRight, ChevronLeft,
  CheckCircle, Shield, LayoutDashboard, Bell,
  PlusCircle, Star,
} from 'lucide-react'

// ============================================================
// SECTION 1 : TYPES
// On définit la "forme" des données pour éviter les erreurs
// ============================================================

// Les 4 rôles possibles
type RoleId = 'agence' | 'proprietaire' | 'communaute' | 'demarcheur'

// La configuration complète d'un rôle (une fiche par rôle)
type RoleConfig = {
  id:             RoleId
  label:          string          // Nom affiché sur la carte
  tagline:        string          // Phrase courte sur la carte
  icon:           React.ElementType
  strictKYC:      boolean         // true = formulaire long (agence), false = formulaire court
  kycDocs:        DocConfig[]     // Liste des documents requis
  badgeLabel:     string          // Badge affiché sur l'écran de succès
  dashboardTitle: string          // Titre du dashboard simulé
  dashboardItems: DashItem[]      // Tuiles du dashboard simulé
}

// Un document requis dans le formulaire
type DocConfig = {
  key:         string
  label:       string
  description: string
  optional?:   boolean            // Si vrai, on affiche "(optionnel)"
}

// Une tuile du dashboard simulé
type DashItem = {
  label:   string
  value:   string
  locked?: boolean                // Si vrai, grisé en attente de validation
}

// L'état du formulaire (toutes les données saisies)
type FormState = {
  prenom:          string
  nom:             string
  email:           string
  telephone:       string
  password:        string
  raison_sociale:  string
  numero_agrement: string
  numero_rccm:     string
  fichiers:        Record<string, string>   // { "cni": "mon-fichier.pdf", ... }
}

// ============================================================
// SECTION 2 : DONNÉES DES 4 RÔLES
// Modifiez les textes ici pour personnaliser les cartes
// ============================================================

const ROLES: RoleConfig[] = [

  // ── Carte 1 : Agence immobilière ──────────────────────────
  {
    id:        'agence',
    label:     'Agence immobilière',
    tagline:   'Gérez votre portefeuille de biens en toute légitimité',
    icon:      Building2,
    strictKYC: true,    // → formulaire complet avec numéros d'agrément
    badgeLabel: 'Agence certifiée',
    dashboardTitle: 'Dashboard Agence',
    kycDocs: [
      { key: 'agrement',    label: 'Agrément MCLU',          description: 'Ministère de la Construction et de l\'Urbanisme' },
      { key: 'rccm',        label: 'RCCM',                   description: 'Registre du Commerce et du Crédit Mobilier' },
      { key: 'dfe',         label: 'DFE / Attestation fiscale', description: 'Déclaration Fiscale d\'Existence' },
      { key: 'cni_dirig',   label: 'CNI du dirigeant',       description: 'Carte nationale ou passeport du représentant légal' },
    ],
    dashboardItems: [
      { label: 'Annonces actives',   value: '0 annonce — en brouillon' },
      { label: 'Dossier KYC',        value: 'En cours de validation', locked: true },
      { label: 'Demandes de visite', value: '0 demande reçue' },
      { label: 'Contrats en cours',  value: '0 contrat' },
    ],
  },

  // ── Carte 2 : Propriétaire particulier ───────────────────
  {
    id:        'proprietaire',
    label:     'Propriétaire particulier',
    tagline:   'Louez ou vendez votre bien directement',
    icon:      Home,
    strictKYC: false,   // → formulaire simple, juste une pièce d'identité
    badgeLabel: 'Propriétaire vérifié',
    dashboardTitle: 'Dashboard Propriétaire',
    kycDocs: [
      { key: 'cni', label: 'Pièce d\'identité', description: 'CNI ou passeport valide (obligatoire)' },
    ],
    dashboardItems: [
      { label: 'Mes biens',          value: '0 bien — en brouillon' },
      { label: 'Dossier KYC',        value: 'En cours de validation', locked: true },
      { label: 'Messages reçus',     value: '0 message' },
      { label: 'Visites planifiées', value: '0 visite' },
    ],
  },

  // ── Carte 3 : Communauté / Mandataire ────────────────────
  {
    id:        'communaute',
    label:     'Communauté / Mandataire',
    tagline:   'Représentez votre famille, votre village ou votre lotissement',
    icon:      Users,
    strictKYC: false,
    badgeLabel: 'Mandataire vérifié',
    dashboardTitle: 'Dashboard Mandataire',
    kycDocs: [
      { key: 'cni_rep',     label: 'CNI du représentant',         description: 'Chef de terre, notable ou mandataire désigné' },
      { key: 'attestation', label: 'Attestation villageoise',      description: 'OU avis de lotissement approuvé', optional: true },
    ],
    dashboardItems: [
      { label: 'Parcelles publiées', value: '0 parcelle — en brouillon' },
      { label: 'Dossier KYC',        value: 'En cours de validation', locked: true },
      { label: 'Demandes de contact', value: '0 demande' },
      { label: 'Mes mandats',        value: 'Gérer mes mandats' },
    ],
  },

  // ── Carte 4 : Démarcheur indépendant ─────────────────────
  {
    id:        'demarcheur',
    label:     'Démarcheur indépendant',
    tagline:   'Mettez en relation acheteurs et vendeurs en freelance',
    icon:      UserCheck,
    strictKYC: false,
    badgeLabel: 'Démarcheur vérifié',
    dashboardTitle: 'Dashboard Démarcheur',
    kycDocs: [
      { key: 'cni',    label: 'Pièce d\'identité',       description: 'CNI ou passeport valide' },
      { key: 'mandat', label: 'Attestation de mandat',    description: 'Signée par le propriétaire du bien — OU carte professionnelle', optional: true },
    ],
    dashboardItems: [
      { label: 'Mes offres actives',  value: '0 offre — en brouillon' },
      { label: 'Identité',           value: 'En cours de vérification', locked: true },
      { label: 'Mises en relation',  value: '0 mise en relation' },
      { label: 'Mes commissions',    value: 'Disponible après validation' },
    ],
  },
]

// ============================================================
// SECTION 3 : COMPOSANT CHAMP DE SAISIE RÉUTILISABLE
// Utilisé pour tous les <input> texte/email/tel/password
// ============================================================

function InputField({
  label, name, type = 'text', placeholder, icon: Icon,
  required = true, value, onChange,
}: {
  label:     string
  name:      string
  type?:     string
  placeholder: string
  icon:      React.ElementType
  required?: boolean
  value:     string
  onChange:  (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  // Pour le mot de passe : bouton "afficher/masquer"
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1.5">
        {label}{' '}
        {required
          ? <span className="text-orange-500">*</span>
          : <span className="text-stone-400 font-normal text-xs">(optionnel)</span>
        }
      </label>
      <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all bg-white">
        {/* Icône à gauche */}
        <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <input
          name={name}
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
        />
        {/* Bouton afficher/masquer (uniquement pour le mot de passe) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="text-stone-400 hover:text-stone-600 transition-colors"
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SECTION 4 : COMPOSANT ZONE D'UPLOAD DE FICHIER
// Simulation : on stocke juste le nom du fichier sélectionné
// (aucun vrai upload réseau dans cette démo)
// ============================================================

function FileUploadField({
  docKey, label, description, optional, fichiers, onFileChange,
}: {
  docKey:        string
  label:         string
  description:   string
  optional?:     boolean
  fichiers:      Record<string, string>
  onFileChange:  (key: string, name: string) => void
}) {
  // On référence le vrai <input type="file"> caché
  const inputRef = useRef<HTMLInputElement>(null)
  // Nom du fichier choisi (ou vide si rien encore)
  const fileName = fichiers[docKey]

  return (
    <div>
      {/* Input caché — on le déclenche via le bouton visible ci-dessous */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"   // "sr-only" = masqué visuellement mais accessible
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFileChange(docKey, f.name)
        }}
      />

      {/* Zone cliquable visible */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-start gap-3 border-2 border-dashed rounded-xl px-4 py-3.5 transition-all text-left ${
          fileName
            ? 'border-green-400 bg-green-50'          // Vert si fichier sélectionné
            : 'border-stone-200 hover:border-orange-300 hover:bg-orange-50/50'
        }`}
      >
        {/* Icône : check vert si fichier, upload gris sinon */}
        {fileName
          ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          : <Upload className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
        }

        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-700 flex items-center gap-2 flex-wrap">
            {label}
            {optional && (
              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-normal">
                optionnel
              </span>
            )}
          </p>
          {fileName
            ? <p className="text-xs text-green-600 truncate mt-0.5">✓ {fileName}</p>
            : <p className="text-xs text-stone-400 mt-0.5">{description} · PDF, JPG ou PNG</p>
          }
        </div>
      </button>
    </div>
  )
}

// ============================================================
// SECTION 5 : COMPOSANT PRINCIPAL — LA PAGE COMPLÈTE
// C'est ici que tout se passe : gestion des étapes et rendu
// ============================================================

export default function DemoInscriptionPage() {

  // ── ÉTAT GLOBAL ────────────────────────────────────────────
  // "step" contrôle quelle vue est affichée à l'écran
  const [step, setStep] = useState<'role' | 'form' | 'loading' | 'success'>('role')

  // "selected" est le rôle sur lequel l'utilisateur a cliqué
  const [selected, setSelected] = useState<RoleConfig | null>(null)

  // "form" contient toutes les données saisies dans le formulaire
  const [form, setForm] = useState<FormState>({
    prenom:          '',
    nom:             '',
    email:           '',
    telephone:       '',
    password:        '',
    raison_sociale:  '',
    numero_agrement: '',
    numero_rccm:     '',
    fichiers:        {},
  })

  // ── FONCTIONS PRINCIPALES ───────────────────────────────────

  // Appelée quand l'user clique sur une carte de rôle
  function selectRole(role: RoleConfig) {
    setSelected(role)
    setForm(prev => ({ ...prev, fichiers: {}, raison_sociale: '', numero_agrement: '', numero_rccm: '' }))
    setStep('form')
    // Remonter en haut de page sur mobile
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Appelée à chaque frappe dans un champ texte
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Appelée quand l'user choisit un fichier
  function handleFileChange(key: string, name: string) {
    setForm(prev => ({ ...prev, fichiers: { ...prev.fichiers, [key]: name } }))
  }

  // Appelée au clic sur "Créer mon compte" — SIMULATION
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStep('loading')
    // On simule un délai réseau de 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStep('success')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── INDICATEUR DE PROGRESSION (dans le header) ──────────────
  // Calcule le numéro de l'étape courante pour afficher le stepper
  const stepNumber = step === 'role' ? 1 : step === 'form' ? 2 : 3

  // ── RENDU DE LA PAGE ────────────────────────────────────────
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">

      {/* ════════════════════════════════════════════════════════
          HEADER STICKY (visible sur toutes les étapes)
          ════════════════════════════════════════════════════════ */}
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="font-extrabold text-xl text-stone-900 tracking-tight">
            <span className="text-orange-500">RE</span>PIM
          </div>

          {/* Stepper de progression — visible à partir du sm */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {[
              { n: 1, label: 'Profil' },
              { n: 2, label: 'Informations' },
              { n: 3, label: 'Espace' },
            ].map(({ n, label }, i, arr) => (
              <div key={n} className="flex items-center gap-2">
                {/* Cercle numéroté */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    stepNumber > n
                      ? 'bg-green-500 text-white'   // Étape passée → vert
                      : stepNumber === n
                        ? 'bg-orange-500 text-white' // Étape courante → orange
                        : 'bg-stone-100 text-stone-400' // Étape future → gris
                  }`}>
                    {stepNumber > n ? <CheckCircle className="w-3.5 h-3.5" /> : n}
                  </div>
                  <span className={`text-xs ${stepNumber >= n ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                    {label}
                  </span>
                </div>
                {/* Trait de liaison entre les étapes */}
                {i < arr.length - 1 && (
                  <div className={`w-10 h-0.5 transition-colors ${stepNumber > n ? 'bg-green-400' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Lien connexion */}
          <Link href="/auth/login" className="text-sm text-stone-500 hover:text-orange-600 transition-colors">
            Déjà inscrit ?{' '}
            <span className="font-semibold text-orange-600">Connexion</span>
          </Link>
        </div>
      </header>


      {/* ════════════════════════════════════════════════════════
          ÉTAPE 1 — SÉLECTION DU PROFIL
          4 cartes cliquables avec style éditorial premium
          ════════════════════════════════════════════════════════ */}
      {step === 'role' && (
        <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-14 sm:py-20">

          {/* Titre de la section */}
          <div className="text-center mb-14 max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-orange-500 font-bold mb-4">
              Espace Professionnel REPIM
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Vous êtes…
            </h1>
            <p className="mt-5 text-stone-500 text-base sm:text-lg leading-relaxed">
              Sélectionnez votre profil. Le formulaire et les documents
              demandés s'adapteront automatiquement à votre activité.
            </p>
          </div>

          {/* Grille des 4 cartes */}
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((role) => {
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  className="
                    group text-left bg-white border border-stone-200 rounded-2xl p-6
                    hover:border-orange-400 hover:shadow-xl hover:-translate-y-1.5
                    transition-all duration-300 focus:outline-none focus:ring-2
                    focus:ring-orange-300 flex flex-col min-h-[310px]
                  "
                >
                  {/* Icône de la carte — change de couleur au survol */}
                  <div className="
                    w-14 h-14 rounded-2xl bg-stone-100 text-stone-500
                    group-hover:bg-orange-500 group-hover:text-white
                    flex items-center justify-center mb-5
                    transition-all duration-300
                    shadow-sm group-hover:shadow-lg group-hover:shadow-orange-200
                  ">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Titre */}
                  <h3 className="text-base font-extrabold text-stone-900 mb-2 leading-tight">
                    {role.label}
                  </h3>

                  {/* Description courte */}
                  <p className="text-sm text-stone-500 leading-relaxed flex-1">
                    {role.tagline}
                  </p>

                  {/* Liste des documents requis en bas de carte */}
                  <div className="border-t border-stone-100 pt-4 mt-4 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">
                      Documents requis
                    </p>
                    {role.kycDocs.map((doc) => (
                      <div key={doc.key} className="flex items-center gap-2 text-[11px] text-stone-500">
                        <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                        {doc.label}
                        {doc.optional && <span className="text-stone-300">(optionnel)</span>}
                      </div>
                    ))}
                  </div>

                  {/* CTA en bas de carte */}
                  <div className="mt-5 flex items-center text-sm font-bold text-stone-400 group-hover:text-orange-600 transition-colors">
                    Choisir ce profil
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Note légale sur le verrouillage du rôle */}
          <p className="mt-12 text-xs text-stone-400 text-center max-w-sm leading-relaxed">
            <Shield className="w-3.5 h-3.5 inline-block text-green-500 mr-1 -mt-0.5" />
            Votre profil sera <strong>définitivement verrouillé</strong> à la création
            du compte. En cas d'erreur, contactez notre support.
          </p>
        </div>
      )}


      {/* ════════════════════════════════════════════════════════
          ÉTAPE 2 — FORMULAIRE DYNAMIQUE
          Les champs changent selon le rôle sélectionné
          ════════════════════════════════════════════════════════ */}
      {step === 'form' && selected && (
        <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10">
          <div className="w-full max-w-2xl">

            {/* Bouton retour */}
            <button
              type="button"
              onClick={() => setStep('role')}
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-600 mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Changer de profil
            </button>

            {/* Titre + badge du rôle sélectionné */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-[0.15em]">
                <selected.icon className="w-3.5 h-3.5" />
                {selected.label}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Créez votre compte
              </h2>
              <p className="mt-2 text-stone-500 text-sm">
                Accès immédiat en mode brouillon · Vérification des pièces sous 48h
              </p>
            </div>

            {/* ── FORMULAIRE ── */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6"
            >

              {/* ── BLOC A : Informations de base ── */}
              <div className="space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400">
                  Informations de base
                </h3>

                {/*
                  CHAMP CONDITIONNEL : Raison sociale
                  Visible UNIQUEMENT si le rôle a strictKYC = true (ici, seulement "Agence")
                  Pour un Propriétaire, ce champ n'apparaît PAS
                */}
                {selected.strictKYC && (
                  <InputField
                    label="Raison sociale de la structure"
                    name="raison_sociale"
                    placeholder="ex : Cabinet Kouassi Immobilier SARL"
                    icon={Briefcase}
                    value={form.raison_sociale}
                    onChange={handleChange}
                  />
                )}

                {/* Prénom + Nom côte à côte */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Prénom" name="prenom"
                    placeholder="Jean" icon={User}
                    value={form.prenom} onChange={handleChange}
                  />
                  <InputField
                    label="Nom" name="nom"
                    placeholder="Konan" icon={User}
                    value={form.nom} onChange={handleChange}
                  />
                </div>

                <InputField
                  label="Email professionnel" name="email" type="email"
                  placeholder={selected.strictKYC ? 'contact@votre-structure.ci' : 'votre@email.com'}
                  icon={Mail}
                  value={form.email} onChange={handleChange}
                />

                <InputField
                  label="Téléphone" name="telephone" type="tel"
                  placeholder="+225 07 00 00 00 00"
                  icon={Phone}
                  value={form.telephone} onChange={handleChange}
                />

                <InputField
                  label="Mot de passe" name="password" type="password"
                  placeholder="••••••••••  (min. 8 caractères)"
                  icon={Lock}
                  value={form.password} onChange={handleChange}
                />
              </div>

              {/* Séparateur section */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] text-stone-400 font-bold uppercase tracking-[0.2em]">
                    Dossier de certification
                  </span>
                </div>
              </div>

              {/* ── BLOC B : Numéros officiels (UNIQUEMENT pour l'Agence) ──
                  Ces champs n'apparaissent PAS pour Propriétaire, Communauté, Démarcheur
              */}
              {selected.strictKYC && (
                <div className="space-y-4">
                  <InputField
                    label="Numéro d'agrément MCLU"
                    name="numero_agrement"
                    placeholder="ex : AGR-CI-2024-XXXX"
                    icon={FileText}
                    value={form.numero_agrement} onChange={handleChange}
                  />
                  <InputField
                    label="Numéro RCCM"
                    name="numero_rccm"
                    placeholder="ex : CI-ABJ-2024-B-XXXXX"
                    icon={FileText}
                    value={form.numero_rccm} onChange={handleChange}
                  />
                </div>
              )}

              {/* ── BLOC C : Upload des documents ──
                  La liste change selon le rôle (kycDocs dans la config)
              */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                  <FileText className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Téléversez vos pièces justificatives.
                    Formats acceptés : <strong>PDF, JPG, PNG</strong> (max 5 Mo chacun).
                    Vous pouvez les ajouter maintenant ou après la création du compte.
                  </p>
                </div>

                {/* On affiche une zone d'upload par document requis */}
                {selected.kycDocs.map((doc) => (
                  <FileUploadField
                    key={doc.key}
                    docKey={doc.key}
                    label={doc.label}
                    description={doc.description}
                    optional={doc.optional}
                    fichiers={form.fichiers}
                    onFileChange={handleFileChange}
                  />
                ))}
              </div>

              {/* ── BOUTON DE VALIDATION ── */}
              <button
                type="submit"
                className="
                  w-full flex items-center justify-center gap-2
                  bg-orange-500 hover:bg-orange-600
                  text-white font-bold py-4 rounded-xl
                  transition-colors shadow-sm text-sm mt-2
                "
              >
                Créer mon compte et accéder à mon espace
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Note sur le verrouillage du rôle */}
              <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                Votre profil « {selected.label} » sera définitivement verrouillé après la création
              </p>

              <p className="text-center text-xs text-stone-400">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/conditions-generales" className="text-orange-500 hover:underline">
                  conditions générales
                </Link>{' '}
                et notre{' '}
                <Link href="/politique-de-confidentialite" className="text-orange-500 hover:underline">
                  politique de confidentialité
                </Link>.
              </p>
            </form>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════════════════
          ÉTAPE 3 — CHARGEMENT SIMULÉ (2 secondes)
          ════════════════════════════════════════════════════════ */}
      {step === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
          {/* Spinner animé */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-orange-500 animate-spin" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-xl font-extrabold text-stone-800">
              Création du compte en cours…
            </p>
            <p className="text-sm text-stone-500">
              Nous configurons votre espace professionnel
            </p>
          </div>

          {/* Étapes de chargement animées */}
          <div className="space-y-2 text-sm text-stone-500">
            {[
              'Création du compte sécurisé',
              'Attribution du rôle (verrouillage)',
              'Initialisation du dossier KYC',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-t-orange-500 animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════════════════
          ÉTAPE 4 — ÉCRAN DE SUCCÈS + APERÇU DU TABLEAU DE BORD
          Personnalisé selon le rôle choisi
          ════════════════════════════════════════════════════════ */}
      {step === 'success' && selected && (
        <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-2xl">

            {/* Message de bienvenue */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Bienvenue{form.prenom ? `, ${form.prenom}` : ''} !
              </h1>
              <p className="mt-3 text-stone-500 text-base max-w-md mx-auto leading-relaxed">
                Votre compte <strong className="text-stone-800">{selected.label}</strong>{' '}
                a été créé avec succès. Votre dossier est en cours d'examen par notre équipe.
              </p>

              {/* Badge statut "en attente" */}
              <div className="mt-5 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Dossier en attente de validation · Délai estimé : 24–48h
              </div>
            </div>

            {/* ── APERÇU DU TABLEAU DE BORD ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

              {/* Barre de titre du dashboard */}
              <div className="bg-stone-900 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-extrabold text-sm tracking-tight">
                    {selected.dashboardTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500/25 text-orange-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selected.badgeLabel}
                  </span>
                  <span className="bg-amber-500/25 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    En attente
                  </span>
                </div>
              </div>

              {/* Bannière d'alerte KYC */}
              <div className="bg-amber-50 border-b border-amber-200 px-5 py-3.5 flex items-start gap-3">
                <Bell className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Votre dossier est en cours d'examen
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Vos annonces seront visibles au public dès que vos documents seront validés.
                    En attendant, préparez vos annonces en mode brouillon.
                  </p>
                </div>
              </div>

              {/* Tuiles du dashboard (aperçu) */}
              <div className="p-5 grid grid-cols-2 gap-3">
                {selected.dashboardItems.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 transition-all ${
                      item.locked
                        ? 'bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                    title={item.locked ? 'Disponible après validation de votre dossier' : undefined}
                  >
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1.5">
                      {item.label}
                    </p>
                    <p className={`text-sm font-semibold ${item.locked ? 'text-stone-400' : 'text-stone-700'}`}>
                      {item.value}
                    </p>
                    {item.locked && (
                      <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Disponible après validation
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Boutons d'action */}
              <div className="border-t border-stone-100 px-5 py-4 flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Accéder à mon espace
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-2 border border-stone-200 text-stone-700 font-semibold py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Créer une annonce
                </button>
              </div>
            </div>

            {/* Récapitulatif du compte */}
            <div className="mt-6 bg-stone-50 border border-stone-200 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-4">
                Récapitulatif de votre compte
              </p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Profil',              value: selected.label,                 color: 'text-stone-800' },
                  { label: 'Email',               value: form.email || '—',              color: 'text-stone-800' },
                  { label: 'Statut',              value: 'En attente de validation',     color: 'text-amber-600' },
                  { label: 'Visibilité publique', value: 'Désactivée jusqu\'à validation', color: 'text-stone-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
                    <span className="text-stone-500">{label}</span>
                    <span className={`font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note finale sur le verrouillage */}
            <p className="mt-6 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              Rôle « {selected.label} » verrouillé · Immuable en base de données
            </p>

            {/* Lien pour recommencer la démo */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('role')
                  setSelected(null)
                  setForm({ prenom: '', nom: '', email: '', telephone: '', password: '', raison_sociale: '', numero_agrement: '', numero_rccm: '', fichiers: {} })
                }}
                className="text-xs text-stone-400 hover:text-orange-500 underline underline-offset-4 transition-colors"
              >
                ↺ Recommencer la démo avec un autre profil
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
