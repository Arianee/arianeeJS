@browser
Feature: Destroy a certificate

  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase

  Scenario: Brand creates a certificates and destroy it
    Given user1 destroys certificate0
    And user1 is not the owner of the certificate0


