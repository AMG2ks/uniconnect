import { Icon, Logo } from "@/components/Icons";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-6 text-center">
      <div className="card max-w-sm !p-8">
        <Logo className="mx-auto size-12" />
        <Icon name="wifioff" className="mx-auto mt-5 size-10 text-brand-600" />
        <h1 className="page-title mt-3">Vous êtes hors ligne</h1>
        <p className="muted mt-2">Cette page n'est pas encore disponible sans connexion. Les pages déjà consultées restent accessibles, et vos appels d'absence sont envoyés automatiquement au retour du réseau.</p>
        <a href="/" className="btn-primary mt-5">Réessayer</a>
      </div>
    </main>
  );
}
