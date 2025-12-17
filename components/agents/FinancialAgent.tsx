import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../Shared';
import { Activity, AlertTriangle } from 'lucide-react';
import * as d3 from 'd3';

export const FinancialAgent = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [anomalyScore, setAnomalyScore] = useState(0);
    const [nodeCount, setNodeCount] = useState(15);
    
    // Validation State
    const [apiInput, setApiInput] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = 450;
        
        // Initial Data
        let nodes = Array.from({ length: 15 }, (_, i) => ({ id: i, group: Math.floor(Math.random() * 3), suspicious: Math.random() > 0.8, x: width/2 + (Math.random() - 0.5) * 50, y: height/2 + (Math.random() - 0.5) * 50 }));
        let links = Array.from({ length: 20 }, () => ({ source: Math.floor(Math.random() * 15), target: Math.floor(Math.random() * 15) }));

        const updateScore = () => {
           setAnomalyScore(Math.round((nodes.filter(n => n.suspicious).length / nodes.length) * 100));
        };
        updateScore();

        // Simulation
        const simulation = d3.forceSimulation(nodes as any)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // SVG Groups
        const linkGroup = svg.append("g").attr("stroke", "#94a3b8").attr("stroke-opacity", 0.6);
        const nodeGroup = svg.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5);

        const restart = () => {
            // Apply Data Join for Links
            const link = linkGroup.selectAll("line").data(links);
            link.exit().remove();
            const linkEnter = link.enter().append("line").attr("stroke-width", 1.5);
            const newLink = linkEnter.merge(link as any);

            // Apply Data Join for Nodes
            const node = nodeGroup.selectAll("circle").data(nodes, (d: any) => d.id);
            node.exit().remove();
            
            const nodeEnter = node.enter().append("circle")
                .attr("r", 0) // Start with radius 0 for animation
                .attr("fill", (d: any) => d.suspicious ? "#ef4444" : "#3b82f6")
                .call(d3.drag<any, any>()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x; d.fy = d.y;
                    })
                    .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null; d.fy = null;
                    }));
            
            // Animate entry
            nodeEnter.transition().duration(500).attr("r", 8);

            const newNode = nodeEnter.merge(node as any);

            // Tick function
            simulation.on("tick", () => {
                newLink
                    .attr("x1", (d: any) => d.source.x)
                    .attr("y1", (d: any) => d.source.y)
                    .attr("x2", (d: any) => d.target.x)
                    .attr("y2", (d: any) => d.target.y);

                newNode
                    .attr("cx", (d: any) => d.x)
                    .attr("cy", (d: any) => d.y);
            });
            
            simulation.nodes(nodes as any);
            simulation.force("link", d3.forceLink(links).id((d: any) => d.id).distance(60));
            simulation.alpha(1).restart();
        };

        restart();

        // Real-time Data Simulation
        const interval = setInterval(() => {
            if (nodes.length > 50) return; // Cap at 50 to prevent overcrowding
            
            const newId = nodes.length;
            const isSuspicious = Math.random() > 0.85;
            // Spawn near center
            const newNode = { id: newId, group: Math.floor(Math.random() * 3), suspicious: isSuspicious, x: width/2, y: height/2 };
            nodes.push(newNode);

            // Link to random existing node
            const target = Math.floor(Math.random() * (nodes.length - 1));
            links.push({ source: newId, target: target } as any);

            setNodeCount(nodes.length);
            updateScore();
            restart();
        }, 2000);

        return () => {
            clearInterval(interval);
            simulation.stop();
            svg.selectAll("*").remove();
        };
    }, []);

    const handleAnalyze = () => {
        if (!apiInput.trim()) {
            setInputError("Input cannot be empty");
            return;
        }

        const lines = apiInput.split('\n').filter(line => line.trim());
        const invalidLines = lines.filter(line => {
            // Check if line is CSV (has comma) or valid ID (alphanumeric + dashes)
            const isCSV = line.includes(',');
            const isID = /^[a-zA-Z0-9-_]+$/.test(line.trim());
            return !isCSV && !isID;
        });

        if (invalidLines.length > 0) {
            setInputError(`Invalid format in ${invalidLines.length} line(s). Use CSV or Alphanumeric IDs.`);
            return;
        }

        setInputError(null);
        setIsAnalyzing(true);
        // Simulate analysis delay
        setTimeout(() => setIsAnalyzing(false), 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2">
                <Card className="h-[450px] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
                    <svg ref={svgRef} className="w-full h-full" />
                    <div className="absolute top-4 left-4 flex gap-4 text-xs z-10 bg-white/50 dark:bg-black/50 p-2 rounded backdrop-blur-sm">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Safe</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Suspicious</div>
                        <div className="flex items-center gap-1 border-l pl-2 border-slate-400">Nodes: {nodeCount}</div>
                    </div>
                    <div className="absolute top-4 right-4 text-xs text-slate-500 animate-pulse flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Live Stream Active
                    </div>
                </Card>
            </div>
            <div className="space-y-6">
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-2">Network Risk</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-800 dark:text-white">{anomalyScore}</span>
                        <span className="text-sm text-slate-500 mb-1">/ 100 Anomaly Score</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${anomalyScore > 50 ? 'bg-red-500' : 'bg-green-500'} transition-all duration-500`} style={{ width: `${anomalyScore}%` }}></div>
                    </div>
                </Card>
                <Card className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">API Backend Input</label>
                        <textarea 
                            className={`w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border ${inputError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            placeholder="Paste Transaction CSV or IDs (e.g., TXN-12345)..." 
                            value={apiInput}
                            onChange={(e) => {
                                setApiInput(e.target.value);
                                if(inputError) setInputError(null);
                            }}
                        />
                        {inputError && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                {inputError}
                            </div>
                        )}
                        {isAnalyzing && !inputError && (
                             <div className="flex items-center gap-1 mt-1 text-blue-500 text-xs">
                                <Activity className="w-3 h-3 animate-spin" />
                                Processing input stream...
                            </div>
                        )}
                    </div>
                    <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
                    </Button>
                    <Button variant="danger" className="w-full">Freeze Suspicious Accounts</Button>
                </Card>
            </div>
        </div>
    );
};