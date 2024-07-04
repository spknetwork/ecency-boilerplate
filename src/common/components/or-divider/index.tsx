import React, { Component } from "react";

interface OrDividerProps {
    text: string;
}

class OrDivider extends Component<OrDividerProps> {
    render() {
        const { text } = this.props;

        return (
            <div className="or-divider">{text}</div>
        );
    }
}

export default OrDivider;
