import { createClient } from "@nhost/nhost-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function testConfig() {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "ischyvihgnfuncrkopph";
  const region = process.env.NEXT_PUBLIC_NHOST_REGION || "ap-south-1";

  console.log("Testing Nhost Config:", { subdomain, region });

  const nhost = createClient({ subdomain, region });

  try {
    // Attempt to probe the Nhost Auth service health or just its version
    const res = await fetch(`https://${subdomain}.auth.${region}.nhost.run/v1/healthz`);
    if (res.ok) {
        console.log("Nhost Auth service is HEALTHY");
    } else {
        console.log("Nhost Auth service returned status:", res.status);
    }
    
    // Test sign in for a non-existent user to see if we get a proper 401
    const { error } = await nhost.auth.signInEmailPassword({ 
        email: "non-existent-user-at-all@test.com", 
        password: "wrong-password" 
    });
    
    if (error) {
        console.log("Nhost Auth Error Check:", error.message);
    }
  } catch (err: any) {
    console.error("Fatal Error during Nhost probe:", err.message);
  }
}

testConfig();
