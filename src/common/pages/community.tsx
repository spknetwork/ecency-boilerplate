import React, { Fragment } from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import _ from "lodash";

import SearchListItem from "../components/search-list-item";

import { ListStyle } from "../store/global/types";
import { EntryFilter } from "../store/global/types";
import { makeGroupKey } from "../store/entries";
import { search as searchApi, SearchResult } from "../api/search-api";

import {
  PageProps,
  pageMapDispatchToProps,
  pageMapStateToProps,
} from "./common";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import CommunityCard from "../components/community-card";
import CommunityMenu from "../components/community-menu";
import CommunityCover from "../components/community-cover";
import NotFound from "../components/404";
import Feedback from "../components/feedback";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import EntryListContent from "../components/entry-list";
import DetectBottom from "../components/detect-bottom";
import CommunitySubscribers from "../components/community-subscribers";
import CommunityActivities from "../components/community-activities";
import CommunityRoles from "../components/community-roles";
import ScrollToTop from "../components/scroll-to-top";

import { getAccountPosts, getCommunity, getSubscriptions } from "../api/bridge";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";
import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";
import SearchBox from "../components/search-box";
import { setupConfig } from "../../setup";
import { FormControl } from "react-bootstrap";
import { Entry } from "../store/entries/types";
import AuthorsPosts from "../components/authors-and-tags";

interface MatchParams {
  filter: string;
  name: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
}

interface State {
  loading: boolean;
  typing: boolean;
  search: string;
  searchDataLoading: boolean;
  searchData: SearchResult[];
  authorsPosts: any;
  baAuthor: string;
  baTag: string;
}

class CommunityPage extends BaseComponent<Props, State> {
  state: State = {
    loading: false,
    typing: false,
    search: "",
    searchDataLoading: false,
    searchData: [],
    authorsPosts: [],
    baAuthor: this.props.global.baAuthors[1],
    baTag: this.props.global.tags[0]
  };

  constructor(props: Props) {
    super(props);

    const { location } = props;
    let searchParam = location.search.replace("?", "");
    searchParam = searchParam.replace("q", "");
    searchParam = searchParam.replace("=", "");

    if (searchParam.length) {
      this.handleInputChange(searchParam);
    }

    this.state = {
      loading: false,
      typing: false,
      search: searchParam,
      searchDataLoading: searchParam.length > 0,
      searchData: [],
      authorsPosts: [],
      baAuthor: this.props.global.baAuthors[1],
      baTag: this.props.global.tags[0]
    };
  }

  async componentDidMount() {
    await this.ensureData();
    const { match, fetchEntries } = this.props;

    const { filter, name } = match.params;
    if (EntryFilter[filter as EntryFilter]) {
      // fetch blog posts.
      fetchEntries(filter, name, false);
    }

    // fetch subscriptions.
    const { activeUser, subscriptions, updateSubscriptions } = this.props;
    if (activeUser && subscriptions.length === 0) {
      getSubscriptions(activeUser.username).then((r) => {
        if (r) updateSubscriptions(r);
      });
    }
    this.getPostsByUser()
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { match, fetchEntries } = this.props;
    const { match: prevMatch } = prevProps;

    const { filter, name } = match.params;
    const { params: prevParams } = prevMatch;

    // community changed. fetch community and account data.
    if (name !== prevParams.name) {
      this.ensureData().then();
    }

    //  community or filter changed
    if (
      (filter !== prevParams?.filter || name !== prevParams.name) &&
      EntryFilter[filter as EntryFilter]
    ) {
      fetchEntries(match.params.filter, match.params.name, false);
    }

    // re-fetch subscriptions once active user changed.
    const { activeUser, updateSubscriptions } = this.props;
    if (prevProps.activeUser?.username !== activeUser?.username) {
      if (activeUser) {
        getSubscriptions(activeUser.username).then((r) => {
          if (r) updateSubscriptions(r);
        });
      }
    }
  }

  ensureData = (): Promise<void> => {
    const {
      match,
      communities,
      addCommunity,
      accounts,
      addAccount,
      activeUser,
    } = this.props;

    const name = match.params.name;
    const community = communities.find((x) => x.name === name);
    const account = accounts.find((x) => x.name === name);

    if (!community || !account) {
      // Community or account data aren't in reducer. Show loading indicator.
      this.stateSet({ loading: true });
    }

    return getCommunity(name, activeUser?.username)
      .then((data) => {
        if (data) {
          addCommunity(data);
        }
        return data;
      })
      .then((data) => {
        if (data && data.name === name) {
          addAccount(data);
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  bottomReached = () => {
    const { match, entries, fetchEntries } = this.props;
    const { search } = this.state;
    const { filter, name } = match.params;
    const groupKey = makeGroupKey(filter, name);

    const data = entries[groupKey];
    const { loading, hasMore } = data;

    if (!loading && hasMore && search.length === 0) {
      fetchEntries(filter, name, true);
    }
  };

  reload = () => {
    this.stateSet({ loading: true });
    this.ensureData().then(() => {
      const { match, fetchEntries, invalidateEntries } = this.props;
      const { filter, name } = match.params;

      if (EntryFilter[filter as EntryFilter]) {
        invalidateEntries(makeGroupKey(filter, name));
        fetchEntries(filter, name, false);
      }
    });
  };

  handleInputChange = async (value: string): Promise<void> => {
    this.setState({ typing: false });
    if (value.trim() === "") {
    } else {
      const { global } = this.props;
      this.setState({ searchDataLoading: true });

      let query = `${value} category:${global.tag}`;

      const data: any = await searchApi(query, "newest", "0");

      if (data && data.results) {
        let sortedResults = data.results.sort(
          (a: any, b: any) =>
            Date.parse(b.created_at) - Date.parse(a.created_at)
        );
        this.setState({
          searchData: sortedResults,
          loading: false,
          searchDataLoading: false,
        });
      }
    }
  };

  delayedSearch = _.debounce(this.handleInputChange, 2000);

  handleChangeSearch = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const { value } = event.target;
    this.setState({ search: value, typing: value.length === 0 ? false : true });
    this.delayedSearch(value);
  };

  getPostsByUser = async () => {
    const authorsPosts = await getAccountPosts("posts",this.state.baAuthor);
    console.log(authorsPosts)
    this.setState({authorsPosts})
  }

  authorsChanged = (e: { target: { value: any; }; })=>{
    const baAuthor = e.target.value
    console.log(e.target.value)
    this.setState({baAuthor})
  }
  tagsChanged = (e: { target: { value: any; }; })=>{
    const baTag = e.target.value
    console.log(e.target.value)
    this.setState({baTag})
  }

  render() {
    const { global, entries, communities, accounts, match } = this.props;
    const { loading, search, searchData, searchDataLoading, typing, authorsPosts } =
      this.state;
    const { filter } = match.params;
    const { hive_id: name, tags, baAuthors } = global;
    console.log(baAuthors)
    console.log(tags)

    const community = communities.find((x) => x.name === name);
    const account = accounts.find((x) => x.name === name);

    const navBar = global.isElectron
      ? NavBarElectron({
          ...this.props,
          reloadFn: this.reload,
          reloading: loading,
        })
      : NavBar({ ...this.props, community });

    if (loading) {
      return (
        <>
          {navBar}
          <LinearProgress />
        </>
      );
    }

    if (!community || !account) {
      return NotFound({ ...this.props });
    }

    //  Meta config
    const fC = capitalize(filter);
    const title = `${community.title.trim()} community ${filter} list`;
    const description = _t("community.page-description", {
      f: `${fC} ${community.title.trim()}`,
    });
    const url = `/${filter}/${community.name}`;
    const rss = `${defaults.base}/${filter}/${community.name}/rss.xml`;
    const image = `${defaults.imageServer}/u/${community.name}/avatar/medium`;
    const canonical = `${defaults.base}/created/${community.name}`;

    const metaProps = { title, description, url, rss, image, canonical };

    const promoted = entries["__promoted__"].entries;
    let containerClasses = global.isElectron
      ? "app-content community-page mt-0 pt-6"
      : "app-content community-page";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback />
        {navBar}

        <div className={containerClasses}>
          <div className="profile-side">
            {CommunityCard({
              ...this.props,
              community,
              account,
            })}
          </div>
          <span itemScope={true} itemType="http://schema.org/Organization">
            <meta
              itemProp="name"
              content={community.title.trim() || community.name}
            />
            <span
              itemProp="logo"
              itemScope={true}
              itemType="http://schema.org/ImageObject"
            >
              <meta itemProp="url" content={image} />
            </span>
            <meta itemProp="url" content={`${defaults.base}${url}`} />
          </span>
          <div className="content-side">
            {CommunityMenu({
              ...this.props,
              community,
            })}

            {CommunityCover({
              ...this.props,
              account,
              community,
            })}

            {(() => {
              if (filter === "subscribers") {
                return (
                  <CommunitySubscribers {...this.props} community={community} />
                );
              }

              if (filter === "activities") {
                return (
                  <CommunityActivities {...this.props} community={community} />
                );
              }

              if (filter === "roles") {
                return <CommunityRoles {...this.props} community={community} />;
              }

              if (filter === "tags") return (
                <>
                  <FormControl className="w-50 mt-3" as="select" onChange={this.tagsChanged}>
                    <option value="">Select tag</option>
                    {global.tags.map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </FormControl>
                  <div>
                  <EntryListContent
                      {...this.props}
                      entries={[]}
                      promotedEntries={promoted}
                      community={community}
                      loading={loading}
                    />
                  </div>
                </>
              )

              if (filter === "authors") return (
                <>
                  <FormControl className="w-50 mt-3" as="select" onChange={this.authorsChanged}>
                    <option value="">Select Author</option>
                    {global.baAuthors.map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </FormControl>
                  <div>
                  <AuthorsPosts
                    promoted={[]} 
                    {...this.props}
                    entries={authorsPosts}
                    promotedEntries={[]}
                    community={community}
                    loading={loading}
                    />
                  </div>
                </>
              )

              const groupKey = makeGroupKey(filter, name);
              const data = entries[groupKey];

              if (data !== undefined) {
                const entryList = data?.entries;
                const loading = data?.loading;

                return (
                  <>
                    {loading && entryList.length === 0 ? (
                      <LinearProgress />
                    ) : (
                      ""
                    )}

                    {(filter === "hot" ||
                      filter === "created" ||
                      filter === "trending") &&
                      !loading &&
                      entryList.length > 0 && (
                        <div className="searchProfile">
                          <SearchBox
                            placeholder={_t(
                              "search-comment.search-placeholder"
                            )}
                            value={search}
                            onChange={this.handleChangeSearch}
                            autoComplete="off"
                            showcopybutton={true}
                            filter={`${community.name}`}
                            username={filter}
                          />
                        </div>
                      )}
                    {typing ? (
                      <LinearProgress />
                    ) : search.length > 0 && searchDataLoading ? (
                      <LinearProgress />
                    ) : searchData.length > 0 && search.length > 0 ? (
                      <div className="search-list">
                        {searchData.map((res) => (
                          <Fragment
                            key={`${res.author}-${res.permlink}-${res.id}`}
                          >
                            {SearchListItem({ ...this.props, res: res })}
                          </Fragment>
                        ))}
                      </div>
                    ) : search.length === 0 ? null : (
                      _t("g.no-matches")
                    )}
                    {search.length === 0 && !searchDataLoading && (
                      <div
                        className={_c(`entry-list ${loading ? "loading" : ""}`)}
                      >
                        <div
                          className={_c(
                            `entry-list-body ${
                              global.listStyle === ListStyle.grid
                                ? "grid-view"
                                : ""
                            }`
                          )}
                        >
                          {loading && entryList.length === 0 && (
                            <EntryListLoadingItem />
                          )}
                          <EntryListContent
                            {...this.props}
                            entries={entryList}
                            promotedEntries={promoted}
                            community={community}
                            loading={loading}
                          />
                        </div>
                      </div>
                    )}
                    {search.length === 0 && loading && entryList.length > 0 ? (
                      <LinearProgress />
                    ) : (
                      ""
                    )}
                    <DetectBottom onBottom={this.bottomReached} />
                  </>
                );
              }

              return null;
            })()}
          </div>
        </div>
      </>
    );
  }
}

export default connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(CommunityPage);
