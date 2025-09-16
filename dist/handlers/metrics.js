"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetricsHandler = void 0;
const prom_client_1 = require("prom-client");
const createMetricsHandler = () => {
    return async (_req, res) => {
        try {
            res.set('Content-Type', prom_client_1.register.contentType);
            res.end(await prom_client_1.register.metrics());
        }
        catch (error) {
            res.status(500).end('Error collecting metrics');
        }
    };
};
exports.createMetricsHandler = createMetricsHandler;
//# sourceMappingURL=metrics.js.map