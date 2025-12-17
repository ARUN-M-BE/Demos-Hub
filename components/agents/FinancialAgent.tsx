import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../Shared';
import { Activity, AlertTriangle, Play, Pause } from 'lucide-react';
import * as d3 from 'd3';

export const FinancialAgent = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [anomalyScore, setAnomalyScore] = useState(0);
    const [nodeCount, setNodeCount] = useState(15);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(false);
    
    // Validation State
    const [apiInput, setApiInput] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = 450;
        
        // Initial Data
        let nodes: any[] = Array.from({ length: 15 }, (_, i) => ({ 
            id: i, 
            group: Math.floor(Math.random() * 3), 
            suspicious: Math.random() > 0.8, 
            x: width/2 + (Math.random() - 0.5) * 50, 
            y: height/2 + (Math.random() - 0.5) * 50 
        }));
        let links: any[] = Array.from({ length: 20 }, () => ({ 
            source: Math.floor(Math.random() * 15), 
            target: Math.floor(Math.random() * 15) 
        })).filter(l => l.source !== l.target);

        const updateScore = () => {
           setAnomalyScore(Math.round((nodes.filter(n => n.suspicious).length / nodes.length) * 100));
        };
        updateScore();

        // Simulation Setup
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
            .force("charge", d3.forceManyBody().strength(-150))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(12).strength(0.7));

        // SVG Groups
        // Clear previous if any (though useEffect runs once, good practice)
        svg.selectAll("*").remove();
        
        const linkGroup = svg.append("g").attr("class", "links");
        const nodeGroup = svg.append("g").attr("class", "nodes");

        // Drag Behavior
        const drag = d3.drag<any, any>()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x; d.fy = d.y;
            })
            .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null; d.fy = null;
            });

        const restart = () => {
            // Apply Data Join for Links
            const link = linkGroup.selectAll("line")
                .data(links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);
            
            link.exit()
                .transition().duration(500)
                .attr("opacity", 0)
                .remove();

            const linkEnter = link.enter().append("line")
                .attr("stroke", "#94a3b8")
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1.5);
            
            linkEnter.transition().duration(750).attr("stroke-opacity", 0.6);

            const newLink = linkEnter.merge(link as any);

            // Apply Data Join for Nodes
            const node = nodeGroup.selectAll("circle")
                .data(nodes, (d: any) => d.id);
            
            node.exit()
                .transition().duration(500)
                .attr("r", 0)
                .remove();
            
            const nodeEnter = node.enter().append("circle")
                .attr("r", 0) 
                .attr("fill", (d: any) => d.suspicious ? "#ef4444" : "#3b82f6")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .call(drag);
            
            nodeEnter.transition().duration(750)
                .attr("r", 8); // Fixed from attrTween to attr for type safety and simplicity

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
            
            simulation.nodes(nodes);
            (simulation.force("link") as d3.ForceLink<any, any>).links(links);
            simulation.alpha(0.5).restart();
        };

        restart();

        // Real-time Data Simulation
        const interval = setInterval(() => {
            if (isPausedRef.current) return;
            
            // Limit node count to prevent performance issues
            if (nodes.length > 35) {
                 // Remove a random node (prefer older ones logic omitted for simplicity, just random)
                 const indexToRemove = Math.floor(Math.random() * 10); 
                 const idToRemove = nodes[indexToRemove].id;
                 nodes.splice(indexToRemove, 1);
                 // Remove links attached to it
                 for (let i = links.length - 1; i >= 0; i--) {
                     if (links[i].source.id === idToRemove || links[i].target.id === idToRemove || links[i].source === idToRemove || links[i].target === idToRemove) {
                         links.splice(i, 1);
                     }
                 }
            }
            
            const newId = (nodes.reduce((max, n) => Math.max(max, n.id), 0) || 0) + 1;
            const isSuspicious = Math.random() > 0.85;
            
            // Pick a target to connect to
            const targetIndex = Math.floor(Math.random() * nodes.length);
            const targetNode = nodes[targetIndex];

            // Spawn near target for smoother entry
            if (targetNode) {
                const newNode = { 
                    id: newId, 
                    group: Math.floor(Math.random() * 3), 
                    suspicious: isSuspicious, 
                    x: targetNode.x + (Math.random() - 0.5) * 30, 
                    y: targetNode.y + (Math.random() - 0.5) * 30 
                };
                nodes.push(newNode);

                links.push({ source: newId, target: targetNode.id });

                // Occasionally add a second link for complexity
                if (Math.random() > 0.7) {
                    const secondTarget = Math.floor(Math.random() * nodes.length);
                    if (secondTarget !== targetIndex) {
                        links.push({ source: newId, target: nodes[secondTarget].id });
                    }
                }
            }

            setNodeCount(nodes.length);
            updateScore();
            restart();
        }, 2000);

        return () => {
            clearInterval(interval);
            simulation.stop();
            svg.selectAll("*").remove();
        };
    }, []); // Run once on mount

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
                    
                    {/* Legend */}
                    <div className="absolute top-4 left-4 flex gap-4 text-xs z-10 bg-white/80 dark:bg-black/80 p-2 rounded backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Safe</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Suspicious</div>
                        <div className="flex items-center gap-1 border-l pl-2 border-slate-400">Nodes: {nodeCount}</div>
                    </div>
                    
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsPaused(!isPaused)}
                            className="bg-white/80 dark:bg-black/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 h-8 text-xs flex items-center gap-1.5"
                        >
                            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                            {isPaused ? "Resume" : "Pause"}
                        </Button>
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 ${isPaused ? 'text-slate-500' : 'text-green-600 dark:text-green-400'}`}>
                             <Activity className={`w-3 h-3 ${!isPaused && 'animate-pulse'}`} />
                             {isPaused ? 'Paused' : 'Live'}
                        </div>
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