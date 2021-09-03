const add = (a, b) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (a < 0 || b < 0) {
        return reject('Numbers must be positive')
      }
      resolve(a + b)
    }, 2000);
  })
}

const doWork = async () => {
  const result = await add(2, 3)
  const result2 = await add(result, 3)
  const result3 = await add(result2, -3)
  return result3
}

doWork()
  .then(result => {
    console.log('result:', result)
  })
  .catch(err => {
    console.log('error:', err)
  })