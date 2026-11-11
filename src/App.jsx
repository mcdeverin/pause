import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import GhostStudio from './pages/GhostStudio.jsx';

const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const Cloud = lazy(() => import('./pages/Cloud.jsx'));
const Popcorn = lazy(() => import('./pages/Popcorn.jsx'));
const LiquidSurface = lazy(() => import('./pages/LiquidSurface.jsx'));
const PrismaticWater = lazy(() => import('./pages/PrismaticWater.jsx'));
const Underwater = lazy(() => import('./pages/Underwater.jsx'));
const SensoryStudio = lazy(() => import('./pages/SensoryStudio.jsx'));
const ShapesStudio = lazy(() => import('./pages/ShapesStudio.jsx'));
const LiquidOrbStudio = lazy(() => import('./pages/LiquidOrbStudio.jsx'));

// Add page imports here

// Show onboarding only on a fresh installation. Returning users retain their
// completed onboarding and existing personalization.
function HomeEntry() {
  let completed = false;
  try {
    completed = Boolean(localStorage.getItem("alwaysPauseOnboardingV1"));
  } catch {
    // Storage can be unavailable in private browsing; still allow onboarding.
  }
  return completed ? <Home /> : <Navigate to="/onboarding" replace />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<HomeEntry />} />
      <Route path="/onboarding" element={<Suspense fallback={<div className="fixed inset-0 bg-slate-900" />}><Onboarding /></Suspense>} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/theme-studio" element={<GhostStudio />} />
      <Route path="/sensory/liquid-surface" element={<Suspense fallback={<div className="p-8">Loading Liquid Surface…</div>}><LiquidSurface /></Suspense>} />
      <Route path="/sensory/prismatic-water" element={<Suspense fallback={<div className="p-8">Loading Prismatic Water…</div>}><PrismaticWater /></Suspense>} />
      <Route path="/sensory/cloud" element={<Suspense fallback={<div className="p-8">Loading Cloud…</div>}><Cloud /></Suspense>} />
      <Route path="/sensory/popcorn" element={<Suspense fallback={<div className="p-8">Loading Popcorn…</div>}><Popcorn /></Suspense>} />
      <Route path="/sensory/underwater" element={<Suspense fallback={<div className="p-8">Loading Underwater…</div>}><Underwater /></Suspense>} />
      <Route path="/sensory-studio" element={<Suspense fallback={<div className="p-8">Loading Sensory Studio…</div>}><SensoryStudio /></Suspense>} />
      <Route path="/orb-studio" element={<Suspense fallback={<div className="p-8">Loading Shapes Studio…</div>}><ShapesStudio /></Suspense>} />
      <Route path="/liquid-orb-studio" element={<Suspense fallback={<div className="p-8">Loading Liquid Orb Studio…</div>}><LiquidOrbStudio /></Suspense>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App