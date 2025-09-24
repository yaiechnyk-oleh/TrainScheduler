import { StopsService } from './stops.service'

describe('StopsService', () => {
    const prisma: any = {
        stop: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    }
    const svc = new StopsService(prisma)

    beforeEach(() => jest.clearAllMocks())

    it('create passes Decimal for lat/lng when provided', async () => {
        await svc.create({ name: 'Kyiv', city: 'Kyiv', lat: 50.441, lng: 30.489 })
        expect(prisma.stop.create).toHaveBeenCalled()
        const arg = prisma.stop.create.mock.calls[0][0]
        expect(arg.data.name).toBe('Kyiv')
        expect(arg.data.lat).toBeDefined()
        expect(arg.data.lng).toBeDefined()
    })

    it('create without coords omits lat/lng', async () => {
        await svc.create({ name: 'Lviv' })
        const arg = prisma.stop.create.mock.calls[0][0]
        expect(arg.data).not.toHaveProperty('lat')
        expect(arg.data).not.toHaveProperty('lng')
    })

    it('update merges only provided fields', async () => {
        await svc.update('id1', { city: 'Dnipro' })
        expect(prisma.stop.update).toHaveBeenCalledWith({
            where: { id: 'id1' },
            data: expect.objectContaining({ city: 'Dnipro' }),
        })
    })
})
