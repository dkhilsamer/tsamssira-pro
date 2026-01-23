const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
    // Pour Gmail ou service SMTP
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Votre email
            pass: process.env.EMAIL_PASSWORD // Mot de passe d'application
        }
    });
};

// Email de bienvenue
const sendWelcomeEmail = async (userEmail, username) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Tsamssira Pro" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '🏡 Bienvenue sur Tsamssira Pro !',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
                <div style="background: #0f172a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #d4af37; margin: 0;">Tsamssira Pro</h1>
                </div>
                <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #0f172a;">Bonjour ${username} 👋</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                        Merci de rejoindre <strong>Tsamssira Pro</strong>, votre plateforme de confiance pour l'immobilier de luxe en Tunisie.
                    </p>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                        Vous pouvez désormais :
                    </p>
                    <ul style="color: #64748b; font-size: 16px; line-height: 1.8;">
                        <li>Publier vos annonces immobilières</li>
                        <li>Contacter des vendeurs et acheteurs</li>
                        <li>Booster vos biens pour plus de visibilité</li>
                    </ul>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                           style="background: #d4af37; color: #0f172a; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Accéder à mon tableau de bord
                        </a>
                    </div>
                </div>
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 14px;">
                    © ${new Date().getFullYear()} Tsamssira Pro. Tous droits réservés.
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// Email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (userEmail, resetToken) => {
    const transporter = createTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"Tsamssira Pro" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '🔐 Réinitialisation de votre mot de passe',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
                <div style="background: white; padding: 40px; border-radius: 10px;">
                    <h2 style="color: #0f172a;">Réinitialiser votre mot de passe</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                        Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background: #0f172a; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Réinitialiser mon mot de passe
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px;">
                        Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending reset email:', error);
    }
};

// Email de notification de nouveau message
const sendNewMessageNotification = async (userEmail, senderName, propertyTitle) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Tsamssira Pro" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '💬 Nouveau message reçu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
                <div style="background: white; padding: 40px; border-radius: 10px;">
                    <h2 style="color: #0f172a;">📨 Vous avez un nouveau message !</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                        <strong>${senderName}</strong> vous a envoyé un message concernant votre bien :
                    </p>
                    <p style="background: #f1f5f9; padding: 15px; border-left: 4px solid #d4af37; margin: 20px 0;">
                        ${propertyTitle}
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" 
                           style="background: #d4af37; color: #0f172a; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Voir le message
                        </a>
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('New message notification sent to:', userEmail);
    } catch (error) {
        console.error('Error sending message notification:', error);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendNewMessageNotification
};
