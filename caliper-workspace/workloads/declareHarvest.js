'use strict';

var WorkloadModuleBase = require('@hyperledger/caliper-core').WorkloadModuleBase;

class DeclareHarvestWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.logIds = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        var load = roundArguments.transactionLoad || 10;
        
        
        for (var i = 0; i < numTx; i += 20) {
            var batch = [];
            for (var j = 0; j < 20 && i + j < numTx; j++) {
                var logId = 'LOG_DH_' + workerIndex + '_' + roundIndex + '_' + (i + j) + '_' + Date.now();
                this.logIds.push(logId);
                
                batch.push((async (id) => {
                    await this.sutAdapter.sendRequests({
                        contractId: 'treetracking',
                        contractFunction: 'InitializeLog',
                        contractArguments: [id, 'Sapele', 'Equateur'],
                        readOnly: false
                    });
                    await this.sutAdapter.sendRequests({
                        contractId: 'treetracking',
                        contractFunction: 'ValidateOrigin',
                        contractArguments: [id],
                        readOnly: false
                    });
                    await this.sutAdapter.sendRequests({
                        contractId: 'treetracking',
                        contractFunction: 'IssueHarvestPermit',
                        contractArguments: [id, 'PERMIT_' + id, '2030-12-31'],
                        readOnly: false
                    });
                })(logId));
            }
            await Promise.all(batch);
        }
    }

    async submitTransaction() {
        if (this.txIndex >= this.logIds.length) {
            return;
        }
        var logId = this.logIds[this.txIndex];
        this.txIndex++;
        
        var args = {
            contractId: 'treetracking',
            contractFunction: 'DeclareHarvest',
            contractArguments: [logId],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new DeclareHarvestWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
