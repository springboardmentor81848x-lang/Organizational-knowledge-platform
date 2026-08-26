import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Breadcrumb } from '../components/Breadcrumb';
import { AiChatWidget } from '../components/AiChatWidget';
import { IntroTourModal } from '../components/IntroTourModal';
import { BotanicalBackground } from '../components/ui/BotanicalBackground';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4FBFB] text-[#17324D] flex font-sans antialiased selection:bg-[#0A7A74] selection:text-white relative">
      {/* Decorative Botanical & Wave Atmosphere */}
      <BotanicalBackground showPlants={true} showWaves={true} showGrid={true} className="opacity-45" />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>

      {/* Persistent Floating AI Chat Assistant */}
      <AiChatWidget />

      {/* Role & Department Tailored Intro Tour Modal */}
      <IntroTourModal />
    </div>
  );
};
