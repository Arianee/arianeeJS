Feature: Create events
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 buys 1 credit of type event

  Scenario: Brand can create and store event
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    When user1 createsAndStores an event0 with title 'hello world event' on certificate0
