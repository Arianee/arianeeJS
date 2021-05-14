@dev
Feature: Certificate update

  Background: User has a valid wallet
    Given user1 is a brand
    Given user2 with account from randomKey
    Given user1 buys 1 credit of type certificate

  Scenario: User wants to create and store a certificate
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1"
    When user1 transfers certificate0 to user2
    Then user2 is the owner of the certificate0
