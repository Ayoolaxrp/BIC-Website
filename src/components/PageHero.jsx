import { useState } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/assets';

/**
 * Shared page hero. With `image`, a full-bleed club photograph sits under a
 * navy scrim (the same treatment as the homepage); without it, plain navy.
 */
export default function PageHero({ crumb, title, description, image, imagePosition, showBreadcrumb = false, children }) {
  const [imageReady, setImageReady] = useState(false);

  return (
    <header className={`page-hero${image ? ' page-hero-photo' : ''}`}>
      {image && (
        <>
          <img
            className={`ph-photo${imageReady ? ' is-ready' : ''}`}
            src={asset(image)}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onLoad={() => setImageReady(true)}
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
          <div className="ph-scrim" aria-hidden="true" />
        </>
      )}
      <div className="container ph-inner">
        {showBreadcrumb && (
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> {crumb}
          </div>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </header>
  );
}
