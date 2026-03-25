import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="bg-[#ffffff] p-6 border border-[rgba(0,0,0,0.08)] flex flex-col">
      <h3 className="text-[0.6875rem] font-bold text-[#71717a] uppercase tracking-[0.05em] mb-2">{title}</h3>
      <div className="text-[2.25rem] font-semibold text-[#09090b] leading-none">{value}</div>
      {subtitle && <p className="text-[0.875rem] text-[#71717a] mt-2">{subtitle}</p>}
    </div>
  );
};
