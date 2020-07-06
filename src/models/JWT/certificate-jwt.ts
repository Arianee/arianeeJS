import { ArianeeTokenId } from '../ArianeeTokenId';
import { NETWORK } from '../networkConfiguration';

export interface CertificateJwt{
    sub: string;
    subId: ArianeeTokenId;
    iss: string;
    scope: string | string[];
    exp: number,
    iat: number,
    chain: NETWORK
}
