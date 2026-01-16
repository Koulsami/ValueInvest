import { Logger, TraceContext } from './lib/logger';
declare const app: import("express-serve-static-core").Express;
declare global {
    namespace Express {
        interface Request {
            logger: Logger;
            traceContext: TraceContext;
        }
    }
}
export default app;
//# sourceMappingURL=index.d.ts.map