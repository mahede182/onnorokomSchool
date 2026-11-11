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
        Classes
      </NavLink>
      <NavLink
        to={ROUTES.APPLICATIONS}
        className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
      >
        My Applications
      </NavLink>
    </nav>
  );
}
