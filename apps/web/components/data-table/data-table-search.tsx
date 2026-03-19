import { Search } from 'lucide-react';

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DataTableSearch({
  value,
  onChange,
  placeholder = 'Search…',
}: DataTableSearchProps) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3">
      <Search className="h-4 w-4 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-1p-ignore
        className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-body"
      />
    </div>
  );
}
