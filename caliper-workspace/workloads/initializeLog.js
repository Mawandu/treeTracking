'use strict';

var WorkloadModuleBase = require('@hyperledger/caliper-core').WorkloadModuleBase;

class InitializeLogWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        this.txIndex++;
        var logId = 'LOG_INIT_' + this.workerIndex + '_' + this.txIndex + '_' + Date.now();
        var args = {
            contractId: 'treetracking',
            contractFunction: 'InitializeLog',
            contractArguments: [logId, 'Iroko', 'Bandundu-RDC'],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new InitializeLogWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
