# Loading Animation Implementation Guide

This guide explains how to use the new loading animation system in your app.

## Components Created

### 1. **LoadingSpinner** (`components/ui/LoadingSpinner.tsx`)
An attractive, theme-matched loading spinner with multiple size and display variants.

**Features:**
- Multiple size options (sm, md, lg)
- Three display variants (default, inline, overlay)
- Supports loading text
- Matches site's blue primary color (#135bec)
- Glowing animation effect
- Dark mode support

**Usage:**
```tsx
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Centered with text
<LoadingSpinner size="md" variant="default" text="Loading..." />

// Inline with button
<LoadingSpinner size="sm" variant="inline" />

// Full-screen overlay
<LoadingSpinner size="lg" variant="overlay" text="Processing..." />
```

---

### 2. **ButtonWithLoading** (`components/ui/ButtonWithLoading.tsx`)
Enhanced button component with built-in loading state management.

**Features:**
- Automatic loading state on async operations
- Shows LoadingSpinner while loading
- Handles Promise-based click handlers
- Maintains button variants and styling
- Prevents multiple clicks while loading

**Usage:**
```tsx
import { ButtonWithLoading } from "@/components/ui/ButtonWithLoading";

export default function MyComponent() {
  const handleAsync = async () => {
    const response = await fetch("/api/some-endpoint");
    // Handle response...
  };

  return (
    <ButtonWithLoading
      onClick={handleAsync}
      loadingText="Processing..."
      variant="default"
      size="lg"
    >
      Submit
    </ButtonWithLoading>
  );
}
```

---

### 3. **useButtonLoading Hook** (`lib/hooks/useButtonLoading.ts`)
Custom hook for manual loading state management in click handlers.

**Features:**
- Easy async function handling
- Success and error callbacks
- Manual loading control
- Minimum duration option for better UX

**Usage:**
```tsx
import { useButtonLoading } from "@/lib/hooks/useButtonLoading";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MyComponent() {
  const { isLoading, handleAsync } = useButtonLoading({
    onSuccess: () => console.log("Success!"),
    onError: (error) => console.error(error),
    duration: 500, // Minimum loading duration
  });

  const onClick = async () => {
    await handleAsync(async () => {
      // Your async operation
      await fetch("/api/endpoint");
    });
  };

  return (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        "Click me"
      )}
    </Button>
  );
}
```

---

## Styling & Theme Integration

The loading spinner automatically uses your site's theme:
- **Primary Color**: Blue (#135bec / HSL 221 83% 53%)
- **Dark Mode**: Automatically adapts to dark/light mode
- **Animations**: Smooth 2.5s rotation with glowing effect

### Custom Animations Added to `globals.css`:
- `spin-smooth`: Smooth 2.5s rotation
- `spin-pulse-glow`: Glowing pulse effect
- `float-up`: Fade-in transition

---

## Examples by Use Case

### Example 1: Form Submission
```tsx
import { ButtonWithLoading } from "@/components/ui/ButtonWithLoading";

export default function Form() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/submit", { method: "POST" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" />
      <ButtonWithLoading type="submit" loadingText="Submitting...">
        Submit Form
      </ButtonWithLoading>
    </form>
  );
}
```

### Example 2: Click to Load Data
```tsx
import { useButtonLoading } from "@/lib/hooks/useButtonLoading";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DataLoader() {
  const { isLoading, handleAsync } = useButtonLoading();
  const [data, setData] = useState(null);

  const loadData = async () => {
    await handleAsync(async () => {
      const response = await fetch("/api/data");
      const result = await response.json();
      setData(result);
    });
  };

  return (
    <Button onClick={loadData} disabled={isLoading}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          Loading Data...
        </div>
      ) : (
        "Load Data"
      )}
    </Button>
  );
}
```

### Example 3: Interactive List Items (like GlobalHubsSection)
```tsx
import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function InteractiveList() {
  const [loadingItems, setLoadingItems] = useState({});

  const handleItemClick = (itemId: string) => {
    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));

    // Simulate async operation
    setTimeout(() => {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {["item1", "item2", "item3"].map((id) => (
        <div
          key={id}
          onClick={() => handleItemClick(id)}
          className="p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all"
        >
          {loadingItems[id] ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span>Click to load</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Customization

### Changing Colors
The spinner uses Tailwind's `primary` color from your theme. To customize:

**In `tailwind.config.ts`:**
```ts
theme: {
  extend: {
    colors: {
      primary: "your-color-code",
    },
  },
}
```

### Creating Size Variants
Edit `LoadingSpinner.tsx` to add new sizes:
```tsx
const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-20 h-20", // Add new size
};
```

---

## Best Practices

1. **Use ButtonWithLoading** for simple async button clicks
2. **Use useButtonLoading** for complex state management
3. **Always set a timeout** to prevent UI getting stuck
4. **Provide loading text** for better user feedback
5. **Handle errors** in onError callbacks
6. **Test in dark mode** to ensure visibility

---

## Files Modified/Created

- ✅ Created: `components/ui/LoadingSpinner.tsx`
- ✅ Created: `components/ui/ButtonWithLoading.tsx`
- ✅ Created: `lib/hooks/useButtonLoading.ts`
- ✅ Updated: `components/homepage/GlobalHubsSection.tsx`
- ✅ Updated: `app/globals.css` (added animation keyframes)
