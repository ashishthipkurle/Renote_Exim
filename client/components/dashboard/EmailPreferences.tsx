"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Bell, Mail, Shield, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState({
    orders: true,
    security: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await axios.get("/api/user/preferences");
        if (res.data.preferences) {
          setPreferences(res.data.preferences);
        }
      } catch (error) {
        console.error("Failed to fetch preferences", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/user/preferences", { preferences });
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading preferences...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Email Notifications</h3>
          <p className="text-sm text-muted-foreground">Manage how you receive alerts and updates.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {[
          {
            key: "orders",
            label: "Order Updates",
            desc: "Status changes, delivery alerts, and transaction receipts.",
            icon: ShoppingBag,
          },
          {
            key: "security",
            label: "Security Alerts",
            desc: "Login notifications, password changes, and 2FA status.",
            icon: Shield,
          },
          {
            key: "marketing",
            label: "Market Insights",
            desc: "New product launches, market trends, and platform news.",
            icon: Bell,
          },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = preferences[item.key as keyof typeof preferences];
          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key as keyof typeof preferences)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className={`mt-1 p-2 rounded-lg ${isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? "left-7" : "left-1"}`} />
              </div>
            </div>
          );
        })}
      </div>

      <Button 
        onClick={savePreferences} 
        disabled={saving} 
        className="w-full h-11 rounded-xl text-sm font-bold shadow-lg"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
