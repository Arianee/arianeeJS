Feature: I create a random key to create a wallet

    Scenario: from random key
        Given user1 with account from randomKey
        Given user1 has a valid wallet
        Given user1 claims faucet
        When user1 claims Aria
        Then user1 approves storeContract
        Then storeContract is approved for user1

    Scenario: from external wallet
        Given user1 with account from externalWallet
        Given user1 has a valid wallet
        Given user1 claims faucet
        Given user1 has postive poa balance
        Then user1 approves storeContract
        Then storeContract is approved for user1
