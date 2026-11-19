import { ObjectId } from "mongodb";
import { getDb } from './db.js';
import { gerarHash } from './senha.js';
import { buscarParceiroPorId } from "./parceiros.js";
import { textoValido } from "./validacoes.js";

const TIPOS = ["admin", "aacd", "parceiro"];
const NIVEIS = [1, 2, 3];

function validarNivel(tipo, nivel) {
    if (!NIVEIS.includes(nivel) || (tipo === "admin") !== (nivel === 3)) {
        throw new Error("Nível inválido");
    }
}

export async function criarUsuario(dados) {
    if (typeof dados.nome !== 'string' || dados.nome.trim() === "") {
        throw new Error("Nome é obrigatório");
    }
    if (typeof dados.email !== 'string' || dados.email.trim() === "") {
        throw new Error("Email é obrigatório");
    }
    if (typeof dados.senha !== 'string' || dados.senha.length < 6) {
        throw new Error("A senha precisa ter pelo menos 6 caracteres");
    }
    if (!TIPOS.includes(dados.tipo)) {
        throw new Error("Tipo de usuário inválido");
    }
    validarNivel(dados.tipo, dados.nivel);

    const usuario = {
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        senha: gerarHash(dados.senha),
        tipo: dados.tipo,
        nivel: dados.nivel,
        ativo: true,
        criadoEm: new Date(),
    };
    if (dados.tipo === "parceiro") {
        const parceiro = await buscarParceiroPorId(dados.parceiroId);
        if (parceiro === null) {
            throw new Error("Parceiro não encontrado");
        }
        usuario.parceiroId = parceiro._id;
    }
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
    return getDb().collection("usuarios").findOne({ email: email.trim().toLowerCase() });
}
export async function alterarSenha(usuarioId, novaSenha) {
    if (typeof novaSenha !== "string" || novaSenha.length < 6) {
        throw new Error("A nova senha precisa ter pelo menos 6 caracteres");
    }
    const resultado = await getDb().collection("usuarios").updateOne(
        { _id: usuarioId },
        { $set: { senha: gerarHash(novaSenha) } }
    );
    if (resultado.matchedCount === 0) {
        throw new Error("Usuário não encontrado");
    }
}

export async function editarUsuario(id, dados) {
    if (!ObjectId.isValid(id)) {
        throw new Error("Usuário inválido");
    }
    const atual = await getDb().collection("usuarios").findOne({ _id: new ObjectId(id) });
    if (atual === null) {
        throw new Error("Usuário não encontrado");
    }
    if (!textoValido(dados.nome)) {
        throw new Error("Nome é obrigatório");
    }
    validarNivel(atual.tipo, dados.nivel);
    const alteracoes = { nome: dados.nome, nivel: dados.nivel };
    if (atual.tipo === "parceiro") {
        const parceiro = await buscarParceiroPorId(dados.parceiroId);
        if (parceiro === null) {
            throw new Error("Parceiro não encontrado");
        }
        alteracoes.parceiroId = parceiro._id;
    }
    await getDb().collection("usuarios").updateOne({ _id: atual._id }, { $set: alteracoes });
}

export async function listarUsuarios(filtros) {
    const filtro = {};
    if (TIPOS.includes(filtros.tipo)) {
        filtro.tipo = filtros.tipo;
    }
    if (filtros.ativo === "true") {
        filtro.ativo = { $ne: false };
    }
    if (filtros.ativo === "false") {
        filtro.ativo = false;
    }
    return getDb().collection("usuarios").find(filtro, { projection: { senha: 0 } }).sort({ nome: 1 }).toArray();
}

export async function alterarAtivo(id, ativo) {
    if (!ObjectId.isValid(id)) {
        throw new Error("Usuário inválido");
    }
    if (typeof ativo !== "boolean") {
        throw new Error("Informe ativo como true ou false");
    }
    const resultado = await getDb().collection("usuarios").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ativo: ativo } }
    );
    if (resultado.matchedCount === 0) {
        throw new Error("Usuário não encontrado");
    }
}



