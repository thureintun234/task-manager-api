const express = require('express')
const router = new express.Router()
const sharp = require('sharp')
const multer = require('multer')
const auth = require('../middleware/auth')
const User = require('../models/user')

router.post('/', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
    await req.user.save()

    req.send()
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()

    res.send()
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get('/me', auth, async (req, res) => {
  res.send(req.user)
})



router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowUpdates = ['name', 'email', 'password', 'age']
  const isValideOperation = updates.every(update => allowUpdates.includes(update))

  if (!isValideOperation) {
    return res.status(400).send({ error: 'Invalide Updates' })
  }

  try {
    const user = req.user
    updates.forEach(update => user[update] = req.body[update])
    await user.save()
    res.send(user)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('please upload the image'))
    }
    cb(undefined, true)
  }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer

  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error('')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (error) {
    res.status(404).send()
  }
})

module.exports = router

