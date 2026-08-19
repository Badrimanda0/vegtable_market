import { getDailyActivityDetails } from '../../actions';
import DailyActivitiesClient from './DailyActivitiesClient';

export const dynamic = 'force-dynamic';

export default async function DailyReportDetailPage({
  params
}: {
  params: Promise<{ date: string }>;
}) {
  const resolvedParams = await params;
  const decodedDate = decodeURIComponent(resolvedParams.date);
  const data = await getDailyActivityDetails(decodedDate);

  return <DailyActivitiesClient data={data} />;
}
