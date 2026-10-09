import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import useLabelAssociation from './hooks/useLabelAssociation';

// The app may be served at the root (Vercel, dev) or under a sub-path
// (GitHub Pages: /BIC-Website/). Base the router on Vite's BASE_URL so deep
// links, shared URLs, and client-side navigation all resolve on any deployment.
const routerBase =
  import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/+$/, '');

// Code-split every route so the first page stays small; the rest are
// fetched in the background once the first page has painted (see below).
const loaders = {
  home: () => import('./pages/Home'),
  about: () => import('./pages/About'),
  membership: () => import('./pages/Membership'),
  events: () => import('./pages/Events'),
  blog: () => import('./pages/Blog'),
  article: () => import('./pages/ArticlePage'),
  contact: () => import('./pages/Contact'),
  sponsorship: () => import('./pages/Sponsorship'),
  member: () => import('./pages/Member'),
  admin: () => import('./pages/Admin'),
  legal: () => import('./pages/Legal'),
  notFound: () => import('./pages/NotFound'),
};
const Home = lazy(loaders.home);
const About = lazy(loaders.about);
const Membership = lazy(loaders.membership);
const Events = lazy(loaders.events);
const Blog = lazy(loaders.blog);
const ArticlePage = lazy(loaders.article);
const Contact = lazy(loaders.contact);
const Sponsorship = lazy(loaders.sponsorship);
const Member = lazy(loaders.member);
const Admin = lazy(loaders.admin);
const Legal = lazy(loaders.legal);
const NotFound = lazy(loaders.notFound);

// Public pages a visitor is likely to open next. Prefetching them while the
// browser is idle makes every in-site navigation instant (no blank wait).
const PREFETCH = ['home', 'about', 'membership', 'events', 'blog', 'contact', 'sponsorship', 'legal'];

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
    <main key={location.pathname} className="page-enter">
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
      <ScrollToTop />
      <Navbar />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}
