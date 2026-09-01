/**
 * Re-export auth primitives from the authjs-config so app code
 * imports from a stable shared path rather than the infrastructure layer.
 */
export { auth, signIn, signOut, handlers } from "@/modules/auth/infrastructure/authjs-config";
