module.exports.isLoggedIn = (req, res, next) => {
    console.log('Req.user: ', req.user);
    console.log(req.originalUrl);
    req.session.returnTo = req.originalUrl;
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to do that.')
        return res.redirect('/login');
    }
    next();
}
