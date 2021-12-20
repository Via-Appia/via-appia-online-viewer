// Script to run with node.js to transform the params to the new pair of camera position and target

const fs = require('fs')
const path = require('path')
const readdirp = require('readdirp')

// Use streams to achieve small RAM & CPU footprint.
// 1) Streams example with for-await.
async function read () {
  for await (const entry of readdirp('./content', { fileFilter: '*.md' })) {
    const { path: p } = entry
    editFile(p)
    console.log(p)
    // console.log(`${JSON.stringify({ path })}`)
  }
}
read()

// read the files recursivelly from the folder

// lastIndex containss the position for the new
function findIndex (dataArray, searchKeyword) {
  let lastIndex = -1
  dataArray.forEach((value, i) => { (value.includes(searchKeyword)) && (lastIndex = i) })
  return lastIndex
}

function editFile (p) {
  fs.readFile(path.resolve(__dirname, p), { encoding: 'utf-8' }, function (err, data) {
    if (err) { throw err }
    console.log('🎹  dataArray', data)
    const dataArray = data.split('\n') // convert file data in an array

    // get position and target
    const position = '[' + dataArray[findIndex(dataArray, 'cameraPosition')]?.split('[')[1]
    const target = '[' + dataArray[findIndex(dataArray, 'cameraTarget')]?.split('[')[1]

    // add the new values
    dataArray.splice(findIndex(dataArray, 'cameraPosition'), 0, ...[
      ['# Pair of camera points and targets: [final point], ... , [entrance point]'],
      ['cameraPath: ['],
      [`    [${position},${target}]`],
      [']']
    ])

    // delete cameraTarget
    dataArray.splice(findIndex(dataArray, 'cameraPosition'), 1)
    dataArray.splice(findIndex(dataArray, 'cameraTarget'), 1)

    // UPDATE FILE WITH NEW DATA
    const updatedData = dataArray.join('\n')
    fs.writeFile(path.resolve(__dirname, p), updatedData, (err) => {
      if (err) {
        throw err
      }
      console.log('Successfully updated the file data')
    })
  })
}
