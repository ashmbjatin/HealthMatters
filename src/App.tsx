import React, { useState } from 'react';
import { MedicalProvider, useMedical } from './context/MedicalContext';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { TimelineView } from './components/TimelineView';
import { ReviewView } from './components/ReviewView';
import { ShareView } from './components/ShareView';
import { DoctorView } from './components/DoctorView';

const MainContent: React.FC = () => {
  const { activeTab } = useMedical();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Top Header */}
      <Header onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />

      {/* Main Container */}
      <main className="app-container">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'upload' && <UploadView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'review' && <ReviewView />}
        {activeTab === 'share' && <ShareView />}
        {activeTab === 'doctor' && <DoctorView />}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />
    </div>
  );
};

export function App() {
  return (
    <MedicalProvider>
      <MainContent />
    </MedicalProvider>
  );
}

export default App;
