import { lazy, Suspense, type ReactNode } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import ChunkBoundary from './components/ui/ChunkBoundary';
import ReloadNotice from './components/ui/ReloadNotice';
import Home from './pages/Home';

// The archive and the CV load only when their route opens, keeping them out of the home bundle.
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const CvPage = lazy(() => import('./pages/CvPage'));

/** A lazy page: nothing while its code loads, a reload notice if the code is gone. */
const LazyPage = ({ children }: { children: ReactNode }) => (
  <ChunkBoundary fallback={<ReloadNotice />}>
    <Suspense fallback={null}>{children}</Suspense>
  </ChunkBoundary>
);

/** The route tree, shared by the browser (HashRouter) and the build-time prerender (MemoryRouter). */
export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="projects" element={<LazyPage><ArchivePage /></LazyPage>} />
      <Route path="cv" element={<LazyPage><CvPage /></LazyPage>} />
    </Route>
  </Routes>
);

export const Root = () => (
  <Router>
    <AppRoutes />
  </Router>
);
