import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const emails = ['exporter@gmail.com', 'Importer13@gmail.com']
  
  for (const email of emails) {
    console.log(`\n--- Checking: ${email} ---`)
    
    // Check public.users (Profile)
    const publicUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log('Public Profile (Prisma):', publicUser ? 'EXISTS' : 'NOT FOUND')
    if (publicUser) console.log('Public ID:', publicUser.id)

    // Check auth.users (Credentials)
    try {
      const authUsers: any[] = await prisma.$queryRawUnsafe(
        `SELECT id, email, email_verified, disabled FROM auth.users WHERE email = $1`,
        email
      )
      if (authUsers.length > 0) {
        console.log('Auth Credentials (Nhost): EXISTS')
        console.log('Auth ID:', authUsers[0].id)
        console.log('Verified:', authUsers[0].email_verified)
      } else {
        console.log('Auth Credentials (Nhost): NOT FOUND')
      }
    } catch (e: any) {
      console.log('Error checking auth.users schema:', e.message)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
