"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthHandler = void 0;
const startTime = Date.now();
const createHealthHandler = () => {
    return (_req, res) => {
        const now = Date.now();
        const uptimeMs = now - startTime;
        res.status(200).json({
            status: 'ok',
            uptimeMs,
            timestamp: new Date(now).toISOString()
        });
    };
};
exports.createHealthHandler = createHealthHandler;
//# sourceMappingURL=health.js.map