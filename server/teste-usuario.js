import { conectar } from "./db.js";
import { criarUsuario, buscarUsuarioPorEmail } from "./usuarios.js";

await conectar();

const usuario = await buscarUsuarioPorEmail("teste@teste.com");
console.log("Encontrado:", usuario.nome, usuario.tipo, usuario.nivel);

try {
    await criarUsuario({
        nome: "Outro",
        email: "teste@teste.com",
        senha: "abc",
        tipo: "aacd",
        nivel: 1,

    });
} catch (erro) {
    console.log("Erro esperado:", erro.message);

}
process.exit(0);