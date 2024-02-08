import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Contract, } from "ethers";
const fs = require("fs");
import path from "path";
const configDir = path.join(__dirname, "..", "config");
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}
let num_of_tickets = 10
const start_t = Array(3).fill(Math.floor(Date.now()/1000));
const end_t = Array(3).fill(Math.floor(Date.now()/1000)+60);
describe("Event_v0", function () {
  async function deployEventFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    let rawdata = fs.readFileSync(path.join(__dirname, "..", "config", "test-predeploy.json"));
    let addrs = JSON.parse(rawdata);

    const c_event_factory = await ethers.getContractAt("EventFactory_v0", addrs.event_factory);
    const c_presale = await ethers.getContractAt("Presale_v0", addrs.presale);
    const c_market = await ethers.getContractAt("Market_v0", addrs.market);
    let tx = await c_event_factory.connect(addr1).createEvent("name", "symbol", num_of_tickets, 5)
    let receipt = await tx.wait()
    const events = await c_event_factory.queryFilter(c_event_factory.filters.EventCreated, receipt?.blockNumber, receipt?.blockNumber)
    const event_created_addr = events[0].args[0];
    const c_event_1 = await ethers.getContractAt("Event_v0", event_created_addr);

    return { owner, addr1, addr2, addr3, c_event_factory, c_event_1, event_created_addr, c_presale, c_market }
  }
  
  describe("Test Deployment", function () {
    it("addr1 deploy contract", async function () {
      const { owner, addr1, addr2, addr3, c_event_1 } = await loadFixture(deployEventFixture);
    })
    it("addr1 set tickets", async function () {
      const { owner, addr1, addr2, addr3, c_event_1 } = await loadFixture(deployEventFixture);
      //uint256[] memory tokenIds,uint256[] memory start_at, uint256[] memory end_at, uint256[] memory duration, uint256[] memory discount_rate,uint256[] memory start_price,uint256[] memory class_

      
      await c_event_1.connect(addr1).set_tickets([0,1,2],start_t,end_t,[1,1,1],[100,100,100],[1,1,1]);  //tokenId, listing, price
      //expect(await c_event_1.get_price(0)).to.equal(1)
    })
    
    it("addr2 set tickets will fail", async function () {
      const { owner, addr1, addr2, addr3, c_event_1, event_created_addr } = await loadFixture(deployEventFixture);
     
      expect(c_event_1.connect(addr2).set_tickets([0,1,2],start_t,end_t,[1,1,1],[100,100,100],[1,1,1])).to.be.revertedWith("not manager");
    })
    describe("Begin", function () {
      it(`addr1 init seting tickets`, async function () {
        const { owner, addr1, addr2, addr3, c_event_1, event_created_addr, c_market, c_presale } = await loadFixture(deployEventFixture);
        c_event_1.connect(addr1).set_income(0, addr1.address, 100);
        for (let i = 0; i < num_of_tickets; i++) {
          
          await c_event_1.connect(addr1).set_tickets([0,1,2],start_t,end_t,[1,1,1],[100,100,100],[1,1,1]);
        }
        await c_event_1.connect(addr1).set_base_uri("ipfs://QmVtvVsnNvJv7PgQzoKMkrZqgNtuqNa55RZBBbros1sE7s");
        await c_event_1.connect(addr1).set_sales_royalties(10);
       
        
        //expect(await c_event_1.get_price(0)).to.equal(100)
        it("should set base URI", async function () {
          const newBaseURI = "https://new-base-uri.com";
          await c_event_1.set_base_uri(newBaseURI);
          const baseURI = await c_event_1.base_uri();
          expect(baseURI).to.equal(newBaseURI);
        });
        it("shold get _baseURI", async function () {
          if (!await c_event_1.exists(0)) expect(await c_event_1.tokenURI(0)).to.be.revertedWith("token not minted");
          else expect(await c_event_1.tokenURI(0)).to.equal("ipfs://QmVtvVsnNvJv7PgQzoKMkrZqgNtuqNa55RZBBbros1sE7s/0");
        })
        it("should set income", async function () {
          const i = 0;
          const to = addr1.address;
          const amount = 100;
          await c_event_1.set_income(i, to, amount);
          const income = await c_event_1.income(i);
          expect(income.target).to.equal(to);
          expect(income.royalty).to.equal(amount);
        });
       
      
      
        describe("Presale", function () {
          // it("addr1 register token-0 and pay 10", async function () {
          //   await c_event_1.connect(addr1).register(0, { value: 100 });
          // })
          it("addr2 register token-0 and pay 1000", async function () {
            await c_event_1.connect(addr1).set_tickets([0,1,2],start_t,end_t,[1,1,1],[100,100,100],[1,1,1]);
          
            await c_event_1.connect(addr2).register(0, { value: 1000 });
          })
          it("addr2 register token-0 and pay 1000", async function () {
            await c_event_1.connect(addr1).set_tickets([0,1,2],start_t,end_t,[1,1,1],[100,100,100],[1,1,1]);
          
            await c_event_1.connect(addr1).register(1, { value: 1000 });
          })
          let addr2_balance:any = 0
          it("addr2 select twice will fail", async function () {
            addr2_balance = await ethers.provider.getBalance(addr2.address)
            expect(c_event_1.connect(addr2).register(0, { value: 1000 })).to.be.revertedWith("user should register only once");
          })
          it("in queue", async function () {
            expect(await c_presale.in_queue(await c_event_1.getAddress(), addr2)).to.equal(true);
          })
         
          
          it("addr1 get winners", async function () {
            await c_event_1.connect(addr1).get_winners();
            let token = await c_event_1.connect(addr2).ownerOf(0);
            if (token != addr2.address) {
              addr2_balance = await ethers.provider.getBalance(addr2.address)
              expect(addr2_balance).to.equal(1000)
            } else {
              expect(token).to.equal(addr2.address)
            }
          })
        })
        describe("Sale", function () {
          it("get price", async function () {
            expect(await c_event_1.get_price(0)).be.a("BigInt")
          })
          it("addr1 buy ticket 0 pay 1 will fail", async function () {
            expect(c_event_1.batch_buy([2], {value: 1})).to.be.revertedWith("amount not enough");
          })
          it("addr1 buy ticket 0", async function () {
            
            await c_event_1.connect(addr3).batch_buy([2], {value: 1000})
          })
          it("tokenURI", async function () {
            await c_event_1.tokenURI(2);
            expect( c_event_1.tokenURI(100)).to.be.revertedWith("token not minted");
          })
          it("claim", async function () {
            expect(c_event_1.connect(addr1).claim([2])).to.be.revertedWith("not end sell");
          })
          // it("addr1 batch bid ticket 5,6,7,8,9", async function () {
          //   await c_event_1.connect(addr1).batch_buy([0,1,2],{ value: 10*3 })
          // })
         
         
         
          // it("addr1 refund token 3", async function () {
          //   console.log(await c_event_1.ownerOf(1))
          //   await c_event_1.connect(addr1).refund(addr1, 1);
          // });

        })
        // describe("Secondary Market", function () {

        //   const price = 20
        
        //   it("addr3 buy ticket 1 from market", async function () {
        //     await c_event_1.connect(addr3).buy_from_market(1, { value: price });
        //   })
        // })
        describe("Market", function () {
          it(`addr2 sell ticket 1 on price 10 will fail`, async function () {
            expect( c_event_1.connect(addr2).list_on_marketplace(1, 10, 100)).be.revertedWith("not owner");
  
          })
            it(`addr2 sell ticket 1 on price 10`, async function () {
              await c_event_1.connect(addr3).list_on_marketplace(2, 10, 10);
            })
            it("not enough money", async function () {
              const c_event_addr:any  = await c_event_1.getAddress();
              expect( c_market.connect(addr1).buy(c_event_addr, 2, { value: 1 })).be.revertedWith("not enough money")
              
            })
            it("addr3 buy ticket 1 from market", async function () {
              await c_event_1.connect(addr3).buy_from_market(2, { value: 10 });
            })
        })
        describe("secondary market", function () {
          it("addr1 set secondary market", async function () {
            const c_event_addr:any  = await c_event_1.getAddress();
            console.log(c_event_addr)
            
            expect( c_market.connect(addr2).buy(c_event_addr, 2, { value: 10000 })).be.revertedWith("not listing")

          })
          
        })
        describe("Refund", function () {
          it("addr2 refund token 0", async function () {
            let a = await ethers.getSigners();
            let find = await c_event_1.ownerOf(0);
            
            let idx_owner_token0 = a.map((x) => x.address).indexOf(find);
            console.log(idx_owner_token0, find)

          //   console.log(idx_owner_token0)
            await c_event_1.connect(a[idx_owner_token0]).refund(a[idx_owner_token0], 0);
          // })
          })
        })
        describe("Cancel", function () {
          it("addr1 cancel event", async function () {
            await c_event_1.connect(addr1).cancel();
          });
        })
        describe("Cancel", function () {
          // it("palse", async function () {
          //   await c_event_1.connect(addr1).pause();
          // });
          it("un/palse", async function () {
            await c_event_1.connect(addr1).unpause();
          });
        })
      
      
        describe("withdraw", function () {
          it("addr1 withdraw", async function () {
            await c_event_1.connect(addr1).withdraw();
          });
        })
        describe("Transfer", function () {
         
          it ("presale can transfer", async function () {
            
          })
        })

      })
    })

  })

});
