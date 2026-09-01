"use server";

import { signIn, signOut, auth } from "@/shared/lib/auth";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Role } from "@/modules/auth/domain/user-role";

export type SignInState = {
  error?: string;
} | undefined;

async function getIp(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function attemptSignIn(formData: FormData): Promise<SignInState> {
  const ip = await getIp();
  const rl = checkRateLimit(`login:${ip}`);
  if (!rl.allowed) {
    return {
      error: `Demasiados intentos. Intenta nuevamente en ${Math.ceil(rl.resetInMs / 1000)} segundos.`,
    };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch {
    return { error: "Credenciales inválidas. Por favor intenta nuevamente." };
  }
  return undefined;
}

/**
 * Admin sign-in: rejects CLIENT-role logins (they have their own portal).
 * Successful ADMIN/EDITOR logins land on /admin.
 */
export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const fail = await attemptSignIn(formData);
  if (fail) return fail;

  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (role === "CLIENT") {
    // Soft-block: log them out and redirect to the right portal.
    await signOut({ redirect: false });
    return {
      error: "Esta cuenta es para el portal del cliente. Inicia sesión en /cliente.",
    };
  }

  redirect("/admin");
}

/**
 * Client sign-in: lets any role through (so admins can preview), but always
 * lands on /cliente — the admin can navigate back to /admin manually.
 */
export async function signInClientAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const fail = await attemptSignIn(formData);
  if (fail) return fail;
  redirect("/cliente");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
