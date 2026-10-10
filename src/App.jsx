import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import useLabelAssociation from './hooks/useLabelAssociation';
import Home from './pages/Home';
import About from './pages/About';
import Membership from './pages/Membership';
import Events from './pages/Events';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Sponsorship from './pages/Sponsorship';
import Legal from './pages/Legal';

// The app may be served at the root (Vercel, dev) or under a sub-path
// (GitHub Pages: /BIC-Website/). Base the router on Vite's BASE_URL so deep
// links, shared URLs, and client-side navigation all resolve on any deployment.
const routerBase =
  import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/+$/, '');

// Public navigation is bundled with the shell so moving between the pages a
// visitor is most likely to use never replaces the site with a blank fallback.
// Large, secondary tools remain split below.
const loaders = {
  article: () => import('./pages/ArticlePage'),
  member: () => import('./pages/Member'),
  admin: () => import('./pages/Admin'),
  notFound: () => import('./pages/NotFound'),
};
const ArticlePage = lazy(loaders.article);
const Member = lazy(loaders.member);
const Admin = lazy(loaders.admin);
const NotFound = lazy(loaders.notFound);

const PREFETCH = ['article', 'member'];

function usePrefetchRoutes() {
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => PREFETCH.forEach((k) => loaders[k]().catch(() => {})));
    return () => cancel(id);
  }, []);
}

function AppRoutes() {
  const location = useLocation();
  // Global a11y fix-up: associate visible form labels with their controls
  // on every route (axe: `label`, `select-name`).
  useLabelAssociation([location.pathname]);
  usePrefetchRoutes();

  return (
    // Keyed so each page gets a short CSS cross-fade in. Nothing waits on the
    // previous page, and reduced-motion turns it off (system.css).
    <main id="main-content" tabIndex={-1}>
      <Suspense fallback={<div className="page-pending" aria-busy="true" />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/events" element={<Events />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<ArticlePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/member" element={<Member />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="/legal" element={<LegalRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  );
}

/** Old links were /legal#privacy and /legal#terms. */
function LegalRedirect() {
  const { hash } = useLocation();
  return <Navigate to={hash === '#terms' ? '/terms' : '/privacy'} replace />;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBase}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <ScrollToTop />
      <Navbar />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}
