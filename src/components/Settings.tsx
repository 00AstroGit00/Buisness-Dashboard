/**
 * Settings Component
 * Features: QR Code generation for mobile access and system configuration.
 */

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Settings as SettingsIcon, 
  Smartphone, 
  Wifi, 
  Monitor, 
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function Settings() {
  const [localIp, setLocalIp] = useState<string>('Loading...');
  const [isCopied, setIsCopied] = useState(false);

  // In a browser, we can't easily get the local IP, so we'll suggest using window.location
  const dashboardUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;

  useEffect(() => {
    setLocalIp(window.location.hostname);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(dashboardUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-forest-green flex items-center gap-3 font-serif">
          <SettingsIcon className="text-brushed-gold" size={32} />
          System Settings
        </h2>
        <p className="text-forest-green/60 text-sm mt-1">Configure mobile access and dashboard defaults.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Access Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-brushed-gold/20 flex flex-col items-center text-center">
          <div className="p-4 bg-forest-green rounded-2xl mb-6">
            <Smartphone className="text-brushed-gold" size={32} />
          </div>
          
          <h3 className="text-xl font-black text-forest-green mb-2 font-serif">Connect Mobile Devices</h3>
          <p className="text-gray-500 text-sm mb-8">
            Scan this QR code from your **Samsung S23 Ultra** or **MI Pad 7** to instantly open the dashboard on your local network.
          </p>

          <div className="bg-white p-6 rounded-3xl border-4 border-gray-50 shadow-inner mb-8">
            <QRCodeSVG 
              value={dashboardUrl} 
              size={200}
              fgColor="#0a3d31"
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Wifi size={18} className="text-forest-green" />
                <span className="text-sm font-bold text-forest-green">{dashboardUrl}</span>
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isCopied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-100 rounded-2xl text-forest-green">
                <Monitor size={24} />
              </div>
              <h3 className="text-lg font-black text-forest-green font-serif">Terminal Preferences</h3>
            </div>

            <div className="space-y-4">
              <ToggleSetting label="Auto-refresh Data" description="Sync stock every 30 seconds" defaultOn />
              <ToggleSetting label="Privacy Blurring" description="Blur numbers by default" />
              <ToggleSetting label="Tactile Feedback" description="Vibrate on sale (S23 Ultra)" defaultOn />
            </div>
          </div>

          <div className="bg-forest-green rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-lg font-black mb-4 font-serif">PWA Installation</h3>
            <p className="text-white/60 text-sm mb-6">
              This dashboard is configured as a standalone application. On your S23 Ultra, tap "Install App" in your browser menu to add a shortcut to your home screen.
            </p>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-brushed-gold rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-forest-green" />
              </div>
              <div>
                <p className="text-xs font-black uppercase">Service Worker: Active</p>
                <p className="text-[10px] text-white/40 font-bold">Offline Sync Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, defaultOn = false }: { label: string, description: string, defaultOn?: boolean }) {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div>
        <p className="text-sm font-black text-forest-green">{label}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{description}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`w-12 h-6 rounded-full transition-all relative ${isOn ? 'bg-brushed-gold' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOn ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}
