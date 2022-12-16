import React, {Component} from "react";

import {Link} from "react-router-dom";

import {Global} from "../../store/global/types";

import _c from "../../util/fix-class-names";

import {hiveSvg} from "../../img/svg";
import {hiveEngineSvg} from "../../img/svg";
import { getCommunities } from "../../api/bridge";
import { Community } from "../../store/communities/types";
import defaults from "../../constants/defaults.json";

interface Props {
  global: Global;
  communities: Community[];
  username: string;
  active: string;
}

export default class WalletMenu extends Component<Props> {
  render() {
    const { global, username, active, communities } = this.props;

    const name = global.hive_id;
    const community = communities.find((x) => x.name === name)!;
    const logo = `${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`;

    return (
      <div className="wallet-menu">
        {global.usePrivate && (
          <Link
            className={_c(
              `menu-item ecency ${active === "ecency" ? "active" : ""}`
            )}
            to={`/@${username}/points`}
          >
            <span className="title">{community?.title}</span>
            <span className="sub-title">Points</span>
            <span className="platform-logo">
              <img alt="ecency" src={logo} />
            </span>
          </Link>
        )}
        <Link
          className={_c(`menu-item hive ${active === "hive" ? "active" : ""}`)}
          to={`/@${username}/wallet`}
        >
          <span className="title">Hive</span>
          <span className="sub-title">Wallet</span>
          <span className="platform-logo">{hiveSvg}</span>
        </Link>
        <Link
          className={_c(
            `menu-item hive-engine ${active === "engine" ? "active" : ""}`
          )}
          to={`/@${username}/engine`}
        >
          <span className="title">Engine</span>
          <span className="sub-title">Tokens</span>
          <span className="platform-logo">{hiveEngineSvg}</span>
        </Link>
      </div>
    );
  }
}
