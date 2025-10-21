import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

class TreeTrackingAPI {
    async initializeLog(logID, species, origin) {
        return axios.post(`${API_BASE_URL}/api/forestry/initializeLog`, {
            logID, species, origin
        });
    }

    async validateOrigin(logID) {
        return axios.post(`${API_BASE_URL}/api/forestry/validateOrigin`, { logID });
    }

    async issuePermit(logID, permitID, expiryDate) {
        return axios.post(`${API_BASE_URL}/api/forestry/issuePermit`, {
            logID, permitID, expiryDate
        });
    }

    // === NOUVELLES FONCTIONS v2.0 - LICENSE ===
    async issueLicense(licenseID, companyMSP, totalCubage, expiryDate) {
        return axios.post(`${API_BASE_URL}/api/forestry/issueLicense`, {
            licenseID, companyMSP, totalCubage, expiryDate
        });
    }

    async getLicense(licenseID) {
        return axios.get(`${API_BASE_URL}/api/license/${licenseID}`);
    }

    async declareHarvest(logID) {
        return axios.post(`${API_BASE_URL}/api/logging/declareHarvest`, { logID });
    }

    async addPhysicalData(logID, dimensions, weight, quality, marking) {
        return axios.post(`${API_BASE_URL}/api/logging/addPhysicalData`, {
            logID, dimensions, weight, quality, marking
        });
    }

    async updateTransport(logID, status) {
        return axios.post(`${API_BASE_URL}/api/logging/updateTransport`, {
            logID, status
        });
    }

    async uploadMultimedia(logID, ipfsHash, metadata) {
        return axios.post(`${API_BASE_URL}/api/logging/uploadMultimedia`, {
            logID, ipfsHash, metadata
        });
    }

    async validatePurchase(logID, buyerID, price, currency) {
        return axios.post(`${API_BASE_URL}/api/buying/validatePurchase`, {
            logID, buyerID, price, currency
        });
    }

    // === NOUVELLES FONCTIONS v2.0 - TRANSFER ===
    async transferOwnership(logID, newBuyerID, price, currency) {
        return axios.post(`${API_BASE_URL}/api/buying/transferOwnership`, {
            logID, newBuyerID, price, currency
        });
    }

    async verifyCompliance(logID) {
        return axios.get(`${API_BASE_URL}/api/buying/verifyCompliance/${logID}`);
    }

    async getLogHistory(logID, msp = 'TreeTrackingAdminMSP') {
        return axios.get(`${API_BASE_URL}/api/logs/${logID}?msp=${msp}`);
    }

    // === NOUVELLES FONCTIONS v2.0 - ADMIN/FREEZE ===
    async emergencyFreeze(reason) {
        return axios.post(`${API_BASE_URL}/api/admin/emergencyFreeze`, { reason });
    }

    async unfreezeNetwork() {
        return axios.post(`${API_BASE_URL}/api/admin/unfreezeNetwork`);
    }

    async getNetworkState() {
        return axios.get(`${API_BASE_URL}/api/admin/networkState`);
    }

    async uploadToIPFS(file) {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post(`${API_BASE_URL}/api/ipfs/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    getIPFSUrl(hash) {
        return `http://127.0.0.1:8080/ipfs/${hash}`;
    }
}

const apiInstance = new TreeTrackingAPI();
export default apiInstance;
