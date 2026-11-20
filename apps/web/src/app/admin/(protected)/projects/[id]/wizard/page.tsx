import { WizardWorkspace } from '../../../../../../components/wizard-workspace';

export const dynamic = 'force-dynamic';

export default async function ProjectWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WizardWorkspace projectId={id} />;
}
