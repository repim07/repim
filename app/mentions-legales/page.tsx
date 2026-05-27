import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales de la plateforme REPIM, marketplace immobilière en Côte d\'Ivoire.',
}

export default function MentionsLegalesPage() {
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
          <h1 className="text-3xl font-extrabold text-slate-900">Mentions Légales</h1>
          <p className="mt-2 text-sm text-slate-500">Dernière mise à jour : juin 2025</p>
        </header>

        <div className="space-y-10 text-slate-700 text-sm leading-relaxed">

          {/* Éditeur */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              1. Éditeur du site
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Dénomination sociale',  'REPIM'],
                    ['Forme juridique',        'Société à Responsabilité Limitée (SARL)'],
                    ['Capital social',         '1 000 000 FCFA'],
                    ['Siège social',           'Cocody Angré 8e tranche Sagecim Rue L269, Abidjan, Côte d\'Ivoire'],
                    ['Email de contact',       'repim.ci1986@gmail.com'],
                    ['Téléphone',              '+225 01 01 04 27 76'],
                    ['Directeur de publication', 'Le Gérant de la société REPIM'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50 w-48 align-top">
                        {label}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Hébergeur */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              2. Hébergement
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Hébergeur',  'Vercel Inc.'],
                    ['Adresse',    '650 California St, San Francisco, CA 94108, États-Unis'],
                    ['Site web',   'https://vercel.com'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50 w-48 align-top">
                        {label}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Base de données */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              3. Base de données et authentification
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Fournisseur',              'Supabase Inc.'],
                    ['Localisation des serveurs', 'Union Européenne (Frankfurt, Allemagne)'],
                    ['Site web',                  'https://supabase.com'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-5 py-3 font-semibold text-slate-700 bg-slate-50 w-48 align-top">
                        {label}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              4. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des éléments constituant le site REPIM — notamment la marque, le logo,
              le design, l&apos;architecture, les textes, les photographies, les fonctionnalités et
              le code source — sont la propriété exclusive de la société REPIM et sont protégés par
              la législation ivoirienne et internationale relative à la propriété intellectuelle.
            </p>
            <p className="mt-3">
              Toute reproduction, représentation, modification, publication ou adaptation, totale ou
              partielle, de ces éléments, quel que soit le moyen ou le procédé utilisé, est
              formellement interdite sans l&apos;autorisation écrite préalable de REPIM.
              Toute exploitation non autorisée constitue une contrefaçon sanctionnable.
            </p>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              5. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit ivoirien, notamment
              la loi n°2013-546 relative aux transactions électroniques et la loi n°2013-450 relative
              à la protection des données à caractère personnel. En cas de litige, les tribunaux
              compétents de la ville d&apos;Abidjan, Côte d&apos;Ivoire, seront seuls habilités à connaître
              du différend.
            </p>
          </section>

          {/* Liens */}
          <section className="pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/conditions-generales" className="text-orange-500 hover:text-orange-600 hover:underline font-medium">
                Conditions Générales d&apos;Utilisation
              </Link>
              <Link href="/politique-de-confidentialite" className="text-orange-500 hover:text-orange-600 hover:underline font-medium">
                Politique de Confidentialité
              </Link>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
