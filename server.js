var express = require("express");
var dhive = require("@hiveio/dhive");
var bodyParser = require("body-parser");
var cors = require("cors");
var signale = require("signale");
var config = require("./config.json");

var app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", require("./api"));

app.listen(config.httpPort, function () {
  signale.star(
    "#### Creator-API web server listening on " + config.httpPort + " ####"
  );
});

setInterval(claimAccounts, config.autoClaimDelaySeconds * 1000)

async function claimAccounts() {
  let client = new dhive.Client(config.rpc);
  let privateKey = dhive.PrivateKey.fromString(config.key);

  try {
    let ac = await client.call("rc_api", "find_rc_accounts", {
      accounts: [config.account],
    });

    let rc = Number(ac.rc_accounts[0].rc_manabar.current_mana);

    if (rc > config.rcThreshold * 1000000000000) {
      let op = [
        "claim_account",
        {
          creator: config.account,
          fee: dhive.Asset.from("0.000 HIVE"),
          extensions: [],
        },
      ];

      await client.broadcast.sendOperations([op], privateKey);
      signale.success(
        new Date(),
        "- OP: create_claimed_account - Success: New account ticket was created."
      );
    }
  } catch (error) {
    signale.error(new Date(), "- OP: claim_account - Error: " + error);
  }
}
