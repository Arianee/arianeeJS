
Feature: Send message
  Background: User has a valid wallet
    Given user1 is a brand
    And user1 buys 1 credit of type certificate
    And user1 buys 1 credit of type message
    And user1 creates certificate0 as:
      """
       {
         "$schema": "https://cert.arianee.org/version1/ArianeeAsset.json",
          "name": "Arianee",
        "description":"a description"
        }
      """


  Scenario: Brand can send a message
    When user1 send a message0 on certificate0 as:
      """
       {
          "title": "title",
          "$schema": "https://cert.arianee.org/version1/ArianeeMessage-i18nAlpha.json"
        }
      """
    Then result should have property
      | messageId      | true |
      | result         | true |
    Then user1 is the owner of the certificate0


  Scenario: Brand2 can send a message after whitelist
    Given user2 is a brand
    When user1 whitelist user2 for certificate0
    And user2 buys 1 credit of type message
    When user2 send a message0 on certificate0 as:
      """
       {
          "title": "title",
          "$schema": "https://cert.arianee.org/version1/ArianeeMessage-i18nAlpha.json"
        }
      """
    Then result should have property
      | messageId      | true |
      | result         | true |

  Scenario: User wants to create a message with an message Id already used
    Then user1 try to create 2 message with the same message id on certficate0
