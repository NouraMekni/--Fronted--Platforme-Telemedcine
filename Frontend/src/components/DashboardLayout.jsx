import React from "react";

// Create simple sidebar components since the original ones are missing
const SidebarAdmin = () => <div>Admin Sidebar</div>;
const SidebarMedecin = () => <div>Medecin Sidebar</div>;
const SidebarPatient = () => <div>Patient Sidebar</div>;

const DashboardLayout = ({ userType, children }) => {
  const renderSidebar = () => {
    switch (userType) {
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
    <div className="dashboard-layout">
      {renderSidebar()}
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;