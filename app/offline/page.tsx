export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-teal-50 p-6 text-center">
      <div>
        <p className="text-5xl" aria-hidden>📴</p>
        <h1 className="mt-3 text-2xl font-bold text-teal-800">Vous êtes hors ligne</h1>
        <p className="mt-2 text-slate-700">Cette page n'est pas encore disponible sans connexion. Les pages déjà consultées restent accessibles, et vos appels d'absence sont envoyés automatiquement au retour du réseau.</p>
        <a href="/" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-5 font-medium text-white">Réessayer</a>
      </div>
    </main>
  );
}
