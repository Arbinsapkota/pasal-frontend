import React from "react";
import MemberModal from "../MemberModal";
import Container from "../container";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      
      <Container>{children}</Container>
      <MemberModal />
    </div>
  );
};

export default Layout;
