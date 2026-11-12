import Link from 'next/link';

import { clinic, navLinks } from '@/data/clinic';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          {clinic.name}
        </Link>
        <nav aria-label="Main">
          <ul className="nav">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
