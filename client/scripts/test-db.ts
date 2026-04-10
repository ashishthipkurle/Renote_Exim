import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing database connection...')
  try {
    const userCount = await prisma.user.count()
    console.log('Successfully connected to database!')
    console.log(`Current user count in Nhost: ${userCount}`)
  } catch (error) {
    console.error('Failed to connect to database:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
