import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentHistory from "@/components/dashboard/AgentHistory";

const Dashboard = () => {
  const [selectedSender, setSelectedSender] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        selectedSender={selectedSender} 
        onSelectSender={setSelectedSender} 
      />
      <AgentHistory senderId={selectedSender} />
    </div>
  );
};

export default Dashboard;
