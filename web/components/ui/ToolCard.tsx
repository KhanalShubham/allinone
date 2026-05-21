import Link from 'next/link';
import type { Tool, Category } from '@/types';
import ToolIcon from './ToolIcon';

const badgeStyle: Record<string, string> = {
  popular: 'bg-orange-100 text-orange-700',
  new:     'bg-emerald-100 text-emerald-700',
  ai:      'bg-violet-100 text-violet-700',
};
const badgeLabel: Record<string, string> = {
  popular: 'Popular',
  new:     'New',
  ai:      'AI',
};

interface Props {
  tool: Tool;
  category: Category;
}

export default function ToolCard({ tool }: Props) {
  const inner = (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-4 h-full flex flex-col gap-3 transition-all duration-150 ${
        tool.available
          ? 'hover:border-gray-300 hover:shadow-lg cursor-pointer group'
          : 'opacity-55 cursor-not-allowed'
      }`}
    >
      {/* Icon + badge row */}
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md shrink-0`}>
          <ToolIcon name={tool.icon} size={22} className="text-white" />
        </div>
        {tool.badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyle[tool.badge]}`}>
            {badgeLabel[tool.badge]}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
          {tool.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tool.description}</p>
      </div>

      {/* CTA */}
      {tool.available
        ? <p className="text-xs font-semibold text-blue-600 mt-auto">Open tool →</p>
        : <p className="text-xs text-gray-400 mt-auto">Coming soon</p>
      }
    </div>
  );

  if (!tool.available) return <div>{inner}</div>;
  return <Link href={tool.href}>{inner}</Link>;
}
