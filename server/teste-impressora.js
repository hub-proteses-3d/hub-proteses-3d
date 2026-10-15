import { conectar } from "./db.js"
import { listarParceiros, buscarParceiroPorId, adicionarImpressora, removerImpressora } from "./parceiros.js";
await conectar();

const parceiros = await listarParceiros();
const parceiroId = parceiros[0]._id.toString();
console.log("parceiro:", parceiros[0].nome);

const impressoraId = await adicionarImpressora(parceiroId, {
    modelo: "Ender 3",
    tecnologia: "FDM",
    quantidade: 2,
});
console.log("Impressora adicionada:", impressoraId);

let parceiro = await buscarParceiroPorId(parceiroId);
console.log("Impressoras depois de adicionar:", parceiro.impressoras.length);

await removerImpressora(parceiroId, impressoraId.toString());
parceiro = await buscarParceiroPorId(parceiroId);
console.log("Impressoras depois de remover:", parceiro.impressoras.length);

try {
    await removerImpressora(parceiroId, impressoraId.toString());
} catch (erro) {
    console.log("Erro esperado:", erro.message);
}

process.exit(0);