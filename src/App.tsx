import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAuth } from './lib/firebase';
import { SampleForm } from './components/SampleForm';
import { ResultsChart } from './components/ResultsChart';
import { SamplesList } from './components/SamplesList';
import { Toast } from './components/Toast';
import { checkDueTests, TestNotification } from './lib/notifications';
import { Building2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notifications, setNotifications] = React.useState<TestNotification[]>([]);

  React.useEffect(() => {
    const init = async () => {
      try {
        const authInitialized = await initializeAuth();
        if (!authInitialized) {
          setError('Erreur d\'authentification. Mode lecture seule activé.');
        }
        setIsInitialized(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'initialisation';
        setError(message);
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  const handleSamplesLoad = (samples: any[]) => {
    const dueTests = checkDueTests(samples);
    setNotifications(dueTests);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-red-600 text-xl font-semibold mb-4">Erreur d'initialisation</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {notifications.map((notification, index) => (
          <Toast
            key={`${notification.sampleNumber}-${notification.days}`}
            message={`Test à effectuer aujourd'hui : Échantillon ${notification.sampleNumber} (${notification.days} jours)`}
            onClose={() => removeNotification(index)}
          />
        ))}

        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">OPC GROUPE</h1>
                <p className="text-sm text-gray-500">Gestion de Laboratoire</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <SampleForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['samples'] })} />
            <SamplesList onSamplesLoad={handleSamplesLoad} />
            <ResultsChart />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;