import React, { Component } from 'react';
import { Global } from '../../store/global/types';
import { ActiveUser } from '../../store/active-user/types';
import { ToggleType, UI } from '../../store/ui/types';
import { Notifications } from '../../store/notifications/types';
import { NotificationsWebSocket } from '../../api/notifications-ws-api';
import { isSupported } from '@firebase/messaging';
import { NotifyTypes } from '../../enums';

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  ui: UI;
  notifications: Notifications;
  fetchNotifications: (since: string | null) => void;
  fetchUnreadNotificationCount: () => void;
  toggleUIProp: (what: ToggleType) => void;
  fetchNotificationsSettings: (username: string) => void;
}

export default class NotificationHandler extends Component<Props> {
  private nws = new NotificationsWebSocket();

  componentDidMount() {
    const {
      activeUser,
      notifications,
      fetchUnreadNotificationCount,
      fetchNotificationsSettings,
      fetchNotifications,
      global,
      toggleUIProp,
      ui
    } = this.props;

    this.nws
      .withActiveUser(activeUser)
      .withElectron(global.isElectron)
      .withSound(document.getElementById('notifications-audio') as HTMLAudioElement)
      .withCallbackOnMessage(() => {
        fetchUnreadNotificationCount();
        fetchNotifications(null);
      })
      .withToggleUi(toggleUIProp)
      .setHasUiNotifications(ui.notifications)
      .setHasNotifications(global.notifications)
      .setEnabledNotificationsTypes(notifications.settings?.notify_types as NotifyTypes[] || [])

    if (activeUser) {
      fetchNotificationsSettings(activeUser!!.username);
    }
    if (activeUser && notifications.unreadFetchFlag) {
      fetchUnreadNotificationCount();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    const { activeUser, fetchUnreadNotificationCount, fetchNotificationsSettings, notifications } = this.props;

    this.nws.setEnabledNotificationsTypes(notifications.settings?.notify_types as NotifyTypes[] || []);

    if (notifications.fbSupport === 'denied' && activeUser) {
      this.nws.disconnect();
      this.nws.withActiveUser(activeUser).connect();
    }

    if (!prevProps.activeUser && activeUser && activeUser.username) {
      this.nws.disconnect();
      if (notifications.fbSupport === 'denied') {
        this.nws.withActiveUser(activeUser).connect();
      }
      fetchUnreadNotificationCount();
    }

    if (activeUser?.username !== prevProps.activeUser?.username) {
      this.nws.disconnect();
      if (notifications.fbSupport === 'denied') {
        this.nws.withActiveUser(activeUser).connect();
      }

      if (activeUser) {
        fetchNotificationsSettings(activeUser!!.username);
        fetchUnreadNotificationCount();
      }
    }
  }

  render() {
    const notificationSound = this.props.global.isElectron ? "./img/notification.mp3" :  require("../../img/notification.mp3");
    return <audio id="notification-audio" autoPlay={false} src={notificationSound} muted={true} style={{display: 'none'}}/>;
  }
}
