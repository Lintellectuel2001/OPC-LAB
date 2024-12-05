import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ClipboardList, Trash2 } from 'lucide-react';
import { getAllSamples, updateSample, deleteSample } from '../lib/db';

type Sample = {
  id: string;
  sampleNumber: string;
  fabricationDate: string;
  day7Date: string;
  day14Date: string;
  day28Date: string;
  client: string;
  site: string;
  concreteType: string;
  elementCoule: string;
  day7Result: number | null;
  day14Result: number | null;
  day28Result: number | null;
};

interface SamplesListProps {
  onSamplesLoad?: (samples: Sample[]) => void;
}

export function SamplesList({ onSamplesLoad }: SamplesListProps) {
  const { data: samples = [], refetch } = useQuery({
    queryKey: ['samples'],
    queryFn: getAllSamples
  });

  const [editingResult, setEditingResult] = React.useState<{
    id: string;
    field: 'day7Result' | 'day14Result' | 'day28Result';
    value: string;
  } | null>(null);

  React.useEffect(() => {
    if (onSamplesLoad && samples.length > 0) {
      const timeoutId = setTimeout(() => {
        onSamplesLoad(samples);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [samples, onSamplesLoad]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet échantillon ?')) {
      try {
        await deleteSample(id);
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleResultUpdate = async (id: string, field: string, value: number) => {
    try {
      await updateSample(id, { [field]: value });
      refetch();
    } catch (error) {
      console.error('Update error:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  if (!samples.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun échantillon</h3>
        <p className="mt-1 text-gray-500">Les échantillons ajoutés apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Liste des Échantillons
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                № Échantillon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client / Chantier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type / Élément
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Résultats (MPa)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {samples.map((sample: Sample) => (
              <tr key={sample.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sample.sampleNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{sample.client}</div>
                  <div className="text-xs text-gray-400">{sample.site}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{sample.concreteType}</div>
                  <div className="text-xs text-gray-400">{sample.elementCoule}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Fab: {format(new Date(sample.fabricationDate), 'dd/MM/yyyy')}</div>
                  <div className="text-xs text-gray-400">
                    7j: {format(new Date(sample.day7Date), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-xs text-gray-400">
                    14j: {format(new Date(sample.day14Date), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-xs text-gray-400">
                    28j: {format(new Date(sample.day28Date), 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    {['day7Result', 'day14Result', 'day28Result'].map((field) => (
                      <div key={field} className="flex items-center gap-2">
                        <span className="w-8 text-xs">{field.replace('Result', '')}j:</span>
                        {editingResult?.id === sample.id && editingResult.field === field ? (
                          <input
                            type="number"
                            value={editingResult.value}
                            onChange={(e) => setEditingResult({
                              ...editingResult,
                              value: e.target.value
                            })}
                            onBlur={async () => {
                              if (editingResult.value) {
                                await handleResultUpdate(
                                  sample.id,
                                  field,
                                  parseFloat(editingResult.value)
                                );
                              }
                              setEditingResult(null);
                            }}
                            className="w-20 text-sm border-gray-300 rounded-md"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingResult({
                              id: sample.id,
                              field: field as any,
                              value: sample[field as keyof Sample]?.toString() || ''
                            })}
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            {sample[field as keyof Sample] ? `${sample[field as keyof Sample]} MPa` : '-'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(sample.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}