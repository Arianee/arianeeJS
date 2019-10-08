Feature: Certificate creation
  Background: User has a valid wallet
    Given user1 with valid wallet and aria and faucet
    Given user1 buys credit

  Scenario: User wants to create a certificate
    When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph"
    Then user1 is the owner of the certificate0
    And user1 is the owner of the certificate0 with uri "https://api.myjson.com/bins/cf4ph"
