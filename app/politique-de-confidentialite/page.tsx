import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Comment REPIM collecte, utilise et protège vos données personnelles.',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">

        <Link href="/" className="text-sm text-orange-500 hover:text-orange-600 font-medium mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-stone-500 mb-10">Dernière mise à jour : juin 2025</p>

        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement de vos données personnelles est{' '}
              <strong>[Nom de l&apos;entreprise]</strong>, dont le siège social est situé au{' '}
              <strong>[Adresse complète]</strong>, Abidjan, Côte d&apos;Ivoire.
            </p>
            <p className="mt-2">
              Contact DPO / données personnelles :{' '}
              <strong>[privacy@repim.ci]</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes selon votre utilisation du service :</p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Donnée</th>
                    <th className="px-4 py-2 text-left font-semibold">Finalité</th>
                    <th className="px-4 py-2 text-left font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[
                    ['Nom, prénom, email', 'Création de compte, communication', 'Exécution du contrat'],
                    ['Numéro de téléphone', 'Prise de contact, rendez-vous', 'Consentement'],
                    ['Photos de biens', 'Publication d\'annonces', 'Exécution du contrat'],
                    ['Localisation (ville, quartier)', 'Recherche géolocalisée', 'Intérêt légitime'],
                    ['Données de paiement', 'Facturation abonnement', 'Exécution du contrat'],
                    ['Logs de connexion, IP', 'Sécurité, prévention fraude', 'Intérêt légitime'],
                  ].map(([data, purpose, basis]) => (
                    <tr key={data}>
                      <td className="px-4 py-2 font-medium text-stone-800">{data}</td>
                      <td className="px-4 py-2 text-stone-600">{purpose}</td>
                      <td className="px-4 py-2 text-stone-600">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">3. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Données de compte : durée de vie du compte + 3 ans après clôture.</li>
              <li>Annonces publiées : supprimées 30 jours après expiration ou retrait.</li>
              <li>Données de paiement : 5 ans (obligation légale comptable).</li>
              <li>Logs techniques : 12 mois glissants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">4. Partage des données</h2>
            <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase</strong> (base de données et authentification) — hébergé en UE.</li>
              <li><strong>Vercel</strong> (hébergement de l&apos;application) — conforme SOC 2.</li>
              <li><strong>Prestataires de paiement</strong> (ex. CinetPay, Wave) — certifiés PCI-DSS.</li>
              <li>Autorités compétentes, sur réquisition judiciaire uniquement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">5. Cookies et traceurs</h2>
            <p>
              REPIM utilise des cookies strictement nécessaires au fonctionnement du service
              (gestion de session, sécurité). Aucun cookie publicitaire ou de tracking tiers n&apos;est
              utilisé à ce jour. Vous pouvez gérer les cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">6. Vos droits</h2>
            <p>
              Conformément aux lois applicables (RGPD, Loi ivoirienne n°2013-450 relative à la
              protection des données personnelles), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données.</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
              <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de votre compte et données.</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements.</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, écrivez à <strong>[privacy@repim.ci]</strong>. Nous répondons
              sous 30 jours. En cas d&apos;insatisfaction, vous pouvez saisir l&apos;autorité compétente
              (ARTCI en Côte d&apos;Ivoire).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">7. Sécurité</h2>
            <p>
              REPIM met en œuvre des mesures techniques et organisationnelles adaptées pour protéger
              vos données : chiffrement TLS en transit, accès restreint aux données en production,
              authentification à deux facteurs pour l&apos;administration, sauvegardes régulières.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">8. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. En cas de modification substantielle, vous serez
              notifié par email ou via l&apos;application au moins 15 jours avant l&apos;entrée en vigueur.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
