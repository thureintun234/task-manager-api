const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

router.get('/', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip) || 0,
        sort
      }
    })
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('Task not found')
    }
    res.send(task)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.patch('/:id', auth, async (req, res) => {
  const _id = req.params.id
  const updates = Object.keys(req.body)
  const allowUpdates = ['describtion', 'completed']
  const isValideOperation = updates.every(update => allowUpdates.includes(update))

  if (!isValideOperation) {
    return res.status(400).send('Invalid Updates')
  }

  try {
    // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
    // const task = await Task.findById(_id)
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('Task not found')
    }

    updates.forEach(update => task[update] = req.body[update])
    await task.save()

    res.send(task)
  } catch (error) {
    res.status(400).send(error.message)
  }
})


router.delete('/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id)
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('Task not found')
    }
    res.send(task)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router