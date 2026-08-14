/**
 * Resolve an asset path under the app's base URL.
 *
 * Root-absolute paths like `/images/logo.png` work on Vercel (served at the
 * domain root) but 404 on GitHub Pages, where the app lives under a sub-path
 * (`/BIC-Website/`). Vite injects the correct base via import.meta.env.BASE_URL
 * ('/' or '/BIC-Website/'), so this resolves correctly on every deployment.
 */
export const asset = (path) => import.meta.env.BASE_URL + String(path).replace(/^\//, '');
