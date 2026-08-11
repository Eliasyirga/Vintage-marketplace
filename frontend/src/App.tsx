import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/marketplace/HomePage'
import BrowsePage from './pages/marketplace/BrowsePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ProfilePage from './pages/account/ProfilePage'
import FavoritesPage from './pages/account/FavoritesPage'
import MessagesPage from './pages/account/MessagesPage'
import SellPage from './pages/selling/SellPage'
import MyListingsPage from './pages/selling/MyListingsPage'
import AdminPage from './pages/admin/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
