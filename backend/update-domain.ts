
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const domain = await prisma.domain.update({
        where: { domainName: 'tsrcnc.com' },
        data: {
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date()
        },
    });
    console.log('Updated domain:', domain);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
