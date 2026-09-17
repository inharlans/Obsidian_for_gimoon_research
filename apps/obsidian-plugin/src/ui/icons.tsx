import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}

export const Icons = {
  graph: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><circle cx="5" cy="6" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="18" r="2"/><path d="m7 6 9-1M6 8l5 8m6-9-4 9"/></Icon>,
  paper: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></Icon>,
  benchmark: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M4 20h16M6 17V9m6 8V4m6 13v-5"/></Icon>,
  problem: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2 1-1.2 2M12 17h.01"/></Icon>,
  alert: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M12 3 2.8 20h18.4zM12 9v4M12 17h.01"/></Icon>,
  inbox: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M4 5h16v14H4zM4 14h5l2 2h2l2-2h5"/></Icon>,
  search: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></Icon>,
  filter: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M4 5h16l-6 7v6l-4 2v-8z"/></Icon>,
  quality: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m12 3 2.4 4.9L20 9l-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6L4 9l5.6-1.1z"/></Icon>,
  bulb: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M8.5 15.5a6 6 0 1 1 7 0L14 18h-4zM10 21h4"/></Icon>,
  chevron: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m8 10 4 4 4-4"/></Icon>,
  external: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M18 13v7H4V6h7"/></Icon>,
  check: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m5 12 4 4L19 6"/></Icon>,
  close: (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18"/></Icon>
};

