Feature: Authorized users can get certificate's arianee events.
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate

    Given user2 with account from randomKey
    Given user2 requests credits of POA and ARIA

  Scenario: Brand can create event and user2 can read it with passphrase
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    When user1 create a proof in certificate0 with passphrase MyPassPhrase
    When user1 create an event with name EventArianeeCI
    Then user2 can read events in certificate0 with passphrase MyPassPhrase

  Scenario: Brand can create event and user2 can read it as owner
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    Given user1 makes certificate0 transferable with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    When user1 create an event with name EventArianeeCI
    Then user2 can read events in certificate0

  Scenario: Brand can create multiple events and user2 can get them ordered by blocknumber
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    Given user1 makes certificate0 transferable with passphrase MyPassPhrase
    Given user1 create an event with name EventArianeeCI1
    Given user1 create an event with name EventArianeeCI2
    Then user2 can read events in certificate0 in order
