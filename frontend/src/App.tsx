import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TextPage from './components/TextPage';
import HomePage from './components/HomePage';
import ScrollToTop from './components/ScrollToTop';
import CreatePage from './components/CreatePage';
import AppendPage from './components/AppendPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/text/:catalog/:fileName" element={<TextPage />} />
        <Route path="/append/:catalog" element={<AppendPage />} />
      </Routes>
    </Router>
  )
}

export default App
