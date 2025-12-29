import express from 'express';
import { globalLimiter } from './middlewares/rate-limit.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import userRouter from './routes/user.routes.js';

const app = express();

app.use(express.json());
app.use(globalLimiter); 

// Routes
app.use('/api/users', userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => console.log("Server running on port 3000"));