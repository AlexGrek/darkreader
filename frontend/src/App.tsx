import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TextPage from './components/TextPage';
import HomePage from './components/HomePage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/text/:catalog/:fileName" element={<TextPage />} />
      </Routes>
    </Router>
  )
}

export default App
