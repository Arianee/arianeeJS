Feature: Fetch certificates

  Background: User has a valid wallet
    Given user1 with account from randomKey

  Scenario: User wants to read certificate
    Given user1 want to see certificateId '1' with passphrase 'cert1passphrase'
      | content  | true     |
      | issuer   | true     |

    Then certificateId '1' 'identity' imprint should be "0xd9f02f9cb05bc7e2767bb956fa0372fcc7a6c88e392ae2c1ea9205b5bcb11048"
    Then certificateId '1' 'content' imprint should be "0xae90a2dc738cd1b969cb304066de5afa72d6270ce722f250262874f0c443531b"


  Scenario: User wants to read certificate with waitingIdentity
    Given user1 want to see certificateId '1' with passphrase 'cert1passphrase'
      | content  | true                         |
      | issuer   | {"waitingIdentity":true}     |

    Then certificateId '1' 'identity' imprint should be "0x31bd6f933aa9260509f4dced76f3410872f220e828c05d7f009a8796bff1ac05"
    Then certificateId '1' 'content' imprint should be "0xae90a2dc738cd1b969cb304066de5afa72d6270ce722f250262874f0c443531b"


  Scenario: User wants to read certificate with only a waitingIdentity
    Given user1 want to see certificateId '2' with passphrase 'cert2passphrase;,'
      | content  | true     |
      | issuer   | {"waitingIdentity":true}     |

    Then certificateId '2' 'identity' imprint should be "0x31bd6f933aa9260509f4dced76f3410872f220e828c05d7f009a8796bff1ac05"
    Then certificateId '2' 'content' imprint should be "0x709538f26ebead4e007abe8415e66b29becd7276c5df042c76af5246580dec38"
