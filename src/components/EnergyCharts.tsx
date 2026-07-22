import React from 'react';
import { CalculationResult, Appliance } from '../utils/energyMath';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Wallet, BatteryCharging, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface EnergyChartsProps {
  result: CalculationResult;
  appliances: Appliance[];
}

export const EnergyCharts: React.FC<EnergyChartsProps> = ({ result, appliances }) => {
  const {
    monthlyGridKwh,
    monthlyGridCost,
    monthlyBackupKwh,
    monthlyBackupCost,
    totalMonthlyCost,
  } = result;

  // Chart 1: Grid vs Generator Cost Breakdown
  const costBreakdownData = [
    { name: 'Grid Electricity', value: Math.round(monthlyGridCost), color: '#059669' }, // Emerald
    { name: 'Backup Generator', value: Math.round(monthlyBackupCost), color: '#f59e0b' }, // Amber
  ].filter(item => item.value > 0);

  // Chart 2: Category consumption breakdown (Lighting, Cooling, etc.)
  const categoryTotals: Record<string, number> = {};
  appliances.forEach(app => {
    const dailyKwh = (app.count * app.wattage * (app.hoursOnGrid + app.hoursOnBackup)) / 1000;
    const monthlyKwh = dailyKwh * 30;
    categoryTotals[app.category] = (categoryTotals[app.category] || 0) + monthlyKwh;
  });

  const categoryChartData = Object.entries(categoryTotals).map(([cat, kwh]) => {
    let displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === 'cooling') displayName = 'Cooling & ACs';
    if (cat === 'kitchen') displayName = 'Kitchen';
    if (cat === 'office') displayName = 'Office / IT';
    
    return {
      category: displayName,
      kwh: Number(kwh.toFixed(1)),
    };
  }).filter(item => item.kwh > 0);

  // Total energy vampire identification
  const heaviestAppliance = [...appliances].sort((a, b) => {
    const aMonthly = (a.count * a.wattage * (a.hoursOnGrid + a.hoursOnBackup)) / 1000 * 30;
    const bMonthly = (b.count * b.wattage * (b.hoursOnGrid + b.hoursOnBackup)) / 1000 * 30;
    return bMonthly - aMonthly;
  })[0];

  const heaviestApplianceKwh = heaviestAppliance 
    ? ((heaviestAppliance.count * heaviestAppliance.wattage * (heaviestAppliance.hoursOnGrid + heaviestAppliance.hoursOnBackup)) / 1000 * 30).toFixed(1)
    : '0';

  return (
    <div id="energy-charts-container" className="space-y-6">
      {/* 4-Card Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Cost Badge */}
        <div className="bg-neutral-900 text-white rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 transition-transform group-hover:scale-110">
            <Wallet className="h-16 w-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Total Monthly Spend
          </span>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-emerald-400">
              ₦{Math.round(totalMonthlyCost).toLocaleString()}
            </span>
            <p className="text-[9px] text-neutral-400 mt-1">Grid + fuel combined</p>
          </div>
        </div>

        {/* Grid Bill */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Grid Bill (Est.)
          </span>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-neutral-800">
              ₦{Math.round(monthlyGridCost).toLocaleString()}
            </span>
            <p className="text-[9px] text-emerald-600 font-medium mt-1">
              {monthlyGridKwh.toFixed(1)} kWh consumed
            </p>
          </div>
        </div>

        {/* Generator Cost */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Backup Fuel Cost
          </span>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-neutral-800">
              ₦{Math.round(monthlyBackupCost).toLocaleString()}
            </span>
            <p className="text-[9px] text-amber-600 font-medium mt-1">
              {result.monthlyBackupFuelLiters.toFixed(1)} Liters consumed
            </p>
          </div>
        </div>

        {/* Solar Substitution Opportunity */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            Solar ROI potential
          </span>
          <div className="mt-3">
            <span className="text-lg font-bold text-emerald-800">
              -{result.backupCostPercentage}% Spend
            </span>
            <p className="text-[9px] text-emerald-600 mt-1">
              By replacing generator with solar
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Breakdown Chart */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Naira Cost Breakdown
          </h3>

          {costBreakdownData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-neutral-400 text-xs">
              No usage data to show
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="h-[160px] w-[160px] relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">Avg Cost</span>
                  <span className="text-sm font-bold font-mono text-neutral-800">
                    ₦{Math.round(totalMonthlyCost / 30).toLocaleString()}
                  </span>
                  <span className="text-[8px] text-neutral-400">/ day</span>
                </div>
              </div>

              <div className="space-y-2.5 w-full">
                {costBreakdownData.map((item, idx) => {
                  const pct = Math.round((item.value / (totalMonthlyCost || 1)) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </div>
                        <span className="font-semibold text-neutral-800">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Appliance Category Energy Consumption */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Monthly Consumption (kWh) by Category
          </h3>

          {categoryChartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-neutral-400 text-xs">
              Add appliances to view power distribution
            </div>
          ) : (
            <div className="h-[170px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, backgroundColor: '#171717', color: '#fff', borderRadius: 8, border: 'none' }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(val) => [`${val} kWh`, 'Consumption']}
                  />
                  <Bar dataKey="kwh" fill="#0284c7" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category.includes('Cooling') ? '#0284c7' : entry.category.includes('Lighting') ? '#10b981' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Extreme Energy Vampires Advisory Banner */}
      {heaviestAppliance && parseFloat(heaviestApplianceKwh) > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Primary Energy Vampire Detected
            </h4>
            <p className="text-xs text-amber-800 leading-normal mt-0.5">
              Your <strong>{heaviestAppliance.name}</strong> is responsible for <strong>{heaviestApplianceKwh} kWh/month</strong> (approx <strong>{Math.round((parseFloat(heaviestApplianceKwh) / (result.totalMonthlyKwh || 1)) * 100)}%</strong> of your total electrical load). Swapping or scheduling this specific load would yield immediate dramatic drops in your power bills!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
