import React from "react";
import { useAuth } from "../contexts/AuthContext";
import SidebarAdmin from "./SidebarAdmin";
import SidebarMedecin from "./SidebarMedecin";
import SidebarPatient from "./SidebarPatient";

const DashboardLayout = ({ userType, children }) => {
  const { user } = useAuth();
  
  // Use userType prop if provided, otherwise get from user role
  const role = userType || user?.role?.toLowerCase();

  const renderSidebar = () => {
    switch (role) {
      case 'admin':
        return <SidebarAdmin />;
      case 'medecin':
        return <SidebarMedecin />;
      case 'patient':
        return <SidebarPatient />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout flex">
      {renderSidebar()}
      <main className="dashboard-content flex-1">
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;