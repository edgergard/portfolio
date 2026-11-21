import { lazy, Suspense } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';

// The archive and the CV load only when their route opens, keeping them out of the home bundle.
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const CvPage = lazy(() => import('./pages/CvPage'));

/** The route tree, shared by the browser (HashRouter) and the build-time prerender (MemoryRouter). */
export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="projects" element={<Suspense fallback={null}><ArchivePage /></Suspense>} />
      <Route path="cv" element={<Suspense fallback={null}><CvPage /></Suspense>} />
    </Route>
  </Routes>
);

export const Root = () => (
  <Router>
    <AppRoutes />
  </Router>
);
