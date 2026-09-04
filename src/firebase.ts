import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// `getAuth` lève une exception synchrone si la config est absente/invalide ;
// tant que .env.local n'est pas rempli, on désactive auth/Firestore plutôt
// que de faire planter tout l'app au chargement.
export let auth: Auth | undefined
export let db: Firestore | undefined

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  // Cache local persistant : les reports restent lisibles hors ligne (dernier
  // etat connu) et les ecritures faites hors ligne se rejouent au retour du
  // reseau — c'est le mecanisme "NetworkFirst avec repli sur le cache" de
  // CLAUDE.md §10 pour la collection `reports`, gere par le SDK plutot que
  // par le service worker (Firestore ne passe pas par de simples requetes
  // HTTP interceptables).
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  signInAnonymously(auth).catch((error: unknown) => {
    console.error('Échec de la connexion anonyme Firebase :', error)
  })
} else {
  console.warn(
    "Lib'Trafic : variables VITE_FIREBASE_* absentes de .env.local — auth et Firestore désactivés.",
  )
}
