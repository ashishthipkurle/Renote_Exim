"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-dvh w-full overflow-x-hidden">
      <div className="flex min-h-dvh w-full flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-background">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[440px]">
          {/* Brand */}
          <div className="flex items-center justify-center mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Renote<span className="text-primary">Exim</span>
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Email Verified</h1>
            <p className="text-muted-foreground">
              Thank you for verifying your email address. Your account is now fully active and ready for business.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="default" className="w-full">
                  Sign in to Terminal
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
