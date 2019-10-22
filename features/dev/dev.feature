Feature: Certificate creation

  Scenario: User wants to read all its certificates groupby issue
    Given user1 is a brand

    Given user2 is a brand
    Given user3 is a brand

    Given user4 with account from randomKey
    And user4 has a valid wallet

    Given user1 buys 2 credit of type creation
    And user1 creates a new certificate0 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    And user4 requests certificate0 with passprase MyPassPhrase

    Given user1 creates a new certificate1 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    And user4 requests certificate1 with passprase MyPassPhrase

    Given user2 buys 1 credit of type creation
    And user2 creates a new certificate2 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    And user4 requests certificate2 with passprase MyPassPhrase

    Given user3 buys 1 credit of type creation
    And user3 creates a new certificate2 with uri "https://api.myjson.com/bins/cf4ph" and passphrase MyPassPhrase
    And user4 requests certificate2 with passprase MyPassPhrase

    Then user4 can see its 4 certificates and 3 brands from groupByIssuerCertificates
