'use strict';
const express = require('express');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
const ccpPath = path.resolve(__dirname, 'connection.json');

app.post('/logs', async (req, res) => {
    try {
        const { logID, species, origin } = req.body;
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists('admin');
        if (!userExists) {
            return res.status(401).send('Admin identity not found in wallet. Run enrollAdmin.js first.');
        }
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });
        const network = await gateway.getNetwork('treetrackingchannel');
        const contract = network.getContract('treetracking');
        await contract.submitTransaction('InitializeLog', logID, species, origin);
        await gateway.disconnect();
        res.status(201).send('Transaction has been submitted for log: ' + logID);
    } catch (error) {
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});
app.get('/logs/:id', async (req, res) => {
    try {
        const logID = req.params.id;
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists('admin');
        if (!userExists) {
            return res.status(401).send('Admin identity not found in wallet. Run enrollAdmin.js first.');
        }
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });
        const network = await gateway.getNetwork('treetrackingchannel');
        const contract = network.getContract('treetracking');
        const result = await contract.evaluateTransaction('GetLogHistory', logID);
        await gateway.disconnect();
        res.status(200).json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).send(`Failed to evaluate transaction: ${error}`);
    }
});
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
