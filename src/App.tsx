import { Routes, Route } from 'react-router'
import { MarketplaceProvider } from '@/context/MarketplaceContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrowsePage from '@/pages/BrowsePage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import MortgagePage from '@/pages/MortgagePage'
import AffordabilityPage from '@/pages/AffordabilityPage'
import SavedPage from '@/pages/SavedPage'
import SellPage from '@/pages/SellPage'
import PipelinePage from '@/pages/PipelinePage'
import ManagePage from '@/pages/ManagePage'
import ComparePage from '@/pages/ComparePage'
import MarketInsightsPage from '@/pages/MarketInsightsPage'

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
            <Route path="/affordability" element={<AffordabilityPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/insights" element={<MarketInsightsPage />} />
            <Route path="/manage" element={<ManagePage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/saved" element={<SavedPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </MarketplaceProvider>
  )
}
