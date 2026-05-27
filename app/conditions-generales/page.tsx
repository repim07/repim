import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation de la plateforme REPIM.",
}

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">

        <Link href="/" className="text-sm text-orange-500 hover:text-orange-600 font-medium mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm text-stone-500 mb-10">Dernière mise à jour : juin 2025</p>

        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">1. Présentation du service</h2>
            <p>
              REPIM est une plateforme numérique de mise en relation immobilière opérée par{' '}
              <strong>[Nom de l&apos;entreprise]</strong>, société de droit ivoirien au capital de{' '}
              <strong>[Montant]</strong>, immatriculée au RCCM d&apos;Abidjan sous le numéro{' '}
              <strong>[Numéro RCCM]</strong>, dont le siège social est situé au{' '}
              <strong>[Adresse complète]</strong> (ci-après « REPIM »).
            </p>
            <p className="mt-2">
              La plateforme permet à des particuliers et des professionnels de l&apos;immobilier de
              publier, consulter et répondre à des annonces de vente, location ou investissement
              immobilier en Côte d&apos;Ivoire et en Afrique de l&apos;Ouest.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">2. Acceptation des conditions</h2>
            <p>
              L&apos;accès et l&apos;utilisation de REPIM impliquent l&apos;acceptation pleine et entière des
              présentes Conditions Générales d&apos;Utilisation (CGU). Si vous n&apos;acceptez pas ces
              conditions, vous devez cesser immédiatement d&apos;utiliser le service.
            </p>
            <p className="mt-2">
              REPIM se réserve le droit de modifier les présentes CGU à tout moment. Les
              utilisateurs seront informés de toute modification substantielle par email ou par
              notification dans l&apos;application. La poursuite de l&apos;utilisation du service vaut
              acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">3. Inscription et compte utilisateur</h2>
            <p>
              L&apos;accès à certaines fonctionnalités (publication d&apos;annonces, prise de rendez-vous,
              messagerie) requiert la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des
              informations exactes, complètes et à jour lors de son inscription.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>L&apos;utilisateur est responsable de la confidentialité de ses identifiants.</li>
              <li>Tout accès non autorisé doit être signalé immédiatement à REPIM.</li>
              <li>Un seul compte par personne physique ou morale est autorisé.</li>
              <li>REPIM se réserve le droit de suspendre tout compte en cas d&apos;utilisation frauduleuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">4. Publication d&apos;annonces</h2>
            <p>
              Les utilisateurs habilitués (agents, propriétaires, promoteurs) peuvent publier des
              annonces immobilières. En publiant une annonce, l&apos;utilisateur certifie :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Être propriétaire du bien ou disposer d&apos;un mandat valide pour le proposer.</li>
              <li>Que les informations publiées (prix, superficie, localisation) sont exactes.</li>
              <li>Que les photos utilisées sont libres de droits ou lui appartiennent.</li>
              <li>Ne pas publier de contenu à caractère trompeur, illicite ou discriminatoire.</li>
            </ul>
            <p className="mt-2">
              REPIM se réserve le droit de supprimer toute annonce ne respectant pas ces conditions,
              sans préavis ni remboursement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">5. Abonnements et paiements</h2>
            <p>
              Certains profils (agents, agences, promoteurs) bénéficient d&apos;une période d&apos;essai
              gratuite de 21 jours, puis d&apos;un accès sur abonnement payant. Les tarifs en vigueur
              sont disponibles sur la page <Link href="/partenaires/abonnement" className="text-orange-500 hover:underline">Abonnements</Link>.
            </p>
            <p className="mt-2">
              Les paiements sont traités par des prestataires tiers sécurisés. REPIM ne conserve
              aucune donnée bancaire. Les abonnements sont résiliables à tout moment depuis le
              tableau de bord. Aucun remboursement n&apos;est accordé pour la période en cours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">6. Responsabilité</h2>
            <p>
              REPIM est un intermédiaire technique de mise en relation. À ce titre :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>REPIM ne vérifie pas systématiquement l&apos;exactitude des annonces publiées.</li>
              <li>REPIM ne saurait être tenu responsable des transactions conclues entre utilisateurs.</li>
              <li>REPIM ne garantit pas la disponibilité ininterrompue du service (maintenance, pannes).</li>
              <li>En cas de litige entre utilisateurs, REPIM peut, sans y être obligé, jouer un rôle de médiation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">7. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des éléments de la plateforme (logo, design, code, textes, base de données)
              est la propriété exclusive de REPIM et est protégé par les lois en vigueur relatives
              à la propriété intellectuelle. Toute reproduction sans autorisation écrite est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">8. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit ivoirien. En cas de litige, les parties
              s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux compétents
              d&apos;Abidjan seront seuls habilités à connaître du différend.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">9. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU, contactez-nous à l&apos;adresse :{' '}
              <strong>[contact@repim.ci]</strong>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
