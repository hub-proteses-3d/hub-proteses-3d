import { conectar, getDb } from "./db.js";

await conectar();
const sessoes = getDb().collection("sessoes");
const plano = await sessoes.find({ token: "abc" }).explain("executionStats");

console.log("Sessões na collection:", await sessoes.countDocuments());
console.log("Chaves de índice lidas:", plano.executionStats.totalKeysExamined);
console.log("Documentos lidos:", plano.executionStats.totalDocsExamined);
process.exit(0);