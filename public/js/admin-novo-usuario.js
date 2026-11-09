const form = document.getElementById("form-usuario");
const tipo = document.getElementById("tipo");
const nivel = document.getElementById("nivel");
const opcaoNivel3 = document.getElementById("opcao-nivel-3");
const campoParceiro = document.getElementById("campo-parceiro");
const selectParceiro = document.getElementById("parceiroId");
const mensagem = document.getElementById("mensagem");

function mostrarErro(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
}

function atualizarCampos() {
  campoParceiro.hidden = tipo.value !== "parceiro";

  if (tipo.value === "admin") {
    opcaoNivel3.hidden = false;
    nivel.value = "3";
    nivel.disabled = true;
  } else {
    opcaoNivel3.hidden = true;
    nivel.disabled = false;
    if (nivel.value === "3") {
      nivel.value = "1";
    }
  }
}

async function carregarParceiros() {
  const resposta = await fetch("/api/parceiros");
  if (resposta.status === 401) {
    window.location.href = "login.html";
    return;
  }
  const parceiros = await resposta.json();
  for (const parceiro of parceiros) {
    const opcao = document.createElement("option");
    opcao.value = parceiro._id;
    opcao.textContent = parceiro.nome;
    selectParceiro.appendChild(opcao);
  }
}

tipo.addEventListener("change", atualizarCampos);

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.hidden = true;

  const dados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    tipo: tipo.value,
    nivel: Number(nivel.value),
  };
  if (tipo.value === "parceiro") {
    dados.parceiroId = selectParceiro.value;
  }

  try {
    const resposta = await fetch("/api/usuarios", {
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
    window.location.href = "admin-usuarios.html";
  } catch {
    mostrarErro("Não foi possível conectar ao servidor.");
  }
});

atualizarCampos();
carregarParceiros();