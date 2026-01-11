import prisma from './lib/prisma.js';

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    }
  });
  console.log('✅ Utilisateur créé:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());