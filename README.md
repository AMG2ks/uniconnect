# UniConnect

PWA de gestion universitaire (emploi du temps, notes, absences, annonces) — Next.js 16 (App Router), Server Actions, MongoDB/Mongoose, Tailwind.

## Prérequis

- Node.js **20.19 ou plus** (22 recommandé, voir `.nvmrc`)
- Docker (ou un MongoDB local)

## Démarrage

```bash
cp .env.example .env.local     # puis ajuster si besoin
npm install
npm run db                     # MongoDB local via Docker (ou lancez votre mongod sur le port 27017)
npm run seed                   # données de démonstration
npm run dev                    # http://localhost:3000
```

Comptes de démo (mot de passe `password`) : `admin@uni.tn`, `enseignant@uni.tn`, `etudiant@uni.tn`.

Mode hors ligne : le service worker n'est actif qu'en production (`npm run build && npm start`).

## Organisation

- `app/(modules)/<module>/` : page + `actions.ts` (Server Actions) par module
- `models/` : schémas Mongoose · `lib/` : session, notes, absences, IA · `proxy.ts` : protection des routes par rôle
- IA : `ANTHROPIC_API_KEY` optionnelle ; sans clé, des réponses simulées sont utilisées.
