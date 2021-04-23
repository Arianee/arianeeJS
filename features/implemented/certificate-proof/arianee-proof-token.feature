Feature: Arianee JWT

  Background: Brand has a valid wallet
    Given user1 is a brand

  Scenario: Owner of certificate creates Arianee Proof Token. User can see certificate
    Given user1 buys 1 credit of type certificate
    And user1 createsAndStores certificate0
    When user2 with account from randomKey
    And user1 creates Arianee Access Token from certificate0
    And user2 get certificate with Arianee Access Token with parameters:
          """
         {
          "content": "true"
          }
        """
    Then result should have property
      | owner             | false |
      | content           | true |
      | content.data      | true |

  Scenario: Not owner of certificate creates Arianee Proof Token. User cannot see certificate
    Given user1 buys 1 credit of type certificate
    And user2 with account from randomKey
    And user3 with account from randomKey
    And user1 createsAndStores certificate0
    Given user1 makes certificate0 transferable with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    Then user2 is the owner of the certificate0
    And user1 creates Arianee Access Token from certificate0
    And user3 get certificate with Arianee Access Token with parameters:
          """
         {
          "content": "true"
          }
        """
    Then result should have property
      | content      | false  |
      | content.data | false  |
