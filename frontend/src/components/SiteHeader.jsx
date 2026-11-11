import { Link } from 'react-router-dom';
import { AppNav } from '../navigation/AppNav';
import { ROUTES } from '../constants/routes';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to={ROUTES.CLASSES} className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          OS
        </span>
        <span className="brand-text">
          onnorokomSchool
          <span>Admissions portal</span>
        </span>
      </Link>
      <AppNav />
    </header>
  );
}
