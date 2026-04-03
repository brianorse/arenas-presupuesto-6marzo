import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from './firebase';
import { LOGO_URL } from '@/utils';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }: { children: React.ReactNode, currentPageName: string }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const RouteAny = Route as any;

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#faf9f6]">
        <div className="relative mb-8">
          {/* Subtle gradient background for the logo */}
          <div className="absolute inset-0 bg-[#654935]/10 rounded-full blur-3xl animate-pulse" />
          
          {/* Logo with a gentle bounce animation */}
          <div className="relative animate-bounce">
            <img 
              src={LOGO_URL} 
              alt="Eventing" 
              className="w-24 h-24 object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-0.5 bg-[#e8ddd0] rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-[#654935] w-1/3 animate-[shimmer_2s_infinite] rounded-full" />
          </div>
          <p className="text-[#654935] text-[10px] font-bold tracking-[0.4em] uppercase opacity-50">
            Cargando experiencia
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        return (
          <RouteAny
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
