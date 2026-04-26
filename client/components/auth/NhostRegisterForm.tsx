"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nhost } from "@/lib/nhost";

export function NhostRegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { session, error } = await nhost.auth.signUp({
        email, 
        password,
        options: {
          displayName,
        }
      });
      
      if (error) {
        toast.error(error.message || "Failed to register");
        return;
      }
      
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Create Account (Nhost)</h2>
        <p className="text-zinc-500 text-sm mt-2">Sign up to get started</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}
