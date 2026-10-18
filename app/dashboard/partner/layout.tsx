import type { ReactNode } from 'react';
import PartnerWorkspace from './partner-workspace';

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <PartnerWorkspace>{children}</PartnerWorkspace>;
}
