import express from 'express';
import { globalLimiter } from './middlewares/rate-limit.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import userRouter from './routes/user.routes.js';

import passport from './config/passport.js';
import oauth2faRouter from './routes/OAuth&2fa.routes.js'
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(express.json());
app.use(globalLimiter); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());



// Routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth', oauth2faRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log("Server running on port 3000"));