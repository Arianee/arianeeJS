@browser
Feature: Certificate creation error logs

  Scenario: User wants to create a certificate but has no credit,not approved store. He has proper error logs
    Given user1 is a brand
    When user1 creates a new certificate0 with expected errors
