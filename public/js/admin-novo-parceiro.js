const form = document.getElementById("form-parceiro");
const tipoUnidade = document.getElementById("tipoUnidade");
const cnpj = document.getElementById("cnpj");
const mensagem = document.getElementById("mensagem");

function mostrarErro(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
}

tipoUnidade.addEventListener("change", () => {
  if (tipoUnidade.value === "voluntario") {
    cnpj.value = "";
    cnpj.disabled = true;
  } else {
    cnpj.disabled = false;
  }
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.hidden = true;

  const dados = {
    nome: document.getElementById("nome").value,
    tipoUnidade: tipoUnidade.value,
    cidade: document.getElementById("cidade").value,
    cnpj: cnpj.value,
    capacidadeMensal: Number(document.getElementById("capacidadeMensal").value),
    biocompatibilidadeValidada: document.getElementById("biocompatibilidadeValidada").value === "true",
    homologado: document.getElementById("homologado").value === "true",
  };

  try {
    const resposta = await fetch("/api/parceiros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (resposta.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const resultado = await resposta.json();
    if (!resposta.ok) {
      mostrarErro(resultado.erro);
      return;
    }
    window.location.href = "admin-parceiros.html";
  } catch {
    mostrarErro("Não foi possível conectar ao servidor.");
  }
});