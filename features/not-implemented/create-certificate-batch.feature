Feature: Certificate creation
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 5 credit of type certificate

  Scenario: User wants to create a certificate
    When user1 creates 5 new certificate in batch
    Then user1 certificates balance is 5
