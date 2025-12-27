import { CONFIG } from 'src/global-config';
import { ServicesListView } from 'src/services';

// ----------------------------------------------------------------------

const metadata = { title: `Services | ${CONFIG.appName}` };

export default function ServicesPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <ServicesListView />
    </>
  );
}