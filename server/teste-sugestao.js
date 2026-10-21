import { conectar } from "./db.js";
import { buscarUsuarioPorEmail } from "./usuarios.js";
import { criarParceiro, adicionarFilamento } from "./parceiros.js";
import { criarPedido, sugerirParceiros } from "./pedidos.js";

await conectar();

async function novoParceiro(nome, cidade, material, homologado) {
    const id = await criarParceiro({
        nome: nome,
        tipoUnidade: "fablab",
        cidade: cidade,
        capacidadeMensal: 10,
        homologado: homologado,
    });
    await adicionarFilamento(id, { material: material, biocompativel: false });
}

await novoParceiro("Teste Sugestao A", "Diadema", "PETG", true);
await novoParceiro("Teste Sugestao B", "Diadema", "PLA", true);
await novoParceiro("Teste Sugestao C", "Santo André", "PLA", true);
await novoParceiro("Teste Sugestao D", "Santo André", "PLA", false);

const aacd = await buscarUsuarioPorEmail("teste@teste.com");
const numero = await criarPedido({
    codigoCaso: "A-4000",
    tipoProtese: "Mão infantil",
    urgencia: "media",
    material: "PLA",
    infillMinimo: 30,
    cidade: "Santo André",
    arquivoUrl: "https://servidor.exemplo.br/arquivos/mao.gcode",
}, aacd._id);
console.log("Pedido", numero, "- PLA em Santo André");

const sugestoes = await sugerirParceiros(numero);
for (const parceiro of sugestoes) {
    console.log(parceiro.nome, "-", parceiro.cidade);
}

try {
    await criarParceiro({ nome: "X", tipoUnidade: "fablab", cidade: "santo andre", capacidadeMensal: 1 });
} catch (erro) {
    console.log("Recusado ->", erro.message);
}
process.exit(0);