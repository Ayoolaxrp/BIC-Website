import { Link } from 'react-router-dom';

/**
 * Shared page-hero used by every sub-page: gradient header with
 * breadcrumb (Home / <Page>) and title + description.
 */
export default function PageHero({ crumb, title, description, children }) {
  return (
    <header className="page-hero">
      <div className="page-hero-grid"></div>
      <div className="container relative z-10 fade-in visible">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> {crumb}
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </header>
  );
}
