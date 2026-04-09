import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'importer5@gmail.com'
  
  // Step 1: Set email_verified = true in auth.users
  const result = await prisma.$executeRaw`
    UPDATE auth.users SET email_verified = true WHERE email = ${email}
  `
  console.log('Rows updated in auth.users:', result)

  // Step 2: Check the auth user to get the ID
  const authUsers: any[] = await prisma.$queryRaw`
    SELECT id, email, email_verified FROM auth.users WHERE email = ${email}
  `
  console.log('Auth user:', JSON.stringify(authUsers, null, 2))

  if (authUsers.length === 0) {
    console.log('No auth user found!')
    return
  }

  const userId = authUsers[0].id

  // Step 3: Ensure public profile exists
  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) {
    await prisma.user.create({
      data: {
        id: userId,
        email: email,
        role: 'IMPORTER',
        name: 'Ashish',
        verificationStatus: 'PENDING',
      }
    })
    console.log('Created public profile')
  } else {
    console.log('Public profile already exists:', existing.email)
  }

  console.log('DONE - user can now log in')
}

main().catch(console.error).finally(() => prisma.$disconnect())
