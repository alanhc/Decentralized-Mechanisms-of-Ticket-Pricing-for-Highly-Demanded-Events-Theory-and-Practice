import { Alchemy, Network } from "alchemy-sdk";

export default class ALCHEMY {
    alchemy: any;
    nft: any
    config: any;

    constructor() {
        this.config = {
            apiKey: "9liEkJtCPWYOXnlrcCdbGnlVJTf5I-wn",
            network: Network.ETH_SEPOLIA,
        }
        this.alchemy = new Alchemy()
    }
}