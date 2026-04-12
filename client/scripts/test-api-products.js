const http = require('http');

http.get('http://localhost:3000/api/products', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:');
    try {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch(e) {
        console.log(data);
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
