import Navbar from './Navbar';
import { useThemeStore } from '../store/themeStore';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useThemeStore();
  const light = theme === 'light';

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: light ? '#f3f4f6' : '#07111e' }}
    >
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
