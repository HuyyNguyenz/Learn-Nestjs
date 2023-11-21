import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    )
    await app.init()
    await app.listen(process.env.PORT)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl(`http://localhost:${process.env.PORT}`)
  })
  afterAll(() => {
    app.close()
  })
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'nguyenhuydz3@gmail.com',
      password: 'Huyz31052001@'
    }
    describe('Sign up', () => {
      it('should sign up', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201).inspect()
      })
      it('should throw if email empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ password: dto.password }).expectStatus(400)
      })
      it('should throw if password empty', () => {
        return pactum.spec().post('/auth/signup').withBody({ email: dto.email }).expectStatus(400)
      })
      it('should throw if body empty', () => {
        return pactum.spec().post('/auth/signup').withBody({}).expectStatus(400)
      })
    })
    describe('Login', () => {
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('user_access_token', 'result.access_token')
      })
      it('should throw if email empty', () => {
        return pactum.spec().post('/auth/login').withBody({ password: dto.password }).expectStatus(400)
      })
      it('should throw if password empty', () => {
        return pactum.spec().post('/auth/login').withBody({ email: dto.email }).expectStatus(400)
      })
      it('should throw if body empty', () => {
        return pactum.spec().post('/auth/login').withBody({}).expectStatus(400)
      })
    })
  })
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{user_access_token}' })
          .expectStatus(200)
          .inspect()
      })
    })
    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          first_name: 'Huyz',
          last_name: 'Nguyễn'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{user_access_token}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.first_name)
          .expectBodyContains(dto.last_name)
      })
    })
  })
})
