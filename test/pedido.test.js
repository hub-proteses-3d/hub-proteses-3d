import { test } from "node:test";
import assert from "node:assert";
import { erroDoPedido } from "../server/validacoes.js";

function dataDaqui(dias) {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
}

function pedidoCerto() {
    return {
        codigoCaso: "A-2341",
        tipoProtese: "Mão infantil",
        urgencia: "alta",
        material: "PLA",
        infillMinimo: 30,
        cidade: "Santo André",
        dataLimite: dataDaqui(30),
    };
}

test("pedido completo não tem erro", () => {
    assert.strictEqual(erroDoPedido(pedidoCerto()), null);
});

test("código do caso vazio é recusado", () => {
    const pedido = pedidoCerto();
    pedido.codigoCaso = "   ";
    assert.strictEqual(erroDoPedido(pedido), "Código do caso é obrigatório");
});

test("tipo de prótese vazio é recusado", () => {
    const pedido = pedidoCerto();
    pedido.tipoProtese = "";
    assert.strictEqual(erroDoPedido(pedido), "Tipo de protese é obrigatório");
});

test("urgência inválida é recusada", () => {
    const pedido = pedidoCerto();
    pedido.urgencia = "urgente";
    assert.strictEqual(erroDoPedido(pedido), "Urgência inválida");
});

test("material fora da lista é recusado", () => {
    const pedido = pedidoCerto();
    pedido.material = "ABS";
    assert.strictEqual(erroDoPedido(pedido), "Material inválido");
});

test("infill acima de 100 é recusado", () => {
    const pedido = pedidoCerto();
    pedido.infillMinimo = 150;
    assert.strictEqual(erroDoPedido(pedido), "Infill mínimo deve ser um número de 0 a 100");
});

test("infill como texto é recusado", () => {
    const pedido = pedidoCerto();
    pedido.infillMinimo = "30";
    assert.strictEqual(erroDoPedido(pedido), "Infill mínimo deve ser um número de 0 a 100");
});

test("cidade escrita diferente da lista é recusada", () => {
    const pedido = pedidoCerto();
    pedido.cidade = "santo andre";
    assert.strictEqual(erroDoPedido(pedido), "Cidade inválida");
});

test("operador do MongoDB no lugar da cidade é recusado", () => {
    const pedido = pedidoCerto();
    pedido.cidade = { $ne: "" };
    assert.strictEqual(erroDoPedido(pedido), "Cidade inválida");
});

test("data limite em outro formato é recusada", () => {
    const pedido = pedidoCerto();
    pedido.dataLimite = "30/06/2030";
    assert.strictEqual(erroDoPedido(pedido), "Data limite inválida");
});

test("data limite de hoje é recusada", () => {
    const pedido = pedidoCerto();
    pedido.dataLimite = dataDaqui(0);
    assert.strictEqual(erroDoPedido(pedido), "A data limite deve ser depois de hoje");
});

test("data limite de amanhã é aceita", () => {
    const pedido = pedidoCerto();
    pedido.dataLimite = dataDaqui(1);
    assert.strictEqual(erroDoPedido(pedido), null);
});

test("data que não existe é recusada", () => {
    const pedido = pedidoCerto();
    pedido.dataLimite = "2030-02-31";
    assert.strictEqual(erroDoPedido(pedido), "Data limite inválida");
});


test("mês 13 é recusado", () => {
    const pedido = pedidoCerto();
    pedido.dataLimite = "2030-13-01";
    assert.strictEqual(erroDoPedido(pedido), "Data limite inválida");
});

test("29 de fevereiro em ano bissexto é aceito", () => {
    const pedido = pedidoCerto();
    pedido.dataLimite = "2028-02-29";
    assert.strictEqual(erroDoPedido(pedido), null);
});