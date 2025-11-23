import Header from '@/components/(non-authenticated)/Header';
import React from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import Footer from '@/components/(non-authenticated)/Footer';

const Page = () => {
  return (
    <>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </>
  );
};

export default Page; 
