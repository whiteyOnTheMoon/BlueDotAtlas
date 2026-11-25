import Link from 'next/link';
import { BrandMark } from '../../../../../../components/brand-mark';
import { VideoPreview } from '../../../../../../components/video-preview';
import { videoPreviewEnabled } from '../../../../../../lib/video-047';

export const dynamic = 'force-dynamic';

export default async function ProjectVideo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enabled = videoPreviewEnabled();
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <span className="studio-tag">Admin studio · Private video preview</span>
        </div>
      </header>
      <main className="container admin-view project-workspace">
        <p className="eyebrow">Production workspace · Roadmap 047</p>
        <h1>Private video preview</h1>
        <p className="muted">
          Rendered videos are stored privately and unpublished. Only signed-in administrators can
          play or download them.
        </p>
        <p>
          <Link href={'/admin/projects/' + encodeURIComponent(id)}>← Back to project</Link>
        </p>
        {enabled ? (
          <VideoPreview projectId={id} />
        ) : (
          <p className="muted">Video preview is disabled on this server.</p>
        )}
      </main>
    </>
  );
}
