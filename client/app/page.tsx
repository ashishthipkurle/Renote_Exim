import type { Viewport } from 'next';
import HomeClient from "@/components/homepage/HomeClient";

// Force the initial layout metadata to treat the device as exactly a 1440px wide screen.
// This native server-side tag guarantees Tailwind CSS grids and layout units render correctly 
// for desktop before hydration scaling kicks in, resolving overlap and size issues.
export const viewport: Viewport = {
  width: 1440,
};

export default function HomePage() {
  return <HomeClient />;
}
