Feature: Certificate creation
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type creation
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase

  Scenario: User wants to read certificate
    Given user1 want to see certificate0 details with passphrase MyPassPhrase




