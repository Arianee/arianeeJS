@browser
Feature: Create events
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 buys 1 credit of type event
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase

  Scenario: Brand can create and store event
    When user1 createsAndStores an event0 on certificate0 as:
      """
       {
          "title": "title",
          "$schema": "https://cert.arianee.org/version1/ArianeeEvent-i18n.json"
        }
      """

  Scenario: User wants to create an event with an arianeeEventID already used
    Then user1 try to create 2 events with the same eventId on certficate0
