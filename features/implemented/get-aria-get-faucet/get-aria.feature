Feature: On testnet user can have free aria or free faucet

Background: User has a wallet
    Given user1 with account from randomKey
    And user1 has a valid wallet
    
    Scenario: User claims Aria
        When user1 claims Aria
        Then user1 has postive Aria balance
    
    Scenario: User claims POA (get faucet)
        When user1 claims faucet
        Then user1 has postive poa balance