import { nhost } from "./client/lib/nhost";

async function checkNhost() {
    console.log("Nhost auth keys:", Object.keys(nhost.auth));
}

checkNhost();
