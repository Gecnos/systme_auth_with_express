async function test() {
    const imports = [
        'express',
        './src/middlewares/rate-limit.js',
        './src/middlewares/error-handler.js',
        './src/middlewares/not-found.js',
        './src/routes/user.routes.js',
        './src/config/passport.js',
        './src/routes/OAuth_2fa.routes.js',
        './src/routes/auth.routes.js'
    ];

    for (const imp of imports) {
        try {
            console.log(`Testing import: ${imp}`);
            await import(imp);
            console.log(`SUCCESS: ${imp}`);
        } catch (e) {
            console.error(`FAILED: ${imp}`);
            console.error(e);
            // Don't stop, test others too
        }
    }
}

test();
