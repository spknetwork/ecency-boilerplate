import React from "react";

import { List } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { entryInstance1, dynamicPropsIntance1, delegatedVestingInstance } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

const detailProps = {
  history: createBrowserHistory(),
  account: { name: "foo" },
  dynamicProps: dynamicPropsIntance1,
  entry: { ...entryInstance1 },
  addAccount: () => {},
};

const component = renderer.create(<List {...detailProps} />);

it("(3) Default render of list", () => {
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Render of detail with data", () => {
  const instance: any = component.getInstance();
  instance.setState({ loading: false });
  instance.setData(delegatedVestingInstance);
  expect(component.toJSON()).toMatchSnapshot();
});