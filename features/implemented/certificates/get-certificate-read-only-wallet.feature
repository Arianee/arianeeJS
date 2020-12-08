Feature: Get certificate with read only wallet

  Scenario: User wants to read certificate
    Given user1 is a brand
    Given user2 with account from readOnlyWallet
    Given user1 buys 1 credit of type certificate
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    Given user2 sees certificate0 details with passphrase MyPassPhrase with params:
        """
         {
          "owner": "true"
          }
        """
    Then result should have property
      | owner             | true |
      | owner.address     | true |
      | owner.publicKey   | true |

