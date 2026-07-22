import React from 'react';
import { NIGERIAN_DISCOS, TARIFF_RATES, InputParams } from '../utils/energyMath';
import { Home, Briefcase, Zap, AlertCircle, Fuel, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  params: InputParams;
  onChange: (updates: Partial<InputParams>) => void;
  onLoadPresets: (type: 'household' | 'sme') => void;
}

// Nigerian major states list
const NIGERIAN_STATES = [
  'Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Ogun', 'Oyo', 'Kaduna', 'Enugu', 'Anambra', 'Edo', 'Delta', 'Kwara', 'Plateau', 'Bauchi', 'Sokoto', 'Imo', 'Abia'
];

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, onChange, onLoadPresets }) => {
  const handleUserTypeChange = (type: 'household' | 'sme') => {
    onChange({
      userType: type,
      subType: type === 'household' ? '3-Bedroom Flat' : 'Barbershop',
    });
    onLoadPresets(type);
  };

  return (
    <div id="control-panel-container" className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-600 animate-pulse" />
          1. Energy Profile & Grid Setup
        </h2>
      </div>

      {/* User Class Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          id="btn-user-household"
          onClick={() => handleUserTypeChange('household')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
            params.userType === 'household'
              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800'
              : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/30 text-neutral-500'
          }`}
        >
          <Home className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">Household</span>
          <span className="text-[10px] opacity-80 mt-0.5">Home & Apartments</span>
        </button>

        <button
          type="button"
          id="btn-user-sme"
          onClick={() => handleUserTypeChange('sme')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
            params.userType === 'sme'
              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800'
              : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/30 text-neutral-500'
          }`}
        >
          <Briefcase className="h-6 w-6 mb-2" />
          <span className="font-medium text-sm">SME / Business</span>
          <span className="text-[10px] opacity-80 mt-0.5">Shops, Offices, Retail</span>
        </button>
      </div>

      {/* Preset Subtype */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Profile Template
        </label>
        <select
          id="select-subtype"
          value={params.subType}
          onChange={(e) => onChange({ subType: e.target.value })}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
        >
          {params.userType === 'household' ? (
            <>
              <option value="Self-Contain Apartment">Self-Contain Apartment</option>
              <option value="2-Bedroom Flat">2-Bedroom Flat</option>
              <option value="3-Bedroom Flat">3-Bedroom Flat (Standard)</option>
              <option value="4-Bedroom Duplex">4-Bedroom Duplex</option>
            </>
          ) : (
            <>
              <option value="Barbershop">Barbershop / Salon</option>
              <option value="Retail Boutique">Retail Boutique / Shop</option>
              <option value="Mini Mart">Mini Mart / Grocery Store</option>
              <option value="Corporate Office">Corporate Office</option>
              <option value="Cold Room / Frozen Foods">Cold Room / Frozen Foods Shop</option>
            </>
          )}
        </select>
      </div>

      {/* Location & DisCo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
            State
          </label>
          <select
            id="select-state"
            value={params.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Distribution Co. (DisCo)
          </label>
          <select
            id="select-disco"
            value={params.disco}
            onChange={(e) => onChange({ disco: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
          >
            {NIGERIAN_DISCOS.map((d) => (
              <option key={d.id} value={d.name}>{d.name.split(' (')[0]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Service-Based Tariff Band */}
      <div className="space-y-2.5 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
            Service Grid Band
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold font-mono">
            ₦{TARIFF_RATES[params.gridBand]}/kWh
          </span>
        </div>
        <select
          id="select-grid-band"
          value={params.gridBand}
          onChange={(e) => onChange({ gridBand: e.target.value })}
          className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="Band A">Band A (Premium: 20+ hrs/day supply)</option>
          <option value="Band B">Band B (High: 16-20 hrs/day supply)</option>
          <option value="Band C">Band C (Medium: 12-16 hrs/day supply)</option>
          <option value="Band D">Band D (Low: 8-12 hrs/day supply)</option>
          <option value="Band E">Band E (Minimal: 4-8 hrs/day supply)</option>
        </select>
        <div className="flex items-start gap-1.5 text-xs text-neutral-500 leading-normal">
          <AlertCircle className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
          <span>
            {params.gridBand === 'Band A'
              ? 'Band A users receive steady supply but pay extremely high premium tariffs. Equipment upgrades yield massive savings here!'
              : 'Lower bands suffer from regular daily power cuts and require reliance on backup generators or solar systems.'}
          </span>
        </div>
      </div>

      {/* Backup Power setup */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
          <Fuel className="h-4 w-4 text-amber-500" />
          Backup Power Setup
        </h3>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Backup System Type
          </label>
          <select
            id="select-backup-type"
            value={params.backupType}
            onChange={(e) => onChange({ backupType: e.target.value as any })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="none">No Backup System (Grid Only)</option>
            <option value="generator_petrol">Petrol Generator (Small/Medium)</option>
            <option value="generator_diesel">Diesel Generator (Large/Industrial)</option>
            <option value="solar_hybrid">Solar Hybrid Inverter (Pre-installed)</option>
          </select>
        </div>

        {/* Conditional generator inputs */}
        {(params.backupType === 'generator_petrol' || params.backupType === 'generator_diesel') && (
          <div className="space-y-4 p-4 rounded-xl bg-amber-50/40 border border-amber-100/60 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Fuel price slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-neutral-600">
                <span>Fuel Price per Liter:</span>
                <span className="font-semibold text-neutral-800">₦{params.fuelPrice.toLocaleString()} / Liter</span>
              </div>
              <input
                type="range"
                id="input-fuel-price"
                min="800"
                max="1500"
                step="20"
                value={params.fuelPrice}
                onChange={(e) => onChange({ fuelPrice: parseInt(e.target.value) })}
                className="w-full accent-emerald-600 h-1 bg-neutral-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>₦800</span>
                <span>Subsidized/Avg</span>
                <span>₦1,500</span>
              </div>
            </div>

            {/* Generator size and hours run */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Gen Size (kVA)
                </label>
                <input
                  type="number"
                  id="input-gen-kva"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={params.generatorSizeKva}
                  onChange={(e) => onChange({ generatorSizeKva: parseFloat(e.target.value) || 0.9 })}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Daily Run (Hrs)
                </label>
                <input
                  type="number"
                  id="input-gen-hours"
                  min="0"
                  max="24"
                  step="0.5"
                  value={params.generatorHoursDaily}
                  onChange={(e) => onChange({ generatorHoursDaily: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-sm text-neutral-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {params.backupType === 'solar_hybrid' && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-start gap-2 text-xs text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
            <span>
              Congratulations! Solar hybrid backup has <strong>zero operational fuel cost</strong>, low noise, and zero carbon emissions. We will evaluate how to optimize it!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
