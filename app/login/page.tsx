import { ActionForm, SubmitButton, Field, inputCls } from "@/components/ActionForm";
import { Logo } from "@/components/Icons";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="size-14" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-brand-900">UniConnect</h1>
            <p className="muted">Votre vie universitaire, dans votre poche</p>
          </div>
        </div>
        <div className="card !p-6">
          <h2 className="section-title mb-4">Connexion</h2>
          <ActionForm action={login}>
            <Field label="Email"><input name="email" type="email" required autoComplete="email" placeholder="prenom.nom@uni.tn" className={inputCls} /></Field>
            <Field label="Mot de passe"><input name="motDePasse" type="password" required autoComplete="current-password" placeholder="••••••••" className={inputCls} /></Field>
            <SubmitButton className="mt-1 w-full">Se connecter</SubmitButton>
          </ActionForm>
        </div>
        <p className="mt-4 rounded-xl bg-white/70 p-3 text-center text-xs text-muted ring-1 ring-slate-200/70">
          Démo : <b>admin@uni.tn</b>, <b>enseignant@uni.tn</b> ou <b>etudiant@uni.tn</b><br />mot de passe : <b>password</b>
        </p>
      </div>
    </main>
  );
}
