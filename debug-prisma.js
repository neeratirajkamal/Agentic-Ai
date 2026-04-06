const { PrismaClient } = require('@prisma/client');
try {
  const p = new PrismaClient({ datasourceUrl: 'file:./dev.db' });
  console.log('Success! Keys:', Object.keys(p));
} catch (e) {
  console.log('Final Error:', e.message);
}
