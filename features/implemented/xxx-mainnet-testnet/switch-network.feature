@browser
Feature: User can switch from testnet to mainnet

    Scenario: I can launch arianee in testnet
        Given arianee is on testnet

    Scenario: I can launch arianee in mainnet
        Given arianee is on mainnet


    Scenario: I can launch arianee in mainnet
        Given arianee is on arianeeTestnet

    # Mumbai was shut down by Polygon in April 2024 and
    # https://cert.arianee.net/contractAddresses/mumbai.json now answers 404, so
    # initialising on it fails on an undefined configuration. The network no
    # longer exists; the scenario cannot be made to pass and is removed rather
    # than left red.

    Scenario: I can launch arianee in polygon/matic testnet
        Given arianee is on polygon
