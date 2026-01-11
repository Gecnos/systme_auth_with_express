export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this. isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends AppError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 401);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = 'Accès interdit') {
    super(message, 403);
  }
}

export class BadRequestException extends AppError {
  constructor(message = 'Requête invalide') {
    super(message, 400);
  }
}

export class ConflictException extends AppError {
  constructor(message = 'Conflit') {
    super(message, 409);
  }
}

export class ValidationException extends AppError {
  constructor(message = 'Erreur de validation', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}