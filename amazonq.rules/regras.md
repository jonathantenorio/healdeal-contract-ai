# Regras de Codificação e Boas Práticas - HealDeal Contract Analyzer

## Padrões de Código Python (Backend)

### Type Hints
- Todo código Python deve usar type hints obrigatoriamente
- Usar `typing` para tipos complexos (List, Dict, Optional, etc.)
- Funções devem especificar tipos de parâmetros e retorno
```python
from typing import Dict
def analyze(text: str) -> Dict[str, str]:
    ...
```

### Docstrings
- Classes e funções públicas devem ter docstrings
- Usar formato simples e direto
```python
class ContractAnalyzer:
    """Executa análise automática de contratos usando modelos open-source."""
```

### Formatação
- Usar f-strings para formatação de strings
- Preferir compreensões de lista quando aplicável
- Manter código limpo e legível

### Tratamento de Exceções
- Criar exceções customizadas quando apropriado (ex: `UnsupportedFileFormat`)
- Tratar exceções específicas antes de genéricas
- Fazer cleanup de recursos em caso de erro (ex: remover arquivo se processamento falhar)

### Configuração
- Usar Pydantic `BaseSettings` para configuração
- Permitir override via variáveis de ambiente
- Usar valores padrão sensatos

## Padrões de Código JavaScript (Frontend)

### Estrutura
- JavaScript Vanilla ES6+ (sem frameworks)
- Usar `const` e `let`, nunca `var`
- Usar async/await ao invés de .then() para promises
- Usar arrow functions para callbacks

### Organização
- Separar lógica de API, renderização e eventos
- Usar funções nomeadas e descritivas
- Evitar código duplicado

### Segurança
- Escapar HTML para prevenir XSS ao renderizar conteúdo dinâmico
- Usar `textContent` ou escape manual ao inserir dados do usuário

## Segurança e Privacy

### Armazenamento de Dados
- Arquivos devem ser armazenados com nomes únicos (UUID) para evitar conflitos
- Usar diretório dedicado para uploads (`storage/uploads/`)
- Validar extensões de arquivo antes de processar

### Validação de Input
- Validar formato de arquivo no backend (não confiar apenas no frontend)
- Limitar tamanho de arquivos (configurável)
- Sanitizar nomes de arquivos

### API
- Usar códigos HTTP apropriados (400, 404, 415, 500)
- Retornar mensagens de erro claras e seguras
- Validar dados com Pydantic schemas

## Banco de Dados

### SQLAlchemy
- Usar ORM para todas as operações de banco
- Definir modelos com tipos apropriados
- Usar índices em colunas frequentemente consultadas
- Usar `nullable=False` quando campo é obrigatório

### Sessões
- Usar dependency injection (`Depends(get_db)`) para sessões
- Garantir fechamento de sessões (try/finally)
- Fazer commit apenas após operações bem-sucedidas

## IA e Modelos

### Transformers
- Usar `@lru_cache` para cache de pipelines (evitar recarregar modelos)
- Especificar `framework="pt"` para PyTorch
- Configurar `max_length` e `min_length` apropriados
- Usar `do_sample=False` para resultados determinísticos em resumos

### Performance
- Modelos são carregados uma vez e reutilizados
- Considerar limitação de tamanho de texto para análise
- Fornecer feedback ao usuário durante processamento longo

## Deployment

### Configuração
- Criar `.env` para configurações locais (não commitar)
- Documentar variáveis de ambiente no README
- Usar valores padrão que funcionem out-of-the-box

### Frontend Servido pelo Backend
- Arquivos estáticos montados via `StaticFiles`
- `index.html` servido na rota raiz
- Permitir override de `API_BASE_URL` para deploy separado

### Dependências
- Manter `requirements.txt` atualizado
- Documentar dependências opcionais (ex: `textract` para .doc)
- Especificar versões mínimas quando necessário

## Documentação

### README
- Instruções claras de instalação e execução
- Listar pré-requisitos (Python 3.10+, PyTorch)
- Documentar variáveis de ambiente
- Incluir exemplos de uso

### Código
- Comentar lógica complexa ou não-óbvia
- Explicar escolhas de design quando relevante
- Manter comentários atualizados com código