import React from 'react';
import './Timeline.css';

function Timeline({ history }) {
    if (!history || history.length === 0) {
        return <div className="timeline-empty">Aucun événement</div>;
    }

    const getIcon = (action) => {
        const icons = {
            'INITIALIZED': '🌱',
            'ORIGIN_VALIDATED': '✅',
            'PERMIT_ISSUED': '📜',
            'HARVEST_DECLARED': '🪓',
            'PHYSICAL_DATA_ADDED': '📏',
            'MULTIMEDIA_UPLOADED': '📸',
            'TRANSPORT_UPDATED': '🚚',
            'PURCHASE_VALIDATED': '💰',
            'OWNERSHIP_TRANSFERRED': '🔄'
        };
        return icons[action] || '📌';
    };

    return (
        <div className="timeline-container">
            <h3>Timeline des événements</h3>
            <div className="timeline">
                {history.map((entry, idx) => (
                    <div key={idx} className="timeline-item">
                        <div className="timeline-icon">{getIcon(entry.action)}</div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <strong>{entry.action}</strong>
                                <span className="timeline-date">
                                    {new Date(entry.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p className="timeline-description">{entry.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Timeline;
