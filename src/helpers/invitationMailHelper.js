export const getInvitationMailOptions = (userEmail, eventName, eventId, token) => {
    const acceptLink = `http://localhost:7777/api/invitacion/${token}`;
    const rejectLink = "#";

    return {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `🎉 Invitación a: ${eventName}`,
        html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff; 
                    border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); padding: 20px; text-align: center; border: 1px solid #ddd;">
          <div style="background: #007bff; color: white; padding: 15px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">🎟️ Invitación a: ${eventName}</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 18px; color: #333;"><b>¡Hola!</b></p>
            <p style="color: #555;">Has sido invitado al evento <b>${eventName}</b>. ¡Esperamos verte allí!</p>
            <hr style="border: 0; height: 1px; background: #ddd;">
            
            <h3 style="color: #007bff;">¿Aceptas la invitación?</h3>
            
            <div style="margin-top: 20px;">
              <a href="${acceptLink}" 
                style="display: inline-block; background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; 
                font-size: 18px; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                ✅ Aceptar Invitación
              </a>
              
              <a href="${rejectLink}" 
                style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; 
                font-size: 18px; border-radius: 5px; font-weight: bold; margin-left: 10px;">
                ❌ Rechazar Invitación
              </a>
            </div>
            
            <p style="color: #555; font-size: 14px; margin-top: 20px;">Este enlace expirará en 7 días.</p>
          </div>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px; color: #555;">📩 EventosIA | Todos los derechos reservados.</p>
          </div>
        </div>
        `
    };
};
