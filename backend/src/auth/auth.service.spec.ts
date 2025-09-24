import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
    hash: jest.fn(async (s: string) => `hashed:${s}`),
    compare: jest.fn(async () => true),
}))

describe('AuthService', () => {
    const users: any = {
        findByEmail: jest.fn(),
        create: jest.fn(),
    }
    const jwt: any = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    }
    const prisma: any = {
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        user: {
            findUniqueOrThrow: jest.fn(),
        },
    }

    const svc = new AuthService(users, jwt, prisma)

    beforeEach(() => jest.clearAllMocks())

    it('register rejects duplicate email', async () => {
        users.findByEmail.mockResolvedValueOnce({ id: 'u1' })
        await expect(svc.register('dup@example.com', 'pw')).rejects.toBeDefined()
    })

    it('register returns tokens and stores refresh hash', async () => {
        users.findByEmail.mockResolvedValueOnce(null)
        users.create.mockResolvedValueOnce({ id: 'u1', role: 'USER' })
        jwt.signAsync
            .mockResolvedValueOnce('access-token')
            .mockResolvedValueOnce('refresh-token')
        const out = await svc.register('new@example.com', 'pw')
        expect(out.access_token).toBe('access-token')
        expect(out.refresh_token).toBe('refresh-token')
        expect(prisma.refreshToken.create).toHaveBeenCalled()
    })

    it('login returns tokens', async () => {
        users.findByEmail.mockResolvedValueOnce({ id: 'u1', role: 'USER', password: 'hashed:pw' })
        jwt.signAsync
            .mockResolvedValueOnce('a')
            .mockResolvedValueOnce('r')
        const out = await svc.login('user@example.com', 'pw')
        expect(out).toEqual({ access_token: 'a', refresh_token: 'r' })
    })

    it('refresh rotates and revokes old', async () => {
        jwt.verifyAsync.mockResolvedValueOnce({ sub: 'u1', jti: 'j1' })
        prisma.refreshToken.findUnique.mockResolvedValueOnce({ jti: 'j1', userId: 'u1', tokenHash: 'hashed:old', revoked: false })
        prisma.user.findUniqueOrThrow.mockResolvedValueOnce({ id: 'u1', role: 'USER' })
        jwt.signAsync
            .mockResolvedValueOnce('new-access')
            .mockResolvedValueOnce('new-refresh')
        const out = await svc.refresh('old-refresh')
        expect(prisma.refreshToken.update).toHaveBeenCalledWith({ where: { jti: 'j1' }, data: { revoked: true } })
        expect(out.access_token).toBe('new-access')
        expect(out.refresh_token).toBe('new-refresh')
    })

    it('logout revokes the presented refresh token', async () => {
        jwt.verifyAsync.mockResolvedValueOnce({ sub: 'u1', jti: 'j9' })
        prisma.refreshToken.findUnique.mockResolvedValueOnce({ jti: 'j9', userId: 'u1', tokenHash: 'hashed:x', revoked: false })
        const out = await svc.logout('rt')
        expect(prisma.refreshToken.update).toHaveBeenCalledWith({ where: { jti: 'j9' }, data: { revoked: true } })
        expect(out).toEqual({ success: true })
    })
})
