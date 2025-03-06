import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    try {
        // Decodificar el token con la clave secreta
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

        // Agregar el usuario autenticado a `req.user`
        req.user = decoded;

        console.log('Middleware autenticación - Usuario:', req.user); // 🔍 Verifica los datos

        // Si `id_role` no está presente en el token, bloquear la petición
        if (!req.user.id_role) {
            return res.status(403).json({ error: 'No tienes permisos suficientes. (Falta id_role)' });
        }

        // Si está intentando cambiar un rol y no es SuperAdmin (id_role = 4), denegar acceso
        if (req.path.includes('/usuarios/') && req.method === 'PUT' && req.user.id_role !== 4) {
            return res.status(403).json({ error: 'No tienes permisos para cambiar roles.' });
        }

        next(); // Continúa con la siguiente función

    } catch (error) {
        return res.status(400).json({ error: 'Token inválido o expirado.' });
    }
}
