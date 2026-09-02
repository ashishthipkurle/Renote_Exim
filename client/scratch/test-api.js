async function test() {
  try {
    // Test GET
    const res = await fetch('http://localhost:3000/api/exporter/showcase');
    const status = res.status;
    const text = await res.text();
    console.log(`GET /api/exporter/showcase -> ${status}`);
    console.log('Response:', text.substring(0, 500));
    
    // Test public GET
    const res2 = await fetch('http://localhost:3000/api/public/showcase');
    console.log(`\nGET /api/public/showcase -> ${res2.status}`);
    const text2 = await res2.text();
    console.log('Response:', text2.substring(0, 500));
  } catch (e) {
    console.error('FETCH FAILED:', e.message);
  }
}
test();
