import { connectDB } from "@/lib/mongodb";
import { User, Groupe } from "@/models";
import { plain } from "@/lib/utils";
import { ActionForm, DeleteForm, Field, SubmitButton, inputCls } from "@/components/ActionForm";
import { Pager } from "@/components/Pager";
import { createUser, updateUser, deleteUser } from "./actions";

const PAGE = 20;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ p?: string; q?: string }> }) {
  const { p, q } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  await connectDB();
  const filter = q ? { $or: [{ nom: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }] } : {};
  const [users, total, groupes] = await Promise.all([
    User.find(filter).select("-motDePasse").sort({ nom: 1 }).skip((page - 1) * PAGE).limit(PAGE).lean().then(plain),
    User.countDocuments(filter),
    Groupe.find().sort({ nom: 1 }).lean().then(plain),
  ]);
  const groupeSelect = (def?: string) => (
    <select name="groupe" defaultValue={def ?? ""} className={inputCls}>
      <option value="">— aucun —</option>
      {groupes.map((g: any) => <option key={g._id} value={g._id}>{g.nom}</option>)}
    </select>
  );
  const roleSelect = (def = "etudiant") => (
    <select name="role" defaultValue={def} className={inputCls}>
      <option value="etudiant">Étudiant</option><option value="enseignant">Enseignant</option><option value="admin">Administrateur</option>
    </select>
  );
  return (
    <div className="grid gap-6">
      <h1 className="page-title">Comptes utilisateurs</h1>
      <section className="card">
        <h2 className="mb-3 font-semibold">Nouveau compte</h2>
        <ActionForm action={createUser} className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom"><input name="nom" required className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
          <Field label="Mot de passe"><input name="motDePasse" type="password" required minLength={6} className={inputCls} /></Field>
          <Field label="Rôle">{roleSelect()}</Field>
          <Field label="Groupe (étudiants)">{groupeSelect()}</Field>
          <div className="sm:col-span-2"><SubmitButton>Créer le compte</SubmitButton></div>
        </ActionForm>
      </section>
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Rechercher nom ou email" aria-label="Rechercher" className={inputCls} /><SubmitButton>Chercher</SubmitButton></form>
      <ul className="grid gap-3">
        {users.map((u: any) => (
          <li key={u._id} className="card">
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
                <span><strong>{u.nom}</strong> <span className="text-sm text-slate-600">{u.email}</span></span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800">{u.role}</span>
              </summary>
              <ActionForm action={updateUser} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={u._id} />
                <Field label="Nom"><input name="nom" defaultValue={u.nom} required className={inputCls} /></Field>
                <Field label="Email"><input name="email" defaultValue={u.email} type="email" required className={inputCls} /></Field>
                <Field label="Nouveau mot de passe (optionnel)"><input name="motDePasse" type="password" className={inputCls} /></Field>
                <Field label="Rôle">{roleSelect(u.role)}</Field>
                <Field label="Groupe">{groupeSelect(u.groupe)}</Field>
                <div className="sm:col-span-2"><SubmitButton>Enregistrer</SubmitButton></div>
              </ActionForm>
              <div className="mt-2"><DeleteForm action={deleteUser} id={u._id} /></div>
            </details>
          </li>
        ))}
      </ul>
      <Pager page={page} total={total} per={PAGE} q={q} />
    </div>
  );
}
