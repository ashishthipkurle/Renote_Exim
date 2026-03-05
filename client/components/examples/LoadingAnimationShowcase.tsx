"use client";

import { useState } from "react";
import { ButtonWithLoading } from "@/components/ui/ButtonWithLoading";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useButtonLoading } from "@/lib/hooks/useButtonLoading";

export default function LoadingAnimationShowcase() {
  const { isLoading, handleAsync } = useButtonLoading({ duration: 1000 });
  const [clickedItems, setClickedItems] = useState<{ [key: string]: boolean }>({});

  const handleItemClick = async (itemId: string) => {
    setClickedItems((prev) => ({ ...prev, [itemId]: true }));
    
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setClickedItems((prev) => ({ ...prev, [itemId]: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0A0E17] dark:to-[#141B2A] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Loading Animation Showcase
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-12">
          Beautiful loading animations integrated with your site's theme
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1: Loading Spinner Sizes */}
          <div className="rounded-2xl bg-white dark:bg-[#101622] p-8 border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Spinner Sizes
            </h2>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Small (sm)
                  </p>
                  <LoadingSpinner size="sm" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Medium (md) - Default
                  </p>
                  <LoadingSpinner size="md" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Large (lg)
                  </p>
                  <LoadingSpinner size="lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Button with Loading */}
          <div className="rounded-2xl bg-white dark:bg-[#101622] p-8 border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              ButtonWithLoading Component
            </h2>
            <div className="space-y-4">
              <ButtonWithLoading
                onClick={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                }}
                loadingText="Submitting..."
                variant="default"
                size="lg"
                className="w-full"
              >
                Click to Submit
              </ButtonWithLoading>

              <ButtonWithLoading
                onClick={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                }}
                loadingText="Processing..."
                variant="outline"
                size="lg"
                className="w-full"
              >
                Outline Button
              </ButtonWithLoading>

              <ButtonWithLoading
                onClick={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                }}
                loadingText="Loading..."
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Secondary Button
              </ButtonWithLoading>
            </div>
          </div>

          {/* Section 3: With Text */}
          <div className="rounded-2xl bg-white dark:bg-[#101622] p-8 border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Spinner with Text
            </h2>
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="md" text="Loading your data..." />
            </div>
          </div>

          {/* Section 4: Interactive Items */}
          <div className="rounded-2xl bg-white dark:bg-[#101622] p-8 border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Interactive Items
            </h2>
            <div className="space-y-3">
              {["item1", "item2", "item3"].map((id) => (
                <div
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#0A0E17] border border-slate-200 dark:border-white/5 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {clickedItems[id] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      ✓
                    </div>
                  )}
                  <span className="text-slate-900 dark:text-white font-medium">
                    {clickedItems[id] ? "Processing..." : "Click to load"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Hook Usage */}
          <div className="rounded-2xl bg-white dark:bg-[#101622] p-8 border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              useButtonLoading Hook
            </h2>
            <Button
              onClick={() =>
                handleAsync(async () => {
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                })
              }
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Click to Process"
              )}
            </Button>
          </div>

          {/* Section 6: Code Example */}
          <div className="rounded-2xl bg-white dark:bg-[#101622] p-8 border border-slate-200 dark:border-white/10 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Usage Example
            </h2>
            <pre className="bg-slate-100 dark:bg-[#0A0E17] p-4 rounded-lg overflow-x-auto text-xs">
              <code className="text-slate-700 dark:text-slate-300">
{`import { ButtonWithLoading } from "@/components/ui/ButtonWithLoading";

export default function MyComponent() {
  return (
    <ButtonWithLoading
      onClick={async () => {
        await fetch("/api/endpoint");
      }}
      loadingText="Processing..."
    >
      Click Me
    </ButtonWithLoading>
  );
}`}
              </code>
            </pre>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 p-6 border border-primary/20">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              ✨ Attractive Design
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Beautiful animations with glowing effects that match your site's blue theme
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 p-6 border border-primary/20">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              🎨 Theme Integrated
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Automatically adapts to light and dark modes
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 p-6 border border-primary/20">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              ⚡ Easy to Use
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Simple drop-in component or hook for your buttons
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
