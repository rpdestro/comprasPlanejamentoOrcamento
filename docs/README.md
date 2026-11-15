# Supri — Gestão de materiais e suprimentos
Aplicação front-end modular em HTML, CSS e JavaScript ES6, com persistência local.

## Executar
Sirva `dist/` por HTTP. Não abra o HTML diretamente por file://, pois os módulos precisam de HTTP.
A pasta dist contém index.html, style.css, js/ e vendor/. As pastas data/, docs/ e tools/ ficam na raiz do projeto.

## Módulos
- store.js: estado e persistência em localStorage (chave supri-v1).
- fileio.js: importação, mesclagem por código, exportação e planilha modelo.
- modals.js: formulários, validações e diálogos.
- utils.js: filtros, ordenação e apresentação segura de texto.
- icons.js: ícones SVG locais.
- app.js: navegação, dashboard, tabela e coordenação de eventos.

## Planilhas
Formatos aceitos: XLSX, XLS e CSV. Colunas obrigatórias: Código, Produto e Unidade de Medida.
A importação reconhece também os cabeçalhos Código do Produto, Descrição, Material, Unidade, UND e UM.
Arquivos CSV em UTF-8 e Windows-1252 são suportados. O limite é 8 MB por arquivo.
A mesclagem atualiza produtos com o mesmo código e vincula os itens à ATA de destino. Substituir troca somente a lista de produtos vinculados à ATA escolhida, preservando o catálogo e as demais ATAs.
A exportação gera um relatório com estilo próprio e inclui cópias das abas originais importadas.
A biblioteca xlsx-js-style 1.2.0 está incluída em vendor/ a partir do CDN jsDelivr, evitando dependência de rede em execução.
Nem todos os recursos do Excel são suportados: macros, imagens, gráficos, formatação condicional e outros recursos avançados podem não ser preservados. Estilos de células compatíveis, larguras, mesclagens e formatos numéricos são mantidos nas abas de origem conforme suporte da biblioteca.

## Operação
Os dados são locais ao navegador, sem autenticação interna, backend ou sincronização. Exporte backups regularmente. Planilhas com muitas células ou estilos podem exceder a cota do localStorage; a aplicação informa a falha de salvamento e permite exportar os dados da sessão.
A base inicial é demonstrativa. Em Central de ajuda, use Remover dados demonstrativos para começar com uma base vazia (a ação pede confirmação e remove toda a base local).
Os relatórios e a impressão respeitam os filtros selecionados. Seleção de todos atua na página atual; seleção individual permanece entre páginas. O catálogo é um snapshot nas solicitações, mantendo o histórico de descrição e unidade dos pedidos já criados.

## QA
Os componentes principais têm data-testid. O projeto inclui verificação de importação XLS/XLSX/CSV, estilos de origem, operações CRUD, filtros, ações em massa e persistência com um DOM de teste. A verificação visual em navegador depende da infraestrutura de preview da sessão.

## Solicitações com vários produtos e recebimentos
Uma solicitação reúne vários itens com um número único, setor, responsável, ramal, data e ATA. A busca rápida aceita código ou nome e evita produtos duplicados na mesma solicitação. Cada produto tem uma quantidade solicitada independente.
Os avisos de pendência ficam em Visão geral e Solicitações e respeitam os filtros. Ao salvar, um resumo informa o setor e os materiais aguardados. Os avisos são locais à aplicação; não são enviados por e-mail ou outros canais.
Use o botão ✓ de uma linha ou Ver solicitação / dar baixa no aviso para registrar recebimentos. Informe somente o que chegou na entrega atual; valores acima do saldo são rejeitados sem registrar parte da entrega. Recebimentos parciais deixam o item Em andamento; o total recebido conclui o item e remove sua pendência do aviso. Cada recebimento guarda quantidade, data, observação e horário de registro.
Cadastros antigos são preservados e recebem um identificador de solicitação. Itens antigos já concluídos são considerados totalmente recebidos, sem criar um histórico retroativo. Cada linha antiga continua como uma solicitação independente. Responsável e ramal podem ser completados ao editar a solicitação.
A edição de uma solicitação abre todos os seus itens, mantém o histórico e impede reduzir quantidades abaixo do total recebido ou remover itens com recebimentos. Clonar itens cria uma nova solicitação sem recebimentos. Ações em lote permitem cancelar os saldos pendentes; a conclusão acontece pelo registro de recebimento.
Relatórios incluem número da solicitação, responsável, ramal, ATA, solicitado, recebido e saldo pendente. O cadastro de setor agora permite informar ramal, preenchido automaticamente ao selecionar o setor; o responsável e o ramal da solicitação continuam editáveis.

### Testes desta versão
Execute `npm install` e `npm test`. A suíte usa happy-dom e verifica busca rápida, solicitação com vários itens, dados do solicitante, aviso persistente, baixa parcial e total, validações sem alterações parciais, histórico, migração, clonagem, edição protegida, relatórios e persistência. A validação visual em navegador não foi executada nesta sessão porque a ferramenta cua_repl.js não está disponível.

## ATAs, participantes e produtos
Cada ATA possui listas independentes de setores participantes (`sectorIds`) e produtos disponíveis (`productIds`). Vários setores podem solicitar os vários produtos vinculados à mesma ATA; um produto pode ser reutilizado em várias ATAs sem duplicar o código no catálogo.
Crie os setores, cadastre a ATA selecionando os participantes e depois vincule os produtos pelo cadastro da ATA, pela edição de produto ou por importação. A ATA pode ser criada ainda sem produtos para permitir esse fluxo. Novos produtos exigem pelo menos uma ATA. Produtos antigos sem vínculo são preservados e aparecem como Sem vínculo no catálogo.
A nova solicitação começa pela seleção da ATA; a lista de setores e a busca de produtos usam exclusivamente os vínculos dessa ATA. Não é possível usar uma ATA digitada livremente. Uma lista com produtos deve ser esvaziada antes de trocar sua ATA; solicitações com recebimentos mantêm ATA e setor bloqueados.
A migração utiliza as solicitações existentes para recuperar os vínculos conhecidos entre ATA, setor e produto. ATAs antes informadas por texto são recuperadas para revisão cadastral. Produtos que nunca apareceram em uma solicitação não recebem vínculos presumidos: configure-os em Atas de registro ou Catálogo de produtos. Os dados e históricos anteriores são preservados.
A retirada de setores ou produtos com solicitações pendentes é bloqueada. A exclusão de ATA com solicitações é bloqueada para preservar o histórico. Excluir produtos permitidos limpa os vínculos nas ATAs.
Na importação, a ATA de destino é opcional. Sem ATA, os produtos são adicionados ou atualizados por código no catálogo, preservando os vínculos existentes. A opção Substituir só está disponível quando uma ATA é selecionada. Mesclar adiciona vínculos e atualiza por código. Substituir troca apenas a lista de produtos dessa ATA; não apaga produtos do catálogo nem altera outras ATAs. A substituição que retiraria um produto com pedido pendente é recusada.

## Layout dos editores
Os formulários de solicitação, ATA e produto usam uma janela ampliada, com cabeçalho e ações sempre disponíveis e uma única área de rolagem vertical. O catálogo e os itens selecionados ficam lado a lado em telas largas e empilhados em telas menores. Busca e seleção usam páginas curtas, sem barras de rolagem internas. Os nomes dos materiais quebram linha e cada item possui seu próprio campo de quantidade. As listas de participação permitem selecionar todos os resultados filtrados.
`npm test` executa as suítes de solicitações/recebimentos e de regras das ATAs. A verificação visual continua limitada nesta sessão: o ambiente não disponibiliza a ferramenta cua_repl.js exigida para o preview gerenciado.

### Quantidades por setor na ATA
No editor ampliado, marque produtos por código ou descrição e use Inserir itens selecionados. A lista de itens adicionados permite informar quantidades previstas por setor participante. Campos vazios representam quantidades ainda não definidas; zero é permitido. As quantidades são preservadas ao reabrir a ATA e não alteram solicitações ou recebimentos. Alterações só são gravadas ao salvar a ATA.
