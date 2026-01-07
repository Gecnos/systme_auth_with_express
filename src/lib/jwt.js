import jwt from 'jsonwebtoken';

export function sign(payload, secret, options = {}) {
  return jwt.sign(payload, secret, options);
}


export function verify(token, secret) {
  return jwt.verify(token, secret);
}

export function decode(token) {
  return jwt.decode(token);
}

export default { sign, verify, decode };