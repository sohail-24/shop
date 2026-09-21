import { Navigate, Routes, Route, useLocation } from "react-router";
import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/lib/roles";

// Lazy load all pages for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Info = lazy(() => import("./pages/Info"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceDetail = lazy(() => import("./pages/InvoiceDetail"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Warehouse = lazy(() => import("./pages/Warehouse"));
const Customers = lazy(() => import("./pages/Customers"));
const DeliveryZones = lazy(() => import("./pages/DeliveryZones"));
const GstRules = lazy(() => import("./pages/GstRules"));
const ShippingRules = lazy(() => import("./pages/ShippingRules"));
const Reports = lazy(() => import("./pages/Reports"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const OwnerPlaceholder = lazy(() => import("./pages/OwnerPlaceholder"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return children;
}

function OwnerRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/admin/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (!isOwner(user) && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        {/* Legacy customer login remains in source but is intentionally inactive. */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard routes with layout */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/products" element={<Products />} />
          <Route
            path="/categories"
            element={
              <OwnerRoute>
                <Categories />
              </OwnerRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <OwnerRoute>
                <AddProduct />
              </OwnerRoute>
            }
          />
          <Route
            path="/products/:slug/edit"
            element={
              <OwnerRoute>
                <EditProduct />
              </OwnerRoute>
            }
          />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/info" element={<Info />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={<OrderDetail />}
          />
          <Route
            path="/invoices"
            element={
              <OwnerRoute>
                <Invoices />
              </OwnerRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <OwnerRoute>
                <InvoiceDetail />
              </OwnerRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <OwnerRoute>
                <Inventory />
              </OwnerRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <OwnerRoute>
                <Warehouse />
              </OwnerRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <OwnerRoute>
                <Customers />
              </OwnerRoute>
            }
          />
          <Route
            path="/delivery-zones"
            element={
              <OwnerRoute>
                <DeliveryZones />
              </OwnerRoute>
            }
          />
          <Route
            path="/gst-rules"
            element={
              <OwnerRoute>
                <GstRules />
              </OwnerRoute>
            }
          />
          <Route
            path="/shipping-rules"
            element={
              <OwnerRoute>
                <ShippingRules />
              </OwnerRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <OwnerRoute>
                <Reports />
              </OwnerRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          {["/coupons", "/notifications", "/staff"].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <OwnerRoute>
                  <OwnerPlaceholder />
                </OwnerRoute>
              }
            />
          ))}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return <AppRoutes />;
}
