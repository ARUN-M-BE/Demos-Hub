import React, { useState } from 'react';
import { Card, Button } from '../Shared';
import { Camera } from 'lucide-react';

export const AsphaltAgent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  
  const handleAnalyze = () => {
    setAnalyzed(false);
    setTimeout(() => setAnalyzed(true), 2000); 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 relative min-h-[400px] flex items-center justify-center bg-black/5 overflow-hidden">
        {!image ? (
            <label className="cursor-pointer flex flex-col items-center">
              <Camera className="w-12 h-12 text-slate-400 mb-2" />
              <span className="text-sm font-medium">Upload Road Surface Image</span>
              <input type="file" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { const r = new FileReader(); r.onload = () => { setImage(r.result as string); setAnalyzed(false); }; r.readAsDataURL(f); }
              }} />
            </label>
        ) : (
            <div className="relative w-full h-full">
                <img src={image} className="w-full h-full object-cover rounded" alt="Road" />
                {analyzed && (
                    <>
                        <div className="absolute top-[20%] left-[30%] w-[15%] h-[10%] border-2 border-red-500 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
                        <div className="absolute bottom-[40%] right-[20%] w-[25%] h-[5%] border-2 border-red-500 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
                    </>
                )}
                <Button className="absolute bottom-4 right-4 z-10" onClick={() => setImage(null)} variant="secondary">Change Image</Button>
            </div>
        )}
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Quality Metrics</h3>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1 text-sm font-medium">
                        <span>Surface Integrity</span>
                        <span>{analyzed ? '64%' : '--'}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${analyzed ? 'bg-orange-500 w-[64%]' : 'w-0'} transition-all duration-1000`} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between mb-1 text-sm font-medium">
                        <span>Crack Density</span>
                        <span>{analyzed ? 'High' : '--'}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${analyzed ? 'bg-red-600 w-[85%]' : 'w-0'} transition-all duration-1000`} />
                    </div>
                </div>
            </div>
            <div className="mt-8">
                 <Button onClick={handleAnalyze} disabled={!image || analyzed} className="w-full mb-3">
                     {analyzed ? 'Analysis Complete' : 'Start Inspection'}
                 </Button>
                 {analyzed && <Button variant="danger" className="w-full">Schedule Repair Crew</Button>}
            </div>
        </Card>
      </div>
    </div>
  );
};