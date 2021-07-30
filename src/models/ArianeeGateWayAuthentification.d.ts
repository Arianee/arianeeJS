export interface ArianeeGateWayAuthentificationProof{
    hash?: any,
    signature: any,
    message: any
}

export interface ArianeeGateWayAuthentificationArianeeJWT{
    bearer: string,
    jwt?:string // legacy
}

export type ArianeeGateWayAuthentification=ArianeeGateWayAuthentificationProof | ArianeeGateWayAuthentificationArianeeJWT;
