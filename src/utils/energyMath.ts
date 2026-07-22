// Realistic Nigerian DisCo tariff rates per kWh (in Naira ₦) as of 2026
export const TARIFF_RATES: Record<string, number> = {
  'Band A': 225, // 20+ hours daily (premium/costly)
  'Band B': 120, // 16-20 hours daily
  'Band C': 85,  // 12-16 hours daily
  'Band D': 65,  // 8-12 hours daily
  'Band E': 50,  // 4-8 hours daily
};

// DisCos operating in Nigeria
export const NIGERIAN_DISCOS = [
  { id: 'ekedc', name: 'Eko Electricity Distribution Company (EKEDC)' },
  { id: 'ikedc', name: 'Ikeja Electric (IKEDC)' },
  { id: 'aedc', name: 'Abuja Electricity Distribution Company (AEDC)' },
  { id: 'eedc', name: 'Enugu Electricity Distribution Company (EEDC)' },
  { id: 'ibedc', name: 'Ibadan Electricity Distribution Company (IBEDC)' },
  { id: 'kedco', name: 'Kano Electricity Distribution Company (KEDCO)' },
  { id: 'phed', name: 'Port Harcourt Electricity Distribution Company (PHED)' },
  { id: 'jed', name: 'Jos Electricity Distribution Company (JED)' },
  { id: 'kaedco', name: 'Kaduna Electricity Distribution Company (KAEDCO)' },
  { id: 'bedc', name: 'Benin Electricity Distribution Company (BEDC)' },
  { id: 'yedc', name: 'Yola Electricity Distribution Company (YEDC)' },
];

export interface Appliance {
  id: string;
  name: string;
  category: 'lighting' | 'cooling' | 'kitchen' | 'office' | 'entertainment' | 'other';
  count: number;
  wattage: number; // Watts per unit
  hoursOnGrid: number;
  hoursOnBackup: number;
  isInverter?: boolean; // Is it already energy-efficient?
}

export interface InputParams {
  userType: 'household' | 'sme';
  subType: string; // e.g., "3-Bedroom Flat", "Barbershop", "Mini Mart"
  state: string;
  disco: string;
  gridBand: string; // 'Band A', 'Band B', etc.
  backupType: 'generator_petrol' | 'generator_diesel' | 'solar_hybrid' | 'none';
  fuelPrice: number; // Price per liter in Naira (e.g., ₦1000)
  generatorSizeKva: number; // Size in kVA (e.g., 2.5)
  generatorHoursDaily: number; // Daily run hours
  appliances: Appliance[];
}

export interface CalculationResult {
  monthlyGridKwh: number;
  monthlyGridCost: number;
  monthlyBackupKwh: number;
  monthlyBackupFuelLiters: number;
  monthlyBackupCost: number;
  totalMonthlyKwh: number;
  totalMonthlyCost: number;
  gridCostPercentage: number;
  backupCostPercentage: number;
  
  // Potential savings through appliance upgrades
  applianceSavings: {
    applianceId: string;
    name: string;
    currentMonthlyKwh: number;
    recommendedUpgrade: string;
    upgradeWattage: number;
    estimatedCostNaira: number;
    monthlySavingsKwh: number;
    monthlySavingsNaira: number;
    paybackMonths: number;
  }[];
  
  // Solar sizing recommendation
  solarSizing: {
    requiredPanelsKw: number;
    panelCount: number;
    inverterSizeKva: number;
    batteryCapacityKwh: number;
    estimatedInvestmentNaira: number;
    monthlySavingsNaira: number;
    paybackYears: number;
  };
}

// Calculate generator fuel consumption rate (liters per hour)
export function getGeneratorFuelRate(type: 'generator_petrol' | 'generator_diesel', kva: number): number {
  if (type === 'generator_petrol') {
    // Approx 0.35 liters per kVA per hour at partial load
    return Math.max(0.5, kva * 0.32);
  } else if (type === 'generator_diesel') {
    // Approx 0.25 liters per kVA per hour
    return Math.max(1.0, kva * 0.24);
  }
  return 0;
}

export function runEnergyCalculations(params: InputParams): CalculationResult {
  const {
    gridBand,
    backupType,
    fuelPrice,
    generatorSizeKva,
    generatorHoursDaily,
    appliances,
  } = params;

  const tariffRate = TARIFF_RATES[gridBand] || 85; // Default to Band C if not found

  // 1. Calculate appliance-level grid and backup consumption
  let dailyGridWh = 0;
  let dailyBackupWh = 0;

  appliances.forEach((app) => {
    const totalPower = app.count * app.wattage;
    dailyGridWh += totalPower * app.hoursOnGrid;
    dailyBackupWh += totalPower * app.hoursOnBackup;
  });

  const monthlyGridKwh = (dailyGridWh / 1000) * 30;
  const monthlyGridCost = monthlyGridKwh * tariffRate;

  // 2. Backup power calculations
  let monthlyBackupKwh = (dailyBackupWh / 1000) * 30;
  let monthlyBackupFuelLiters = 0;
  let monthlyBackupCost = 0;

  if (backupType === 'generator_petrol' || backupType === 'generator_diesel') {
    const hourlyFuelLiters = getGeneratorFuelRate(backupType, generatorSizeKva);
    monthlyBackupFuelLiters = hourlyFuelLiters * generatorHoursDaily * 30;
    monthlyBackupCost = monthlyBackupFuelLiters * fuelPrice;
  } else if (backupType === 'solar_hybrid') {
    // Solar has zero operational/fuel costs
    monthlyBackupCost = 0;
  }

  const totalMonthlyKwh = monthlyGridKwh + monthlyBackupKwh;
  const totalMonthlyCost = monthlyGridCost + monthlyBackupCost;

  const totalCostForRatio = totalMonthlyCost || 1;
  const gridCostPercentage = Math.round((monthlyGridCost / totalCostForRatio) * 100);
  const backupCostPercentage = Math.round((monthlyBackupCost / totalCostForRatio) * 100);

  // 3. Appliance upgrade recommendations & potential savings
  // We'll calculate savings for lighting, cooling, and TV/entertainment
  const applianceSavings: CalculationResult['applianceSavings'] = [];

  appliances.forEach((app) => {
    let recommendedUpgrade = '';
    let upgradeWattage = app.wattage;
    let estimatedCostNaira = 0;

    const currentDailyKwh = (app.count * app.wattage * (app.hoursOnGrid + app.hoursOnBackup)) / 1000;
    const currentMonthlyKwh = currentDailyKwh * 30;

    if (currentMonthlyKwh <= 0) return;

    // Lighting: Incandescent/fluorescent (40W-100W) to LED (9W-15W)
    if (app.category === 'lighting' && app.wattage > 15) {
      recommendedUpgrade = 'Energy-Efficient LED Bulbs';
      upgradeWattage = 9; // standard 9W LED bulb
      estimatedCostNaira = app.count * 1500; // ₦1,500 per bulb
    } 
    // Cooling: Non-inverter AC (1000W-2500W) to Inverter AC (saves ~50% average draw)
    else if (app.name.toLowerCase().includes('air conditioner') || (app.category === 'cooling' && app.wattage >= 1000 && !app.isInverter)) {
      recommendedUpgrade = 'R32 Inverter Air Conditioner';
      upgradeWattage = Math.round(app.wattage * 0.45); // uses 45% of traditional active power over time
      estimatedCostNaira = app.count * 450000; // ₦450,000 per AC
    } 
    // Refrigerators/Freezers: traditional chest freezer (200W-400W) to Inverter Freezer (saves ~60%)
    else if ((app.name.toLowerCase().includes('fridge') || app.name.toLowerCase().includes('freezer') || app.category === 'cooling') && app.wattage >= 150 && app.wattage < 1000 && !app.isInverter) {
      recommendedUpgrade = '5-Star Rating Inverter Refrigerator/Freezer';
      upgradeWattage = Math.round(app.wattage * 0.4); // uses 40%
      estimatedCostNaira = app.count * 380000; // ₦380,000 per unit
    }

    if (recommendedUpgrade) {
      const upgradeDailyKwh = (app.count * upgradeWattage * (app.hoursOnGrid + app.hoursOnBackup)) / 1000;
      const upgradeMonthlyKwh = upgradeDailyKwh * 30;
      const monthlySavingsKwh = Math.max(0, currentMonthlyKwh - upgradeMonthlyKwh);
      
      // Calculate weighted monetary savings based on grid vs backup ratio
      const gridRatio = app.hoursOnGrid / (app.hoursOnGrid + app.hoursOnBackup || 1);
      const backupRatio = 1 - gridRatio;
      
      // Effective tariff: combo of grid cost and generator kWh cost
      // Cost per kWh on generator: generator hourly cost / hourly backup kWh generated
      let generatorKwhCost = 0;
      if (backupType === 'generator_petrol' || backupType === 'generator_diesel') {
        const hourlyFuelLiters = getGeneratorFuelRate(backupType, generatorSizeKva);
        const hourlyFuelCost = hourlyFuelLiters * fuelPrice;
        // Total active wattage of backup load running
        const totalBackupWatts = appliances.reduce((sum, a) => sum + (a.count * a.wattage), 0);
        const hourlyBackupKwh = Math.max(0.2, totalBackupWatts / 1000);
        generatorKwhCost = hourlyFuelCost / hourlyBackupKwh;
      } else if (backupType === 'solar_hybrid') {
        generatorKwhCost = 0; // free solar
      }
      
      const weightedCostPerKwh = (gridRatio * tariffRate) + (backupRatio * (generatorKwhCost || tariffRate));
      const monthlySavingsNaira = monthlySavingsKwh * weightedCostPerKwh;
      
      const paybackMonths = monthlySavingsNaira > 0 ? Number((estimatedCostNaira / monthlySavingsNaira).toFixed(1)) : 999;

      applianceSavings.push({
        applianceId: app.id,
        name: app.name,
        currentMonthlyKwh,
        recommendedUpgrade,
        upgradeWattage,
        estimatedCostNaira,
        monthlySavingsKwh,
        monthlySavingsNaira,
        paybackMonths,
      });
    }
  });

  // 4. Solar Hybrid system sizing and ROI
  // Sizing based on peak backup load or daily backup energy
  const peakBackupLoadWatts = appliances.reduce((sum, app) => sum + (app.count * app.wattage), 0);
  const dailyBackupEnergyWh = dailyBackupWh;

  // Rule of thumb for solar sizing in tropical Nigeria:
  // PV panels should generate ~1.3x daily backup energy, assuming average of 4.5 peak sun hours.
  const requiredPanelsKw = Number(((dailyBackupEnergyWh * 1.3) / 1000 / 4.5).toFixed(2)) || 1.0;
  const panelCount = Math.max(2, Math.ceil((requiredPanelsKw * 1000) / 450)); // 450W panels
  
  // Inverter rating should cover peak backup load + 25% surge margin, minimum 2kVA
  const inverterSizeKva = Math.max(2, Number((peakBackupLoadWatts * 1.25 / 1000).toFixed(1)));
  
  // Battery sizing to store daily backup energy + 20% buffer
  const batteryCapacityKwh = Number(((dailyBackupEnergyWh * 1.2) / 1000).toFixed(1)) || 2.4; // e.g., 2.4kWh minimum

  // Nigerian Market Prices for solar components in Naira (estimated 2026):
  // Solar: ~₦350,000 per kW (panels + structure)
  // Inverter: ~₦250,000 per kVA (pure sine wave hybrid)
  // Lithium Battery (preferred in Nigeria): ~₦300,000 per kWh
  // Installation & wiring: ~20% of component cost
  const pvCost = requiredPanelsKw * 350000;
  const inverterCost = inverterSizeKva * 250000;
  const batteryCost = batteryCapacityKwh * 300000;
  const estimatedInvestmentNaira = Math.round((pvCost + inverterCost + batteryCost) * 1.25);

  // Solar saves whatever they would spend on backup generator fuel
  const monthlySavingsNaira = monthlyBackupCost; 
  const paybackYears = monthlySavingsNaira > 0 ? Number((estimatedInvestmentNaira / (monthlySavingsNaira * 12)).toFixed(1)) : 99;

  const solarSizing = {
    requiredPanelsKw: Math.max(0.5, requiredPanelsKw),
    panelCount,
    inverterSizeKva,
    batteryCapacityKwh: Math.max(1.2, batteryCapacityKwh),
    estimatedInvestmentNaira: Math.max(500000, estimatedInvestmentNaira),
    monthlySavingsNaira,
    paybackYears: Math.max(0.5, paybackYears),
  };

  return {
    monthlyGridKwh,
    monthlyGridCost,
    monthlyBackupKwh,
    monthlyBackupFuelLiters,
    monthlyBackupCost,
    totalMonthlyKwh,
    totalMonthlyCost,
    gridCostPercentage,
    backupCostPercentage,
    applianceSavings,
    solarSizing,
  };
}

// Common appliance preset lists for Households & SMEs
export const HOUSEHOLD_PRESETS: Omit<Appliance, 'hoursOnGrid' | 'hoursOnBackup'>[] = [
  { id: 'h1', name: 'LED Bulbs', category: 'lighting', count: 10, wattage: 9, isInverter: true },
  { id: 'h2', name: 'Incandescent Bulbs', category: 'lighting', count: 5, wattage: 60, isInverter: false },
  { id: 'h3', name: 'Standard Standing Fan', category: 'cooling', count: 3, wattage: 70, isInverter: false },
  { id: 'h4', name: 'Non-Inverter Split AC (1.5 HP)', category: 'cooling', count: 1, wattage: 1200, isInverter: false },
  { id: 'h5', name: 'LED Smart TV (43")', category: 'entertainment', count: 1, wattage: 80, isInverter: true },
  { id: 'h6', name: 'Standard Chest Freezer', category: 'cooling', count: 1, wattage: 250, isInverter: false },
  { id: 'h7', name: 'Electric Water Heater', category: 'other', count: 1, wattage: 1500, isInverter: false },
  { id: 'h8', name: 'Electric Water Pump', category: 'other', count: 1, wattage: 750, isInverter: false },
  { id: 'h9', name: 'Electric Boiling Ring', category: 'kitchen', count: 1, wattage: 1500, isInverter: false },
];

export const SME_PRESETS: Omit<Appliance, 'hoursOnGrid' | 'hoursOnBackup'>[] = [
  { id: 's1', name: 'Office LED Tube Lights', category: 'lighting', count: 8, wattage: 18, isInverter: true },
  { id: 's2', name: 'Halogen Spotlights', category: 'lighting', count: 4, wattage: 50, isInverter: false },
  { id: 's3', name: 'SME Non-Inverter AC (2.0 HP)', category: 'cooling', count: 1, wattage: 1600, isInverter: false },
  { id: 's4', name: 'Desktop Computer & Monitor', category: 'office', count: 3, wattage: 150, isInverter: false },
  { id: 's5', name: 'Commercial Refrigerator', category: 'cooling', count: 1, wattage: 400, isInverter: false },
  { id: 's6', name: 'Hair Clipper / Dryer (Barbershop)', category: 'other', count: 2, wattage: 800, isInverter: false },
  { id: 's7', name: 'Water Dispenser', category: 'office', count: 1, wattage: 500, isInverter: false },
  { id: 's8', name: 'Inkjet/Laser Printer', category: 'office', count: 1, wattage: 300, isInverter: false },
  { id: 's9', name: 'Deep Freezer (Frozen Foods Retail)', category: 'cooling', count: 2, wattage: 300, isInverter: false },
];
