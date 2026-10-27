const pedido = {
  numero: 1041,
  codigoCaso: "A-2341",
  tipoProtese: "Mão infantil, tam. P",
  urgencia: "media",
  material: "PLA Biocompatível",
  infillMinimo: 35,
  cidade: "São Caetano do Sul",
  arquivoUrl: "https://servidor.exemplo.br/arquivos/protese_mao_P_v3.gcode",
};

const parceiros = [
  {
    nome: "FabLab USCS",
    cidade: "São Caetano do Sul",
    homologado: true,
    filamentos: [{ material: "PLA" }, { material: "PLA Biocompatível" }],
  },
  {
    nome: "FabLab Mauá",
    cidade: "Mauá",
    homologado: true,
    filamentos: [{ material: "PLA Biocompatível" }],
  },
  {
    nome: "Voluntário técnico — J. Alvarenga",
    cidade: "Diadema",
    homologado: true,
    filamentos: [{ material: "PLA Biocompatível" }],
  },
  {
    nome: "FabLab São Bernardo",
    cidade: "São Bernardo do Campo",
    homologado: true,
    filamentos: [{ material: "PETG" }],
  },
];

const URGENCIAS = { baixa: "Baixa", media: "Média", alta: "Alta" };

function temMaterial(parceiro, material) {
  for (const filamento of parceiro.filamentos) {
    if (filamento.material === material) {
      return true;
    }
  }
  return false;
}

document.getElementById("numero-titulo").textContent = pedido.numero;
document.getElementById("numero-cartao").textContent = pedido.numero;

const nomeArquivo = pedido.arquivoUrl.split("/").pop();
document.getElementById("dados-pedido").innerHTML = `
  <dt>Código do caso</dt>
  <dd>${pedido.codigoCaso}</dd>
  <dt>Tipo de Prótese</dt>
  <dd>${pedido.tipoProtese}</dd>
  <dt>Urgência Clínica</dt>
  <dd>${URGENCIAS[pedido.urgencia]}</dd>
  <dt>Filamento Necessário</dt>
  <dd>${pedido.material}</dd>
  <dt>Infill Mínimo Exigido</dt>
  <dd>${pedido.infillMinimo}%</dd>
  <dt>Cidade</dt>
  <dd>${pedido.cidade}</dd>
  <dt>Arquivo de Fatiamento</dt>
  <dd><a href="${pedido.arquivoUrl}">${nomeArquivo}</a></dd>
`;

const lista = document.getElementById("lista-parceiros");
const mensagem = document.getElementById("mensagem");
let primeiro = true;

for (const parceiro of parceiros) {
  if (!parceiro.homologado || !temMaterial(parceiro, pedido.material)) {
    continue;
  }

  let tagCidade = `<span class="pill pill-neutral">Mesma cidade: não</span>`;
  if (parceiro.cidade === pedido.cidade) {
    tagCidade = `<span class="pill pill-success">Mesma cidade: sim</span>`;
  }

  const cartao = document.createElement("div");
  cartao.className = "match-card";
  let classeBotao = "btn btn-claro";
  if (primeiro) {
    cartao.className = "match-card top";
    classeBotao = "btn btn-primary";
    primeiro = false;
  }

  cartao.innerHTML = `
    <div>
      <div class="match-name">${parceiro.nome}</div>
      <div class="match-cidade">${parceiro.cidade}</div>
    </div>
    <div class="match-right">
      <span class="pill pill-success">Tem o material: sim</span>
      ${tagCidade}
      <button type="button" class="${classeBotao}">Atribuir pedido</button>
    </div>
  `;

  cartao.querySelector("button").addEventListener("click", () => {
    mensagem.textContent = "Pedido #" + pedido.numero + " atribuído a " + parceiro.nome + ". O envio para o servidor entra quando a rota de pedidos existir.";
    mensagem.hidden = false;
  });

  lista.appendChild(cartao);
}