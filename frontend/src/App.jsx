import { Navigate, Route, Routes } from 'react-router-dom';
import { StudentIdInput } from './components/StudentIdInput';
import { StudentProvider } from './contexts/StudentContext';
import { ROUTES } from './constants/routes';
import { useRouteFocus } from './hooks/useRouteFocus';
import { AppNav } from './navigation/AppNav';
import { ClassesPage } from './pages/classes/ClassesPage';
import { MyApplicationsPage } from './pages/my-applications/MyApplicationsPage';

function AppShell() {
  const mainRef = useRouteFocus();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="card app-header">
        <div className="app-header-row">
          <div>
            <p className="brand">School Admission System</p>
            <p className="text-muted">Seat hold & confirmation portal</p>
          </div>
          <StudentIdInput />
        </div>
      </header>

      <AppNav />

      <main id="main-content" ref={mainRef} tabIndex={-1} className="main-content">
        <Routes>
          <Route path={ROUTES.CLASSES} element={<ClassesPage />} />
          <Route path={ROUTES.APPLICATIONS} element={<MyApplicationsPage />} />
          <Route path="*" element={<Navigate to={ROUTES.CLASSES} replace />} />
        </Routes>
      </main>
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
