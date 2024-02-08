import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Contract } from "ethers";
const fs = require("fs");
import path from "path";
const configDir = path.join(__dirname, "..", "config");
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}
describe("EventFactory_v0", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployEventFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const presale = await ethers.deployContract("Presale_v0");
    const market = await ethers.deployContract("Market_v0");
    await presale.waitForDeployment();
    await market.waitForDeployment();
    const event_factory = await ethers.deployContract("EventFactory_v0", [
      presale.target, market.target
    ]);
    await event_factory.waitForDeployment();

    return { presale, market, event_factory, owner, addr1, addr2, addr3 }
  }
  describe("Deployment", function () {
    it("deploy contract", async function () {
      const { presale, market, event_factory } = await loadFixture(
        deployEventFixture
      );
    })
  })
  let total_events: any = []
  describe("EventFactory_v0", function () {
    it("create event", async function () {
      const { market, presale, event_factory, owner, addr1 } = await loadFixture(deployEventFixture);
      let tx = await event_factory.connect(addr1).createEvent("name", "symbol", 100, 10)
      let receipt = await tx.wait()
      const events = await event_factory.queryFilter(event_factory.filters.EventCreated, receipt?.blockNumber, receipt?.blockNumber)
      const created_addr = events[0].args[0];
      total_events.push(created_addr)
      fs.writeFileSync(
        path.join(configDir, "test-predeploy.json"),
        JSON.stringify({
          presale: presale.target,
          market: market.target,
          event_factory: event_factory.target,
          event: created_addr
        }, undefined, 2)
      );
      expect(created_addr).be.a("string")

      let a = await event_factory.getDeployEvents()

      expect(a[0]).to.equal(total_events[0]);
        
      
    })

  })

});
