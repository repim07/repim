import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales de la plateforme REPIM.',
}

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">

        <Link href="/" className="text-sm text-orange-500 hover:text-orange-600 font-medium mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Mentions Légales</h1>
        <p className="text-sm text-stone-500 mb-10">Dernière mise à jour : juin 2025</p>

        <div className="space-y-8 text-stone-700 text-sm leading-relaxed">

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Éditeur du site</h2>
            <dl className="space-y-2">
              {[
                ['Raison sociale', '[Nom de l\'entreprise]'],
                ['Forme juridique', '[SARL / SAS / SA / ...]'],
                ['Capital social', '[Montant] FCFA'],
                ['Siège social', '[Adresse complète], Abidjan, Côte d\'Ivoire'],
                ['N° RCCM', '[Numéro RCCM Abidjan]'],
                ['N° Contribuable', '[Numéro]'],
                ['Directeur de publication', '[Nom du dirigeant]'],
                ['Email de contact', '[contact@repim.ci]'],
                ['Téléphone', '[+225 XX XX XX XX XX]'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap gap-1">
                  <dt className="font-semibold text-stone-800 min-w-[180px]">{label} :</dt>
                  <dd className="text-stone-600">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Hébergement</h2>
            <dl className="space-y-2">
              {[
                ['Hébergeur', 'Vercel Inc.'],
                ['Adresse', '340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis'],
                ['Site web', 'https://vercel.com'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap gap-1">
                  <dt className="font-semibold text-stone-800 min-w-[180px]">{label} :</dt>
                  <dd className="text-stone-600">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Base de données & Authentification</h2>
            <dl className="space-y-2">
              {[
                ['Fournisseur', 'Supabase Inc.'],
                ['Adresse', '970 Toa Payoh North #07-04, Singapour 318992'],
                ['Localisation des données', 'Serveurs en Union Européenne (Frankfurt)'],
                ['Site web', 'https://supabase.com'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap gap-1">
                  <dt className="font-semibold text-stone-800 min-w-[180px]">{label} :</dt>
                  <dd className="text-stone-600">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, logo, code source, base de données)
              est protégé par le droit de la propriété intellectuelle applicable en Côte d&apos;Ivoire.
              Toute reproduction, représentation ou diffusion, même partielle, sans autorisation
              écrite préalable de <strong>[Nom de l&apos;entreprise]</strong> est strictement interdite.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Liens & ressources</h2>
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
