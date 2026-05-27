import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Comment REPIM collecte, utilise et protège vos données personnelles conformément à la loi ivoirienne.',
}

export default function PolitiqueConfidentialitePage() {
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
          <h1 className="text-3xl font-extrabold text-slate-900">Politique de Confidentialité</h1>
          <p className="mt-2 text-sm text-slate-500">Dernière mise à jour : juin 2025</p>
          <p className="mt-4 text-slate-600 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            La protection de vos données personnelles est une priorité pour REPIM. Cette politique
            explique quelles données nous collectons, pourquoi et comment vous pouvez exercer vos
            droits. Elle est conforme à la <strong>loi ivoirienne n°2013-450</strong> relative à la
            protection des données à caractère personnel et aux standards internationaux de transparence.
          </p>
        </header>

        <div className="space-y-10 text-slate-700 text-sm leading-relaxed">

          {/* Responsable */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              1. Responsable du traitement
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <p><span className="font-semibold text-slate-800">Société :</span> REPIM — SARL au capital de 1 000 000 FCFA</p>
              <p><span className="font-semibold text-slate-800">Adresse :</span> Cocody Angré 8e tranche Sagecim Rue L269, Abidjan, Côte d&apos;Ivoire</p>
              <p>
                <span className="font-semibold text-slate-800">Contact données personnelles :</span>{' '}
                <a href="mailto:repim.ci1986@gmail.com" className="text-orange-500 hover:underline">
                  repim.ci1986@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-slate-800">Téléphone :</span>{' '}
                <a href="tel:+22501010427" className="text-orange-500 hover:underline">
                  +225 01 01 04 27 76
                </a>
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              2. Données collectées et finalités
            </h2>
            <p className="mb-4">
              Nous collectons uniquement les données strictement nécessaires au fonctionnement du
              service. Voici un récapitulatif complet selon le type de donnée :
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Donnée collectée</th>
                    <th className="px-4 py-3 text-left font-semibold">Finalité</th>
                    <th className="px-4 py-3 text-left font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Nom et prénom', 'Création et gestion du compte utilisateur', 'Exécution du contrat'],
                    ['Adresse email', 'Authentification, notifications, support', 'Exécution du contrat'],
                    ['Numéro de téléphone', 'Mise en relation, prise de rendez-vous', 'Consentement'],
                    ['Rôle / profil professionnel', 'Personnalisation des fonctionnalités', 'Exécution du contrat'],
                    ['Photos et descriptions de biens', 'Publication et diffusion d\'annonces immobilières', 'Exécution du contrat'],
                    ['Localisation (ville, quartier)', 'Recherche géolocalisée, affichage des annonces', 'Intérêt légitime'],
                    ['Données de paiement', 'Facturation des abonnements professionnels', 'Exécution du contrat'],
                    ['Logs de connexion, adresse IP', 'Sécurité, prévention de la fraude, débogage', 'Intérêt légitime'],
                    ['Cookies de session', 'Maintien de la connexion sécurisée', 'Nécessité technique'],
                  ].map(([data, purpose, basis]) => (
                    <tr key={data} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{data}</td>
                      <td className="px-4 py-3 text-slate-600">{purpose}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          basis === 'Consentement'
                            ? 'bg-blue-100 text-blue-700'
                            : basis === 'Intérêt légitime'
                            ? 'bg-amber-100 text-amber-700'
                            : basis === 'Nécessité technique'
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {basis}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-slate-500 text-xs">
              * Les données de paiement ne sont pas stockées directement par REPIM. Elles sont
              traitées exclusivement par nos prestataires de paiement certifiés (ex. CinetPay, Wave).
            </p>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              3. Durée de conservation
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Type de donnée</th>
                    <th className="px-4 py-3 text-left font-semibold">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Données de compte (profil, email, téléphone)', 'Durée de vie du compte + 3 ans après clôture'],
                    ['Annonces immobilières publiées', '30 jours après expiration ou retrait de l\'annonce'],
                    ['Historique des transactions / abonnements', '5 ans (obligation légale comptable et fiscale)'],
                    ['Logs techniques et de connexion', '12 mois glissants'],
                    ['Cookies de session', 'Durée de la session (supprimés à la déconnexion)'],
                  ].map(([type, duration]) => (
                    <tr key={type} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{type}</td>
                      <td className="px-4 py-3 text-slate-600">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              À l&apos;expiration de ces délais, les données sont supprimées définitivement ou anonymisées
              de façon irréversible à des fins statistiques.
            </p>
          </section>

          {/* Partage */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              4. Partage et transfert des données
            </h2>
            <p>
              <strong>Vos données ne sont jamais vendues à des tiers.</strong> Elles peuvent être
              partagées uniquement dans les cas suivants :
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  name: 'Supabase Inc.',
                  role: 'Base de données et authentification — serveurs localisés en Union Européenne (Frankfurt).',
                  link: 'https://supabase.com/privacy',
                },
                {
                  name: 'Vercel Inc.',
                  role: 'Hébergement de l\'application web — certifié SOC 2 Type II.',
                  link: 'https://vercel.com/legal/privacy-policy',
                },
                {
                  name: 'Prestataires de paiement',
                  role: 'CinetPay, Wave ou équivalent — certifiés PCI-DSS, pour le traitement des abonnements.',
                  link: null,
                },
                {
                  name: 'Autorités légales compétentes',
                  role: 'Sur réquisition judiciaire, conformément à la loi ivoirienne et aux conventions internationales.',
                  link: null,
                },
              ].map(({ name, role }) => (
                <div key={name} className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800">{name}</p>
                  <p className="text-slate-600 mt-0.5">{role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              5. Cookies et traceurs
            </h2>
            <p>
              REPIM utilise exclusivement des <strong>cookies strictement nécessaires</strong> au
              fonctionnement du service : gestion de la session d&apos;authentification et sécurité.
            </p>
            <p className="mt-3">
              <strong>Aucun cookie publicitaire, analytique tiers ou de tracking
              comportemental n&apos;est utilisé</strong> sur la Plateforme à ce jour.
            </p>
            <p className="mt-3">
              Vous pouvez à tout moment supprimer les cookies depuis les paramètres de votre
              navigateur. La suppression des cookies de session entraînera votre déconnexion
              automatique de la Plateforme.
            </p>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              6. Sécurité des données
            </h2>
            <p>
              REPIM met en œuvre des mesures techniques et organisationnelles adaptées pour protéger
              vos données contre tout accès non autorisé, altération ou destruction :
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Chiffrement de toutes les communications via le protocole <strong>TLS (HTTPS)</strong>.</li>
              <li>Accès aux données de production strictement limité aux personnes habilitées.</li>
              <li>Authentification sécurisée via Supabase Auth (hachage des mots de passe).</li>
              <li>Sauvegardes régulières des données avec conservation sécurisée.</li>
              <li>Politique de Row Level Security (RLS) en base de données : chaque utilisateur n&apos;accède qu&apos;à ses propres données.</li>
            </ul>
          </section>

          {/* Droits */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              7. Vos droits
            </h2>
            <p>
              Conformément à la <strong>loi ivoirienne n°2013-450</strong> relative à la protection
              des données à caractère personnel, vous disposez des droits suivants :
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                ['Droit d\'accès', 'Obtenir une copie de toutes les données personnelles que nous détenons sur vous.'],
                ['Droit de rectification', 'Corriger toute donnée inexacte ou incomplète vous concernant.'],
                ['Droit à l\'effacement', 'Demander la suppression définitive de votre compte et de vos données personnelles.'],
                ['Droit à la portabilité', 'Recevoir vos données dans un format structuré et lisible par machine.'],
                ['Droit d\'opposition', 'Vous opposer au traitement de vos données pour motif légitime.'],
                ['Droit de limitation', 'Demander la suspension temporaire du traitement de vos données.'],
              ].map(([right, desc]) => (
                <div key={right} className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800 mb-1">{right}</p>
                  <p className="text-slate-600 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
              <p className="font-semibold text-orange-800 mb-1">Comment exercer vos droits ?</p>
              <p className="text-orange-700">
                Envoyez votre demande par email à{' '}
                <a href="mailto:repim.ci1986@gmail.com" className="font-bold underline">
                  repim.ci1986@gmail.com
                </a>{' '}
                en précisant votre nom, email de compte et le droit que vous souhaitez exercer.
                Nous nous engageons à répondre dans un délai maximum de <strong>30 jours</strong>.
              </p>
              <p className="mt-2 text-orange-700 text-xs">
                En cas d&apos;insatisfaction, vous pouvez saisir l&apos;autorité de contrôle compétente :{' '}
                <strong>l&apos;Autorité de Régulation des Télécommunications / TIC de Côte d&apos;Ivoire (ARTCI)</strong>.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              8. Modifications de cette politique
            </h2>
            <p>
              REPIM se réserve le droit de modifier la présente politique pour l&apos;adapter à l&apos;évolution
              du service, de la réglementation ou des pratiques en matière de protection des données.
              En cas de modification substantielle, vous serez informé par email ou par notification
              dans l&apos;application au moins <strong>15 jours avant</strong> l&apos;entrée en vigueur de
              la nouvelle version.
            </p>
          </section>

          {/* Contact */}
          <section className="pb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              9. Contact
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
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

          <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-sm">
            <Link href="/conditions-generales" className="text-orange-500 hover:text-orange-600 hover:underline font-medium">
              Conditions Générales d&apos;Utilisation
            </Link>
            <Link href="/mentions-legales" className="text-orange-500 hover:text-orange-600 hover:underline font-medium">
              Mentions Légales
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
