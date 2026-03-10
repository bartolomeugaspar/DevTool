import Navbar from './Navbar';
import { useTheme } from '../hooks/useTheme';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pageBg } = useTheme();
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: pageBg }}
    >
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
