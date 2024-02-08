import type { NextApiRequest, NextApiResponse } from 'next'
type Authenticator = {
    // SQL: Encode to base64url then store as `TEXT`. Index this column
    credentialID: Uint8Array;
    // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
    // credentialPublicKey: Uint8Array;
    // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
    // counter: number;
    // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
    // Ex: 'singleDevice' | 'multiDevice'
    //credentialDeviceType: CredentialDeviceType;
    // SQL: `BOOL` or whatever similar type is supported
    credentialBackedUp: boolean;
    // SQL: `VARCHAR(255)` and store string array as a CSV string
    // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
    transports?: AuthenticatorTransport[];
};
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';

type ResponseData = {
    message: string
}

export default async function handler(
    req: any,
    res: NextApiResponse
) {
    const {body} = req;
    let verification;
    let expectedChallenge = "challenge";
    const origin =  (process.env.NODE_ENV==="production")?'https://alantick.vercel.app':'http://localhost:3000/';
    const rpID = (process.env.NODE_ENV==="production")?'alantick.vercel.app':'localhost';
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
    } catch (error:any) {
        console.error(error);
        return res.status(400).send({ error: error.message });
    }

    const { verified } = verification;
    res.status(200).json(verified)
}