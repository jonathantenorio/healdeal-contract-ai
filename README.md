# HealDeal Contract Analyzer

MVP de um aplicativo para gestão e revisão automática de contratos com modelos de IA open-source.

## Visão geral

- **Upload** de arquivos PDF, DOC e DOCX, com armazenamento seguro em disco.
- **Extração de texto** usando bibliotecas locais.
- **Análises automatizadas** com modelos open-source via `transformers` para gerar resumo executivo, revisão, identificação de falhas e sugestões de compliance.
- **API REST** construída com FastAPI + SQLite.
- **Interface web** responsiva e simples para acompanhar envios e consultar resultados.

## Arquitetura

```
backend/
  app/
    main.py              # Entrypoint da API FastAPI
    config.py            # Configuração e variáveis de ambiente
    database.py          # Engine SQLAlchemy + sessão
    models.py            # Modelo Contract
    schemas.py           # Esquemas Pydantic para respostas
    services/
      storage.py         # Persistência de arquivos
      document_processor.py  # Extração de texto de PDF/DOC/DOCX
      analyzer.py        # Pipelines de IA open-source com transformers
frontend/
  index.html             # Interface principal
  styles.css             # Estilos responsivos
  app.js                 # Lógica de interação com a API
```

## Como executar o backend

> Pré-requisitos: Python 3.10+, `pip` e acesso para instalar modelos open-source da Hugging Face. O PyTorch precisa ser instalado separadamente conforme sua plataforma (ex.: `pip install torch --index-url https://download.pytorch.org/whl/cpu`).

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

A interface web é servida pelo próprio backend em `http://localhost:8000/` e consome as APIs da mesma origem, pronta para ser publicada em qualquer servidor online que execute o Uvicorn (ex.: Render, Railway, Fly.io). Os arquivos enviados ficam em `storage/uploads/` e o banco SQLite em `contracts.db`.

Caso deseje hospedar o frontend separadamente (CDN, bucket estático, etc.), exponha os arquivos contidos em `frontend/` e defina `window.API_BASE_URL` para o endpoint público da API antes de carregar `app.js`.

## Personalização dos modelos de IA

Os modelos padrão são:

- Resumo: `sshleifer/distilbart-cnn-12-6`
- Revisão/ajustes: `google/flan-t5-small`

Configure outras opções criando um arquivo `.env` na raiz do backend com, por exemplo:

```
SUMMARY_MODEL=philschmid/bart-large-cnn-samsum
REVIEW_MODEL=google/flan-t5-base
```

Outras variáveis disponíveis estão documentadas em `backend/app/config.py`.

## Próximos passos sugeridos

- Adicionar autenticação e níveis de acesso.
- Criar fila de processamento assíncrono para lidar com contratos longos.
- Implementar histórico de versões e comparação entre contratos.
- Integrar com provedores de modelos locais (ex.: `llama.cpp`, `Ollama`) para cenários offline.
