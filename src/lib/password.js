import bcrypt from 'bcrypt';

/**
 * Hash un mot de passe
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare un mot de passe avec son hash
 */
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export default { hashPassword, comparePassword };
