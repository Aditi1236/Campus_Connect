// Defines every page (route) of the application.
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardLayout from './components/DashboardLayout';

import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import BrowseItems from './pages/BrowseItems';
import ItemDetails from './pages/ItemDetails';
import StudentDashboard from './pages/StudentDashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import EditItem from './pages/EditItem';
import MyListings from './pages/MyListings';
import MyClaims from './pages/MyClaims';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminClaims from './pages/AdminClaims';
import AdminItems from './pages/AdminItems';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

// Public pages: navbar on top, footer at the bottom
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-main">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
      <Route path="/browse" element={<PublicLayout><BrowseItems /></PublicLayout>} />
      <Route path="/items/:id" element={<PublicLayout><ItemDetails /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

      {/* ---------- Student area (login required) ---------- */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/items/:id/edit" element={<EditItem />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ---------- Admin area (admin role required) ---------- */}
      <Route element={<AdminRoute><DashboardLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}
