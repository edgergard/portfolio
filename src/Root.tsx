import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Archive from './pages/Archive';

export const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/archive" element={<Archive />} />
      </Route>
    </Routes>
  </Router>
);
