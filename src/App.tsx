import { useState, useEffect } from 'react';
import { runEnergyCalculations, InputParams, HOUSEHOLD_PRESETS, SME_PRESETS } from './utils/energyMath';
import { ControlPanel } from './components/ControlPanel';
import { ApplianceManager } from './components/ApplianceManager';
import { EnergyCharts } from './components/EnergyCharts';
import { ReportViewer } from './components/ReportViewer';
import { AdvisorChat } from './components/AdvisorChat';
import { ScenarioHistory } from './components/ScenarioHistory';
import { AuthScreen } from './components/AuthScreen';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  Zap, 
  Landmark, 
  Award, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  HelpCircle, 
  History, 
  LogOut, 
  User as UserIcon,
  Loader2 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 1. Initial State
  const [params, setParams] = useState<InputParams>({
    userType: 'household',
    subType: '3-Bedroom Flat',
    state: 'Lagos',
    disco: 'Ikeja Electric (IKEDC)',
    gridBand: 'Band C',
    backupType: 'generator_petrol',
    fuelPrice: 1050,
    generatorSizeKva: 2.5,
    generatorHoursDaily: 4,
    appliances: [],
  });

  const [activeTab, setActiveTab] = useState<'visuals' | 'report' | 'chat' | 'scenarios'>('visuals');
  const [reportText, setReportText] = useState<string | null>(null);

  // Monitor Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Load default presets on mount or toggle
  const handleLoadPresets = (type: 'household' | 'sme') => {
    const rawPresets = type === 'household' ? HOUSEHOLD_PRESETS : SME_PRESETS;
    const mapped = rawPresets.map((p) => ({
      ...p,
      hoursOnGrid: p.category === 'cooling' ? 4 : 6,
      hoursOnBackup: p.category === 'cooling' ? 2 : 1.5,
    }));
    setParams((prev) => ({
      ...prev,
      appliances: mapped,
    }));
    // Clear previous report as configuration has changed
    setReportText(null);
  };

  useEffect(() => {
    handleLoadPresets('household');
  }, []);

  // Update specific parameters
  const handleParamsChange = (updates: Partial<InputParams>) => {
    setParams((prev) => ({
      ...prev,
      ...updates,
    }));
    // Clear previous report if core structural changes happen to avoid stale audits
    if (updates.gridBand || updates.backupType || updates.generatorSizeKva) {
      setReportText(null);
    }
  };

  const handleAuditComplete = (text: string, updatedMathResult: any) => {
    setReportText(text);
  };

  const handleLoadScenario = (loadedParams: InputParams, loadedReportText: string | null) => {
    setParams(loadedParams);
    setReportText(loadedReportText);
    setActiveTab('visuals'); // Switch back to see charts for loaded scenario
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  // 2. Perform math calculations in-line for instant responsiveness
  const calculationResult = runEnergyCalculations(params);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Verifying Advisor Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased">
      
      {/* Premium Navbar with Nigerian National Accents */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md relative overflow-hidden shrink-0">
              <Zap className="h-5 w-5 text-amber-300 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 to-emerald-500 opacity-80" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-neutral-900 tracking-tight">WattSmart Naija</h1>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">AI-Powered</span>
              </div>
              <p className="text-xs text-neutral-500">Empowering Nigerian Homes & SMEs. Know your usage,save cost.</p>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600">
              <Landmark className="h-3.5 w-3.5 text-neutral-400" />
              <span>NERC Tariff Adjusted</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100/50">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              <span>Saves up to 55% Cost</span>
            </div>
            
            {/* User welcome block */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 font-semibold">
              <UserIcon className="h-3.5 w-3.5 text-neutral-500" />
              <span className="truncate max-w-[120px]" title={user.displayName || user.email || 'Guest'}>
                {user.displayName || user.email || 'Guest Advisor'}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              id="btn-sign-out"
              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-neutral-200/50 bg-white"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Inputs): occupies 5 of 12 columns */}
          <div className="lg:col-span-5 space-y-6">
            <ControlPanel
              params={params}
              onChange={handleParamsChange}
              onLoadPresets={handleLoadPresets}
            />
            
            <ApplianceManager
              appliances={params.appliances}
              onChange={(apps) => handleParamsChange({ appliances: apps })}
              userType={params.userType}
              onResetToDefaults={() => handleLoadPresets(params.userType)}
            />
          </div>

          {/* Right Column (Visualizer & Advisory Tab Controls): occupies 7 of 12 columns */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tab Controllers */}
            <div className="bg-white p-1.5 rounded-xl border border-neutral-100 flex flex-wrap sm:flex-nowrap gap-1 shadow-sm">
              <button
                type="button"
                id="tab-btn-visuals"
                onClick={() => setActiveTab('visuals')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'visuals'
                    ? 'bg-neutral-900 text-white shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                1. Charts & Metrics
              </button>
              
              <button
                type="button"
                id="tab-btn-report"
                onClick={() => setActiveTab('report')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all relative cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-neutral-900 text-white shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                2. AI Energy Audit
                {reportText && (
                  <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                id="tab-btn-chat"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-neutral-900 text-white shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                3. Interactive Chat
              </button>

              <button
                type="button"
                id="tab-btn-scenarios"
                onClick={() => setActiveTab('scenarios')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'scenarios'
                    ? 'bg-neutral-900 text-white shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <History className="h-4 w-4" />
                4. Scenario Vault
              </button>
            </div>

            {/* Display active tab panel */}
            <div className="transition-all duration-300">
              {activeTab === 'visuals' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <EnergyCharts
                    result={calculationResult}
                    appliances={params.appliances}
                  />
                  
                  {/* Informational banner about local grid constraints */}
                  <div className="p-4 rounded-xl bg-white border border-neutral-100 flex gap-3 text-xs text-neutral-600 leading-relaxed shadow-sm">
                    <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-800 block">How are these calculated?</span>
                      Grid costs are based on NERC's Service-Based Tariffs for {params.gridBand} (₦{calculationResult.monthlyGridCost > 0 ? runEnergyCalculations(params).monthlyGridCost : '...'} expected). Generator fuel spends are estimated using thermodynamic consumption models mapped directly to petrol/diesel prices (₦{params.fuelPrice}/L) and your designated run-times.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'report' && (
                <div className="animate-in fade-in duration-200">
                  <ReportViewer
                    params={params}
                    result={calculationResult}
                    onAuditComplete={handleAuditComplete}
                    reportText={reportText}
                  />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="animate-in fade-in duration-200">
                  <AdvisorChat userProfile={params} />
                </div>
              )}

              {activeTab === 'scenarios' && (
                <div className="animate-in fade-in duration-200">
                  <ScenarioHistory
                    userId={user.uid}
                    currentParams={params}
                    currentResult={calculationResult}
                    currentReportText={reportText}
                    onLoadScenario={handleLoadScenario}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Humble, Professional Footer */}
      <footer className="bg-white border-t border-neutral-100 py-6 mt-12 text-center text-xs text-neutral-500 shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Naija Energy Smart Advisor. know your usage, save cost.</p>
        </div>
      </footer>

    </div>
  );
}
