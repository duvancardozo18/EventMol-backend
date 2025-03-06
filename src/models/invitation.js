const invitationCache = new Map();

/**
 * Almacenar una invitación en memoria
 * @param {string} token - Token único de invitación
 * @param {number} id_event - ID del evento
 * @param {number} id_user - ID del usuario invitado
 */
export const storeInvitationToken = (token, id_event, id_user) => {
    invitationCache.set(token, { id_event, id_user, createdAt: Date.now() });
};

/**
 * Obtener una invitación almacenada en memoria
 * @param {string} token - Token de invitación
 * @returns {object | null} - Datos de la invitación o null si no existe
 */
export const getInvitationByToken = (token) => {
    return invitationCache.get(token) || null;
};

/**
 * Eliminar una invitación después de ser aceptada
 * @param {string} token - Token de invitación
 */
export const deleteInvitationToken = (token) => {
    invitationCache.delete(token);
};

export default invitationCache;
