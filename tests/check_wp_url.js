
import https from 'https';

const url = 'https://api.filtrosylubricantes.co/wp-json';

console.log(`Checking ${url}...`);

https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
        process.stdout.write(d);
    });

}).on('error', (e) => {
    console.error(e);
});
