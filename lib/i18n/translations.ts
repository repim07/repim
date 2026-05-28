// =============================================================================
// REPIM — Dictionnaire de traductions (FR / EN / AR / CH)
// =============================================================================

export type LangCode = 'FR' | 'EN' | 'AR' | 'CH'

// ---------------------------------------------------------------------------
// FRANÇAIS
// ---------------------------------------------------------------------------
const FR = {
  dir: 'ltr' as 'ltr' | 'rtl',
  nav: {
    buy: 'Acheter', rent: 'Louer', sell: 'Vendre', agents: 'Agents',
    partners: 'Partenaires', ourPartners: 'Nos partenaires',
    signIn: 'Se connecter', publish: 'Publier une annonce', mySpace: 'Mon espace',
  },
  hero: {
    badge: "L'immobilier digital de référence en Afrique",
    h1: 'Vos recherches immobilières',
    h1b: 'enfin simplifiées.',
    h1c: 'Donnez vie à vos projets.',
    subtitle: "REPIM digitalise l'ensemble du parcours immobilier — de la recherche à la signature. Annonces fiables, matching automatique, visites virtuelles et transactions sécurisées.",
    tagline: 'Sécurité · Impact · Simplicité',
    placeholder: 'Ville, quartier, commune...',
    searchBtn: 'Rechercher',
    check1: 'Annonces vérifiées', check2: 'Mises en relation sécurisées', check3: 'Disponible sur Android / iOS / Web',
    ctaAndroid: 'Android & iOS', ctaWeb: 'Web App',
    available: 'Disponible sur REPIM · Abidjan',
    noFraud: 'Zéro tolérance arnaque', quickReport: 'Signalement rapide', userRating: 'Note utilisateurs',
    stats: [
      { value: '100%',   label: 'Annonces vérifiées par notre équipe' },
      { value: '2 500+', label: 'Agents & agences certifiés' },
      { value: '1,5 M',  label: 'Diaspora ivoirienne ciblée' },
      { value: '150+',   label: 'Promoteurs & investisseurs' },
    ],
  },
  propertyTypes: {
    badge: 'Ce que vous trouvez sur REPIM',
    h2: 'Tous types de biens, une seule plateforme',
    items: [
      { label: 'Terrains',                description: 'Particulier, communautaire, bail, agences' },
      { label: 'Villas & Appartements',   description: 'Vente ou location, toutes gammes' },
      { label: "Opportunités d'Affaires", description: 'Décapage, bornage, viabilisation, lotissement' },
      { label: 'Gestions Immobilières',   description: 'Suivi complet de vos biens' },
      { label: 'Rénovations',             description: 'Mise en relation avec les professionnels' },
      { label: 'Architecture & Déco',     description: "Architectes, décorateurs, design d'intérieur" },
    ],
  },
  features: {
    badge: 'Fonctionnalités intelligentes',
    h2a: 'Tout ce dont vous avez besoin,', h2b: 'au même endroit',
    subtitle: 'REPIM réunit les meilleurs outils pour simplifier chaque étape de votre projet immobilier en Afrique.',
    items: [
      { title: 'Matching automatique',    desc: "Notre algorithme analyse vos critères et vous propose en temps réel les biens qui correspondent exactement à votre profil et à votre budget." },
      { title: 'Visites virtuelles',      desc: "Visitez des biens à distance depuis votre téléphone ou ordinateur. Économisez du temps et filtrez vos choix avant de vous déplacer." },
      { title: 'Chat intégré',            desc: "Échangez directement avec les propriétaires, gérants ou agents depuis l'application. Rapide, sécurisé et sans intermédiaire inutile." },
      { title: 'Notifications ciblées',   desc: "Soyez alerté dès qu'un bien correspondant à votre recherche est publié. Ne manquez plus jamais une opportunité immobilière." },
    ],
  },
  howItWorks: {
    badge: 'En 3 étapes', h2: 'Comment ça marche ?',
    subtitle: 'De la recherche à la signature, REPIM vous accompagne à chaque étape de votre projet immobilier.',
    cta: 'Commencer gratuitement',
    steps: [
      { title: 'Recherchez',  desc: "Définissez vos critères : ville, quartier, budget, surface, standing. Parcourez des milliers d'annonces vérifiées, avec photos et localisation sur carte." },
      { title: 'Visitez',     desc: "Planifiez une visite physique ou virtuelle directement via l'app. Chattez avec le propriétaire ou l'agent, posez vos questions en temps réel." },
      { title: 'Concrétisez', desc: "Finalisez votre transaction en toute sécurité. Documents vérifiés, contrat de bail ou de vente, enregistrement automatique chez le notaire." },
    ],
  },
  testimonials: {
    badge: 'Témoignages', h2: 'Ils ont trouvé avec REPIM',
    subtitle: "Des milliers d'utilisateurs font confiance à REPIM pour leurs projets immobiliers.",
    items: [
      { name: 'Amina K.',  role: 'Locataire — Abidjan',      avatar: 'AK', rating: 5,   text: "REPIM m'a permis de trouver mon appartement en moins de 3 semaines. Le matching automatique m'a envoyé exactement ce que je cherchais sans perdre de temps." },
      { name: 'Moussa D.', role: 'Investisseur immobilier',   avatar: 'MD', rating: 4,   text: "J'ai géré deux transactions depuis la diaspora grâce aux visites virtuelles. La transparence et la sécurité de REPIM m'ont vraiment rassuré." },
      { name: 'Sophie L.', role: 'Propriétaire vendeur',      avatar: 'SL', rating: 3.5, text: "J'ai publié mon bien et reçu des demandes qualifiées le lendemain. Le tableau de bord pour gérer mes annonces est vraiment intuitif." },
      { name: 'Yves K.',   role: 'PRO Agence — Cocody',      avatar: 'YK', rating: 4,   text: "En tant qu'agence certifiée REPIM, j'ai triplé mon volume de contacts en 2 mois. La plateforme attire des clients sérieux et bien informés." },
    ],
  },
  pricing: {
    badge: 'Tarifs professionnels', h2: 'Un accès premium, sans mauvaise surprise',
    subtitle: "Gratuit pour les locataires et acheteurs · Abonnement pour les professionnels et propriétaires",
    popular: 'Populaire', choosePlan: 'Choisir ce plan', freeNote: 'Recherche et navigation gratuites pour tous · Sans engagement',
    plans: [
      { label: 'Mensuel',     price: '20 000',  devise: 'XOF/mois',   euro: '30,49 EUR',  highlight: false },
      { label: 'Trimestriel', price: '56 500',  devise: 'XOF/trim.',  euro: '86,14 EUR',  highlight: false },
      { label: 'Semestriel',  price: '115 000', devise: 'XOF/6 mois', euro: '175,33 EUR', highlight: true  },
      { label: 'Annuel',      price: '200 000', devise: 'XOF/an',     euro: '304,90 EUR', highlight: false },
    ],
  },
  faq: {
    badge: 'Questions fréquentes', h2: 'Foire aux Questions',
    subtitle: 'Tout ce que vous devez savoir sur REPIM.',
    noAnswer: 'Vous ne trouvez pas votre réponse ?', contactTeam: 'Contactez notre équipe',
    items: [
      { q: 'REPIM est-il gratuit pour les chercheurs ?',               a: "Oui, la navigation, la recherche et la consultation des annonces sont totalement gratuites pour les locataires et acheteurs. Seuls les professionnels souscrivent à un abonnement pour publier." },
      { q: 'Comment fonctionne la vérification des annonces ?',        a: "Chaque annonce est soumise à une vérification manuelle avant publication. Les professionnels doivent fournir un dossier KYC complet (pièces d'identité, agrément MCLU). Cela garantit zéro arnaque." },
      { q: 'Puis-je visiter un bien à distance ?',                     a: "Absolument. REPIM propose des visites virtuelles intégrées pour la plupart des biens. Vous pouvez aussi planifier une visite physique directement depuis la fiche du bien." },
      { q: 'Combien de temps dure la validation de mon dossier KYC ?', a: "La validation prend généralement entre 24 et 48 heures ouvrables. Vous recevez une notification par email et dans votre tableau de bord dès que votre dossier est traité." },
      { q: "Comment contacter le propriétaire ou l'agent d'un bien ?", a: "Depuis la fiche d'un bien, vous pouvez envoyer un message via le chat intégré, appeler directement ou demander une visite. Toutes les communications sont tracées pour votre sécurité." },
      { q: "Est-ce que REPIM est disponible en dehors de Côte d'Ivoire ?", a: "REPIM est concentré sur la Côte d'Ivoire, mais accessible partout dans le monde. La diaspora ivoirienne peut rechercher, mettre en favoris et contacter des vendeurs sans se déplacer." },
      { q: 'Comment utiliser un code promo ?',                         a: "Lors de la souscription, entrez votre code promo dans le champ dédié avant de valider le paiement. La réduction s'applique immédiatement. Les codes sont valables une seule fois." },
      { q: "Puis-je changer mon abonnement en cours de période ?",     a: "Oui, vous pouvez passer à un plan supérieur à tout moment depuis votre tableau de bord. La différence de montant est proratisée. Le passage à un plan inférieur prend effet à l'échéance." },
    ],
  },
  events: {
    badge: 'Webinaires & Salons', h2: 'Événements à venir',
    subtitle: "Rencontrez nos experts, participez aux salons et découvrez les opportunités immobilières en Côte d'Ivoire.",
    register: "S'inscrire",
    items: [
      { date: '15 Juin 2026',   type: 'Webinaire', typeCls: 'bg-blue-100 text-blue-700',    title: "Investir dans l'immobilier ivoirien depuis la diaspora",  desc: "Conseils pratiques, financement, pièges à éviter — avec un expert REPIM et un notaire invité.", seats: 'Places limitées',      link: '#' },
      { date: '28 Juin 2026',   type: 'Salon',     typeCls: 'bg-green-100 text-green-700',   title: 'Salon REPIM Abidjan 2026 — Édition Spéciale',             desc: 'Rencontrez plus de 50 agences et promoteurs certifiés en un seul lieu. Entrée gratuite sur inscription.', seats: 'Inscription gratuite', link: '#' },
      { date: '10 Juil. 2026',  type: 'Atelier',   typeCls: 'bg-orange-100 text-orange-700', title: 'Comprendre le dossier KYC : guide pas à pas',             desc: "Session pratique pour les nouveaux professionnels : comment préparer et déposer votre dossier en 30 minutes.", seats: '20 participants max', link: '#' },
    ],
  },
  promo: {
    badge: 'Code promotionnel', h2: 'Vous avez un code promo ?',
    subtitle: "Entrez votre code pour bénéficier d'une réduction exclusive sur votre abonnement REPIM PRO. Valable sur tous les plans.",
    placeholder: 'Ex : REPIM2026', apply: 'Appliquer',
    ok: 'Code valide ! Réduction appliquée à la souscription.',
    err: 'Code invalide ou expiré. Veuillez réessayer.',
  },
  newsletter: {
    badge: 'Newsletter immobilière', h2: 'Restez informés des nouvelles opportunités',
    subtitle: 'Recevez chaque semaine les meilleures annonces, les actualités du marché ivoirien et les invitations à nos événements.',
    placeholder: 'votre@email.com', btn: "S'abonner",
    success: 'Merci ! Vous recevrez notre prochaine newsletter.',
    privacy: 'Pas de spam. Désinscription en un clic. Données protégées.',
  },
  contact: {
    badge: 'Contact', h2: 'Parlons de votre projet',
    subtitle: "Une question sur la plateforme, un partenariat, une assistance technique ? Notre équipe vous répond sous 24 h.",
    name: 'Votre nom', email: 'Email', message: 'Message',
    namePh: 'Jean Konan', emailPh: 'votre@email.com', messagePh: 'Décrivez votre demande...',
    send: 'Envoyer le message', sending: 'Envoi en cours...',
    sent: 'Message envoyé !', sentSub: 'Notre équipe vous répondra dans les 24 heures.',
    again: 'Envoyer un autre message',
    phoneLabel: 'Téléphone', emailLabel: 'Email', addressLabel: 'Adresse',
    address: 'Abidjan, Côte d\'Ivoire', worldwide: 'Accessible partout dans le monde',
  },
  finalCta: {
    badge: 'Sécurité · Impact · Simplicité',
    h2: 'Votre prochain chez-vous', h2b: 'commence ici.',
    subtitle: "Rejoignez des milliers d'utilisateurs qui font confiance à REPIM pour leurs projets immobiliers. Transparence, rapidité et sécurité dans un secteur en pleine transformation.",
    cta1: 'Trouver mon bien', cta2: 'Publier une annonce',
    tagline: 'Sécurité · Impact · Simplicité · Disponible sur Android, iOS & Web',
  },
  footer: {
    tagline: "La marketplace immobilière qui digitalise le parcours immobilier en Afrique — de la recherche à la signature.",
    tagline2: 'Sécurité · Impact · Simplicité',
    copyright: `© ${new Date().getFullYear()} REPIM. Tous droits réservés.`,
    made: "Fait avec ♥ pour l'immobilier africain",
    available: "Disponible en Côte d'Ivoire et en Afrique",
    sections: [
      { title: 'Plateforme', links: [{ label: 'Acheter', href: '/annonces?type=vente' }, { label: 'Louer', href: '/annonces?type=location' }, { label: 'Vendre', href: '/annonces/new' }, { label: 'Estimer mon bien', href: '#tarifs' }] },
      { title: 'Aide',       links: [{ label: 'Comment ça marche', href: '#comment-ca-marche' }, { label: 'FAQ', href: '#faq' }, { label: 'Contact', href: '#contact' }, { label: 'Blog immobilier', href: '#' }] },
      { title: 'Légal',      links: [{ label: 'CGU', href: '/conditions-generales' }, { label: 'Confidentialité', href: '/politique-de-confidentialite' }, { label: 'Mentions légales', href: '/mentions-legales' }] },
    ],
  },
}

// ---------------------------------------------------------------------------
// ENGLISH
// ---------------------------------------------------------------------------
const EN: typeof FR = {
  dir: 'ltr',
  nav: {
    buy: 'Buy', rent: 'Rent', sell: 'Sell', agents: 'Agents',
    partners: 'Partners', ourPartners: 'Our partners',
    signIn: 'Sign in', publish: 'Post a listing', mySpace: 'My account',
  },
  hero: {
    badge: 'The reference digital real estate platform in Africa',
    h1: 'Your real estate search,', h1b: 'finally simplified.', h1c: 'Bring your projects to life.',
    subtitle: 'REPIM digitalizes the entire real estate journey — from search to signature. Verified listings, smart matching, virtual tours, and secure transactions.',
    tagline: 'Security · Impact · Simplicity',
    placeholder: 'City, neighborhood, district...', searchBtn: 'Search',
    check1: 'Verified listings', check2: 'Secure connections', check3: 'Available on Android / iOS / Web',
    ctaAndroid: 'Android & iOS', ctaWeb: 'Web App',
    available: 'Available on REPIM · Abidjan',
    noFraud: 'Zero tolerance for fraud', quickReport: 'Quick reporting', userRating: 'User rating',
    stats: [
      { value: '100%',   label: 'Listings verified by our team' },
      { value: '2,500+', label: 'Certified agents & agencies' },
      { value: '1.5M',   label: 'Ivorian diaspora targeted' },
      { value: '150+',   label: 'Developers & investors' },
    ],
  },
  propertyTypes: {
    badge: 'What you find on REPIM', h2: 'All property types, one platform',
    items: [
      { label: 'Land',                   description: 'Private, community, lease, agencies' },
      { label: 'Villas & Apartments',    description: 'For sale or rent, all ranges' },
      { label: 'Business Opportunities', description: 'Clearing, surveying, land development' },
      { label: 'Property Management',    description: 'Complete management of your properties' },
      { label: 'Renovations',            description: 'Connect with qualified professionals' },
      { label: 'Architecture & Decor',   description: 'Architects, decorators, interior design' },
    ],
  },
  features: {
    badge: 'Smart features', h2a: 'Everything you need,', h2b: 'in one place',
    subtitle: 'REPIM brings together the best tools to simplify every step of your real estate project in Africa.',
    items: [
      { title: 'Smart Matching',    desc: 'Our algorithm analyzes your criteria and suggests in real time the properties that exactly match your profile and budget.' },
      { title: 'Virtual Tours',     desc: 'Visit properties remotely from your phone or computer. Save time and filter choices before visiting in person.' },
      { title: 'Built-in Chat',     desc: 'Communicate directly with owners, managers, or agents from the app. Fast, secure and without unnecessary intermediaries.' },
      { title: 'Targeted Alerts',   desc: "Get notified as soon as a property matching your search is published. Never miss a real estate opportunity again." },
    ],
  },
  howItWorks: {
    badge: 'In 3 steps', h2: 'How does it work?',
    subtitle: 'From search to signature, REPIM guides you through every step of your real estate project.',
    cta: 'Get started for free',
    steps: [
      { title: 'Search',   desc: 'Set your criteria: city, neighborhood, budget, size. Browse thousands of verified listings with photos and map location.' },
      { title: 'Visit',    desc: 'Schedule an in-person or virtual visit directly via the app. Chat with the owner or agent, ask your questions in real time.' },
      { title: 'Finalize', desc: 'Complete your transaction securely. Verified documents, lease or sale contract, automatic notary registration.' },
    ],
  },
  testimonials: {
    badge: 'Testimonials', h2: 'They found it on REPIM',
    subtitle: 'Thousands of users trust REPIM for their real estate projects.',
    items: [
      { name: 'Amina K.',  role: 'Tenant — Abidjan',      avatar: 'AK', rating: 5,   text: 'REPIM helped me find my apartment in less than 3 weeks. The smart matching sent me exactly what I was looking for without wasting time.' },
      { name: 'Moussa D.', role: 'Real estate investor',   avatar: 'MD', rating: 4,   text: 'I managed two transactions from the diaspora using virtual tours. The transparency and security of REPIM really reassured me.' },
      { name: 'Sophie L.', role: 'Property seller',        avatar: 'SL', rating: 3.5, text: 'I listed my property and received qualified inquiries the next day. The dashboard for managing my listings is truly intuitive.' },
      { name: 'Yves K.',   role: 'PRO Agency — Cocody',   avatar: 'YK', rating: 4,   text: 'As a certified REPIM agency, I tripled my contact volume in 2 months. The platform attracts serious and well-informed clients.' },
    ],
  },
  pricing: {
    badge: 'Professional pricing', h2: 'Premium access, no surprises',
    subtitle: 'Free for tenants and buyers · Subscription for professionals and owners',
    popular: 'Popular', choosePlan: 'Choose this plan', freeNote: 'Free browsing for all users · No commitment',
    plans: [
      { label: 'Monthly',    price: '20,000',  devise: 'XOF/mo',   euro: '30.49 EUR',  highlight: false },
      { label: 'Quarterly',  price: '56,500',  devise: 'XOF/qtr',  euro: '86.14 EUR',  highlight: false },
      { label: 'Bi-annual',  price: '115,000', devise: 'XOF/6mo',  euro: '175.33 EUR', highlight: true  },
      { label: 'Annual',     price: '200,000', devise: 'XOF/yr',   euro: '304.90 EUR', highlight: false },
    ],
  },
  faq: {
    badge: 'Frequently asked questions', h2: 'FAQ',
    subtitle: "Everything you need to know about REPIM. Can't find your answer? Contact our support.",
    noAnswer: "Can't find your answer?", contactTeam: 'Contact our team',
    items: [
      { q: 'Is REPIM free for searchers?',                       a: 'Yes, browsing, searching and viewing listings are completely free for tenants and buyers. Only professionals subscribe to a plan to publish listings.' },
      { q: 'How does listing verification work?',                 a: 'Each listing undergoes manual review before publication. Professionals must provide a complete KYC file. This guarantees zero fraud on the platform.' },
      { q: 'Can I visit a property remotely?',                    a: 'Absolutely. REPIM offers integrated virtual tours for most available properties. You can also schedule an in-person visit directly from the property page.' },
      { q: 'How long does KYC validation take?',                  a: 'Validation generally takes 24–48 business hours. You receive a notification by email and in your dashboard as soon as your file is processed.' },
      { q: 'How do I contact the owner or agent for a property?', a: 'From a property page, you can send a message via the built-in chat, call directly, or request a visit. All communications are tracked for your security.' },
      { q: 'Is REPIM available outside of Ivory Coast?',          a: 'REPIM is focused on Ivory Coast but accessible worldwide. Members of the Ivorian diaspora can search, favorite and contact sellers without traveling.' },
      { q: 'How do I use a promo code?',                          a: 'When subscribing, enter your promo code in the dedicated field before confirming payment. The discount applies immediately. Codes are single-use.' },
      { q: 'Can I change my subscription mid-period?',            a: 'Yes, you can upgrade at any time from your dashboard. The amount difference is prorated. Downgrading takes effect at the next billing cycle.' },
    ],
  },
  events: {
    badge: 'Webinars & Trade Shows', h2: 'Upcoming Events',
    subtitle: 'Meet our experts, attend trade shows and discover real estate opportunities in Ivory Coast.',
    register: 'Register',
    items: [
      { date: 'June 15, 2026',  type: 'Webinar',    typeCls: 'bg-blue-100 text-blue-700',   title: 'Investing in Ivorian real estate from the diaspora',  desc: 'Practical advice, financing, pitfalls — with a REPIM expert and a guest notary.', seats: 'Limited seats',       link: '#' },
      { date: 'June 28, 2026',  type: 'Trade Show', typeCls: 'bg-green-100 text-green-700',  title: 'REPIM Abidjan Fair 2026 — Special Edition',           desc: 'Meet over 50 certified agencies and developers in one place. Free entry with registration.', seats: 'Free registration', link: '#' },
      { date: 'Jul. 10, 2026',  type: 'Workshop',   typeCls: 'bg-orange-100 text-orange-700', title: 'Understanding KYC documents: step-by-step guide',   desc: 'Practical session for new professionals: how to prepare and submit your file in 30 minutes.', seats: '20 participants max', link: '#' },
    ],
  },
  promo: {
    badge: 'Promotional code', h2: 'Have a promo code?',
    subtitle: 'Enter your code to enjoy an exclusive discount on your REPIM PRO subscription. Valid on all plans.',
    placeholder: 'Ex: REPIM2026', apply: 'Apply',
    ok: 'Valid code! Discount applied to your subscription.',
    err: 'Invalid or expired code. Please try again.',
  },
  newsletter: {
    badge: 'Real estate newsletter', h2: 'Stay informed on new opportunities',
    subtitle: 'Receive every week the best listings, Ivorian market news and invitations to our events.',
    placeholder: 'your@email.com', btn: 'Subscribe',
    success: 'Thank you! You will receive our next newsletter.',
    privacy: 'No spam. Unsubscribe in one click. Data protected.',
  },
  contact: {
    badge: 'Contact', h2: 'Let\'s talk about your project',
    subtitle: 'A question about the platform, a partnership, technical support? Our team responds within 24h.',
    name: 'Your name', email: 'Email', message: 'Message',
    namePh: 'Jean Konan', emailPh: 'your@email.com', messagePh: 'Describe your request...',
    send: 'Send message', sending: 'Sending...',
    sent: 'Message sent!', sentSub: 'Our team will reply within 24 hours.',
    again: 'Send another message',
    phoneLabel: 'Phone', emailLabel: 'Email', addressLabel: 'Address',
    address: 'Abidjan, Ivory Coast', worldwide: 'Accessible worldwide',
  },
  finalCta: {
    badge: 'Security · Impact · Simplicity',
    h2: 'Your next home', h2b: 'starts here.',
    subtitle: 'Join thousands of users who trust REPIM for their real estate projects. Transparency, speed and security in a sector being transformed.',
    cta1: 'Find my property', cta2: 'Post a listing',
    tagline: 'Security · Impact · Simplicity · Available on Android, iOS & Web',
  },
  footer: {
    tagline: 'The real estate marketplace that digitalizes the real estate journey in Africa — from search to signature.',
    tagline2: 'Security · Impact · Simplicity',
    copyright: `© ${new Date().getFullYear()} REPIM. All rights reserved.`,
    made: '♥ Built for African real estate',
    available: 'Available in Ivory Coast and Africa',
    sections: [
      { title: 'Platform', links: [{ label: 'Buy', href: '/annonces?type=vente' }, { label: 'Rent', href: '/annonces?type=location' }, { label: 'Sell', href: '/annonces/new' }, { label: 'Estimate my property', href: '#tarifs' }] },
      { title: 'Help',     links: [{ label: 'How it works', href: '#comment-ca-marche' }, { label: 'FAQ', href: '#faq' }, { label: 'Contact', href: '#contact' }, { label: 'Real estate blog', href: '#' }] },
      { title: 'Legal',    links: [{ label: 'Terms of use', href: '/conditions-generales' }, { label: 'Privacy policy', href: '/politique-de-confidentialite' }, { label: 'Legal notice', href: '/mentions-legales' }] },
    ],
  },
}

// ---------------------------------------------------------------------------
// ARABIC (RTL)
// ---------------------------------------------------------------------------
const AR: typeof FR = {
  dir: 'rtl',
  nav: {
    buy: 'شراء', rent: 'إيجار', sell: 'بيع', agents: 'وكلاء',
    partners: 'الشركاء', ourPartners: 'شركاؤنا',
    signIn: 'تسجيل الدخول', publish: 'نشر إعلان', mySpace: 'حسابي',
  },
  hero: {
    badge: 'المنصة العقارية الرقمية المرجعية في أفريقيا',
    h1: 'بحثك العقاري', h1b: 'أصبح أبسط.', h1c: 'حوّل مشاريعك إلى واقع.',
    subtitle: 'تُرقمن REPIM كامل الرحلة العقارية — من البحث إلى التوقيع. إعلانات موثوقة، مطابقة ذكية، جولات افتراضية وعمليات آمنة.',
    tagline: 'أمان · تأثير · بساطة',
    placeholder: 'مدينة، حي، بلدية...', searchBtn: 'بحث',
    check1: 'إعلانات موثّقة', check2: 'تواصل آمن', check3: 'متاح على Android / iOS / الويب',
    ctaAndroid: 'Android & iOS', ctaWeb: 'تطبيق الويب',
    available: 'متاح على REPIM · أبيدجان',
    noFraud: 'تسامح صفري مع الاحتيال', quickReport: 'إبلاغ سريع', userRating: 'تقييم المستخدمين',
    stats: [
      { value: '100%',  label: 'إعلانات موثّقة من فريقنا' },
      { value: '+2500', label: 'وكلاء ووكالات معتمدة' },
      { value: '1.5م',  label: 'مغتربون إيفواريون مستهدفون' },
      { value: '+150',  label: 'مطورون ومستثمرون' },
    ],
  },
  propertyTypes: {
    badge: 'ما تجده على REPIM', h2: 'جميع أنواع العقارات، منصة واحدة',
    items: [
      { label: 'أراضي',        description: 'خاصة، مجتمعية، إيجار، وكالات' },
      { label: 'فيلات وشقق',   description: 'للبيع أو الإيجار، بجميع الفئات' },
      { label: 'فرص أعمال',    description: 'تسوية، مساحة، تطوير أراضي' },
      { label: 'إدارة عقارية', description: 'إدارة كاملة لعقاراتك' },
      { label: 'ترميم',        description: 'تواصل مع المتخصصين المؤهلين' },
      { label: 'هندسة وديكور', description: 'مهندسون، مصممون، تصميم داخلي' },
    ],
  },
  features: {
    badge: 'ميزات ذكية', h2a: 'كل ما تحتاجه،', h2b: 'في مكان واحد',
    subtitle: 'تجمع REPIM أفضل الأدوات لتبسيط كل خطوة في مشروعك العقاري في أفريقيا.',
    items: [
      { title: 'مطابقة ذكية',    desc: 'يحلل خوارزميتنا معاييرك ويقترح في الوقت الحقيقي العقارات التي تتوافق تمامًا مع ملفك الشخصي وميزانيتك.' },
      { title: 'جولات افتراضية', desc: 'زُر العقارات عن بُعد من هاتفك أو جهاز الكمبيوتر. وفّر الوقت وصفّ خياراتك قبل الزيارة الشخصية.' },
      { title: 'دردشة مدمجة',    desc: 'تواصل مباشرة مع الملاك أو المديرين أو الوكلاء من التطبيق. سريع وآمن بدون وسطاء غير ضروريين.' },
      { title: 'تنبيهات مستهدفة', desc: 'احصل على إشعار فور نشر عقار يتوافق مع بحثك. لا تفوّت أي فرصة عقارية.' },
    ],
  },
  howItWorks: {
    badge: 'في 3 خطوات', h2: 'كيف يعمل؟',
    subtitle: 'من البحث إلى التوقيع، تُرافقك REPIM في كل خطوة من مشروعك العقاري.',
    cta: 'ابدأ مجانًا',
    steps: [
      { title: 'ابحث',        desc: 'حدد معاييرك: المدينة، الحي، الميزانية، المساحة. تصفح آلاف الإعلانات الموثّقة مع صور وموقع على الخريطة.' },
      { title: 'زُر',          desc: 'جدوِّل زيارة شخصية أو افتراضية مباشرة عبر التطبيق. تحدث مع المالك أو الوكيل، اطرح أسئلتك في الوقت الفعلي.' },
      { title: 'أتمّ الصفقة', desc: 'أنهِ معاملتك بأمان تام. وثائق موثّقة، عقد إيجار أو بيع، تسجيل تلقائي لدى كاتب العدل.' },
    ],
  },
  testimonials: {
    badge: 'شهادات', h2: 'وجدوا ضالتهم مع REPIM',
    subtitle: 'آلاف المستخدمين يثقون في REPIM لمشاريعهم العقارية.',
    items: [
      { name: 'أمينة ك.', role: 'مستأجرة — أبيدجان',   avatar: 'AK', rating: 5,   text: 'ساعدتني REPIM في إيجاد شقتي في أقل من 3 أسابيع. أرسل لي نظام المطابقة بالضبط ما كنت أبحث عنه دون إضاعة الوقت.' },
      { name: 'موسى د.',  role: 'مستثمر عقاري',         avatar: 'MD', rating: 4,   text: 'أدرت معاملتين من المهجر بفضل الجولات الافتراضية. الشفافية وأمان REPIM أشعراني بالطمأنينة.' },
      { name: 'صوفي ل.',  role: 'بائع عقار',             avatar: 'SL', rating: 3.5, text: 'نشرت عقاري وتلقيت طلبات مؤهلة في اليوم التالي. لوحة التحكم لإدارة إعلاناتي سهلة الاستخدام فعلاً.' },
      { name: 'إيف ك.',   role: 'وكالة PRO — كوكودي',   avatar: 'YK', rating: 4,   text: 'بصفتي وكالة معتمدة من REPIM، ضاعفت حجم تواصلي ثلاث مرات في شهرين. المنصة تجذب عملاء جادين ومطلعين جيداً.' },
    ],
  },
  pricing: {
    badge: 'أسعار احترافية', h2: 'وصول متميز، بدون مفاجآت',
    subtitle: 'مجاني للمستأجرين والمشترين · اشتراك للمحترفين وأصحاب العقارات',
    popular: 'الأكثر شعبية', choosePlan: 'اختر هذه الخطة', freeNote: 'تصفح مجاني للجميع · بدون التزام',
    plans: [
      { label: 'شهري',       price: '20,000',  devise: 'XOF/شهر',   euro: '30.49 EUR',  highlight: false },
      { label: 'ربع سنوي',  price: '56,500',  devise: 'XOF/3أشهر', euro: '86.14 EUR',  highlight: false },
      { label: 'نصف سنوي', price: '115,000', devise: 'XOF/6أشهر', euro: '175.33 EUR', highlight: true  },
      { label: 'سنوي',      price: '200,000', devise: 'XOF/سنة',   euro: '304.90 EUR', highlight: false },
    ],
  },
  faq: {
    badge: 'الأسئلة الشائعة', h2: 'الأسئلة المتكررة',
    subtitle: 'كل ما تحتاج معرفته عن REPIM.',
    noAnswer: 'لم تجد إجابتك؟', contactTeam: 'تواصل مع فريقنا',
    items: [
      { q: 'هل REPIM مجاني للباحثين؟',                  a: 'نعم، التصفح والبحث وعرض الإعلانات مجاني تماماً للمستأجرين والمشترين. المحترفون فقط يشتركون في خطة لنشر الإعلانات.' },
      { q: 'كيف يعمل التحقق من الإعلانات؟',              a: 'كل إعلان يخضع للمراجعة اليدوية من فريقنا قبل النشر. يجب على المحترفين تقديم ملف KYC كامل. هذا يضمن صفر احتيال على المنصة.' },
      { q: 'هل يمكنني زيارة عقار عن بُعد؟',              a: 'بالتأكيد. تقدم REPIM جولات افتراضية مدمجة لمعظم العقارات المتاحة. يمكنك أيضاً جدولة زيارة شخصية مباشرة من صفحة العقار.' },
      { q: 'كم يستغرق التحقق من ملف KYC؟',              a: 'يستغرق التحقق عادةً بين 24 و 48 ساعة عمل. ستتلقى إشعاراً بالبريد الإلكتروني وفي لوحة التحكم فور معالجة ملفك.' },
      { q: 'كيف أتواصل مع مالك أو وكيل العقار؟',         a: 'من صفحة العقار، يمكنك إرسال رسالة عبر الدردشة المدمجة، الاتصال مباشرة أو طلب زيارة. جميع الاتصالات مُتتبعة لأمانك.' },
      { q: 'هل REPIM متاح خارج كوت ديفوار؟',             a: 'تركز REPIM حالياً على كوت ديفوار، لكن المنصة متاحة في جميع أنحاء العالم. يمكن للمغتربين البحث والتواصل مع البائعين بدون سفر.' },
      { q: 'كيف أستخدم رمز الترويج؟',                    a: 'عند الاشتراك في خطة، أدخل رمز الترويج في الحقل المخصص قبل تأكيد الدفع. يتم تطبيق الخصم فوراً. الرموز صالحة مرة واحدة.' },
      { q: 'هل يمكنني تغيير اشتراكي في منتصف الفترة؟',   a: 'نعم، يمكنك الترقية إلى خطة أعلى في أي وقت من لوحة التحكم. يتم احتساب فرق المبلغ بالتناسب. الخفض يسري في دورة الفوترة التالية.' },
    ],
  },
  events: {
    badge: 'ندوات ومعارض', h2: 'الفعاليات القادمة',
    subtitle: 'التقِ بخبرائنا، شارك في المعارض واكتشف الفرص العقارية في كوت ديفوار.',
    register: 'التسجيل',
    items: [
      { date: '15 يونيو 2026',  type: 'ندوة',  typeCls: 'bg-blue-100 text-blue-700',   title: 'الاستثمار في العقارات الإيفوارية من المهجر',   desc: 'نصائح عملية، تمويل، مخاطر يجب تجنبها — مع خبير REPIM وكاتب عدل ضيف.', seats: 'مقاعد محدودة',    link: '#' },
      { date: '28 يونيو 2026',  type: 'معرض',  typeCls: 'bg-green-100 text-green-700',  title: 'معرض REPIM أبيدجان 2026 — الطبعة الخاصة',     desc: 'لتقِ أكثر من 50 وكالة ومطور معتمد في مكان واحد. الدخول مجاني بالتسجيل.', seats: 'تسجيل مجاني',  link: '#' },
      { date: '10 يوليو 2026',  type: 'ورشة',  typeCls: 'bg-orange-100 text-orange-700', title: 'فهم ملف KYC: دليل خطوة بخطوة',               desc: 'جلسة عملية للمحترفين الجدد: كيفية إعداد وتقديم ملفك في 30 دقيقة.', seats: '20 مشارك كحد أقصى', link: '#' },
    ],
  },
  promo: {
    badge: 'رمز ترويجي', h2: 'هل لديك رمز ترويجي؟',
    subtitle: 'أدخل رمزك للاستمتاع بخصم حصري على اشتراكك في REPIM PRO. صالح على جميع الخطط.',
    placeholder: 'مثال: REPIM2026', apply: 'تطبيق',
    ok: 'رمز صالح! تم تطبيق الخصم على اشتراكك.',
    err: 'رمز غير صالح أو منتهي الصلاحية. يرجى المحاولة مجدداً.',
  },
  newsletter: {
    badge: 'النشرة العقارية', h2: 'ابق على اطلاع بالفرص الجديدة',
    subtitle: 'احصل كل أسبوع على أفضل الإعلانات، أخبار السوق الإيفواري والدعوات لفعالياتنا.',
    placeholder: 'بريدك@الإلكتروني.com', btn: 'اشتراك',
    success: 'شكراً! ستتلقى نشرتنا الإخبارية القادمة.',
    privacy: 'بدون رسائل مزعجة. إلغاء الاشتراك بنقرة. بياناتك محمية.',
  },
  contact: {
    badge: 'تواصل', h2: 'لنتحدث عن مشروعك',
    subtitle: 'سؤال عن المنصة، شراكة، دعم تقني؟ فريقنا يرد خلال 24 ساعة.',
    name: 'اسمك', email: 'البريد الإلكتروني', message: 'الرسالة',
    namePh: 'جان كونان', emailPh: 'بريدك@إلكتروني.com', messagePh: 'صف طلبك...',
    send: 'إرسال الرسالة', sending: 'جاري الإرسال...',
    sent: 'تم إرسال الرسالة!', sentSub: 'سيرد فريقنا خلال 24 ساعة.',
    again: 'إرسال رسالة أخرى',
    phoneLabel: 'هاتف', emailLabel: 'البريد الإلكتروني', addressLabel: 'العنوان',
    address: 'أبيدجان، كوت ديفوار', worldwide: 'متاح في جميع أنحاء العالم',
  },
  finalCta: {
    badge: 'أمان · تأثير · بساطة',
    h2: 'منزلك القادم', h2b: 'يبدأ من هنا.',
    subtitle: 'انضم إلى آلاف المستخدمين الذين يثقون في REPIM لمشاريعهم العقارية. شفافية، سرعة وأمان في قطاع يشهد تحولاً شاملاً.',
    cta1: 'ابحث عن عقار', cta2: 'نشر إعلان',
    tagline: 'أمان · تأثير · بساطة · متاح على Android، iOS والويب',
  },
  footer: {
    tagline: 'منصة العقارات التي تُرقمن الرحلة العقارية في أفريقيا — من البحث إلى التوقيع.',
    tagline2: 'أمان · تأثير · بساطة',
    copyright: `© ${new Date().getFullYear()} REPIM. جميع الحقوق محفوظة.`,
    made: '♥ مبني من أجل العقارات الأفريقية',
    available: 'متاح في كوت ديفوار وأفريقيا',
    sections: [
      { title: 'المنصة', links: [{ label: 'شراء', href: '/annonces?type=vente' }, { label: 'إيجار', href: '/annonces?type=location' }, { label: 'بيع', href: '/annonces/new' }, { label: 'تقدير عقاري', href: '#tarifs' }] },
      { title: 'مساعدة', links: [{ label: 'كيف يعمل', href: '#comment-ca-marche' }, { label: 'الأسئلة الشائعة', href: '#faq' }, { label: 'تواصل معنا', href: '#contact' }, { label: 'مدونة عقارية', href: '#' }] },
      { title: 'قانوني',  links: [{ label: 'شروط الاستخدام', href: '/conditions-generales' }, { label: 'سياسة الخصوصية', href: '/politique-de-confidentialite' }, { label: 'ملاحظات قانونية', href: '/mentions-legales' }] },
    ],
  },
}

// ---------------------------------------------------------------------------
// CHINESE SIMPLIFIED
// ---------------------------------------------------------------------------
const CH: typeof FR = {
  dir: 'ltr',
  nav: {
    buy: '购买', rent: '租赁', sell: '出售', agents: '经纪人',
    partners: '合作伙伴', ourPartners: '我们的合作伙伴',
    signIn: '登录', publish: '发布广告', mySpace: '我的账户',
  },
  hero: {
    badge: '非洲领先的数字房地产平台',
    h1: '您的房地产搜索，', h1b: '终于简化了。', h1c: '让您的项目成为现实。',
    subtitle: 'REPIM将整个房地产旅程数字化——从搜索到签约。可靠广告、智能匹配、虚拟参观和安全交易。',
    tagline: '安全 · 影响 · 简单',
    placeholder: '城市、街区、区域...', searchBtn: '搜索',
    check1: '经过验证的广告', check2: '安全连接', check3: 'Android / iOS / 网页版均可使用',
    ctaAndroid: 'Android & iOS', ctaWeb: '网页应用',
    available: '在REPIM上可用 · 阿比让',
    noFraud: '零容忍欺诈', quickReport: '快速举报', userRating: '用户评分',
    stats: [
      { value: '100%',  label: '经我们团队验证的广告' },
      { value: '2500+', label: '认证经纪人和机构' },
      { value: '150万', label: '目标象牙海岸海外华人' },
      { value: '150+',  label: '开发商和投资者' },
    ],
  },
  propertyTypes: {
    badge: '在REPIM上您能找到什么', h2: '所有类型的房产，一个平台',
    items: [
      { label: '土地',       description: '私人、社区、租赁、机构' },
      { label: '别墅和公寓', description: '出售或租赁，各种档次' },
      { label: '商业机会',   description: '场地清理、勘测、土地开发' },
      { label: '物业管理',   description: '全面管理您的房产' },
      { label: '装修',       description: '与合格专业人士联系' },
      { label: '建筑与装饰', description: '建筑师、装饰师、室内设计' },
    ],
  },
  features: {
    badge: '智能功能', h2a: '您所需要的一切，', h2b: '都在一个地方',
    subtitle: 'REPIM汇集了最好的工具，简化您在非洲房地产项目的每一步。',
    items: [
      { title: '智能匹配',   desc: '我们的算法分析您的标准，实时为您推荐完全符合您的档案和预算的房产。' },
      { title: '虚拟参观',   desc: '从您的手机或电脑远程参观房产。在亲自拜访之前节省时间并筛选您的选择。' },
      { title: '内置聊天',   desc: '直接从应用程序与房东、管理员或经纪人交流。快速、安全，无需不必要的中间商。' },
      { title: '定向提醒',   desc: '一旦发布符合您搜索条件的房产，立即收到通知。再也不会错过任何房地产机会。' },
    ],
  },
  howItWorks: {
    badge: '三步完成', h2: '如何运作？',
    subtitle: '从搜索到签约，REPIM陪伴您走过房地产项目的每一步。',
    cta: '免费开始',
    steps: [
      { title: '搜索',    desc: '设定您的标准：城市、街区、预算、面积。浏览数千个经过验证的广告，包含照片和地图位置。' },
      { title: '参观',    desc: '直接通过应用程序安排实地或虚拟参观。与房东或经纪人聊天，实时提问。' },
      { title: '完成交易', desc: '安全完成您的交易。经过验证的文件，租赁或销售合同，在公证人处自动注册。' },
    ],
  },
  testimonials: {
    badge: '用户评价', h2: '他们在REPIM找到了理想房产',
    subtitle: '数千名用户信任REPIM进行他们的房地产项目。',
    items: [
      { name: 'Amina K.',  role: '租户 — 阿比让',     avatar: 'AK', rating: 5,   text: 'REPIM帮助我在不到3周的时间内找到了我的公寓。智能匹配系统准确地向我发送了我想要的内容，没有浪费时间。' },
      { name: 'Moussa D.', role: '房地产投资者',       avatar: 'MD', rating: 4,   text: '我通过虚拟参观从海外管理了两笔交易。REPIM的透明度和安全性真的让我放心。' },
      { name: 'Sophie L.', role: '房产卖家',           avatar: 'SL', rating: 3.5, text: '我发布了我的房产，第二天就收到了合格的询问。管理广告的仪表板真的很直观。' },
      { name: 'Yves K.',   role: 'PRO机构 — Cocody', avatar: 'YK', rating: 4,   text: '作为REPIM认证机构，我在2个月内将联系量增加了三倍。该平台吸引了认真且信息充分的客户。' },
    ],
  },
  pricing: {
    badge: '专业定价', h2: '高级访问，无意外收费',
    subtitle: '租户和买家免费 · 专业人士和房主订阅',
    popular: '最受欢迎', choosePlan: '选择此计划', freeNote: '所有用户免费浏览 · 无需承诺',
    plans: [
      { label: '月度',   price: '20,000',  devise: 'XOF/月',  euro: '30.49 EUR',  highlight: false },
      { label: '季度',   price: '56,500',  devise: 'XOF/季',  euro: '86.14 EUR',  highlight: false },
      { label: '半年度', price: '115,000', devise: 'XOF/半年', euro: '175.33 EUR', highlight: true  },
      { label: '年度',   price: '200,000', devise: 'XOF/年',  euro: '304.90 EUR', highlight: false },
    ],
  },
  faq: {
    badge: '常见问题', h2: '常见问题解答',
    subtitle: '关于REPIM您需要了解的一切。',
    noAnswer: '找不到答案？', contactTeam: '联系我们的团队',
    items: [
      { q: 'REPIM对搜索者是免费的吗？',           a: '是的，浏览、搜索和查看广告对租户和买家完全免费。只有专业人士才需要订阅计划来发布广告。' },
      { q: '广告验证是如何工作的？',               a: '每个广告在发布前都要经过我们团队的人工审核。专业人士必须提供完整的KYC文件。这保证了平台上零欺诈。' },
      { q: '我可以远程参观房产吗？',               a: '当然可以。REPIM为大多数可用房产提供集成虚拟参观。您也可以直接从房产页面安排实地参观。' },
      { q: 'KYC验证需要多长时间？',               a: '验证通常需要24到48个工作小时。一旦您的文件处理完毕，您将通过电子邮件和仪表板收到通知。' },
      { q: '如何联系房产的房东或经纪人？',          a: '从房产页面，您可以通过内置聊天发送消息、直接致电或请求参观。所有通信都会被跟踪以确保您的安全。' },
      { q: 'REPIM在科特迪瓦以外可用吗？',          a: 'REPIM目前专注于科特迪瓦，但该平台在全球范围内均可访问。象牙海岸海外人员可以搜索和联系卖家而无需旅行。' },
      { q: '如何使用促销码？',                    a: '订阅计划时，在确认付款前在专用字段中输入您的促销码。折扣立即生效。代码只能使用一次，不能与其他优惠叠加。' },
      { q: '我可以在订阅期间更改订阅吗？',          a: '是的，您可以随时从仪表板升级到更高的计划。金额差额按比例计算。降级在下一个计费周期生效。' },
    ],
  },
  events: {
    badge: '网络研讨会和展会', h2: '即将举行的活动',
    subtitle: '认识我们的专家，参加展会并发现科特迪瓦的房地产机会。',
    register: '注册',
    items: [
      { date: '2026年6月15日',  type: '网络研讨会', typeCls: 'bg-blue-100 text-blue-700',   title: '从海外投资象牙海岸房地产',  desc: '实用建议、融资、注意事项——与REPIM专家和受邀公证人共同探讨。', seats: '名额有限',        link: '#' },
      { date: '2026年6月28日',  type: '展会',       typeCls: 'bg-green-100 text-green-700',  title: 'REPIM阿比让2026展会——特别版', desc: '在一个地方遇见50多家认证机构和开发商。注册免费入场。', seats: '免费注册',        link: '#' },
      { date: '2026年7月10日',  type: '工作坊',     typeCls: 'bg-orange-100 text-orange-700', title: '了解KYC文件：一步一步指南', desc: '针对新专业人士的实践课程：如何在30分钟内准备和提交您的文件。', seats: '最多20名参与者', link: '#' },
    ],
  },
  promo: {
    badge: '促销码', h2: '您有促销码吗？',
    subtitle: '输入您的代码，享受REPIM PRO订阅的专属折扣。适用于所有计划。',
    placeholder: '例如：REPIM2026', apply: '应用',
    ok: '代码有效！折扣已应用于您的订阅。',
    err: '无效或已过期的代码。请重试。',
  },
  newsletter: {
    badge: '房地产新闻通讯', h2: '关注最新机会',
    subtitle: '每周接收最佳广告、象牙海岸市场新闻和我们活动的邀请。',
    placeholder: '您的@电子邮件.com', btn: '订阅',
    success: '谢谢！您将收到我们的下一期新闻通讯。',
    privacy: '无垃圾邮件。一键退订。数据受保护。',
  },
  contact: {
    badge: '联系方式', h2: '让我们谈谈您的项目',
    subtitle: '有关平台的问题、合作伙伴关系或技术支持？我们的团队在24小时内回复。',
    name: '您的姓名', email: '电子邮件', message: '消息',
    namePh: '张伟', emailPh: '您的@邮箱.com', messagePh: '描述您的请求...',
    send: '发送消息', sending: '发送中...',
    sent: '消息已发送！', sentSub: '我们的团队将在24小时内回复。',
    again: '发送另一条消息',
    phoneLabel: '电话', emailLabel: '电子邮件', addressLabel: '地址',
    address: '阿比让，科特迪瓦', worldwide: '可在全球任何地方访问',
  },
  finalCta: {
    badge: '安全 · 影响 · 简单',
    h2: '您的下一个家', h2b: '从这里开始。',
    subtitle: '加入数千名信任REPIM在科特迪瓦进行房地产交易的用户。透明、快速和安全。',
    cta1: '找到我的房产', cta2: '发布广告',
    tagline: '安全 · 影响 · 简单 · 适用于Android、iOS和网页',
  },
  footer: {
    tagline: '非洲的房地产市场——数字化整个房地产旅程，从搜索到签约。',
    tagline2: '安全 · 影响 · 简单',
    copyright: `© ${new Date().getFullYear()} REPIM. 保留所有权利。`,
    made: '♥ 为非洲房地产而生',
    available: '在科特迪瓦和非洲均可使用',
    sections: [
      { title: '平台', links: [{ label: '购买', href: '/annonces?type=vente' }, { label: '租赁', href: '/annonces?type=location' }, { label: '出售', href: '/annonces/new' }, { label: '估价我的房产', href: '#tarifs' }] },
      { title: '帮助', links: [{ label: '如何运作', href: '#comment-ca-marche' }, { label: '常见问题', href: '#faq' }, { label: '联系我们', href: '#contact' }, { label: '房地产博客', href: '#' }] },
      { title: '法律', links: [{ label: '使用条款', href: '/conditions-generales' }, { label: '隐私政策', href: '/politique-de-confidentialite' }, { label: '法律声明', href: '/mentions-legales' }] },
    ],
  },
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const TRANSLATIONS: Record<LangCode, typeof FR> = { FR, EN, AR, CH }
export type Translations = typeof FR
