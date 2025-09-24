import { SchedulesService } from './schedules.service'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import { BadRequestException } from '@nestjs/common'

describe('SchedulesService', () => {
    const prisma: any = {
        $transaction: jest.fn(async (ops: Promise<any>[]) => Promise.all(ops)),
        schedule: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
        },
    }
    const rt: any = { emitScheduleChanged: jest.fn() }
    const svc = new SchedulesService(prisma, rt as unknown as RealtimeGateway)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('lists by day with pagination and returns total', async () => {
        prisma.schedule.findMany.mockResolvedValueOnce([{ id: 's1' }])
        prisma.schedule.count.mockResolvedValueOnce(7)

        const out = await svc.list('2025-09-24', undefined, undefined, 2, 3)

        // verify it called findMany/count with correct range & paging
        const findArgs = prisma.schedule.findMany.mock.calls[0][0]
        const countArgs = prisma.schedule.count.mock.calls[0][0]

        expect(findArgs.where.departAt.gte).toBeInstanceOf(Date)
        expect(findArgs.where.departAt.lt).toBeInstanceOf(Date)
        expect(findArgs.skip).toBe(3)  // (page 2 - 1) * 3
        expect(findArgs.take).toBe(3)

        expect(countArgs.where.departAt.gte).toBeInstanceOf(Date)
        expect(out).toEqual({ items: [{ id: 's1' }], total: 7, page: 2, pageSize: 3 })
    })

    it('emits on create/update/delete', async () => {
        prisma.schedule.create.mockResolvedValueOnce({ id: 'new' })
        await svc.create({
            routeId: 'r1',
            trainType: 'INTERCITY',
            departAt: '2025-09-24T08:00:00.000Z',
            arriveAt: '2025-09-24T09:00:00.000Z',
            status: 'ON_TIME',
            delayMinutes: 0,
        } as any)
        expect(rt.emitScheduleChanged).toHaveBeenCalledWith({ type: 'CREATED', scheduleId: 'new' })

        prisma.schedule.update.mockResolvedValueOnce({ id: 'new' })
        await svc.update('new', { status: 'DELAYED', delayMinutes: 5 } as any)
        expect(rt.emitScheduleChanged).toHaveBeenCalledWith({ type: 'UPDATED', scheduleId: 'new' })

        prisma.schedule.delete.mockResolvedValueOnce({ id: 'new' })
        await svc.remove('new')
        expect(rt.emitScheduleChanged).toHaveBeenCalledWith({ type: 'DELETED', scheduleId: 'new' })
    })

    it('guards arriveAt > departAt on create', async () => {
        await expect(svc.create({
            routeId: 'r1',
            trainType: 'INTERCITY',
            departAt: '2025-09-24T10:00:00.000Z',
            arriveAt: '2025-09-24T09:00:00.000Z',
        } as any)).rejects.toBeInstanceOf(BadRequestException)
    })

    it('guards arriveAt > departAt on update with partial payload', async () => {
        prisma.schedule.findUnique.mockResolvedValueOnce({
            id: 's1',
            departAt: new Date('2025-09-24T10:00:00.000Z'),
            arriveAt: new Date('2025-09-24T12:00:00.000Z'),
        })
        await expect(svc.update('s1', { arriveAt: '2025-09-24T09:59:59.000Z' } as any))
            .rejects.toBeInstanceOf(BadRequestException)
    })
})
