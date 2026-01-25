import React from 'react';
import { ThemeProvider } from './context/ThemeContext';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import MyPropertiesPage from './pages/MyPropertiesPage';
import SettingsPage from './pages/SettingsPage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentPage from './pages/PaymentPage';
import UsersPage from './pages/UsersPage';
import HistoryPage from './pages/HistoryPage';
import RequestsPage from './pages/RequestsPage';
import ContactOwnerPage from './pages/ContactOwnerPage';
import AIPricingPage from './pages/AIPricingPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const App = () => {
    return (
        <ThemeProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/property/:id" element={<PropertyDetailPage />} />
                            <Route path="/property/:id/contact" element={<ContactOwnerPage />} />
                            <Route path="/ai-pricing" element={<AIPricingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard/my-properties" element={
                                <ProtectedRoute>
                                    <MyPropertiesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/add-property" element={
                                <ProtectedRoute>
                                    <AddPropertyPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/edit-property/:id" element={
                                <ProtectedRoute>
                                    <EditPropertyPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/messages" element={
                                <ProtectedRoute>
                                    <MessagesPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard/users" element={
                                <ProtectedRoute>
                                    <UsersPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/settings" element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/payment" element={
                                <ProtectedRoute>
                                    <PaymentPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard/history" element={
                                <ProtectedRoute>
                                    <HistoryPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard/requests" element={
                                <ProtectedRoute>
                                    <RequestsPage />
                                </ProtectedRoute>
                            } />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                    <Toaster position="top-right" />
                </div>

                <style jsx>{`
                .app {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: var(--background);
                    color: var(--text-main);
                }
                main {
                    flex-grow: 1;
                }
            `}</style>
            </Router>
        </ThemeProvider>
    );
};

export default App;
