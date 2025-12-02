import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Get all domains
    const domains = await prisma.domain.findMany();

    for (const domain of domains) {
        console.log(`Seeding channels for domain: ${domain.domainName}`);

        // Create 'general' channel
        await prisma.channel.upsert({
            where: {
                // Since we don't have a unique constraint on name+domainId yet (we should, but for now just create if not exists)
                // Actually upsert requires a unique constraint. Let's use findFirst then create.
                id: 'placeholder-uuid' // This won't match, so it would try to create. But upsert needs a unique field.
            },
            update: {},
            create: {
                name: 'general',
                description: 'General discussion',
                type: 'PUBLIC',
                domainId: domain.id,
            },
        }).catch(async () => {
            // Fallback if upsert fails or logic needs to be simpler
            const existing = await prisma.channel.findFirst({
                where: { name: 'general', domainId: domain.id }
            });
            if (!existing) {
                await prisma.channel.create({
                    data: {
                        name: 'general',
                        description: 'General discussion',
                        type: 'PUBLIC',
                        domainId: domain.id,
                    }
                });
                console.log(`Created #general for ${domain.domainName}`);
            } else {
                console.log(`#general already exists for ${domain.domainName}`);
            }
        });

        // Create 'random' channel
        const existingRandom = await prisma.channel.findFirst({
            where: { name: 'random', domainId: domain.id }
        });
        if (!existingRandom) {
            await prisma.channel.create({
                data: {
                    name: 'random',
                    description: 'Random chatter',
                    type: 'PUBLIC',
                    domainId: domain.id,
                }
            });
            console.log(`Created #random for ${domain.domainName}`);
        } else {
            console.log(`#random already exists for ${domain.domainName}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
