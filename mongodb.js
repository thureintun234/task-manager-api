const { MongoClient, ObjectId } = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id = new ObjectId()
// console.log(id.id.length);
// console.log(id.getTimestamp());

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    return console.log('Unable to connect to database');
  }
  const db = client.db(databaseName)

  db.collection('users').deleteMany({ age: 21 })
    .then(result => console.log('deleted'))
    .catch(err => console.log(err))

  // const updatePromise = db.collection('users').updateOne(
  //   {
  //     _id: new ObjectId('6129966ddc03c756b16bbe94')
  //   },
  //   {
  //     $set: {
  //       name: 'ThureinUpdated'
  //     }
  //   }
  // )
  // updatePromise.then(result => {
  //   console.log('Updated successfully');
  // }).catch(err => {
  //   console.log(err);
  // })


  // db.collection('users').findOne({ _id: new ObjectId('6129a11c3655fb91ccc18bea') }, (err, user) => {
  //   if (err) console.log('Unable to find');
  //   console.log(user);
  // })
  // db.collection('users').find({ age: 21 }).toArray((err, users) => {
  //   console.log(users);
  // })
})

