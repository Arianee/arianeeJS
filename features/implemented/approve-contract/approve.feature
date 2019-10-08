Feature: I create a random key to create a wallet

    Scenario: from random key
        Given user1 with account from randomKey
        Given user1 has a valid wallet
        Given user1 claims faucet
        Given user1 has postive poa balance
        Then user1 can approve storeContract