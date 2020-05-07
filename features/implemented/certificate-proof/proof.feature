Feature: Create and read certificate proof
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate

    Given user2 with account from randomKey
    Given user2 requests credits of POA and ARIA

    Scenario: Owner can create a proof that can be check by user2
      When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase MyPassPhrase
      Then user2 can check the proof in certificate0 with passphrase MyPassPhrase

    Scenario: Proof should be invalid if user1 do not create proof
      When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
      Then user2 cannot check the proof in certificate0 with passphrase MyPassPhrase

    Scenario: Proof should be invalid if user2's passphrase is invalid
      When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase MyPassPhrase
      Then user2 cannot check the proof in certificate0 with passphrase invalidPassphrase

    Scenario: Proof should be invalid if owner change
      When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase Test
      Given user1 makes certificate0 transferable with passphrase MyPassPhrase
      Given user2 requests certificate0 with passprase MyPassPhrase
      Then user2 cannot check the proof in certificate0 with passphrase MyPassPhrase

    Scenario: Proof should be valid if another user create a proof on another certificate
      Given user3 is a brand
      Given user1 buys 1 credit of type certificate
      Given user3 buys 1 credit of type certificate
      And user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
      And user3 creates a new certificate1 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
      When user1 create a proof in certificate0 with passphrase MyPassPhrase1
      When user3 create a proof in certificate1 with passphrase MyPassPhrase2
      Then user2 can check the proof in certificate0 with passphrase MyPassPhrase1

      @dev
  Scenario: Owner can create actionProofLink
        Given user1 creates certificate0 as:
      """
       {
         "$schema": "https://cert.arianee.org/version1/ArianeeAsset.json",
          "name": "Arianee",
        "description":"a description"
        }
      """
    Given  user1 can call wallet method 'createActionProofLink'
      | url             | http://myurl.com |
      | certificateId   | certificate0     |
      | passphrase      | myPassphrase     |
