Feature: I can recover my account from different technics

    Scenario: from valid privatekey
        Given user1 with account from privateKey 0x2C5A27D1E703BF7896197BCCB516D57E1EA3C969E2668DC475D6698872808694
        Then user1 has a valid wallet

    Scenario: from random key
        Given user1 with account from randomKey
        Then user1 has a valid wallet

    Scenario: from passphrase
        Given user1 with account from fromPassPhrase MYSUPERPASSPHRASE
        Then user1 has a valid wallet

    Scenario: from created random mnemonic
        Given user1 with account from fromRandomMnemonic
        Then user1 has a valid wallet
        Then user1 can retrieve its mnemonic

    Scenario: from read only wallet
        Given user1 with account from readOnlyWallet
        Then user1 has a valid wallet

    Scenario: from mnemonic
        Given user1 with account from mnemonic 'that crowd shallow message swear outdoor certain decline ski stock wheel proof'
        Then user1 has a valid wallet
        Then user1 can retrieve its mnemonic



    Scenario: from external wallet
        Given user1 with account from externalWallet
        Then user1 has a valid wallet
        Then user1 can retrieve its mnemonic
