# Gestão de Materiais e Suprimentos

Aplicação para organizar o catálogo de materiais, as atas de registro de preços (ATAs), os setores participantes e as solicitações da Secretaria de Fazenda da Prefeitura Municipal de Botucatu.

Desenvolvida em HTML, CSS e JavaScript modular. Não exige compilação, servidor de banco de dados ou backend. Os registros ficam no armazenamento local do navegador (`localStorage`).

## Executar a aplicação

Na pasta do projeto, execute:

```bash
python3 -m http.server 8080 --directory dist
```

Acesse http://localhost:8080. Não abra `index.html` diretamente por `file://`, pois os módulos JavaScript precisam de HTTP.

## Funcionalidades

- **Catálogo:** cadastro, busca por código ou descrição, filtros, importação de XLS, XLSX e CSV e exportação para Excel.
- **Importação sem ATA:** carregue uma base de produtos, como a exportada do Fiorilli, escolhendo “Somente catálogo — sem vínculo com ATA”. Produtos são adicionados ou atualizados por código, preservando os vínculos existentes. A planilha precisa conter Código, Produto e Unidade de Medida; consulte os cabeçalhos aceitos na documentação detalhada.
- **Importação com ATA:** permite adicionar ou mesclar produtos e substituir a lista vinculada à ATA escolhida, sem excluir o catálogo ou alterar outras ATAs. Vínculos com solicitações pendentes são protegidos.
- **ATAs:** vários setores e produtos por ATA, seleção com busca e paginação, botão para inserir os itens selecionados e lista dos itens adicionados.
- **Quantidades por setor:** cada produto da ATA permite registrar a quantidade prevista de cada setor participante. Campos vazios representam quantidades não definidas. Essas previsões não alteram solicitações ou recebimentos e não funcionam como bloqueio automático de saldo.
- **Solicitações:** vários produtos por pedido, seleção de ATA e setor, responsável, ramal, quantidades individuais e busca rápida de produtos vinculados à ATA.
- **Recebimentos:** baixas parciais ou totais, histórico por item, cálculo de saldo pendente e proteção contra recebimentos acima do saldo.
- **Pendências:** cartões compactos com setor, ATA e quantidade de itens pendentes. Ao expandir “Ver itens”, aparecem código destacado, descrição resumida e quantidade solicitada; após recebimento parcial, o saldo pendente também é exibido.
- **Relatórios:** exportação para Excel, impressão e salvamento em PDF pela impressão do navegador, respeitando os filtros. O brasão aparece na impressão; as planilhas Excel não incluem imagens.
- **Operação:** cadastros, ordenação, filtros, paginação, clonagem, ações em lote e persistência local.

## Interface e layout

- Brasão e identificação institucional na barra lateral, com cabeçalho institucional nos relatórios impressos.
- Temas claro e escuro com contraste reforçado em textos, campos e cabeçalhos.
- Códigos dos produtos maiores e destacados.
- Descrições do catálogo com quebra de linha para acomodar textos longos.
- Editores de ATA e solicitação ampliados, com ações disponíveis no rodapé e organização adaptada a telas menores.
- Campos de quantidade compactos e alinhados por setor no editor da ATA.
- Descrições da solicitação limitadas a duas linhas, com “Mais” e “Menos” para consultar o texto completo.

## Estrutura

```text
dist/             Aplicação pronta para servir por HTTP
  assets/         Brasão utilizado na interface e impressão
  js/             Módulos JavaScript
  vendor/         Biblioteca local de planilhas
  index.html      Página principal
  style.css       Estilos e temas
baseDados/        Base de produtos exportada (CSV e XLS) para importação
docs/README.md    Documentação detalhada de operação e regras
tools/           Testes automatizados
package.json     Dependências e comandos de validação
package-lock.json Versões das dependências
```

## Instalar dependências e executar testes

Requer Node.js 20 ou superior e npm. As dependências são necessárias para os testes; a aplicação servida a partir de `dist/` não precisa de `node_modules`.

```bash
npm ci
npm run check
npm test
```

As suítes verificam solicitações, recebimentos, migração de dados, vínculos entre ATA, setor e produto, importação com e sem ATA, quantidades por setor, persistência e proteções do histórico. A aprovação dos testes automatizados não substitui a conferência visual no navegador.

## Dados e backups

Os registros são específicos do navegador e da origem utilizada (protocolo, endereço e porta). Trocar de endereço, porta, navegador ou computador pode apresentar uma base diferente. Limpar os dados do navegador também remove os registros locais.

Não há autenticação interna, sincronização entre usuários ou banco de dados central. Exporte os registros pelo sistema para guardá-los antes de atualizar a instalação ou mudar o endereço de acesso. Enviar o código ao GitHub não envia os registros do navegador.

A aplicação contém dados demonstrativos. A Central de ajuda permite removê-los mediante confirmação. Essa operação remove toda a base local.

## Repositório e atualizações

Repositório: https://github.com/rpdestro/comprasPlanejamentoOrcamento

A pasta do projeto é o próprio repositório git. Para publicar alterações, execute os testes, revise as mudanças com `git status` e então faça o commit e o push:

```bash
npm run check && npm test
git add -A
git commit -m "Descrição da alteração"
git push
```

O `.gitignore` mantém fora do repositório `node_modules`, arquivos `.env` e configurações locais. Não é necessário utilizar push forçado.

## Publicação no GitHub Pages

Site: https://rpdestro.github.io/comprasPlanejamentoOrcamento/

O workflow `.github/workflows/pages.yml` publica a pasta `dist/` a cada push na branch `main`. Antes de publicar, ele executa `npm run check` e `npm test`; se algum falhar, o site não é atualizado. O andamento aparece na aba *Actions* do repositório, e a publicação também pode ser disparada manualmente por lá.

Configuração única: em *Settings → Pages → Build and deployment → Source*, selecione **GitHub Actions**.

Veja [a documentação detalhada](docs/README.md) para as regras de operação.
