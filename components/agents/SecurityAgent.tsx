import React from 'react';
import { Card, Button } from '../Shared';
import { Terminal, ShieldAlert } from 'lucide-react';

export const SecurityAgent = () => {
    const logs = [
        "[2023-10-27 14:22:01] SSH: Failed password for root from 192.168.1.105 port 22 ssh2",
        "[2023-10-27 14:22:03] SSH: Failed password for root from 192.168.1.105 port 22 ssh2",
        "[2023-10-27 14:22:05] SSH: Failed password for root from 192.168.1.105 port 22 ssh2",
        "[2023-10-27 14:22:10] ALARM: Brute force detection threshold exceeded [IP: 192.168.1.105]",
        "[2023-10-27 14:23:45] HTTP: GET /admin/config.php 403 Forbidden"
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="bg-slate-900 text-green-400 font-mono p-4 h-[400px] overflow-y-auto shadow-inner border border-slate-700">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                        <Terminal className="w-4 h-4" /> Server Live Logs
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 opacity-90 hover:opacity-100 hover:bg-slate-800 p-1 rounded cursor-pointer">{log}</div>
                    ))}
                    <div className="animate-pulse">_</div>
                </Card>
            </div>

            <Card className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                    <ShieldAlert className="w-6 h-6" /> Threat Detected
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm">
                    <h4 className="font-bold mb-2">AI Analysis</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        <li>High-frequency auth failures detected.</li>
                        <li>Pattern matches "Dictionary Attack".</li>
                        <li>Source IP originating from known botnet subnet.</li>
                    </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm">
                     <h4 className="font-bold mb-2">Remediation Steps</h4>
                     <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        <li>Isolate impacted port 22.</li>
                        <li>Blacklist IP 192.168.1.105.</li>
                        <li>Rotate root credentials.</li>
                     </ol>
                </div>

                <Button variant="danger" className="mt-auto w-full py-3 font-bold uppercase tracking-wider shadow-lg shadow-red-500/30">
                    Block IP Address
                </Button>
            </Card>
        </div>
    );
};