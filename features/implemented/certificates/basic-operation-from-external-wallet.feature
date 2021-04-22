@dev
Feature: external wallet basic operation
  Background: User has a valid wallet
    Given user1 with account from externalWallet
    Given user1 claims faucet
    Given user1 claims Aria
    Then user1 approves storeContract
    Given user1 buys 1 credit of type certificate
    Given user2 with account from externalWallet
    Given user3 with account from fromRandomMnemonic

  Scenario: A brand creates a certificate, user1 is the owner and transfert its certificate to user2
    Given user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1"
    Given user1 makes certificate0 transferable with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase

  Scenario: Owner of certificate creates Arianee Proof Token. User can see certificate
    And user1 createsAndStores certificate0
    And user1 creates Arianee Access Token from certificate0
    And user2 get certificate with Arianee Access Token with parameters:
          """
         {
          "content": "true"
          }
        """
    And user3 get certificate with Arianee Access Token with parameters:
          """
         {
          "content": "true"
          }
        """
    Then result should have property
      | owner             | false |
      | content           | true |
      | content.data      | true |
