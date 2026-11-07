import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { User } from "@/models";
import { ActionForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { updateProfile } from "../utilisateurs/actions";

export default async function ProfilPage() {
  const s = (await getSession())!;
  await connectDB();
  const u: any = await User.findById(s.userId).select("-motDePasse").lean();
  return (
    <div className="grid max-w-md gap-4">
      <h1 className="page-title">Mon profil</h1>
      <p className="text-sm text-slate-600">{u.email} · {u.role}</p>
      <ActionForm action={updateProfile}>
        <Field label="Nom"><input name="nom" defaultValue={u.nom} required className={inputCls} /></Field>
        <Field label="URL de la photo"><input name="photo" defaultValue={u.photo ?? ""} className={inputCls} /></Field>
        <Field label="Nouveau mot de passe (optionnel)"><input name="motDePasse" type="password" className={inputCls} /></Field>
        <SubmitButton>Enregistrer</SubmitButton>
      </ActionForm>
    </div>
  );
}
