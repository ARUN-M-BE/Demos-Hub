import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeminiService } from '../../services/geminiService';
import { Card, Button, Skeleton } from '../Shared';
import { Upload, Search } from 'lucide-react';

export const FlowerMarketAgent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{ species: string; price: string; confidence: string } | null>(null);
  
  const analyzeMutation = useMutation({
    mutationFn: async (img: string) => {
      const prompt = "Identify this flower species, estimate a current market price per stem (in USD), and give a confidence score. Return JSON format: { \"species\": \"...\", \"price\": \"...\", \"confidence\": \"...\" }";
      const text = await GeminiService.analyzeImage(prompt, img);
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    },
    onSuccess: (data) => setResult(data)
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="p-6 relative flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50">
        {!image ? (
          <label className="cursor-pointer flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Click to upload flower image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          </label>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center">
             <img src={image} alt="Uploaded" className="max-h-[300px] rounded-lg shadow-md object-contain" />
             <div className="mt-4 flex gap-2">
                <Button onClick={() => analyzeMutation.mutate(image)} disabled={analyzeMutation.isPending}>
                  {analyzeMutation.isPending ? 'Analyzing...' : 'Identify Flower'}
                </Button>
                <Button variant="outline" onClick={() => setImage(null)}>Clear</Button>
             </div>
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500" /> Analysis Results
        </h3>
        {analyzeMutation.isPending && <Skeleton className="h-40 w-full" />}
        {!analyzeMutation.isPending && !result && <p className="text-slate-500">Upload and analyze to see results.</p>}
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <span className="text-sm text-green-600 dark:text-green-400 uppercase tracking-wide">Species</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{result.species}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                 <span className="text-sm text-slate-500">Est. Price</span>
                 <p className="text-lg font-semibold">{result.price}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                 <span className="text-sm text-slate-500">Confidence</span>
                 <p className="text-lg font-semibold">{result.confidence}</p>
              </div>
            </div>
            <Button className="w-full" variant="secondary">Save to Inventory</Button>
          </div>
        )}
      </Card>
    </div>
  );
};