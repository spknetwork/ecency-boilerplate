import React, { useCallback, useEffect, useState, useContext } from "react";
import { hash } from "@stablelib/sha256";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { DID } from "dids";
import { DHive } from "../constants";
import { createGlobalState } from "react-hooks-global-state";
import { useCeramic } from "../helper/useCeramic";

function normalizeAuthSecret(authSecret64: number[]) {
  const authSecret = new Uint8Array(32);
  for (let i = 0; i < authSecret.length; i++) {
    authSecret[i] = authSecret64[i];
  }
  return authSecret;
}

class AccountContextClass {
  hiveName: any;
  did: DID | undefined;
  storeAuth(authInfo: { authId: string; authSecret: Uint8Array }) {
    localStorage.setItem("login.auth", JSON.stringify(authInfo));
  }
  getAuth() {
    const authInfo = localStorage.getItem("login.auth");
    return authInfo ? JSON.parse(authInfo) : null;
  }
  async checkLogin() {
    const auth = this.getAuth();

    if (!auth) {
      console.log("LOPGIN FAILED!");
      return;
    }
    auth.authSecret = Object.values(auth.authSecret);

    const didInfo = await this.createIdentity(auth);

    this.hiveName = auth.authId;

    return didInfo;
  }
  async createIdentity({ authId, authSecret }: any) {
    const provider = new Ed25519Provider(authSecret);
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();
    this.did = did;
    return did;
  }
  async loginWithHive(hiveName: undefined) {
    const loginResult: any = await new Promise((resolve, reject) => {
      (window as any).hive_keychain.requestSignBuffer(
        hiveName,
        "Allow this account to control your identity",
        "Posting",
        (e: unknown) => {
          if (e.success) {
            resolve(e);
          } else {
            return reject(e);
          }
        },
        "https://hive-api.3speak.tv",
        "Login to SPK network"
      );
    });

    const { username } = loginResult.data;

    const authId = `hive:${username}`;
    const authSecret = normalizeAuthSecret(
      hash(Buffer.from(loginResult.result)) as any
    );
    const did = await this.createIdentity({ authId, authSecret });
    // log the DID
    this.storeAuth({ authId, authSecret });
    this.hiveName = authId;

    const accountInfo: any = (await DHive.database.getAccounts([username]))[0];
    let json_meatadata = JSON.parse(accountInfo.posting_json_metadata);
    if (!json_meatadata?.did) {
      json_meatadata.did = did.id;
      (window as any).hive_keychain.requestBroadcast(
        username,
        [
          [
            "account_update2",
            {
              account: username,
              json_metadata: "",
              posting_json_metadata: JSON.stringify(json_meatadata),
            },
          ],
        ],
        "Posting",
        (e: any) => console.log(e)
      );
    }
  }
  async runLoginComplete() {}
}

export const AccountContext = React.createContext(new AccountContextClass());

const initialState = { count: 0, did: null, ceramic: null };
const { useGlobalState } = createGlobalState(initialState);

export const AccountSystem = () => {
  const { Ceramic } = useCeramic();
  const ac: any = useContext(AccountContext);
  const [, setMyDid] = useGlobalState("did");

  useEffect(async () => {
    console.log("attempting to login!");
    //Trigger login
    await ac.checkLogin();
    console.log(ac);
    if (ac.did) {
      Ceramic.setDID(ac.did);
      setMyDid(ac.did);
    }
  }, [Ceramic]);
  return null;
};

export const useAccountContext = function () {
  const ac: any = useContext(AccountContext);
  const [myDid, setMyDid] = useGlobalState("did");
  const { Ceramic } = useCeramic();

  const triggerLoginWithHive = useCallback(async () => {
    await ac.loginWithHive();
    if (ac.did) {
      await Ceramic.setDID(ac.did);
    }
    setMyDid(ac.did);
  }, [ac, setMyDid]);

  return {
    loggedIn: !!myDid,
    myDid,
    triggerLoginWithHive,
  };
};

(window as any).AccountContext = AccountContext;
