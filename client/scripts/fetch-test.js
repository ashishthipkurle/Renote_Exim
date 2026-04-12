fetch('http://localhost:3000/api/products')
  .then(res => res.json())
  .then(data => console.log('DATA:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('ERROR:', err));
