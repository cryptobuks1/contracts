const ERC721Patronage_v0 = artifacts.require("ERC721Patronage_v0");
const WildcardSteward_v0 = artifacts.require("WildcardSteward_v0");

const patronageNumerator = 2400000000000;
const patronageDenominator = 1000000000000;

const {increaseTime, getWeb3 } = require("./testing/index.js");

const image1MetadataJson = {
  artist: "Matty Fraser",
  name: "Simon",

  // https://ipfs.infura.io/ipfs/QmZt5S8tD7L4nMBo4NTtVDpV3qpteA1DXJwKRmuF318tHd"
  ipfs: "QmZt5S8tD7L4nMBo4NTtVDpV3qpteA1DXJwKRmuF318tHd",
  type: "Gorilla"
};
const image1MetadataString = JSON.stringify(image1MetadataJson);
const image2MetadataJson = {
  artist: "Matty Fraser",
  name: "Andy",
  // https://ipfs.infura.io/ipfs/QmUjnwmYQE1QjkNpoEdpGwbj1s4cj5gVfEePNPnArbm5Tv
  ipfs: "QmUjnwmYQE1QjkNpoEdpGwbj1s4cj5gVfEePNPnArbm5Tv",
  type: "Gorilla"
};
const image2MetadataString = JSON.stringify(image2MetadataJson);

module.exports = function (deployer, networkName, accounts) {
  console.log("testutils",getWeb3,increaseTime)
  deployer.then(async () => {
    // Don't try to deploy/migrate the contracts for tests
    if (networkName === "test") {
      return;
    }

    const patronageToken = await ERC721Patronage_v0.deployed();
    const steward = await WildcardSteward_v0.deployed();

    console.log(await patronageToken.isMinter.call(accounts[0]));
    await Promise.all([
      patronageToken.mintWithTokenURI(
        steward.address,
        0,
        image1MetadataString,
        { from: accounts[0] }
      ),
      patronageToken.mintWithTokenURI(
        steward.address,
        1,
        image2MetadataString,
        { from: accounts[0] }
      )
    ]);
    await steward.initialize(
      patronageToken.address,
      accounts[0],
      patronageDenominator,
      { from: accounts[0] }
    );
    await steward.listNewTokens(
      [0, 1],
      [accounts[0], accounts[0]],
      [patronageNumerator, patronageNumerator],
      { from: accounts[0] }
    );

    console.log({ stewardAdd: steward.address, pToken: patronageToken.address });

    if (networkName === "subgraphTest") {
      const web3 = getWeb3("http://localhost:8545")
      const result1 = await steward.buy(0, 1234568, { from: accounts[1], value: 2234568 });
      console.log(JSON.stringify(result1, null, 2));
      await increaseTime(web3, 2*60); // 2 minutes increase
      const result2 = await steward.buy(1, 1234568, { from: accounts[1], value: 2234568 });
      console.log(JSON.stringify(result2, null, 2));
    }
  });
};
