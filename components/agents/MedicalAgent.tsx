import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeminiService } from '../../services/geminiService';
import { Card, Button } from '../Shared';
import { Upload } from 'lucide-react';

export const MedicalAgent = () => {
  const [image, setImage] = useState<string | null>(null);
  
  const explainMutation = useMutation({
    mutationFn: async (img: string) => {
        return GeminiService.analyzeImage("Analyze this medical scan. Explain what is visible in simple terms for a patient, and technical terms for a doctor.", img);
    }
  });

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
             {/* Original */}
             <Card className="relative overflow-hidden flex items-center justify-center bg-black">
                {image ? <img src={image} className="h-full w-full object-contain opacity-90" /> : <span className="text-white/50">Original Scan</span>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                     const f = e.target.files?.[0];
                     if(f) { const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(f); }
                }} />
                {!image && <div className="absolute pointer-events-none flex flex-col items-center text-white/70"><Upload className="mb-2"/> Upload X-Ray/MRI</div>}
             </Card>
             {/* Heatmap (Simulated via CSS filter for demo) */}
             <Card className="relative overflow-hidden flex items-center justify-center bg-black">
                {image ? (
                    <>
                        <img src={image} className="h-full w-full object-contain filter hue-rotate-90 contrast-125 saturate-200 opacity-80" />
                        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">AI Heatmap Layer</div>
                    </>
                ) : (
                    <span className="text-white/50">AI Attention Map</span>
                )}
             </Card>
        </div>

        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Explainability Report</h3>
                <Button disabled={!image || explainMutation.isPending} onClick={() => image && explainMutation.mutate(image)}>
                    {explainMutation.isPending ? 'Generating...' : 'Analyze Image'}
                </Button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg min-h-[100px] text-sm whitespace-pre-wrap">
                {explainMutation.data || "AI analysis will appear here explaining the scan findings."}
            </div>
        </Card>
    </div>
  );
};