import Gun from 'gun'

export default class GUN {
  gun:any;

  constructor() {
    this.gun =  Gun({
      peers: [
        `https://gun.up.railway.app/gun`
      ],
      file: '/tmp'
    })
  }
  set_used = (contract: string, tokenId: string) => {

    this.gun.get(contract).get(tokenId).put({ used: true, time: Date.now() });;


  }
  get_used = (contract: string, tokenId: string) => {
    let ans = { used: false, time: 0 };
    this.gun.get(contract).get(tokenId).once((token:any) => {
      try {
        console.log(token.used, token.time)
        ans = {
          used: token.used,
          time: token.time
        }

      } catch (e) {
        console.log(e)
      }
      return ans
    });
  }
  get_status = (contract:string) => {
    this.gun.get(contract).get("status");
    
  }
}