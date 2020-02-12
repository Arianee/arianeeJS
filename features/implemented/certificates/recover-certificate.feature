Feature: Recover a certificate

  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase

    Given user2 with account from randomKey
    Given user2 has positive credits of POA and ARIA
    When user2 requests certificate0 with passprase MyPassPhrase
    Then user2 is the owner of the certificate0 with uri "https://api.myjson.com/bins/cf4ph"

  Scenario: Brand creates a certificates and recovers it
    Given user1 recovers certificate0
    Then user2 is not the owner of the certificate0
    And user1 is the owner of the certificate0
