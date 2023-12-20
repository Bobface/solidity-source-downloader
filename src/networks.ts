import { INetwork } from './types'

export const NETWORKS: { [short: string]: INetwork } = {
    mainnet: {
        name: 'Ethereum Mainnet',
        url: 'https://api.etherscan.io',
    },
    bsc: {
        name: 'Binance Smart Chain',
        url: 'https://api.bscscan.com',
    },
    fantom: {
        name: 'Fantom Opera',
        url: 'https://api.ftmscan.com',
    },
    optimism: {
        name: 'Optimism',
        url: 'https://api-optimistic.etherscan.io',
    },
    polygon: {
        name: 'Polygon',
        url: 'https://api.polygonscan.com',
    },
    arbitrum: {
        name: 'Arbitrum',
        url: 'https://api.arbiscan.io',
    },
    avalanche: {
        name: 'Avalanche',
        url: 'https://api.snowtrace.io/api',
    },
}

export function isValidNetwork(network: string): boolean {
    return network in NETWORKS
}

export default function networkToURL(network: string): string {
    if (!isValidNetwork(network)) throw new Error(`Invalid network: ${network}`)
    return NETWORKS[network].url
}
