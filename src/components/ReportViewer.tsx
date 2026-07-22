import React, { useState, useEffect } from 'react';
import { CalculationResult, InputParams } from '../utils/energyMath';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, ShieldCheck, Download, Loader2, ArrowRight, Sun, Layers, Milestone } from 'lucide-react';

interface ReportViewerProps {
  params: InputParams;
  result: CalculationResult;
  onAuditComplete: (reportText: string, updatedResult: CalculationResult) => void;
  reportText: string | null;
}

// Custom table cell renderer with intelligent numeric/currency alignment and priority badges
const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => {
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (React.isValidElement(node) && node.props) return getTextContent((node.props as any).children);
    return '';
  };

  const text = getTextContent(children).trim();

  // Priority Badges
  if (/^(High|High Priority)$/i.test(text)) {
    return (
      <td className={`px-4 py-3 align-middle text-left ${className || ''}`} {...props}>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
          High
        </span>
      </td>
    );
  }

  if (/^(Medium|Medium Priority)$/i.test(text)) {
    return (
      <td className={`px-4 py-3 align-middle text-left ${className || ''}`} {...props}>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
          Medium
        </span>
      </td>
    );
  }

  if (/^(Low|Low Priority)$/i.test(text)) {
    return (
      <td className={`px-4 py-3 align-middle text-left ${className || ''}`} {...props}>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
          Low
        </span>
      </td>
    );
  }

  // Right-align currency, percentages, kWh, costs, and numbers
  const isNumericOrCurrency = /^(₦|[$€£])?[\s\d.,%+-]+(kWh|Liters|hrs|months|years|L|kW|kVA|%)?$/i.test(text) && !/^[a-zA-Z\s]{4,}$/.test(text);

  return (
    <td
      className={`px-4 py-3 align-middle text-xs text-neutral-800 leading-relaxed ${
        isNumericOrCurrency ? 'font-mono font-semibold text-neutral-900 text-right whitespace-nowrap' : 'text-left font-medium'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </td>
  );
};

// Custom table header cell with contextual text alignment
const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => {
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (React.isValidElement(node) && node.props) return getTextContent((node.props as any).children);
    return '';
  };

  const text = getTextContent(children).trim().toLowerCase();
  const isRightAlignedHeader = /cost|consumption|kwh|savings|payback|naira|%|amount|price|investment/i.test(text);

  return (
    <th
      className={`px-4 py-3.5 font-bold text-neutral-900 text-xs uppercase tracking-wider border-b border-neutral-200/80 bg-neutral-100/80 whitespace-nowrap ${
        isRightAlignedHeader ? 'text-right' : 'text-left'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </th>
  );
};

const markdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="my-5 w-full overflow-x-auto rounded-xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/5">
      <table className="w-full text-left border-collapse text-xs min-w-[540px]" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-neutral-100/90 text-neutral-900 font-bold border-b border-neutral-200" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody className="divide-y divide-neutral-100/80 bg-white" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-emerald-50/40 transition-colors odd:bg-white even:bg-neutral-50/50" {...props} />
  ),
  th: TableHeaderCell,
  td: TableCell,
  h1: ({ node, ...props }: any) => (
    <h1 className="text-xl font-extrabold text-neutral-900 mt-6 mb-4 border-b border-neutral-200 pb-2.5 flex items-center gap-2" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-base font-bold text-emerald-950 mt-6 mb-3 pb-1 border-b border-emerald-100/80 flex items-center gap-2" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-sm font-bold text-neutral-800 mt-4 mb-2" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc list-outside space-y-2 my-3 text-neutral-700 text-xs sm:text-sm pl-5" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal list-outside space-y-2 my-3 text-neutral-700 text-xs sm:text-sm pl-5" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li className="leading-relaxed pl-1" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="my-2.5 text-neutral-700 leading-relaxed text-xs sm:text-sm" {...props} />
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-semibold text-neutral-950" {...props} />
  ),
  code: ({ node, ...props }: any) => (
    <code className="bg-neutral-100 text-emerald-900 px-1.5 py-0.5 rounded text-[11px] font-mono border border-neutral-200/60" {...props} />
  ),
};

const NIGERIAN_ENERGY_TIPS = [
  "Switching to an inverter Air Conditioner can cut its active energy draw by up to 60%, drastically lowering grid bills on Band A.",
  "Leaving standard chest freezers on backup generator power drains expensive petrol. Use frozen plastic water jugs as thermal 'batteries' to keep cold during generator downtime.",
  "LED bulbs consume 85% less energy than old incandescent yellow bulbs. A 10-bulb home can save up to ₦10,000 monthly just by swapping bulbs.",
  "Avoid cooking with electric hot plates or boiling rings during generator hours; they draw 1,500W+ which requires a larger, fuel-guzzling generator.",
  "Lithium batteries represent the lowest lifetime cost for solar setups in Nigeria, lasting up to 10 years compared to just 1-2 years for cheap lead-acid batteries.",
  "Check your DisCo meter billing category regularly. In Nigeria, Service-Based Tariffs mean you pay according to the guaranteed daily supply hours (Band A to E)."
];

export const ReportViewer: React.FC<ReportViewerProps> = ({
  params,
  result,
  onAuditComplete,
  reportText,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % NIGERIAN_ENERGY_TIPS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setTipIndex(0);

    try {
      const response = await fetch('/api/advisory/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate audit report.');
      }

      const data = await response.json();
      onAuditComplete(data.reportText, data.mathResults);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while communicating with the AI Advisor.');
    } finally {
      setLoading(false);
    }
  };

  // Sizing details for quick visualization cards
  const { solarSizing, applianceSavings } = result;

  return (
    <div id="report-viewer-container" className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">
      {/* Header and trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-spin-slow" />
            3. AI Energy Audit & Recommendations
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Get a tailored report explaining your consumption and outlining custom hardware payoffs.
          </p>
        </div>

        {!reportText && !loading && (
          <button
            type="button"
            id="btn-generate-audit"
            onClick={handleGenerateReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer hover:shadow"
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Audit Report
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-5 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            <Sparkles className="h-4 w-4 text-amber-500 absolute top-[-5px] right-[-5px] animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <p className="font-semibold text-sm text-neutral-800">
              WattSmart Naija is generating AI energy Audit report...
            </p>
            <p className="text-xs text-neutral-400">
              Compiling cost savings analysis and carbon offset models.
            </p>
          </div>

          {/* Scrolling Nigerian Tips Box */}
          <div className="w-full max-w-md bg-white border border-neutral-100 p-4 rounded-xl shadow-sm space-y-1.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-bold uppercase tracking-wider">
              <Sun className="h-3.5 w-3.5" />
              Naija Energy Fact #{tipIndex + 1}
            </div>
            <p className="text-xs text-neutral-600 italic leading-relaxed">
              "{NIGERIAN_ENERGY_TIPS[tipIndex]}"
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-red-800 space-y-1.5">
          <p className="font-semibold">Audit Generation Failed</p>
          <p>{error}</p>
          <button
            type="button"
            onClick={handleGenerateReport}
            className="text-red-700 underline font-bold cursor-pointer block mt-1"
          >
            Retry Generation
          </button>
        </div>
      )}

      {/* Generated Report Display */}
      {reportText && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Visual AI Recommendations Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom Solar Proposal */}
            {solarSizing && solarSizing.estimatedInvestmentNaira > 500000 && (
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-xs uppercase tracking-wider">Solar Hybrid Sizing</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Based on your backup runtime load, we recommend a <strong>{solarSizing.requiredPanelsKw} kW PV</strong> system (approx. <strong>{solarSizing.panelCount} panels</strong>) paired with a <strong>{solarSizing.inverterSizeKva} kVA</strong> pure sine wave hybrid inverter and a <strong>{solarSizing.batteryCapacityKwh} kWh</strong> lithium storage bank.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-100/60 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-neutral-400 block font-medium">Estimated Capital</span>
                    <span className="text-xs font-bold text-neutral-800 font-mono">₦{solarSizing.estimatedInvestmentNaira.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 block font-bold">Est. Payback</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">{solarSizing.paybackYears} Years</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hardware Upgrade Savings */}
            {applianceSavings && applianceSavings.length > 0 ? (
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <Layers className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-xs uppercase tracking-wider">Top Appliance Upgrades</span>
                  </div>
                  <div className="mt-2.5 space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                    {applianceSavings.slice(0, 2).map((app, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-neutral-700">
                        <span className="truncate max-w-[120px] font-medium">{app.name}</span>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold shrink-0">
                          <ArrowRight className="h-3 w-3 text-neutral-400" />
                          <span>Save ₦{Math.round(app.monthlySavingsNaira / 1000).toLocaleString()}k/mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-100/60 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-neutral-400 block font-medium">Equipments Swapped</span>
                    <span className="text-xs font-bold text-neutral-800">{applianceSavings.length} items identified</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-blue-600 block font-bold">Avg. Payback</span>
                    <span className="text-xs font-bold text-blue-700 font-mono">
                      {Math.max(1, Math.round(applianceSavings.reduce((sum, a) => sum + a.paybackMonths, 0) / applianceSavings.length))} Months
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 flex flex-col justify-center items-center text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-600 mb-1" />
                <span className="font-semibold text-xs text-neutral-800">Highly Efficient Inventory</span>
                <p className="text-[10px] text-neutral-500 mt-1 max-w-[180px]">Your listed cooling and lighting appliances are already inverter-rated!</p>
              </div>
            )}
          </div>

          {/* Expert Audit Report Body */}
          <div className="p-6 rounded-2xl bg-neutral-50/50 border border-neutral-100 relative shadow-inner">
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                type="button"
                id="btn-re-audit"
                onClick={handleGenerateReport}
                className="p-1.5 hover:bg-neutral-200/60 rounded-lg text-xs text-neutral-500 hover:text-neutral-800 transition-all flex items-center gap-1 font-medium cursor-pointer"
                title="Regenerate Report"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Regenerate
              </button>
            </div>

            <div className="markdown-body text-sm select-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {reportText}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
