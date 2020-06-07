import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { match } from "react-router";

import moment from "moment";

import defaults from "../constants/defaults.json";

import {
  renderPostBody,
  setProxyBase,
  catchPostImage,
  // @ts-ignore
} from "@esteemapp/esteem-render-helpers";
setProxyBase(defaults.imageServer);

import { AppState } from "../store";
import { State as GlobalState } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { Entry, State as EntriesState } from "../store/entries/types";

import { toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";

import EntryLink from "../components/entry-link";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import TagLink from "../components/tag-link";
import EntryVoteBtn from "../components/entry-vote-btn/index";
import EntryReblogBtn from "../components/entry-reblog-btn/index";
import EntryPayout from "../components/entry-payout/index";
import EntryVotes from "../components/entry-votes";
import DownloadTrigger from "../components/download-trigger";
import FormattedCurrency from "../components/formatted-currency";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NotFound from "../components/404";

import { _t } from "../i18n";

import parseDate from "../helper/parse-date";
import parseAsset from "../helper/parse-asset";

import _c from "../util/fix-class-names";

import { makeShareUrlReddit, makeShareUrlTwitter, makeShareUrlFacebook } from "../helper/url-share";

import { timeSvg, redditSvg, facebookSvg, twitterSvg } from "../img/svg";

interface MatchParams {
  category: string;
  permlink: string;
  username: string;
}

interface Props {
  history: History;
  location: Location;
  match: match<MatchParams>;
  global: GlobalState;
  entries: EntriesState;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
}

class EntryPage extends Component<Props> {
  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>): void {}

  componentWillUnmount() {}

  shareReddit = (entry: Entry) => {
    const u = makeShareUrlReddit(entry.category, entry.author, entry.permlink, entry.title);
    window.open(u, "_blank");
  };

  shareTwitter = (entry: Entry) => {
    const u = makeShareUrlTwitter(entry.category, entry.author, entry.permlink, entry.title);
    window.open(u, "_blank");
  };

  shareFacebook = (entry: Entry) => {
    const u = makeShareUrlFacebook(entry.category, entry.author, entry.permlink);
    window.open(u, "_blank");
  };

  render() {
    const { entries, match } = this.props;
    const { username, permlink } = match.params;
    const author = username.replace("@", "");

    const groupKeys = Object.keys(entries);
    let entry: Entry | undefined = undefined;

    for (const k of groupKeys) {
      entry = entries[k].entries.find((x) => x.author === author && x.permlink === permlink);
      if (entry) {
        break;
      }
    }

    if (!entry) {
      return <NotFound />;
    }

    const reputation = Math.floor(entry.author_reputation);
    const created = moment(parseDate(entry.created));
    const last_update = parseDate(entry.updated);

    const renderedBody = { __html: renderPostBody(entry) };
    const image = catchPostImage(entry.body);
    const isComment = false;

    // Sometimes tag list comes with duplicate items
    const tags = [...new Set(entry.json_metadata.tags)];
    const { app } = entry.json_metadata;
    const totalPayout = 0;
    const isPayoutDeclined = parseAsset(entry.max_accepted_payout).amount === 0;
    const voteCount = entry.active_votes.length;

    const toolTipDate = created.format("LLLL");

    const repliesLoading = false;

    const metaProps = {};

    console.log(entry);

    return (
      <>
        <Meta {...metaProps} />

        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content entry-page" itemScope itemType="http://schema.org/Article">
          <div className="the-entry">
            <div className="entry-header">
              {/* 
                {isComment && (
                  <div className="comment-entry-header">
                    <div className="comment-entry-header-title">
                      {' '}
                      RE: {entry.root_title}
                    </div>
                    <div className="comment-entry-header-info">
                      <FormattedMessage id="entry.comment-entry-title"/>
                    </div>
                    <p className="comment-entry-root-title">
                      {' '}
                      {entry.root_title}
                    </p>
                    <ul className="comment-entry-opts">
                      <li>
                        <EntryLink
                          {...this.props}
                          author={rootAuthor.replace('@', '')}
                          permlink={rootPermlink}>
                          <a>
                            <FormattedMessage id="entry.comment-entry-go-root"/>
                          </a>
                        </EntryLink>
                      </li>
                      {!hideParentLink && (
                        <li>
                          <EntryLink
                            {...this.props}
                            author={entry.parent_author}
                            permlink={entry.parent_permlink}>
                            <a>
                              <FormattedMessage id="entry.comment-entry-go-parent"/>
                            </a>
                          </EntryLink>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                      */}

              <h1 className="entry-title">
                <span itemProp="headline name">{entry.title}</span>
              </h1>

              <div className="entry-info">
                <ProfileLink {...this.props} username={entry.author}>
                  <div className="author-part">
                    <div className="author-avatar">
                      <UserAvatar username={entry.author} size="medium" />
                    </div>
                    <div className="author">
                      <span className="author-name">
                        <span itemProp="author">
                          <span itemProp="name">{entry.author}</span>
                        </span>
                      </span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </div>
                </ProfileLink>
                <TagLink {...this.props} tag={entry.category}>
                  <a className="category">{entry.category}</a>
                </TagLink>
                <span className="separator" />
                <span className="date" title={toolTipDate}>
                  {created.fromNow()}
                </span>
              </div>
            </div>

            <div
              className="entry-body markdown-view user-selectable"
              dangerouslySetInnerHTML={renderedBody}
            />

            <div className={`entry-footer ${repliesLoading ? "loading" : ""}`}>
              <div className="entry-tags">
                {tags.map((t) => (
                  <TagLink {...this.props} tag={t} key={t}>
                    <div className="entry-tag">{t}</div>
                  </TagLink>
                ))}
              </div>
              <div className="entry-info">
                <div className="left-side">
                  <div className="date" title={toolTipDate}>
                    {timeSvg}
                    {created.fromNow()}
                  </div>
                  <span className="separator" />
                  <ProfileLink {...this.props} username={entry.author}>
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </ProfileLink>

                  {app && (
                    <>
                      <span className="separator" />
                      <div className="app">{_t("entry.via-app", { app })}</div>
                    </>
                  )}
                </div>
                <div className="right-side">
                  <DownloadTrigger>
                    <span className="reply-btn" role="none">
                      {_t("entry.reply")}
                    </span>
                  </DownloadTrigger>
                </div>
              </div>
              <div className="entry-controls">
                <div className="voting">
                  <EntryVoteBtn {...this.props} />
                </div>
                <EntryPayout {...this.props} entry={entry}>
                  <a className={`total-payout ${isPayoutDeclined ? "payout-declined" : ""}`}>
                    <FormattedCurrency {...this.props} value={totalPayout} />
                  </a>
                </EntryPayout>
                <EntryVotes {...this.props} entry={entry}>
                  <a className="voters">
                    <i className="mi">people</i>
                    {voteCount}
                  </a>
                </EntryVotes>

                <EntryReblogBtn {...this.props} />
                <div className="sub-menu">
                  <a
                    className="sub-menu-item"
                    onClick={() => {
                      this.shareReddit(entry!);
                    }}
                  >
                    {redditSvg}
                  </a>
                  <a
                    className="sub-menu-item"
                    onClick={() => {
                      this.shareTwitter(entry!);
                    }}
                  >
                    {twitterSvg}
                  </a>
                  <a
                    className="sub-menu-item"
                    onClick={() => {
                      this.shareFacebook(entry!);
                    }}
                  >
                    {facebookSvg}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  entries: state.entries,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      addAccount,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryPage);
