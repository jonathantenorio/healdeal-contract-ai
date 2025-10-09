# Regras de Codificação e Segurança

## Segurança AWS
- Todos os buckets Amazon S3 devem ter criptografia habilitada, SSL obrigatório e acesso público bloqueado
- Todas as tabelas Amazon DynamoDB devem ter criptografia habilitada
- Todos os tópicos Amazon SNS devem ter criptografia habilitada e SSL obrigatório
- Todas as filas Amazon SQS devem ter SSL obrigatório

## Padrões de Código Python
- Todo código Python deve usar type hints obrigatoriamente
- Funções devem ter docstrings seguindo o padrão Google
- Máximo de 80 caracteres por linha
- Usar f-strings para formatação de strings
- Implementar tratamento de exceções adequado

## Padrões de Código JavaScript/React
- Usar TypeScript em todos os componentes React
- Componentes funcionais com hooks ao invés de classes
- Props devem ser tipadas com interfaces
- Usar async/await ao invés de .then() para promises

## Testes
- Cobertura mínima de 80% para código novo
- Testes unitários obrigatórios para todas as funções públicas
- Testes de integração para endpoints da API
- Usar mocks para dependências externas

## Documentação
- README.md atualizado com instruções de setup
- Comentários em código complexo ou algoritmos específicos
- Documentação da API usando OpenAPI/Swagger

---

**Nota:** Edite de acordo com o seu projeto.