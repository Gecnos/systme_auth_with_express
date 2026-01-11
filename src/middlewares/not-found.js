import { NotFoundException } from '../lib/exceptions.js'; 

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundException(`Route ${req.method} ${req.url} non trouvée`));
};