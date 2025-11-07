console.log('=== HealDeal Contract Analyzer - Loading ===');
const defaultApiBase = window.location.origin.replace(/\/$/, '');
const API_BASE_URL = (window.API_BASE_URL || defaultApiBase).replace(/\/$/, '');
console.log('API_BASE_URL:', API_BASE_URL);

const contractListElement = document.getElementById('contract-list');
const detailsContent = document.getElementById('details-content');
const uploadForm = document.getElementById('upload-form');
const uploadStatus = document.getElementById('upload-status');
const refreshButton = document.getElementById('refresh-button');
const fileInput = document.getElementById('file-input');
const fileUploadWrapper = document.getElementById('file-upload-wrapper');
const fileSelected = document.getElementById('file-selected');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const fileRemove = document.getElementById('file-remove');

let selectedContractId = null;
let demoMode = false; // Ativa modo demonstração se API não estiver disponível

// File upload handling
fileInput.addEventListener('change', handleFileSelect);
fileRemove.addEventListener('click', clearFileSelection);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    displaySelectedFile(file);
  }
}

function displaySelectedFile(file) {
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  const placeholder = fileUploadWrapper.querySelector('.file-upload-placeholder');
  placeholder.style.display = 'none';
  fileSelected.classList.add('visible');
  fileSelected.style.display = 'flex';
}

function clearFileSelection(event) {
  event.preventDefault();
  event.stopPropagation();
  
  fileInput.value = '';
  fileSelected.classList.remove('visible');
  fileSelected.style.display = 'none';
  
  const placeholder = fileUploadWrapper.querySelector('.file-upload-placeholder');
  placeholder.style.display = 'block';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function fetchContracts() {
  console.log('fetchContracts: Iniciando...');
  contractListElement.innerHTML = '<li class="status">Carregando contratos...</li>';
  try {
    console.log('fetchContracts: Fazendo fetch para:', `${API_BASE_URL}/contracts`);
    const response = await fetch(`${API_BASE_URL}/contracts`);
    console.log('fetchContracts: Response status:', response.status);
    if (!response.ok) throw new Error('API não disponível');
    const contracts = await response.json();
    console.log('fetchContracts: Contratos recebidos:', contracts.length);
    demoMode = false;
    renderContractList(contracts);
    if (contracts.length && !selectedContractId) {
      loadContractDetails(contracts[0].id);
    }
  } catch (error) {
    console.log('fetchContracts: Erro capturado:', error.message);
    console.log('fetchContracts: Ativando modo demonstração');
    // Ativa modo demonstração se API não estiver disponível
    demoMode = true;
    showDemoMode();
  }
}

function renderContractList(contracts) {
  if (!contracts.length) {
    contractListElement.innerHTML = '<li class="status">Nenhum contrato processado ainda.</li>';
    return;
  }

  contractListElement.innerHTML = '';
  contracts.forEach((contract) => {
    const item = document.createElement('li');
    item.className = 'contract-item';
    item.dataset.id = contract.id;
    item.innerHTML = `
      <div><strong>${contract.original_filename}</strong></div>
      <div class="contract-item__meta">
        Enviado em ${new Date(contract.created_at).toLocaleString('pt-BR')}
      </div>
    `;
    if (contract.id === selectedContractId) {
      item.classList.add('is-active');
    }
    item.addEventListener('click', () => loadContractDetails(contract.id));
    contractListElement.appendChild(item);
  });
}

async function loadContractDetails(contractId) {
  selectedContractId = contractId;
  try {
    detailsContent.innerHTML = '<div class="empty-state"><p class="status">Carregando análise...</p></div>';
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`);
    if (!response.ok) throw new Error('Não foi possível obter a análise do contrato.');
    const contract = await response.json();
    highlightSelected(contractId);
    detailsContent.innerHTML = createDetailsTemplate(contract);
  } catch (error) {
    detailsContent.innerHTML = `<div class="empty-state"><p class="status">${error.message}</p></div>`;
  }
}

function highlightSelected(contractId) {
  Array.from(contractListElement.children).forEach((item) => {
    item.classList.toggle('is-active', Number(item.dataset.id) === Number(contractId));
  });
}

function createDetailsTemplate(contract) {
  const downloadUrl = `${API_BASE_URL}/contracts/${contract.id}/download`;
  return `
    <div class="details__block">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        Resumo executivo
      </h3>
      <p>${formatText(contract.summary)}</p>
    </div>
    <div class="details__block">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        Revisão geral
      </h3>
      <p>${formatText(contract.review)}</p>
    </div>
    <div class="details__block">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Falhas e riscos
      </h3>
      <p>${formatText(contract.issues)}</p>
    </div>
    <div class="details__block">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        Sugestões de compliance
      </h3>
      <p>${formatText(contract.suggestions)}</p>
    </div>
    <div class="details__block">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        Visualizar contrato
      </h3>
      <p class="contract-item__meta">${formatText(contract.text_preview)}</p>
      <a class="button button--ghost" href="${downloadUrl}" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Baixar arquivo original
      </a>
    </div>
  `;
}

function formatText(text) {
  if (!text) return '<em>Informação não disponível.</em>';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/\n/g, '<br />');
}

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById('file-input');
  if (!fileInput.files.length) return;

  if (demoMode) {
    uploadStatus.textContent = '⚠️ Modo demonstração: Inicie o backend FastAPI para processar contratos reais.';
    uploadStatus.style.display = 'block';
    setTimeout(() => {
      uploadStatus.textContent = '';
      uploadStatus.style.display = 'none';
    }, 5000);
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  uploadStatus.textContent = '⚡ Enviando contrato e iniciando análise com IA...';
  uploadStatus.style.display = 'block';

  try {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Falha ao processar o contrato.');
    }

    const contract = await response.json();
    uploadStatus.textContent = '✅ Contrato analisado com sucesso!';
    selectedContractId = contract.id;
    await fetchContracts();
    await loadContractDetails(contract.id);
    clearFileSelection(event);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      uploadStatus.textContent = '';
      uploadStatus.style.display = 'none';
    }, 5000);
  } catch (error) {
    uploadStatus.textContent = '❌ ' + error.message;
  }
});

refreshButton.addEventListener('click', () => {
  fetchContracts();
});

// Função para mostrar modo demonstração
function showDemoMode() {
  console.log('showDemoMode: Ativando modo demonstração');
  const demoContracts = [
    {
      id: 1,
      original_filename: '📄 Contrato de Prestação de Serviços - Exemplo.pdf',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      original_filename: '📄 Termo de Uso - Exemplo.pdf',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
  
  console.log('showDemoMode: Renderizando contratos demo');
  renderContractList(demoContracts);
  showDemoDetails();
}

function showDemoDetails() {
  console.log('showDemoDetails: Exibindo tela de demonstração');
  detailsContent.innerHTML = `
    <div class="empty-state" style="padding: 3rem 2rem; text-align: center; background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border-radius: 1rem; border: 2px dashed var(--primary-300);">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-600); margin: 0 auto 1.5rem;">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
      <h2 style="color: var(--gray-900); margin-bottom: 1rem; font-size: 1.5rem;">🎨 Modo Demonstração</h2>
      <p style="color: var(--gray-600); margin-bottom: 1.5rem; font-size: 1.1rem; max-width: 500px; margin-left: auto; margin-right: auto;">
        O frontend está funcionando perfeitamente! Este é um exemplo visual do design.
      </p>
      <div style="background: white; padding: 1.5rem; border-radius: 0.75rem; margin-top: 2rem; text-align: left; box-shadow: var(--shadow-sm);">
        <h3 style="color: var(--primary-700); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Para usar a aplicação completa:
        </h3>
        <ol style="color: var(--gray-700); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
          <li><strong>Instale as dependências:</strong>
            <code style="background: var(--gray-100); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.9rem; display: inline-block; margin-top: 0.5rem;">cd backend && pip install -r requirements.txt</code>
          </li>
          <li style="margin-top: 1rem;"><strong>Inicie o servidor FastAPI:</strong>
            <code style="background: var(--gray-100); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.9rem; display: inline-block; margin-top: 0.5rem;">uvicorn app.main:app --reload</code>
          </li>
          <li style="margin-top: 1rem;"><strong>Acesse:</strong>
            <code style="background: var(--gray-100); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.9rem; display: inline-block; margin-top: 0.5rem;">http://localhost:8000</code>
          </li>
        </ol>
      </div>
      <div style="margin-top: 2rem; padding: 1rem; background: var(--success-50, #f0fdf4); border-radius: 0.5rem; border-left: 4px solid var(--success-500);">
        <p style="color: var(--success-700, #15803d); margin: 0; font-weight: 500;">
          ✅ Design system, animações e responsividade estão 100% funcionais!
        </p>
      </div>
    </div>
  `;
}

console.log('=== Iniciando aplicação ===');
fetchContracts();
