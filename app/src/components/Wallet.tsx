import { useEffect, useState } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";
import type { TezosToolkit } from "@taquito/taquito";
import { NetworkType } from "@airgap/beacon-sdk";

const Wallet = ({
  Tezos,
  rpcUrl,
  setConnected,
  connected
}: {
  Tezos: TezosToolkit | undefined;
  rpcUrl: string;
  setConnected: (p: boolean) => void;
  connected: boolean;
}) => {
  const [wallet, setWallet] = useState<BeaconWallet | undefined>(undefined);
  const [userAddress, setUserAddress] = useState<string | undefined>(undefined);

  const createWallet = (): BeaconWallet => {
    const walletOptions = {
      name: "Hello Tacos",
      preferredNetwork: NetworkType.GHOSTNET
    }
    return new BeaconWallet(walletOptions);
  };

  const connect = async () => {
    const w = !wallet ? createWallet() : wallet;
    setWallet(w);

    if (Tezos) {
      try {
        await w.requestPermissions({
          network: {
            type: NetworkType.GHOSTNET,
            rpcUrl
          }
        });
        const userPkh = await w.getPKH();
        setUserAddress(userPkh);
        Tezos.setWalletProvider(wallet);
        setConnected(true);
      } catch (err) {
        console.error(err);
        setConnected(false);
      }
    }
  };

  const disconnect = async () => {
    await wallet?.client.destroy();
    setWallet(undefined);
    setUserAddress(undefined);
    setConnected(false);
  };

  useEffect(() => {
    (async () => {
      if (Tezos) {
        const newWallet = createWallet();
        setWallet(newWallet);

        try {
          const activeAccount = await newWallet.client.getActiveAccount();
          if (activeAccount) {
            const userPkh = await newWallet.getPKH();
            setUserAddress(userPkh);
            Tezos.setWalletProvider(newWallet);
            setConnected(true);
          } else {
            setUserAddress(undefined);
            setConnected(false);
          }
        } catch (err) {
          console.error(err);
          setUserAddress(undefined);
          setConnected(false);
        }
      }
    })();
  }, [Tezos, setConnected]);

  return connected ? (
    <button className="wallet" onClick={disconnect}>
      <img src="images/user-check.svg" alt="user-connected" />
      &nbsp; Disconnect
    </button>
  ) : (
    <button className="wallet" onClick={connect}>
      <img src="images/user-x.svg" alt="user-disconnected" />
      &nbsp; Connect wallet
    </button>
  );
};

export default Wallet;
