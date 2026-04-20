const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store for the prototype
let database = {
    zones: [],
    metrics: [],
    projects: []
};

function generateMockData() {
    database.zones = [
        { id: "Z-001", name: "Bandra Kurla Complex", city: "Mumbai", type: "Commercial", coordinates: [[[72.855, 19.055], [72.875, 19.055], [72.875, 19.070], [72.855, 19.070], [72.855, 19.055]]] },
        { id: "Z-002", name: "Powai Tech Hub", city: "Mumbai", type: "Mixed", coordinates: [[[72.890, 19.100], [72.920, 19.100], [72.920, 19.125], [72.890, 19.125], [72.890, 19.100]]] },
        { id: "Z-003", name: "Andheri West", city: "Mumbai", type: "Residential", coordinates: [[[72.810, 19.120], [72.840, 19.120], [72.840, 19.150], [72.810, 19.150], [72.810, 19.120]]] },
        { id: "Z-004", name: "South Mumbai", city: "Mumbai", type: "Mixed", coordinates: [[[72.810, 18.910], [72.840, 18.910], [72.840, 18.940], [72.810, 18.940], [72.810, 18.910]]] },
        { id: "Z-005", name: "Navi Mumbai", city: "Mumbai", type: "Industrial", coordinates: [[[72.990, 19.020], [73.040, 19.020], [73.040, 19.060], [72.990, 19.060], [72.990, 19.020]]] }
    ];

    database.metrics = [];
    database.projects = [];

    database.zones.forEach(zone => {
        let basePrice = 20000;
        if (zone.id === "Z-001") basePrice = 45000;
        if (zone.id === "Z-004") basePrice = 60000;
        if (zone.id === "Z-005") basePrice = 12000;
        
        basePrice = basePrice + (Math.random() * 5000 - 2500);

        database.metrics.push({
            zone_id: zone.id,
            current_price_per_sqft: basePrice,
            historical_price_1yr_ago: basePrice * (0.85 + Math.random() * 0.13),
            historical_price_3yr_ago: basePrice * (0.60 + Math.random() * 0.20),
            current_rent_per_sqft: basePrice * (0.002 + Math.random() * 0.005),
            listing_density: Math.floor(100 + Math.random() * 500),
            absorption_rate: 30 + Math.random() * 60
        });

        const numProjects = Math.floor(Math.random() * 4) + 1; // 1 to 4 projects
        const types = ['Metro Line', 'Coastal Road', 'Tech Park', 'Hospital', 'Commercial Hub'];
        const statuses = ['Proposed', 'Under Construction', 'Completed'];
        for (let i = 0; i < numProjects; i++) {
            database.projects.push({
                zone_id: zone.id,
                name: `Mumbai ${types[Math.floor(Math.random() * types.length)]} Phase ${i+1}`,
                type: types[Math.floor(Math.random() * types.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                budget_millions: 50 + Math.random() * 2000,
                expected_completion_year: 2024 + Math.floor(Math.random() * 5),
                impact_weight: 4 + Math.random() * 6
            });
        }
    });
}

function calculateScores(metrics, projects) {
    if (!metrics) return null;

    // Infrastructure Score
    let infraScore = 0;
    projects.forEach(p => {
        let multiplier = p.status === 'Completed' ? 0.5 : (p.status === 'Under Construction' ? 1.0 : 0.8);
        infraScore += (p.impact_weight * multiplier) * 2;
    });
    infraScore = Math.min(100, infraScore);

    // Demand Score
    let absScore = Math.min(100, metrics.absorption_rate);
    let densityPenalty = Math.max(0, (metrics.listing_density - 200) * 0.1);
    let demandScore = Math.max(0, Math.min(100, absScore - densityPenalty));

    // Trend Score
    let trendScore = 50;
    if (metrics.historical_price_1yr_ago && metrics.historical_price_3yr_ago) {
        let cagr3yr = Math.pow(metrics.current_price_per_sqft / metrics.historical_price_3yr_ago, 1/3) - 1;
        let yoy1yr = (metrics.current_price_per_sqft / metrics.historical_price_1yr_ago) - 1;
        trendScore = Math.max(0, Math.min(100, 50 + (cagr3yr * 200) + (yoy1yr * 100)));
    }

    let finalScore = (infraScore * 0.4) + (demandScore * 0.3) + (trendScore * 0.3);

    return {
        infrastructure_score: parseFloat(infraScore.toFixed(2)),
        market_demand_score: parseFloat(demandScore.toFixed(2)),
        price_trend_score: parseFloat(trendScore.toFixed(2)),
        growth_velocity_score: parseFloat(finalScore.toFixed(2))
    };
}

// Generate data on startup
generateMockData();

app.get('/', (req, res) => res.json({ message: "Welcome to Predictive Urban Growth API" }));

app.post('/api/ingest/mock', (req, res) => {
    generateMockData();
    res.json({ status: "success", message: "Mock data regenerated" });
});

app.get('/api/zones', (req, res) => {
    const result = database.zones.map(z => {
        const metrics = database.metrics.find(m => m.zone_id === z.id);
        const projects = database.projects.filter(p => p.zone_id === z.id);
        return {
            ...z,
            scores: calculateScores(metrics, projects)
        };
    });
    res.json(result);
});

app.get('/api/zones/:id', (req, res) => {
    const zone = database.zones.find(z => z.id === req.params.id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });

    const metrics = database.metrics.find(m => m.zone_id === zone.id);
    const projects = database.projects.filter(p => p.zone_id === zone.id);

    res.json({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        raw_metrics: metrics,
        scores: calculateScores(metrics, projects),
        infrastructure_projects: projects
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
