Feature: Certificate owner can accept or refuse event
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate

    Given user2 with account from randomKey
    Given user2 has positive credits of POA and ARIA

  Scenario: Brand can create event and user2 can accept it
    When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    When user1 create a proof in certificate0 with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    When user1 create an event0 with name EventArianeeCI
    Then user2 can accept event0
    Then event0 is not pending anymore

  Scenario: Brand can create event and user2 can refuse it
    When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    When user1 create a proof in certificate0 with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    When user1 create an event0 with name EventArianeeCI
    Then user2 can refuse event0
    Then event0 is destroyed