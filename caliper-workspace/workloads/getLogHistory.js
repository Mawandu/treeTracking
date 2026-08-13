'use strict';

var WorkloadModuleBase = require('@hyperledger/caliper-core').WorkloadModuleBase;

class GetLogHistoryWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.logIds = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        for (var i = 0; i < 10; i++) {
            var logId = 'QUERY_LOG_' + workerIndex + '_' + i;
            var initArgs = {
                contractId: 'treetracking',
                contractFunction: 'InitializeLog',
                contractArguments: [logId, 'Iroko', 'Bandundu-RDC'],
                readOnly: false
            };
            try {
                await this.sutAdapter.sendRequests(initArgs);
                this.logIds.push(logId);
            } catch (e) {
                this.logIds.push(logId);
            }
        }
    }

    async submitTransaction() {
        this.txIndex++;
        var idx = this.txIndex % this.logIds.length;
        var logId = this.logIds.length > 0 ? this.logIds[idx] : 'QUERY_LOG_0_0';
        var args = {
            contractId: 'treetracking',
            contractFunction: 'GetLogHistory',
            contractArguments: [logId],
            readOnly: true
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new GetLogHistoryWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
