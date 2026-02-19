import http from 'http';

const USERNAMES = ['filtrosy', 'filtros', 'lubrican', 'startu', 'admin', 'filtrosylubricantes'];

USERNAMES.forEach(user => {
    const options = {
        hostname: '69.6.233.239',
        port: 80,
        path: `/\~${user}/wp-json/`,
        method: 'HEAD',
        timeout: 3000
    };

    const req = http.request(options, (res) => {
        console.log(`User: ~${user} -> STATUS: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log(`✅ FOUND: http://69.6.233.239/~${user}`);
        }
    });

    req.on('error', (e) => {
        // console.error(`problem with ~${user}: ${e.message}`);
    });
    req.end();
});
