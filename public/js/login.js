const form = document.getElementById("form-login");
const erro = document.getElementById("erro");

const PAGINAS = {
  aacd: "aacd-dashboard.html",
  parceiro: "parceiro-dashboard.html",
  admin: "admin-usuarios.html",
};

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erro.hidden = true;

  const dados = {
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
  };

  try {
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      erro.textContent = resultado.erro;
      erro.hidden = false;
      return;
    }

    window.location.href = PAGINAS[resultado.tipo];
  } catch {
    erro.textContent = "Não foi possível conectar ao servidor";
    erro.hidden = false;
  }
});