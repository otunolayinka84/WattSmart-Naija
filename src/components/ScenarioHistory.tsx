import React, { useState, useEffect } from 'react';
import { SavedScenario, saveScenarioToDb, getScenariosFromDb, deleteScenarioFromDb } from '../lib/firebase';
import { InputParams, CalculationResult } from '../utils/energyMath';
import { Save, Folder, RefreshCw, Trash2, Check, ArrowRight, Table, AlertCircle, Sparkles, BarChart, FileText } from 'lucide-react';

interface ScenarioHistoryProps {
  userId: string;
  currentParams: InputParams;
  currentResult: CalculationResult;
  currentReportText: string | null;
  onLoadScenario: (params: InputParams, reportText: string | null) => void;
}

export const ScenarioHistory: React.FC<ScenarioHistoryProps> = ({
  userId,
  currentParams,
  currentResult,
  currentReportText,
  onLoadScenario,
}) => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedIdsForComparison, setSelectedIdsForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const fetchScenarios = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await getScenariosFromDb(userId);
      setScenarios(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [userId]);

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim() || !userId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveScenarioToDb(userId, saveName, currentParams, currentResult, currentReportText);
      setSaveName('');
      setSaveSuccess(true);
      await fetchScenarios();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved scenario?')) return;
    try {
      await deleteScenarioFromDb(id);
      setScenarios(scenarios.filter((s) => s.id !== id));
      setSelectedIdsForComparison(selectedIdsForComparison.filter((cid) => cid !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComparison = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdsForComparison.includes(id)) {
      setSelectedIdsForComparison(selectedIdsForComparison.filter((cid) => cid !== id));
    } else {
      setSelectedIdsForComparison([...selectedIdsForComparison, id]);
    }
  };

  const handleLoadClick = (scenario: SavedScenario) => {
    onLoadScenario(scenario.params, scenario.reportText);
  };

  // Filter out chosen scenarios for side-by-side comparison
  const comparedScenarios = scenarios.filter((s) => s.id && selectedIdsForComparison.includes(s.id));

  return (
    <div id="scenario-history-container" className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">
      
      {/* Save current scenario form */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <Save className="h-5 w-5 text-emerald-600" />
            Save Current Energy Profile
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Store your loaded parameters, DisCo band, appliances, and reports securely to compare against alternative setups.
          </p>
        </div>

        <form onSubmit={handleSaveScenario} className="flex gap-2">
          <input
            type="text"
            id="input-save-scenario-name"
            placeholder="e.g., Band A vs Solar Hybrid Upgrade, Base Home Profile"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            disabled={saving}
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            id="btn-save-scenario"
            disabled={!saveName.trim() || saving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-200 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Scenario
          </button>
        </form>

        {saveSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-300">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Scenario saved successfully to Firestore! Compare it below.</span>
          </div>
        )}
      </div>

      {/* List of saved scenarios */}
      <div className="border-t border-neutral-100 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <Folder className="h-4.5 w-4.5 text-emerald-600" />
            Saved Scenarios ({scenarios.length})
          </h3>
          <button
            type="button"
            id="btn-refresh-history"
            onClick={fetchScenarios}
            className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
            Loading records from Cloud Firestore...
          </div>
        ) : scenarios.length === 0 ? (
          <div className="py-8 text-center text-neutral-400 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200 text-xs">
            No saved scenarios yet. Use the form above to persist your configurations.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {scenarios.map((sc) => {
              const isSelected = selectedIdsForComparison.includes(sc.id || '');
              return (
                <div
                  key={sc.id}
                  onClick={() => handleLoadClick(sc)}
                  className="p-3 rounded-xl border border-neutral-100 hover:border-emerald-200/60 bg-neutral-50/30 hover:bg-emerald-50/10 transition-all cursor-pointer flex items-center justify-between gap-3 group relative"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-800 truncate block">
                        {sc.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold uppercase tracking-wider shrink-0">
                        {sc.params.userType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-neutral-500 font-medium">
                      <span>{sc.params.state} State</span>
                      <span>•</span>
                      <span>{sc.params.gridBand}</span>
                      <span>•</span>
                      <span>Total: <strong className="text-neutral-700">₦{Math.round(sc.result.totalMonthlyCost).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Compare Selection Trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleComparison(sc.id || '', e)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Compare'}
                    </button>

                    {/* Delete Trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteScenario(sc.id || '', e)}
                      className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Scenario"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Analysis Segment */}
      {selectedIdsForComparison.length > 0 && (
        <div className="border-t border-neutral-100 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Table className="h-4 w-4 text-emerald-600" />
              Side-by-Side Tariff Comparison ({selectedIdsForComparison.length} selected)
            </h3>
            
            {comparedScenarios.length >= 2 && (
              <button
                type="button"
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                {showComparison ? 'Hide Side-by-Side analysis' : 'View Side-by-Side analysis'}
              </button>
            )}
          </div>

          {selectedIdsForComparison.length < 2 ? (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50 flex items-center gap-2 text-xs text-neutral-500">
              <AlertCircle className="h-4 w-4 text-neutral-400 shrink-0" />
              <span>Select at least <strong>two saved scenarios</strong> to launch the comparative analyzer.</span>
            </div>
          ) : showComparison ? (
            <div className="overflow-x-auto rounded-xl border border-neutral-100 bg-neutral-50/40 animate-in fade-in duration-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200">
                    <th className="p-3">Metric</th>
                    {comparedScenarios.map((sc) => (
                      <th key={sc.id} className="p-3 max-w-[140px] truncate">{sc.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700 bg-white">
                  <tr>
                    <td className="p-3 font-medium bg-neutral-50/40">Grid Band / Tariff</td>
                    {comparedScenarios.map((sc) => (
                      <td key={sc.id} className="p-3">
                        <span className="font-mono bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-[10px]">
                          {sc.params.gridBand}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium bg-neutral-50/40">Backup Strategy</td>
                    {comparedScenarios.map((sc) => {
                      let tagColor = 'bg-amber-100 text-amber-800';
                      if (sc.params.backupType === 'solar_hybrid') tagColor = 'bg-emerald-100 text-emerald-800';
                      if (sc.params.backupType === 'none') tagColor = 'bg-neutral-100 text-neutral-600';
                      
                      return (
                        <td key={sc.id} className="p-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${tagColor}`}>
                            {sc.params.backupType.replace('_', ' ')}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium bg-neutral-50/40">Monthly Grid Spend</td>
                    {comparedScenarios.map((sc) => (
                      <td key={sc.id} className="p-3 font-mono">₦{Math.round(sc.result.monthlyGridCost).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium bg-neutral-50/40">Monthly Fuel Spend</td>
                    {comparedScenarios.map((sc) => (
                      <td key={sc.id} className="p-3 font-mono">₦{Math.round(sc.result.monthlyBackupCost).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/30">
                    <td className="p-3 font-bold text-emerald-900 bg-emerald-50/60">Total Monthly Spend</td>
                    {comparedScenarios.map((sc) => (
                      <td key={sc.id} className="p-3 font-bold font-mono text-emerald-800">
                        ₦{Math.round(sc.result.totalMonthlyCost).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium bg-neutral-50/40">Solar Hybrid Sizing</td>
                    {comparedScenarios.map((sc) => (
                      <td key={sc.id} className="p-3">
                        {sc.result.solarSizing ? `${sc.result.solarSizing.requiredPanelsKw} kW / ${sc.result.solarSizing.inverterSizeKva} kVA` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium bg-neutral-50/40">Recommended Solar Est.</td>
                    {comparedScenarios.map((sc) => (
                      <td key={sc.id} className="p-3 font-mono">
                        {sc.result.solarSizing && sc.result.solarSizing.estimatedInvestmentNaira ? `₦${sc.result.solarSizing.estimatedInvestmentNaira.toLocaleString()}` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowComparison(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-emerald-300 hover:bg-emerald-50/50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
              Launch Comparative Table
            </button>
          )}
        </div>
      )}
    </div>
  );
};
