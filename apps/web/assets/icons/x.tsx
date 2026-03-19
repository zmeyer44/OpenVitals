export function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      className="h-full w-full"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
