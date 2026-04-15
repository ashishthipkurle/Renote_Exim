import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";
import LoginForm from "./LoginForm";

/**
 * Login Page (Server Component Guard)
 * Checks if the user is already authenticated. 
 * If yes, redirects them to the dashboard dispatcher.
 * If no, renders the client-side LoginForm.
 */
export default async function LoginPage() {
  const auth = await getServerAuthContext();

  // If already authenticated, don't show the login page
  if (auth) {
    console.log(`[Login Guard] User ${auth.userId} is already authenticated. Redirecting to /dashboard`);
    redirect("/dashboard");
  }

  return <LoginForm />;
}
