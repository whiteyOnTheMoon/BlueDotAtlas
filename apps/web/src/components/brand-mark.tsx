import Link from 'next/link';

export function BrandMark() {
  return (
    <Link className="brand" href="/" aria-label="BlueDotAtlas home">
      <img
        src="/brand/logo-dark.svg"
        alt="BlueDotAtlas"
        className="brand-dark"
        width="236"
        height="53"
      />
      <img
        src="/brand/logo-light.svg"
        alt="BlueDotAtlas"
        className="brand-light"
        width="236"
        height="53"
      />
    </Link>
  );
}
