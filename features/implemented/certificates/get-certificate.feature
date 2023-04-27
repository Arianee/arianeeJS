@browser
Feature: Certificate creation

  Background: User has a valid wallet
    Given user1 is a brand

  Scenario: User wants to read certificate
    Given user1 buys 1 credit of type certificate
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    Given user1 sees certificate0 details with passphrase MyPassPhrase with params:
        """
         {
          "owner": "true"
          }
        """
    Then result should have property
      | owner             | true |
      | owner.address     | true |
      | owner.publicKey   | true |

  Scenario: User wants to read certificate from Link
    Given user1 buys 1 credit of type certificate
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    Given user1 want to see certificate0 details from link with passphrase MyPassPhrase

  Scenario: User wants to read all its certificates
    Given user1 buys 4 credit of type certificate
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1"
    Given user1 creates a new certificate1 with uri "https://jsonplaceholder.typicode.com/todos/1"
    Given user1 creates a new certificate2 with uri "https://jsonplaceholder.typicode.com/todos/1"
    Given user1 requests credits of POA and ARIA
    Given user1 creates a new certificate3 with uri "https://jsonplaceholder.typicode.com/todos/1"

    Then user1 can see its 4 certificates from getMyCertificates
    #Then user1 can make different request on certificate0

