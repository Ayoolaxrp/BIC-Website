import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import FadeIn from '../components/FadeIn';
import { fetchArticles } from '../lib/api';

/**
 * Full-article page for club-written articles (is_external: false).
 * Curated/linked articles never land here — their cards point to the
 * original publication.
 */
export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchArticles().then((rows) => {
      if (!alive) return;
      const match = rows.find((a) => a.id === id && !a.is_external && a.body);
      if (match) setArticle(match);
      else setNotFound(true);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (notFound) {
    return (
      <section className="section container text-center" style={{ paddingTop: 120, paddingBottom: 120 }}>
        <h1 className="section-title">Article not found</h1>
        <p className="admin-subtitle">
          This article may have been unpublished. Browse the rest of our library instead.
        </p>
        <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
      </section>
    );
  }

  if (!article) return <div style={{ minHeight: 400 }} />;

  const paragraphs = String(article.body || '').split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <PageHero
        crumb={`Blog / ${article.category || 'Article'}`}
        title={article.title}
        description={article.summary}
      />

      <FadeIn className="section container">
        <motion.article
          className="article-page"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="blog-meta" style={{ marginBottom: 20, justifyContent: 'center' }}>
            <span>{article.published_date || 'Latest'}</span>
            <span>by {article.author || 'Babcock Investors Club'}</span>
          </div>

          {article.cover_url && (
            <div className="article-cover">
              <img src={article.cover_url} alt={article.title} />
            </div>
          )}

          <div className="article-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="article-footer">
            <p>
              This article was written by the <strong>Babcock Investors Club</strong> editorial team
              for the education of our members. It is not financial advice.
            </p>
            <Link to="/blog" className="btn btn-primary">← Back to Blog</Link>
          </div>
        </motion.article>
      </FadeIn>
    </>
  );
}
