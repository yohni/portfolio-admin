import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PortfolioPage from './pages/PortfolioPage';
import ExperiencesPage from './pages/ExperiencesPage';
import BlogListPage from './pages/blog/BlogListPage';
import BlogFormPage from './pages/blog/BlogFormPage';
import BlogPreviewPage from './pages/blog/BlogPreviewPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/blog" replace />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="experiences" element={<ExperiencesPage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/new" element={<BlogFormPage />} />
            <Route path="blog/:id/edit" element={<BlogFormPage />} />
            <Route path="blog/:id/preview" element={<BlogPreviewPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/blog" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
