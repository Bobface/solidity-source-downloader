import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import { getContractSources } from './api'
import { exportKeys, getKey, importKeys, listKeys, setKey } from './keys'
import networkToURL, { NETWORKS } from './networks'
import { ContractSource } from './types'

// =========================
// === KEY MANAGEMENT
// =========================

program
    .command('set-key')
    .description('Set an API key')
    .requiredOption('-k, --key <key>', 'API Key')
    .requiredOption('-n, --network <network>', 'Network')
    .action(({ key, network }) => {
        setKey(network, key)
    })

program
    .command('get-key')
    .description('Display an API key')
    .requiredOption('-n, --network <network>', 'Network')
    .action(({ network }) => {
        console.log(`${network}=${getKey(network)}`)
    })

program
    .command('list-keys')
    .description('List all API keys')
    .action(() => {
        listKeys()
    })

program
    .command('export-keys')
    .description('Export all API keys to a file')
    .requiredOption('-o, --output <output>', 'Output file')
    .action(({ output }) => {
        exportKeys(output)
    })

program
    .command('import-keys')
    .description('Import API keys from a file')
    .requiredOption('-i, --input <input>', 'Input file')
    .action(({ input }) => {
        importKeys(input)
    })

// =========================
// === NETWORK
// =========================

program
    .command('list-networks')
    .description('List all supported networks')
    .action(() => {
        for (const network of Object.keys(NETWORKS)) {
            console.log(`${NETWORKS[network].name}:`, network)
        }
    })

// =========================
// === MAIN
// =========================

program
    .command('get')
    .description('Download the source code for a contract')
    .requiredOption('-a, --address <address>', 'Contract address')
    .requiredOption('-o, --output <output>', 'Output directory')
    .option('-k, --key <key>', '(Optional) API Key. Uses stored key if not provided', '')
    .option('-n, --network <network>', '(Optional) Network', 'mainnet')
    .action(async ({ key, address, output, network }) => {
        try {
            await main(key, address, output, network)
        } catch (err: any) {
            console.error(`Error: ${err.message ? err.message : err}`)
        }
    })

try {
    program.parse(process.argv)
} catch (err: any) {
    console.error(`Error: ${err.message ? err.message : err}`)
}

async function main(cliKey: string, address: string, output: string, network: string) {
    // Check for valid Ethereum address
    if (!address.startsWith('0x')) address = `0x${address}`
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) throw new Error(`Address is not a valid Ethereum address: ${address}`)

    // Check for valid network
    const url = networkToURL(network.toLowerCase())

    // Get the key
    const key = cliKey !== '' ? cliKey : getKey(network)

    // Get the source code
    const files = await getContractSources(url!, address, key)

    // Write to disk
    writeFiles(files, output)
}

function writeFiles(files: ContractSource[], outputDir: string) {
    for (const file of files) {
        // Create the directory if it doesn't exist
        const dir = path.normalize(path.dirname(`${outputDir}/${file.sourcePath}`))
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

        // Write the file
        const filePath = path.normalize(`${outputDir}/${file.sourcePath}`)
        fs.writeFileSync(filePath, file.sourceCode)
    }
}
