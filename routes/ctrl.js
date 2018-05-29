module.exports = function (app, routes) {
    //app.post('/uploadImg',routes.uploadImg);
    //app.get('/getopenid',routes.getopenid);
    app.post('/service/:sql',routes.servicedo);
    app.get('/upload',routes.upload);
    app.get('/uploadsuccess',routes.uploadsuccess);
    app.get('/uploadfail',routes.uploadfail);
    app.post('/upload/uploaddo',routes.uploaddo);

    app.get('/_upload',routes._upload);
    app.get('/_uploadsuccess',routes._uploadsuccess);
    app.post('/_uploaddo',routes._uploaddo);

    app.post('/customs/page/uploaddo2',routes.uploaddo2);
    app.post('/customs/page/uploaddo3',routes.uploaddo3);

    app.get('/scan',routes.scan_js);

};