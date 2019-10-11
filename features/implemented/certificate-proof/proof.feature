Feature: Create and read certificate proof
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type creation

    Given user2 with account from randomKey
    Given user2 has positive credits of POA and ARIA

    Scenario: Owner can create a proof
      When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase Test
      Then user2 can check read the proof in certificate0 with passphrase Test