"use client";

import React, { useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import useChartsData from "../hooks/useChartsData";
import { processAreaChartData } from "../utils/chartDataProcessors";

export default function AreaChartInteractive() {
	const [showLast, setShowLast] = useState(30);
	const { correos, habeasCorpus, loading, error } = useChartsData();

	if (loading) {
		return (
			<div className="area-chart-interactive">
				<h1>Gráfica de Área</h1>
				<div style={{ textAlign: 'center', padding: '50px', color: '#003f75' }}>
					Cargando datos...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="area-chart-interactive">
				<h1>Gráfica de Área</h1>
				<div style={{ textAlign: 'center', padding: '50px', color: '#e53935' }}>
					Error: {error}
				</div>
			</div>
		);
	}

	const chartData = processAreaChartData(correos, habeasCorpus);
	const filteredData = chartData.slice(-showLast);

	return (
		<div className="area-chart-interactive">
			<h1>Correos Recibidos vs Habeas Corpus</h1>
			<div className="area-chart-buttons">
				<button onClick={() => setShowLast(3)}>Últimos 3 días</button>
				<button onClick={() => setShowLast(7)}>Últimos 7 días</button>
				<button onClick={() => setShowLast(30)}>Últimos 30 días</button>
				<button onClick={() => setShowLast(90)}>Últimos 90 días</button>
			</div>
			<div className="area-chart-graph">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#003f75" stopOpacity={0.8}/>
								<stop offset="95%" stopColor="#003f75" stopOpacity={0.1}/>
							</linearGradient>
							<linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#bafaba" stopOpacity={0.8}/>
								<stop offset="95%" stopColor="#bafaba" stopOpacity={0.1}/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis 
							dataKey="date" 
							tickFormatter={v => new Date(v).toLocaleDateString("es-CO", { month: "short", day: "numeric" })} 
						/>
						<YAxis />
						<Tooltip 
							labelFormatter={v => new Date(v).toLocaleDateString("es-CO", { 
								weekday: 'long', 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}
						/>
						<Legend />
						<Area 
							type="monotone" 
							dataKey="correosgenerales" 
							stroke="#003f75" 
							fill="url(#colorDesktop)" 
							name="Todos los correos" 
						/>
						<Area 
							type="monotone" 
							dataKey="habeasCorpus" 
							stroke="#bafaba" 
							fill="url(#colorMobile)" 
							name="Habeas Corpus" 
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<div style={{ textAlign: 'center', marginTop: 10, color: '#666', fontSize: '14px' }}>
				Mostrando {filteredData.length} días • Total correos: {filteredData.reduce((sum, d) => sum + d.correosgenerales, 0)} • Total habeas corpus: {filteredData.reduce((sum, d) => sum + d.habeasCorpus, 0)}
			</div>
		</div>
	);
}
