# CLAUDE.md — Lib'Trafic

> Fichier d'instructions pour Claude Code. Il décrit le projet, la stack, les
> conventions et les données de référence. À placer à la racine du dépôt.
> Nom de l'application : **Lib'Trafic** (Libreville + Trafic).

---

## 1. Vue d'ensemble

**Lib'Trafic** est une **PWA** (Progressive Web App) d'aide à la circulation pour
le **Grand Libreville** (Gabon). Elle poursuit trois objectifs :

1. **Guider** l'usager d'un point A à un point B, en lui laissant choisir son
   **itinéraire** et son **mode de transport**.
2. **Signaler et visualiser la circulation** en temps quasi réel sur toute la
   ville et ses environs, grâce aux **signalements communautaires**
   (crowdsourcing) des usagers.
3. **Faire découvrir les sites touristiques** de la ville et permettre de s'y
   rendre directement via le calcul d'itinéraire.

L'application vise le mobile en priorité (**mobile-first**), fonctionne en
**hors ligne partiel** (carte en cache, derniers signalements) et doit rester
**légère** pour tenir sur les connexions gabonaises (3G/4G irrégulière) et sur
le **plan gratuit Firebase Spark**.

### Public cible
Conducteurs, usagers des taxis/bus, motards, piétons et touristes du Grand
Libreville (communes de **Libreville, Owendo, Akanda, Ntoum**, province de
l'Estuaire).

---

## 2. Stack technique

| Domaine | Choix | Notes |
|---|---|---|
| Framework | **React 18 + Vite + TypeScript** | build rapide, léger |
| Styles | **Tailwind CSS** | mobile-first, dark mode possible |
| Cartographie | **Leaflet + OpenStreetMap** | gratuit, pas de clé, tuiles OSM |
| Calcul d'itinéraire | **OpenRouteService** (API gratuite) | profils voiture / piéton / vélo ; alternative auto-hébergée : OSRM |
| Backend / temps réel | **Firebase** — Firestore, Auth, Hosting | plan **Spark** (gratuit) |
| Géolocalisation | **API Geolocation** du navigateur | position live de l'usager |
| Notifications | **CallMeBot** (WhatsApp) *optionnel* | alertes admin / bouchon majeur |
| PWA | **vite-plugin-pwa** (Workbox) | service worker, cache, installable |
| État global | **Zustand** ou React Context | garder simple |
| Icônes | **lucide-react** | |

> **Contrainte Spark** : pas de Cloud Functions payantes. Toute logique lourde
> se fait côté client. Les appels OpenRouteService partent du navigateur (clé
> en variable d'env, quota gratuit ~2000 req/jour).

---

## 3. Structure du projet

```
lib-trafic/
├── CLAUDE.md
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── .env.local              # clés (jamais commit)
├── public/
│   ├── manifest.webmanifest
│   ├── icons/              # 192, 512, maskable
│   └── data/
│       ├── quartiers.json
│       ├── axes.json
│       └── sites-touristiques.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── firebase.ts          # init Firebase
    ├── components/
    │   ├── MapView.tsx          # carte Leaflet + couches trafic
    │   ├── ReportButton.tsx     # bouton flottant "signaler"
    │   ├── ReportModal.tsx      # formulaire de signalement
    │   ├── RoutePlanner.tsx     # A → B + choix du mode
    │   ├── TransportPicker.tsx  # sélecteur de mode de transport
    │   ├── TrafficLegend.tsx    # légende 4 couleurs
    │   ├── TouristSheet.tsx     # fiche d'un site touristique
    │   └── BottomNav.tsx        # navigation : Carte | Itinéraire | Sites
    ├── hooks/
    │   ├── useGeolocation.ts
    │   ├── useTrafficReports.ts # listener Firestore temps réel
    │   └── useRoute.ts          # appel OpenRouteService
    ├── lib/
    │   ├── traffic.ts           # calcul du niveau de trafic par axe
    │   ├── ors.ts               # wrapper OpenRouteService
    │   └── geo.ts               # distances, tri par proximité
    ├── data/
    │   └── libreville.ts        # constantes géo (voir §7)
    ├── types/
    │   └── index.ts
    └── pages/
        ├── MapPage.tsx
        ├── RoutePage.tsx
        └── TourismPage.tsx
```

---

## 4. Modèle de données Firestore

### Collection `reports` (signalements de circulation)
```ts
interface TrafficReport {
  id: string;
  type: 'embouteillage' | 'accident' | 'route_barree'
      | 'travaux' | 'controle_police' | 'inondation' | 'fluide';
  severity: 1 | 2 | 3 | 4;        // 1 fluide … 4 bloqué
  lat: number;
  lng: number;
  quartier?: string;              // rattachement au quartier le plus proche
  axe?: string;                   // ex : "RN1 / axe PK"
  comment?: string;               // 140 car. max
  authorId: string;               // uid anonyme
  confirmations: number;          // votes "toujours d'actualité"
  createdAt: Timestamp;
  expiresAt: Timestamp;           // auto-péremption (ex : +45 min)
}
```

### Collection `users` (profils légers, auth anonyme)
```ts
interface UserProfile {
  uid: string;
  displayName?: string;
  reportsCount: number;
  createdAt: Timestamp;
}
```

> Les signalements **périment automatiquement** : à la lecture, on ignore ceux
> dont `expiresAt < now`. Un nettoyage réel peut se faire au démarrage de
> l'app (suppression best-effort côté client) pour éviter les Cloud Functions.

---

## 5. Fonctionnalités principales

### 5.1 Carte de circulation en temps réel
- Carte **Leaflet/OSM** centrée sur Libreville (`0.4162, 9.4673`, zoom 12).
- Bouton **« Ma position »** (Geolocation) recentre et affiche l'usager.
- Les **axes principaux** (§7) sont coloriés selon le **niveau de trafic**
  (§6), calculé à partir des signalements actifs à proximité de chaque axe.
- Les signalements ponctuels s'affichent en **marqueurs** avec icône par type ;
  un tap ouvre le détail (type, commentaire, ancienneté, bouton
  « Toujours là ? » qui incrémente `confirmations`).
- Mise à jour **temps réel** via un listener Firestore (`onSnapshot`).

### 5.2 Signalement communautaire (crowdsourcing)
- **Bouton flottant** « Signaler ».
- `ReportModal` : choix du **type**, gravité auto-déduite, position
  pré-remplie par la géoloc (déplaçable sur la carte), commentaire court.
- Écriture dans `reports` avec `expiresAt = now + durée(type)`
  (ex : accident 60 min, embouteillage 45 min, travaux 8 h).
- Anti-spam simple : 1 signalement / 90 s / utilisateur (throttle local).

### 5.3 Calcul d'itinéraire + choix du mode de transport
- `RoutePlanner` : champ **Départ** (par défaut « Ma position ») et
  **Arrivée** (recherche parmi quartiers, carrefours et sites touristiques,
  ou point choisi sur la carte).
- `TransportPicker` — modes proposés :
  - 🚗 **Voiture / taxi compteur**
  - 🚕 **Taxi partagé / clando**
  - 🚌 **Bus** (Sogatra / Trans'Urb / Trans Akanda — voir §8)
  - 🏍️ **Moto-taxi**
  - 🚶 **À pied**
- L'itinéraire est calculé via **OpenRouteService** selon le profil
  (`driving-car`, `cycling-regular` pour la moto en approximation,
  `foot-walking`). Le tracé est dessiné sur la carte.
- **Ajustement trafic** : si l'itinéraire traverse des axes marqués rouges par
  les signalements, afficher un **avertissement** et proposer, si possible, une
  alternative OpenRouteService (`alternative_routes`).
- Affichage : **distance, durée estimée**, et pour le bus la/les **ligne(s)**
  pertinente(s) d'après les dessertes connues (§8).

### 5.4 Sites touristiques
- `TourismPage` : liste des sites (§9), **triée par proximité** de l'usager.
- `TouristSheet` : photo, description courte, quartier, horaires si connus,
  bouton **« M'y rendre »** → renvoie vers `RoutePlanner` avec l'arrivée
  pré-remplie.
- Les sites apparaissent aussi comme marqueurs dédiés sur la carte (couche
  activable).

---

## 6. Système de niveaux de trafic (4 couleurs)

Reprend la logique de couleurs à 4 niveaux (cohérente avec les autres projets
circulation) :

| Niveau | Couleur | Sens | Déclencheurs typiques |
|---|---|---|---|
| 1 | 🟢 Vert | Fluide | aucun signalement / `fluide` |
| 2 | 🟡 Jaune | Dense | ralentissements signalés |
| 3 | 🟠 Orange | Chargé | embouteillage confirmé (≥ 2 confirmations) |
| 4 | 🔴 Rouge | Bloqué | accident, route barrée, inondation |

Le niveau d'un **axe** = max des gravités des signalements actifs dont la
distance au tracé de l'axe est < 300 m, pondéré par les `confirmations` et
l'ancienneté (un signalement récent et confirmé pèse plus).

---

## 7. Données géographiques de référence (Grand Libreville)

À placer dans `src/data/libreville.ts` / `public/data/`.

### Centre carte
`{ lat: 0.4162, lng: 9.4673, zoom: 12 }`

### Communes du Grand Libreville
`Libreville`, `Owendo`, `Akanda`, `Ntoum`.

### Quartiers / repères (liste de départ — à compléter)
Akébé, Nzeng-Ayong, Lalala, Quartier Louis, Glass, Batterie IV, Oloumi,
Nombakélé, Mont-Bouët, Nkembo, Sotega, Charbonnages, Okala, Angondjé,
Bikélé, Melen, Rio, Sainte-Marie, Ancienne Gare routière, PK5, PK8, PK9,
PK12, PK13 (les « PK » = points kilométriques le long de la RN1).

### Axes principaux (à colorier selon le trafic)
- **RN1 / axe des PK** : Ancienne Gare routière → Rio → PK5 → PK8 → PK12 →
  Ntoum (artère de la banlieue sud, la plus embouteillée).
- **Axe Owendo ↔ Aéroport Léon-Mba** (port et zone industrielle).
- **Boulevard Triomphal Omar Bongo** (centre administratif).
- **Boulevard du Bord de Mer** (front de mer).
- **Axe Nzeng-Ayong ↔ centre-ville**.
- **Axe Ancienne Gare routière ↔ Melen**.

### Carrefours / points chauds
Carrefour SGA, Rond-point de la Démocratie, Carrefour Léon-Mba, Carrefour IAI,
échangeurs des PK.

> **À faire par Claude Code** : renseigner les coordonnées lat/lng réelles de
> chaque quartier, carrefour et des polylignes d'axes (à extraire d'OSM /
> Nominatim ou à saisir manuellement). Ne pas inventer de coordonnées : marquer
> `TODO` tant qu'elles ne sont pas vérifiées.

---

## 8. Modes de transport & réseaux de bus

Opérateurs publics du Grand Libreville :
- **Sogatra** — bus + taxis-compteurs ; dessert notamment
  Sainte-Marie ↔ Gare routière ↔ Rio ↔ PK12 ↔ Nkoltang ↔ Ntoum.
- **Trans'Urb** — dessertes internes aux communes de Libreville et d'Owendo.
- **Trans Akanda** — dessert le **nord** (Angondjé, Akanda, ~5 lignes).

Modes informels très utilisés : **taxi partagé**, **clando**, **moto-taxi**.

> Les lignes de bus exactes évoluent souvent. Stocker les dessertes dans un
> JSON éditable (`public/data/lignes-bus.json`) plutôt qu'en dur, et afficher
> un avertissement « horaires/lignes indicatifs ».

---

## 9. Sites touristiques (données de seed)

À placer dans `public/data/sites-touristiques.json` (compléter coordonnées) :

- **Église Saint-Michel de Nkembo** — remarquable pour ses colonnes en bois
  sculptées (scènes bibliques).
- **Cathédrale Sainte-Marie**.
- **Marché du Mont-Bouët** — le plus grand marché du Gabon.
- **Musée National des Arts, Rites et Traditions du Gabon** (bord de mer).
- **Mémorial Léon Mba**.
- **Boulevard du Bord de Mer** — promenade et sculptures gabonaises.
- **Stèle de la Liberté** (artiste Minko Minzé) — fin de la traite en 1849,
  près de l'ancien palais présidentiel.
- **Palais Présidentiel** (extérieur uniquement).
- **Plage de la Sablière**.
- **Pointe-Denis** — plage accessible en ~30 min de bateau depuis Libreville.
- **Arboretum Raponda-Walker**.
- **Parc National d'Akanda** — mangroves, plages (~16 km au nord).
- **Centre Culturel Saint-Exupéry**.

Schéma d'un site :
```ts
interface TouristSite {
  id: string;
  name: string;
  category: 'religieux' | 'culturel' | 'marche' | 'nature' | 'plage' | 'monument';
  lat: number;                 // TODO à vérifier
  lng: number;                 // TODO à vérifier
  quartier: string;
  description: string;         // 1–2 phrases
  photo?: string;
  hours?: string;
}
```

---

## 10. PWA & hors ligne

- `manifest.webmanifest` complet (nom, icônes 192/512 + maskable, `theme_color`,
  `display: standalone`, `start_url: '/'`).
- Service worker (**vite-plugin-pwa / Workbox**) :
  - **Cache des tuiles OSM** visitées (stratégie `CacheFirst`, expiration).
  - **Cache** des JSON statiques (quartiers, axes, sites).
  - Les **signalements** restent en `NetworkFirst` (données fraîches
    prioritaires) avec repli sur le dernier cache si hors ligne.
- Bannière **« Installer l'application »** (événement `beforeinstallprompt`).
- Message clair quand l'utilisateur est hors ligne (les signalements affichés
  sont alors « en cache, potentiellement périmés »).

---

## 11. Conventions de code

- **TypeScript strict** (`strict: true`), pas de `any` non justifié.
- Composants **fonctionnels + hooks**, un composant par fichier.
- **Tailwind** pour tout le style ; pas de CSS inline sauf exception carto.
- Textes de l'UI **en français**.
- Nommage : composants `PascalCase`, hooks `useCamelCase`, constantes
  `SCREAMING_SNAKE_CASE`.
- Commits en français, format court : `feat:`, `fix:`, `docs:`…
- **Ne jamais** committer `.env.local` ni les clés.

---

## 12. Sécurité Firestore (règles)

- **Auth anonyme** activée ; chaque usager a un `uid`.
- `reports` : **lecture publique** ; **création** réservée aux utilisateurs
  authentifiés (même anonymes) avec validation des champs (type autorisé,
  `severity` ∈ 1..4, `comment` ≤ 140 car.).
- **Modification/suppression** d'un report : uniquement par son auteur
  (`authorId == request.auth.uid`), sauf le compteur `confirmations`
  incrémentable par tous (règle dédiée ou champ séparé).
- Throttle applicatif côté client (1 signalement / 90 s).

---

## 13. Variables d'environnement (`.env.local`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ORS_API_KEY=            # OpenRouteService (quota gratuit)
VITE_CALLMEBOT_PHONE=        # optionnel
VITE_CALLMEBOT_APIKEY=       # optionnel
```

---

## 14. Feuille de route (par phases)

**Phase 1 — MVP carte + signalements**
Carte OSM, géoloc, signalement communautaire, temps réel Firestore, légende
4 couleurs, PWA installable.

**Phase 2 — Itinéraire + transport**
`RoutePlanner`, `TransportPicker`, OpenRouteService, coloration des axes,
avertissement trafic + itinéraire alternatif.

**Phase 3 — Tourisme**
Sites touristiques triés par proximité, fiches, bouton « M'y rendre »,
couche dédiée sur la carte.

**Phase 4 — Finitions**
Confirmations/péremption des reports, anti-spam, mode hors ligne soigné,
lignes de bus en JSON, notifications WhatsApp admin.

---

## 15. À faire en priorité par Claude Code

1. Initialiser le projet (Vite + React + TS + Tailwind + vite-plugin-pwa).
2. Brancher Firebase (auth anonyme + Firestore) et les règles de sécurité.
3. Poser `MapView` (Leaflet) avec la géolocalisation.
4. Implémenter le cycle **signalement → Firestore → affichage temps réel**.
5. **Renseigner les vraies coordonnées** des quartiers, axes et sites
   (marquer `TODO` toute donnée non vérifiée — ne rien inventer).
