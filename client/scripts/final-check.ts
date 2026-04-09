import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'importer5@gmail.com'
  console.log('Final Diagnostic for: ' + email)
  
  try {
    const authUsers: any[] = await prisma.$queryRaw`
      SELECT id, email, email_verified, disabled, created_at 
      FROM auth.users 
      WHERE email = ${email}
    `
    console.log('Results:', JSON.stringify(authUsers, null, 2))
  } catch (error) {
    console.error('FAILED:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
