import { test } from "node:test";
import assert from "node:assert";
import { gerarHash, conferirSenha } from "../server/senha.js";

test("o hash não é a senha", () => {
    const hash = gerarHash("Senha123");
    assert.notStrictEqual(hash, "Senha123");
    assert.strictEqual(hash.includes("Senha123"), false);
});

test("confere a senha certa", () => {
    const hash = gerarHash("Senha123");
    assert.strictEqual(conferirSenha("Senha123", hash), true);
});

test("recusa a senha errada", () => {
    const hash = gerarHash("Senha123");
    assert.strictEqual(conferirSenha("Senha124", hash), false);
});

test("a mesma senha gera hashes diferentes", () => {
    assert.notStrictEqual(gerarHash("Senha123"), gerarHash("Senha123"));
});