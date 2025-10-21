const IpfsHttpClient = require('ipfs-http-client');

class IPFSManager {
    constructor() {
        this.client = IpfsHttpClient({ 
            host: '127.0.0.1', 
            port: 5001, 
            protocol: 'http' 
        });
    }

    async uploadBuffer(buffer, filename) {
        try {
            // Ne pas inclure le filename dans le path
            const result = await this.client.add(buffer);
            return {
                success: true,
                hash: result.path,  // Vrai hash IPFS (QmXXX...)
                size: result.size
            };
        } catch (error) {
            throw new Error(`IPFS upload failed: ${error.message}`);
        }
    }

    async getFile(hash) {
        try {
            const chunks = [];
            for await (const chunk of this.client.cat(hash)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        } catch (error) {
            throw new Error(`IPFS retrieval failed: ${error.message}`);
        }
    }

    getGatewayUrl(hash) {
        return `http://127.0.0.1:8080/ipfs/${hash}`;
    }
}

module.exports = new IPFSManager();
