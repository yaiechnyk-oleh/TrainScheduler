import { FavoritesService } from './favorites.service'

describe('FavoritesService', () => {
    const prisma: any = {
        favorite: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    }
    const svc = new FavoritesService(prisma)

    beforeEach(() => jest.clearAllMocks())

    it('list forwards to prisma with userId', async () => {
        await svc.list('u1')
        expect(prisma.favorite.findMany).toHaveBeenCalledWith({ where: { userId: 'u1' }, include: { route: true } })
    })

    it('add and remove forward to prisma with composite id', async () => {
        await svc.add('u1', 'r1')
        expect(prisma.favorite.create).toHaveBeenCalledWith({ data: { userId: 'u1', routeId: 'r1' } })

        await svc.remove('u1', 'r1')
        expect(prisma.favorite.delete).toHaveBeenCalledWith({ where: { userId_routeId: { userId: 'u1', routeId: 'r1' } } })
    })
})
