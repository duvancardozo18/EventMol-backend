import * as authService from '../services/authService.js';

/**
 * Middleware para verificar la autenticación basada en cookie
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
export const verifyAuth = (req, res, next) => {
  try {
    // Obtener token de la cookie
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado: No hay sesión activa' });
    }
    
    // Verificar token
    const decoded = authService.verifyToken(token);
    
    // Guardar datos del usuario en el objeto request para uso posterior
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado: Sesión inválida o expirada' });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {Array} roles - Array de IDs de roles permitidos
 * @returns {Function} Middleware de Express
 */
export const verifyRole = (roles) => {
  return (req, res, next) => {
    // Este middleware debe usarse después de verifyAuth
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    if (!roles.includes(req.user.id_role)) {
      return res.status(403).json({ error: 'Acceso denegado: No tienes los permisos necesarios' });
    }
    
    next();
  };
};