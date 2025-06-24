import React from 'react';
import Head from 'next/head';
import StatsPage from '@/components/StatsPage';

const AnalyticsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Analytics - URL Shortener</title>
        <meta 
          name="description" 
          content="View detailed analytics and statistics for your URL shortening service. Monitor performance, track usage, and gain insights." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <StatsPage />
    </>
  );
};

export default AnalyticsPage;
