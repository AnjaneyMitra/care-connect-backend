import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create a Parent User with location in Mumbai
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
                    first_name: 'Rajesh',
                    last_name: 'Sharma',
                    phone: '+919876543210',
                    address: 'Bandra West, Mumbai, Maharashtra 400050',
                    lat: 19.0596, // Bandra, Mumbai coordinates
                    lng: 72.8295,
                },
            },
        },
    });
    console.log({ parent });

    // Create a Nanny User with location in Mumbai
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
                    first_name: 'Priya',
                    last_name: 'Patel',
                    phone: '+919123456789',
                    address: 'Andheri East, Mumbai, Maharashtra 400069',
                    lat: 19.1136, // Andheri, Mumbai coordinates
                    lng: 72.8697,
                },
            },
            nanny_details: {
                create: {
                    skills: ['First Aid', 'Cooking', 'Hindi', 'English'],
                    experience_years: 5,
                    hourly_rate: 300.0, // INR per hour
                    bio: 'Experienced nanny with 5 years of childcare experience. Fluent in Hindi and English.',
                    availability_schedule: {
                        monday: ['09:00-17:00'],
                        tuesday: ['09:00-17:00'],
                        wednesday: ['09:00-17:00'],
                        thursday: ['09:00-17:00'],
                        friday: ['09:00-17:00'],
                    },
                },
            },
        },
    });
    console.log({ nanny });

    // Create another nanny in Mumbai for testing nearby searches
    const nanny2Email = 'nanny2@example.com';
    const nanny2 = await prisma.users.upsert({
        where: { email: nanny2Email },
        update: {},
        create: {
            email: nanny2Email,
            password_hash: 'dummy_hash',
            role: 'nanny',
            is_verified: true,
            profiles: {
                create: {
                    first_name: 'Sunita',
                    last_name: 'Desai',
                    phone: '+919988776655',
                    address: 'Powai, Mumbai, Maharashtra 400076',
                    lat: 19.1197, // Powai, Mumbai coordinates
                    lng: 72.9059,
                },
            },
            nanny_details: {
                create: {
                    skills: ['Music', 'Art', 'Swimming', 'Marathi', 'English'],
                    experience_years: 3,
                    hourly_rate: 250.0, // INR per hour
                    bio: 'Creative nanny with background in arts and music. Great with toddlers.',
                    availability_schedule: {
                        monday: ['10:00-18:00'],
                        wednesday: ['10:00-18:00'],
                        friday: ['10:00-18:00'],
                        saturday: ['09:00-13:00'],
                    },
                },
            },
        },
    });
    console.log({ nanny2 });

    // Create a nanny in Bangalore for testing
    const nanny3Email = 'nanny3@example.com';
    const nanny3 = await prisma.users.upsert({
        where: { email: nanny3Email },
        update: {},
        create: {
            email: nanny3Email,
            password_hash: 'dummy_hash',
            role: 'nanny',
            is_verified: true,
            profiles: {
                create: {
                    first_name: 'Lakshmi',
                    last_name: 'Reddy',
                    phone: '+918899776655',
                    address: 'Koramangala, Bangalore, Karnataka 560034',
                    lat: 12.9352, // Koramangala, Bangalore coordinates
                    lng: 77.6245,
                },
            },
            nanny_details: {
                create: {
                    skills: ['First Aid', 'Cooking', 'Kannada', 'English', 'Tamil'],
                    experience_years: 7,
                    hourly_rate: 350.0, // INR per hour
                    bio: 'Highly experienced nanny with excellent references. Specialized in infant care.',
                    availability_schedule: {
                        monday: ['08:00-16:00'],
                        tuesday: ['08:00-16:00'],
                        wednesday: ['08:00-16:00'],
                        thursday: ['08:00-16:00'],
                        friday: ['08:00-16:00'],
                    },
                },
            },
        },
    });
    console.log({ nanny3 });

    // Create sample jobs with location data in Mumbai
    const job1 = await prisma.jobs.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {
            description: 'Need a babysitter for Saturday evening. Two kids aged 3 and 5.',
            location_lat: 19.0760, // Juhu, Mumbai
            location_lng: 72.8263,
        },
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            parent_id: parent.id,
            title: 'Weekend Babysitting',
            description: 'Need a babysitter for Saturday evening. Two kids aged 3 and 5.',
            date: new Date('2025-12-01'),
            time: new Date('2025-12-01T18:00:00'),
            location_lat: 19.0760, // Juhu, Mumbai
            location_lng: 72.8263,
            status: 'open',
        },
    });
    console.log({ job1 });

    const job2 = await prisma.jobs.upsert({
        where: { id: '00000000-0000-0000-0000-000000000002' },
        update: {
            description: 'Looking for after school care for 2 kids. Pick up from school and help with homework.',
            location_lat: 19.0330, // Lower Parel, Mumbai
            location_lng: 72.8326,
        },
        create: {
            id: '00000000-0000-0000-0000-000000000002',
            parent_id: parent.id,
            title: 'After School Care',
            description: 'Looking for after school care for 2 kids. Pick up from school and help with homework.',
            date: new Date('2025-12-05'),
            time: new Date('2025-12-05T15:00:00'),
            location_lat: 19.0330, // Lower Parel, Mumbai
            location_lng: 72.8326,
            status: 'open',
        },
    });
    console.log({ job2 });

    const job3 = await prisma.jobs.upsert({
        where: { id: '00000000-0000-0000-0000-000000000003' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000003',
            parent_id: parent.id,
            title: 'Full Day Nanny Required',
            description: 'Need a full-time nanny for infant care. Monday to Friday.',
            date: new Date('2025-12-10'),
            time: new Date('2025-12-10T09:00:00'),
            location_lat: 19.1075, // Goregaon, Mumbai
            location_lng: 72.8479,
            status: 'open',
        },
    });
    console.log({ job3 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
