export interface hydrateTokenParameters {
  uri?: string;
  hash?: string;
  certificateId?: number;
  passphrase?: string;
  encryptedInitialKey?: string;
  tokenRecoveryTimestamp?: number | number;
  sameRequestOwnershipPassphrase?: boolean;
  content?: { $schema: string;[key: string]: any };
}
