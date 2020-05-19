
@dev
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
