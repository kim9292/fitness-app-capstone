import React from "react";

interface ProminentHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  className?: string;
}

export default function ProminentHeader({
  title,
  subtitle,
  children,
  actions,
  stats,
  className = "",
}: ProminentHeaderProps) {
  return (
    <header
      className={`bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white p-8 shadow-xl mb-12 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {subtitle && <p className="text-purple-100">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
        {stats && <div className="grid grid-cols-3 gap-4 mt-6">{stats}</div>}
        {children}
      </div>
    </header>
  );
}
