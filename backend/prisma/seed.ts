import { PrismaClient, Prisma, Role, TrainType, ScheduleStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
    const adminPass = await bcrypt.hash('Admin123!', 10)
    const userPass  = await bcrypt.hash('User123!', 10)

    const [, user] = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {},
            create: { email: 'admin@example.com', password: adminPass, role: Role.ADMIN },
        }),
        prisma.user.upsert({
            where: { email: 'user@example.com' },
            update: {},
            create: { email: 'user@example.com', password: userPass, role: Role.USER },
        }),
    ])

    const kyiv = await prisma.stop.upsert({
        where: { name_city: { name: 'Kyiv-Pasazhyrskyi', city: 'Kyiv' } },
        update: {},
        create: { name: 'Kyiv-Pasazhyrskyi', city: 'Kyiv', lat: new Prisma.Decimal(50.441), lng: new Prisma.Decimal(30.489) },
    })
    const fastiv = await prisma.stop.upsert({
        where: { name_city: { name: 'Fastiv', city: 'Kyiv Oblast' } },
        update: {},
        create: { name: 'Fastiv', city: 'Kyiv Oblast', lat: new Prisma.Decimal(50.076), lng: new Prisma.Decimal(29.915) },
    })
    const lviv = await prisma.stop.upsert({
        where: { name_city: { name: 'Lviv', city: 'Lviv' } },
        update: {},
        create: { name: 'Lviv', city: 'Lviv', lat: new Prisma.Decimal(49.839), lng: new Prisma.Decimal(24.029) },
    })

    const route = await prisma.route.upsert({
        where: { name: 'Kyiv → Lviv (fast line)' },
        update: {},
        create: { name: 'Kyiv → Lviv (fast line)', code: 'IC-721' },
    })

    await prisma.routeStop.createMany({
        data: [
            { routeId: route.id, stopId: kyiv.id, order: 1, minutesFromStart: 0 },
            { routeId: route.id, stopId: fastiv.id, order: 2, minutesFromStart: 45 },
            { routeId: route.id, stopId: lviv.id, order: 3, minutesFromStart: 310 },
        ],
        skipDuplicates: true,
    })

    const now = new Date()
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0)
    const a1 = new Date(d1.getTime() + 310 * 60000)
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 17, 30)
    const a2 = new Date(d2.getTime() + 310 * 60000)

    await prisma.schedule.createMany({
        data: [
            { routeId: route.id, trainType: TrainType.INTERCITY, departAt: d1, arriveAt: a1, status: ScheduleStatus.ON_TIME, delayMinutes: 0 },
            { routeId: route.id, trainType: TrainType.INTERCITY, departAt: d2, arriveAt: a2, status: ScheduleStatus.ON_TIME, delayMinutes: 0 },
        ],
        skipDuplicates: true,
    })

    await prisma.favorite.upsert({
        where: { userId_routeId: { userId: user.id, routeId: route.id } },
        update: {},
        create: { userId: user.id, routeId: route.id },
    })

    console.log('✅ Seed complete. Admin: admin@example.com / Admin123!  User: user@example.com / User123!')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
