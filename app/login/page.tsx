import { ActionForm, SubmitButton, Field, inputCls } from "@/components/ActionForm";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-teal-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-1 text-2xl font-bold text-teal-700">UniConnect</h1>
        <p className="mb-6 text-sm text-slate-600">Connectez-vous à votre espace universitaire</p>
        <ActionForm action={login}>
          <Field label="Email"><input name="email" type="email" required autoComplete="email" className={inputCls} /></Field>
          <Field label="Mot de passe"><input name="motDePasse" type="password" required autoComplete="current-password" className={inputCls} /></Field>
          <SubmitButton>Se connecter</SubmitButton>
        </ActionForm>
        <p className="mt-4 text-xs text-slate-500">Démo : admin@uni.tn / enseignant@uni.tn / etudiant@uni.tn — mot de passe « password »</p>
      </div>
    </main>
  );
}
