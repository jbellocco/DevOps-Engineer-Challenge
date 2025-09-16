"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVersionHandler = void 0;
const config_1 = require("../config");
const createVersionHandler = () => {
    return (_req, res) => {
        const response = {
            version: config_1.config.appVersion
        };
        if (config_1.config.gitCommit) {
            response.commit = config_1.config.gitCommit;
        }
        res.status(200).json(response);
    };
};
exports.createVersionHandler = createVersionHandler;
//# sourceMappingURL=version.js.map