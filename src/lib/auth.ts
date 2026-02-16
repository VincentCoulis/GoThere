import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated user or redirects to /login.
 * Use in Server Components and Server Actions for protected pages.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Returns true if the given email matches the configured admin email.
 */
export function isAdmin(email: string | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

/**
 * Returns the authenticated admin user or redirects to /dashboard.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.email)) {
    redirect("/dashboard");
  }
  return user;
}
