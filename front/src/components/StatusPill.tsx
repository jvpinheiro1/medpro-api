import React from 'react';

interface StatusPillProps {
  status: 'ATIVA' | 'CANCELADA' | string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const isError = status === 'CANCELADA' || status === 'Inativo' || status === 'false';
  const isSuccess = status === 'ATIVA' || status === 'Ativo' || status === 'true';
  
  let bgClass = 'bg-[#e4e4e7] text-[#71717a]';
  if (isError) bgClass = 'bg-[#ffdad6] text-[#ba1a1a]';
  if (isSuccess) bgClass = 'bg-green-100 text-green-800';

  const displayStatus = status === 'true' ? 'ATIVO' : status === 'false' ? 'INATIVO' : status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.05em] ${bgClass}`}>
      {displayStatus}
    </span>
  );
};
