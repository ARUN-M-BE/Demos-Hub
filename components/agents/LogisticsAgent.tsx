import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeminiService } from '../../services/geminiService';
import { Card, Button, Skeleton } from '../Shared';

export const LogisticsAgent = () => {
    const planMutation = useMutation({
        mutationFn: async () => GeminiService.generateComplexPlan("Optimize route from Shanghai to Hamburg for 2000kg medical supplies. Prioritize speed. List key steps.")
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Shipment Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Origin (e.g., Shanghai)" className="p-2 border rounded bg-transparent dark:border-slate-700" />
                    <input type="text" placeholder="Destination (e.g., Hamburg)" className="p-2 border rounded bg-transparent dark:border-slate-700" />
                    <input type="number" placeholder="Weight (kg)" className="p-2 border rounded bg-transparent dark:border-slate-700" />
                    <select className="p-2 border rounded bg-transparent dark:border-slate-700">
                        <option>Speed Priority</option>
                        <option>Cost Priority</option>
                        <option>Eco Priority</option>
                    </select>
                </div>
                <Button className="w-full mt-4" onClick={() => planMutation.mutate()} disabled={planMutation.isPending}>
                    {planMutation.isPending ? 'Calculating Optimal Route...' : 'Optimize Logistics'}
                </Button>
                
                {planMutation.data && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Comparison</h4>
                        <div className="flex justify-between text-sm">
                            <span>Time Saved: <b>42 Hours</b></span>
                            <span>Fuel Saved: <b>12%</b></span>
                        </div>
                    </div>
                )}
            </Card>

            <Card className="p-6 h-full min-h-[400px]">
                <h3 className="font-bold text-lg mb-4">Optimized Timeline</h3>
                {planMutation.isPending ? <Skeleton className="w-full h-full" /> : (
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pl-6 py-2">
                        {(planMutation.data ? [planMutation.data] : ["Enter details to generate route."]).map((step, i) => (
                             <div key={i} className="relative text-sm">
                                <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800"></span>
                                <p className="whitespace-pre-wrap">{step}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};