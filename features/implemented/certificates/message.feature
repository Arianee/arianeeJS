@browser
Feature: Message authorization
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user2 with account from randomKey

  Scenario: A brand creates a certificate, user1 is the owner and transfert its certificate to user2
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1"
    Given user1 makes certificate0 transferable with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase

    Given user2 switch certificate0 issuer message authorization to 'true'
    Given user2 certificate0 issuer message authorization should be 'true'
    Given user2 switch certificate0 issuer message authorization to 'false'
    Given user2 certificate0 issuer message authorization should be 'false'
