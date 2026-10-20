import { conectar } from "./db.js";
import { criarUsuario } from "./usuarios.js";

const nome = process.argv[2];
const email = process.argv[3];
const senha = process.argv[4];

await conectar();

const id = await criarUsuario({
    nome: nome,
    email: email,
    senha: senha,
    tipo: "admin",
    nivel: 3,
});
console.log("Administrador criado com o id:", id);

process.exit(0);