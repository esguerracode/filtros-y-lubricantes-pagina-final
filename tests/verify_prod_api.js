import https from 'https';

const data = JSON.stringify({
    items: [{ id: 110, quantity: 1 }],
    customer: {
        fullName: "Test User",
        email: "test@example.com",
        phoneNumber: "3001234567",
        address: "Calle 123",
        city: "Bogota",
        department: "Bogota"
    }
});

const options = {
    hostname: 'www.filtrosylubricantes.co',
    port: 443,
    path: '/api/orders/create',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
