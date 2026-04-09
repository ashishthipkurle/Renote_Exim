import { createClient } from "@nhost/nhost-js";

const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "";
const region = process.env.NEXT_PUBLIC_NHOST_REGION || "";

console.log("Subdomain:", subdomain);
console.log("Region:", region);
console.log("Auth URL would be:", `https://${subdomain}.auth.${region}.nhost.run/v1`);

const nhost = createClient({ subdomain, region });

async function main() {
  const email = "importer5@gmail.com";
  const password = "Test@12345"; // Change this to the actual password you used

  console.log("\n--- Testing signIn for:", email, "---");
  
  const result = await nhost.auth.signInEmailPassword({ email, password });
  
  console.log("Error:", result.error ? JSON.stringify(result.error) : "none");
  console.log("Session:", result.session ? "YES (token exists)" : "null");
  console.log("Full result keys:", Object.keys(result));
  
  if (result.error) {
    console.log("\nError status:", result.error.status);
    console.log("Error message:", result.error.message);
  }
  
  if (result.session) {
    console.log("User ID:", result.session.user?.id);
    console.log("User email:", result.session.user?.email);
  }
}

main().catch(e => console.error("FATAL:", e));
