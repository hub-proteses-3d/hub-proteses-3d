import { conectar } from "./db.js";
import { criarUsuario, buscarUsuarioPorEmail } from "./usuarios.js";
import { criarParceiro, adicionarImpressora, adicionarFilamento } from "./parceiros.js";
import { criarPedido, mudarStatus } from "./pedidos.js";

const senha = process.argv[2];

await conectar();

if (await buscarUsuarioPorEmail("aacd@exemplo.com")) {
    console.log("Os dados de exemplo já existem ");
    process.exit(0);
}
async function novoParceiro(nome, tipoUnidade, cidade, homologado, materiais) {
    const id = await criarParceiro({
        nome: nome,
        tipoUnidade: tipoUnidade,
        cidade: cidade,
        uf: "SP",
        capacidadeMensal: 20,
        biocompatibilidadeValidada: materiais.includes("PLA Biocompatível"),
        homologado: homologado,
    });
    await adicionarImpressora(id, { modelo: "Ender 3", tecnologia: "FDM", quantidade: 2 });
    for (const material of materiais) {
        await adicionarFilamento(id, { material: material, biocompativel: material === "PLA Biocompatível" });
    }
    return id;
}

const fablabSA = await novoParceiro("FabLab Santo André", "fablab", "Santo André", true, ["PLA", "PLA Biocompatível"]);
await novoParceiro("FabLab São Bernardo", "fablab", "São Bernardo do Campo", true, ["PLA", "PETG"]);
await novoParceiro("Voluntário Diadema", "voluntario", "Diadema", true, ["PLA"]);
await novoParceiro("Impressões Mauá", "empresa", "Mauá", false, ["PLA", "PETG"]);
console.log("4 parceiros criados");

await criarUsuario({ nome: "Coordenação AACD", email: "aacd@exemplo.com", senha: senha, tipo: "aacd", nivel: 2 });
await criarUsuario({ nome: "Consulta AACD", email: "consulta@exemplo.com", senha: senha, tipo: "aacd", nivel: 1 });
await criarUsuario({ nome: "FabLab Santo André", email: "fablab@exemplo.com", senha: senha, tipo: "parceiro", nivel: 2, parceiroId: String(fablabSA) });
console.log("3 usuários criados");

const aacd = await buscarUsuarioPorEmail("aacd@exemplo.com");
const parceiro = await buscarUsuarioPorEmail("fablab@exemplo.com");

async function novoPedido(codigoCaso, tipoProtese, urgencia, material, cidade) {
    return criarPedido({
        codigoCaso: codigoCaso,
        tipoProtese: tipoProtese,
        urgencia: urgencia,
        material: material,
        infillMinimo: 30,
        cidade: cidade,
        arquivoUrl: "https://arquivos.exemplo.com/" + codigoCaso + ".gcode",
        prazoEstimado: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }, aacd._id);
}

const atribuir = { parceiroId: String(fablabSA) };

await novoPedido("C-1001", "Mão infantil", "alta", "PLA Biocompatível", "Santo André");

const p2 = await novoPedido("C-1002", "Órtese de punho", "media", "PLA", "Santo André");
await mudarStatus(p2, "Atribuído", aacd, atribuir);

const p3 = await novoPedido("C-1003", "Prótese de dedo", "baixa", "PLA", "São Caetano do Sul");
await mudarStatus(p3, "Atribuído", aacd, atribuir);
await mudarStatus(p3, "Em impressão", parceiro, {});

const p4 = await novoPedido("C-1004", "Mão adulto", "media", "PLA Biocompatível", "Santo André");
await mudarStatus(p4, "Atribuído", aacd, atribuir);
await mudarStatus(p4, "Em impressão", parceiro, {});
await mudarStatus(p4, "Enviado", parceiro, {});
await mudarStatus(p4, "Em validação", aacd, {});
await mudarStatus(p4, "Aprovado", aacd, {
    validacaoMecanica: { aprovada: true },
    validacaoSanitaria: { aprovada: true },
});
await mudarStatus(p4, "Entregue", aacd, {});

const p5 = await novoPedido("C-1005", "Órtese de tornozelo", "alta", "PLA", "Diadema");
await mudarStatus(p5, "Atribuído", aacd, atribuir);
await mudarStatus(p5, "Em impressão", parceiro, {});
await mudarStatus(p5, "Enviado", parceiro, {});
await mudarStatus(p5, "Em validação", aacd, {});
await mudarStatus(p5, "Reprovado", aacd, {
    motivo: "Encaixe do punho ficou apertado",
    validacaoMecanica: { aprovada: false, observacoes: "Folga de 4 mm no punho" },
});

const p6 = await novoPedido("C-1006", "Mão infantil", "media", "PLA", "Santo André");
await mudarStatus(p6, "Atribuído", aacd, atribuir);
await mudarStatus(p6, "Aberto", parceiro, { observacao: "Sem filamento disponível este mês" });
console.log("6 pedidos criados");

process.exit(0);