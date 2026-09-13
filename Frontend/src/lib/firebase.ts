/**
 * Firebase client SDK initialisation.
 *
 * The app is only initialised when every required env var is present. Without them the
 * feature stays dormant: the login page hides the buttons, so this is a safety net
 * rather than something a real user hits.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type Auth,
  type UserCredential,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
}

/** True when enough config is present to attempt a Firebase sign-in. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId)
}

let app: FirebaseApp | null = null
let auth: Auth | null = null

function getFirebaseAuth(): Auth {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  if (!auth) {
    auth = getAuth(app)
  }
  return auth
}

// ── Providers ───────────────────────────────────────────────────────────────

export type FirebaseProviderName = 'google' | 'github' | 'microsoft'

export interface FirebaseProviderInfo {
  name: FirebaseProviderName
  label: string
  /** Simple glyph or letter to show inside the button. */
  glyph: string
}

export const FIREBASE_PROVIDERS: FirebaseProviderInfo[] = [
  { name: 'google', label: 'Google', glyph: 'G' },
  { name: 'github', label: 'GitHub', glyph: '⌥' },
  { name: 'microsoft', label: 'Microsoft', glyph: '⊞' },
]

function createProvider(name: FirebaseProviderName) {
  switch (name) {
    case 'google':
      return new GoogleAuthProvider()
    case 'github':
      return new GithubAuthProvider()
    case 'microsoft':
      return new OAuthProvider('microsoft.com')
  }
}

/**
 * Opens the Firebase sign-in popup for the given provider and returns the ID token.
 *
 * The token is what the backend verifies with the Admin SDK. Nothing from the popup
 * response is trusted by the client directly.
 */
export async function signInWithFirebase(providerName: FirebaseProviderName): Promise<string> {
  const firebaseAuth = getFirebaseAuth()
  const provider = createProvider(providerName)
  const result: UserCredential = await signInWithPopup(firebaseAuth, provider)
  const idToken = await result.user.getIdToken()
  return idToken
}
