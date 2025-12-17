import React from 'react';
import { Card, Button } from '../Shared';
import { Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const EnergyAgent = () => {
    const data = [
        { name: '00:00', normal: 400, actual: 420 },
        { name: '04:00', normal: 300, actual: 350 },
        { name: '08:00', normal: 500, actual: 550 },
        { name: '12:00', normal: 700, actual: 1200 }, // Spike
        { name: '16:00', normal: 600, actual: 650 },
        { name: '20:00', normal: 500, actual: 520 },
        { name: '23:59', normal: 450, actual: 460 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <select className="p-2 rounded border dark:bg-slate-800 dark:border-slate-700">
                     <option>Sector A-14 (Industrial)</option>
                     <option>Sector B-09 (Residential)</option>
                 </select>
                 <Button variant="danger" className="flex items-center gap-2"><Zap className="w-4 h-4"/> Dispatch Technician</Button>
            </div>
            
            <Card className="p-6 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="normal" stroke="#3b82f6" strokeWidth={2} name="Normal Usage (kWh)" />
                        <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual Usage (kWh)" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 text-center">
                    <span className="text-slate-500 text-sm">Deviation</span>
                    <p className="text-2xl font-bold text-red-500">+42%</p>
                </Card>
                 <Card className="p-4 text-center">
                    <span className="text-slate-500 text-sm">Est. Loss</span>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">$12,450</p>
                </Card>
                 <Card className="p-4 text-center">
                    <span className="text-slate-500 text-sm">Confidence</span>
                    <p className="text-2xl font-bold text-green-500">98.2%</p>
                </Card>
            </div>
        </div>
    );
};