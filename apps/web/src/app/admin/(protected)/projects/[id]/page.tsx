import { ProjectWorkspace } from '../../../../../components/project-workspace';
import { assertRender046TestEnvironment } from '@bluedotatlas/db/queue-046';

export const dynamic = 'force-dynamic';

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let syntheticRenderEnabled = false;
  try {
    assertRender046TestEnvironment();
    syntheticRenderEnabled = true;
  } catch {
    // A public or productive preview must never offer 046 rendering.
  }
  return <ProjectWorkspace projectId={id} syntheticRenderEnabled={syntheticRenderEnabled} />;
}
