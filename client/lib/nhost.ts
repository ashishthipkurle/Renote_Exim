import { createNhostClient } from "@nhost/nhost-js";

const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "ischyvihgnfuncrkopph";
const region = process.env.NEXT_PUBLIC_NHOST_REGION || "ap-south-1";

export const nhost = createNhostClient({
  subdomain,
  region,
});
