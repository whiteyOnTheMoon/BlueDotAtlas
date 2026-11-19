import Link from 'next/link';
import { BrandMark } from './brand-mark';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <BrandMark />
        <nav aria-label="Main navigation" className="header-nav">
          <Link href="/" aria-current="page">
            Library
          </Link>
          <Link href="/admin/login">Admin studio</Link>
        </nav>
      </div>
    </header>
  );
}
