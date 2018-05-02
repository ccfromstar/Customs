module.exports = function (app, routes) {
    app.post('/uploadImg',routes.uploadImg);
    app.get('/getopenid',routes.getopenid);
};