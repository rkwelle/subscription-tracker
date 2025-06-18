import aj from '../config/arcjet.js';

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {requested: 1});

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()) {
                res.status(429).json({
                    message: 'Rate limit exceeded. Please try again later.'
                });
            }

            if(decision.reason.isBot()) {
                res.status(403).json({
                    message: 'Access denied for bots.'
                });
            }

            return res.status(403).json({
                message: 'Access denied.'
            });
        }
        // If the request is allowed, continue to the next middleware
        next();

    }catch (error) {
        console.log(`Error in arcjet middleware: ${error.message}`);
        next(error);
    }
}

export default arcjetMiddleware;