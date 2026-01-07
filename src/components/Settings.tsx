/**
 * Settings Component - Upgraded UI
 * Features: QR Code generation for mobile access and system configuration.
 */

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings as SettingsIcon,
  Smartphone,
  Wifi,
  Monitor,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sun,
  Moon,
  Palette,
  Bell,
  Shield,
  HardDrive,
  Network,
  Download,
  Upload,
  RotateCcw,
  Key,
  User,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Cpu,
  SmartphoneNfc,
  ChevronRight,
  ShieldCheck,
  Cloud
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

const FOREST_GREEN = '#0a3d31';

export default function Settings() {
  const [localIp, setLocalIp] = useState<string>('Loading...');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const dashboardUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;

  useEffect(() => {
    setLocalIp(window.location.hostname);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(dashboardUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'access', label: 'Terminal', icon: Smartphone },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'Engine', icon: HardDrive },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-24 font-sans">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">System Architecture</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Control <span className="text-brushed-gold">Center</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1 uppercase text-[9px] font-black tracking-widest">v4.2.0 Stable Build</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <Cpu size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Kernel Optimization: Active</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="secondary" className="rounded-2xl border-gray-100" leftIcon={<RotateCcw size={18} />}>
              Restore Defaults
           </Button>
           <Button variant="gold" className="rounded-2xl shadow-xl shadow-brushed-gold/10" leftIcon={<Download size={18} />}>
              Backup Profile
           </Button>
        </div>
      </div>

      {/* Modern Tab System */}
      <div className="bg-white/50 backdrop-blur-xl p-2 rounded-2xl border border-gray-100 inline-flex gap-1 shadow-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-forest-green text-white shadow-xl scale-[1.02]'
                : 'text-forest-green/40 hover:bg-forest-green/5 hover:text-forest-green'
              }
            `}
          >
            <tab.icon size={14} className={activeTab === tab.id ? 'text-brushed-gold' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Connectivity & Access */}
        <div className="lg:col-span-1 space-y-8">
           <Card className="border-0 shadow-2xl p-8 rounded-[2.5rem] bg-white group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><SmartphoneNfc size={120} /></div>
              <CardHeader className="relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-brushed-gold/10 text-brushed-gold rounded-2xl"><Smartphone size={24} /></div>
                    <div>
                       <CardTitle className="text-lg font-black uppercase tracking-tight">Mobile Bridge</CardTitle>
                       <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest mt-1">Cross-device Link</p>
                    </div>
                 </div>
              </CardHeader>
              
              <div className="flex flex-col items-center mt-8 relative z-10">
                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-2xl mb-8 group-hover:rotate-3 transition-transform">
                    <QRCodeSVG value={dashboardUrl} size={180} fgColor={FOREST_GREEN} level="H" includeMargin={true} />
                 </div>
                 
                 <div className="w-full space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group/link hover:border-brushed-gold/30 transition-all">
                       <div className="flex items-center gap-3 truncate">
                          <Wifi size={16} className="text-brushed-gold shrink-0" />
                          <span className="text-xs font-bold text-forest-green truncate font-mono">{dashboardUrl}</span>
                       </div>
                       <Button variant="ghost" size="xs" onClick={handleCopy} className="rounded-lg h-8 w-8 p-0">
                          {isCopied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} className="text-forest-green/40" />}
                       </Button>
                    </div>
                    <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                       Scan from S23 Ultra or Pad 7 for instant local synchronization.
                    </p>
                 </div>
              </div>
           </Card>

           <Card className="bg-forest-green border-0 shadow-2xl p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="absolute -bottom-8 -right-8 p-8 opacity-10 group-hover:scale-125 transition-transform"><Cloud size={140} /></div>
              <h3 className="text-lg font-black tracking-tight mb-4 relative z-10">PWA Deployment</h3>
              <p className="text-xs text-white/60 mb-8 font-medium leading-relaxed relative z-10">
                 This system is optimized for Progressive Web App installation. Add to Home Screen for biometric sensor integration.
              </p>
              <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 relative z-10">
                 <div className="w-12 h-12 bg-brushed-gold rounded-xl flex items-center justify-center shadow-2xl">
                    <ShieldCheck size={24} className="text-forest-green" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Service Engine: Active</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">Sync Cluster Ready</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Column: Dynamic Settings Panels */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-0 shadow-2xl p-8 rounded-[2.5rem] bg-white">
              <CardHeader>
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-forest-green/5 text-forest-green rounded-2xl"><Monitor size={24} /></div>
                    <div>
                       <CardTitle className="text-xl font-black uppercase tracking-tight">Terminal Preferences</CardTitle>
                       <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest mt-1">Interface Optimization</p>
                    </div>
                 </div>
              </CardHeader>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ToggleSetting label="Real-time Stream" description="Stock telemetry sync every 15s" defaultOn />
                 <ToggleSetting label="Neural Privacy" description="Adaptive numeric blurring engine" />
                 <ToggleSetting label="Haptic Dynamics" description="Vibration feedback on checkout" defaultOn />
                 <ToggleSetting label="Atmospheric Dark" description="OLED optimized night protocol" />
              </div>
           </Card>

           {activeTab === 'security' && (
             <Card className="border-0 shadow-2xl p-8 rounded-[2.5rem] bg-white animate-slide-in-bottom">
                <CardHeader>
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Shield size={24} /></div>
                      <div>
                         <CardTitle className="text-xl font-black uppercase tracking-tight">Security Protocol</CardTitle>
                         <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest mt-1">Encryption & Access</p>
                      </div>
                   </div>
                </CardHeader>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <ToggleSetting label="Biometric Vault" description="W3C WebAuthn fingerprint lock" defaultOn />
                   <ToggleSetting label="Quantum Session" description="Force expiration after 30m IDLE" />
                   <ToggleSetting label="AES-256 Link" description="Encrypted device-to-device mirror" defaultOn />
                   <ToggleSetting label="Deep Audit" description="Comprehensive telemetry logging" defaultOn />
                </div>
             </Card>
           )}

           {activeTab === 'system' && (
             <Card className="border-0 shadow-2xl p-8 rounded-[2.5rem] bg-white animate-slide-in-bottom">
                <CardHeader>
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Cpu size={24} /></div>
                      <div>
                         <CardTitle className="text-xl font-black uppercase tracking-tight">Kernel Engine</CardTitle>
                         <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest mt-1">Backend Configuration</p>
                      </div>
                   </div>
                </CardHeader>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <ToggleSetting label="Redundant Backups" description="Daily encrypted snapshot cloud-sync" defaultOn />
                   <ToggleSetting label="Performance Max" description="High-priority thread allocation" />
                   <ToggleSetting label="Cluster Mesh" description="Seamless multi-terminal bridging" defaultOn />
                   <ToggleSetting label="Developer HUD" description="Advanced telemetry & frame metrics" />
                </div>
             </Card>
           )}

           <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-forest-green">
                    <Lock size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-black text-forest-green uppercase tracking-tight">Enterprise Compliance</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Verified System Integrations</p>
                 </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
           </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, defaultOn = false }: { label: string, description: string, defaultOn?: boolean }) {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:border-brushed-gold/30 hover:shadow-lg transition-all duration-300 group">
      <div className="flex-1 pr-4">
        <p className="text-xs font-black text-forest-green uppercase tracking-tight group-hover:text-brushed-gold transition-colors">{label}</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{description}</p>
      </div>
      <button
        onClick={() => setIsOn(!isOn)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none shadow-inner ${
          isOn ? 'bg-forest-green' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-500 ${
            isOn ? 'translate-x-6 scale-110' : 'translate-x-1 scale-90'
          }`}
        >
           {isOn && <div className="absolute inset-0 m-auto w-1 h-1 bg-brushed-gold rounded-full"></div>}
        </span>
      </button>
    </div>
  );
}