# Banco de dados

O projeto usa o MongoDB Atlas. O banco se chama `hub_proteses_3d` e tem três coleções.

## usuarios

Quem faz login no sistema. As contas são criadas pelo administrador.

- `nome`
- `email`: único, não pode ser alterado
- `senha`: guardada como hash
- `tipo`: `admin`, `aacd` ou `parceiro`
- `nivel`: 1 (só visualiza), 2 (visualiza e altera) ou 3 (administrador)
- `parceiroId`: de qual parceiro a pessoa é (só para o tipo `parceiro`)
- `ativo`: sim ou não. Conta desativada não consegue entrar
- `deveAlterarSenha`: sim quando a conta foi criada pelo administrador e a pessoa ainda não trocou a senha
- `criadoEm`

## parceiros

As unidades que imprimem: FabLabs, voluntários e empresas.

- `nome`
- `tipoUnidade`: `fablab`, `voluntario` ou `empresa`
- `cidade`
- `uf`: opcional
- `cnpj`: opcional, guardado só com os números
- `telefone`: opcional, só os números com DDD
- `emailContato`: opcional
- `capacidadeMensal`: peças por mês
- `biocompatibilidadeValidada`: sim ou não
- `homologado`: sim ou não
- `impressoras`: lista com `modelo`, `tecnologia`, `quantidade` e, opcionalmente, `marca` e `volumeUtil` (`x`, `y` e `z` em mm)
- `filamentos`: lista com `material` e `biocompativel`
- `criadoEm`

## pedidos

Os pedidos de próteses criados pela AACD.

- `numero`: número do pedido, em sequência
- `codigoCaso`: código do caso (não guardamos dados do paciente)
- `tipoProtese`
- `urgencia`: `baixa`, `media` ou `alta`
- `material`: filamento necessário
- `infillMinimo`
- `cidade`
- `responsavelClinico`
- `observacoes`: opcional
- `prazoEstimado`: opcional, data futura
- `arquivoUrl`: link do arquivo de fatiamento
- `status`
- `motivoReprovacao`: preenchido quando o pedido é reprovado
- `validacaoMecanica` e `validacaoSanitaria`: opcionais, preenchidas pela AACD ao aprovar ou reprovar, com `aprovada`, `observacoes`, `responsavel` e `data`
- `criadoPor`: usuário que criou o pedido
- `parceiroId`: parceiro escolhido
- `parceirosQueRecusaram`: lista dos parceiros que recusaram o pedido. Eles não são sugeridos nem atribuídos de novo
- `criadoEm`
- `historico`: lista das mudanças de status, com `status`, `data`, `usuarioId` e `observacao` (opcional)

Para gerar o número do pedido em sequência, existe também a coleção `contadores`, que guarda o último número usado.

## Status do pedido

Aberto → Atribuído → Em impressão → Enviado → Em validação → Aprovado → Entregue

- Se o parceiro recusar, o pedido volta para Aberto.
- Se a AACD reprovar, o status vira Reprovado e o pedido é encerrado.
- Para aprovar, nenhuma das validações informadas pode estar reprovada.
- O pedido só pode ser editado ou excluído enquanto está Aberto.

## Por que organizamos assim

- As impressoras e os filamentos ficam dentro do parceiro porque são poucos e sempre aparecem junto com ele.
- O histórico fica dentro do pedido pelo mesmo motivo.
- O parceiro fica separado do usuário porque várias pessoas do mesmo parceiro têm login.
- O pedido fica separado do parceiro porque um parceiro pode ter muitos pedidos.
