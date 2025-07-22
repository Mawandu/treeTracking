'use strict';

const { Contract } = require('fabric-contract-api');

class TraceabilityContract extends Contract {
    async initLedger(ctx) {
        console.info('Ledger initialized');
    }

    async recordLog(ctx, logId, ipfsHash) {
        const log = { ipfsHash };
        await ctx.stub.putState(logId, Buffer.from(JSON.stringify(log)));
        console.info(`Log ${logId} recorded`);
    }

    async readLog(ctx, logId) {
        const data = await ctx.stub.getState(logId);
        if (!data || data.length === 0) {
            throw new Error(`Log ${logId} does not exist`);
        }
        return data.toString();
    }
}

module.exports = TraceabilityContract;
