import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    const organizations = [
        {
            name: 'Forestry Authority',
            msp: 'ForestryAuthorityMSP',
            description: 'Valider l\'origine et émettre des permis',
            icon: '🌳',
            color: '#2ecc71'
        },
        {
            name: 'Logging Company',
            msp: 'LoggingCompaniesMSP',
            description: 'Déclarer l\'exploitation et gérer le transport',
            icon: '🪓',
            color: '#e67e22'
        },
        {
            name: 'Buying Company',
            msp: 'BuyingCompaniesMSP',
            description: 'Vérifier la conformité et acheter',
            icon: '🏢',
            color: '#3498db'
        },
        {
            name: 'Admin',
            msp: 'TreeTrackingAdminMSP',
            description: 'Consulter et auditer le réseau',
            icon: '⚙️',
            color: '#95a5a6'
        }
    ];

    return (
        <div className="home-container">
            <header className="hero">
                <h1>🌲 TreeTracking</h1>
                <p>Plateforme de traçabilité forestière basée sur Blockchain</p>
            </header>

            <div className="organizations-grid">
                {organizations.map(org => (
                    <div 
                        key={org.msp}
                        className="org-card"
                        style={{ borderColor: org.color }}
                        onClick={() => navigate(`/dashboard/${org.msp}`)}
                    >
                        <div className="org-icon" style={{ backgroundColor: org.color }}>
                            {org.icon}
                        </div>
                        <h3>{org.name}</h3>
                        <p>{org.description}</p>
                    </div>
                ))}
            </div>

            <div className="info-section">
                <h2>À propos de TreeTracking</h2>
                <p>
                    TreeTracking utilise la technologie blockchain Hyperledger Fabric 
                    et IPFS pour assurer une traçabilité complète et transparente 
                    du bois, de la forêt au produit fini.
                </p>
                <div className="features">
                    <div className="feature">
                        <span>🔒</span>
                        <h4>Sécurisé</h4>
                        <p>Données immuables sur blockchain</p>
                    </div>
                    <div className="feature">
                        <span>🔍</span>
                        <h4>Transparent</h4>
                        <p>Historique complet consultable</p>
                    </div>
                    <div className="feature">
                        <span>✅</span>
                        <h4>Certifié</h4>
                        <p>Conformité FSC/PEFC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
