import React, { lazy, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import styled from "styled-components";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

const initialVideoFormState = {
  title: "",
  description: "",
  tags: [] as string[],
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
          <Form.Control
            type="text"
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Enter title"
          />
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
          <Form.Control
            onChange={(e) =>
              setData({ ...data, tags: e.target.value.split(",") })
            }
            type="text"
            placeholder="Enter Tags"
          />
          <Form.Text>
            Every tag is separated by <b>,</b>
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Language</Form.Label>
          <Form.Control
            onChange={(e) => setData({ ...data, language: e.target.value })}
            type="text"
            placeholder="Enter language"
          />
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Community</Form.Label>
          <Form.Control
            onChange={(e) => setData({ ...data, community: e.target.value })}
            type="text"
            placeholder="Enter community name"
          />
        </Form.Group>
      </StyledForm>
      <Preview>
        <h1>{data.title}</h1>
        <h1>{data.community}</h1>
        <h1>{mdParser.render(data.description)}</h1>
        <h1>{data.tags}</h1>
        <h1>{data.language}</h1>
      </Preview>
    </SubmitContainer>
  );
};

const Preview = styled.div`
  width: 100%;
  max-width: 45%;
  margin-left: 1rem;
  border-radius: 1rem;
  background-color: $sky-primary;
`;

const StyledForm = styled(Form)``;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: center;
  max-width: 1600px;
  width: 100%;
  margin: 6rem auto;
`;

export default VideoSubmitContainer;
