import mongoose, { Schema, model, models, type Model } from "mongoose";

const oid = (ref: string, extra: Record<string, unknown> = {}): any => ({ type: Schema.Types.ObjectId, ref, ...extra });
function def(name: string, schema: Schema<any>): Model<any> {
  return (models[name] as Model<any>) ?? model(name, schema);
}

export const User = def("User", new Schema<any>({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true },
  role: { type: String, enum: ["admin", "enseignant", "etudiant"], required: true },
  photo: String,
  groupe: oid("Groupe"),
}, { timestamps: true }));

export const Departement = def("Departement", new Schema<any>({
  nom: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
}));

export const Filiere = def("Filiere", new Schema<any>({
  nom: { type: String, required: true },
  niveau: { type: String, required: true },
  departement: oid("Departement", { required: true }),
}));

export const Groupe = def("Groupe", new Schema<any>({
  nom: { type: String, required: true },
  effectif: { type: Number, default: 0 },
  filiere: oid("Filiere", { required: true }),
}));

export const Matiere = def("Matiere", new Schema<any>({
  nom: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  coefficient: { type: Number, required: true, min: [0.01, "Coefficient strictement positif"] },
  credits: { type: Number, required: true, min: 0 },
  semestre: { type: Number, required: true, min: 1, max: 2 },
  filiere: oid("Filiere", { required: true }),
}));

const affSchema = new Schema<any>({
  anneeUniversitaire: { type: String, required: true },
  matiere: oid("Matiere", { required: true }),
  enseignant: oid("User", { required: true }),
  groupe: oid("Groupe", { required: true }),
});
affSchema.index({ matiere: 1, enseignant: 1, groupe: 1, anneeUniversitaire: 1 }, { unique: true });
export const Affectation = def("Affectation", affSchema);

export const Salle = def("Salle", new Schema<any>({
  nom: { type: String, required: true, unique: true },
  capacite: { type: Number, required: true, min: 1 },
}));

const seanceSchema = new Schema<any>({
  jour: { type: Number, min: 1, max: 6, required: true }, // 1 = lundi
  heureDebut: { type: String, required: true }, // "HH:MM"
  heureFin: { type: String, required: true },
  matiere: oid("Matiere", { required: true }),
  enseignant: oid("User", { required: true }),
  groupe: oid("Groupe", { required: true }),
  salle: oid("Salle", { required: true }),
});
seanceSchema.index({ jour: 1, salle: 1 });
export const Seance = def("Seance", seanceSchema);

const noteSchema = new Schema<any>({
  valeur: { type: Number, required: true, min: 0, max: 20 },
  type: { type: String, enum: ["DS", "TP", "examen"], required: true },
  date: { type: Date, default: Date.now },
  etudiant: oid("User", { required: true }),
  matiere: oid("Matiere", { required: true }),
});
noteSchema.index({ etudiant: 1, matiere: 1, type: 1 }, { unique: true });
export const Note = def("Note", noteSchema);

const absenceSchema = new Schema<any>({
  date: { type: Date, required: true },
  statut: { type: String, enum: ["absent", "retard"], default: "absent" },
  justifiee: { type: Boolean, default: false },
  etudiant: oid("User", { required: true }),
  seance: oid("Seance", { required: true }),
});
absenceSchema.index({ etudiant: 1, seance: 1, date: 1 }, { unique: true });
export const Absence = def("Absence", absenceSchema);

export const Justificatif = def("Justificatif", new Schema<any>({
  motif: { type: String, required: true },
  pieceJointe: String,
  decision: { type: String, enum: ["en_attente", "accepte", "refuse"], default: "en_attente" },
  absence: oid("Absence", { required: true }),
}, { timestamps: true }));

export const Annonce = def("Annonce", new Schema<any>({
  titre: { type: String, required: true },
  contenu: { type: String, required: true },
  date: { type: Date, default: Date.now },
  portee: { type: String, enum: ["generale", "groupe"], default: "generale" },
  auteur: oid("User", { required: true }),
  groupe: oid("Groupe"),
}));

export { mongoose };
