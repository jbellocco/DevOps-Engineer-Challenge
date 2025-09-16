"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEchoHandler = void 0;
const zod_1 = require("zod");
const echoSchema = zod_1.z.any();
const createEchoHandler = () => {
    return (req, res) => {
        try {
            if (!req.is('application/json')) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Content-Type must be application/json'
                });
            }
            const validatedData = echoSchema.parse(req.body);
            return res.status(200).json({
                data: validatedData
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid JSON payload',
                    details: error.errors
                });
            }
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid request payload'
            });
        }
    };
};
exports.createEchoHandler = createEchoHandler;
//# sourceMappingURL=echo.js.map