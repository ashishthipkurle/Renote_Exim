import { createClient } from "@nhost/nhost-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function testLogin() {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;
  const email = "Importer13@gmail.com"; 
  const password = "your_password_here"; // USER: Update this!

  console.log("Config:", { subdomain, region, email });

  if (!subdomain || !region) {
    console.error("Error: Nhost configuration missing in .env.local");
    return;
  }

  const nhost = createClient({ subdomain, region });

  try {
    console.log("Attempting login...");
    const { session, error } = await nhost.auth.signInEmailPassword({ email, password });

    if (error) {
      console.error("Login Failed:", error);
    } else {
      console.log("Login Successful!");
      console.log("User ID:", session?.user?.id);
    }
  } catch (err: any) {
    console.error("Fatal Error:", err.message);
  }
}

testLogin();
