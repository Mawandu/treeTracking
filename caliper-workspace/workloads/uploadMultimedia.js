'use strict';

var WorkloadModuleBase = require('@hyperledger/caliper-core').WorkloadModuleBase;

class UploadMultimediaWorkload extends WorkloadModuleBase {
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
            var logId = 'LOG_UM_' + workerIndex + '_' + roundIndex + '_' + i + '_' + Date.now();
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
        
        var metadata = JSON.stringify({"type": "photo", "location": "forest"});
        var args = {
            contractId: 'treetracking',
            contractFunction: 'UploadMultimedia',
            contractArguments: [logId, 'QmHash123456789', metadata],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new UploadMultimediaWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
