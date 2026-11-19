import Link from 'next/link';
import { SiteHeader } from '../components/site-header';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="container public-view">
        <section className="public-hero" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="eyebrow">Earth &amp; Climate Video Studio</p>
            <h1 id="hero-heading">The Planet Has a Story.</h1>
            <p>Science-led documentary stories about the world we share. Every published film will be reviewed by an editor.</p>
            <a className="button button-primary" href="#library">Explore the library</a>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="earth" /></div>
        </section>
        <section id="library" className="library-section" aria-labelledby="library-heading">
          <p className="eyebrow">Video library</p>
          <h2 id="library-heading">Films, when they are ready</h2>
          <div className="empty-state">
            <p>No published films yet.</p>
            <p className="muted">Only documentaries that pass editorial review will appear here.</p>
          </div>
          <p className="secondary-note">Production and review happen in the <Link href="/admin/login">protected studio</Link>.</p>
        </section>
      </main>
      <footer className="container site-footer">BlueDotAtlas · The Planet Has a Story.</footer>
    </>
  );
}
