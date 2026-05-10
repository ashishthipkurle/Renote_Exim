const http = require('http');

http.get('http://localhost:3000/api/products/5a8b5105-cc59-4f17-a6fb-b319a7f77d07', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
