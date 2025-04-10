import React, { Component } from "react";
import { History, Location } from "history";
import { Link } from "react-router-dom";
import { match } from "react-router";

import { EntryFilter, Global } from "../../store/global/types";
import { Community } from "../../store/communities/types";

import ListStyleToggle from "../list-style-toggle/index";
import DropDown from "../dropdown";

import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import * as ls from "../../util/local-storage";

interface MatchParams {
  filter: string;
  name: string;
}

interface Props {
  history: History;
  location: Location;
  match: match<MatchParams>;
  global: Global;
  community: Community;
  toggleListStyle: (view: string | null) => void;
}

interface State {
  selectedLabel: string;
}

export class CommunityMenu extends Component<Props, State> {
  state: State = {
    selectedLabel: "",
  };

  componentDidMount() {
    const { match, community } = this.props;
    const items = this.menuItems();

    const savedLabel = ls.get("selectedLabel");
    const currentRouteValue = match.params.filter;
    const fromRoute = items.find((item) => item.value === currentRouteValue);
    const fromStorage = items.find((item) => item.label === savedLabel);

    let labelToUse = "";

    if (fromStorage) {
      labelToUse = fromStorage.label;

      const expectedPath = `/${fromStorage.value}/${community.name}`;
      if (this.props.location.pathname !== expectedPath) {
        this.props.history.replace(expectedPath);
      }
    } else if (fromRoute) {
      labelToUse = fromRoute.label;
    } else {
      labelToUse = items[0].label;
    }

    this.setState({ selectedLabel: labelToUse }, () => {
      ls.set("selectedLabel", labelToUse);
    });
  }

  menuItems = () => {
    return (
       [
          { label: "5,000sats", value: "created" },
          { label: "50,000sats", value: "created" },
          { label: "500,000sats", value: "created" },
          { label: "0.05BTC", value: "created" },
          { label: "0.5BTC", value: "created" },
          { label: "1BTC", value: "created" },
        ])
  };

  handleSelect = (label: string, value: string) => {
    this.setState({ selectedLabel: label }, () => {
      ls.set("selectedLabel", label);
      window.location.reload()
    });
  };

  render() {
    const { community, match, global } = this.props;
    const { name, filter } = match.params;
    const { selectedLabel } = this.state;

    const items = this.menuItems();

    const showFeedInfo =
      filter === "created" || filter === "hot" || filter === "trending";

    return (
      <>
        {showFeedInfo && (
          <div style={{ color: "orange" }}>
            Showing feeds from {selectedLabel} and above
          </div>
        )}
        <div className="community-menu">
          <div className="menu-items">
            {/* Mobile dropdown */}
            <span className="d-flex d-lg-none community-menu-item selected-item">
              <DropDown
                history={this.props.history}
                label={selectedLabel}
                items={items.map((item) => ({
                  label: item.label,
                  href: `/${item.value}/${community.name}`,
                  active: selectedLabel === item.label,
                }))}
                float="left"
              />
            </span>

            {/* Desktop menu */}
            <div className="d-none d-lg-flex align-items-center">
              {items.map((item) => {
                const isActive = selectedLabel === item.label;
                return (
                  <Link
                    key={item.label}
                    to={`/${item.value}/${community.name}`}
                    className={_c(`community-menu-item ${isActive ? "selected-item" : ""}`)}
                    onClick={(e) => {
                      e.preventDefault();
                      this.handleSelect(item.label, item.value);
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Subscribers */}
            <Link
              to={`/subscribers/${name}`}
              className={_c(
                `community-menu-item ${selectedLabel === "Subscribers" ? "selected-item" : ""}`
              )}
              onClick={(e) => {
                e.preventDefault();
                this.handleSelect("Subscribers", "subscribers");
              }}
            >
              {_t("community.subscribers")}
            </Link>

            {/* Activities */}
            <Link
              to={`/activities/${name}`}
              className={_c(
                `community-menu-item ${selectedLabel === "Activities" ? "selected-item" : ""}`
              )}
              onClick={(e) => {
                e.preventDefault();
                this.handleSelect("Activities", "activities");
              }}
            >
              {_t("community.activities")}
            </Link>
          </div>

          <div className="page-tools">
            <ListStyleToggle
              global={this.props.global}
              toggleListStyle={this.props.toggleListStyle}
            />
          </div>
        </div>
      </>
    );
  }
}

export default (p: Props) => <CommunityMenu {...p} />;
