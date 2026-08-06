import { Routes, Route } from 'react-router'
import { MarketplaceProvider } from '@/context/MarketplaceContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrowsePage from '@/pages/BrowsePage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import MortgagePage from '@/pages/MortgagePage'
import SavedPage from '@/pages/SavedPage'
import SellPage from '@/pages/SellPage'
import PipelinePage from '@/pages/PipelinePage'

export default function App() {
  return (
    <MarketplaceProvider>
      <div className="flex min-h-screen flex-col bg-cream">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/mortgage" element={<MortgagePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </MarketplaceProvider>
  )
}
