@dev
Feature: Send message
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 buys 1 credit of type message
    When user1 creates a new certificate0 with uri "https://jsonplaceholder.typicode.com/todos/1" and passphrase MyPassPhrase


  Scenario: Brand can send a message
    When user1 send a message0 on certificate0 as:
      """
       {
          "title": "title",
          "$schema": "https://cert.arianee.org/version1/ArianeeMessage-i18nAlpha.json"
        }
      """
