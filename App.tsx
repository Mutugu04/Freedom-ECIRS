
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Database, LayoutDashboard, FileCode, GitBranch, ShieldCheck, Menu, X, 
  ChevronRight, Zap, CheckCircle2, Lock, Download, Copy, Terminal, Radio, 
  FileJson, FolderOpen, File as FileIcon, ChevronDown, Cpu, Server, 
  FileText, QrCode, Shield, Eye, Users, Briefcase, Receipt, BarChart3, 
  Settings, LogOut, Plus, Search, Filter, ArrowUpRight, TrendingUp,
  Clock, CheckCircle, AlertCircle, MoreVertical, Smartphone, Mail,
  CreditCard, Banknote, Building2, MapPin, Percent, Key, Fingerprint,
  Calculator, Tag, Layers, Globe, Camera, ScanLine, Info, Printer, RefreshCw,
  PieChart, Activity, TrendingDown, ClipboardList, Wifi, WifiOff, Share2, PenTool, Home,
  HardDrive, Network, GitPullRequest, ShieldAlert, Cloud, TerminalSquare, BookOpen, 
  Code2, ExternalLink, Box, FileSpreadsheet, UploadCloud, AlertTriangle, Table,
  MessageSquare, Send, Check, CheckCheck, Phone, Languages, ArrowDownToLine, Calendar, Repeat
} from 'lucide-react';
import { AppView, Client, Contract, FileNode, Language } from './types';
import { STATIONS, EBRS_SQL_SCHEMA } from './constants';
import { translations } from './translations';
import { getSchemaInsights, getComplianceExplanation, getFastAPIImplementation, getPDFEngineCode, getSecurityEngineCode, getPricingEngineCode, getReportingEngineCode, getDevOpsEngineCode, getAPIDocsCode, getSDKCode, getMigrationEngineCode, getWhatsAppIntegrationCode, getAccountingIntegrationCode } from './services/geminiService';

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

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.LOGIN);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
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

  if (activeView === AppView.LOGIN) return <LoginPage onLogin={() => { setIsAuth(true); setActiveView(AppView.APP_DASHBOARD); }} t={t} />;

  // PWA Mode overrides the entire layout
  if ((activeView as any) === AppView.MOBILE_PWA) return <MobilePWA onBack={() => setActiveView(AppView.APP_DASHBOARD)} t={t} />;

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shrink-0 border-r border-slate-800`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 h-16 shrink-0">
          <div className="bg-emerald-500 p-2 rounded-lg shrink-0">
            <Radio className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight truncate">Freedom <span className="text-emerald-400">ECIRS</span></span>}
        </div>

        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-6">
          {/* Main App Navigation */}
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.operations}</p>}
            <NavItem icon={<LayoutDashboard size={20} />} label={t.dashboard} isActive={activeView === AppView.APP_DASHBOARD} onClick={() => setActiveView(AppView.APP_DASHBOARD)} isOpen={isSidebarOpen} />
            <NavItem icon={<Users size={20} />} label={t.clients} isActive={activeView === AppView.CLIENTS} onClick={() => setActiveView(AppView.CLIENTS)} isOpen={isSidebarOpen} />
            <NavItem icon={<Briefcase size={20} />} label={t.contracts} isActive={activeView === AppView.CONTRACTS} onClick={() => setActiveView(AppView.CONTRACTS)} isOpen={isSidebarOpen} />
            <NavItem icon={<FileText size={20} />} label={t.invoices} isActive={activeView === AppView.INVOICES} onClick={() => setActiveView(AppView.INVOICES)} isOpen={isSidebarOpen} />
            <NavItem icon={<Receipt size={20} />} label={t.receipts} isActive={activeView === AppView.RECEIPTS} onClick={() => setActiveView(AppView.RECEIPTS)} isOpen={isSidebarOpen} />
            <NavItem icon={<BarChart3 size={20} />} label={t.reports} isActive={activeView === AppView.REPORTS} onClick={() => setActiveView(AppView.REPORTS)} isOpen={isSidebarOpen} />
          </div>

          {/* Mobile Field App */}
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.field_ops}</p>}
            <NavItem icon={<Smartphone size={20} />} label={t.mobile_pwa} isActive={(activeView as any) === AppView.MOBILE_PWA} onClick={() => setActiveView(AppView.MOBILE_PWA)} isOpen={isSidebarOpen} />
            <NavItem icon={<ShieldCheck size={20} />} label={t.verify_doc} isActive={activeView === AppView.VERIFICATION_PORTAL} onClick={() => setActiveView(AppView.VERIFICATION_PORTAL)} isOpen={isSidebarOpen} />
          </div>

          {/* Developer/Architect Navigation */}
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.architect_portal}</p>}
            <NavItem icon={<Database size={20} />} label={t.sql_schema} isActive={activeView === AppView.SCHEMA} onClick={() => setActiveView(AppView.SCHEMA)} isOpen={isSidebarOpen} />
            <NavItem icon={<Server size={20} />} label={t.backend_api} isActive={activeView === AppView.BACKEND_API} onClick={() => setActiveView(AppView.BACKEND_API)} isOpen={isSidebarOpen} />
            <NavItem icon={<FileJson size={20} />} label={t.pdf_engine} isActive={activeView === AppView.DOCUMENT_ENGINE} onClick={() => setActiveView(AppView.DOCUMENT_ENGINE)} isOpen={isSidebarOpen} />
            <NavItem icon={<Shield size={20} />} label={t.security_arch} isActive={activeView === AppView.SECURITY_ARCHITECT} onClick={() => setActiveView(AppView.SECURITY_ARCHITECT)} isOpen={isSidebarOpen} />
            <NavItem icon={<Calculator size={20} />} label={t.rate_cards} isActive={activeView === AppView.RATE_CARD_ARCHITECT} onClick={() => setActiveView(AppView.RATE_CARD_ARCHITECT)} isOpen={isSidebarOpen} />
            <NavItem icon={<PieChart size={20} />} label={t.reports_arch} isActive={activeView === AppView.REPORTS_ARCHITECT} onClick={() => setActiveView(AppView.REPORTS_ARCHITECT)} isOpen={isSidebarOpen} />
            <NavItem icon={<Cpu size={20} />} label={t.devops_arch} isActive={activeView === AppView.DEVOPS_ARCHITECT} onClick={() => setActiveView(AppView.DEVOPS_ARCHITECT)} isOpen={isSidebarOpen} />
            <NavItem icon={<Code2 size={20} />} label={t.api_docs} isActive={activeView === AppView.API_DOCS_ARCHITECT} onClick={() => setActiveView(AppView.API_DOCS_ARCHITECT)} isOpen={isSidebarOpen} />
            <NavItem icon={<FileSpreadsheet size={20} />} label={t.data_migration} isActive={activeView === AppView.DATA_MIGRATION} onClick={() => setActiveView(AppView.DATA_MIGRATION)} isOpen={isSidebarOpen} />
            <NavItem icon={<MessageSquare size={20} />} label={t.whatsapp_arch} isActive={activeView === AppView.WHATSAPP_INTEGRATION} onClick={() => setActiveView(AppView.WHATSAPP_INTEGRATION)} isOpen={isSidebarOpen} />
            <NavItem icon={<Banknote size={20} />} label={t.accounting_arch} isActive={activeView === AppView.ACCOUNTING_INTEGRATION} onClick={() => setActiveView(AppView.ACCOUNTING_INTEGRATION)} isOpen={isSidebarOpen} />
          </div>

          {/* System Navigation */}
          <div>
            {isSidebarOpen && <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.system}</p>}
            <NavItem icon={<Shield size={20} />} label={t.admin} isActive={activeView === AppView.ADMIN} onClick={() => setActiveView(AppView.ADMIN)} isOpen={isSidebarOpen} />
            <NavItem icon={<Settings size={20} />} label={t.settings} isActive={activeView === AppView.SETTINGS} onClick={() => setActiveView(AppView.SETTINGS)} isOpen={isSidebarOpen} />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">{t.logout}</span>}
          </button>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
              {activeView.toLowerCase().replace('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
             >
                <Languages size={14} className="text-emerald-500" />
                <span>{language === Language.ENGLISH ? 'Hausa (HA)' : 'English (EN)'}</span>
             </button>

             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-slate-800">Sadiq Ibrahim</p>
               <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{t.station_manager}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-700 shadow-inner">SI</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === AppView.APP_DASHBOARD && <LiveDashboard station={selectedStation} t={t} />}
          {activeView === AppView.CLIENTS && <ClientManagement clients={MOCK_CLIENTS} t={t} />}
          {activeView === AppView.CONTRACTS && <ContractManagement contracts={MOCK_CONTRACTS} t={t} />}
          {activeView === AppView.INVOICES && <InvoiceManagement contracts={MOCK_CONTRACTS} t={t} />}
          {activeView === AppView.RECEIPTS && <ReceiptManagement clients={MOCK_CLIENTS} t={t} />}
          {activeView === AppView.REPORTS && <ReportsDashboard t={t} />}
          {activeView === AppView.VERIFICATION_PORTAL && <VerificationPortal t={t} />}
          {activeView === AppView.SCHEMA && <SchemaViewer schema={EBRS_SQL_SCHEMA} onCopy={() => {}} t={t} />}
          {activeView === AppView.BACKEND_API && <BackendAPIArchitect />}
          {activeView === AppView.DOCUMENT_ENGINE && <DocumentEngineArchitect />}
          {activeView === AppView.SECURITY_ARCHITECT && <SecurityEngineArchitect />}
          {activeView === AppView.RATE_CARD_ARCHITECT && <RateCardArchitect />}
          {activeView === AppView.REPORTS_ARCHITECT && <ReportsArchitect />}
          {activeView === AppView.DEVOPS_ARCHITECT && <DevOpsArchitect />}
          {activeView === AppView.API_DOCS_ARCHITECT && <APIDocsArchitect />}
          {activeView === AppView.DATA_MIGRATION && <DataMigrationArchitect />}
          {activeView === AppView.WHATSAPP_INTEGRATION && <WhatsAppArchitect />}
          {activeView === AppView.ACCOUNTING_INTEGRATION && <AccountingArchitect />}
        </div>
      </main>
    </div>
  );
};

// --- ACCOUNTING ARCHITECT COMPONENT ---

const AccountingArchitect: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'DASHBOARD' | 'SCHEDULER' | 'CODE'>('DASHBOARD');
    const [selectedSoftware, setSelectedSoftware] = useState<string>('QuickBooks');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const loadAccountingCode = async (software: string) => {
        setLoading(true);
        try {
            const res = await getAccountingIntegrationCode(software);
            setCode(res || "# Integration failed.");
        } catch (e) {
            setCode("# Service Unavailable.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (selectedTab === 'CODE') loadAccountingCode(selectedSoftware); }, [selectedTab, selectedSoftware]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
               <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                  {['DASHBOARD', 'SCHEDULER', 'CODE'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setSelectedTab(tab as any)}
                      className={`px-8 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                        selectedTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>
               <div className="flex items-center gap-4">
                  <select 
                    value={selectedSoftware}
                    onChange={(e) => setSelectedSoftware(e.target.value)}
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none shadow-xl shadow-slate-900/10"
                  >
                    <option>QuickBooks</option>
                    <option>Sage 50</option>
                    <option>Generic CSV</option>
                  </select>
               </div>
            </div>

            {selectedTab === 'DASHBOARD' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                       <h3 className="text-xl font-black mb-8 flex items-center gap-3"><ArrowDownToLine className="text-emerald-500" /> Export History</h3>
                       <div className="space-y-4">
                          <ExportLogItem software="QuickBooks" status="success" date="Today, 04:00 AM" records={124} />
                          <ExportLogItem software="QuickBooks" status="success" date="Yesterday, 04:00 AM" records={89} />
                          <ExportLogItem software="Sage 50" status="failed" date="20 Sep, 04:00 AM" records={0} error="API Timeout" />
                          <ExportLogItem software="Generic CSV" status="success" date="19 Sep, 04:00 AM" records={412} />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Active Connectors</h4>
                          <div className="space-y-4">
                             <ConnectorBadge name="QuickBooks IIF" active={true} />
                             <ConnectorBadge name="Sage CSV Engine" active={true} />
                             <ConnectorBadge name="Direct SQL Link" active={false} />
                          </div>
                       </div>
                       <button className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                          <Zap size={18} /> Trigger Manual Export
                       </button>
                    </div>
                </div>
            )}

            {selectedTab === 'SCHEDULER' && (
                <div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-10">
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black">Automated Export Schedule</h3>
                      <p className="text-sm text-slate-500 font-medium">Configure recurring background syncs</p>
                   </div>
                   <div className="space-y-8">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                         <div className="flex items-center gap-4">
                            <Calendar className="text-slate-400" />
                            <div><p className="text-sm font-bold">Daily Close Export</p><p className="text-[10px] text-slate-400">Exports all closed invoices for the day</p></div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-black">04:00 AM</span>
                            <div className="w-10 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                         <div className="flex items-center gap-4">
                            <Repeat className="text-slate-400" />
                            <div><p className="text-sm font-bold">Weekly Reconciliation</p><p className="text-[10px] text-slate-400">Full audit log and balance sync</p></div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-black">Sun, 12:00 AM</span>
                            <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                         </div>
                      </div>
                   </div>
                </div>
            )}

            {selectedTab === 'CODE' && (
                <div className="bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden min-h-[600px]">
                    <div className="h-16 bg-slate-800/50 flex items-center px-8 border-b border-slate-700 justify-between">
                       <div className="flex items-center gap-3">
                          <Terminal size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">integrations/accounting/{selectedSoftware.toLowerCase().replace(' ', '_')}.py</span>
                       </div>
                    </div>
                    <div className="flex-1 p-8 overflow-auto">
                       {loading ? (
                         <div className="space-y-4 opacity-20">
                            {[...Array(15)].map((_, i) => (<div key={i} className={`h-3 bg-emerald-900 rounded-full ${i % 3 === 0 ? 'w-1/3' : 'w-full'}`} />))}
                         </div>
                       ) : (
                         <pre className="code-font text-emerald-400/90 text-[13px] leading-relaxed whitespace-pre font-medium selection:bg-emerald-500/30">
                            {code}
                         </pre>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ExportLogItem: React.FC<{ software: string; status: 'success' | 'failed'; date: string; records: number; error?: string }> = ({ software, status, date, records, error }) => (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors">
       <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${status === 'success' ? 'bg-white text-emerald-500' : 'bg-red-50 text-red-500'}`}>
             {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
             <p className="text-sm font-black text-slate-800">{software} Sync</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date} • {records} Records</p>
          </div>
       </div>
       <div className="text-right">
          {error ? <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{error}</span> : <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Completed</span>}
       </div>
    </div>
);

const ConnectorBadge: React.FC<{ name: string; active: boolean }> = ({ name, active }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
       <span className="text-[11px] font-bold text-slate-700">{name}</span>
       <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300'}`} />
    </div>
);

// --- WHATSAPP ARCHITECT COMPONENT ---

const WhatsAppArchitect: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'DASHBOARD' | 'TEMPLATES' | 'CODE' | 'PREVIEW'>('DASHBOARD');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('Invoice_Ready');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const templates = [
        { id: 'Invoice_Ready', label: 'Invoice Notification', text: 'Hello {{1}}, your invoice for the {{2}} campaign is ready. View it here: {{3}}' },
        { id: 'Payment_Receipt', label: 'Payment Receipt', text: 'Thank you {{1}}! We have received your payment of ₦{{2}}. Download your receipt: {{3}}' },
        { id: 'Reminder', label: 'Payment Reminder', text: 'Gentle reminder to {{1}}: Invoice {{2}} is due for payment. Thank you for your business.' },
    ];

    const loadWhatsAppCode = async (type: string) => {
        setLoading(true);
        try {
            const res = await getWhatsAppIntegrationCode(type);
            setCode(res || "# Integration failed.");
        } catch (e) {
            setCode("# Service Unavailable.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (selectedTab === 'CODE') loadWhatsAppCode('Full Integration Module'); }, [selectedTab]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
               <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                  {['DASHBOARD', 'TEMPLATES', 'CODE', 'PREVIEW'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setSelectedTab(tab as any)}
                      className={`px-8 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                        selectedTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Cloud API: Active</span>
                  </div>
               </div>
            </div>

            {selectedTab === 'DASHBOARD' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                       <h3 className="text-xl font-black mb-8">Recent Messaging Activity</h3>
                       <div className="space-y-4">
                          <MessageStatusItem client="Dangote PLC" type="Invoice" status="read" time="2m ago" />
                          <MessageStatusItem client="MTN Nigeria" type="Receipt" status="delivered" time="15m ago" />
                          <MessageStatusItem client="BUA Group" type="Reminder" status="sent" time="1h ago" />
                          <MessageStatusItem client="Alhaji Aminu" type="Invoice" status="failed" time="3h ago" />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <StatWidget label="Sent Today" value="142" color="emerald" />
                       <StatWidget label="Read Rate" value="84%" color="blue" />
                       <StatWidget label="Failed" value="3" color="red" />
                    </div>
                </div>
            )}

            {selectedTab === 'TEMPLATES' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                      <h4 className="text-lg font-black">Managed Templates</h4>
                      <div className="space-y-3">
                         {templates.map(t => (
                           <button 
                             key={t.id} 
                             onClick={() => setSelectedTemplate(t.id)}
                             className={`w-full text-left p-6 rounded-3xl border-2 transition-all ${
                               selectedTemplate === t.id ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-200'
                             }`}
                           >
                              <div className="flex justify-between items-center mb-2">
                                 <span className="font-black text-sm">{t.label}</span>
                                 <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Approved</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{t.text}</p>
                           </button>
                         ))}
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10">Create New Template</button>
                   </div>
                   <div className="bg-[#E4DBD0] rounded-[50px] p-10 flex items-center justify-center border-8 border-slate-900 shadow-2xl relative overflow-hidden h-[600px]">
                      <div className="absolute top-0 left-0 right-0 h-16 bg-slate-800 flex items-center px-6 gap-3 text-white z-10">
                         <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center"><Phone size={14} /></div>
                         <div>
                            <p className="text-xs font-bold">Freedom Radio ECIRS</p>
                            <p className="text-[8px] opacity-60">Business Account</p>
                         </div>
                      </div>
                      <div className="w-full max-w-[280px] space-y-4 animate-in slide-in-from-bottom-8 duration-700">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm relative">
                            <p className="text-[11px] text-slate-800 leading-relaxed">
                               {templates.find(t => t.id === selectedTemplate)?.text.replace('{{1}}', 'Alhaji Musa').replace('{{2}}', 'Q4 Build').replace('{{3}}', 'https://ebrs.fr/v/123')}
                            </p>
                            <span className="block text-right text-[8px] text-slate-400 mt-1">10:42 AM</span>
                         </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/40 backdrop-blur-md px-6 flex items-center justify-between border-t border-white/20">
                         <div className="w-3/4 h-8 bg-white rounded-full px-4 flex items-center text-[10px] text-slate-300">Type message...</div>
                         <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white"><Send size={14} /></div>
                      </div>
                   </div>
                </div>
            )}

            {selectedTab === 'CODE' && (
                <div className="bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden min-h-[600px]">
                    <div className="h-16 bg-slate-800/50 flex items-center px-8 border-b border-slate-700 justify-between">
                       <div className="flex items-center gap-3">
                          <Terminal size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">integrations/whatsapp_business.py</span>
                       </div>
                    </div>
                    <div className="flex-1 p-8 overflow-auto">
                       {loading ? (
                         <div className="space-y-4 opacity-20">
                            {[...Array(15)].map((_, i) => (<div key={i} className={`h-3 bg-emerald-900 rounded-full ${i % 3 === 0 ? 'w-1/3' : 'w-full'}`} />))}
                         </div>
                       ) : (
                         <pre className="code-font text-emerald-400/90 text-[13px] leading-relaxed whitespace-pre font-medium selection:bg-emerald-500/30">
                            {code}
                         </pre>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};

const MessageStatusItem: React.FC<{ client: string; type: string; status: 'sent' | 'delivered' | 'read' | 'failed'; time: string }> = ({ client, type, status, time }) => {
    const statusIcons = {
        sent: <Check size={14} className="text-slate-400" />,
        delivered: <CheckCheck size={14} className="text-slate-400" />,
        read: <CheckCheck size={14} className="text-blue-500" />,
        failed: <AlertTriangle size={14} className="text-red-500" />
    };
    return (
        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                 <FileText size={18} />
              </div>
              <div>
                 <p className="text-sm font-black text-slate-800">{client}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type} Notification</p>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] text-slate-400 font-bold">{time}</span>
              <div className="flex items-center gap-2">
                 <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'failed' ? 'text-red-500' : 'text-slate-500'}`}>{status}</span>
                 {statusIcons[status]}
              </div>
           </div>
        </div>
    );
};

const StatWidget: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-3xl font-black text-${color}-600 tracking-tight`}>{value}</p>
    </div>
);

// --- DATA MIGRATION ARCHITECT COMPONENT ---

const DataMigrationArchitect: React.FC = () => {
    const [step, setStep] = useState<'UPLOAD' | 'VALIDATE' | 'EXECUTE' | 'LOGS'>('UPLOAD');
    const [selectedType, setSelectedType] = useState<string>('Clients');
    const [fileName, setFileName] = useState<string | null>(null);
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const dataTypes = ['Clients', 'Contracts', 'Historical Billings', 'Rate Cards'];

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
            setStep('VALIDATE');
        }
    };

    const loadMigrationCode = async (type: string) => {
        setLoading(true);
        try {
            const res = await getMigrationEngineCode(type);
            setCode(res || "# Migration logic generation failed.");
        } catch (e) {
            setCode("# Service Unavailable.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (step === 'EXECUTE') loadMigrationCode(selectedType); }, [step, selectedType]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Legacy Data Migration</h3>
                  <p className="text-sm text-slate-500 font-medium">Bulk import from Excel/CSV to ECIRS Production</p>
               </div>
               <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl">
                  {['UPLOAD', 'VALIDATE', 'EXECUTE', 'LOGS'].map(s => (
                    <div key={s} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${step === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>
                       {s}
                    </div>
                  ))}
               </div>
            </div>

            {step === 'UPLOAD' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                      <h4 className="text-lg font-black">Migration Parameters</h4>
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Category</label>
                            <select 
                              value={selectedType} 
                              onChange={(e) => setSelectedType(e.target.value)}
                              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none ring-2 ring-transparent focus:ring-slate-900 transition-all"
                            >
                               {dataTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-2">
                      <label className="relative block h-[450px] bg-white border-4 border-dashed border-slate-200 rounded-[50px] cursor-pointer hover:border-slate-900 transition-all group overflow-hidden">
                         <input type="file" className="hidden" onChange={handleUpload} accept=".xlsx, .xls, .csv" />
                         <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all">
                               <UploadCloud size={48} />
                            </div>
                            <div className="text-center">
                               <p className="text-xl font-black text-slate-800 tracking-tight">Drop Migration File Here</p>
                            </div>
                         </div>
                      </label>
                   </div>
                </div>
            )}

            {step === 'VALIDATE' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                   <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><FileSpreadsheet size={32} /></div>
                         <div>
                            <p className="text-lg font-black text-slate-900">{fileName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type: {selectedType}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <button onClick={() => setStep('UPLOAD')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                         <button onClick={() => setStep('EXECUTE')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20">Validate Records</button>
                      </div>
                   </div>
                </div>
            )}

            {step === 'EXECUTE' && (
                <div className="flex gap-8 h-[650px]">
                   <div className="w-80 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col shrink-0">
                      <h4 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                         <Cpu size={20} className="text-emerald-500" /> Auto-Mapper
                      </h4>
                      <div className="space-y-6 flex-1">
                         <MappingItem excel="Company_Name" db="company_name" status="success" />
                      </div>
                      <button className="w-full bg-emerald-500 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 mt-8 active:scale-95 transition-all">
                         Commit Migration
                      </button>
                   </div>

                   <div className="flex-1 bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
                      <div className="h-16 bg-slate-800/50 flex items-center px-8 border-b border-slate-700 justify-between">
                         <div className="flex items-center gap-3">
                            <Terminal size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">migration_engine/{selectedType.toLowerCase()}_transform.py</span>
                         </div>
                      </div>
                      <div className="flex-1 p-8 overflow-auto">
                         {loading ? (
                           <div className="space-y-4 opacity-20">
                              {[...Array(15)].map((_, i) => (<div key={i} className={`h-3 bg-emerald-900 rounded-full ${i % 3 === 0 ? 'w-1/3' : 'w-full'}`} />))}
                           </div>
                         ) : (
                           <pre className="code-font text-emerald-400/90 text-[13px] leading-relaxed whitespace-pre font-medium selection:bg-emerald-500/30">
                              {code}
                           </pre>
                         )}
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};

const ValidationStat: React.FC<{ label: string; value: string; color: string; icon?: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center justify-between">
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black text-${color}-600 tracking-tighter`}>{value}</p>
     </div>
     {icon && <div className={`text-${color}-500`}>{icon}</div>}
  </div>
);

const MappingItem: React.FC<{ excel: string; db: string; status: 'success' | 'warning' }> = ({ excel, db, status }) => (
  <div className="flex items-center gap-4">
     <div className={`p-2 rounded-lg ${status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
        <Table size={14} />
     </div>
     <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
           <span className="text-[10px] font-black text-slate-400 truncate">{excel}</span>
           <div className="h-[1px] flex-1 bg-slate-100" />
           <span className="text-[10px] font-black text-slate-900 truncate">{db}</span>
        </div>
     </div>
  </div>
);

// --- NAVIGATION ITEM ---

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

// --- API DOCS ARCHITECT COMPONENT ---

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
                const res = await getSDKCode(item);
                setCode(res || "# SDK generation failed.");
            }
        } catch (e) {
            setCode("# Service Unavailable.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTab === 'SWAGGER') loadAPIData('SWAGGER', selectedEndpointSet);
        if (selectedTab === 'SDK') loadAPIData('SDK', 'Python');
    }, [selectedTab, selectedEndpointSet]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
               <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                  {['SWAGGER', 'SDK', 'GUIDE'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setSelectedTab(tab as any)}
                      className={`px-8 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                        selectedTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab} {tab === 'SWAGGER' ? 'SPEC' : tab === 'SDK' ? 'CLIENT' : 'PORTAL'}
                    </button>
                  ))}
               </div>
            </div>

            {selectedTab === 'SWAGGER' && (
                <div className="flex gap-8 h-[700px]">
                   <div className="w-64 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm shrink-0 flex flex-col">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">API Resources</h5>
                      <div className="space-y-2 flex-1">
                         {endpointSets.map(set => (
                           <button 
                             key={set} 
                             onClick={() => setSelectedEndpointSet(set)}
                             className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold transition-all ${
                               selectedEndpointSet === set ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                             }`}
                           >
                             {set}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="flex-1 bg-slate-900 rounded-[40px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
                      <div className="h-16 bg-slate-800/50 flex items-center px-8 border-b border-slate-700 justify-between">
                         <div className="flex items-center gap-3">
                            <BookOpen size={14} className="text-blue-400" />
                            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">openapi-ecirs-{selectedEndpointSet.toLowerCase()}.yaml</span>
                         </div>
                      </div>
                      <div className="flex-1 p-8 overflow-auto">
                         {loading ? (
                           <div className="space-y-4 opacity-20">
                              {[...Array(15)].map((_, i) => (<div key={i} className={`h-3 bg-blue-900 rounded-full ${i % 3 === 0 ? 'w-1/3' : 'w-full'}`} />))}
                           </div>
                         ) : (
                           <pre className="code-font text-blue-300 text-[13px] leading-relaxed whitespace-pre font-medium selection:bg-blue-500/30">
                              {code}
                           </pre>
                         )}
                      </div>
                   </div>
                </div>
            )}
        </div>
    );
};

// --- PWA, CRM, AND CORE COMPONENTS ---

const MobilePWA: React.FC<{ onBack: () => void; t: any }> = ({ onBack, t }) => {
  const [mobileView, setMobileView] = useState<'HOME' | 'CLIENTS' | 'QUOTE' | 'PAYMENT'>('HOME');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-[100] max-w-md mx-auto shadow-2xl overflow-hidden">
      <div className="bg-[#1B4F72] p-6 text-white shrink-0 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10"><Radio size={20} className="text-emerald-400" /></div>
          <div>
            <h1 className="font-black text-lg tracking-tight">{t.field_ebrs}</h1>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-1">
              {isOnline ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}
              {isOnline ? t.online_sync : t.offline_mode}
            </p>
          </div>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
        {mobileView === 'HOME' && <MobileHome onSelect={(view) => setMobileView(view as any)} t={t} />}
        {mobileView === 'CLIENTS' && <MobileClientList clients={MOCK_CLIENTS} t={t} />}
        {mobileView === 'QUOTE' && <MobileQuickQuote clients={MOCK_CLIENTS} t={t} />}
        {mobileView === 'PAYMENT' && <MobilePaymentRecord clients={MOCK_CLIENTS} t={t} />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <MobileNavItem icon={<Home size={22} />} active={mobileView === 'HOME'} onClick={() => setMobileView('HOME')} />
        <MobileNavItem icon={<Users size={22} />} active={mobileView === 'CLIENTS'} onClick={() => setMobileView('CLIENTS')} />
        <button onClick={() => setMobileView('QUOTE')} className="bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-xl shadow-emerald-500/30 border-4 border-white transition-transform active:scale-95"><Plus size={28} /></button>
        <MobileNavItem icon={<CreditCard size={22} />} active={mobileView === 'PAYMENT'} onClick={() => setMobileView('PAYMENT')} />
        <MobileNavItem icon={<Settings size={22} />} active={false} onClick={() => alert('Settings available soon')} />
      </div>
    </div>
  );
};

const MobileNavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400'}`}>
    {icon}
  </button>
);

const MobileHome: React.FC<{ onSelect: (v: string) => void; t: any }> = ({ onSelect, t }) => (
  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-2 gap-4">
       <MobileStat label="Today Sales" value="₦2.4M" color="emerald" icon={<TrendingUp size={16} />} />
       <MobileStat label="Invoices" value="14" color="blue" icon={<FileText size={16} />} />
    </div>
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t.quick_actions}</h4>
       <div className="grid grid-cols-3 gap-4">
          <MobileAction icon={<Zap />} label="QUOTE" color="purple" onClick={() => onSelect('QUOTE')} />
          <MobileAction icon={<CreditCard />} label="PAY" color="orange" onClick={() => onSelect('PAYMENT')} />
          <MobileAction icon={<Smartphone />} label="Verify" color="blue" onClick={() => alert('Verification tool loaded')} />
       </div>
    </div>
    <div className="space-y-4">
       <div className="flex justify-between items-center px-2">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.recent_activity}</h4>
       </div>
       {[1, 2, 3].map(i => (
         <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Briefcase size={18} /></div>
               <div><p className="text-sm font-bold text-slate-800">New Contract Generated</p><p className="text-[10px] text-slate-500">2 mins ago</p></div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
         </div>
       ))}
    </div>
  </div>
);

const MobileStat: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm space-y-2">
     <div className={`w-8 h-8 rounded-xl bg-${color}-50 text-${color}-500 flex items-center justify-center`}>{icon}</div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
     <p className="text-lg font-black text-slate-900">{value}</p>
  </div>
);

const MobileAction: React.FC<{ icon: React.ReactNode; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-2 group">
     <div className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-500 flex items-center justify-center border border-${color}-100 shadow-sm`}>{icon}</div>
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </button>
);

const MobileClientList: React.FC<{ clients: Client[]; t: any }> = ({ clients, t }) => (
  <div className="space-y-4">
    <input type="text" placeholder={t.search_clients} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none font-bold" />
    <div className="space-y-3">
       {clients.map(c => (
         <div key={c.id} className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">{c.company_name[0]}</div>
               <div><p className="text-sm font-black text-slate-900">{c.company_name}</p></div>
            </div>
            <p className="text-xs font-black text-slate-900">₦{(c.balance/100).toLocaleString()}</p>
         </div>
       ))}
    </div>
  </div>
);

const MobileQuickQuote: React.FC<{ clients: Client[]; t: any }> = ({ clients, t }) => {
  const [step, setStep] = useState(1);
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-8 animate-in slide-in-from-right-4 duration-500">
       <h3 className="text-xl font-black text-slate-900">Quick Quote</h3>
       {step === 1 && (
         <div className="space-y-6">
            <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm">
               {clients.map(c => <option key={c.id}>{c.company_name}</option>)}
            </select>
            <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black">{t.continue}</button>
         </div>
       )}
       {step === 2 && (
         <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
               <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Campaign Total:</span><span className="text-xl font-black text-slate-900">₦84,200.00</span></div>
            </div>
            <button onClick={() => setStep(1)} className="w-full py-4 bg-emerald-500 text-white rounded-3xl font-black">Share Quote</button>
         </div>
       )}
    </div>
  );
};

const MobilePaymentRecord: React.FC<{ clients: Client[]; t: any }> = ({ clients, t }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-8 animate-in slide-in-from-left-4 duration-500">
     <h3 className="text-xl font-black text-slate-900">{t.record_payment}</h3>
     <div className="space-y-6">
        <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm">
           {clients.map(c => <option key={c.id}>{c.company_name}</option>)}
        </select>
        <input type="number" placeholder="0.00" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-2xl" />
        <button onClick={() => alert('Synced')} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black">{t.continue}</button>
     </div>
  </div>
);

const LoginPage: React.FC<{ onLogin: () => void; t: any }> = ({ onLogin, t }) => {
  const [step, setStep] = useState(1);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (step === 1) setStep(2); else onLogin(); };
  return (
    <div className="h-screen w-full flex bg-slate-900 justify-center items-center p-6">
      <div className="w-full max-w-md bg-white p-12 rounded-3xl shadow-2xl">
        <div className="mb-10 text-center"><Radio className="text-emerald-500 mx-auto mb-4" size={48} /><h2 className="text-2xl font-black">{t.app_name}</h2></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" placeholder={step === 1 ? t.phone_number : t.otp_code} className="w-full px-4 py-4 bg-slate-100 rounded-2xl font-bold" />
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all">{t.continue}</button>
        </form>
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

const StatCard: React.FC<{ label: string; value: string; trend: string; icon: React.ReactNode; color: string }> = ({ label, value, trend, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><div className={`p-3 rounded-xl bg-${color}-50 text-${color}-500 mb-4`}>{icon}</div><p className="text-xs font-bold text-slate-500">{label}</p><p className="text-2xl font-black text-slate-900">{value}</p></div>
);

const ClientManagement: React.FC<{ clients: Client[]; t: any }> = ({ clients, t }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b">
        <tr><th className="px-6 py-4">{t.clients}</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Balance</th><th className="px-6 py-4 text-right">{t.actions}</th></tr>
      </thead>
      <tbody>{clients.map(c => (<tr key={c.id} className="hover:bg-slate-50 border-b"><td className="px-6 py-4 font-bold">{c.company_name}</td><td className="px-6 py-4 uppercase text-[10px] font-bold">{c.type}</td><td className="px-6 py-4 font-black">₦{(c.balance/100).toLocaleString()}</td><td className="px-6 py-4 text-right"><ChevronRight size={18} /></td></tr>))}</tbody>
    </table>
  </div>
);

const ContractManagement: React.FC<{ contracts: Contract[]; t: any }> = ({ contracts, t }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b">
        <tr><th className="px-6 py-4">Doc No</th><th className="px-6 py-4">{t.clients}</th><th className="px-6 py-4">{t.status}</th><th className="px-6 py-4 text-right">{t.actions}</th></tr>
      </thead>
      <tbody>{contracts.map(c => (<tr key={c.id} className="border-b"><td className="px-6 py-4 font-mono text-[11px]">{c.doc_num}</td><td className="px-6 py-4 font-bold">{c.client_name}</td><td className="px-6 py-4"><span className="text-[9px] font-black uppercase px-2 py-1 bg-emerald-100 text-emerald-700 rounded">{c.status}</span></td><td className="px-6 py-4 text-right"><Eye size={18} /></td></tr>))}</tbody>
    </table>
  </div>
);

const InvoiceManagement: React.FC<{ contracts: Contract[]; t: any }> = ({ contracts, t }) => <div className="text-slate-500 italic">Invoice workspace...</div>;
const ReceiptManagement: React.FC<{ clients: Client[]; t: any }> = ({ clients, t }) => <div className="text-slate-500 italic">Receipt terminal...</div>;
const ReportsDashboard: React.FC<{ t: any }> = ({ t }) => <div className="text-slate-500 italic">BI Dashboard...</div>;

// --- ARCHITECT TOOLS ---
const SchemaViewer: React.FC<{ schema: string; onCopy: (s: string) => void; t: any }> = ({ schema, onCopy, t }) => (
  <div className="space-y-4"><div className="flex justify-between items-center bg-white p-4 rounded-xl border"><span>PostgreSQL DDL</span><button onClick={() => onCopy(schema)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black">Copy SQL</button></div><div className="bg-slate-900 rounded-[40px] p-8 overflow-auto border border-slate-800"><pre className="code-font text-emerald-400 text-xs">{schema}</pre></div></div>
);

const BackendAPIArchitect: React.FC = () => {
    const [fileContent, setFileContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getFastAPIImplementation('app/main.py', "FastAPI core"); setFileContent(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{fileContent}</pre>}</div>);
};

const DocumentEngineArchitect: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getPDFEngineCode('ContractGenerator'); setCode(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{code}</pre>}</div>);
};

const SecurityEngineArchitect: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getSecurityEngineCode('KeyManager'); setCode(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{code}</pre>}</div>);
};

const RateCardArchitect: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getPricingEngineCode('PricingEngine'); setCode(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating Pricing Logic...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{code}</pre>}</div>);
};

const ReportsArchitect: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getReportingEngineCode('FinancialAnalyticsReport'); setCode(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating Report Logic...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{code}</pre>}</div>);
};

const DevOpsArchitect: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    useEffect(() => { const load = async () => { setLoading(true); const res = await getDevOpsEngineCode('Infrastructure as Code (Terraform + Docker)'); setCode(res || "# Error"); setLoading(false); }; load(); }, []);
    return (<div className="bg-slate-900 rounded-[40px] p-8 min-h-[500px] border border-slate-800">{loading ? <div className="text-emerald-500">Generating Infrastructure Config...</div> : <pre className="code-font text-emerald-400 text-xs leading-relaxed">{code}</pre>}</div>);
};

const VerificationPortal: React.FC<{ t: any }> = ({ t }) => {
  return (<div className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-xl text-center">Verification Portal Placeholder</div>);
};

export default App;
