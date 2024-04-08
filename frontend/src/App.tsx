import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TextPage from './components/TextPage';
import HomePage from './components/HomePage';
import ScrollToTop from './components/ScrollToTop';
import CreatePage from './components/CreatePage';
import AppendPage from './components/AppendPage';
import EditTextPage from './components/management/EditTextPage';
import CatalogEditPage from './components/management/CatalogEditPage';
import FileListAdmin from './components/management/FileListAdmin';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/text/:catalog/:fileName" element={<TextPage />} />
        <Route path="/append/:catalog" element={<AppendPage />} />
        <Route path="/edit/:catalog/:file" element={<EditTextPage />} />
        <Route path="/edit/:catalog" element={<CatalogEditPage />} />
        <Route path="/manage" element={<FileListAdmin />} />
      </Routes>
    </Router>
  )
}

export default App
