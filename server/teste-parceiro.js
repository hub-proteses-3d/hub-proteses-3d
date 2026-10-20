import { conectar } from "./db.js";
import { criarParceiro, listarParceiros, buscarParceiroPorId } from "./parceiros.js";

await conectar();

const id = await criarParceiro({
    nome: "FabLab de Teste",
    tipoUnidade: "fablab",
    cidade: "Santo André",
    capacidadeMensal: 20,
    homologado: true,
});
console.log("Parceiro criado com o id:", id);

const parceiro = await buscarParceiroPorId(id.toString());
console.log("Encontrado:", parceiro.nome, parceiro.cidade, parceiro.homologado);

const todos = await listarParceiros();
console.log("Total de parceiros:", todos.length);

console.log("Id inválido:", await buscarParceiroPorId("abc"));

process.exit(0);