const id = new URLSearchParams(window.location.search).get("id");

const TIPOS_UNIDADE = {
  fablab: "Universidade / FabLab",
  voluntario: "Voluntário",
  empresa: "Empresa",
};

async function contarEntregues(minhaUnidade) {
  if (id !== minhaUnidade) {
    return "—";
  }
  const pedidos = await buscarDados("/api/pedidos");
  let total = 0;
  for (const pedido of pedidos) {
    if (pedido.status === "Entregue") {
      total++;
    }
  }
  return String(total);
}

async function carregarDetalhes() {
  try {
    const dados = await carregarUnidade();
    const unidade = await buscarDados("/api/parceiro?id=" + id);

    document.getElementById("nome").textContent = unidade.nome;
    document.getElementById("subtitulo").textContent = TIPOS_UNIDADE[unidade.tipoUnidade] + " · " + unidade.cidade;

    let certificacao = "Biocompatibilidade não validada";
    if (unidade.biocompatibilidadeValidada) {
      certificacao = "Biocompatibilidade validada";
    }
    const capacidade = document.getElementById("dados-capacidade");
    capacidade.appendChild(linhaDado("Capacidade", unidade.capacidadeMensal + " peças por mês"));
    capacidade.appendChild(linhaDado("Impressoras", resumoImpressoras(unidade.impressoras)));
    capacidade.appendChild(linhaDado("Certificação", certificacao));

    let homologacao = "Não homologado";
    if (unidade.homologado) {
      homologacao = "Homologado";
    }
    const historico = document.getElementById("dados-historico");
    historico.appendChild(linhaDado("Próteses entregues (total)", await contarEntregues(dados.parceiro._id)));
    historico.appendChild(linhaDado("Situação da homologação", homologacao));
  } catch (falha) {
    const erro = document.getElementById("erro");
    erro.textContent = falha.message;
    erro.hidden = false;
  }
}

carregarDetalhes();
