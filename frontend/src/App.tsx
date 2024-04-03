import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TextPage from './components/TextPage';
import HomePage from './components/HomePage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/text/:catalog/:fileName" element={<TextPage />} />
      </Routes>
    </Router>
  )
}

export default App
