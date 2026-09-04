DESIGN.md — Lib'Trafic

> Spécification de design à placer à la racine du dépôt, à côté de `CLAUDE.md`.
> Elle décrit les jetons, les composants et les 8 écrans mobiles (390 × 844).
> Textes de l'UI en français. Mobile-first, Tailwind.

---

## 1. Direction visuelle

Chaleureuse et ancrée au Gabon, sans folklore. Fond sable plutôt que blanc pur,
vert forêt en primaire, ambre en couleur d'action. Un seul bouton mis en avant
par écran. Toute action fréquente vit dans le tiers inférieur (le pouce) ; le
haut de l'écran est réservé à la lecture.

Quatre contraintes non négociables :

1. **Une seule action mise en avant par écran.** Sur la carte, c'est « Signaler ».
2. **Lisibilité en plein soleil.** Texte courant ≥ 15 px, contraste ≥ 4,5:1,
   aucune information portée par la seule couleur.
3. **Frugalité réseau.** Pas de photo au-dessus de la ligne de flottaison sauf
   sur la page Sites ; images WebP ≤ 60 ko, `loading="lazy"`.
4. **Le pouce d'abord.** Cibles tactiles 44 px minimum, 56 px pour le primaire.

---

## 2. Couleurs

### Marque

| Rôle | Jeton | Hex |
|---|---|---|
| Vert forêt, primaire | `brand-600` | `#0E6B45` |
| Vert forêt pressé | `brand-700` | `#0A5637` |
| Vert clair, surface | `brand-50` | `#E6F0E9` |
| Vert sur fond sombre | `brand-300` | `#5FBC8B` |
| Ambre, action / contribuer | `accent-500` | `#E8A317` |
| Ambre, texte sur ambre | `accent-950` | `#2A1D02` |
| Ambre pâle, surface | `accent-50` | `#FBEFD6` |
| Bleu océan, position & tracé | `ocean-600` | `#1462A8` |
| Bleu océan, sombre | `ocean-400` | `#4FA3E8` |

### Neutres — thème clair

| Jeton | Hex | Usage |
|---|---|---|
| `sand-50` | `#FBF7F0` | fond d'écran, feuilles |
| `sand-100` | `#F3EEE4` | surfaces, champs, cartes |
| `sand-200` | `#E4DCCB` | bordures, séparateurs |
| `sand-300` | `#DDD5C6` | traits, poignée de feuille |
| `ink-900` | `#16211C` | texte principal |
| `ink-700` | `#3A443E` | texte dense |
| `ink-600` | `#4C5650` | texte secondaire |
| `ink-500` | `#5B655E` | descriptions |
| `ink-400` | `#8A8474` | libellés, métadonnées |
| `ink-300` | `#9A9484` | inactif |

### Neutres — thème sombre

| Jeton | Hex | Usage |
|---|---|---|
| `night-900` | `#101512` | fond d'écran |
| `night-800` | `#19201C` | surfaces, feuilles, nav |
| `night-700` | `#232B24` | champs, cartes |
| `night-600` | `#2C332D` | bordures |
| `night-500` | `#333B34` | traits |
| `mist-50` | `#E7EDE8` | texte principal |
| `mist-200` | `#C3CCC5` | texte secondaire |
| `mist-400` | `#9AA79E` | libellés |
| `mist-500` | `#7C8A80` | inactif |

### Trafic (§6 du CLAUDE.md)

| Niveau | Sens | Clair | Sombre |
|---|---|---|---|
| 1 | Fluide | `#2FA84F` | `#46C46A` |
| 2 | Dense | `#F2C230` | `#FFD34F` |
| 3 | Chargé | `#F07C1E` | `#FF9440` |
| 4 | Bloqué | `#DC3B2F` | `#F2564A` |

Surfaces d'alerte niveau 4 : fond `#FBE4E2`, texte `#7A1F17`, accent `#A5251B`.

Le bleu océan est **réservé à l'utilisateur** (sa position, son tracé) pour ne
jamais entrer en conflit avec les 4 couleurs de trafic.

### Extrait `tailwind.config.js`

```js
theme: {
  extend: {
    colors: {
      brand: { 50:'#E6F0E9', 300:'#5FBC8B', 600:'#0E6B45', 700:'#0A5637' },
      accent:{ 50:'#FBEFD6', 500:'#E8A317', 950:'#2A1D02' },
      ocean: { 400:'#4FA3E8', 600:'#1462A8' },
      sand:  { 50:'#FBF7F0', 100:'#F3EEE4', 200:'#E4DCCB', 300:'#DDD5C6' },
      ink:   { 300:'#9A9484', 400:'#8A8474', 500:'#5B655E', 600:'#4C5650', 700:'#3A443E', 900:'#16211C' },
      night: { 500:'#333B34', 600:'#2C332D', 700:'#232B24', 800:'#19201C', 900:'#101512' },
      mist:  { 50:'#E7EDE8', 200:'#C3CCC5', 400:'#9AA79E', 500:'#7C8A80' },
      traffic: {
        1:'#2FA84F', 2:'#F2C230', 3:'#F07C1E', 4:'#DC3B2F',
        '1-dark':'#46C46A', '2-dark':'#FFD34F', '3-dark':'#FF9440', '4-dark':'#F2564A',
      },
    },
    fontFamily: {
      display: ['"Bricolage Grotesque"', 'sans-serif'],
      sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
    },
    borderRadius: { sheet: '28px', card: '20px', field: '14px', btn: '17px' },
  },
}
```

---

## 3. Typographie

- **Titres — Bricolage Grotesque 700**, `letter-spacing: -0.02em`.
- **Interface et corps — Plus Jakarta Sans** 400 / 500 / 600 / 700.
- Auto-hébergées, subset latin, `font-display: swap` (~48 ko au total).
  Pas d'appel à Google Fonts en production.

| Rôle | Taille / interligne | Poids |
|---|---|---|
| `display` | 34 / 1.1 | 700 display | titre d'écran, onboarding |
| `title` | 24–26 / 1.15 | 700 display | en-tête de feuille, titre de page |
| `card-title` | 16–18 / 1.2 | 700 display | titre de carte site |
| `body` | 15 / 1.6 | 400 | texte courant |
| `label` | 13 / 1.4 | 600 | libellés, boutons secondaires |
| `caption` | 12 / 1.5 | 600 | métadonnées — jamais en dessous |
| `overline` | 11 / 1.2 | 700, `tracking .08em`, majuscules | intitulés de section |

---

## 4. Espacement, formes, élévation

- **Échelle** : 4 / 8 / 12 / 16 / 22 / 28 px.
- **Marge d'écran** : 22 px. **Padding de feuille** : 24 px.
- **Rayons** : chips `999px` · champs et cartes 14–16 px · cartes site 20 px ·
  feuilles 28 px (coins hauts uniquement) · boutons 16–17 px.
- **Cibles tactiles** : 44 px minimum partout ; bouton primaire 56 px ;
  bouton « Signaler » 56 px, en bas à droite.
- **Barre de navigation** : 94 px (zone sûre iOS incluse), 3 onglets, jamais plus.
- **Élévation** : un seul niveau flottant, `0 6px 20px rgba(22,33,28,.14)`.
  Les feuilles utilisent une ombre montante `0 -14px 40px rgba(0,0,0,.2)`.
- **Marqueur de carte** : 38 × 38 px, rayon `12px 12px 12px 4px` (pointe en bas
  à gauche), icône blanche, ombre `0 6px 14px rgba(0,0,0,.25)`.
- **Tracé d'axe (polyline Leaflet)** : 6 px au zoom ≤ 12, 9 px au zoom ≥ 14,
  `lineCap: 'round'`, opacité 0,9.
- **Tracé d'itinéraire** : 11 px, `ocean-600`, ombre douce ; alternative en
  `sand-300` en dessous.

---

## 5. Écrans

### 5.1 Onboarding · permission géolocalisation

Plein écran `sand-50`, affiché une seule fois (flag `localStorage`).

- Logo 56 px, rayon 17 px, `brand-600`, monogramme « L » en `#F7E7C3`.
- Titre display 34 px : « Le trafic de Libreville, signalé par ceux qui le vivent. »
- Sous-titre body : « Activez votre position pour voir l'état des axes autour de
  vous et signaler en un geste. »
- Trois arguments, icône 34 px en pastille colorée + titre 14/600 + ligne 13 px :
  - `brand-50` — **Position utilisée en local** — « Jamais associée à votre identité. »
  - `accent-50` — **Compte anonyme** — « Aucun numéro, aucun e-mail demandé. »
  - `#DEEAF3` — **Léger et hors ligne** — « La carte reste lisible sans réseau. »
- Bas d'écran : bouton primaire 56 px « Autoriser ma position » ; lien 52 px
  « Continuer sans géolocalisation ».
- Le refus mène à la carte centrée sur `0.4162, 9.4673`, zoom 12.

### 5.2 Carte temps réel — `MapPage`

Carte Leaflet plein écran, superpositions flottantes.

- **Haut** (padding 52/18) : champ de recherche 52 px, surface
  `rgba(251,247,240,.94)`, rayon 16 px, icône `⌕`, placeholder « Rechercher un
  quartier, un axe… », bouton filtres 30 px à droite.
- **Chips de filtre** sous la recherche : Tout (actif `brand-600`) · Bouchons ·
  Accidents · Sites.
- **Légende** en bas à gauche (18 px du bord, 206 px du bas) : overline
  « TRAFIC » + 4 lignes, pastille 14 × 5 px + libellé 12/600.
- **Actions** en bas à droite : bouton « Ma position » 48 px carré (`ocean-600`)
  puis bouton « ＋ Signaler » 56 px, `accent-500`, ombre
  `0 10px 24px rgba(232,163,23,.4)`.
- **Barre de nav** 94 px : Carte · Itinéraire · Sites.
- Marqueurs colorés par gravité, icône distincte par type. Un signalement dont
  `expiresAt` approche passe à 60 % d'opacité.
- Position utilisateur : disque 22 px `ocean-600` avec halo
  `0 0 0 6px rgba(20,98,168,.22)`.

### 5.3 Modale de signalement — `ReportModal`

Feuille montante sur carte assombrie (`rgba(16,21,18,.45)`).

- Poignée 44 × 5 px centrée, titre « Que se passe-t-il ? ».
- **Grille 3 × 2 de types**, tuiles rayon 16 px, padding 14/8, icône 22 px +
  libellé 12 px centré. Sélection : fond `#FDF0E4`, bordure 2 px `traffic-3`,
  texte `#8A4708`. Types : Embouteillage · Accident · Route barrée · Travaux ·
  Contrôle police · Inondation.
- **Gravité** : 4 segments 8 px, remplis jusqu'au niveau ; libellé « 3 · Chargé »
  à droite ; note « Pré-remplie selon le type, ajustable. »
- **Commentaire** facultatif, compteur `0 / 140` aligné à droite.
- **Position** : bandeau `brand-50`, « Carrefour SGA · Nombakélé » + action
  « Modifier » ; le marqueur ambre est déplaçable sur la carte, avec l'étiquette
  « Glissez pour ajuster la position ».
- Bouton primaire 58 px `accent-500` « Publier le signalement ».
- Écrit dans `reports` avec `expiresAt = now + durée(type)`. Throttle 90 s : le
  bouton passe en désactivé (`sand-200` / `ink-300`) avec compte à rebours.

### 5.4 Détail d'un signalement — `ReportSheet` *(à créer)*

Feuille ouverte au tap sur un marqueur.

- En-tête : icône 48 px sur fond de la couleur du niveau, titre display 23 px
  (« Accident »), sous-titre « RN1 / axe PK · PK8, Owendo », badge « Niveau 4 »
  (`#FBE4E2` / `#A5251B`).
- Commentaire dans un bloc `sand-100`, rayon 14 px.
- Trois métadonnées en ligne : Signalé · Expire · Confirmé par (libellé 12 px
  `ink-400`, valeur 15/700).
- « Toujours là ? » : deux boutons 54 px — « Oui, toujours » (plein `brand-600`)
  et « C'est dégagé » (contour `sand-300`). Un seul vote par `uid`.
  « Oui » incrémente `confirmations` et repousse `expiresAt`.
- Lien final `ocean-600` : « Recalculer mon itinéraire en évitant ce point ».

### 5.5 Itinéraire — `RoutePage`

Trois zones empilées : formulaire, carte, résultats.

- **Formulaire** : rail vertical (point `ocean-600` → trait → point
  `accent-500`), deux champs 52 px (départ `sand-100`, arrivée avec bordure
  2 px `brand-600` quand elle est active), bouton d'inversion `⇅` à droite.
- **TransportPicker** : 5 tuiles égales 66 px, icône 19 px + libellé 11 px.
  Voiture · Clando · Bus · Moto · À pied. Actif : `brand-600` plein.
  Profils ORS : `driving-car`, `driving-car`, `driving-car`, `cycling-regular`,
  `foot-walking`.
- **Carte** : tracé recommandé `ocean-600` 11 px, alternative en gris. Bandeau
  d'avertissement en haut si le trajet traverse un axe niveau 4 :
  « Le trajet traverse un axe bloqué (RN1, PK8). Un itinéraire alternatif ajoute
  6 min. » — fond `#FBE4E2`, texte `#7A1F17`.
- **Résultats** : deux cartes côte à côte. Recommandé (bordure 2 px `brand-600`,
  fond `brand-50`) : intitulé 12/700, durée display 22 px, ligne
  « 8,4 km · via Bd Triomphal ». Le plus court, en gris, avec pastille 🔴 sur
  l'axe rouge traversé.
- Bouton « Démarrer » 56 px `brand-600`, puis la barre de nav.
- En mode **Bus** : la carte de résultat affiche la ligne Sogatra / Trans'Urb /
  Trans Akanda concernée et la mention « horaires et lignes indicatifs ».

### 5.6 Sites touristiques — `TourismPage`

- Titre « Sites à découvrir », ligne « ◎ Triés par distance depuis Nkembo ».
- Chips : Tous · Culturel · Plage · Nature (+ Religieux, Marché, Monument).
- **Première carte, pleine largeur** : bandeau photo 112 px avec badge de
  catégorie en majuscules sur `rgba(22,33,28,.7)`, puis titre display 18 px +
  distance `brand-600` 13/700, description 13 px, bouton « ➟ M'y rendre » 44 px
  `brand-600` + bouton favori 44 px carré.
- **Cartes suivantes, en ligne** : vignette 104 px à gauche, titre 16 px,
  distance, description 12 px, chip de catégorie.
- Liste défilante ; chaque carte est `flex-shrink: 0`.
- « M'y rendre » ouvre `RoutePage` avec l'arrivée pré-remplie.
- Sans géolocalisation : tri alphabétique, distance masquée.

### 5.7 État hors ligne

- Carte désaturée (`filter: saturate(.5)`), axes à 55 % d'opacité.
- Bandeau haut `#3B3226`, texte `#F7E7C3` / `#C6BCA8` : « Vous êtes hors ligne —
  Carte et signalements affichés depuis le cache, dernière mise à jour il y a
  23 min. Ils peuvent être périmés. »
- Recherche désactivée : « Recherche indisponible hors ligne ».
- Bouton « Signaler » grisé (`sand-200`) + étiquette « Envoi à la reconnexion » ;
  le signalement part dans une file d'attente locale.
- Onglet Itinéraire désactivé (ORS exige le réseau).
- Tuiles OSM en `CacheFirst`, JSON statiques en `CacheFirst`, `reports` en
  `NetworkFirst`.

### 5.8 Bannière d'installation PWA — `InstallPrompt` *(à créer)*

- Carte flottante au-dessus de la nav, rayon 22 px, fond `brand-600`, ombre
  `0 16px 40px rgba(14,107,69,.35)`.
- Icône 48 px `#F7E7C3`, titre « Installer Lib'Trafic », ligne « Ouverture
  instantanée depuis l'écran d'accueil, moins de données consommées. »,
  fermeture `✕`.
- Boutons : « Installer » (`accent-500`, 50 px, plein) et « Plus tard »
  (translucide). « Plus tard » = 14 jours de silence.
- Déclenchée sur `beforeinstallprompt`, différée jusqu'au 2ᵉ lancement ou après
  un premier signalement.

---

## 6. États transverses

Chaque écran a un état **vide**, **chargement** et **erreur réseau**.

- **Chargement** : squelettes aux dimensions réelles (`sand-100` / `night-700`),
  jamais de spinner plein écran.
- **Vide** — Carte : « Aucun signalement actif autour de vous. Soyez le premier
  à signaler. » ; Sites : ne devrait pas arriver (données locales) ; Itinéraire :
  « Choisissez une destination. »
- **Erreur réseau** : bandeau discret en haut avec action « Réessayer », jamais
  de modale bloquante.
- **Désactivé** : `sand-200` / `ink-300` en clair, `night-700` / `mist-500` en
  sombre.

---

## 7. Correspondance écrans → fichiers

| Écran | Fichiers |
|---|---|
| Carte | `MapPage` · `MapView` · `TrafficLegend` · `ReportButton` |
| Signalement | `ReportModal` · `useGeolocation` |
| Détail | `ReportSheet` *(à créer)* · `useTrafficReports` |
| Itinéraire | `RoutePage` · `RoutePlanner` · `TransportPicker` · `useRoute` |
| Sites | `TourismPage` · `TouristSheet` · `lib/geo.ts` |
| Hors ligne / PWA | `OfflineBanner` · `InstallPrompt` *(à créer)* |

Trois composants sont à ajouter à l'arborescence du `CLAUDE.md` :
`ReportSheet`, `OfflineBanner`, `InstallPrompt`.

---

## 8. Accessibilité

- Contraste ≥ 4,5:1 pour tout texte, ≥ 3:1 pour les éléments graphiques.
- Aucune information portée par la seule couleur : chaque type de signalement a
  une icône distincte et le niveau est écrit en toutes lettres (« Niveau 4 »).
- Cibles tactiles 44 px minimum, espacées d'au moins 8 px.
- `prefers-reduced-motion` : supprimer les animations de feuille et de recentrage.
- Thème sombre suivant `prefers-color-scheme`, avec bascule manuelle en réglages.
