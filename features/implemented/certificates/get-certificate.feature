Feature: Certificate creation

  Background: User has a valid wallet
    Given user1 is a brand

  Scenario: User wants to read certificate
    Given user1 buys 1 credit of type creation
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    Given user1 want to see certificate0 details with passphrase MyPassPhrase

  Scenario: User wants to read all its certificates
    Given user1 buys 4 credit of type creation
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph"
    Given user1 creates a new certificate1 with uri "https://api.myjson.com/bins/cf4ph"
    Given user1 creates a new certificate2 with uri "https://api.myjson.com/bins/cf4ph"
    Given user1 creates a new certificate3 with uri "https://api.myjson.com/bins/cf4ph"
    Then user1 can see its 4 certificates from getMyCertificates


