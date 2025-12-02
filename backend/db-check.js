const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
const prisma = new PrismaClient();

async function checkDomain() {
    try {
        const domain = await prisma.domain.findUnique({
            where: { domainName: 'tsrcnceducators.in' }
        });
        console.log('Domain Record:', domain);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDomain();
