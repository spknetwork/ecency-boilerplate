import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import capitalize from "../util/capitalize";
import { _t } from "../i18n";
import defaults from "../constants/defaults.json";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LandingPage from "../components/landing-page";
import EntryIndexContainer from "./entry-index";
import { connect } from "react-redux";

interface State {
  step: number;
}

class LandingContainer extends Component<PageProps, State> {
  state: State = {
    step: 1,
  }

  componentDidMount() {
    this.props.activeUser !== null ? this.changeStepTwo() : this.changeStepOne()
  }

  changeStepOne = () => {
    this.setState({
      step: 1
    })
  }

  changeStepTwo = () => {
    this.setState({
      step: 2
    })
  }

  render() {
    const { activeUser, global, location } = this.props;
    const { filter, tag } = global;

    const fC = capitalize(filter);
    let title = _t("entry-index.title", { f: fC });
    let description = _t("entry-index.description", { f: fC });
    let url = `/${filter}`;
    let canonical = `${defaults.base}/${filter}`;
    let rss = "";

    if (tag) {
      if (activeUser && tag === "my") {
        title = `@${activeUser.username}'s community feed on decentralized web`;
        description = _t("entry-index.description-user-feed", { u: tag });
        canonical = `${defaults.base}/@${tag}/${filter}`;
      } else if (tag.startsWith('@')) {
        title = `${tag}'s ${filter} on decentralized web`;
        description = _t("entry-index.description-user-feed", { u: tag });
        canonical = `${defaults.base}/@${tag}/${filter}`;
      } else {
        title = `latest #${tag} ${filter} topics on internet`;
        description = _t("entry-index.description-tag", { f: fC, t: tag });

        url = `/${filter}/${tag}`;
        canonical = `${defaults.base}/${filter}/${tag}`;
        rss = `${defaults.base}/${filter}/${tag}/rss.xml`;
      }
    }

    const metaProps = { title, description, url, canonical, rss };

    const showEntryPage = this.state.step === 2
      // || activeUser !== null || activeUser === null
      || location?.pathname?.startsWith("/hot")
      || location?.pathname?.startsWith("/created")
      || location?.pathname?.startsWith("/trending")
      || location?.pathname?.startsWith("/payout")
      || location?.pathname?.startsWith("/payout_comments");

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback />
        {global.isElectron ?
          NavBarElectron({
            ...this.props,
            // reloadFn: this.reload,
            // reloading: loading,
            step: this.state.step,
            setStepTwo: this.changeStepTwo
          }) :
          NavBar({ ...this.props, step: this.state.step, setStepOne: this.changeStepOne, setStepTwo: this.changeStepTwo })
        }
        {
          this.state.step === 1 &&
          activeUser === null &&
          location && "/" === location?.pathname &&
          <LandingPage {...this.props} changeState={this.changeStepTwo} />
        }
        {
          showEntryPage && <EntryIndexContainer {...this.props} />
        }
      </>
    )
  }

}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(LandingContainer);