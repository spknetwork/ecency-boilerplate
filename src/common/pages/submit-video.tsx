import React, { lazy, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import styled from "styled-components";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

const initialVideoFormState = {
  title: "",
  description: "",
  tags: [],
  language: "",
  community: "",
};

const mdParser = new MarkdownIt();

const VideoSubmitContainer: React.FC = () => {
  const [data, setData] = useState(initialVideoFormState);

  const handleSubmit = () => {
    console.log("submit");
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <SubmitContainer>
      <StyledForm onSubmit={() => handleSubmit()}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Title</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <MdEditor
            value={data.description}
            style={{ width: "100%", height: "50vh" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={({ text }) => setData({ ...data, description: text })}
          />
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Tags</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Language</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Community</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
      </StyledForm>
    </SubmitContainer>
  );
};

const StyledForm = styled(Form)``;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: center;
  max-width: 1600px;
  width: 100%;
  margin: 6rem auto;
`;

export default VideoSubmitContainer;
