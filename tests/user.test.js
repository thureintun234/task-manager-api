const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setUpDatabase } = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'shadow',
    email: 'shadow@gmail.com',
    password: 'testing12345'
  }).expect(201)

  // Assertion that database change correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertion about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'shadow',
      email: 'shadow@gmail.com'
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('testing12345')
})

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  // Assertion from database user
  const user = await User.findById(userOneId)
  expect(response.body.token).toBe(user.tokens[1].token)
})


test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'shadow updated' })
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.name).toEqual('shadow updated')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ role: 'fighter' })
    .expect(400)
})




// test('Should not login nonexisting user', async () => {
//   await request(app).post('/users/login').send({
//     email: 'david@gmail.com',
//     password: 'thisisnotmypass'
//   }).expect(400)
// })

// test('Should not login nonexisting user', async () => {
//   await request(app).post('/users/login/me').send({
//     email: userOne.email,
//     password: 'somethingwrong123'
//   }).expect(404)
// })