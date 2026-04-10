import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const emails = [
    'importer4@gmail.com',
    'important4@gmail.com',
    'Importer6@gmail.com',
    'importer6@gmail.com',
    'testfresh@gmail.com',
    'freshtest99@gmail.com',
    'importerc@gmail.com'
  ]

  for (const email of emails) {
    try {
      await p.user.deleteMany({ where: { email } })
      await p.$executeRaw`DELETE FROM auth.users WHERE email = ${email} OR email = ${email.toLowerCase()}`
      console.log('Deleted:', email)
    } catch(e) {
      console.log('Error deleting', email, e.message)
    }
  }
}

main().finally(() => p.$disconnect())
