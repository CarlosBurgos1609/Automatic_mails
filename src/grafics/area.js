"use client";

import React, { useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const chartData = [
	{ date: "2024-04-01", correosgenerales: 320, habeasCorpus: 150 },
	{ date: "2024-04-02", correosgenerales: 250, habeasCorpus: 180 },
	{ date: "2024-04-03", correosgenerales: 210, habeasCorpus: 120 },
	{ date: "2024-04-04", correosgenerales: 360, habeasCorpus: 260 },
	{ date: "2024-04-05", correosgenerales: 390, habeasCorpus: 290 },
	{ date: "2024-04-06", correosgenerales: 370, habeasCorpus: 340 },
	{ date: "2024-04-07", correosgenerales: 245, habeasCorpus: 180 },
	{ date: "2024-04-08", correosgenerales: 420, habeasCorpus: 320 },
	{ date: "2024-04-09", correosgenerales: 220, habeasCorpus: 110 },
	{ date: "2024-04-10", correosgenerales: 300, habeasCorpus: 190 },
	{ date: "2024-04-11", correosgenerales: 400, habeasCorpus: 350 },
	{ date: "2024-04-12", correosgenerales: 320, habeasCorpus: 210 },
	{ date: "2024-04-13", correosgenerales: 410, habeasCorpus: 380 },
	{ date: "2024-04-14", correosgenerales: 220, habeasCorpus: 180 },
	{ date: "2024-04-15", correosgenerales: 120, habeasCorpus: 170 },
	{ date: "2024-04-16", correosgenerales: 138, habeasCorpus: 190 },
	{ date: "2024-04-17", correosgenerales: 446, habeasCorpus: 360 },
	{ date: "2024-04-18", correosgenerales: 364, habeasCorpus: 410 },
	{ date: "2024-04-19", correosgenerales: 243, habeasCorpus: 180 },
	{ date: "2024-04-20", correosgenerales: 100, habeasCorpus: 55 },
	{ date: "2024-04-21", correosgenerales: 137, habeasCorpus: 200 },
	{ date: "2024-04-22", correosgenerales: 224, habeasCorpus: 170 },
	{ date: "2024-04-23", correosgenerales: 138, habeasCorpus: 230 },
	{ date: "2024-04-24", correosgenerales: 387, habeasCorpus: 290 },
	{ date: "2024-04-25", correosgenerales: 215, habeasCorpus: 250 },
	{ date: "2024-04-26", correosgenerales: 75, habeasCorpus: 70 },
	{ date: "2024-04-27", correosgenerales: 383, habeasCorpus: 420 },
	{ date: "2024-04-28", correosgenerales: 122, habeasCorpus: 120 },
	{ date: "2024-04-29", correosgenerales: 315, habeasCorpus: 240 },
	{ date: "2024-04-30", correosgenerales: 454, habeasCorpus: 380 },
	{ date: "2024-05-01", correosgenerales: 165, habeasCorpus: 220 },
	{ date: "2024-05-02", correosgenerales: 293, habeasCorpus: 310 },
	{ date: "2024-05-03", correosgenerales: 247, habeasCorpus: 190 },
	{ date: "2024-05-04", correosgenerales: 385, habeasCorpus: 420 },
	{ date: "2024-05-05", correosgenerales: 481, habeasCorpus: 390 },
	{ date: "2024-05-06", correosgenerales: 498, habeasCorpus: 520 },
	{ date: "2024-05-07", correosgenerales: 388, habeasCorpus: 300 },
	{ date: "2024-05-08", correosgenerales: 249, habeasCorpus: 210 },
	{ date: "2024-05-09", correosgenerales: 227, habeasCorpus: 180 },
	{ date: "2024-05-10", correosgenerales: 293, habeasCorpus: 330 },
	{ date: "2024-05-11", correosgenerales: 335, habeasCorpus: 270 },
	{ date: "2024-05-12", correosgenerales: 297, habeasCorpus: 240 },
	{ date: "2024-05-13", correosgenerales: 197, habeasCorpus: 160 },
	{ date: "2024-05-14", correosgenerales: 448, habeasCorpus: 490 },
	{ date: "2024-05-15", correosgenerales: 473, habeasCorpus: 380 },
	{ date: "2024-05-16", correosgenerales: 438, habeasCorpus: 400 },
	{ date: "2024-05-17", correosgenerales: 499, habeasCorpus: 420 },
	{ date: "2024-05-18", correosgenerales: 315, habeasCorpus: 350 },
	{ date: "2024-05-19", correosgenerales: 235, habeasCorpus: 180 },
	{ date: "2024-05-20", correosgenerales: 377, habeasCorpus: 230 },
	{ date: "2024-05-21", correosgenerales: 382, habeasCorpus: 140 },
	{ date: "2024-05-22", correosgenerales: 381, habeasCorpus: 120 },
	{ date: "2024-05-23", correosgenerales: 299, habeasCorpus: 290 },
	{ date: "2024-05-24", correosgenerales: 294, habeasCorpus: 220 },
	{ date: "2024-05-25", correosgenerales: 291, habeasCorpus: 250 },
	{ date: "2024-05-26", correosgenerales: 213, habeasCorpus: 170 },
	{ date: "2024-05-27", correosgenerales: 420, habeasCorpus: 460 },
	{ date: "2024-05-28", correosgenerales: 233, habeasCorpus: 190 },
	{ date: "2024-05-29", correosgenerales: 190, habeasCorpus: 130 },
	{ date: "2024-05-30", correosgenerales: 340, habeasCorpus: 280 },
	{ date: "2024-05-31", correosgenerales: 238, habeasCorpus: 230 },
	{ date: "2024-06-01", correosgenerales: 208, habeasCorpus: 200 },
	{ date: "2024-06-02", correosgenerales: 470, habeasCorpus: 410 },
	{ date: "2024-06-03", correosgenerales: 103, habeasCorpus: 160 },
	{ date: "2024-06-04", correosgenerales: 439, habeasCorpus: 380 },
	{ date: "2024-06-05", correosgenerales: 188, habeasCorpus: 140 },
	{ date: "2024-06-06", correosgenerales: 294, habeasCorpus: 250 },
	{ date: "2024-06-07", correosgenerales: 323, habeasCorpus: 370 },
	{ date: "2024-06-08", correosgenerales: 385, habeasCorpus: 320 },
	{ date: "2024-06-09", correosgenerales: 488, habeasCorpus: 480 },
	{ date: "2024-06-10", correosgenerales: 205, habeasCorpus: 200 },
	{ date: "2024-06-11", correosgenerales: 192, habeasCorpus: 150 },
	{ date: "2024-06-12", correosgenerales: 492, habeasCorpus: 420 },
	{ date: "2024-06-13", correosgenerales: 181, habeasCorpus: 130 },
	{ date: "2024-06-14", correosgenerales: 426, habeasCorpus: 380 },
	{ date: "2024-06-15", correosgenerales: 357, habeasCorpus: 350 },
	{ date: "2024-06-16", correosgenerales: 371, habeasCorpus: 310 },
	{ date: "2024-06-17", correosgenerales: 475, habeasCorpus: 520 },
	{ date: "2024-06-18", correosgenerales: 187, habeasCorpus: 170 },
	{ date: "2024-06-19", correosgenerales: 341, habeasCorpus: 290 },
	{ date: "2024-06-20", correosgenerales: 408, habeasCorpus: 450 },
	{ date: "2024-06-21", correosgenerales: 269, habeasCorpus: 210 },
	{ date: "2024-06-22", correosgenerales: 317, habeasCorpus: 270 },
	{ date: "2024-06-23", correosgenerales: 480, habeasCorpus: 530 },
	{ date: "2024-06-24", correosgenerales: 132, habeasCorpus: 180 },
	{ date: "2024-06-25", correosgenerales: 141, habeasCorpus: 190 },
	{ date: "2024-06-26", correosgenerales: 434, habeasCorpus: 380 },
	{ date: "2024-06-27", correosgenerales: 448, habeasCorpus: 490 },
	{ date: "2024-06-28", correosgenerales: 249, habeasCorpus: 200 },
	{ date: "2024-06-29", correosgenerales: 163, habeasCorpus: 160 },
	{ date: "2024-06-30", correosgenerales: 446, habeasCorpus: 400 },
];

export default function AreaChartInteractive() {
	const [showLast, setShowLast] = useState(30);

	const filteredData = chartData.slice(-showLast);

	return (
		<div style={{ width: "98%" }}>
			<h3 style={{ textAlign: "center", marginBottom: 16 }}>Gráfica de Área</h3>
			<div style={{ marginBottom: 16, textAlign: "center" }}>
				<button onClick={() => setShowLast(7)} style={{ marginRight: 8 }}>Últimos 7 días</button>
				<button onClick={() => setShowLast(30)} style={{ marginRight: 8 }}>Últimos 30 días</button>
				<button onClick={() => setShowLast(90)}>Últimos 90 días</button>
			</div>
			<div style={{ width: "100%", height: "350px" }}>
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
						<XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString("es-CO", { month: "short", day: "numeric" })} />
						<YAxis />
						<Tooltip />
						<Legend />
						<Area type="monotone" dataKey="correosgenerales" stroke="#8884d8" fill="url(#colorDesktop)" name="Todos los correos" />
						<Area type="monotone" dataKey="habeasCorpus" stroke="#82ca9d" fill="url(#colorMobile)" name="Habeas Corpus" />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
