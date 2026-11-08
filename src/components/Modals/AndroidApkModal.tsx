import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  ExternalLink,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'pwa' | 'config'>('build');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentHostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ai-reeltok.app';

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const buildCommands = [
    {
      title: '1. Install Capacitor & Android Dependencies',
      cmd: 'npm install @capacitor/core @capacitor/cli @capacitor/android',
    },
    {
      title: '2. Initialize Capacitor Project',
      cmd: 'npx cap init "AI ReelTok" "com.reeltok.app" --web-dir "dist"',
    },
    {
      title: '3. Build Web Production Bundle',
      cmd: 'npm run build',
    },
    {
      title: '4. Add Android Platform Target',
      cmd: 'npx cap add android',
    },
    {
      title: '5. Sync Web Assets to Android Studio Project',
      cmd: 'npx cap sync android',
    },
    {
      title: '6. Build Native Android APK Release with Gradle',
      cmd: 'cd android && ./gradlew assembleRelease',
    },
    {
      title: '7. Open in Android Studio (for APK Signing & Play Store AAB)',
      cmd: 'npx cap open android',
    },
  ];

  const capacitorConfig = `{
  "appId": "com.reeltok.app",
  "appName": "AI ReelTok",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  }
}`;

  const manifestSnippet = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.reeltok.app">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:screenOrientation="portrait"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl p-5 sm:p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Android APK & Mobile Deployment</h3>
                <p className="text-xs text-zinc-400">Build native Android APK via Capacitor or install PWA</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('build')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'build'
                  ? 'bg-emerald-500 text-black font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              APK Build Guide
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'config'
                  ? 'bg-emerald-500 text-black font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Capacitor & Manifest Config
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'pwa'
                  ? 'bg-emerald-500 text-black font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              PWA Instant Android Install
            </button>
          </div>

          {/* TAB 1: APK BUILD GUIDE */}
          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 leading-relaxed">
                <p>
                  AI ReelTok is configured for <strong className="text-white">Capacitor Android</strong> wrapping. Follow these steps on your development workstation or CI/CD to generate a standalone signed <code className="text-emerald-400">.apk</code> or Google Play <code className="text-emerald-400">.aab</code> bundle.
                </p>
              </div>

              <div className="space-y-3">
                {buildCommands.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900/80 border border-white/5 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-zinc-300 block">{item.title}</span>
                    <div className="flex items-center justify-between gap-2 p-2 bg-black rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      <span className="truncate">{item.cmd}</span>
                      <button
                        onClick={() => copyToClipboard(item.cmd, idx)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-sans flex items-center gap-1 shrink-0"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Output APK Location:</strong> After running Gradle release, your production APK will be generated at <code className="text-white bg-black/40 px-1 py-0.5 rounded">android/app/build/outputs/apk/release/app-release.apk</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIG SNIPPETS */}
          {activeTab === 'config' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-300">capacitor.config.json</span>
                  <button
                    onClick={() => copyToClipboard(capacitorConfig, 100)}
                    className="text-xs text-[#00f2fe] flex items-center gap-1"
                  >
                    {copiedIndex === 100 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 100 ? 'Copied' : 'Copy Config'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 rounded-xl border border-white/10 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  {capacitorConfig}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-300">AndroidManifest.xml Permissions</span>
                  <button
                    onClick={() => copyToClipboard(manifestSnippet, 101)}
                    className="text-xs text-[#00f2fe] flex items-center gap-1"
                  >
                    {copiedIndex === 101 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 101 ? 'Copied' : 'Copy Manifest'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 rounded-xl border border-white/10 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-48">
                  {manifestSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PWA INSTANT INSTALL */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-zinc-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
                {/* Visual QR Code pointing to this applet URL */}
                <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center mb-3">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    <path
                      d="M10 10h30v30H10zm5 5v20h20V15zm5 5h10v10H20zm40-10h30v30H60zm5 5v20h20V15zm5 5h10v10H70zM10 60h30v30H10zm5 5v20h20V65zm5 5h10v10H20zm40 5h10v10H60zm15-5h15v10H75zm-15 15h20v15H60zm20 0h10v15H80z"
                      fill="#000000"
                    />
                    <rect x="42" y="42" width="16" height="16" fill="#000000" />
                    <circle cx="50" cy="50" r="4" fill="#ff0050" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-white">Scan with Android Camera</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Open your Android camera to launch ReelTok directly in Google Chrome on your device.
                </p>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl text-left space-y-2 text-xs text-zinc-300">
                <h5 className="font-bold text-white">How to Install to Android Home Screen:</h5>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                  <li>Open this link in Chrome or Brave on your Android phone.</li>
                  <li>Tap the three dots menu (⋮) in the top-right corner.</li>
                  <li>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
                  <li>The app will run in standalone immersive fullscreen like a native Android APK!</li>
                </ol>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
