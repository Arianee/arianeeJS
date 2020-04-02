Feature: Certificate creation
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 has credit of type certificate balance of 1

  Scenario: User wants to create a certificate
    When user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph"
    Then user1 is the owner of the certificate0
    And user1 is the owner of the certificate0 with uri "https://api.myjson.com/bins/cf4ph"

  Scenario: User wants to create and store a certificate
    When user1 createsAndStores certificate0
    Then user1 is the owner of the certificate0
    Given user1 want to see certificate0 details

  Scenario: User wants to create a certificate but has no credit,not approved store. He has proper error logs
    Given user2 is a brand
    When user2 creates a new certificate0 with expected errors
