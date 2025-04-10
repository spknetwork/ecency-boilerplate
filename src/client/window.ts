import {KeyChainImpl} from "../common/helper/keychain";

export interface AppWindow extends Window {
    usePrivate: boolean;
    nws?: WebSocket;
    comTag?: {} | any;
    hive_keychain?: KeyChainImpl;
    twttr?: {
        widgets?: {
            load: () => void
        }
    }
}
