import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    const organizations = [
        {
            name: 'Forestry Authority',
            msp: 'ForestryAuthorityMSP',
            description: 'Valider l\'origine et emettre des permis',
            icon: 'FA',
            color: '#2ecc71'
        },
        {
            name: 'Logging Company',
            msp: 'LoggingCompaniesMSP',
            description: 'Declarer l\'exploitation et gerer le transport',
            icon: 'LC',
            color: '#e67e22'
        },
        {
            name: 'Buying Company',
            msp: 'BuyingCompaniesMSP',
            description: 'Verifier la conformite et acheter',
            icon: 'BC',
            color: '#3498db'
        },
        {
            name: 'Admin',
            msp: 'TreeTrackingAdminMSP',
            description: 'Consulter et auditer le reseau',
            icon: 'AD',
            color: '#95a5a6'
        }
    ];

    return (
        <div className="home-container">
            <header className="hero">
                <h1>TreeTracking</h1>
                <p>Plateforme de tracabilite forestiere basee sur Blockchain</p>
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
                <h2>A propos de TreeTracking</h2>
                <p>
                    TreeTracking utilise la technologie blockchain Hyperledger Fabric 
                    et IPFS pour assurer une tracabilite complete et transparente 
                    du bois, de la foret au produit fini.
                </p>
                <div className="features">
                    <div className="feature">
                        <span>S</span>
                        <h4>Securise</h4>
                        <p>Donnees immuables sur blockchain</p>
                    </div>
                    <div className="feature">
                        <span>T</span>
                        <h4>Transparent</h4>
                        <p>Historique complet consultable</p>
                    </div>
                    <div className="feature">
                        <span>C</span>
                        <h4>Certifie</h4>
                        <p>Conformite FSC/PEFC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
