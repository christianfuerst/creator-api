var express = require("express");
var dhive = require("@hiveio/dhive");
var signale = require("signale");
var _ = require("lodash");
var config = require("./config.json");

var router = express.Router();

let client = new dhive.Client(config.rpc);

router.get("/", (req, res) => {
  signale.info(new Date(), "- GET request to /api - Source: " + req.ip);
  res.json({
    owner_account: config.account,
  });
});

router.post("/createAccount", (req, res) => {
  let auth = req.headers.authority;

  if (!auth) {
    signale.warn(
      new Date(),
      "- POST request to /api/createAccount - Refused: Authorization header missing. - Source: " +
        req.ip
    );
    res.status(401).send("Authorization header missing.");
  } else {
    let provider = _.find(config.auth, { key: auth });
    if (!provider) {
      signale.warn(
        new Date(),
        "- POST request to /api/createAccount - Refused: Invalid auth token. - Source: " +
          req.ip
      );
      res.status(401).send("Invalid auth token.");
    } else {
      signale.info(
        new Date(),
        "- POST request to /api/createAccount - Provider: " +
          provider.label +
          " - Source: " +
          req.ip
      );

      let name = req.body.name;
      let publicKeys = req.body.publicKeys;
      let metaData = req.body.metaData;

      if (
        typeof name === "undefined" ||
        typeof publicKeys === "undefined" ||
        typeof metaData === "undefined"
      ) {
        signale.error(
          new Date(),
          "- POST request to /api/createAccount - Error: Body data is invalid or missing. - Source: " +
            req.ip
        );
        res.status(400).send("Body data is invalid or missing.");
      } else {
        res.setHeader("Content-Type", "application/json");
        createAccount(name, publicKeys, metaData).then((response) => {
          res.send(response);
        });
      }
    }
  }
});

function createAccount(name, publicKeys, metaData) {
  const ownerAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[publicKeys.owner, 1]],
  };
  const activeAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[publicKeys.active, 1]],
  };
  const postingAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[publicKeys.posting, 1]],
  };

  let privateKey = dhive.PrivateKey.fromString(config.key);

  let ops = [];
  const create_op = [
    "create_claimed_account",
    {
      creator: config.account,
      new_account_name: name,
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,
      memo_key: publicKeys.memo,
      json_metadata: JSON.stringify(metaData),
      extensions: [],
    },
  ];

  ops.push(create_op);

  return client.broadcast.sendOperations(ops, privateKey).then(
    function (result) {
      signale.success(
        new Date(),
        "- OP: create_claimed_account - Success: Account " +
          name +
          " was created."
      );
      return_status = JSON.stringify({ created: true, name: name });
      return return_status;
    },
    function (error) {
      signale.error(
        new Date(),
        "- OP: create_claimed_account - Error: " + error
      );
      return_status = JSON.stringify({ created: false, name: name });
      return return_status;
    }
  );
}

module.exports = router;
