// src/lib/async-handler.js

/**
 * Wrapper pour les fonctions async des controllers
 * Capture automatiquement les erreurs et les passe au middleware d'erreur
 * 
 * @param {Function} fn - Fonction async du controller
 * @returns {Function} Middleware Express
 * 
 * @example
 * import asyncHandler from '../lib/async-handler.js';
 * 
 * export const getUser = asyncHandler(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   res.json(user);
 * });
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;