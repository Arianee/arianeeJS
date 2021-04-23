Feature: Create a certificate with parent certificate and fetch the right content
  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 4 credit of type certificate

  Scenario: User wants to create a certificate with content
    Given user1 creates and stores certificate0 with parent certificate
    When user1 fetch certificate0 summary
    Then certificate0 'content.data' should contains:
      """
         {
           "$schema": "https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json",
           "name":"john",
           "title": "mon titre"
          }
        """
