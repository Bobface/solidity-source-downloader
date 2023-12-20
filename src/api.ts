import { ContractSource } from './types'

export async function getContractSources(baseURL: string, address: string, apiKey: string): Promise<ContractSource[]> {
    let results: ContractSource[] = []
    let nextAddress = address
    for (let i = 1; ; i++) {
        const [fetchedSources, implementation] = await fetchContractSources(baseURL, nextAddress, apiKey)

        // No proxy, we're done
        if (implementation === null) {
            results = results.concat(fetchedSources)
            break
        }

        // Prefix the sources
        for (const source of fetchedSources) {
            source.sourcePath = `__proxy_${i}/${source.sourcePath}`
        }
        results = results.concat(fetchedSources)
        nextAddress = implementation
    }

    return results
}

async function fetchContractSources(
    baseURL: string,
    address: string,
    apiKey: string
): Promise<[ContractSource[], string | null]> {
    const url = `${baseURL}/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    let json
    try {
        const response = await fetch(url)
        json = await response.json()
    } catch (err: any) {
        throw new Error(`While fetching source code from API: ${err.message ? err.message : err}`)
    }

    if (json.status !== '1') throw new Error(`API response indicates failure: ${json.result}`)
    if (json.result.length === 0) throw new Error(`No source code found for ${address}`)
    if (json.result.length > 1) throw new Error(`Multiple source code matches found for ${address}`)

    // The `sourceCode` field is a bit weird:
    // It is either a normal string, in which case it contains the source code.
    // Or, it is a string that contains a JSON object.
    // The JSON object, however, is opened and closed with two brackets.
    // "{{ ... }}"
    // So we need to remove the outer brackets before we can parse it.
    const results = []
    if (!json.result[0].SourceCode.startsWith('{{')) {
        results.push({
            sourcePath: json.result[0].ContractName + '.sol',
            sourceCode: json.result[0].SourceCode,
        })
    } else {
        let sourceCodeObj
        try {
            sourceCodeObj = JSON.parse(json.result[0].SourceCode.slice(1, -1))
        } catch (err: any) {
            throw new Error(`While parsing source code object: ${err.message ? err.message : err}`)
        }

        if (!sourceCodeObj || typeof sourceCodeObj !== 'object') {
            throw new Error(`Unexpected source code object in API response: ${sourceCodeObj}`)
        }

        if (sourceCodeObj.language !== 'Solidity')
            throw new Error(`Contract is not written in Solidity: ${sourceCodeObj.language}`)

        for (const sourcePath of Object.keys(sourceCodeObj.sources)) {
            const sourceCode = sourceCodeObj.sources[sourcePath].content
            results.push({
                sourcePath,
                sourceCode,
            })
        }
    }

    // Check for proxy
    let implementation = null
    if (json.result[0].Proxy === '1') {
        implementation = json.result[0].Implementation
    }

    return [results, implementation]
}
