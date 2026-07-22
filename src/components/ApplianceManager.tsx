import React, { useState } from 'react';
import { Appliance } from '../utils/energyMath';
import { Plus, Trash2, Sliders, ToggleLeft, ToggleRight, Sparkles, AlertCircle } from 'lucide-react';

interface ApplianceManagerProps {
  appliances: Appliance[];
  onChange: (updated: Appliance[]) => void;
  userType: 'household' | 'sme';
  onResetToDefaults: () => void;
}

const CATEGORIES = [
  { id: 'lighting', label: 'Lighting' },
  { id: 'cooling', label: 'Cooling & ACs' },
  { id: 'kitchen', label: 'Kitchen Appliances' },
  { id: 'office', label: 'Office & IT' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'other', label: 'Other/Heavy Load' },
];

export const ApplianceManager: React.FC<ApplianceManagerProps> = ({
  appliances,
  onChange,
  userType,
  onResetToDefaults,
}) => {
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<Appliance['category']>('cooling');
  const [newAppWattage, setNewAppWattage] = useState(100);

  const handleUpdateAppliance = (id: string, updates: Partial<Appliance>) => {
    const updated = appliances.map((app) => {
      if (app.id === id) {
        return { ...app, ...updates };
      }
      return app;
    });
    onChange(updated);
  };

  const handleDeleteAppliance = (id: string) => {
    const updated = appliances.filter((app) => app.id !== id);
    onChange(updated);
  };

  const handleAddCustomAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: Appliance = {
      id: `custom_${Date.now()}`,
      name: newAppName,
      category: newAppCategory,
      count: 1,
      wattage: newAppWattage,
      hoursOnGrid: 4,
      hoursOnBackup: 2,
      isInverter: false,
    };

    onChange([...appliances, newApp]);
    setNewAppName('');
    setNewAppWattage(100);
  };

  return (
    <div id="appliance-manager-container" className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-emerald-600" />
          2. Appliance Inventory & Hours
        </h2>
        <button
          type="button"
          id="btn-reload-presets"
          onClick={onResetToDefaults}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
        >
          <Sparkles className="h-3 w-3" />
          Load {userType === 'household' ? 'Household' : 'SME'} Defaults
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Enter your active appliances. Specify how many hours they run on grid electricity and backup power daily.
      </p>

      {/* Appliance Grid / List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {appliances.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
            <AlertCircle className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
            <p className="text-sm">No appliances listed. Add custom below or load defaults.</p>
          </div>
        ) : (
          appliances.map((app) => (
            <div
              key={app.id}
              className="p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50/80 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-xs text-neutral-800">{app.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-200/60 text-neutral-600 rounded">
                      {app.category}
                    </span>
                    {app.category === 'cooling' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateAppliance(app.id, { isInverter: !app.isInverter })}
                        className="text-[10px] flex items-center gap-1 text-emerald-700 font-medium hover:opacity-85 cursor-pointer"
                      >
                        {app.isInverter ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                            <span>Inverter (Highly Efficient)</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-neutral-400" />
                            <span className="text-neutral-500">Traditional</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  id={`btn-delete-${app.id}`}
                  onClick={() => handleDeleteAppliance(app.id)}
                  className="text-neutral-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                  title="Remove appliance"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Grid with fields for adjustment */}
              <div className="grid grid-cols-4 gap-2 items-end pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-neutral-500 uppercase">Qty</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={app.count}
                    onChange={(e) => handleUpdateAppliance(app.id, { count: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-800 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-neutral-500 uppercase">Power (W)</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={app.wattage}
                    onChange={(e) => handleUpdateAppliance(app.id, { wattage: parseInt(e.target.value) || 10 })}
                    className="w-full bg-white border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-800 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-emerald-600 uppercase font-semibold">Grid (h)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={app.hoursOnGrid}
                    onChange={(e) => handleUpdateAppliance(app.id, { hoursOnGrid: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-emerald-100 rounded px-2 py-1 text-xs text-emerald-800 text-center focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-medium text-amber-600 uppercase font-semibold">Backup (h)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={app.hoursOnBackup}
                    onChange={(e) => handleUpdateAppliance(app.id, { hoursOnBackup: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-amber-100 rounded px-2 py-1 text-xs text-amber-800 text-center focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Appliance Form */}
      <form onSubmit={handleAddCustomAppliance} className="border-t border-neutral-100 pt-4 space-y-3">
        <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
          Add Custom Appliance
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            id="input-custom-app-name"
            placeholder="e.g., Electric Oven, Blowdryer"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500"
          />

          <select
            id="select-custom-app-category"
            value={newAppCategory}
            onChange={(e) => setNewAppCategory(e.target.value as any)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <div className="w-1/2 flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-medium shrink-0">Watts:</span>
            <input
              type="number"
              id="input-custom-app-watts"
              min="1"
              max="15000"
              value={newAppWattage}
              onChange={(e) => setNewAppWattage(parseInt(e.target.value) || 50)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            id="btn-add-custom-app"
            className="w-1/2 bg-neutral-800 hover:bg-emerald-700 text-white font-medium text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add to Inventory
          </button>
        </div>
      </form>
    </div>
  );
};
