export const mailOptions = (email, resetURL) => ({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔒 Recuperación de Contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #333;">🔒 Recuperación de Contraseña</h2>
        <p>Hola, has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para continuar:</p>
        <a href="${resetURL}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          🔗 Restablecer Contraseña
        </a>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <br>
        <p style="font-size: 12px; color: #777;">Este enlace expirará en 15 minutos.</p>
      </div>
    `,
  });
  