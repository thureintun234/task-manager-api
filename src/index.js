const express = require('express')
require('dotenv').config()
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
})
