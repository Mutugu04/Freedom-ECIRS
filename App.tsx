
import React, { useState, useEffect } from 'react';
import { 
  Database, LayoutDashboard, Briefcase, Menu, X, 
  ChevronRight, Zap, CheckCircle2, Lock, Terminal, Radio, 
  FileJson, Server, FileText, Shield, Eye, Users, Receipt as ReceiptIcon, BarChart3, 
  Settings, LogOut, Plus, TrendingUp,
  Clock, CheckCircle, AlertCircle, MoreVertical, Smartphone,
  CreditCard, Banknote, Calendar, Repeat,
  ShieldEllipsis, UserPlus, ShieldCheck as ShieldCheckIcon,
  Wifi, WifiOff, MessageSquare, Send, Check, CheckCheck, Phone, Languages,
  ArrowDownToLine, Cpu, BookOpen, Code2, FileSpreadsheet, UploadCloud, Table,
  AlertTriangle, Home, Building2, MapPin, Search, Filter, Hash, Fingerprint, Layers,
  Printer, Globe, Percent, QrCode, Save, Trash2, Edit3, FolderOpen
} from 'lucide-react';
import { AppView, Client, Contract, StaffMember, Language } from './types';
import { STATIONS as INITIAL_STATIONS, EBRS_SQL_SCHEMA } from './constants';
import { translations } from './translations';
import { 
  getFastAPIImplementation, getPDFEngineCode, getSecurityEngineCode, 
  getPricingEngineCode, getReportingEngineCode, getDevOpsEngineCode, 
  getAPIDocsCode, getSDKCode, getMigrationEngineCode, 
  getWhatsAppIntegrationCode, getAccountingIntegrationCode 
} from './services/geminiService';

// --- MOCK DATA ---
const MOCK_CLIENTS: Client[] = [
  { id: '1', company_name: 'Dangote Cement PLC', contact_person: 'Alhaji Musa', email: 'musa@dangote.com', phone: '+234 803 111 2222', tin: 'TIN-DG-001', type: 'direct', balance: 145000000 },
  { id: '2', company_name: 'MTN Nigeria', contact_person: 'Ibrahim Bala', email: 'ib@mtn.ng', phone: '+234 803 333 4444', tin: 'TIN-MT-099', type: 'agency', balance: 8900000 },
  { id: '3', company_name: 'BUA Group', contact_person: 'Sani Adamu', email: 'sani@bua.com', phone: '+234 803 555 6666', tin: 'TIN-BU-777', type: 'direct', balance: 0 },
];

const MOCK_CONTRACTS: Contract[] = [
  { id: 'C1', doc_num: 'KAN-CON-202409-001', client_name: 'Dangote Cement', campaign: 'Q4 Build', amount: 45000000, status: 'approved', date: '2024-09-01' },
  { id: 'C2', doc_num: 'KAN-CON-202409-002', client_name: 'MTN Nigeria', campaign: 'Pulse Launch', amount: 12500000, status: 'pending', date: '2024-09-05' },
  { id: 'C3', doc_num: 'KAN-CON-202409-003', client_name: 'BUA Group', campaign: 'Radio Takeover', amount: 800000, status: 'draft', date: '2024-09-10' },
];

const MOCK_INVOICES = [
  { id: 'I1', doc_num: 'KAN-INV-202409-001', client: 'Dangote Cement', amount: 45000000, status: 'paid', date: '2024-09-15' },
  { id: 'I2', doc_num: 'KAN-INV-202409-002', client: 'MTN Nigeria', amount: 12500000, status: 'sent', date: '2024-09-16' },
  { id: 'I3', doc_num: 'KAN-INV-202409-003', client: 'Ahmadu Bello Univ', amount: 240000, status: 'overdue', date: '2024-08-10' },
];

const MOCK_STAFF: StaffMember[] = [
  { id: 'S1', name: 'Sadiq Ibrahim', phone: '+234 803 000 0001', role: 'super_admin', stations: ['FRG-HQ', 'FR-KAN'], status: 'active' },
  { id: 'S2', name: 'Aisha Bello', phone: '+234 803 000 0002', role: 'accountant', stations: ['FR-KAN'], status: 'active' },
  { id: 'S3', name: 'Musa Lawal', phone: '+234 803 000 0003', role: 'sales_executive', stations: ['FR-KAD'], status: 'active' },
];

// --- SMALL HELPER COMPONENTS ---

const StatCard: React.FC<{ label: string; value: string; trend: string; icon: React.ReactNode; color: string }> = ({ label, value, trend, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-500 mb-4 inline-block`}>{icon}</div>
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <div className="flex items-center gap-1 mt-1">
       <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>{trend}</span>
    </div>
  </div>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; isOpen: boolean }> = ({ icon, label, isActive, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-2.5 transition-all relative group ${
      isActive ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    <div className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</div>
    {isOpen && <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-opacity">{label}</span>}
    {isActive && <div className="absolute right-0 top-0 h-full w-1 bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
  </button>
);

const StatWidget: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black text-${color}-600`}>{value}</p>
  </div>
);

const MessageStatusItem: React.FC<{ client: string; type: string; status: 'read' | 'delivered' | 'sent' | 'failed'; time: string }> = ({ client, type, status, time }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'read': return <CheckCheck size={14} className="text-blue-500" />;
      case 'delivered': return <CheckCheck size={14} className="text-slate-400" />;
      case 'sent': return <Check size={14} className="text-slate-400" />;
      case 'failed': return <AlertTriangle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <MessageSquare size={18} className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{client}</p>
          <p className="text-[10px] text-slate-500 uppercase font-black">{type}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-1 mb-1">
          <span className="text-[10px] font-black uppercase text-slate-400">{status}</span>
          {getStatusIcon()}
        </div>
        <p className="text-[9px] text-slate-400">{time}</p>
      </div>
    </div>
  );
};

const MappingItem: React.FC<{ excel: string; db: string; status: 'success' | 'pending' }> = ({ excel, db, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{excel}</p>
      <div className="flex items-center gap-2">
        <ArrowDownToLine size={12} className="text-slate-300" />
        <p className="text-sm font-bold text-slate-800">{db}</p>
      </div>
    </div>
    <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
  </div>
);

const ExportLogItem: React.FC<{ software: string; status: 'success' | 'failed'; date: string; records: number; error?: string }> = ({ software, status, date, records, error }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
        {status === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{software} Sync</p>
        <p className="text-[10px] text-slate-400 font-bold">{date} • {records} records</p>
        {error && <p className="text-[9px] text-red-500 font-bold uppercase mt-0.5">{error}</p>}
      </div>
    </div>
  </div>
);

const ConnectorBadge: React.FC<{ name: string; active: boolean }> = ({ name, active }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <span className="text-xs font-bold text-slate-700">{name}</span>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{active ? 'Connected' : 'Disconnected'}</span>
    </div>
  </div>
);

const MobileStat: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
    <div className={`w-10 h-10 rounded-2xl bg-${color}-50 text-${color}-500 flex items-center justify-center mb-4`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900">{value}</p>
  </div>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
    {icon}
  </button>
);

// --- MAIN VIEW COMPONENTS ---

const LoginPage: React.FC<{ onLogin: () => void; t: any }> = ({ onLogin, t }) => {
  const [step, setStep] = useState(1);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (step === 1) setStep(2); else onLogin(); };
  return (
    <div className="h-screen w-full flex bg-slate-900 justify-center items-center p-6">
      <div className="w-full max-w-md bg-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
        <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
                <Radio size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">{t.app_name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.tagline}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{step === 1 ? t.phone_number : t.otp_code}</label>
            <input 
                type="text" 
                placeholder={step === 1 ? "+234 ..." : "000 000"} 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-900 transition-all text-center tracking-widest" 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
            {t.continue}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
            <button 
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-colors"
            >
                <ShieldEllipsis size={18} />
                {t.demo_access}
            </button>
            <p className="text-[10px] text-center font-bold text-slate-400 italic">
                {t.login_hint}
            </p>
        </div>
      </div>
    </div>
  );
};

const LiveDashboard: React.FC<{ station: any; t: any }> = ({ station, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard label={t.total_revenue} value="₦4.2M" trend="+12%" icon={<TrendingUp />} color="emerald" />
    <StatCard label={t.pending_revenue} value="₦1.8M" trend="-2%" icon={<AlertCircle />} color="orange" />
    <StatCard label={t.active_contracts} value="24" trend="+4" icon={<Briefcase />} color="blue" />
    <StatCard label={t.new_invoices} value="12" trend="Now" icon={<Clock />} color="red" />
  </div>
);

const ClientManagement: React.FC<{ clients: Client[]; t: any }> = ({ clients, t }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b">
        <tr><th className="px-6 py-4">{t.clients}</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Balance</th><th className="px-6 py-4 text-right">{t.actions}</th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">{clients.map(c => (<tr key={c.id} className="hover:bg-slate-50/50 transition-all"><td className="px-6 py-4 font-bold">{c.company_name}</td><td className="px-6 py-4 uppercase text-[10px] font-bold">{c.type}</td><td className="px-6 py-4 font-black">₦{(c.balance/100).toLocaleString()}</td><td className="px-6 py-4 text-right"><ChevronRight size={18} /></td></tr>))}</tbody>
    </table>
  </div>
);

const ContractManagement: React.FC<{ contracts: Contract[]; t: any }> = ({ contracts, t }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b">
        <tr><th className="px-6 py-4">Doc No</th><th className="px-6 py-4">{t.clients}</th><th className="px-6 py-4">{t.status}</th><th className="px-6 py-4 text-right">{t.actions}</th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">{contracts.map(c => (<tr key={c.id} className="hover:bg-slate-50 transition-all"><td className="px-6 py-4 font-mono text-[11px]">{c.doc_num}</td><td className="px-6 py-4 font-bold">{c.client_name}</td><td className="px-6 py-4"><span className={`text-[9px] font-black uppercase px-2 py-1 ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'} rounded`}>{c.status}</span></td><td className="px-6 py-4 text-right"><Eye size={18} className="text-slate-400 hover:text-slate-900 cursor-pointer inline-block" /></td></tr>))}</tbody>
    </table>
  </div>
);

const InvoiceManagement: React.FC<{ contracts: Contract[]; t: any }> = ({ t }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Billing Workspace</h3>
      <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
        <Plus size={16} /> New Invoice
      </button>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b">
          <tr><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MOCK_INVOICES.map(i => (
            <tr key={i.id} className="hover:bg-slate-50 transition-all">
              <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{i.doc_num}</td>
              <td className="px-6 py-4 font-bold text-slate-800">{i.client}</td>
              <td className="px-6 py-4 font-black">₦{(i.amount/100).toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                  i.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                  i.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {i.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3 text-slate-300">
                  <Printer size={16} className="hover:text-slate-600 cursor-pointer" />
                  <Send size={16} className="hover:text-blue-600 cursor-pointer" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReceiptManagement: React.FC<{ clients: Client[]; t: any }> = ({ t }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
    <div className="lg:col-span-2 space-y-6">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Receipt Terminal</h3>
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Payer</label>
            <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-slate-900 transition-all appearance-none">
              {MOCK_CLIENTS.map(c => <option key={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">Bank</button>
              <button className="flex-1 py-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[10px] font-black uppercase">Cash</button>
              <button className="flex-1 py-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[10px] font-black uppercase">POS</button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Received (₦)</label>
          <input type="number" placeholder="0.00" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-3xl text-slate-900 outline-none focus:border-slate-900" />
        </div>
        <button className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
          <ReceiptIcon size={18} /> Issue Digital Receipt
        </button>
      </div>
    </div>
    <div className="space-y-6">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2 px-2">Recent Settlements</h4>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><Check size={18} /></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Dangote PLC</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">₦4.5M • Bank Transfer</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReportsDashboard: React.FC<{ t: any }> = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Broadcast Performance Analytics</h3>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><Calendar size={14} /> This Month</button>
        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"><ArrowDownToLine size={14} /> Export CSV</button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Revenue by Station (Monthly)</h4>
        <div className="space-y-6">
          {INITIAL_STATIONS.map((s, idx) => (
            <div key={s.code} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-600">{s.code}</span>
                <span className="text-xs font-black text-slate-900">₦{(Math.random() * 5 + 1).toFixed(1)}M</span>
              </div>
              <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-emerald-400 rounded-full transition-all duration-1000 delay-${idx * 100}`} 
                  style={{ width: `${Math.random() * 60 + 20}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatCard label="Live Mentions" value="142" trend="+18%" icon={<Radio />} color="purple" />
        <StatCard label="Outside Broadcast" value="8" trend="+2%" icon={<Globe />} color="blue" />
        <StatCard label="Sponsorships" value="24" trend="-5%" icon={<Layers />} color="orange" />
        <StatCard label="Spot Ads" value="1,842" trend="+12%" icon={<Zap />} color="emerald" />
      </div>
    </div>
  </div>
);

const AdminPanel: React.FC<{ t: any }> = () => {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({ role: 'sales_executive', stations: [], status: 'active' });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaff.name && newStaff.phone) {
      const staffMember: StaffMember = {
        id: 'S' + (staff.length + 1),
        name: newStaff.name,
        phone: newStaff.phone,
        role: newStaff.role as any,
        stations: newStaff.stations || [],
        status: 'active'
      };
      setStaff([...staff, staffMember]);
      setIsModalOpen(false);
      setNewStaff({ role: 'sales_executive', stations: [], status: 'active' });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'accountant': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'sales_executive': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Staff Management</h3>
          <p className="text-sm text-slate-500 font-medium">Provision credentials and assign station roles</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
        >
          <UserPlus size={16} /> Provision New Staff
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Identity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departmental Role</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Stations</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staff.map((s) => (
              <tr key={s.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">{s.name[0]}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 font-mono">{s.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getRoleBadge(s.role)}`}>
                    {s.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1">
                    {s.stations.map(st => (
                      <span key={st} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-bold rounded-md border border-slate-100">{st}</span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <h4 className="text-xl font-black text-slate-900">Provision ECIRS Account</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStaff} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Staff Name</label>
                  <input type="text" required value={newStaff.name || ''} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="Enter full name" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-900 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone (Login Identity)</label>
                  <input type="text" required value={newStaff.phone || ''} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} placeholder="+234 ..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-900 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as any})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-900 transition-all appearance-none">
                      <option value="sales_executive">Marketing / Sales</option>
                      <option value="accountant">Accounting Staff</option>
                      <option value="station_manager">Station Manager</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Station</label>
                    <select onChange={e => setNewStaff({...newStaff, stations: [e.target.value]})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-slate-900 transition-all appearance-none">
                      {INITIAL_STATIONS.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                <ShieldCheckIcon size={18} /> Activate Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPanel: React.FC<{ t: any }> = () => {
  const [activeTab, setActiveTab] = useState<'STATIONS' | 'FINANCE' | 'SYSTEM'>('STATIONS');
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [finance, setFinance] = useState({ vat: 7.5, commission: 15.0 });
  const [system, setSystem] = useState({ certPath: '/var/ebrs/keys/fr-hq-master.pem', checksumEnabled: true });

  const handleUpdateStation = (code: string, field: string, value: string) => {
    setStations(prev => prev.map(s => s.code === code ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">EBRS Configuration</h3>
          <p className="text-slate-500 font-medium mt-1">Domesticated settings for Freedom Radio Network</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="flex gap-4 p-1.5 bg-white rounded-3xl border border-slate-200 shadow-sm w-fit">
        {['STATIONS', 'FINANCE', 'SYSTEM'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'STATIONS' && (
        <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4">
          {stations.map(s => (
            <div key={s.code} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-all shadow-inner">
                <Radio size={32} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-slate-800">{s.name}</h4>
                  <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">Active Node</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station ID</label>
                    <input readOnly value={s.code} className="w-full bg-slate-50 p-3 rounded-xl font-mono text-xs font-bold text-slate-400 border border-slate-100 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</label>
                    <input 
                      value={s.frequency} 
                      onChange={(e) => handleUpdateStation(s.code, 'frequency', e.target.value)}
                      className="w-full bg-white p-3 rounded-xl font-bold text-sm text-slate-900 border-2 border-slate-50 focus:border-slate-900 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                    <input 
                      value={s.location} 
                      onChange={(e) => handleUpdateStation(s.code, 'location', e.target.value)}
                      className="w-full bg-white p-3 rounded-xl font-bold text-sm text-slate-900 border-2 border-slate-50 focus:border-slate-900 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"><Edit3 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'FINANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-10 rounded-[50px] border border-slate-200 shadow-sm space-y-8">
            <h4 className="text-xl font-black flex items-center gap-3"><Percent className="text-emerald-500" /> Taxation Parameters</h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nigerian VAT Rate (%)</label>
                  <span className="text-xs font-black text-emerald-600">{finance.vat}%</span>
                </div>
                <input 
                  type="range" min="0" max="15" step="0.5" 
                  value={finance.vat}
                  onChange={(e) => setFinance({...finance, vat: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                />
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Note: The standard VAT in Nigeria is 7.5% as per Finance Act 2020. Adjustments here will update all real-time invoice calculations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[50px] border border-slate-200 shadow-sm space-y-8">
            <h4 className="text-xl font-black flex items-center gap-3"><Users className="text-blue-500" /> Agency & Commissions</h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Agency Rate (%)</label>
                  <span className="text-xs font-black text-blue-600">{finance.commission}%</span>
                </div>
                <input 
                  type="range" min="0" max="30" step="1" 
                  value={finance.commission}
                  onChange={(e) => setFinance({...finance, commission: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                />
              </div>
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <p className="text-[11px] text-blue-600/70 leading-relaxed font-medium">
                  Standard industry commission for APCON registered agencies is 15%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SYSTEM' && (
        <div className="bg-white p-12 rounded-[60px] border border-slate-200 shadow-sm space-y-12 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3"><ShieldCheckIcon className="text-emerald-500" /> Legal Compliance</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Hardware Digital Key</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Require physical USB-Token for Accountant signature</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Document Checksum</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Automated Luhn-Check on Sequence numbers</p>
                  </div>
                  <div className={`w-12 h-6 ${system.checksumEnabled ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full relative transition-all cursor-pointer`} onClick={() => setSystem({...system, checksumEnabled: !system.checksumEnabled})}>
                    <div className={`absolute ${system.checksumEnabled ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xl font-black flex items-center gap-3"><Fingerprint className="text-slate-400" /> Digital Infrastructure</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Network Certificate Path</label>
                  <div className="flex gap-2">
                    <input 
                      value={system.certPath}
                      onChange={(e) => setSystem({...system, certPath: e.target.value})}
                      className="flex-1 bg-slate-50 p-4 rounded-2xl font-mono text-xs font-bold text-slate-600 border border-slate-100 outline-none focus:border-slate-900 transition-all" 
                    />
                    <button className="p-4 bg-slate-900 text-white rounded-2xl"><FolderOpen size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... Rest of the components (VerificationPortal, SchemaViewer, BackendAPIArchitect, etc.) remain as they are or are fixed if necessary

const VerificationPortal: React.FC<{ t: any }> = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-16 rounded-[60px] border border-slate-200 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
        <QrCode size={48} strokeWidth={1.5} />
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Public Document Verification</h3>
        <p className="text-slate-500 font-medium">Scan QR code or enter Document ID to verify authenticity</p>
      </div>
      <div className="flex gap-4">
        <input type="text" placeholder="FR-CON-XXXX-XXXX" className="flex-1 p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-900 outline-none focus:border-slate-900 transition-all text-center tracking-widest" />
        <button className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Verify</button>
      </div>
    </div>
  );
};

const SchemaViewer: React.FC<{ schema: string; onCopy: (s: string) => void; t: any }> = ({ schema, onCopy }) => (
  <div className="space-y-4"><div className="flex justify-between items-center bg-white p-4 rounded-xl border"><span>PostgreSQL DDL</span><button onClick={() => onCopy(schema)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black">Copy SQL</button></div><div className="bg-slate-900 rounded-[40px] p-8 overflow-auto border border-slate-800"><pre className="code-font text-emerald-400 text-xs">{schema}</pre></div></div>
);

const BackendAPIArchitect: React.FC = () => {
    const [fileContent, setFileContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getFastAPIImplementation('app/main.py', "FastAPI core"); setFileContent(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{fileContent}</pre>}</div>);
};

const APIDocsArchitect: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'SWAGGER' | 'SDK' | 'GUIDE'>('SWAGGER');
    const [selectedEndpointSet, setSelectedEndpointSet] = useState<string>('Contracts');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const endpointSets = ['Authentication', 'Clients', 'Contracts', 'Billing', 'Verification'];
    const loadAPIData = async (tab: string, item: string) => {
        setLoading(true);
        try {
            if (tab === 'SWAGGER') {
                const res = await getAPIDocsCode(item);
                setCode(res || "# OpenAPI Spec generation failed.");
            } else if (tab === 'SDK') {
                const res = await getSDKCode('Python');
                setCode(res || "# SDK generation failed.");
            }
        } catch (e) { setCode("# Service Unavailable."); } finally { setLoading(false); }
    };
    useEffect(() => { if (selectedTab === 'SWAGGER') loadAPIData('SWAGGER', selectedEndpointSet); if (selectedTab === 'SDK') loadAPIData('SDK', 'Python'); }, [selectedTab, selectedEndpointSet]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl w-fit border border-slate-200 shadow-sm">
               {['SWAGGER', 'SDK', 'GUIDE'].map(tab => (
                 <button key={tab} onClick={() => setSelectedTab(tab as any)} className={`px-8 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all ${selectedTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-800'}`}>
                   {tab}
                 </button>
               ))}
            </div>
            {selectedTab === 'SWAGGER' && (
                <div className="flex gap-8 h-[700px]">
                   <div className="w-64 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm shrink-0 flex flex-col">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">API Resources</h5>
                      <div className="space-y-2 flex-1">
                         {endpointSets.map(set => (
                           <button key={set} onClick={() => setSelectedEndpointSet(set)} className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold transition-all ${selectedEndpointSet === set ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
                             {set}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div className="flex-1 bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
                      <div className="h-16 bg-slate-800/50 flex items-center px-8 border-b border-slate-700 justify-between">
                         <div className="flex items-center gap-3"><BookOpen size={14} className="text-blue-400" /><span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">openapi-ecirs-{selectedEndpointSet.toLowerCase()}.yaml</span></div>
                      </div>
                      <div className="flex-1 p-8 overflow-auto">
                         {loading ? <div className="space-y-4 opacity-20">{[...Array(15)].map((_, i) => (<div key={i} className={`h-3 bg-blue-900 rounded-full ${i % 3 === 0 ? 'w-1/3' : 'w-full'}`} />))}</div> : <pre className="code-font text-blue-300 text-[13px] leading-relaxed whitespace-pre font-medium">{code}</pre>}
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};

const MobilePWA: React.FC<{ onBack: () => void; t: any }> = ({ onBack, t }) => {
  const [mobileView, setMobileView] = useState<'HOME' | 'CLIENTS' | 'QUOTE' | 'PAYMENT'>('HOME');
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => { const handleOnline = () => setIsOnline(true); const handleOffline = () => setIsOnline(false); window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline); return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); }; }, []);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-[100] max-w-md mx-auto shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#1B4F72] p-6 text-white shrink-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10"><Radio size={20} className="text-emerald-400" /></div>
          <div><h1 className="font-black text-lg tracking-tight">{t.field_ebrs}</h1><p className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-1">{isOnline ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}{isOnline ? t.online_sync : t.offline_mode}</p></div>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
        {mobileView === 'HOME' && <div className="grid grid-cols-2 gap-4"><MobileStat label="Today Sales" value="₦2.4M" color="emerald" icon={<TrendingUp size={16} />} /><MobileStat label="Invoices" value="14" color="blue" icon={<FileText size={16} />} /></div>}
        {mobileView === 'CLIENTS' && <ClientManagement clients={MOCK_CLIENTS} t={t} />}
        {mobileView === 'PAYMENT' && <ReceiptManagement clients={MOCK_CLIENTS} t={t} />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <MobileNavItem icon={<Home size={22} />} active={mobileView === 'HOME'} onClick={() => setMobileView('HOME')} />
        <MobileNavItem icon={<Users size={22} />} active={mobileView === 'CLIENTS'} onClick={() => setMobileView('CLIENTS')} />
        <button className="bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-xl shadow-emerald-500/30 border-4 border-white active:scale-95"><Plus size={28} /></button>
        <MobileNavItem icon={<CreditCard size={22} />} active={mobileView === 'PAYMENT'} onClick={() => setMobileView('PAYMENT')} />
        <MobileNavItem icon={<Settings size={22} />} active={false} onClick={() => {}} />
      </div>
    </div>
  );
};

// --- CORE APP COMPONENT ---

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.LOGIN);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);

  const t = translations[language];

  const handleLogout = () => {
    setIsAuth(false);
    setActiveView(AppView.LOGIN);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === Language.ENGLISH ? Language.HAUSA : Language.ENGLISH);
  };

  /* Unified login view logic to prevent incorrect type narrowing */
  if (!isAuth || activeView === AppView.LOGIN) {
      return <LoginPage onLogin={() => { setIsAuth(true); setActiveView(AppView.APP_DASHBOARD); }} t={t} />;
  }

  if (activeView === AppView.MOBILE_PWA) return <MobilePWA onBack={() => setActiveView(AppView.APP_DASHBOARD)} t={t} />;

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shrink-0 border-r border-slate-800`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 h-16 shrink-0">
          <div className="bg-emerald-500 p-2 rounded-lg shrink-0"><Radio className="w-5 h-5 text-white" /></div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight truncate">Freedom <span className="text-emerald-400">ECIRS</span></span>}
        </div>
        <div className="flex-1 py-4 overflow-y-auto space-y-6">
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.operations}</p>}
            <NavItem icon={<LayoutDashboard size={20} />} label={t.dashboard} isActive={activeView === AppView.APP_DASHBOARD} onClick={() => setActiveView(AppView.APP_DASHBOARD)} isOpen={isSidebarOpen} />
            <NavItem icon={<Users size={20} />} label={t.clients} isActive={activeView === AppView.CLIENTS} onClick={() => setActiveView(AppView.CLIENTS)} isOpen={isSidebarOpen} />
            <NavItem icon={<Briefcase size={20} />} label={t.contracts} isActive={activeView === AppView.CONTRACTS} onClick={() => setActiveView(AppView.CONTRACTS)} isOpen={isSidebarOpen} />
            <NavItem icon={<FileText size={20} />} label={t.invoices} isActive={activeView === AppView.INVOICES} onClick={() => setActiveView(AppView.INVOICES)} isOpen={isSidebarOpen} />
            <NavItem icon={<ReceiptIcon size={20} />} label={t.receipts} isActive={activeView === AppView.RECEIPTS} onClick={() => setActiveView(AppView.RECEIPTS)} isOpen={isSidebarOpen} />
            <NavItem icon={<BarChart3 size={20} />} label={t.reports} isActive={activeView === AppView.REPORTS} onClick={() => setActiveView(AppView.REPORTS)} isOpen={isSidebarOpen} />
          </div>
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.field_ops}</p>}
            <NavItem icon={<Smartphone size={20} />} label={t.mobile_pwa} isActive={activeView === AppView.MOBILE_PWA} onClick={() => setActiveView(AppView.MOBILE_PWA)} isOpen={isSidebarOpen} />
            <NavItem icon={<ShieldCheckIcon size={20} />} label={t.verify_doc} isActive={activeView === AppView.VERIFICATION_PORTAL} onClick={() => setActiveView(AppView.VERIFICATION_PORTAL)} isOpen={isSidebarOpen} />
          </div>
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.system}</p>}
            <NavItem icon={<Shield size={20} />} label={t.admin} isActive={activeView === AppView.ADMIN} onClick={() => setActiveView(AppView.ADMIN)} isOpen={isSidebarOpen} />
            <NavItem icon={<Settings size={20} />} label={t.settings} isActive={activeView === AppView.SETTINGS} onClick={() => setActiveView(AppView.SETTINGS)} isOpen={isSidebarOpen} />
          </div>
          {isSidebarOpen && (
              <div className="px-6 pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Architect Portal</p>
                  <button onClick={() => setActiveView(AppView.SCHEMA)} className="text-[10px] block py-1.5 text-slate-400 hover:text-emerald-400 font-bold uppercase tracking-tighter">Database DDL</button>
                  <button onClick={() => setActiveView(AppView.BACKEND_API)} className="text-[10px] block py-1.5 text-slate-400 hover:text-emerald-400 font-bold uppercase tracking-tighter">FastAPI Core</button>
                  <button onClick={() => setActiveView(AppView.API_DOCS_ARCHITECT)} className="text-[10px] block py-1.5 text-slate-400 hover:text-emerald-400 font-bold uppercase tracking-tighter">OpenAPI Docs</button>
              </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-red-400 rounded-lg transition-all"><LogOut size={20} />{isSidebarOpen && <span className="text-sm font-medium">{t.logout}</span>}</button>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors">{isSidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">{activeView.toLowerCase().replace('_', ' ')}</h2>
          <div className="flex items-center gap-6">
             <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 active:scale-95 transition-all"><Languages size={14} className="text-emerald-500" /><span>{language === Language.ENGLISH ? 'Hausa' : 'English'}</span></button>
             <div className="text-right hidden sm:block"><p className="text-sm font-black text-slate-800">Sadiq Ibrahim</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{t.station_manager}</p></div>
             <div className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-700 shadow-sm">SI</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === AppView.APP_DASHBOARD && <LiveDashboard station={INITIAL_STATIONS[0]} t={t} />}
          {activeView === AppView.CLIENTS && <ClientManagement clients={MOCK_CLIENTS} t={t} />}
          {activeView === AppView.CONTRACTS && <ContractManagement contracts={MOCK_CONTRACTS} t={t} />}
          {activeView === AppView.INVOICES && <InvoiceManagement contracts={MOCK_CONTRACTS} t={t} />}
          {activeView === AppView.RECEIPTS && <ReceiptManagement clients={MOCK_CLIENTS} t={t} />}
          {activeView === AppView.REPORTS && <ReportsDashboard t={t} />}
          {activeView === AppView.ADMIN && <AdminPanel t={t} />}
          {activeView === AppView.VERIFICATION_PORTAL && <VerificationPortal t={t} />}
          {activeView === AppView.SCHEMA && <SchemaViewer schema={EBRS_SQL_SCHEMA} onCopy={() => {}} t={t} />}
          {activeView === AppView.BACKEND_API && <BackendAPIArchitect />}
          {activeView === AppView.API_DOCS_ARCHITECT && <APIDocsArchitect />}
          {activeView === AppView.SETTINGS && <SettingsPanel t={t} />}
        </div>
      </main>
    </div>
  );
};

export default App;
