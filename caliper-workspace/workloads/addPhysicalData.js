'use strict';

var WorkloadModuleBase = require('@hyperledger/caliper-core').WorkloadModuleBase;

class AddPhysicalDataWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.logIds = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        var numTx = 100;
        
        var batch = [];
        for (var i = 0; i < numTx; i++) {
            var logId = 'LOG_PD_' + workerIndex + '_' + roundIndex + '_' + i + '_' + Date.now();
            this.logIds.push(logId);
            
            batch.push((async (id) => {
                await this.sutAdapter.sendRequests({
                    contractId: 'treetracking',
                    contractFunction: 'InitializeLog',
                    contractArguments: [id, 'Sapele', 'Equateur'],
                    readOnly: false
                });
            })(logId));
            
            if (batch.length >= 20 || i === numTx - 1) {
                await Promise.all(batch);
                batch = [];
            }
        }
    }

    async submitTransaction() {
        var logId = this.logIds[this.txIndex % this.logIds.length];
        this.txIndex++;
        
        var args = {
            contractId: 'treetracking',
            contractFunction: 'AddPhysicalData',
            contractArguments: [logId, '5x5x5', '100.5', 'A', 'M-123'],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new AddPhysicalDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
