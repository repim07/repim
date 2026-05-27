import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation de la plateforme immobilière REPIM.",
}

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium mb-10 transition-colors"
        >
          ← Retour à l&apos;accueil
        </Link>

        <header className="mb-10 pb-8 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Dernière mise à jour : juin 2025 — Version 1.0
          </p>
          <p className="mt-4 text-slate-600 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
            En accédant et en utilisant la plateforme REPIM, vous acceptez sans réserve les présentes
            Conditions Générales d&apos;Utilisation (CGU). Si vous n&apos;acceptez pas ces conditions,
            veuillez cesser immédiatement d&apos;utiliser le service.
          </p>
        </header>

        <div className="space-y-10 text-slate-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 1 — Objet du service
            </h2>
            <p>
              La société <strong>REPIM</strong>, SARL au capital de 1 000 000 FCFA, dont le siège
              social est situé à Cocody Angré 8e tranche Sagecim Rue L269, Abidjan, Côte d&apos;Ivoire
              (ci-après « REPIM »), édite et exploite la plateforme numérique accessible à l&apos;adresse
              repim.vercel.app et ses sous-domaines (ci-après « la Plateforme »).
            </p>
            <p className="mt-3">
              REPIM est une <strong>marketplace immobilière de mise en relation</strong> entre :
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                ['Chercheurs', 'particuliers recherchant un bien à louer ou à acquérir'],
                ['Propriétaires', 'personnes physiques souhaitant louer ou vendre leur bien'],
                ['Agents immobiliers', 'professionnels mandatés pour gérer des biens'],
                ['Agences & Promoteurs', 'sociétés proposant des programmes ou portefeuilles immobiliers'],
              ].map(([role, desc]) => (
                <li key={role} className="flex items-start gap-2">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  <span><strong>{role} :</strong> {desc}.</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              REPIM agit en qualité d&apos;<strong>intermédiaire technique</strong> et ne participe pas
              directement aux transactions immobilières conclues entre ses utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 2 — Conditions d&apos;accès et de création de compte
            </h2>
            <p>
              L&apos;accès aux fonctionnalités avancées de la Plateforme (publication d&apos;annonces,
              messagerie, prise de rendez-vous, tableau de bord) nécessite la création d&apos;un compte
              utilisateur.
            </p>
            <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.1 Conditions d&apos;éligibilité</h3>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>Être une personne physique majeure (18 ans ou plus) ou une personne morale légalement constituée.</li>
              <li>Fournir des informations exactes, complètes et à jour lors de l&apos;inscription.</li>
              <li>Ne pas avoir fait l&apos;objet d&apos;une suspension ou d&apos;une exclusion définitive de la Plateforme.</li>
            </ul>
            <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.2 Obligations relatives au compte</h3>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>Un seul compte est autorisé par personne physique ou morale.</li>
              <li>L&apos;utilisateur est seul responsable de la confidentialité de ses identifiants.</li>
              <li>Tout accès non autorisé ou toute suspicion de piratage doit être signalé immédiatement à <strong>repim.ci1986@gmail.com</strong>.</li>
              <li>REPIM se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis ni indemnité.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 3 — Accès et abonnements
            </h2>
            <p>
              L&apos;accès à la Plateforme est partiellement gratuit. Certaines fonctionnalités réservées
              aux professionnels (agents, agences, promoteurs) sont soumises à un abonnement payant,
              après une <strong>période d&apos;essai gratuite de 21 jours</strong>.
            </p>
            <p className="mt-3">
              Les tarifs des abonnements disponibles sont présentés sur la page dédiée et peuvent être
              modifiés par REPIM à tout moment, avec un préavis de 15 jours notifié par email. La
              poursuite de l&apos;utilisation du service après la modification des tarifs vaut acceptation.
            </p>
            <p className="mt-3">
              Les abonnements sont résiliables à tout moment depuis le tableau de bord utilisateur.
              <strong> Aucun remboursement ne sera accordé</strong> pour la période en cours au moment
              de la résiliation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 4 — Responsabilités de l&apos;utilisateur
            </h2>
            <h3 className="font-semibold text-slate-800 mt-4 mb-2">4.1 Publications et annonces</h3>
            <p>
              En publiant une annonce, l&apos;utilisateur certifie sur l&apos;honneur :
            </p>
            <ul className="mt-2 space-y-1.5 list-disc pl-5">
              <li>Être propriétaire du bien ou détenir un mandat valide et en cours pour le proposer à la vente ou à la location.</li>
              <li>Que toutes les informations publiées (prix, superficie, localisation, état du bien, photos) sont exactes, sincères et non trompeuses.</li>
              <li>Que les visuels utilisés lui appartiennent ou sont libres de droits.</li>
              <li>Ne pas publier plusieurs annonces pour le même bien.</li>
            </ul>
            <h3 className="font-semibold text-slate-800 mt-4 mb-2">4.2 Comportements interdits</h3>
            <p>Il est formellement interdit d&apos;utiliser la Plateforme pour :</p>
            <ul className="mt-2 space-y-1.5 list-disc pl-5">
              <li>Publier de fausses annonces, des arnaques, des offres fictives ou des biens qui n&apos;existent pas.</li>
              <li>Usurper l&apos;identité d&apos;un tiers, d&apos;une agence ou d&apos;un professionnel.</li>
              <li>Collecter des données personnelles d&apos;autres utilisateurs à des fins non autorisées.</li>
              <li>Diffuser du contenu illégal, diffamatoire, discriminatoire ou portant atteinte aux bonnes mœurs.</li>
              <li>Tenter de contourner les systèmes de sécurité de la Plateforme.</li>
              <li>Utiliser des robots, scripts ou tout autre outil automatisé pour interagir avec la Plateforme.</li>
            </ul>
            <p className="mt-3">
              Tout manquement à ces obligations engage la responsabilité exclusive de l&apos;utilisateur
              concerné et pourra entraîner la suspension immédiate de son compte, le retrait de ses
              annonces, et des poursuites judiciaires si nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 5 — Limitation de responsabilité de REPIM
            </h2>
            <p>
              REPIM est un <strong>intermédiaire technique de mise en relation</strong>. À ce titre,
              REPIM ne saurait être tenu responsable :
            </p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>De l&apos;exactitude, de la complétude ou de la licéité des annonces publiées par les utilisateurs.</li>
              <li>Des transactions, accords, litiges ou dommages résultant d&apos;une mise en relation opérée via la Plateforme.</li>
              <li>De la solvabilité, de l&apos;identité réelle ou du sérieux des utilisateurs.</li>
              <li>Des interruptions de service liées à des opérations de maintenance, des pannes techniques ou des cas de force majeure (catastrophes naturelles, cyberattaques, pannes des infrastructures d&apos;hébergement, etc.).</li>
              <li>Des contenus accessibles via des liens hypertextes pointant vers des sites tiers.</li>
            </ul>
            <p className="mt-3">
              En cas de litige entre utilisateurs, REPIM peut, sans y être obligé, intervenir en tant
              que facilitateur. Il appartient aux parties de résoudre leurs différends à l&apos;amiable
              ou devant les juridictions compétentes.
            </p>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <p className="font-semibold text-amber-800 mb-1">Vigilance recommandée</p>
              <p className="text-amber-700">
                REPIM vous rappelle de ne jamais effectuer de versement d&apos;argent avant
                d&apos;avoir physiquement visité un bien et vérifié l&apos;identité du propriétaire
                ou de l&apos;agent. En cas de suspicion d&apos;arnaque, signalez immédiatement
                l&apos;annonce via le bouton « Signaler » ou contactez-nous à{' '}
                <strong>repim.ci1986@gmail.com</strong>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 6 — Propriété intellectuelle
            </h2>
            <p>
              La marque <strong>REPIM</strong>, le logo, la charte graphique, l&apos;architecture de la
              Plateforme, les textes, les fonctionnalités, et l&apos;ensemble du code source sont la
              propriété exclusive de la société REPIM et sont protégés par les dispositions du Code
              de la Propriété Intellectuelle en vigueur en Côte d&apos;Ivoire ainsi que par les
              conventions internationales applicables.
            </p>
            <p className="mt-3">
              Toute reproduction, adaptation, distribution ou exploitation commerciale, totale ou
              partielle, sans autorisation écrite préalable de REPIM est strictement interdite et
              constitue une contrefaçon pouvant entraîner des poursuites civiles et pénales.
            </p>
            <p className="mt-3">
              Les contenus publiés par les utilisateurs (photos, descriptions de biens) restent leur
              propriété. En les publiant sur REPIM, ils accordent à REPIM une licence non exclusive,
              mondiale et gratuite d&apos;utilisation aux fins de fonctionnement et de promotion de
              la Plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 7 — Modification des CGU
            </h2>
            <p>
              REPIM se réserve le droit de modifier les présentes CGU à tout moment pour les adapter
              à l&apos;évolution du service ou de la réglementation applicable. Les utilisateurs seront
              informés de toute modification substantielle par email ou par notification dans
              l&apos;application, avec un préavis minimum de 15 jours.
            </p>
            <p className="mt-3">
              La poursuite de l&apos;utilisation de la Plateforme après l&apos;entrée en vigueur des
              nouvelles CGU vaut acceptation sans réserve de celles-ci.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 8 — Droit applicable et juridiction compétente
            </h2>
            <p>
              Les présentes CGU sont régies et interprétées conformément au droit ivoirien, notamment :
            </p>
            <ul className="mt-2 space-y-1.5 list-disc pl-5">
              <li>La loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques.</li>
              <li>La loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.</li>
              <li>Le droit de l&apos;OHADA applicable aux activités commerciales en Afrique de l&apos;Ouest.</li>
            </ul>
            <p className="mt-3">
              En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU,
              les parties s&apos;efforceront de trouver une solution amiable. À défaut, le
              <strong> Tribunal de Commerce d&apos;Abidjan</strong> sera seul compétent pour
              connaître du différend.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Article 9 — Contact
            </h2>
            <p>Pour toute question relative aux présentes CGU, vous pouvez nous contacter :</p>
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <p><span className="font-semibold text-slate-800">Email :</span>{' '}
                <a href="mailto:repim.ci1986@gmail.com" className="text-orange-500 hover:underline">
                  repim.ci1986@gmail.com
                </a>
              </p>
              <p><span className="font-semibold text-slate-800">Téléphone :</span>{' '}
                <a href="tel:+22501010427" className="text-orange-500 hover:underline">
                  +225 01 01 04 27 76
                </a>
              </p>
              <p>
                <span className="font-semibold text-slate-800">Adresse :</span>{' '}
                Cocody Angré 8e tranche Sagecim Rue L269, Abidjan, Côte d&apos;Ivoire
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
