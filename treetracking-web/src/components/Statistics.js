import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../services/api';
import './Statistics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Statistics() {
    const [stats, setStats] = useState({
        totalLogs: 0,
        byStatus: {},
        bySpecies: {},
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const logIDs = ['LOG001', 'LOG002', 'LOG003', 'LOG004', 'LOG005'];
            const promises = logIDs.map(id => 
                api.getLogHistory(id).catch(() => null)
            );
            
            const results = await Promise.all(promises);
            const logs = results.filter(r => r?.data?.success).map(r => r.data.data);
            
            const byStatus = {};
            const bySpecies = {};
            let totalValue = 0;

            logs.forEach(log => {
                byStatus[log.status] = (byStatus[log.status] || 0) + 1;
                bySpecies[log.species] = (bySpecies[log.species] || 0) + 1;
                if (log.purchase) {
                    totalValue += log.purchase.price;
                }
            });

            setStats({
                totalLogs: logs.length,
                byStatus,
                bySpecies,
                totalValue
            });
            setLoading(false);
        } catch (error) {
            console.error('Error loading statistics:', error);
            setLoading(false);
        }
    };

    const statusData = {
        labels: Object.keys(stats.byStatus),
        datasets: [{
            label: 'Logs par statut',
            data: Object.values(stats.byStatus),
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ]
        }]
    };

    const speciesData = {
        labels: Object.keys(stats.bySpecies),
        datasets: [{
            label: 'Nombre de grumes',
            data: Object.values(stats.bySpecies),
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1
        }]
    };

    if (loading) {
        return <div className="statistics-loading">Chargement des statistiques...</div>;
    }

    return (
        <div className="statistics-container">
            <h2>Statistiques du réseau</h2>
            
            <div className="stats-cards">
                <div className="stat-card">
                    <h3>{stats.totalLogs}</h3>
                    <p>Grumes totales</p>
                </div>
                <div className="stat-card">
                    <h3>${stats.totalValue.toLocaleString()}</h3>
                    <p>Valeur totale</p>
                </div>
                <div className="stat-card">
                    <h3>{Object.keys(stats.bySpecies).length}</h3>
                    <p>Espèces différentes</p>
                </div>
                <div className="stat-card">
                    <h3>{Object.keys(stats.byStatus).length}</h3>
                    <p>Statuts actifs</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Distribution par statut</h3>
                    <Pie data={statusData} />
                </div>
                <div className="chart-container">
                    <h3>Distribution par espèce</h3>
                    <Bar data={speciesData} options={{ responsive: true }} />
                </div>
            </div>
        </div>
    );
}

export default Statistics;
