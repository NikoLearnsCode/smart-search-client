import {SearchModal} from '@/components/search/SearchModal';
import {SearchOpenTrigger} from '@/components/search/SearchOpenTrigger';
import {SearchProvider} from '@/components/search/SearchProvider';
import {Analytics} from '@vercel/analytics/react';

function App() {
  return (
    <SearchProvider>
      <div className='min-h-screen px-2.75 md:px-5 py-3.25 md:py-6'>
        <SearchOpenTrigger className='mb-8' />
        <SearchModal />
      </div>
      <Analytics />
    </SearchProvider>
  );
}

export default App;
