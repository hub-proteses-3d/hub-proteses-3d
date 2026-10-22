import { conectar } from "./db.js";
import { buscarUsuarioPorEmail } from "./usuarios.js";
import { criarPedido, buscarPedidoPorNumero, mudarStatus } from "./pedidos.js";

await conectar();

const aacd = await buscarUsuarioPorEmail("teste@teste.com");
const parceiro = await buscarUsuarioPorEmail("parceiro@teste.com");

const numero = await criarPedido({
    codigoCaso: "A-3000",
    tipoProtese: "Órtese de punho",
    urgencia: "baixa",
    material: "PLA",
    infillMinimo: 30,
    cidade: "Mauá",
    arquivoUrl: "https://servidor.exemplo.br/arquivos/ortese.gcode",
}, aacd._id);
console.log("Pedido criado:", numero);

async function mudar(status, usuario, dados) {
    try {
        await mudarStatus(numero, status, usuario, dados);
        const pedido = await buscarPedidoPorNumero(numero);
        console.log("OK       ->", pedido.status);
    } catch (erro) {
        console.log("Recusado ->", erro.message);
    }
}

const escolha = { parceiroId: String(parceiro.parceiroId) };

await mudar("Em impressão", aacd, {});
await mudar("Atribuído", aacd, escolha);
await mudar("Aberto", parceiro, {});
await mudar("Atribuído", aacd, escolha);
await mudar("Em impressão", aacd, {});
await mudar("Em impressão", parceiro, {});
await mudar("Enviado", parceiro, {});
await mudar("Em validação", aacd, {});
await mudar("Reprovado", aacd, {});
await mudar("Aprovado", aacd, {});
await mudar("Entregue", aacd, {});

const final = await buscarPedidoPorNumero(numero);
console.log("Histórico:", final.historico.map((h) => h.status).join(" → "));

process.exit(0);