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

#     Scenario: from created random mnemonic
#         Given a created random mnemonic
#         When I try to recover my wallet
#         Then I get a wallet