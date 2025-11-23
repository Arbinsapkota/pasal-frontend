import React from "react";
import InfoCards from "./InfoCards";
import AssignmentChart from "./Charts/AssignmentChart";

function Dashboard() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4">
      {/* Info Cards Section */}
      <div className="mb-8">
        <InfoCards />
      </div>

      {/* Assignment Chart Section */}
      <div>
        <AssignmentChart />
      </div>
    </div>
  );
}

export default Dashboard;
