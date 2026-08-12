import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { StockMovements } from './pages/StockMovements';
import { SalesChallans } from './pages/SalesChallans';
import { CreateChallan } from './pages/CreateChallan';
import { ChallanDetails } from './pages/ChallanDetails';
import { UsersPage } from './pages/Users';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />
              <Route
                path="/customers"
                element={
                  <MainLayout>
                    <Customers />
                  </MainLayout>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <MainLayout>
                    <CustomerDetails />
                  </MainLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <MainLayout>
                    <Products />
                  </MainLayout>
                }
              />
              <Route
                path="/inventory"
                element={
                  <MainLayout>
                    <Inventory />
                  </MainLayout>
                }
              />
              <Route
                path="/stock-movements"
                element={
                  <MainLayout>
                    <StockMovements />
                  </MainLayout>
                }
              />
              <Route
                path="/challans"
                element={
                  <MainLayout>
                    <SalesChallans />
                  </MainLayout>
                }
              />
              <Route
                path="/challans/create"
                element={
                  <MainLayout>
                    <CreateChallan />
                  </MainLayout>
                }
              />
              <Route
                path="/challans/:id"
                element={
                  <MainLayout>
                    <ChallanDetails />
                  </MainLayout>
                }
              />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route
                path="/users"
                element={
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
