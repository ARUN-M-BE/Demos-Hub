import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GeminiService } from '../services/geminiService';
import { Card, Button, Skeleton, LoadingOverlay } from './Shared';
import { Upload, Camera, AlertTriangle, CheckCircle, Play, FileText, Search, ShieldAlert, Truck, BarChart2, Activity, Zap, Terminal, Map as MapIcon, Wind, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import * as d3 from 'd3';

// --- 1. Flower Market Vision Agent ---
export const FlowerMarketAgent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{ species: string; price: string; confidence: string } | null>(null);
  
  const analyzeMutation = useMutation({
    mutationFn: async (img: string) => {
      const prompt = "Identify this flower species, estimate a current market price per stem (in USD), and give a confidence score. Return JSON format: { \"species\": \"...\", \"price\": \"...\", \"confidence\": \"...\" }";
      const text = await GeminiService.analyzeImage(prompt, img);
      // Clean potential markdown blocks
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
        setResult(null); // Reset
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

// --- 2. Disaster Prediction Agent ---
export const DisasterAgent = () => {
  const [summary, setSummary] = useState('');
  
  // Dummy Sensor Data
  const sensors = [
    { id: 1, type: 'Seismic', name: 'Coastal Sensor A4', lat: 35.50, lng: 139.60, val: 'Mag 4.2', status: 'critical', color: '#ef4444' }, // Red
    { id: 2, type: 'Flood', name: 'River Gauge R2', lat: 35.65, lng: 139.80, val: '+2cm/h', status: 'warning', color: '#3b82f6' }, // Blue
    { id: 3, type: 'Wind', name: 'Metro Weather Stn', lat: 35.70, lng: 139.70, val: '82 km/h', status: 'warning', color: '#f59e0b' }, // Orange
    { id: 4, type: 'Normal', name: 'Inland Ref 1', lat: 35.72, lng: 139.68, val: 'Stable', status: 'normal', color: '#22c55e' }, // Green
    { id: 5, type: 'Seismic', name: 'Offshore Buoy', lat: 35.45, lng: 139.90, val: 'Mag 3.1', status: 'warning', color: '#f59e0b' },
  ];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const context = "Live sensors detect seismic activity magnitude 4.2 near coastal region. Wind speeds increasing to 80km/h in sector 4. Flood gauges rising 2cm/hour.";
      return GeminiService.generateText('gemini-2.5-flash', `Write a short, urgent disaster impact summary based on this data: ${context}`);
    },
    onSuccess: (data) => setSummary(data)
  });

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card className="p-0 overflow-hidden h-[400px] border border-slate-200 dark:border-slate-700 shadow-lg relative z-0">
        <MapContainer 
          center={[35.65, 139.75]} 
          zoom={10} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {sensors.map((sensor) => (
            <CircleMarker 
              key={sensor.id}
              center={[sensor.lat, sensor.lng]}
              pathOptions={{ 
                color: sensor.color, 
                fillColor: sensor.color, 
                fillOpacity: 0.7, 
                weight: 2 
              }}
              radius={sensor.status === 'critical' ? 12 : 8}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="block text-slate-800">{sensor.name}</strong>
                  <span className="text-xs font-semibold uppercase text-slate-500">{sensor.type}</span>
                  <div className="mt-1 font-mono font-bold" style={{ color: sensor.color }}>{sensor.val}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        {/* Map Overlay Legend */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg shadow-md backdrop-blur-sm z-[400] text-xs space-y-2">
            <h4 className="font-bold border-b border-slate-200 pb-1 mb-1">Sensor Status</h4>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> Critical</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Warning</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Monitoring</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Normal</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg flex gap-2"><Activity className="w-5 h-5 text-red-500" /> Live Alert Feed</h3>
          {[
            { level: 'High', msg: 'Seismic spike detected at Coastal Sensor A4', time: 'Just now', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
            { level: 'Med', msg: 'Wind speed > 80km/h at Metro Station', time: '5m ago', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
            { level: 'Low', msg: 'Flood gauge R2 deviation +2%', time: '12m ago', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
          ].map((alert, i) => (
            <div key={i} className={`p-4 rounded-lg flex justify-between items-center ${alert.color}`}>
              <div>
                <span className="font-bold text-xs uppercase px-2 py-1 bg-white/50 rounded mr-2">{alert.level}</span>
                <span>{alert.msg}</span>
              </div>
              <span className="text-xs opacity-70">{alert.time}</span>
            </div>
          ))}
        </div>

        <Card className="p-6 flex flex-col h-full">
           <h3 className="font-bold mb-4">AI Impact Analysis</h3>
           <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm leading-relaxed overflow-y-auto min-h-[150px]">
             {generateMutation.isPending ? <Skeleton className="h-full w-full" /> : (summary || "Click generate to analyze current sensor topology and predict impact.")}
           </div>
           <Button className="mt-4 w-full" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
             Generate Summary
           </Button>
        </Card>
      </div>
    </div>
  );
};

// --- 3. Asphalt Quality Inspector ---
export const AsphaltAgent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  
  const handleAnalyze = () => {
    setAnalyzed(false);
    setTimeout(() => setAnalyzed(true), 2000); // Simulate processing
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
                        {/* Simulated Bounding Boxes */}
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

// --- 4. Explainable Medical Imaging ---
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

// --- 5. Financial Crime Graph ---
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

// --- 6. Logistics Optimizer ---
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

// --- 7. Energy Theft Detector ---
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

// --- 8. Inspirational Education Agent ---
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

// --- 9. Cybersecurity Defense Agent ---
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