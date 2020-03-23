@dev
Feature: User can set or unset its certificate as lost and

  Background: User has a wallet
    Given user1 is a brand
    And user1 buys 1 credit of type certificate
    And user1 has credit of type certificate balance of 1

    Given user2 with account from randomKey


  Scenario: User set its certificate as lost then retrieves it
    Given user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph"
    Then user2 can see certificate0 lost status is false
    When user1 looses certificate0
    Then user2 can see certificate0 lost status is true

    And user1 retrieves certificate0
    Then user2 can see certificate0 lost status is false
