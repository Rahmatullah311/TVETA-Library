import { CONFIG } from 'src/global-config';
import { ServiceProviderView } from 'src/serviceProvider';

const metadata = { title: `Service Providers | Dashboard - ${CONFIG.appName}` };

export default function ServiceProvidersPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <ServiceProviderView />
    </>
  );
}