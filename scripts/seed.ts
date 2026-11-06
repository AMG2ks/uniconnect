// Données de démonstration: npm run seed
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Departement, Filiere, Groupe, Matiere, Affectation, Salle, Seance, Note, Absence, Annonce } from "../models";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/uniconnect";

async function main() {
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  const pwd = await bcrypt.hash("password", 10);

  const dep: any = await Departement.create({ nom: "Informatique", code: "INFO" });
  const fil: any = await Filiere.create({ nom: "Génie logiciel", niveau: "L3", departement: dep._id });
  const [g1, g2]: any[] = await Groupe.create([{ nom: "GL3-A", filiere: fil._id }, { nom: "GL3-B", filiere: fil._id }]);

  const admin: any = await User.create({ nom: "Admin UniConnect", email: "admin@uni.tn", motDePasse: pwd, role: "admin" });
  const [prof1, prof2]: any[] = await User.create([
    { nom: "Sami Ben Ali", email: "enseignant@uni.tn", motDePasse: pwd, role: "enseignant" },
    { nom: "Leila Trabelsi", email: "leila@uni.tn", motDePasse: pwd, role: "enseignant" },
  ]);
  const noms = ["Amine Gharbi", "Sarra Mejri", "Yassine Khelifi", "Nour Jaziri", "Mehdi Chaabane", "Ines Bouzid"];
  const etus: any[] = await User.create(noms.map((nom, i) => ({
    nom, email: i === 0 ? "etudiant@uni.tn" : `etu${i}@uni.tn`, motDePasse: pwd, role: "etudiant", groupe: i % 2 === 0 ? g1._id : g2._id,
  })));

  const [algo, bd]: any[] = await Matiere.create([
    { nom: "Algorithmique", code: "ALGO", coefficient: 3, credits: 5, semestre: 1, filiere: fil._id },
    { nom: "Bases de données", code: "BD", coefficient: 2, credits: 4, semestre: 1, filiere: fil._id },
  ]);
  const an = "2026-2027";
  await Affectation.create([
    { matiere: algo._id, enseignant: prof1._id, groupe: g1._id, anneeUniversitaire: an },
    { matiere: algo._id, enseignant: prof1._id, groupe: g2._id, anneeUniversitaire: an },
    { matiere: bd._id, enseignant: prof2._id, groupe: g1._id, anneeUniversitaire: an },
  ]);
  const [s1, s2]: any[] = await Salle.create([{ nom: "A101", capacite: 40 }, { nom: "B203", capacite: 30 }]);
  const seances: any[] = await Seance.create([
    { jour: 1, heureDebut: "08:30", heureFin: "10:00", matiere: algo._id, enseignant: prof1._id, groupe: g1._id, salle: s1._id },
    { jour: 1, heureDebut: "10:15", heureFin: "11:45", matiere: algo._id, enseignant: prof1._id, groupe: g2._id, salle: s1._id },
    { jour: 3, heureDebut: "08:30", heureFin: "10:00", matiere: bd._id, enseignant: prof2._id, groupe: g1._id, salle: s2._id },
  ]);

  for (const e of etus.filter((x) => String(x.groupe) === String(g1._id))) {
    await Note.create([
      { etudiant: e._id, matiere: algo._id, type: "DS", valeur: 8 + Math.round(Math.random() * 10), date: new Date(Date.now() - 40 * 864e5) },
      { etudiant: e._id, matiere: algo._id, type: "TP", valeur: 10 + Math.round(Math.random() * 8) },
    ]);
  }
  // Un étudiant à risque: notes en baisse + absences récentes
  const risque = etus[2];
  await Note.deleteMany({ etudiant: risque._id });
  await Note.create([
    { etudiant: risque._id, matiere: algo._id, type: "DS", valeur: 15, date: new Date(Date.now() - 40 * 864e5) },
    { etudiant: risque._id, matiere: algo._id, type: "TP", valeur: 9, date: new Date() },
  ]);
  for (let i = 1; i <= 3; i++) await Absence.create({ etudiant: risque._id, seance: seances[0]._id, date: new Date(Date.now() - i * 3 * 864e5) });
  await Absence.create({ etudiant: etus[0]._id, seance: seances[0]._id, date: new Date(Date.now() - 5 * 864e5) });

  await Annonce.create([
    { titre: "Rentrée universitaire", contenu: "Bienvenue à tous ! Les cours débutent lundi.", portee: "generale", auteur: admin._id },
    { titre: "TP d'algo reporté", contenu: "Le TP de jeudi est reporté à la semaine prochaine.", portee: "groupe", groupe: g1._id, auteur: prof1._id },
  ]);
  void s2;
  console.log("✔ Données de démo créées. Comptes: admin@uni.tn, enseignant@uni.tn, etudiant@uni.tn (mot de passe: password)");
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
