import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";
import RegisterForm from "./RegisterForm";

/**
 * Register Page (Server Component Guard)
 * Checks if the user is already authenticated. 
 * If yes, redirects them to the dashboard dispatcher.
 * If no, renders the client-side RegisterForm.
 */
export default async function RegisterPage() {
  const auth = await getServerAuthContext();

  // If already authenticated, don't show the registration page
  if (auth) {
    console.log(`[Register Guard] User ${auth.userId} is already authenticated. Redirecting to /dashboard`);
    redirect("/dashboard");
  }

  return <RegisterForm />;
}
