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
    const {address} = req.query
    const user = {
        id: address,
        username: address,
        currentChallenge: "challenge"
    }
    const userAuthenticators:any[] = [
        {
            credentialID: Uint8Array.from("UZSL85T9AFC", c => c.charCodeAt(0)),
            transports: ['usb', 'ble', 'nfc']
        }
    ]
    const rpName = 'Alantick';
    // A unique identifier for your website
    const rpID = (process.env.NODE_ENV==="production")?'alantick.vercel.app':'localhost';
    // The URL at which registrations and authentications should occur
    const origin = `https://${rpID}`;
    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id,
        userName: user.username,
        // Don't prompt users for additional information about the authenticator
        // (Recommended for smoother UX)
        attestationType: 'none',
        // Prevent users from re-registering existing authenticators
        excludeCredentials: userAuthenticators.map(authenticator => ({
          id: authenticator.credentialID,
          type: 'public-key',
          // Optional
          transports: authenticator.transports,
        })),
      });
      console.log("--",options.challenge)
    res.status(200).json(options)
}