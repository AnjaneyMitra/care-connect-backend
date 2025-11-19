import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Create a Parent User
    const parent = await prisma.users.create({
        data: {
            email: 'parent@example.com',
            password_hash: 'hashed_password_123', // In real app, use bcrypt
            role: 'parent',
            is_verified: true,
            profiles: {
                create: {
                    first_name: 'Alice',
                    last_name: 'Parent',
                    phone: '1234567890',
                    address: '123 Maple St, Springfield',
                    lat: 40.7128,
                    lng: -74.0060,
                },
            },
        },
    });

    console.log({ parent });

    // 2. Create a Nanny User
    const nanny = await prisma.users.create({
        data: {
            email: 'nanny@example.com',
            password_hash: 'hashed_password_456',
            role: 'nanny',
            is_verified: true,
            profiles: {
                create: {
                    first_name: 'Mary',
                    last_name: 'Poppins',
                    phone: '0987654321',
                    address: '456 Oak Ave, Springfield',
                    lat: 40.7138,
                    lng: -74.0070,
                },
            },
            nanny_details: {
                create: {
                    skills: ['CPR', 'First Aid', 'Cooking'],
                    experience_years: 5,
                    hourly_rate: 25.00,
                    bio: 'Experienced nanny who loves kids and outdoor activities.',
                    availability_schedule: {
                        monday: ['09:00-17:00'],
                        wednesday: ['09:00-17:00'],
                        friday: ['09:00-17:00'],
                    },
                },
            },
        },
    });

    console.log({ nanny });

    // 3. Create a Job posted by the Parent
    const job = await prisma.jobs.create({
        data: {
            parent_id: parent.id,
            title: 'Babysitter needed for Saturday night',
            description: 'Looking for a reliable sitter for our 2 kids (ages 4 and 6).',
            date: new Date('2023-12-01T00:00:00Z'),
            time: new Date('1970-01-01T18:00:00Z'),
            location_lat: 40.7128,
            location_lng: -74.0060,
            status: 'open',
        },
    });

    console.log({ job });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
