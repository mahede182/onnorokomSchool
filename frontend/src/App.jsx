import { Navigate, Route, Routes } from 'react-router-dom';
import { AnnounceBar } from './components/AnnounceBar';
import { SiteHeader } from './components/SiteHeader';
import { StudentProvider } from './contexts/StudentContext';
import { ROUTES } from './constants/routes';
import { useRouteFocus } from './hooks/useRouteFocus';
import { AdminPage } from './pages/admin/AdminPage';
import { ClassesPage } from './pages/classes/ClassesPage';
import { MyApplicationsPage } from './pages/my-applications/MyApplicationsPage';

function AppShell() {
  const mainRef = useRouteFocus();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AnnounceBar />
      <SiteHeader />
      <div className="app-shell">
        <main id="main-content" ref={mainRef} tabIndex={-1} className="main-content">
          <Routes>
            <Route path={ROUTES.CLASSES} element={<ClassesPage />} />
            <Route path={ROUTES.APPLICATIONS} element={<MyApplicationsPage />} />
            <Route path={ROUTES.ADMIN} element={<AdminPage />} />
            <Route path="*" element={<Navigate to={ROUTES.CLASSES} replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <AppShell />
    </StudentProvider>
  );
}
