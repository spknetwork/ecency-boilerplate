import React, { Component, useRef } from "react";

import { connect } from "react-redux";

import { Button, Form, FormControl, Spinner, Row, Col } from "react-bootstrap";
import QRCode from "react-qr-code";
import axios from "axios";

import {
  PageProps,
  pageMapDispatchToProps,
  pageMapStateToProps,
} from "./common";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import Feedback, { error } from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import defaults from "../constants/defaults.json";

import { getAvailibleAccounts, signUp } from "../api/private-api";

import { _t } from "../i18n";

import { hiveSvg, closeSvg } from "../img/svg";
import { handleInvalid, handleOnInput } from "../util/input-util";
import { Community } from "../store/communities/types";
import { windowExists } from "../../server/util";

import lightningImgLogo from "../img/hivelightning-dark.png";
import hiveImgLogo from "../img/hive-blockchain-hive-logo.png";
import appleImgDownload from "../img/apple_download.png";
import googleImgDownload from "../img/google-play-badge.png";
import { Redirect } from "react-router-dom";

interface State {
  username: string;
  lockReferral: boolean;
  inProgress: boolean;
  done: boolean;
  availibleAccounts: number;
  qrData: any;
  paid: boolean;
  signUpResponse: any;
  communities: Community[];
}

class SignUpPage extends Component<PageProps, State> {
  form = React.createRef<HTMLFormElement>();

  state: State = {
    username: "",
    lockReferral: false,
    inProgress: false,
    done: false,
    communities: [],
    qrData: null,
    paied: false,
    availibleAccounts: 0,
    signUpResponse: null,
  };

  componentDidMount() {
    const { global } = this.props;
    getAvailibleAccounts(global.baseApiUrl)
      .then((response) => {
        this.setState({ ...this.state, availibleAccounts: response.count });
      })
      .catch((e) => {
        this.setState({ ...this.state, availibleAccounts: 0 });
      });
  }

  usernameChanged = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ) => {
    const { value: username } = e.target;
    this.setState({ username: username.toLowerCase() });
  };

  submit = () => {
    const { username } = this.state;
    const { global } = this.props;
    this.setState({ ...this.state, inProgress: true });
    signUp(username, global.baseApiUrl)
      .then(({ data }) => {
        if (!data.success) {
          error(data.message);
          return;
        }

        this.setState({ inProgress: false, signUpResponse: data });
      })
      .catch((e) => {
        console.error(e);
        this.setState({ inProgress: false });
        error("Couldn't create account");
      });
  };

  signUpLightning = () => {
    axios
      .get(
        `https://api.v4v.app/v1/new_invoice_hive?hive_accname=brianoflondon&amount=1&currency=HBD&usd_hbd=false&app_name=peakd_embed&expiry=600&message=peakd_unique&qr_code=base64_png`
      )
      .then(({ data }) => {
        console.log(data);
        this.setState({ ...this.state, qrData: data });

        setInterval(() => {
          axios
            .get(`https://api.v4v.app/v1/check_invoice/${data.payment_hash}`)
            .then(({ data }) => {
              if (data.paid) {
                this.setState({ ...this.state, paid: true });
              }
            });
        }, 3000);
      });
  };

  render() {
    const { global, communities } = this.props;
    const currCommunity = communities.find(
      (community) => community.name === global.hive_id
    );

    //  Meta config
    const metaProps = {
      title: `Welcome to ${currCommunity?.title}`,
    };

    const { username, inProgress, done, availibleAccounts, signUpResponse } =
      this.state;
    const spinner = (
      <Spinner
        animation="grow"
        variant="light"
        size="sm"
        style={{ marginRight: "6px" }}
      />
    );
    let containerClasses = global.isElectron
      ? "app-content sign-up-page mb-lg-0 mt-0 pt-6"
      : "app-content sign-up-page mb-lg-0";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback />
        {global.isElectron
          ? NavBarElectron({
              ...this.props,
            })
          : NavBar({ ...this.props })}
        <div className={containerClasses}>
          {!currCommunity && <Redirect to={`/trending/${global.hive_id}`} />}
          {signUpResponse && (
            <div className="success-info">
              <h3>
                <b>Username</b>: {signUpResponse.result.username}
              </h3>
              <ul>
                <li>
                  <b>Owner</b>: {signUpResponse.result.keys.owner}
                </li>
                <li>
                  <b>Owner (public)</b>:{" "}
                  {signUpResponse.result.keys.ownerPubkey}
                </li>
                <li>
                  <b>Active</b>: {signUpResponse.result.keys.active}
                </li>
                <li>
                  <b>Active (public)</b>:{" "}
                  {signUpResponse.result.keys.activePubkey}
                </li>
                <li>
                  <b>Posting</b>: {signUpResponse.result.keys.posting}
                </li>
                <li>
                  <b>Posting (public)</b>:{" "}
                  {signUpResponse.result.keys.postingPubkey}
                </li>
                <li>
                  <b>Memo</b>: {signUpResponse.result.keys.memo}
                </li>
                <li>
                  <b>Memo (public)</b>: {signUpResponse.result.keys.memoPubkey}
                </li>
              </ul>
              <h5>
                <b>
                  This info is important to setting up your "HIVE Keychain"
                  client, copy this info somewhere safe
                </b>
              </h5>
            </div>
          )}
          <div className="sign-up">
            <div className="the-form">
              <div className="form-title">
                Welcome to {currCommunity?.title}
              </div>
              <div className="form-sub-title">{_t("sign-up.description")}</div>
              <div className="form-icons">
                <img
                  src={`${defaults.imageServer}/u/${currCommunity?.name}/avatar/lardge`}
                  alt="Community-fork"
                  title="Community-fork"
                />
                <span title="Hive">{hiveSvg}</span>
              </div>
              {(() => {
                return !!availibleAccounts ? (
                  <div className="form-content">
                    <Form
                      ref={this.form}
                      onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!this.form.current?.checkValidity()) {
                          return;
                        }

                        this.submit();
                      }}
                    >
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder={_t("sign-up.username")}
                          value={username}
                          onChange={this.usernameChanged}
                          autoFocus={true}
                          required={true}
                          onInvalid={(e: any) =>
                            handleInvalid(e, "sign-up.", "validation-username")
                          }
                          onInput={handleOnInput}
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-center">
                        <Button
                          variant="primary"
                          block={true}
                          type="submit"
                          disabled={inProgress}
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
                          const { toggleUIProp } = this.props;
                          toggleUIProp("login");
                        }}
                      >
                        {" "}
                        {_t("sign-up.login-text-2")}
                      </a>
                    </div>

                    <div className="form-bottom-description text-center">
                      There are <b>{availibleAccounts}</b> free accounts left!
                    </div>
                  </div>
                ) : (
                  <div className="select_signup">
                    <div
                      className="signup_option"
                      onClick={this.signUpLightning}
                    >
                      <img src={lightningImgLogo} alt="Lightning logo" />
                      <h3>Sign up using "Lightning"</h3>
                    </div>
                    <div
                      onClick={() =>
                        windowExists &&
                        window.location.replace("https://signup.hive.io/")
                      }
                      className="signup_option"
                    >
                      <img src={hiveImgLogo} />
                      <h3>Sign up using "Hive"</h3>
                    </div>
                    {this.state.qrData && (
                      <div className="lightning_modal">
                        <div className="lightning_content">
                          <div
                            className="close_icon"
                            onClick={() =>
                              this.setState({ ...this.state, qrData: null })
                            }
                          >
                            {closeSvg}
                          </div>
                          <h4>Pay using "Lightning"</h4>
                          <QRCode
                            value={`lightning:${this.state.qrData.payment_request}`}
                          />
                          <p>
                            By scanning this QR code on the "Wallet of satoshi",
                            you can pay BTC to get your HIVE account
                          </p>
                          <div className="lightning_wallet_download">
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href="https://itunes.apple.com/us/app/wallet-of-satoshi/id1438599608"
                            >
                              <img
                                className="apple_download"
                                src={appleImgDownload}
                                alt="Apple download button"
                              />
                            </a>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href="https://play.google.com/store/apps/details?id=com.livingroomofsatoshi.wallet"
                            >
                              <img
                                src={googleImgDownload}
                                alt="Google play download button"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
