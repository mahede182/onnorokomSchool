import { NavLink } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function AppNav() {
  return (
    <nav className="nav" aria-label="Main">
      <NavLink
        to={ROUTES.CLASSES}
        end
        className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
      >
        Admissions
      </NavLink>
      <NavLink
        to={ROUTES.APPLICATIONS}
        className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
      >
        My Applications
      </NavLink>
      <NavLink
        to={ROUTES.ADMIN}
        className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
      >
        Admin
      </NavLink>
    </nav>
  );
}
