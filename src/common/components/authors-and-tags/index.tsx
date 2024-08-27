import React from 'react';
import EntryListContent from '../entry-list';
import {History, Location} from "history";
import _ from 'lodash'

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import { Entry } from "../../store/entries/types";
import { Community, Communities } from "../../store/communities/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Reblogs } from "../../store/reblogs/types";
import { UI, ToggleType } from "../../store/ui/types";

import { EntryPinTracker } from "../../store/entry-pin-tracker/types";
import { _t } from "../../i18n";

interface AuthorsPostsProps {
  global: any;
  community: any;
  promoted: any[];
  loading: boolean;
  entries: any;
  promotedEntries: any;
  authorsPosts: any;
}
interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  entries: Entry[];
  promotedEntries: Entry[];
  communities: Communities;
  community?: Community | null;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblogs;
  loading: boolean;
  ui: UI;
  entryPinTracker: EntryPinTracker;
  signingKey: string;
  addAccount: (data: Account) => void;
  updateEntry: (entry: Entry) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  fetchReblogs: () => void;
  addReblog: (author: string, permlink: string) => void;
  deleteReblog: (author: string, permlink: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  addCommunity: (data: Community) => void;
  trackEntryPin: (entry: Entry) => void;
  setSigningKey: (key: string) => void;
  setEntryPin: (entry: Entry, pin: boolean) => void;
}

const AuthorsPosts: React.FC<AuthorsPostsProps | Props> = (props: any) => {

  return (
    <div>
      <div>
          <EntryListContent
            {...props}
          />
      </div>
    </div>
  );
};

export default AuthorsPosts;
