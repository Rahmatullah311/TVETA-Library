import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import StatusOverviewPage from 'src/dashboard/status-overview/RequestOverview';
import ServiceStatusOverview from 'src/dashboard/status-overview/ServiceOverview';
// ----------------------------------------------------------------------

const metadata = { title: `Dashboard | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <DashboardContent>
        <StatusOverviewPage />
        <ServiceStatusOverview />


      </DashboardContent>
    </>
  );
}
