Feature: Request token with Secret
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type creation

    Given user2 with account from randomKey
    Given user2 has positive credits of POA and ARIA

  Scenario: User can request token with Secret
    When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    When user2 requests certificate0 with passprase MyPassPhrase
    Then user2 is the owner of the certificate0 with uri "https://api.myjson.com/bins/cf4ph"

  Scenario: A brand creates a certificate, user1 is the owner and transfert its certificate to user2
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph"
    Given user1 makes certificate0 transferable with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    Then user2 is the owner of the certificate0

  Scenario: A brand creates a certificate, user1 is the owner and transfert its certificate to user2
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph"
    Given user1 makes certificate0 transferable without passphrase
    Given user2 requests certificate0 with the link
    Then user2 is the owner of the certificate0
