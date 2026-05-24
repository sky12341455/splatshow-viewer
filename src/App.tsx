import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import ViewerPage from './pages/ViewerPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Route>
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </Router>
  )
}