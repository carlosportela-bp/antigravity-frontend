import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, DollarSign, Settings, LogOut, 
  Search, Plus, Eye, Edit, Trash2, Sun, Moon, Menu, X, 
  FileText, Video, ShieldCheck, History, TrendingUp, 
  ArrowUpRight, ArrowDownRight, ClipboardList, UserPlus, 
  Key, ShieldAlert, Save, RefreshCw, Upload,
  Image as ImageIcon, File, ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';

// --- SERVIÇOS REAIS ---
import { 
  getClientes, createCliente, updateCliente, deleteCliente, 
  uploadDocumento, getDocumentos, getLogs, loginUsuario, 
  getStats, getTransacoes, createTransacao, deleteDocumento,
  getUsuarios, createUsuario, updateUsuario, deleteUsuario,
  getDashboardAggregate, getDocumentoUrl, undoLog,
  Cliente, Usuario, Transacao, Stats, LogAtividade, Documento, DashboardAggregate,
  default as api
} from '../services/api';

// --- CONFIGURAÇÃO DE ÁREAS ---
const LEGAL_AREAS = ['Cível', 'Trabalhista', 'Família', 'Consumidor', 'Criminal', 'Previdenciário'];

// --- COMPONENTES MODERNOS (ESTILOS DO USUÁRIO) ---

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`skeleton ${className}`} />
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-300 ${className}`}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'blue' | 'amber' | 'danger' | 'outline' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-slate-900 shadow-md shadow-blue-500/10 dark:shadow-amber-500/10",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    amber: "bg-amber-400 hover:bg-amber-500 text-slate-900",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
  };

  return (
    <button 
      className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface BadgeProps {
  variant?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const styles: Record<string, string> = {
    jadiel: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-400 border border-blue-200 dark:border-blue-400/20",
    staff: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    Ativo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    Pendente: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    'Em dia': "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    'Inadimplente': "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };
  const childrenStr = typeof children === 'string' ? children : '';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${styles[variant || ''] || styles[childrenStr] || styles.staff}`}>
      {children}
    </span>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
  label?: string;
}

const Input: React.FC<InputProps> = ({ icon: Icon, label, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-amber-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input 
        className={`w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 ${Icon ? 'pl-11' : 'px-4'} pr-4 focus:ring-4 focus:ring-blue-600/10 dark:focus:ring-amber-400/10 focus:border-blue-600 dark:focus:border-amber-400 outline-none transition-all dark:text-white placeholder:text-slate-400 font-medium`}
        {...props}
      />
    </div>
  </div>
);

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,fontFamily:'monospace',background:'#0f172a',color:'#f87171',minHeight:'100vh'}}>
          <h1 style={{fontSize:24,marginBottom:16,color:'#fbbf24'}}>⚠ Erro de Runtime</h1>
          <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',background:'#1e293b',padding:20,borderRadius:12,fontSize:13}}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- MODAIS ---

interface ClientModalProps {
  onClose: () => void;
  onAdd: () => void;
  pufLabel: string;
}

const ClientModal: React.FC<ClientModalProps> = ({ onClose, onAdd, pufLabel }) => {
  const [formData, setFormData] = useState({
    nome_completo: '', cpf: '', rg: '', telefone_whatsapp: '', puf: '',
    categoria_servico: 'Cível', valor_contrato: 0, status_pagamento: 'Em dia', status_caso: 'Triagem', notas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCliente(formData as any);
      toast.success('Registo concluído com sucesso');
      onAdd();
      onClose();
    } catch (err) { toast.error('Falha no registo'); }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"><X/></button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <UserPlus className="text-blue-600 dark:text-amber-400" /> Novo Registo Jurídico
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome Completo" value={formData.nome_completo} onChange={e => setFormData({...formData, nome_completo: e.target.value})} required />
            <Input label="CPF" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone / WhatsApp" value={formData.telefone_whatsapp} onChange={e => setFormData({...formData, telefone_whatsapp: e.target.value})} />
            <div className="space-y-1.5">
               <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Área de Atuação</label>
               <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all dark:text-white" value={formData.categoria_servico} onChange={e => setFormData({...formData, categoria_servico: e.target.value})}>
                  {LEGAL_AREAS.map(a => <option key={a} value={a} className="bg-white dark:bg-slate-900">{a}</option>)}
               </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={pufLabel} value={formData.puf} onChange={e => setFormData({...formData, puf: e.target.value})} />
            <div className="space-y-1.5">
               <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estado do Caso</label>
               <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all dark:text-white" value={formData.status_caso} onChange={e => setFormData({...formData, status_caso: e.target.value as any})}>
                  <option value="Triagem">Triagem</option>
                  <option value="Protocolado">Protocolado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
               </select>
            </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notas / Observações</label>
             <textarea className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all dark:text-white min-h-[100px]" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">Confirmar Registo</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface UserModalProps {
  user: Usuario | null;
  onClose: () => void;
  onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Usuario>>(user?.id ? { ...user } : { nome: '', email: '', perfil: 'Atendente', meta_faturamento: 0 });
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user?.id) await updateUsuario(user.id, formData);
      else await createUsuario({ ...formData, senha } as any);
      toast.success('Usuário sincronizado');
      onSave();
      onClose();
    } catch (err) { toast.error('Erro ao salvar usuário'); }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-all"><X/></button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Configurar Acesso</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="NOME" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
          <Input label="EMAIL" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          {!user?.id && <Input label="SENHA INICIAL" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />}
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PERFIL DE ACESSO</label>
             <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 dark:text-white font-bold" value={formData.perfil} onChange={e => setFormData({...formData, perfil: e.target.value as any})}>
                <option value="Jadiel">Jadiel (Dono)</option>
                <option value="Admin">Administrador</option>
                <option value="Atendente">Atendente (Staff)</option>
             </select>
          </div>
          <Input label="META DE FATURAMENTO (R$)" type="number" value={formData.meta_faturamento} onChange={e => setFormData({...formData, meta_faturamento: parseFloat(e.target.value)})} />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">Salvar</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


interface ClientEditModalProps {
  client: Cliente;
  onClose: () => void;
  onUpdate: () => void;
  pufLabel: string;
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({ client, onClose, onUpdate, pufLabel }) => {
  const [formData, setFormData] = useState({ ...client });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Coerção manual no frontend também para segurança extra
      const payload = {
        ...formData,
        valor_contrato: Number(formData.valor_contrato)
      };
      await updateCliente(client.id, payload);
      toast.success('Perfil jurídico atualizado');
      onUpdate();
      onClose();
    } catch (err) { toast.error('Falha na atualização'); }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl relative border border-slate-200 dark:border-slate-800">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-red-500 transition-all hover:rotate-90"><X/></button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
          <Edit className="text-blue-600 dark:text-amber-400" /> Editar Registo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="NOME COMPLETO" value={formData.nome_completo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, nome_completo: e.target.value})} />
          <div className="grid grid-cols-2 gap-6">
             <Input label="CPF" value={formData.cpf} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, cpf: e.target.value})} />
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest">ESTADO FINANCEIRO</label>
               <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all dark:text-white font-bold" value={formData.status_pagamento || 'Em dia'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status_pagamento: e.target.value})}>
                  <option value="Em dia" className="dark:bg-slate-900">Em dia</option>
                  <option value="Inadimplente" className="dark:bg-slate-900">Inadimplente</option>
               </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label={pufLabel?.toUpperCase()} value={formData.puf} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, puf: e.target.value})} />
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest">ESTADO DO CASO</label>
               <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all dark:text-white font-bold" value={formData.status_caso} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status_caso: e.target.value as any})}>
                  <option value="Triagem">Triagem</option>
                  <option value="Protocolado">Protocolado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
               </select>
            </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest">NOTAS DO CASO</label>
             <textarea className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all dark:text-white min-h-[120px] font-medium" value={formData.notas} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, notas: e.target.value})} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Descartar</Button>
            <Button type="submit" variant="primary" className="flex-1">Sincronizar Alterações</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface TransactionModalProps {
  clients: Cliente[];
  onClose: () => void;
  onSave: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ clients, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cliente_id: '',
    descricao: '',
    valor: '',
    tipo: 'Entrada'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.descricao || !formData.valor) throw new Error('Preencha os campos obrigatórios.');
      
      const payload: Partial<Transacao> = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo as 'Entrada' | 'Saída'
      };
      if (formData.cliente_id) payload.cliente_id = parseInt(formData.cliente_id);

      await createTransacao(payload);
      toast.success('Movimentação lançada com sucesso!');
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao lançar movimentação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><DollarSign className="text-blue-500" /> Lançar Movimento</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tipo</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-bold" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                <option value="Entrada">Entrada (Receita)</option>
                <option value="Saída">Saída (Despesa)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
              <input type="number" step="0.01" required className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-bold" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
            <input type="text" required className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Honorários Iniciais, Material de Escritório..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Vincular Cliente (Opcional)</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})}>
              <option value="">Nenhum (Movimentação Geral)</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nome_completo}</option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Registrar'}</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
// --- VIEWS ---

interface FilePreviewModalProps {
  id: number;
  nome: string;
  tipo: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ id, nome, tipo, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchFile = async () => {
      try {
        setLoading(true);
        // Usar api para enviar o token JWT nos cabeçalhos
        const response = await api.get(`/documentos/download/${id}`, { responseType: 'blob' });
        if (active) {
          const url = URL.createObjectURL(response.data);
          setBlobUrl(url);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.error || 'Erro ao carregar ficheiro');
          setLoading(false);
        }
      }
    };

    fetchFile();
    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  const closeWithCleanup = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-amber-400/20 text-blue-600 dark:text-amber-400 rounded-lg">
                {tipo === 'PDF' ? <FileText size={20} /> : tipo === 'MP4' ? <Video size={20} /> : <ImageIcon size={20} />}
             </div>
             <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-md">{nome}</span>
          </div>
          <button onClick={closeWithCleanup} className="p-2 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"><X /></button>
        </div>
        
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-blue-600 dark:text-amber-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
               <RefreshCw size={48} className="animate-spin" />
               <p className="font-bold uppercase tracking-widest text-xs">Autenticando e Descarregando...</p>
            </div>
          )}

          {error && (
            <div className="text-center space-y-4">
               <ShieldAlert size={48} className="mx-auto text-red-500" />
               <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
               <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-white rounded-xl font-bold">Fechar</button>
            </div>
          )}

          {!loading && !error && blobUrl && (
            <>
              {tipo === 'IMG' && <img src={blobUrl} alt={nome} className="max-w-full max-h-full object-contain" />}
              {tipo === 'MP4' && <video src={blobUrl} controls className="max-w-full max-h-full" />}
              {tipo === 'PDF' && <iframe src={blobUrl} className="w-full h-full border-none" title={nome} />}
              {tipo === 'AUDIO' && <audio src={blobUrl} controls className="w-full max-w-md" />}
              {!['IMG', 'MP4', 'PDF', 'AUDIO'].includes(tipo) && (
                <div className="text-center space-y-4">
                   <ShieldAlert size={48} className="mx-auto text-amber-500" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pré-visualização não suportada para este formato</p>
                   <a href={blobUrl} download={nome} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Descarregar Arquivo</a>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface DashboardViewProps {
  user: any;
  stats: Stats | null;
  aggregate: DashboardAggregate | null;
  transactions: Transacao[];
  clients: Cliente[];
  systemUsers: Usuario[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, stats, aggregate, transactions, clients, systemUsers }) => {
  // Chart data from REAL aggregate
  const profitability = aggregate?.area || [];
  const caseFlow = aggregate?.status || [];
  
  const historicalRevenue = React.useMemo(() => {
    const months: Record<string, number> = {};
    (transactions || []).forEach(t => {
      if (t.tipo === 'Entrada') {
        const m = new Date(t.data_transacao).toLocaleDateString('pt-BR', { month: 'short' });
        months[m] = (months[m] || 0) + parseFloat(String(t.valor || '0'));
      }
    });
    return Object.entries(months).slice(-6).map(([name, receita]) => ({ name, receita }));
  }, [transactions]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { label: 'Total de Clientes', value: stats?.totalClientes || 0, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50' },
          ...(user.role !== 'staff' ? [
            { label: 'Faturamento', value: `R$ ${stats?.faturamento?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Saldo Atual', value: `R$ ${stats?.saldo?.toLocaleString() || 0}`, icon: ShieldCheck, color: 'text-indigo-500 dark:text-blue-400', bg: 'bg-indigo-50' }
          ] : [])
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center justify-between border-none shadow-sm group hover:shadow-md transition-all">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold dark:text-white mt-1">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} dark:bg-slate-800 ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon size={24} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-none shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest text-slate-400">Receita por Área de Atuação</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitability}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                contentStyle={{
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc'
                }} 
              />
                <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={60}>
                   {profitability.map((_entry, index) => (
                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563EB' : '#3B82F6'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest text-slate-400">Fluxo de Casos</h3>
          <div className="h-[300px]">
            <AreaChart data={caseFlow} width={300} height={300}>
                <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#3B82F6' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
            </AreaChart>
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-sm flex flex-col gap-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
         <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Desempenho vs Metas</h4>
            <Badge variant="staff">Ciclo Mensal</Badge>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(systemUsers || [])
              .filter((u: any) => user.role === 'admin' ? (u.perfil === 'Atendente' || u.perfil === 'Admin') : u.id === user.id)
              .map((u: any) => (
              <div key={u.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                     <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-tighter">{u.nome}</span>
                     <span className="text-[10px] font-black text-blue-600 dark:text-amber-400">Objetivo: R$ {parseFloat(String(u.meta_faturamento || 0)).toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                     {/* FAKE PROGRESS FOR NOW, IN THE FUTURE THIS SHOULD BE REAL */}
                     <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(10, Math.random() * 100))}%` }} className="h-full bg-blue-600 dark:bg-amber-400" />
                  </div>
              </div>
            ))}
         </div>
      </Card>
    </div>
  );
};

interface ClientDetailsViewProps {
  client: Cliente;
  onBack: () => void;
  pufLabel: string;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client, onBack, pufLabel }) => {
  const [activeTab, setActiveTab] = useState('docs');
  const [docs, setDocs] = useState<Documento[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Documento | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getDocumentos(client.id).then(setDocs);
  }, [client.id]);

  const handleRefreshDocs = () => getDocumentos(client.id).then(setDocs);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
        for (const f of Array.from(files)) await uploadDocumento(client.id, f);
        toast.success('Ficheiros anexados'); 
        await handleRefreshDocs();
    } catch (e) { 
        toast.error('Falha no upload'); 
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ChevronLeft size={20} /> Voltar à Lista
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}><Edit size={18} /> Editar Perfil</Button>
          <label className="cursor-pointer">
              <div className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-slate-900 shadow-md px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95">
                  <Upload size={18} /> Novo Documento
                  <input type="file" className="hidden" multiple onChange={(e) => handleFiles(e.target.files)} />
              </div>
          </label>
        </div>
      </div>

      <AnimatePresence>
          {isEditModalOpen && (
              <ClientEditModal 
                client={client} 
                onClose={() => setIsEditModalOpen(false)} 
                onUpdate={() => { 
                   onBack(); 
                   fetchData(); 
                   toast.success('Perfil atualizado com sucesso'); 
                }} 
                pufLabel={pufLabel} 
              />
          )}
          {previewDoc && (
              <FilePreviewModal 
                id={previewDoc.id} 
                nome={previewDoc.nome_arquivo} 
                tipo={previewDoc.tipo_arquivo} 
                onClose={() => setPreviewDoc(null)} 
              />
          )}
      </AnimatePresence>

      <div 
        className="relative"
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false); }}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
      >
        <AnimatePresence>
            {dragActive && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-blue-600/10 dark:bg-amber-400/10 backdrop-blur-sm rounded-3xl border-4 border-dashed border-blue-600 dark:border-amber-400 flex flex-col items-center justify-center gap-4 text-blue-600 dark:text-amber-400"
                >
                    <Upload size={64} className="animate-bounce" />
                    <p className="text-2xl font-black uppercase tracking-widest">Solte os ficheiros aqui</p>
                </motion.div>
            )}
        </AnimatePresence>

        <Card className="p-8 border-none shadow-sm" layout>
          <motion.div className="flex items-start justify-between mb-8" layout>
            <motion.div layout>
              <Badge variant={client.categoria_servico}>{client.categoria_servico}</Badge>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{client.nome_completo}</h1>
              <p className="text-slate-500 mt-1 font-medium italic">CPF: {client.cpf || 'Não informado'}</p>
            </motion.div>
            <motion.div 
              layout
              className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-amber-400 flex items-center justify-center font-black text-2xl shadow-inner border border-blue-100 dark:border-blue-500/30"
            >
              {client.nome_completo.charAt(0)}
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest">{pufLabel}</label>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                {client.puf || "Nenhum protocolo registado."}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest">Estado Financeiro</label>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${client.status_pagamento === 'Em dia' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">{client.status_pagamento}</span>
              </div>
            </div>
          </div>
          
          {client.notas && (
            <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 italic">"{client.notas}"</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden mt-6">
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button 
            className={`px-8 py-5 text-sm font-bold transition-all ${activeTab === 'docs' ? 'text-blue-600 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-400 bg-blue-50/50 dark:bg-amber-400/5' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setActiveTab('docs')}
          >
            Repositório Digital
          </button>
          <button 
            className={`px-8 py-5 text-sm font-bold transition-all ${activeTab === 'info' ? 'text-blue-600 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-400 bg-blue-50/50 dark:bg-amber-400/5' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setActiveTab('info')}
          >
            Dados Contratuais
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'docs' ? (
            <div
              className="overflow-x-auto"
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
            >
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Ficheiro</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isUploading && (
                    <tr className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <Skeleton className="w-48 h-4 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Skeleton className="w-20 h-8 rounded-xl ml-auto" />
                      </td>
                    </tr>
                  )}
                  {docs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${doc.tipo_arquivo === 'PDF' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>
                            {doc.tipo_arquivo === 'PDF' ? <FileText size={18} /> : <Video size={18} />}
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{doc.nome_arquivo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                        <button 
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 transition-all"
                        >
                            <Eye size={18} />
                        </button>
                        <button onClick={async () => { if(confirm('Eliminar arquivo?')) { await deleteDocumento(doc.id); handleRefreshDocs(); } }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {docs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Upload size={32} />
                          <span className="text-xs font-bold uppercase tracking-widest">Arraste arquivos aqui ou clique em "Novo Documento"</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 space-y-4">
               <div className="grid grid-cols-3 gap-6">
                   <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valor Contrato</p>
                       <p className="text-xl font-black text-slate-700 dark:text-white">R$ {parseFloat(String(client.valor_contrato || '0')).toLocaleString()}</p>
                   </div>
               </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

interface FinanceViewProps {
  transactions: Transacao[];
  stats: Stats | null;
  systemUsers: Usuario[];
  clients: Cliente[];
  user: any;
  onAddTransaction: () => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ transactions, stats, systemUsers = [], clients = [], user, onAddTransaction }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <DollarSign className="text-blue-500" /> Fluxo Financeiro e Metas
      </h2>
      <Button variant="primary" onClick={onAddTransaction} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"><Plus size={18} /> Lançar Movimento</Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6 border-none shadow-sm h-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest text-slate-400">Últimas Transações</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.data_transacao).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{t.descricao}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase">{t.nome_cliente || 'Honorário Geral'}</p>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${t.tipo === 'Entrada' ? 'text-blue-500' : 'text-red-500'}`}>
                      {t.tipo === 'Entrada' ? '+' : '-'} R$ {parseFloat(String(t.valor)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-6 flex flex-col">
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex-1 flex flex-col min-h-[300px]">
           <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-blue-200" size={24} />
                    <h3 className="font-black uppercase tracking-widest text-sm text-blue-50">Desempenho da Equipe</h3>
                </div>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-2 opacity-80">Baseado em Contratos Fechados</p>
           </div>
           
           <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
               {systemUsers
                   .filter((u) => user?.role === 'admin' || user?.role === 'jadiel' ? (u.perfil === 'Atendente' || u.perfil === 'Admin' || u.perfil === 'Jadiel') : u.id === user?.id)
                   .map((u) => {
                       const userClients = clients.filter((c) => c.atendente_id === u.id);
                       const totalFechado = userClients.reduce((acc: number, c) => acc + parseFloat(String(c.valor_contrato || '0')), 0);
                       const meta = parseFloat(String(u.meta_faturamento || 0));
                       const progress = meta > 0 ? Math.min(100, (totalFechado / meta) * 100) : (totalFechado > 0 ? 100 : 0);

                       return (
                           <div key={u.id} className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-md">
                               <div className="flex justify-between items-end mb-2">
                                   <span className="font-bold text-white uppercase text-xs tracking-tighter">{u.nome}</span>
                                   <div className="text-right">
                                       <span className="text-[10px] font-black text-blue-200 block">Fechado: R$ {totalFechado.toLocaleString()}</span>
                                       <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Meta: R$ {meta.toLocaleString()}</span>
                                   </div>
                               </div>
                               <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                   <motion.div 
                                       initial={{ width: 0 }} 
                                       animate={{ width: `${progress}%` }} 
                                       transition={{ duration: 1, ease: 'easeOut' }}
                                       className={`h-full ${progress >= 100 ? 'bg-amber-400' : 'bg-blue-300'}`} 
                                   />
                               </div>
                           </div>
                       );
                   })
               }
               {(systemUsers || []).length === 0 && <p className="text-xs text-blue-200/50 uppercase font-black tracking-widest text-center mt-10">Sincronizando equipe...</p>}
           </div>
        </Card>

        <Card className="p-6 border-none shadow-sm flex flex-col justify-center gap-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
           <div className="flex items-center gap-3">
                <ArrowUpRight className="text-blue-500" />
                <div>
                   <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">R$ {stats?.faturamento?.toLocaleString() || 0}</h4>
                </div>
           </div>
        </Card>
      </div>
    </div>
  </div>
);

// --- APP PRINCIPAL (INDEX.TSX) ---

interface UserData extends Usuario {
  name: string;
  role: string;
}

function IndexInner() {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [pufLabel, setPufLabel] = useState('Protocolo Único');
  const [showAddClient, setShowAddClient] = useState(false);

  // States de Dados Reais
  const [clients, setClients] = useState<Cliente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dashboardAggregate, setDashboardAggregate] = useState<DashboardAggregate | null>(null);
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [logs, setLogs] = useState<LogAtividade[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [systemUsers, setSystemUsers] = useState<Usuario[]>([]);
   const [showUserModal, setShowUserModal] = useState(false);
   const [showTransactionModal, setShowTransactionModal] = useState(false);
   const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const isPrivileged = user?.role === 'admin' || user?.role === 'jadiel';
      const [c, s, agg, t, l, u] = await Promise.all([
        getClientes(searchTerm).catch(() => []), 
        getStats().catch(() => null),
        getDashboardAggregate().catch(() => null),
        getTransacoes().catch(() => []),
        isPrivileged ? getLogs().catch(() => []) : Promise.resolve([]),
        isPrivileged ? getUsuarios().catch(() => []) : Promise.resolve([])
      ]);
      // Garantir que os valores dos gráficos sejam números (evitando strings do driver PG)
      const aggParsed = agg ? {
        area: (agg.area || []).map((i: any) => ({ ...i, value: Number(i.value || 0) })),
        status: (agg.status || []).map((i: any) => ({ ...i, value: Number(i.value || 0) }))
      } : null;

      setClients(c); 
      setStats(s); 
      setDashboardAggregate(aggParsed); 
      setTransactions(t); 
      setLogs(l); 
      setSystemUsers(u);
      
      return { clients: c, stats: s }; // Return for immediate use if needed
    } catch (e) { 
      console.error('FRONTEND_SYNC_ERROR:', e);
      toast.error('Sincronização pendente'); 
    }
  }, [searchTerm, user]);

  useEffect(() => { if (user) { console.log('Triggering fetchData for user:', user.name); fetchData(); } }, [fetchData, user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const handleLogin = (data: { token: string; user: Usuario }) => {
    const { token, user: u } = data;
    const userData = { ...u, name: u.nome, role: u.perfil ? u.perfil.toLowerCase() : 'staff' };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'clientes', label: 'Clientes', icon: Users, show: true },
    { id: 'equipa', label: 'Controle Admin', icon: ShieldCheck, show: user.role === 'admin' || user.role === 'jadiel' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, show: user.role === 'admin' || user.role === 'jadiel' },
    { id: 'logs', label: 'Auditoria', icon: History, show: user.role === 'admin' || user.role === 'jadiel' },
    { id: 'config', label: 'Definições', icon: Settings, show: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans selection:bg-blue-100 selection:text-blue-700 transition-colors duration-300">
      <Toaster position="top-right" richColors />
      
      <AnimatePresence>
        {showAddClient && <ClientModal pufLabel={pufLabel} onClose={() => setShowAddClient(false)} onAdd={fetchData} />}
        {showUserModal && <UserModal user={editingUser} onClose={() => setShowUserModal(false)} onSave={fetchData} />}
        {showTransactionModal && <TransactionModal clients={clients} onClose={() => setShowTransactionModal(false)} onSave={fetchData} />}
      </AnimatePresence>
      {/* Sidebar (Azul e Ouro Theme) */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-[#0B1727] border-r border-[#15243B] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} hidden md:block`}>
        <div className="p-6 flex items-center justify-center gap-4 overflow-hidden h-24 border-b border-[#15243B] bg-[#0A1422]">
          <div 
            onClick={() => { setActiveTab('dashboard'); setSelectedClient(null); }}
            className={`flex items-center justify-center transition-all bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/10 border border-amber-300/50 ${sidebarOpen ? 'px-4 py-2 w-full justify-between' : 'w-12 h-10 min-w-[48px]'}`}
            title="Voltar ao Dashboard"
          >
            <div className="flex items-center">
              <span className={`font-black text-[#0A1422] tracking-tighter italic ${sidebarOpen ? 'text-2xl' : 'text-xl drop-shadow-sm'}`}>
                <span className="relative z-10">J</span>
                <span className="-ml-1 relative z-0">F</span>
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col text-left pl-3 border-l border-[#0B1727]/20 ml-1">
                <span className="text-[7px] font-black tracking-widest leading-[8px] text-[#0A1422] uppercase opacity-90">Soluções</span>
                <span className="text-[7px] font-black tracking-widest leading-[8px] text-[#0A1422] uppercase opacity-90">Financeiras</span>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map(item => item.show && (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedClient(null); }}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all font-bold ${
                activeTab === item.id 
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-amber-400 shadow-lg shadow-blue-900/40 border border-blue-500/30' 
                : 'text-slate-400 hover:bg-[#15243B] hover:text-blue-300'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? "text-amber-400" : "opacity-80"} />
              {sidebarOpen && <span className="text-xs uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 w-full px-4">
          <button onClick={logout} className="w-full flex items-center gap-4 p-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all font-bold border border-transparent hover:border-red-500/20">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
             <h2 className="font-bold text-lg text-slate-800 dark:text-white capitalize flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-amber-400 rounded-full animate-pulse" />
                 {activeTab}
             </h2>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-amber-400 transition-all border border-slate-100 dark:border-slate-700">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none capitalize">{user.name}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-amber-400 flex items-center justify-center font-black text-white dark:text-slate-900 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setActiveTab('config'); setSelectedClient(null); }}>
                 {user.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={selectedClient ? `client-${selectedClient.id}` : activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              
              {selectedClient ? (
                <ClientDetailsView client={selectedClient} onBack={() => setSelectedClient(null)} pufLabel={pufLabel} />
              ) : (
                <>
                  {activeTab === 'dashboard' && <DashboardView user={user} stats={stats} aggregate={dashboardAggregate} transactions={transactions} clients={clients} systemUsers={systemUsers} />}
                  
                                     {activeTab === 'equipa' && (
                       <div className="space-y-6">
                           <div className="flex justify-between items-center mb-10">
                             <div>
                               <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Controle Administrativo</h2>
                               <p className="text-sm text-slate-500 font-medium italic">Gestão de acessos, usuários e metas da equipe.</p>
                             </div>
                             <Button variant="primary" onClick={() => { setEditingUser(null); setShowUserModal(true); }}>
                                <UserPlus size={18} /> Novo Usuário
                             </Button>
                           </div>
                           
                           <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                             <table className="w-full text-left">
                               <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                                 <tr>
                                   <th className="px-8 py-5">Nome / Email</th>
                                   <th className="px-8 py-5">Perfil</th>
                                   <th className="px-8 py-5">Meta Faturamento</th>
                                   <th className="px-8 py-5 text-right">Ações</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                 {systemUsers.map((u) => (
                                   <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                     <td className="px-8 py-6">
                                       <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{u.nome}</div>
                                       <div className="text-xs text-slate-400">{u.email}</div>
                                     </td>
                                     <td className="px-8 py-6">
                                       <Badge variant={u.perfil?.toLowerCase() === 'jadiel' ? 'jadiel' : u.perfil?.toLowerCase() === 'admin' ? 'admin' : 'staff'}>
                                         {u.perfil}
                                       </Badge>
                                     </td>
                                     <td className="px-8 py-6">
                                       <div className="flex flex-col">
                                         <span className="font-black text-slate-700 dark:text-slate-300">R$ {parseFloat(String(u.meta_faturamento || 0)).toLocaleString()}</span>
                                         <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-blue-600 dark:bg-amber-400" style={{ width: '45%' }} />
                                         </div>
                                       </div>
                                     </td>
                                     <td className="px-8 py-6 text-right space-x-2">
                                       <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16}/></button>
                                       <button onClick={async () => { if(confirm('Excluir usuário?')) { await deleteUsuario(u.id); fetchData(); } }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                     </td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </Card>
                       </div>
                    )}

                  {activeTab === 'clientes' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fichas Jurídicas</h2>
                          <p className="text-sm text-slate-500 font-medium">Controle de processos ativos e documentos sincronizados.</p>
                        </div>
                        <Button variant="primary" onClick={() => setShowAddClient(true)} className="px-6 h-12">
                            <Plus size={18} /> Novo Registo
                        </Button>
                      </div>
                      
                      <div className="flex gap-4 mb-6">
                          <Input label="Localizar" icon={Search} placeholder="Pesquisar cliente por nome ou CPF..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} />
                      </div>

                      <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                              <tr>
                                <th className="px-8 py-5">Área de Atuação</th>
                                <th className="px-8 py-5">Nome do Cliente</th>
                                <th className="px-8 py-5">Contrato</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {clients.filter(c => !searchTerm || c.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || c.cpf?.includes(searchTerm)).map(client => (
                                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                  <td className="px-8 py-6">
                                    <Badge variant={client.categoria_servico}>{client.categoria_servico}</Badge>
                                  </td>
                                  <td className="px-8 py-6">
                                    <p className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">{client.nome_completo}</p>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase">{client.puf || 'S/ PROTOCOLO'}</p>
                                  </td>
                                  <td className="px-8 py-6">
                                    <p className="text-sm font-black text-emerald-600">R$ {parseFloat(String(client.valor_contrato || '0')).toLocaleString()}</p>
                                    <Badge variant={client.status_pagamento}>{client.status_pagamento}</Badge>
                                  </td>
                                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Apagar ${client.nome_completo}?`)) {
                                          try { await deleteCliente(client.id); fetchData(); toast.success('Cliente removido'); }
                                          catch { toast.error('Erro ao remover'); }
                                        }
                                      }}
                                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                    <Button variant="outline" className="text-xs group-hover:border-blue-600 dark:group-hover:border-amber-400" onClick={() => setSelectedClient(client)}>
                                      Abrir Ficha <ChevronRight size={14} />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                              {clients.filter(c => !searchTerm || c.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || c.cpf?.includes(searchTerm)).length === 0 && (
                                  <tr><td colSpan={4} className="px-8 py-32 text-center opacity-30 text-xs font-black uppercase tracking-[0.3em]">Nenhum registo localizado</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'financeiro' && <FinanceView transactions={transactions} stats={stats} systemUsers={systemUsers} clients={clients} user={user} onAddTransaction={() => setShowTransactionModal(true)} />}
                  
                  {activeTab === 'logs' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <History className="text-blue-500" /> Auditoria de Atividade
                        </h2>
                        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-8 py-5">Utilizador</th>
                                <th className="px-8 py-5">Ação Realizada</th>
                                <th className="px-8 py-5">Data e Hora</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">{log.usuario_nome?.charAt(0)}</div>
                                        <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">{log.usuario_nome}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400 font-medium italic">"{log.acao}"</td>
                                <td className="px-8 py-5 font-mono text-[11px] text-slate-400">{new Date(log.data_hora).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </Card>
                    </div>
                  )}

                  {activeTab === 'config' && (
                    <div className="max-w-4xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-blue-600 dark:bg-amber-400 flex items-center justify-center font-black text-3xl text-white dark:text-slate-900 shadow-xl">{user.name?.charAt(0)}</div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user.name}</h2>
                                <p className="text-sm text-slate-500 capitalize">{user.role} • {user.email || 'Sistema'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-8 border-none shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="text-blue-600 dark:text-amber-400" size={22} />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Tipos de Documento</h3>
                                </div>
                                <p className="text-xs text-slate-400">Tipos aceitos no sistema atualmente:</p>
                                <div className="space-y-2">
                                    {['PDF', 'DOC / DOCX', 'JPG / PNG', 'MP4 / Vídeo'].map(t => (
                                        <div key={t} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t}</span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-8 border-none shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Upload className="text-blue-600 dark:text-amber-400" size={22} />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Importar Clientes (CSV)</h3>
                                </div>
                                <p className="text-xs text-slate-400">O CSV deve conter: nome_completo, cpf, telefone_whatsapp, categoria_servico, valor_contrato.</p>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-600 dark:hover:border-amber-400 transition-colors">
                                    <Upload size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Arrastar ou Clicar para Selecionar</span>
                                    <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const text = await file.text();
                                        const lines = text.split('\n').slice(1);
                                        let count = 0;
                                        for (const line of lines) {
                                            const [nome_completo, cpf, telefone_whatsapp, categoria_servico, valor_contrato] = line.split(',').map(s => s?.trim());
                                            if (nome_completo) {
                                                try { await (await import('../services/api')).createCliente({ nome_completo, cpf, telefone_whatsapp, categoria_servico: categoria_servico || 'Cível', valor_contrato: parseFloat(valor_contrato) || 0, status_pagamento: 'Em dia', notas: '' }); count++; } catch (err) { console.error('Import error:', err); }
                                            }
                                        }
                                        toast.success(`${count} clientes importados!`);
                                        fetchData();
                                    }} />
                                </label>
                            </Card>

                            <Card className="p-8 border-none shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="text-emerald-500" size={22} />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Relatório Financeiro Mensal</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Total Entradas</span>
                                        <span className="font-black text-emerald-600">R$ {(transactions.filter(t => t.tipo === 'Entrada').reduce((a, t) => a + parseFloat(String(t.valor || '0')), 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Total Saídas</span>
                                        <span className="font-black text-red-500">R$ {(transactions.filter(t => t.tipo === 'Saída').reduce((a, t) => a + parseFloat(String(t.valor || '0')), 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Saldo</span>
                                        <span className="font-black text-blue-600 dark:text-amber-400">R$ {(stats?.saldo || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => { const csv = 'Data,Descrição,Tipo,Valor\n' + transactions.map(t => `${new Date(t.data_transacao).toLocaleDateString()},${t.descricao},${t.tipo},${t.valor}`).join('\n'); const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'relatorio.csv'; a.click(); }}>
                                    <ArrowDownRight size={16} /> Exportar CSV
                                </Button>
                            </Card>

                            <Card className="p-8 border-none shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <RefreshCw className="text-blue-600 dark:text-amber-400" size={22} />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sistema</h3>
                                </div>
                                <Input label="Rótulo Global do Protocolo" value={pufLabel} onChange={e => setPufLabel(e.target.value)} />
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                    <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Tema Dinâmico</span>
                                    <div className="w-12 h-6 bg-blue-600 dark:bg-amber-400 rounded-full relative cursor-pointer" onClick={()=>setDarkMode(!darkMode)}>
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function Index() {
  return <ErrorBoundary><IndexInner /></ErrorBoundary>;
}

interface LoginPageProps {
  onLogin: (data: { token: string; user: Usuario }) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUsuario({ email: user, senha: pass });
      onLogin(data);
      toast.success('Sessão iniciada como ' + data.user.nome);
    } catch { 
      toast.error('Erro de autenticação. Verifique os dados.'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-8 right-8 p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 dark:text-amber-400 shadow-xl border border-slate-200 dark:border-slate-800 transition-all hover:scale-110 active:scale-95 z-50"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-10 border-none shadow-xl shadow-blue-500/5 dark:shadow-amber-500/5">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 dark:bg-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/20 dark:shadow-amber-400/20 transition-all rotate-3 hover:rotate-0">
              <ShieldCheck className="text-white dark:text-slate-900" size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">JF Escritório</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.4em]">Plataforma Digital de Gestão</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input icon={Users} label="UTILIZADOR" placeholder="Email ou Nome" value={user} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser(e.target.value)} required />
            <Input icon={Key} label="CHAVE DE ACESSO" type="password" placeholder="••••••••" value={pass} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full py-4 mt-6 text-sm tracking-widest uppercase font-black">ENTRAR NO SISTEMA</Button>
          </form>
          <p className="text-center text-[9px] text-slate-300 dark:text-slate-700 mt-12 uppercase font-black tracking-widest">PROVEDOR DE SERVIÇOS CRIPTOGRÁFICOS</p>
        </Card>
      </motion.div>
    </div>
  );
};
