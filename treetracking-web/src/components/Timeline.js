import React from 'react';
import './Timeline.css';

function Timeline({ history }) {
    if (!history || history.length === 0) {
        return <div className="timeline-empty">Aucun evenement</div>;
    }

    const getIcon = (action) => {
        const icons = {
            'INITIALIZED': 'INIT',
            'ORIGIN_VALIDATED': 'VALID',
            'PERMIT_ISSUED': 'PERMIT',
            'HARVEST_DECLARED': 'HARVEST',
            'PHYSICAL_DATA_ADDED': 'DATA',
            'MULTIMEDIA_UPLOADED': 'MEDIA',
            'TRANSPORT_UPDATED': 'TRANSPORT',
            'PURCHASE_VALIDATED': 'PURCHASE',
            'OWNERSHIP_TRANSFERRED': 'TRANSFER'
        };
        return icons[action] || 'EVENT';
    };

    return (
        <div className="timeline-container">
            <h3>Timeline des evenements</h3>
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
