import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

describe('API e2e', () => {
  let app: INestApplication
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })
  afterAll(async () => { await app.close() })

  it('login as admin, create schedule, list public', async () => {
    const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'Admin123!' })
        .expect(201)
    const token = login.body.access_token

    const routes = await request(app.getHttpServer()).get('/routes').expect(200)
    const routeId = routes.body[0].id

    const d = new Date(); d.setDate(d.getDate() + 2)
    const depart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0).toISOString()
    const arrive = new Date(new Date(depart).getTime() + 3 * 60 * 60 * 1000).toISOString()

    await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${token}`)
        .send({ routeId, trainType: 'INTERCITY', departAt: depart, arriveAt: arrive, status: 'ON_TIME' })
        .expect(201)

    const qDate = depart.slice(0,10)
    const list = await request(app.getHttpServer()).get(`/schedules?date=${qDate}`).expect(200)
    expect(list.body.items.length).toBeGreaterThan(0)
  })
})
