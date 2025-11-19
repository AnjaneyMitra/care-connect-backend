import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create a Parent User
    const parentEmail = 'parent@example.com';
    const parent = await prisma.users.upsert({
        where: { email: parentEmail },
        update: {},
        create: {
            email: parentEmail,
            password_hash: 'dummy_hash', // In real app, this would be hashed
            role: 'parent',
            is_verified: true,
            profiles: {
                create: {
                    first_name: 'John',
                    last_name: 'Doe',
                    phone: '1234567890',
                    address: '123 Main St',
                },
            },
        },
    });
    console.log({ parent });

    // Create a Nanny User
    const nannyEmail = 'nanny@example.com';
    const nanny = await prisma.users.upsert({
        where: { email: nannyEmail },
        update: {},
        create: {
            email: nannyEmail,
            password_hash: 'dummy_hash',
            role: 'nanny',
            is_verified: true,
            profiles: {
                create: {
                    first_name: 'Mary',
                    last_name: 'Poppins',
                    phone: '0987654321',
                    address: '456 Cherry Tree Lane',
                },
            },
            nanny_details: {
                create: {
                    skills: ['First Aid', 'Cooking'],
                    experience_years: 5,
                    hourly_rate: 20.0,
                    bio: 'Experienced nanny who loves kids.',
                    availability_schedule: {
                        monday: ['09:00-17:00'],
                        tuesday: ['09:00-17:00'],
                    },
                },
            },
        },
    });
    console.log({ nanny });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
