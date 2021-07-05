@browser
Feature: Certificate owner can accept or refuse event
  Background: 2 users with valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 buys 1 credit of type event

    Given user2 with account from randomKey
    Given user2 requests credits of POA and ARIA

  Scenario: Brand can create event and user2 can accept it
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    When user1 create a proof in certificate0 with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    When user1 creates an event0 on certificate0 as:
      """
       {
          "title": "hello world event",
          "$schema": "https://cert.arianee.org/version1/ArianeeEvent-i18n.json"
        }
      """
    Then user2 checks event0 status is 'pending' on certificate0
    Then user2 accepts event0
    Then user2 checks event0 status is 'accepted' on certificate0

  Scenario: Brand can create event and user2 can refuse it
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase
    When user1 create a proof in certificate0 with passphrase MyPassPhrase
    Given user2 requests certificate0 with passprase MyPassPhrase
    When user1 creates an event0 on certificate0 as:
      """
       {
          "title": "hello world event",
          "$schema": "https://cert.arianee.org/version1/ArianeeEvent-i18n.json"
        }
      """
    Then user2 refuses event0
    Then user2 checks event0 status is 'refused' on certificate0
