const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const outputFile = path.join(__dirname, 'dist', 'index.js')
const shebang = '#!/usr/bin/env node\n'

exec('tsc --outDir ./dist', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error during compilation: ${error.message}`)
        return
    }
    if (stderr) {
        console.error(`Error: ${stderr}`)
        return
    }

    const script = fs.readFileSync(outputFile, 'utf8')
    fs.writeFileSync(outputFile, shebang + script)
})
