@browser
Feature: Certificate creation
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 has credit of type certificate balance of 1

  Scenario: User wants to create a certificate with uri
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1"
    Then user1 is the owner of the certificate0
    And user1 is the owner of the certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1"

  Scenario: User wants to create a certificate with content
    When user1 creates certificate0 as:
      """
       {
         "$schema": "https://cert.arianee.org/version1/ArianeeAsset.json",
          "name": "Arianee",
        "description":"a description"
        }
      """
    Then result should have property
      | certificateId  | true |
      | passphrase     | true |
      | deepLink       | true |
    Then user1 is the owner of the certificate0

  Scenario: User wants to create and store a certificate
    When user1 createsAndStores certificate0
    Then user1 is the owner of the certificate0
    Given user1 want to see certificate0 details

  Scenario: User wants to create a certificate but has no credit,not approved store. He has proper error logs
    Given user2 is a brand
    When user2 creates a new certificate0 with expected errors


  Scenario: User wants to create a certificate with a token already used
    Then user1 tries to create 2 certificates with the same certificateId

    @dev
  Scenario: User wnat to create a certificate with a reserved certificateId
    Given user1 reserve a certificateId1
    Then user1 create a certificate with certificateId1
