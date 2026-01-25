/**
 * Middleware to check if the user is an admin.
 * Considers both the 'role' field and the 'Tadmin' username (case-insensitive).
 */
const isAdmin = (req, res, next) => {
    const userRole = req.session.role;
    const username = req.session.username;

    const isUserAdmin = userRole === 'admin' || (username && username.toLowerCase() === 'tadmin');

    if (!isUserAdmin) {
        console.warn('❌ Admin access denied for:', username, '(Role:', userRole + ')');
        return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }

    next();
};

module.exports = isAdmin;
