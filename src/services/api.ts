import axios from 'axios';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'Jadiel' | 'Admin' | 'Atendente';
  meta_faturamento?: number;
}

export interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
  rg?: string;
  telefone_whatsapp?: string;
  puf: string;
  categoria_servico: string;
  valor_contrato: number;
  status_pagamento: string;
  status_caso: 'Triagem' | 'Protocolado' | 'Em Andamento' | 'Concluído';
  notas?: string;
  atendente_id?: number;
  data_cadastro?: string;
}

export interface Documento {
  id: number;
  cliente_id: number;
  nome_arquivo: string;
  tipo_arquivo: 'PDF' | 'IMG' | 'MP4' | 'AUDIO';
  mime_type: string;
  data_upload: string;
}

export interface Transacao {
  id: number;
  cliente_id?: number;
  descricao: string;
  valor: number;
  tipo: 'Entrada' | 'Saída';
  data_transacao: string;
  nome_cliente?: string;
}

export interface Stats {
  totalClientes: number;
  faturamento: number;
  saldo: number;
}

export interface DashboardAggregate {
  area: { name: string; value: number }[];
  status: { name: string; value: number }[];
}

export interface LogAtividade {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  tabela_afetada: string;
  dados_antigos?: any;
  dados_novos?: any;
  data_hora: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor para adicionar o Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- CLIENTES ---
export const getClientes = async (search = ''): Promise<Cliente[]> => {
  const response = await api.get('/clientes', { params: { search } });
  return response.data;
};

export const createCliente = async (data: Partial<Cliente>): Promise<Cliente> => {
  const response = await api.post('/clientes', data);
  return response.data;
};

export const updateCliente = async (id: number, data: Partial<Cliente>): Promise<Cliente> => {
  const response = await api.put(`/clientes/${id}`, data);
  return response.data;
};

export const deleteCliente = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};

// --- DOCUMENTOS ---
export const getDocumentos = async (clienteId: number): Promise<Documento[]> => {
  const response = await api.get(`/documentos/${clienteId}`);
  return response.data;
};

export const uploadDocumento = async (clienteId: number, file: File): Promise<Documento> => {
  const formData = new FormData();
  formData.append('arquivo', file);
  const response = await api.post(`/upload/${clienteId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteDocumento = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/documentos/${id}`);
  return response.data;
};

export const getDocumentoUrl = (id: number) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/documentos/download/${id}`;
};

// --- FINANCEIRO ---
export const getTransacoes = async (): Promise<Transacao[]> => {
  const response = await api.get('/transacoes');
  return response.data;
};

export const createTransacao = async (data: Partial<Transacao>): Promise<Transacao> => {
  const response = await api.post('/transacoes', data);
  return response.data;
};

// --- DASHBOARD & LOGS ---
export const getStats = async (): Promise<Stats> => {
  const response = await api.get('/stats');
  return response.data;
};

export const getDashboardAggregate = async (): Promise<DashboardAggregate> => {
    const response = await api.get('/dashboard/aggregate');
    return response.data;
};

export const getLogs = async (): Promise<LogAtividade[]> => {
  const response = await api.get('/logs');
  return response.data;
};

export const undoLog = async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/logs/undo/${id}`);
    return response.data;
};

// --- AUTH ---
export const loginUsuario = async (credentials: any): Promise<{ token: string; user: Usuario }> => {
  const response = await api.post('/login', credentials);
  return response.data;
};

// --- USUÁRIOS (ADMIN) ---
export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const createUsuario = async (data: Partial<Usuario>): Promise<Usuario> => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: number, data: Partial<Usuario>): Promise<{ success: boolean }> => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};

export default api;

