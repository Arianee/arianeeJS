Feature: Request token with Secret
  Background: 2 users with valid wallet
    Given user2 requests created certificate0 with passphrase MyPassPhrase
    Given user1 with account from randomKey
    Then user1 has a valid wallet
    When user1 claims faucet
    Then user1 has postive poa balance
    Given user1 can approve storeContract
    Given user1 claims Aria
    Then user1 has postive Aria balance
    Given user1 buys credit

    Given user2 with account from randomKey
    Then user2 has a valid wallet
    When user2 claims faucet
    Then user2 has postive poa balance
    Given user2 can approve storeContract
    Given user2 claims Aria
    Then user2 has postive Aria balance
    Given user2 buys credit

  Scenario: User can request token with Secret
    When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    And user2 requests created certificate0 with passphrase MyPassPhrase
    Then user2 is the owner of the certificate0 with uri "https://api.myjson.com/bins/cf4ph"