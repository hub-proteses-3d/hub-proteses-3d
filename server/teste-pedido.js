import { conectar } from "./db.js";
import { buscarUsuarioPorEmail } from "./usuarios.js";
import { criarPedido, buscarPedidoPorNumero } from "./pedidos.js";

await conectar();

const usuario = await buscarUsuarioPorEmail("teste@teste.com");

const numero = await criarPedido({
    codigoCaso: "A-2340",
    tipoProtese: "Mão parcial (transradial)",
    urgencia: "alta",
    material: "PLA Biocompatível",
    infillMinimo: 35,
    cidade: "São Caetano do Sul",
    arquivoUrl: "https://servidor.exemplo.br/arquivos/protese.gcode",
    responsavelClinico: "Dra. Fernanda Lima",
}, usuario._id);
console.log("Pedido criado com o número:", numero);

const pedido = await buscarPedidoPorNumero(numero);
console.log("Encontrado:", pedido.numero, pedido.status, pedido.cidade, "| histórico:", pedido.historico.length);

try {
    await criarPedido({
        codigoCaso: "A-1",
        tipoProtese: "Teste",
        urgencia: "alta",
        material: "PLA",
        infillMinimo: 35,
        cidade: "santo andre",
        arquivoUrl: "https://servidor.exemplo.br/a.gcode",
    }, usuario._id);
} catch (erro) {
    console.log("Erro esperado:", erro.message);
}

process.exit(0);