import { StatusBadge } from './status-badge';

interface ShareCardProps {
  name: string;
  recipient: string;
  categories: string[];
  accessLevel: string;
  expiresIn: string;
  lastAccessed: string;
}

export function ShareCard({ name, recipient, categories, accessLevel, expiresIn, lastAccessed }: ShareCardProps) {
  return (
    <div className="border border-neutral-200 bg-white p-5">
      <div className="mb-3.5 flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold text-neutral-900 font-display">
            {name}
          </div>
          <div className="mt-0.5 text-[13px] text-neutral-500 font-display">
            {recipient}
          </div>
        </div>
        <StatusBadge status="info" label={accessLevel} />
      </div>
      <div className="mb-3.5 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <span
            key={c}
            className="bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700 font-mono"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
        <span>Expires {expiresIn}</span>
        <span>Last accessed {lastAccessed}</span>
      </div>
    </div>
  );
}
