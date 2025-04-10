import React, {Component} from "react";

import {History} from "history";

import {Link} from "react-router-dom";

import Meta from "../meta";
import { Global } from "../../store/global/types";
import isElectron from "../../util/is-electron";
import defaults from "../../constants/defaults.json";

// const logoCircle = require("../../img/logo-circle.svg");

interface Props {
    history: History;
    global: Global;
}

interface State {
    loaded: boolean
}

export class NotFound extends Component<Props, State> {
    state: State = {
        loaded: false
    }

    componentDidMount() {
        this.setState({loaded: true});
    }

    goBack = () => {
        const {history} = this.props;

        history.goBack();
    };

    render() {
        const {loaded} = this.state;
        const {history, global} = this.props;
        if (!loaded) {
            return ''
        }

        const metaProps = {
            title: "404",
        };

        // @ts-ignore make ide happy. code compiles without error.
        const entries = history.entries || {}
        // @ts-ignore
        const index = history.index || 0;

        const canGoBack = !!entries[index - 1];

        return (
            <>
                <Meta {...metaProps} />
                <div className="not-found-404">
                    <img 
                        // src={`${defaults.imageServer}/u/${global?.hive_id}/avatar/lardge`}
                        src={`https://media.licdn.com/dms/image/v2/C5112AQEw1fXuabCTyQ/article-inline_image-shrink_1500_2232/article-inline_image-shrink_1500_2232/0/1581099611064?e=1747872000&v=beta&t=ZFHxBgqIAHyWajNgLLo0GyuvF1TggPYYUzAoK_-fbq8`}
                        // src={`https://images.hive.blog/u/${global?.hive_id}/avatar/lardge`}
                        className="logo" 
                        alt=""
                    />
                    <h1>This page doesn't exist.</h1>
                    <p className="links">
                        {canGoBack && <a href="#" onClick={(e) => {
                            e.preventDefault();
                            this.goBack();
                        }}>Back</a>}
                        <Link to="/">Home</Link>
                        {/* <Link to="/created">New posts</Link>
                        <Link to="/hot">Hot posts</Link>
                        <Link to="/trending">Trending posts</Link> */}
                    </p>
                </div>
            </>
        );
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global:  p.global
    }

    return <NotFound {...props}/>
}
