
import { Container } from '@mui/material';

import { CONFIG } from 'src/global-config';
import RequestTable from 'src/service-requests/components/RequestTable';

// ----------------------------------------------------------------------

const metadata = { title: `Page Request | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <Container>
        <RequestTable />
      </Container>
    </>
  );
}
