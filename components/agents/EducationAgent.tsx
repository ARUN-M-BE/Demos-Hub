import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeminiService } from '../../services/geminiService';
import { Card, Button, Skeleton } from '../Shared';
import { Play, FileText } from 'lucide-react';

export const EducationAgent = () => {
    const [aspiration, setAspiration] = useState('');
    const scriptMutation = useMutation({
        mutationFn: async () => GeminiService.generateText('gemini-2.5-flash', `Write a 30-second inspiring video script for a child who wants to be: ${aspiration}. Include scene descriptions.`)
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-6">
                <Card className="p-6">
                    <label className="block text-sm font-medium mb-2">Child's Aspiration</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-700" 
                            placeholder="e.g. Astronaut, Marine Biologist..." 
                            value={aspiration}
                            onChange={(e) => setAspiration(e.target.value)}
                        />
                        <Button onClick={() => scriptMutation.mutate()} disabled={!aspiration || scriptMutation.isPending}>
                            Generate
                        </Button>
                    </div>
                </Card>
                <Card className="aspect-video bg-slate-900 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <span className="absolute bottom-4 left-4 text-white font-medium">Preview Generated Video (Simulated)</span>
                </Card>
            </div>
            
            <Card className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Script</h3>
                     <Button variant="outline" size="sm">Regenerate Voiceover</Button>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {scriptMutation.isPending ? <Skeleton className="w-full h-full" /> : (scriptMutation.data || "Script will appear here...")}
                </div>
            </Card>
        </div>
    );
};