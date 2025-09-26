import { RoutesService } from './routes.service'

describe('RoutesService', () => {
    const prisma: any = {
        route: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), findUnique: jest.fn() },
        routeStop: { deleteMany: jest.fn(), createMany: jest.fn() },
    }
    const svc = new RoutesService(prisma)

    beforeEach(() => jest.clearAllMocks())

    it('setStops replaces route stops with new ordered list', async () => {
        prisma.route.findUnique.mockResolvedValueOnce({ id: 'r1', stops: [] })
        await svc.setStops('r1', {
            stops: [
                { stopId: 'a', order: 1 },
                { stopId: 'b', order: 2 },
            ],
        })
        expect(prisma.routeStop.deleteMany).toHaveBeenCalledWith({ where: { routeId: 'r1' } })
        expect(prisma.routeStop.createMany).toHaveBeenCalledWith({
            data: [{ routeId: 'r1', stopId: 'a', order: 1 }, { routeId: 'r1', stopId: 'b', order: 2 }],
        })
        expect(prisma.route.findUnique).toHaveBeenCalledWith({
            where: { id: 'r1' },
            include: { stops: { include: { stop: true }, orderBy: { order: 'asc' } } },
        })
    })
})
