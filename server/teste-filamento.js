import { conectar } from "./db.js";
import { listarParceiros, buscarParceiroPorId, adicionarFilamento, removerFilamento } from "./parceiros.js";

await conectar();

const parceiros = await listarParceiros();
const parceiroId = parceiros[0]._id.toString();
console.log("Parceiro:", parceiros[0].nome);

const filamentoId = await adicionarFilamento(parceiroId, {
    material: "PLA",
    biocompativel: true,
});
console.log("Filamento adicionado:", filamentoId);

let parceiro = await buscarParceiroPorId(parceiroId);
console.log("Filamentos depois de adicionar:", parceiro.filamentos.length);

await removerFilamento(parceiroId, filamentoId.toString());
parceiro = await buscarParceiroPorId(parceiroId);
console.log("Filamentos depois de remover:", parceiro.filamentos.length);

try {
    await removerFilamento(parceiroId, filamentoId.toString());
} catch (erro) {
    console.log("Erro esperado:", erro.message);
}

process.exit(0);