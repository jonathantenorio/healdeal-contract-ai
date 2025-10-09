# Contexto do Projeto

Este projeto é uma aplicação web de e-commerce desenvolvida em Python usando Django.
O sistema gerencia produtos, pedidos e pagamentos com integração aos serviços AWS.

## Arquitetura
- Backend: Django REST Framework
- Frontend: React.js
- Banco de dados: PostgreSQL
- Cloud: AWS (S3, Lambda, RDS)
- Containerização: Docker

## Padrões de Nomenclatura
- Classes: PascalCase (ex: ProductManager)
- Funções e variáveis: snake_case (ex: get_user_orders)
- Constantes: UPPER_SNAKE_CASE (ex: MAX_RETRY_ATTEMPTS)
- Arquivos: kebab-case (ex: user-profile.component.js)

## Estrutura de Pastas
- `/src/models/` - Modelos de dados
- `/src/services/` - Lógica de negócio
- `/src/api/` - Endpoints da API
- `/tests/` - Testes unitários e integração

---

**Nota:** Edite de acordo com o seu projeto.