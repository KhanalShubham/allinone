export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  href: string;
  badge?: 'new' | 'popular' | 'ai';
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  tools: Tool[];
}
