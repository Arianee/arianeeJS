Feature: Retrieve balance
  Background: User has a valid wallet
    Given user1 with account from privateKey 0x2C5A27D1E703BF7896197BCCB516D57E1EA3C969E2668DC475D6698872808694
    And user1 has a valid wallet


  Scenario: User can access its balance
    Then user1 has aria balance of 8000

