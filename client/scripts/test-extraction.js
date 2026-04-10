const result = {"body":{"session":{"user":{"id":"123"}}}};

const error = result.error || result.body?.error;
const session = result.session || result.body?.session;
const userId = session?.user?.id || result?.user?.id || result?.body?.user?.id;

console.log('error:', error);
console.log('session:', session);
console.log('userId:', userId);
