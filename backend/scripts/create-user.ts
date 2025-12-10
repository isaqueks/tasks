import * as bcrypt from 'bcrypt';

async function createUserHash() {
  const password = process.argv[2] || 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('\nHash da senha gerado:');
  console.log(hash);
  console.log('\nUse este hash no SQL:');
  console.log(`
INSERT INTO users (id, name, email, password, "createdAt")
VALUES (
  gen_random_uuid(),
  'Seu Nome',
  'seu@email.com',
  '${hash}',
  NOW()
);
  `);
}

createUserHash().catch(console.error);

