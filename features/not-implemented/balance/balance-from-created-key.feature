Feature: Retrieve balance
  Background: User has a just wallet
    Given user1 with account from randomKey
    And user1 has a valid wallet

  Scenario: User can access its balance
    Then user1 has aria balance of 0
    Then user1 has poa balance of 0

  Scenario: User can access its balance and is positive
    When user1 claims faucet
    Then user1 has postive poa balance
