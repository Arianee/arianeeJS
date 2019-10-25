Feature: Create and read certificate proof
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate

    Given user2 with account from randomKey
    Given user2 has positive credits of POA and ARIA

    Scenario: Owner can create a proof that can be check by user2
      When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase MyPassPhrase
      Then user2 can check the proof in certificate0 with passphrase MyPassPhrase

    Scenario: Proof should be invalid if user1 do not create proof
      When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
      Then user2 cannot check the proof in certificate0 with passphrase MyPassPhrase

    Scenario: Proof should be invalid if user2's passphrase is invalid
      When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase MyPassPhrase
      Then user2 cannot check the proof in certificate0 with passphrase invalidPassphrase

    Scenario: Proof should be invalid if owner change
      When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase Test
      Given user1 makes certificate0 transferable with passphrase MyPassPhrase
      Given user2 requests certificate0 with passprase MyPassPhrase
      Then user2 cannot check the proof in certificate0 with passphrase MyPassPhrase