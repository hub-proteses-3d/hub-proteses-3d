import { conectar, getDb } from "./db.js";
await conectar();
const colecoes = await getDb().listCollections().toArray();
console.log("Collections:", colecoes);
process.exit(0);