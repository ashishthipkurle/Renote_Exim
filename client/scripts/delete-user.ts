import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'importer5@gmail.com'
  
  // Delete from public.users first (foreign key constraints)
  try {
    const pubResult = await prisma.user.deleteMany({ where: { email } })
    console.log('Deleted from public.users:', pubResult.count)
  } catch (e: any) {
    console.log('No public profile to delete:', e.message)
  }

  // Delete from auth.users
  const authResult = await prisma.$executeRaw`
    DELETE FROM auth.users WHERE email = ${email}
  `
  console.log('Deleted from auth.users:', authResult)
  
  console.log('\nDONE. User can now register fresh at /login -> Sign Up')
}

main().catch(console.error).finally(() => prisma.$disconnect())
