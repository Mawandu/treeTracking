'use strict';

var WorkloadModuleBase = require('@hyperledger/caliper-core').WorkloadModuleBase;

class VerifyComplianceWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.logIds = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        
        var batch = [];
        for (var i = 0; i < numTx; i++) {
            var logId = 'LOG_VC_' + workerIndex + '_' + roundIndex + '_' + i;
            this.logIds.push(logId);
            
            batch.push((async (id) => {
                try {
                    await this.sutAdapter.sendRequests({
                        contractId: 'treetracking',
                        contractFunction: 'InitializeLog',
                        contractArguments: [id, 'Sapele', 'Equateur'],
                        readOnly: false
                    });
                } catch(e) {}
            })(logId));
        }
        await Promise.all(batch);
    }

    async submitTransaction() {
        var logId = this.logIds[this.txIndex % this.logIds.length];
        this.txIndex++;
        
        var args = {
            contractId: 'treetracking',
            contractFunction: 'VerifyCompliance',
            contractArguments: [logId],
            readOnly: true
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new VerifyComplianceWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
