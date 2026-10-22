const pedidos = [
  { numero: 1042, tipoProtese: "Mão parcial (transradial)", urgencia: "alta", status: "Em impressão", parceiro: "FabLab USCS – São Caetano" },
  { numero: 1041, tipoProtese: "Prótese de mão infantil", urgencia: "media", status: "Aberto", parceiro: "" },
  { numero: 1039, tipoProtese: "Órtese de punho", urgencia: "baixa", status: "Atribuído", parceiro: "FabLab Mauá" },
  { numero: 1037, tipoProtese: "Prótese transtibial", urgencia: "alta", status: "Em validação", parceiro: "Voluntário técnico – Diadema" },
  { numero: 1035, tipoProtese: "Mão parcial (transradial)", urgencia: "media", status: "Entregue", parceiro: "FabLab UFABC – Santo André" },
  { numero: 1033, tipoProtese: "Órtese de punho", urgencia: "baixa", status: "Reprovado", parceiro: "FabLab São Bernardo" },
];

const URGENCIAS = {
  baixa: { texto: "Baixa", classe: "pill-success" },
  media: { texto: "Média", classe: "pill-warning" },
  alta: { texto: "Alta", classe: "pill-danger" },
};

const CORES_STATUS = {
  "Aberto": "pill-warning",
  "Atribuído": "pill-neutral",
  "Em impressão": "pill-info",
  "Enviado": "pill-info",
  "Em validação": "pill-success",
  "Aprovado": "pill-success",
  "Reprovado": "pill-danger",
  "Entregue": "pill-success",
};

const lista = document.getElementById("lista-pedidos");
let ativos = 0;
let impressao = 0;
let abertos = 0;
let entregues = 0;

for (const pedido of pedidos) {
  const urgencia = URGENCIAS[pedido.urgencia];
  const linha = document.createElement("tr");
  linha.innerHTML = `
    <td><strong>#${pedido.numero}</strong></td>
    <td>${pedido.tipoProtese}</td>
    <td><span class="pill ${urgencia.classe}">${urgencia.texto}</span></td>
    <td><span class="pill ${CORES_STATUS[pedido.status]}">${pedido.status}</span></td>
    <td>${pedido.parceiro || "—"}</td>
    <td><a href="aacd-acompanhamento.html?numero=${pedido.numero}" class="btn-link">Ver detalhes →</a></td>
  `;
  lista.appendChild(linha);

  if (pedido.status !== "Entregue" && pedido.status !== "Reprovado") {
    ativos++;
  }
  if (pedido.status === "Em impressão") {
    impressao++;
  }
  if (pedido.status === "Aberto") {
    abertos++;
  }
  if (pedido.status === "Entregue") {
    entregues++;
  }
}

document.getElementById("total-ativos").textContent = ativos;
document.getElementById("total-impressao").textContent = impressao;
document.getElementById("total-abertos").textContent = abertos;
document.getElementById("total-entregues").textContent = entregues;