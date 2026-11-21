import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import ArchivePage from './pages/ArchivePage';
import CvPage from './pages/CvPage';
import Home from './pages/Home';

export const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<ArchivePage />} />
        <Route path="cv" element={<CvPage />} />
      </Route>
    </Routes>
  </Router>
);
