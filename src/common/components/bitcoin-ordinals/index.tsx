import React, { useState, useRef } from 'react'
import { _t } from '../../i18n';
import { Button, Form } from 'react-bootstrap';
import { handleInvalid, handleOnInput } from "../../util/input-util";
import { Link } from 'react-router-dom';
// import { GetAddressConfig, getAddress, signMessage } from 'sats-connect';
// import { getAddress, signMessage } from '@sats-connect/core';
// import * as Test from "sats-connect"

const spkLogo = require("../../img/spklogo.png");
const btcLogo = require("../../img/btc-ord.jpeg");

interface WalletAddress {
  address: string;
}

interface SignMessageResponse {
  signature: string;
}

interface ServerResponse {
  [key: string]: any;
}

export const BitcoinOrdinals = (props: any) => {
    const { inProgress, spinner, step, setStep, setInProgress } = props;
    const form = useRef(null);

    const [email, setEmail] = useState("")
    const [error, setError] = useState("");
    const [username, setUsername] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [signedMessage, setSignedMessage] = useState<SignMessageResponse | null>(null);
    const [serverResponse, setServerResponse] = useState<ServerResponse | any>(null);

    const emailChanged =(e: { target: { value: React.SetStateAction<string>; }; })=>{
        setEmail(e.target.value)
    }

    const usernameChanged =(e: { target: { value: React.SetStateAction<string>; }; })=>{
      setUsername(e.target.value)
      // const geta: GetAddressConfig | any = "hgsddhjhjfdhjdef"
    }

    const handleCreateAccount = async () => {
      // event.preventDefault();
  
      try {
        const walletAddresses = await getWalletAddress();
  
        console.log('Wallet Addresses:', walletAddresses);
  
        if (walletAddresses && walletAddresses.length > 0) {
          const bitcoinAddress = walletAddresses[0].address;
          const messageToSign = `Hive:${username}`;
  
          const signedMessageResponse = await signMessageFromWallet(messageToSign, bitcoinAddress);
  
          setWalletAddress(bitcoinAddress);
          setSignedMessage(signedMessageResponse);
  
          console.log('Bitcoin Address:', bitcoinAddress);
          console.log('Signed Message:', signedMessageResponse);
  
          // Send data to the server
          const response = await sendToServer(username, bitcoinAddress, messageToSign, signedMessageResponse.signature);
          setServerResponse(response);
  
        } else {
          throw new Error('No addresses found in the response.');
        }
      } catch (error: any) {
        console.error('An error occurred:', error);
        setServerResponse(`Error: ${error.message}`);
      }
    };
  
    const getWalletAddress = (): Promise<WalletAddress[]> => {
      return new Promise((resolve, reject) => {
        const getAddressOptions: any = {
          payload: {
            purposes: ['payment'],
            message: 'Address for creating Hive account',
            network: {
              type: 'Mainnet'
            },
          },
          onFinish: (response: { addresses: WalletAddress[] }) => {
            console.log('onFinish response:', response);
            resolve(response.addresses);
          },
          onCancel: () => reject(new Error('Request canceled')),
        };
  
        // getAddress(getAddressOptions);
      });
    };
  
    const signMessageFromWallet = (message: string, address: string): Promise<SignMessageResponse> => {
      return new Promise((resolve, reject) => {
        const signMessageOptions: any = {
          payload: {
            network: {
              type: 'Mainnet',
            },
            address: address,
            message: message,
          },
          onFinish: (response: SignMessageResponse) => {
            console.log('Signature response:', response);
            resolve(response);
          },
          onCancel: () => reject(new Error('Signing canceled')),
        };
  
        // signMessage(signMessageOptions);
      });
    }; 
  
    const sendToServer = async (username: string, address: string, message: string, signature: string): Promise<ServerResponse> => {
      try {
        const response = await fetch('http://localhost:7000/create-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            address,
            message,
            signature,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data: ServerResponse = await response.json();
        return data;
      } catch (error) {
        console.error('Error sending data to server:', error);
        throw error;
      }
    };

  return (
    <>
         {step === 1 && <div className="sign-up">
              <div className="the-form">
                <div className="form-title">Register with Btc Ordinals</div>
                <div className="form-sub-title mt-3">{_t("sign-up.description")}</div>
                <div className="form-icons d-flex justify-content-center">
                  <img
                    style={{ borderRadius: "50%" }}
                    src={spkLogo}
                    alt="SpkNetwork"
                    title="SpkNetwork"
                  />
                  <img
                    style={{ borderRadius: "50%" }}
                    src={btcLogo}
                    alt="btc"
                    title="Btc"
                  />
                </div>
                {(() => {
                  return (
                    <div className="form-content">
                      <Form
                        ref={form}
                        >
                        <Form.Group className="d-flex flex-column">
                          <Form.Control
                            type="text"
                            placeholder={"enter username"}
                            value={username}
                            onChange={usernameChanged}
                            autoFocus={true}
                            required={true}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "sign-up.", "validation-username")
                            }
                            onInput={handleOnInput}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Control
                            type="email"
                            placeholder={_t("sign-up.email")}
                            value={email}
                            onChange={emailChanged}
                            required={true}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "sign-up.", "validation-email")
                            }
                            onInput={handleOnInput}
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-center">
                          <Button
                            variant="primary"
                            block={true}
                            disabled={inProgress}
                            onClick={handleCreateAccount}
                          >
                            {inProgress && spinner} {_t("sign-up.submit")}
                          </Button>
                        </div>
                      </Form>

                      <div className="text-center">
                        {_t("sign-up.login-text-1")}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            const { toggleUIProp } = props;
                            toggleUIProp("login");
                          }}
                        >
                          {" "}
                          {_t("sign-up.login-text-2")}
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>}
            {step == 2 && !error && (
              <div className="success-wrapper">
                <div className="success-info">
                  <h3 className="text-success">
                      Account created succesfully
                  </h3>
                  <Link to={``}>Login</Link>
                </div>
              </div>
            )}
            {step == 2 && error && (
              <div className="success-wrapper">
                <div className="success-info">
                  <h3 className="text-danger">
                      {error}
                  </h3>
                  <Button onClick={()=> setStep(1)}>Try again</Button>
                </div>
              </div>
            )}
    </>
  )
}
