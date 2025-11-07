# Requisitos - HealDeal Contract Analyzer

## 1. Requisitos Funcionais

### RF-01: Upload de Contratos

**Descrição**: O sistema deve permitir que usuários façam upload de arquivos de contrato nos formatos PDF, DOC e DOCX.

**Atores**: Usuário final

**Pré-condições**: 
- Interface web carregada
- Arquivo nos formatos aceitos (.pdf, .doc, .docx)

**Pós-condições**:
- Arquivo armazenado no servidor
- Contrato registrado no banco de dados
- Análise automática iniciada

**Fluxo Principal**:
1. Usuário seleciona arquivo via input file
2. Usuário clica em "Analisar contrato"
3. Sistema valida formato do arquivo
4. Sistema salva arquivo com nome único (UUID)
5. Sistema extrai texto do documento
6. Sistema executa análise com IA
7. Sistema persiste resultados no banco
8. Sistema exibe análise ao usuário

**Fluxos Alternativos**:
- **FA-01**: Formato inválido
  - Sistema rejeita upload com mensagem de erro
  - Arquivo não é salvo
- **FA-02**: Erro na extração de texto
  - Sistema remove arquivo
  - Retorna erro 415 (Unsupported Media Type)
- **FA-03**: Erro na análise
  - Sistema salva contrato parcialmente
  - Campos de análise ficam nulos

**Regras de Negócio**:
- RN-01: Apenas .pdf, .doc e .docx são aceitos
- RN-02: Arquivo deve ser salvo com UUID para evitar conflitos
- RN-03: Análise é executada sincronamente (blocking)

**Critérios de Aceite**:
- Arquivo PDF é processado com sucesso
- Arquivo DOCX é processado com sucesso
- Arquivo de formato inválido é rejeitado
- Mensagem de progresso é exibida durante processamento
- Análise completa é exibida após processamento

---

### RF-02: Listagem de Contratos

**Descrição**: O sistema deve exibir lista de todos os contratos processados, ordenados por data de envio (mais recentes primeiro).

**Atores**: Usuário final

**Pré-condições**: Interface web carregada

**Pós-condições**: Lista de contratos exibida

**Fluxo Principal**:
1. Sistema carrega lista via GET /contracts
2. Sistema renderiza cada contrato com nome e data
3. Usuário pode clicar em um contrato para ver detalhes

**Fluxos Alternativos**:
- **FA-01**: Nenhum contrato processado
  - Sistema exibe mensagem "Nenhum contrato processado ainda"
- **FA-02**: Erro ao carregar
  - Sistema exibe mensagem de erro

**Regras de Negócio**:
- RN-01: Ordenação decrescente por created_at
- RN-02: Exibir nome original do arquivo
- RN-03: Exibir data formatada em pt-BR

**Critérios de Aceite**:
- Lista é carregada automaticamente ao abrir página
- Contratos mais recentes aparecem primeiro
- Nome do arquivo é exibido corretamente
- Data é formatada em português brasileiro
- Click em contrato carrega detalhes

---

### RF-03: Visualização de Análise

**Descrição**: O sistema deve exibir análise detalhada de um contrato selecionado, incluindo resumo, revisão, falhas e sugestões.

**Atores**: Usuário final

**Pré-condições**: 
- Contrato processado existe
- Usuário selecionou um contrato

**Pós-condições**: Análise completa exibida

**Fluxo Principal**:
1. Sistema carrega dados via GET /contracts/{id}
2. Sistema renderiza seções de análise:
   - Resumo executivo
   - Revisão geral
   - Falhas e riscos
   - Sugestões de compliance
   - Preview do texto
3. Sistema exibe botão de download

**Fluxos Alternativos**:
- **FA-01**: Contrato não encontrado
  - Sistema exibe mensagem de erro
- **FA-02**: Análise incompleta (campos nulos)
  - Sistema exibe "Informação não disponível"

**Regras de Negócio**:
- RN-01: HTML deve ser escapado para evitar XSS
- RN-02: Quebras de linha devem ser preservadas
- RN-03: Preview limitado a 600 caracteres

**Critérios de Aceite**:
- Todas as seções de análise são exibidas
- Conteúdo HTML é escapado corretamente
- Preview do texto é exibido
- Botão de download está funcional
- Campos vazios exibem placeholder adequado

---

### RF-04: Download de Contrato Original

**Descrição**: O sistema deve permitir download do arquivo original do contrato.

**Atores**: Usuário final

**Pré-condições**: 
- Contrato existe no sistema
- Arquivo existe no storage

**Pós-condições**: Arquivo baixado para o dispositivo do usuário

**Fluxo Principal**:
1. Usuário clica em "Baixar arquivo original"
2. Sistema localiza arquivo via GET /contracts/{id}/download
3. Sistema retorna arquivo com headers apropriados
4. Browser inicia download

**Fluxos Alternativos**:
- **FA-01**: Contrato não encontrado
  - Sistema retorna 404
- **FA-02**: Arquivo não existe no storage
  - Sistema retorna 404 com mensagem específica

**Regras de Negócio**:
- RN-01: Nome do download deve ser o original_filename
- RN-02: Content-type deve ser o content_type original
- RN-03: Arquivo deve ser servido via FileResponse

**Critérios de Aceite**:
- Download inicia corretamente
- Nome do arquivo é preservado
- Tipo MIME correto é usado
- Link abre em nova aba

---

### RF-05: Análise Automática com IA

**Descrição**: O sistema deve gerar automaticamente resumo, revisão, identificação de falhas e sugestões de compliance usando modelos de IA open-source.

**Atores**: Sistema (processo automático)

**Pré-condições**:
- Texto extraído do documento
- Modelos de IA carregados

**Pós-condições**: 
- Análise completa gerada
- Resultados armazenados no banco

**Fluxo Principal**:
1. Sistema recebe texto extraído
2. Sistema gera resumo via modelo de summarization
3. Sistema gera revisão via prompt customizado
4. Sistema identifica falhas via prompt customizado
5. Sistema sugere melhorias via prompt customizado
6. Sistema retorna dict com todos os resultados

**Fluxos Alternativos**:
- **FA-01**: Modelo não carregado
  - Sistema tenta carregar modelo
  - Se falhar, retorna erro
- **FA-02**: Texto muito longo
  - Sistema trunca conforme max_tokens configurado

**Regras de Negócio**:
- RN-01: Usar modelos configurados em Settings
- RN-02: Modelos devem ser carregados uma vez (singleton)
- RN-03: Prompts devem ser em português
- RN-04: Resumo: 60-512 tokens
- RN-05: Outras análises: até 512 tokens

**Critérios de Aceite**:
- Resumo é gerado em português
- Revisão identifica pontos fortes e riscos
- Falhas são listadas em tópicos
- Sugestões são objetivas e práticas
- Modelos são reutilizados (cache)

---

## 2. Requisitos Não-Funcionais

### RNF-01: Performance

**Métrica**: Tempo de resposta

**Requisitos**:
- Upload de arquivo < 2s (arquivos até 5MB)
- Extração de texto < 5s (documentos até 50 páginas)
- Análise com IA < 30s (textos até 5000 tokens)
- Listagem de contratos < 1s
- Carregamento de detalhes < 500ms

**Prioridade**: Média

**Justificativa**: MVP deve ser responsivo mas não precisa ser ultra-rápido.

---

### RNF-02: Escalabilidade

**Requisitos**:
- Suportar até 100 contratos simultâneos (MVP)
- Armazenamento: até 10GB de arquivos
- Modelos de IA carregados em memória (2-4GB RAM)

**Prioridade**: Baixa (MVP)

**Justificativa**: Escalabilidade será abordada em versões futuras.

**Evolução Futura**:
- Processamento assíncrono com fila
- Múltiplos workers
- Banco de dados PostgreSQL
- Storage em S3/Azure Blob

---

### RNF-03: Segurança

**Requisitos**:
- Validação de formato de arquivo no backend
- Nomes de arquivo únicos (UUID) para evitar conflitos
- Escape de HTML no frontend para prevenir XSS
- CORS configurado (restringir em produção)
- Mensagens de erro não devem expor detalhes internos
- Armazenamento local de arquivos (sem envio para APIs externas)

**Prioridade**: Alta

**Justificativa**: Dados contratuais são sensíveis e devem ser protegidos.

---

### RNF-04: Privacidade

**Requisitos**:
- Modelos de IA executados localmente
- Dados não saem do ambiente do servidor
- Sem rastreamento ou analytics de terceiros
- Arquivos armazenados em diretório privado

**Prioridade**: Alta

**Justificativa**: Privacy-first é um diferencial do produto.

---

### RNF-05: Usabilidade

**Requisitos**:
- Interface responsiva (desktop, tablet, mobile)
- Design moderno e profissional
- Feedback visual durante processamento
- Mensagens de erro claras
- Navegação intuitiva
- Acessibilidade básica (semântica HTML)

**Prioridade**: Alta

**Justificativa**: Interface deve ser fácil de usar para não-técnicos.

---

### RNF-06: Compatibilidade

**Requisitos**:
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móveis (iOS, Android)
- Python 3.10+
- PyTorch (CPU ou GPU)

**Prioridade**: Alta

**Justificativa**: Deve funcionar em ambientes comuns.

---

### RNF-07: Confiabilidade

**Requisitos**:
- Tratamento de erros em todos os pontos críticos
- Cleanup de arquivos em caso de falha
- Validação de dados de entrada
- Logs de erros (stderr)

**Prioridade**: Alta

**Justificativa**: Sistema deve ser robusto mesmo em cenários de erro.

---

### RNF-08: Manutenibilidade

**Requisitos**:
- Código com type hints
- Estrutura modular (services)
- Configuração via variáveis de ambiente
- Separação de responsabilidades
- Código legível e bem estruturado

**Prioridade**: Média

**Justificativa**: Facilita evolução futura.

---

### RNF-09: Portabilidade

**Requisitos**:
- Deploy em qualquer plataforma Python (Render, Railway, Fly.io, VPS)
- Banco SQLite (sem dependências externas)
- Frontend servido pelo backend (single endpoint)
- Possibilidade de frontend separado (configurável)

**Prioridade**: Alta

**Justificativa**: Facilita deploy e testes.

---

### RNF-10: Configurabilidade

**Requisitos**:
- Modelos de IA configuráveis via .env
- Tamanho de tokens configurável
- Diretório de uploads configurável
- URL do banco configurável

**Prioridade**: Média

**Justificativa**: Permite customização sem alterar código.

---

## 3. Restrições Técnicas

### RT-01: Linguagem Backend
Python 3.10+ obrigatório (type hints modernos, match/case)

### RT-02: Framework Backend
FastAPI (async support, Pydantic validation, OpenAPI)

### RT-03: Frontend
JavaScript Vanilla ES6+ (sem frameworks para MVP)

### RT-04: Banco de Dados
SQLite para MVP (PostgreSQL em produção)

### RT-05: Modelos de IA
Open-source via Hugging Face Transformers (sem APIs proprietárias)

### RT-06: Deployment
Single endpoint online (backend serve frontend)

---

## 4. Critérios de Sucesso do MVP

1. ✅ Usuário consegue fazer upload de PDF e DOCX
2. ✅ Análise é gerada em até 30 segundos
3. ✅ Resumo e sugestões são relevantes e em português
4. ✅ Interface é responsiva e funcional em mobile
5. ✅ Sistema pode ser deployado em plataforma online gratuita
6. ✅ Nenhum dado é enviado para APIs externas
7. ✅ Documentação permite setup em < 10 minutos