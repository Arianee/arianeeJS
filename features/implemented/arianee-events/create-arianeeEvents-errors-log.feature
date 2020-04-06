Feature: event creation error logs

  Scenario: User wants to create a event but has errors. He has proper error logs
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    When user1 creates an event0 with title 'hello world event' on certificate0 with proper errors
