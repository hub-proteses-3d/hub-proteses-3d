import { getDb } from './db.js';
import { gerarHash } from './senha.js';

const TIPOS = ["admin", "aacd", "parceiro"];
const NIVEIS = [1, 2, 3];

export async function criarUsuario(dados) {
    if (typeof dados.nome !== 'string' || dados.nome === "") {
        throw new Error("Nome é obrigatório");
    }
    if (typeof dados.email !== 'string' || dados.email === "") {
        throw new Error("Email é obrigatório");
    }
    if (typeof dados.senha !== 'string' || dados.senha === "") {
        throw new Error("Senha é obrigatória");
    }
    if (!TIPOS.includes(dados.tipo)) {
        throw new Error("Tipo de usuário inválido");
    }
    if (!NIVEIS.includes(dados.nivel)) {
        throw new Error("Nível inválido");
    }

    const usuario = {
        nome: dados.nome,
        email: dados.email.toLowerCase(),
        senha: gerarHash(dados.senha),
        tipo: dados.tipo,
        nivel: dados.nivel,
        criadoEm: new Date(),
    };
    try {
        const resultado = await getDb().collection("usuarios").insertOne(usuario);
        return resultado.insertedId;
    } catch (erro) {
        if (erro.code === 11000) {
            throw new Error("Já existe um usuário com este email");
        }
        throw erro;
    }
}

export async function buscarUsuarioPorEmail(email) {
    if (typeof email !== "string") {
        return null;
    }
    return getDb().collection("usuarios").findOne({ email: email.toLowerCase() });
}
export async function alterarSenha(usuarioId, novaSenha) {
    if (typeof novaSenha !== "string" || novaSenha.length < 6) {
        throw new Error("A nova senha precisa ter pelo menos 6 caracteres");
    }
    await getDb().collection("usuarios").updateOne(
        { _id: usuarioId },
        { $set: { senha: gerarHash(novaSenha) } }
    );
}



