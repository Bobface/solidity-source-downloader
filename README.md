Solidity Source Downloader
===

*This project is still quite new, if you run into bugs, please report them to get them fixed*.

### Quick Start
```
npm install -g solidity-source-downloader
sdl --help
```

### Description
`solidity-source-downloader` is a tool to download the Solidity source code for verified contracts from Etherscan-like APIs.

Given a contract address, the application will gather the source code and store it locally while retaining the original directory structure (given the contracts were verified this way). The built-in key management system enables you to only load your API keys into the application once. Keys can also be imported and exported, which can be handy when switching to a different machine.

### Usage
```
sdl --help
Usage: sdl [options] [command]

Options:
  -h, --help             display help for command

Commands:
  set-key [options]      Set an API key
  get-key [options]      Display an API key
  list-keys              List all API keys
  export-keys [options]  Export all API keys to a file
  import-keys [options]  Import API keys from a file
  list-networks          List all supported networks
  get [options]          Download the source code for a contract
  help [command]         display help for command

# To download the source code
sdl get -a 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 -o ~/WETH
```
