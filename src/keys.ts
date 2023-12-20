import fs from 'fs'
import os from 'os'
import path from 'path'
import { isValidNetwork } from './networks'

export function setKey(network: string, key: string) {
    if (!isValidNetwork(network)) {
        throw new Error(`Unsupported network: ${network}`)
    }

    const lines = getLines().filter((line) => !line.startsWith(network))
    lines.push(`${network}=${key}`)
    fs.writeFileSync(getFilePath(), lines.join('\n'))
}

export function getKey(network: string): string {
    if (!isValidNetwork(network)) {
        throw new Error(`Unsupported network: ${network}`)
    }

    const lines = getLines()
    for (const line of lines) {
        if (line.startsWith(network)) {
            return line.split('=')[1]
        }
    }

    throw new Error(`No API key found for network ${network}`)
}

export function listKeys() {
    for (const line of getLines()) {
        console.log(line)
    }
}

export function exportKeys(output: string) {
    const filename = path.basename(output)
    const dir = path.normalize(path.dirname(output))

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.normalize(`${dir}/${filename}`), getLines().join('\n'))
}

export function importKeys(input: string) {
    const file = path.normalize(input)
    if (!fs.existsSync(file)) {
        throw new Error(`File does not exist: ${file}`)
    }

    const lines = fs
        .readFileSync(file)
        .toString()
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .filter((line) => {
            const network = line.split('=')[0]
            if (!isValidNetwork(network)) {
                console.warn(`WARN: Skipping invalid network: ${network}`)
                return false
            }
            return true
        })

    fs.writeFileSync(getFilePath(), lines.join('\n'))
}

function getLines(): string[] {
    const file = getFilePath()
    if (!fs.existsSync(file)) return []

    return fs
        .readFileSync(file)
        .toString()
        .split('\n')
        .filter((line) => line.trim().length > 0)
}

function getFilePath() {
    const homeDir = os.homedir()
    let appDataDir

    switch (os.platform()) {
        case 'win32': // Windows
            appDataDir = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming')
            break
        case 'darwin': // macOS
            appDataDir = path.join(homeDir, 'Library', 'Application Support')
            break
        default: // Linux and others
            appDataDir = process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share')
            break
    }

    // Create the directory if it doesn't exist
    const dir = path.join(appDataDir, 'solidity-source-downloader')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    return path.join(dir, 'keys.txt')
}
