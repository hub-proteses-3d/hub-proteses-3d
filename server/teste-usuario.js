import { conectar } from "./db.js";
import { criarUsuario, buscarUsuarioPorEmail } from "./usuarios.js";

await conectar();

const usuario = await buscarUsuarioPorEmail("fablab@exemplo.com");
console.log("Encontrado:", usuario.nome, usuario.tipo, usuario.nivel);

try {
    await criarUsuario({
        nome: "Outro",
        email: "fablab@exemplo.com",
        senha: "abc",
        tipo: "aacd",
        nivel: 1,

    });
} catch (erro) {
    console.log("Erro esperado:", erro.message);

}
process.exit(0);