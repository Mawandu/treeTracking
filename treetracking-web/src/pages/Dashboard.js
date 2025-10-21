import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Statistics from '../components/Statistics';
import QRCodeGenerator from '../components/QRCodeGenerator';
import PDFExport from '../components/PDFExport';
import Timeline from '../components/Timeline';
import './Dashboard.css';

function Dashboard() {
    const { msp } = useParams();
    const navigate = useNavigate();
    const [logID, setLogID] = useState('');
    const [logData, setLogData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [networkState, setNetworkState] = useState(null);
    const [showStats, setShowStats] = useState(false);

    const [formData, setFormData] = useState({
        species: '',
        origin: '',
        permitID: '',
        expiryDate: '',
        dimensions: '',
        weight: '',
        quality: 'A',
        marking: '',
        transportStatus: '',
        buyerID: '',
        price: '',
        currency: 'USD',
        licenseID: '',
        companyMSP: 'LoggingCompaniesMSP',
        totalCubage: '',
        licenseExpiry: '',
        newBuyerID: '',
        transferPrice: '',
        freezeReason: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [licenseData, setLicenseData] = useState(null);

    useEffect(() => {
        loadNetworkState();
        const interval = setInterval(loadNetworkState, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadNetworkState = async () => {
        try {
            const response = await api.getNetworkState();
            setNetworkState(response.data.data);
        } catch (error) {
            console.error('Failed to load network state');
        }
    };

    const getOrgName = () => {
        const names = {
            'ForestryAuthorityMSP': 'Forestry Authority',
            'LoggingCompaniesMSP': 'Logging Company',
            'BuyingCompaniesMSP': 'Buying Company',
            'TreeTrackingAdminMSP': 'Admin'
        };
        return names[msp] || msp;
    };

    const searchLog = async () => {
        if (!logID) return;
        setLoading(true);
        try {
            const response = await api.getLogHistory(logID, msp);
            setLogData(response.data.data);
            setMessage('');
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
            setLogData(null);
        }
        setLoading(false);
    };

    const searchLicense = async () => {
        if (!formData.licenseID) return;
        try {
            const response = await api.getLicense(formData.licenseID);
            setLicenseData(response.data.data);
            setMessage('License loaded');
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
            setLicenseData(null);
        }
    };

    const initializeLog = async () => {
        try {
            await api.initializeLog(logID, formData.species, formData.origin);
            setMessage('Log initialized successfully!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const validateOrigin = async () => {
        try {
            await api.validateOrigin(logID);
            setMessage('Origin validated!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const issuePermit = async () => {
        try {
            const isoDate = formData.expiryDate ? formData.expiryDate + ':00Z' : '';
            await api.issuePermit(logID, formData.permitID, isoDate);
            setMessage('Permit issued!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const issueLicense = async () => {
        try {
            const isoDate = formData.licenseExpiry ? formData.licenseExpiry + ':00Z' : '';
            await api.issueLicense(
                formData.licenseID,
                formData.companyMSP,
                parseFloat(formData.totalCubage),
                isoDate
            );
            setMessage('License issued successfully!');
            searchLicense();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const transferOwnership = async () => {
        try {
            await api.transferOwnership(
                logID,
                formData.newBuyerID,
                parseFloat(formData.transferPrice),
                formData.currency
            );
            setMessage('Ownership transferred!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const freezeNetwork = async () => {
        try {
            await api.emergencyFreeze(formData.freezeReason);
            setMessage('Network frozen!');
            loadNetworkState();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const unfreezeNetwork = async () => {
        try {
            await api.unfreezeNetwork();
            setMessage('Network unfrozen!');
            loadNetworkState();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const declareHarvest = async () => {
        try {
            await api.declareHarvest(logID);
            setMessage('Harvest declared!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const addPhysicalData = async () => {
        try {
            await api.addPhysicalData(
                logID, 
                formData.dimensions, 
                parseFloat(formData.weight), 
                formData.quality, 
                formData.marking
            );
            setMessage('Physical data added!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const uploadToIPFS = async () => {
        if (!selectedFile) {
            setMessage('Please select a file');
            return;
        }
        try {
            const response = await api.uploadToIPFS(selectedFile);
            const ipfsHash = response.data.ipfsHash;
            await api.uploadMultimedia(logID, ipfsHash, { type: selectedFile.type });
            setMessage('File uploaded to IPFS!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const updateTransport = async () => {
        try {
            await api.updateTransport(logID, formData.transportStatus);
            setMessage('Transport updated!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const validatePurchase = async () => {
        try {
            await api.validatePurchase(
                logID, 
                formData.buyerID, 
                parseFloat(formData.price), 
                formData.currency
            );
            setMessage('Purchase validated!');
            searchLog();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <button onClick={() => navigate('/')} className="back-btn">← Back</button>
                <h1>{getOrgName()}</h1>
                {networkState && (
                    <div className={`network-badge ${networkState.isFrozen ? 'frozen' : 'active'}`}>
                        {networkState.isFrozen ? 'FROZEN' : 'ACTIVE'}
                    </div>
                )}
            </header>

            {networkState?.isFrozen && (
                <div className="freeze-alert">
                    Network is FROZEN: {networkState.reason}
                </div>
            )}

            {msp === 'TreeTrackingAdminMSP' && (
                <button 
                    onClick={() => setShowStats(!showStats)} 
                    className="btn-toggle-stats"
                >
                    {showStats ? 'Masquer' : 'Afficher'} les statistiques
                </button>
            )}

            {showStats && msp === 'TreeTrackingAdminMSP' && <Statistics />}

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Enter Log ID (e.g., LOG001)"
                    value={logID}
                    onChange={(e) => setLogID(e.target.value)}
                />
                <button onClick={searchLog} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

            {msp === 'ForestryAuthorityMSP' && (
                <>
                    <div className="action-panel">
                        <h3>Log Management</h3>
                        <div className="form-group">
                            <input placeholder="Species" value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} />
                            <input placeholder="Origin" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} />
                            <button onClick={initializeLog}>Initialize Log</button>
                        </div>
                        <button onClick={validateOrigin} className="btn-secondary">Validate Origin</button>
                        <div className="form-group">
                            <input placeholder="Permit ID" value={formData.permitID} onChange={(e) => setFormData({...formData, permitID: e.target.value})} />
                            <input type="datetime-local" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                            <button onClick={issuePermit}>Issue Permit</button>
                        </div>
                    </div>

                    <div className="action-panel license-panel">
                        <h3>License Management (v2.0)</h3>
                        <div className="form-group">
                            <input placeholder="License ID" value={formData.licenseID} onChange={(e) => setFormData({...formData, licenseID: e.target.value})} />
                            <button onClick={searchLicense} className="btn-secondary">Search License</button>
                        </div>
                        <div className="form-group">
                            <select value={formData.companyMSP} onChange={(e) => setFormData({...formData, companyMSP: e.target.value})}>
                                <option value="LoggingCompaniesMSP">Logging Company</option>
                                <option value="BuyingCompaniesMSP">Buying Company</option>
                            </select>
                            <input type="number" placeholder="Total Cubage (m³)" value={formData.totalCubage} onChange={(e) => setFormData({...formData, totalCubage: e.target.value})} />
                            <input type="datetime-local" value={formData.licenseExpiry} onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})} />
                            <button onClick={issueLicense}>Issue License</button>
                        </div>
                        {licenseData && (
                            <div className="license-details">
                                <p><strong>ID:</strong> {licenseData.licenseID}</p>
                                <p><strong>Company:</strong> {licenseData.companyMSP}</p>
                                <p><strong>Total Cubage:</strong> {licenseData.totalCubage} m³</p>
                                <p><strong>Remaining:</strong> {licenseData.remainingCubage} m³</p>
                                <p><strong>Expiry:</strong> {new Date(licenseData.expiryDate).toLocaleString()}</p>
                                <p><strong>Status:</strong> {licenseData.isRevoked ? 'Revoked' : 'Active'}</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {msp === 'LoggingCompaniesMSP' && (
                <div className="action-panel">
                    <h3>Actions</h3>
                    <button onClick={declareHarvest}>Declare Harvest</button>
                    <div className="form-group">
                        <input placeholder="Dimensions" value={formData.dimensions} onChange={(e) => setFormData({...formData, dimensions: e.target.value})} />
                        <input type="number" placeholder="Weight (kg)" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                        <select value={formData.quality} onChange={(e) => setFormData({...formData, quality: e.target.value})}>
                            <option value="A">Quality A</option>
                            <option value="B">Quality B</option>
                            <option value="C">Quality C</option>
                        </select>
                        <input placeholder="Marking" value={formData.marking} onChange={(e) => setFormData({...formData, marking: e.target.value})} />
                        <button onClick={addPhysicalData}>Add Physical Data</button>
                    </div>
                    <div className="form-group">
                        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                        <button onClick={uploadToIPFS}>Upload to IPFS</button>
                    </div>
                    <div className="form-group">
                        <input placeholder="Transport Status" value={formData.transportStatus} onChange={(e) => setFormData({...formData, transportStatus: e.target.value})} />
                        <button onClick={updateTransport}>Update Transport</button>
                    </div>
                </div>
            )}

            {msp === 'BuyingCompaniesMSP' && (
                <div className="action-panel">
                    <h3>Actions</h3>
                    <div className="form-group">
                        <input placeholder="Buyer ID" value={formData.buyerID} onChange={(e) => setFormData({...formData, buyerID: e.target.value})} />
                        <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                        <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="CDF">CDF</option>
                        </select>
                        <button onClick={validatePurchase}>Validate Purchase</button>
                    </div>

                    {logData?.status === 'SOLD' && (
                        <div className="transfer-section">
                            <h4>Transfer Ownership (v2.0)</h4>
                            <div className="form-group">
                                <input placeholder="New Buyer ID" value={formData.newBuyerID} onChange={(e) => setFormData({...formData, newBuyerID: e.target.value})} />
                                <input type="number" placeholder="Transfer Price" value={formData.transferPrice} onChange={(e) => setFormData({...formData, transferPrice: e.target.value})} />
                                <button onClick={transferOwnership} className="btn-warning">Transfer</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {msp === 'TreeTrackingAdminMSP' && (
                <div className="action-panel admin-panel">
                    <h3>Network Control (v2.0)</h3>
                    <div className="network-status">
                        <p><strong>Network Status:</strong> {networkState?.isFrozen ? 'FROZEN' : 'ACTIVE'}</p>
                        {networkState?.isFrozen && (
                            <>
                                <p><strong>Reason:</strong> {networkState.reason}</p>
                                <p><strong>Frozen At:</strong> {new Date(networkState.frozenAt).toLocaleString()}</p>
                            </>
                        )}
                    </div>
                    {!networkState?.isFrozen ? (
                        <div className="form-group">
                            <input placeholder="Freeze Reason" value={formData.freezeReason} onChange={(e) => setFormData({...formData, freezeReason: e.target.value})} />
                            <button onClick={freezeNetwork} className="btn-danger">Emergency Freeze</button>
                        </div>
                    ) : (
                        <button onClick={unfreezeNetwork} className="btn-success">Unfreeze Network</button>
                    )}
                </div>
            )}

            {logData && (
                <div className="log-details">
                    <div className="log-header">
                        <h3>Log Details - {logData.logID}</h3>
                        <PDFExport logData={logData} />
                    </div>
                    
                    <div className="hash-section">
                        <p><strong>Blockchain Hash:</strong> <code>{logData.logID}</code></p>
                        {logData.multimediaData?.[0] && (
                            <p><strong>IPFS Hash:</strong> <code>{logData.multimediaData[0].ipfsHash}</code></p>
                        )}
                    </div>

                    <div className="detail-grid">
                        <div className="detail-item"><strong>Species:</strong> {logData.species}</div>
                        <div className="detail-item"><strong>Origin:</strong> {logData.origin}</div>
                        <div className="detail-item"><strong>Status:</strong> <span className={`status-badge ${logData.status}`}>{logData.status}</span></div>
                        <div className="detail-item"><strong>Origin Validated:</strong> {logData.originValidated ? 'Yes' : 'No'}</div>
                    </div>

                    <QRCodeGenerator logID={logData.logID} data={logData} />

                    {logData.permit && (
                        <div className="section">
                            <h4>Permit Information</h4>
                            <p><strong>ID:</strong> {logData.permit.permitID}</p>
                            <p><strong>Expiry:</strong> {new Date(logData.permit.expiryDate).toLocaleString()}</p>
                        </div>
                    )}

                    {logData.physicalData && (
                        <div className="section">
                            <h4>Physical Data</h4>
                            <p><strong>Dimensions:</strong> {logData.physicalData.dimensions}</p>
                            <p><strong>Weight:</strong> {logData.physicalData.weight} kg</p>
                            <p><strong>Quality:</strong> {logData.physicalData.quality}</p>
                        </div>
                    )}

                    {logData.multimediaData && logData.multimediaData.length > 0 && (
                        <div className="section">
                            <h4>Multimedia</h4>
                            {logData.multimediaData.map((media, idx) => (
                                <p key={idx}>
                                    <a href={api.getIPFSUrl(media.ipfsHash)} target="_blank" rel="noopener noreferrer">
                                        View File {idx + 1}
                                    </a>
                                </p>
                            ))}
                        </div>
                    )}

                    {logData.purchase && (
                        <div className="section">
                            <h4>Purchase</h4>
                            <p><strong>Buyer:</strong> {logData.purchase.buyerID}</p>
                            <p><strong>Price:</strong> {logData.purchase.price} {logData.purchase.currency}</p>
                            <p><strong>Compliant:</strong> {logData.purchase.isCompliant ? 'Yes' : 'No'}</p>
                        </div>
                    )}

                    <Timeline history={logData.history} />
                </div>
            )}
        </div>
    );
}

export default Dashboard;
