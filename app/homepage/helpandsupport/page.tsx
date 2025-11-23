import HelpAndSupportClient from "@/components/(non-authenticated)/clientHelpandSupport";
import Footer from "@/components/(non-authenticated)/Footer";
import Header from "@/components/(non-authenticated)/Header";
import React from "react";

const helpAndSupportPage = () => {
  return (
    <>
      <Header />
      <HelpAndSupportClient />
      <Footer />
    </>
  );
};

export default helpAndSupportPage;
