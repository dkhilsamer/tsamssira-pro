const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
    // Configuration explicite pour Gmail (plus fiable sur Render)
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true pour 465, false pour les autres ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        // Debug settings
        logger: true,
        debug: true,
        connectionTimeout: 20000, // 20 seconds
        greetingTimeout: 20000,
        socketTimeout: 20000
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

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
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

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
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

    await transporter.sendMail(mailOptions);
    console.log('New message notification sent to:', userEmail);
};

// Email de notification de demande de location
const sendRentalRequestNotification = async (ownerEmail, visitorName, visitorEmail, visitorPhone, propertyTitle, message) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Tsamssira Pro" <${process.env.EMAIL_USER}>`,
        to: ownerEmail,
        subject: `🔔 Nouvelle demande pour ${propertyTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
                <div style="background: white; padding: 40px; border-radius: 10px;">
                    <h2 style="color: #0f172a;">🔔 Nouvelle demande reçue</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                        Vous avez reçu une demande pour votre bien <strong>${propertyTitle}</strong>.
                    </p>
                    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Nom:</strong> ${visitorName}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${visitorEmail}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Téléphone:</strong> ${visitorPhone}</p>
                        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 15px 0;">
                        <p style="margin: 0;"><strong>Message:</strong></p>
                        <p style="margin-top: 5px; color: #334155;">${message}</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                           style="background: #0f172a; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Accéder au tableau de bord
                        </a>
                    </div>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log('Rental request notification sent to:', ownerEmail);
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendNewMessageNotification,
    sendRentalRequestNotification
};
