import type { UserInfo } from "#types/user-info";
import { randomString } from "#utils/common";

// --- CONFIGURATION UTILISATEUR FORCÉE ---
// On crée un utilisateur par défaut.
// Le jeu pensera que tu es connecté dès le lancement.
const DEFAULT_USER: UserInfo = {
  // Si un nom traîne dans le stockage on le prend, sinon on t'appelle "Red"
  username: localStorage.getItem("offlineUsername") || "Red",
  token: "offline_token_force",
  trainerId: 1, // ID arbitraire
  secretId: 1,
  lastSessionSlot: 0,
  gender: 0,
  hasAdminRole: true, // Mode admin activé pour le confort
  settings: {},
} as unknown as UserInfo;

// On initialise la variable directement avec cet utilisateur
// Comme ce n'est pas "null", le jeu sautera l'écran de login
export let loggedInUser: UserInfo | null = DEFAULT_USER;

export const clientSessionId = randomString(32);

export function initLoggedInUser(): void {
  // Si le jeu essaie de déconnecter ou reset, on remet l'utilisateur par défaut
  loggedInUser = DEFAULT_USER;
}

export async function updateUserInfo(): Promise<[boolean, number]> {
  // Le jeu va demander "Est-ce que le compte est valide ?"
  // On répond toujours "OUI" (True, code 200) immédiatement.
  return [true, 200];
}
