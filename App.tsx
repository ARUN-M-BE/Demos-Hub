import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, AGENTS } from './components/Layout';
import { Card, Button, ErrorBoundary } from './components/Shared';
import { 
  FlowerMarketAgent, 
  DisasterAgent, 
  AsphaltAgent, 
  MedicalAgent, 
  FinancialAgent, 
  LogisticsAgent, 
  EnergyAgent, 
  EducationAgent, 
  SecurityAgent 
} from './components/agents';
import { ArrowRight } from 'lucide-react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        }
    }
});

const DashboardGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENTS.map((agent) => (
            <Card key={agent.id} className="p-6 flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => window.location.hash = agent.path}>
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${agent.color}`}>
                    <agent.icon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-1">{agent.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{agent.description}</p>
                </div>
                <Button variant="outline" className="mt-auto w-full group flex items-center justify-center gap-2">
                    Launch Agent <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Card>
        ))}
    </div>
);

const App = () => {
  const getHash = () => window.location.hash.replace('#', '').replace('/', '');
  const [hash, setHash] = useState(getHash());

  useEffect(() => {
    const handleHashChange = () => setHash(getHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch(hash) {
      case 'flower': return <FlowerMarketAgent />;
      case 'disaster': return <DisasterAgent />;
      case 'asphalt': return <AsphaltAgent />;
      case 'medical': return <MedicalAgent />;
      case 'financial': return <FinancialAgent />;
      case 'logistics': return <LogisticsAgent />;
      case 'energy': return <EnergyAgent />;
      case 'education': return <EducationAgent />;
      case 'security': return <SecurityAgent />;
      default: return <DashboardGrid />;
    }
  };

  const currentAgent = AGENTS.find(a => a.id === hash);

  return (
    <QueryClientProvider client={queryClient}>
        <Layout currentPath={hash}>
            <ErrorBoundary>
                <div className="fade-in">
                    {hash && currentAgent && (
                        <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                {currentAgent?.icon && React.createElement(currentAgent.icon, { className: `w-8 h-8 ${currentAgent.color}` })}
                                {currentAgent?.title}
                             </h1>
                             <p className="text-slate-500">{currentAgent?.description}</p>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </ErrorBoundary>
        </Layout>
    </QueryClientProvider>
  );
};

export default App;