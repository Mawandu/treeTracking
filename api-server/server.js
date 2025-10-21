const express = require('express');
const cors = require('cors');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());

const PORT = 3000;
const channelName = 'treetrackingchannel';
const chaincodeName = 'treetracking';

// Helper function pour vérifier freeze
async function checkNetworkFrozen() {
    const gateway = new Gateway();
    try {
        const ccpPath = path.resolve(__dirname, 'connection-profile.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const identity = 'Admin@TreeTrackingAdminMSP';
        
        await gateway.connect(ccp, {
            wallet,
            identity: identity,
            discovery: { enabled: true, asLocalhost: true }
        });
        
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        const result = await contract.evaluateTransaction('GetNetworkState');
        const state = JSON.parse(result.toString());
        return state;
    } catch (error) {
        return { isFrozen: false };
    } finally {
        gateway.disconnect();
    }
}

// Middleware pour bloquer si réseau gelé
async function freezeCheckMiddleware(req, res, next) {
    // Routes admin toujours autorisées
    const adminRoutes = ['/api/admin/unfreezeNetwork', '/api/admin/networkState', '/health'];
    if (adminRoutes.includes(req.path)) {
        return next();
    }

    // Vérifier si route API métier
    if (req.path.startsWith('/api/') && !req.path.startsWith('/api/admin')) {
        try {
            const state = await checkNetworkFrozen();
            if (state.isFrozen) {
                return res.status(403).json({
                    success: false,
                    error: 'Network is frozen',
                    reason: state.reason,
                    frozenAt: state.frozenAt,
                    message: 'All operations blocked. Contact admin to unfreeze.'
                });
            }
        } catch (error) {
            // En cas d'erreur, laisser passer
            console.log('Freeze check error:', error.message);
        }
    }
    
    next();
}

// Appliquer middleware freeze
app.use(freezeCheckMiddleware);

async function executeTransaction(mspId, functionName, ...args) {
    const gateway = new Gateway();
    try {
        const ccpPath = path.resolve(__dirname, 'connection-profile.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const identity = `Admin@${mspId}`;
        const exists = await wallet.exists(identity);
        if (!exists) {
            throw new Error(`Identity not found: ${identity}`);
        }
        await gateway.connect(ccp, {
            wallet,
            identity: identity,
            discovery: { enabled: true, asLocalhost: true }
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        const result = await contract.submitTransaction(functionName, ...args);
        return result;
    } finally {
        gateway.disconnect();
    }
}

async function queryTransaction(mspId, functionName, ...args) {
    const gateway = new Gateway();
    try {
        const ccpPath = path.resolve(__dirname, 'connection-profile.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const identity = `Admin@${mspId}`;
        const exists = await wallet.exists(identity);
        if (!exists) {
            throw new Error(`Identity not found: ${identity}`);
        }
        await gateway.connect(ccp, {
            wallet,
            identity: identity,
            discovery: { enabled: true, asLocalhost: true }
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        const result = await contract.evaluateTransaction(functionName, ...args);
        return result;
    } finally {
        gateway.disconnect();
    }
}

// FORESTRY AUTHORITY ROUTES
app.post('/api/forestry/initializeLog', async (req, res) => {
    try {
        const { logID, species, origin } = req.body;
        await executeTransaction('ForestryAuthorityMSP', 'InitializeLog', logID, species, origin);
        res.json({ success: true, message: 'Log initialized', logID });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/forestry/validateOrigin', async (req, res) => {
    try {
        const { logID } = req.body;
        await executeTransaction('ForestryAuthorityMSP', 'ValidateOrigin', logID);
        res.json({ success: true, message: 'Origin validated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/forestry/issuePermit', async (req, res) => {
    try {
        const { logID, permitID, expiryDate } = req.body;
        await executeTransaction('ForestryAuthorityMSP', 'IssueHarvestPermit', logID, permitID, expiryDate);
        res.json({ success: true, message: 'Permit issued', permitID });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/forestry/issueLicense', async (req, res) => {
    try {
        const { licenseID, companyMSP, totalCubage, expiryDate } = req.body;
        await executeTransaction('ForestryAuthorityMSP', 'IssueLicense', licenseID, companyMSP, totalCubage.toString(), expiryDate);
        res.json({ success: true, message: 'License issued', licenseID });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/license/:licenseID', async (req, res) => {
    try {
        const result = await queryTransaction('TreeTrackingAdminMSP', 'GetLicense', req.params.licenseID);
        res.json({ success: true, data: JSON.parse(result.toString()) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// LOGGING COMPANY ROUTES
app.post('/api/logging/declareHarvest', async (req, res) => {
    try {
        const { logID } = req.body;
        await executeTransaction('LoggingCompaniesMSP', 'DeclareHarvest', logID);
        res.json({ success: true, message: 'Harvest declared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/logging/addPhysicalData', async (req, res) => {
    try {
        const { logID, dimensions, weight, quality, marking } = req.body;
        await executeTransaction('LoggingCompaniesMSP', 'AddPhysicalData', logID, dimensions, weight.toString(), quality, marking);
        res.json({ success: true, message: 'Physical data added' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/logging/uploadMultimedia', async (req, res) => {
    try {
        const { logID, ipfsHash, metadata } = req.body;
        await executeTransaction('LoggingCompaniesMSP', 'UploadMultimedia', logID, ipfsHash, JSON.stringify(metadata));
        res.json({ success: true, message: 'Multimedia uploaded', ipfsHash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/logging/updateTransport', async (req, res) => {
    try {
        const { logID, status } = req.body;
        await executeTransaction('LoggingCompaniesMSP', 'UpdateTransportStatus', logID, status);
        res.json({ success: true, message: 'Transport status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// BUYING COMPANY ROUTES
app.post('/api/buying/validatePurchase', async (req, res) => {
    try {
        const { logID, buyerID, price, currency } = req.body;
        await executeTransaction('BuyingCompaniesMSP', 'ValidatePurchase', logID, buyerID, price.toString(), currency);
        res.json({ success: true, message: 'Purchase validated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/buying/verifyCompliance/:logID', async (req, res) => {
    try {
        const { logID } = req.params;
        const result = await queryTransaction('BuyingCompaniesMSP', 'VerifyCompliance', logID);
        res.json({ success: true, data: JSON.parse(result.toString()) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/buying/transferOwnership', async (req, res) => {
    try {
        const { logID, newBuyerID, price, currency } = req.body;
        await executeTransaction('BuyingCompaniesMSP', 'TransferOwnership', logID, newBuyerID, price.toString(), currency);
        res.json({ success: true, message: 'Ownership transferred' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// QUERY ROUTES
app.get('/api/logs/:logID', async (req, res) => {
    try {
        const { logID } = req.params;
        const msp = req.query.msp || 'TreeTrackingAdminMSP';
        const result = await queryTransaction(msp, 'GetLogHistory', logID);
        res.json({ success: true, data: JSON.parse(result.toString()) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ADMIN ROUTES
app.post('/api/admin/emergencyFreeze', async (req, res) => {
    try {
        const { reason } = req.body;
        await executeTransaction('TreeTrackingAdminMSP', 'EmergencyFreeze', reason);
        res.json({ success: true, message: 'Network frozen' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/unfreezeNetwork', async (req, res) => {
    try {
        await executeTransaction('TreeTrackingAdminMSP', 'UnfreezeNetwork');
        res.json({ success: true, message: 'Network unfrozen' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/networkState', async (req, res) => {
    try {
        const result = await queryTransaction('TreeTrackingAdminMSP', 'GetNetworkState');
        res.json({ success: true, data: JSON.parse(result.toString()) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// IPFS ENDPOINTS
const ipfsManager = require('./ipfsManager');
const multer = require('multer');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/api/ipfs/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file provided' });
        }
        const result = await ipfsManager.uploadBuffer(req.file.buffer, req.file.originalname);
        res.json({
            success: true,
            ipfsHash: result.hash,
            size: result.size,
            filename: req.file.originalname,
            gatewayUrl: ipfsManager.getGatewayUrl(result.hash)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/ipfs/:hash', async (req, res) => {
    try {
        const fileBuffer = await ipfsManager.getFile(req.params.hash);
        res.set('Content-Type', 'application/octet-stream');
        res.send(fileBuffer);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`TreeTracking API Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`IPFS Gateway: http://127.0.0.1:8080/ipfs/`);
    console.log(`CORS enabled for http://localhost:3001`);
    console.log(`V2 Features: License, Transfer, Freeze activated`);
    console.log(`Freeze protection: ACTIVE`);
});
