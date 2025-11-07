# Contexto do Projeto

Este projeto é o **HealDeal Contract Analyzer**, um MVP de aplicativo web para gestão e revisão automática de contratos usando modelos de IA open-source.

## Visão Geral

O sistema permite que usuários façam upload de contratos em formatos PDF, DOC e DOCX, e recebam análises automáticas geradas por modelos de IA open-source executados localmente, incluindo:
- Resumo executivo do contrato
- Revisão geral com identificação de pontos fortes, riscos e ambiguidades
- Identificação de falhas, lacunas e cláusulas ausentes
- Sugestões de alterações para compliance e redução de riscos

## Arquitetura
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla (servido pelo FastAPI)
- **Banco de dados**: SQLite (SQLAlchemy ORM)
- **Armazenamento**: Sistema de arquivos local (`storage/uploads/`)
- **IA**: Modelos open-source via Hugging Face Transformers
  - Resumo: `sshleifer/distilbart-cnn-12-6`
  - Revisão/Análise: `google/flan-t5-small`
- **Deployment**: Single endpoint online (Render, Railway, Fly.io, etc.)

## Padrões de Nomenclatura
- Classes: PascalCase (ex: ContractAnalyzer)
- Funções e variáveis: snake_case (ex: extract_text, get_analyzer)
- Constantes: UPPER_SNAKE_CASE (ex: MAX_SUMMARY_TOKENS)
- Arquivos Python: snake_case (ex: document_processor.py)
- Arquivos frontend: kebab-case (ex: styles.css, app.js)

## Estrutura de Pastas
```
backend/
  app/
    main.py              # Entrypoint FastAPI + rotas
    config.py            # Configuração via Pydantic BaseSettings
    database.py          # SQLAlchemy engine + sessão
    models.py            # Modelo Contract (ORM)
    schemas.py           # Schemas Pydantic para validação
    services/
      storage.py         # Persistência de arquivos
      document_processor.py  # Extração de texto (PDF/DOC/DOCX)
      analyzer.py        # Análise com modelos de IA
frontend/
  index.html             # Interface web principal
  styles.css             # Estilos responsivos
  app.js                 # Lógica de interação com API
```

## Princípios do Projeto
- **Privacy-first**: Dados e modelos executados localmente
- **Open-source**: Uso exclusivo de modelos open-source via Transformers
- **Single endpoint**: Frontend servido pelo próprio backend para simplicidade de deploy
- **Simplicidade**: MVP funcional sem complexidade desnecessária
- **Offline-capable**: Modelos podem ser executados sem conexão (após download inicial)