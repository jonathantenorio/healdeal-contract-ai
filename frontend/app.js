const defaultApiBase = window.location.origin.replace(/\/$/, '');
const API_BASE_URL = (window.API_BASE_URL || defaultApiBase).replace(/\/$/, '');

const contractListElement = document.getElementById('contract-list');
const detailsContent = document.getElementById('details-content');
const uploadForm = document.getElementById('upload-form');
const uploadStatus = document.getElementById('upload-status');
const refreshButton = document.getElementById('refresh-button');

let selectedContractId = null;

async function fetchContracts() {
  contractListElement.innerHTML = '<li>Carregando contratos...</li>';
  try {
    const response = await fetch(`${API_BASE_URL}/contracts`);
    if (!response.ok) throw new Error('Falha ao carregar a lista de contratos');
    const contracts = await response.json();
    renderContractList(contracts);
    if (contracts.length && !selectedContractId) {
      loadContractDetails(contracts[0].id);
    }
  } catch (error) {
    contractListElement.innerHTML = `<li class="status">${error.message}</li>`;
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
    detailsContent.innerHTML = '<p class="status">Carregando análise...</p>';
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`);
    if (!response.ok) throw new Error('Não foi possível obter a análise do contrato.');
    const contract = await response.json();
    highlightSelected(contractId);
    detailsContent.innerHTML = createDetailsTemplate(contract);
  } catch (error) {
    detailsContent.innerHTML = `<p class="status">${error.message}</p>`;
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
      <h3>Resumo executivo</h3>
      <p>${formatText(contract.summary)}</p>
    </div>
    <div class="details__block">
      <h3>Revisão geral</h3>
      <p>${formatText(contract.review)}</p>
    </div>
    <div class="details__block">
      <h3>Falhas e riscos</h3>
      <p>${formatText(contract.issues)}</p>
    </div>
    <div class="details__block">
      <h3>Sugestões de compliance</h3>
      <p>${formatText(contract.suggestions)}</p>
    </div>
    <div class="details__block">
      <h3>Visualizar contrato</h3>
      <p class="contract-item__meta">${formatText(contract.text_preview)}</p>
      <a class="button button--ghost" href="${downloadUrl}" target="_blank" rel="noopener">
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

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  uploadStatus.textContent = 'Enviando contrato e iniciando análise...';

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
    uploadStatus.textContent = 'Contrato analisado com sucesso!';
    selectedContractId = contract.id;
    await fetchContracts();
    await loadContractDetails(contract.id);
    fileInput.value = '';
  } catch (error) {
    uploadStatus.textContent = error.message;
  }
});

refreshButton.addEventListener('click', () => {
  fetchContracts();
});

fetchContracts();
