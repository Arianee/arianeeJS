@dev
Feature: Certificate update

  Background: User has a valid wallet
    Given user1 is a brand
    Given user1 buys 1 credit of type certificate
    Given user1 buys 1 credit of type update
    Given user1 has credit of type certificate balance of 1
    Given user1 has credit of type update balance of 1

  Scenario: User wants to create and store a certificate
    Given user1 createsAndStores certificate0
    And user1 fetch certificate0 summary
    Then certificate0 imprint should be '0xf1ea38b9e5c15a2fe1cf763889f0ab06716419eb2e4e467c17ad10d77e194189'

    When user1 updates certificate0
    And user1 fetch certificate0 summary
    Then certificate0 imprint should be '0xbaf9960c3e1289b45b835215f97cde1c297e310e1ad5309969a1090303ff197f'

