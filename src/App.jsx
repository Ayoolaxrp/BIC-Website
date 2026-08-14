import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import PageLoader from './components/PageLoader';
import CursorGlow from './components/CursorGlow';

// Code-split every route so the initial bundle stays lean.
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Membership = lazy(() => import('./pages/Membership'));
const Events = lazy(() => import('./pages/Events'));
const Blog = lazy(() => import('./pages/Blog'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const Contact = lazy(() => import('./pages/Contact'));
const Sponsorship = lazy(() => import('./pages/Sponsorship'));
const Member = lazy(() => import('./pages/Member'));
const Admin = lazy(() => import('./pages/Admin'));
const Legal = lazy(() => import('./pages/Legal'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/legal" element={<Legal />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="never">
        <ScrollToTop />
        <ScrollProgress />
        <CursorGlow />
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </MotionConfig>
    </BrowserRouter>
  );
}
