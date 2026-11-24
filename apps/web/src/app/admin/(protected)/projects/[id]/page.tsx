import { ProjectWorkspace } from '../../../../../components/project-workspace';
import { assertRender046ExecutionEnvironment } from '@bluedotatlas/db/queue-046';

export const dynamic = 'force-dynamic';

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enabled = (kind: 'synthetic' | 'pilot_film') => {
    try {
      assertRender046ExecutionEnvironment(kind);
      return true;
    } catch {
      // A public or productive preview must never offer 046 rendering.
      return false;
    }
  };
  return (
    <ProjectWorkspace
      projectId={id}
      syntheticRenderEnabled={enabled('synthetic')}
      pilotFilmEnabled={enabled('pilot_film')}
    />
  );
}
