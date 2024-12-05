import React from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { addSample } from '../lib/db';
import { addDays, format } from 'date-fns';

const concreteTypes = ['B25', 'B30', 'B35'];

type FormData = {
  sampleNumber: string;
  fabricationDate: string;
  client: string;
  site: string;
  concreteType: string;
  elementCoule: string;
};

export function SampleForm({ onSuccess }: { onSuccess: () => void }) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [lastSample, setLastSample] = React.useState<FormData | null>(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>();
  const fabricationDate = watch('fabricationDate');

  const calculateTestDates = (fabricationDate: string) => {
    if (!fabricationDate) return { day7: '', day14: '', day28: '' };
    const baseDate = new Date(fabricationDate);
    return {
      day7: format(addDays(baseDate, 7), 'yyyy-MM-dd'),
      day14: format(addDays(baseDate, 14), 'yyyy-MM-dd'),
      day28: format(addDays(baseDate, 28), 'yyyy-MM-dd'),
    };
  };

  const testDates = calculateTestDates(fabricationDate);

  const onSubmit = async (data: FormData) => {
    try {
      const dates = calculateTestDates(data.fabricationDate);
      await addSample({
        sampleNumber: data.sampleNumber,
        fabricationDate: data.fabricationDate,
        day7Date: dates.day7,
        day14Date: dates.day14,
        day28Date: dates.day28,
        client: data.client,
        site: data.site,
        concreteType: data.concreteType,
        elementCoule: data.elementCoule,
        day7Result: null,
        day14Result: null,
        day28Result: null
      });

      setLastSample(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue lors de l\'enregistrement');
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && lastSample && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Échantillon enregistré avec succès</h3>
            <div className="mt-2 text-sm text-green-800">
              <p>Échantillon n° {lastSample.sampleNumber} ({lastSample.concreteType})</p>
              <p>Dates des tests :</p>
              <ul className="mt-1 list-disc list-inside">
                <li>7 jours : {testDates.day7}</li>
                <li>14 jours : {testDates.day14}</li>
                <li>28 jours : {testDates.day28}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          Nouvel Échantillon
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro d'échantillon
            </label>
            <input
              type="text"
              {...register('sampleNumber', { required: "Le numéro d'échantillon est requis" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.sampleNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.sampleNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de Fabrication
            </label>
            <input
              type="date"
              {...register('fabricationDate', { required: "La date de fabrication est requise" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.fabricationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.fabricationDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <input
              type="text"
              {...register('client', { required: "Le nom du client est requis" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">{errors.client.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chantier
            </label>
            <input
              type="text"
              {...register('site', { required: "Le nom du chantier est requis" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.site && (
              <p className="mt-1 text-sm text-red-600">{errors.site.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de Béton
            </label>
            <select
              {...register('concreteType', { required: "Le type de béton est requis" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {concreteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.concreteType && (
              <p className="mt-1 text-sm text-red-600">{errors.concreteType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Élément Coulé
            </label>
            <input
              type="text"
              {...register('elementCoule', { required: "L'élément coulé est requis" })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="ex: Dalle, Poteau, Fondation..."
            />
            {errors.elementCoule && (
              <p className="mt-1 text-sm text-red-600">{errors.elementCoule.message}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Enregistrer l'échantillon
          </button>
        </div>
      </form>
    </div>
  );
}