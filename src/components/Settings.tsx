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
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const [localIp, setLocalIp] = useState<string>('Loading...');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

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

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'access', label: 'Access', icon: Smartphone },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: HardDrive },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-forest-green flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-forest-green to-forest-green-light rounded-xl text-brushed-gold">
            <SettingsIcon size={24} />
          </div>
          System Settings
        </h2>
        <p className="text-forest-green/70 text-sm mt-1">Configure dashboard preferences and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-forest-green to-forest-green-light text-brushed-gold shadow-md'
                : 'bg-gray-100 text-forest-green/70 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Access Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-forest-green to-forest-green-light rounded-xl text-brushed-gold">
              <Smartphone size={24} />
            </div>
            <h3 className="text-lg font-bold text-forest-green">Connect Mobile Devices</h3>
          </div>
          <p className="text-forest-green/60 text-sm mb-6">
            Scan this QR code from your Samsung S23 Ultra or MI Pad 7 to instantly open the dashboard on your local network.
          </p>

          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <QRCodeSVG
                value={dashboardUrl}
                size={160}
                fgColor="#0a3d31"
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <Wifi size={16} className="text-forest-green" />
                  <span className="text-sm font-medium text-forest-green truncate">{dashboardUrl}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                  title="Copy URL"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-xs text-green-600 ml-1">Copied!</span>
                    </>
                  ) : (
                    <Copy size={16} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-forest-green to-forest-green-light rounded-xl text-brushed-gold">
                <Monitor size={24} />
              </div>
              <h3 className="text-lg font-bold text-forest-green">Terminal Preferences</h3>
            </div>

            <div className="space-y-4">
              <ToggleSetting label="Auto-refresh Data" description="Sync stock every 30 seconds" defaultOn />
              <ToggleSetting label="Privacy Blurring" description="Blur numbers by default" />
              <ToggleSetting label="Tactile Feedback" description="Vibrate on sale (S23 Ultra)" defaultOn />
              <ToggleSetting label="Dark Mode" description="Use dark theme for night shifts" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-forest-green to-forest-green-light rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-3">PWA Installation</h3>
            <p className="text-white/80 text-sm mb-4">
              This dashboard is configured as a standalone application. On your S23 Ultra, tap "Install App" in your browser menu to add a shortcut to your home screen.
            </p>
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
              <div className="w-10 h-10 bg-brushed-gold rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-forest-green" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Service Worker: Active</p>
                <p className="text-[10px] text-white/60 font-medium">Offline Sync Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings Sections */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-forest-green mb-4">Privacy Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSetting label="Privacy Mode" description="Blur sensitive numbers by default" defaultOn />
            <ToggleSetting label="Incognito Mode" description="Hide recent activity" />
            <ToggleSetting label="Data Sharing" description="Allow anonymous usage data" />
            <ToggleSetting label="Screen Capture" description="Prevent screenshots of sensitive data" />
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-forest-green mb-4">Security Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSetting label="Biometric Login" description="Use fingerprint for faster access" defaultOn />
            <ToggleSetting label="Auto Logout" description="Log out after 30 minutes of inactivity" />
            <ToggleSetting label="Session Encryption" description="Encrypt all session data" defaultOn />
            <ToggleSetting label="Audit Trail" description="Log all access attempts" defaultOn />
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-forest-green mb-4">System Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSetting label="Auto-Backup" description="Backup data every 24 hours" defaultOn />
            <ToggleSetting label="Performance Mode" description="Optimize for faster performance" />
            <ToggleSetting label="Network Sync" description="Sync data across devices" defaultOn />
            <ToggleSetting label="Debug Mode" description="Show advanced debugging info" />
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSetting({ label, description, defaultOn = false }: { label: string, description: string, defaultOn?: boolean }) {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium text-forest-green">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => setIsOn(!isOn)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isOn ? 'bg-gradient-to-r from-brushed-gold to-brushed-gold-light' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
