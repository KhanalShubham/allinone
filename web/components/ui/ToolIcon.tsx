import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export default function ToolIcon({ name, size = 20, className }: Props) {
  const Icon = (Icons as unknown as Record<string, React.FC<LucideProps>>)[name] ?? Icons.Wrench;
  return <Icon size={size} className={className} />;
}
