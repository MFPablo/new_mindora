import prisma from './db'

async function main() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
  } catch (e) {
    console.error('Failed to connect to the database (expected if no DB running):', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
