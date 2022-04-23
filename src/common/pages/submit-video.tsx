import React, { lazy, LegacyRef, useEffect, useRef, useState } from "react";
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
  video: "",
};

const mdParser = new MarkdownIt();

const VideoSubmitContainer: React.FC = () => {
  const [data, setData] = useState(initialVideoFormState);
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const handleSubmit = () => {
    console.log("submit");
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setData({ ...data, video: url });
  };

  const handleChoose = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <SubmitContainer>
      <input
        ref={inputRef}
        className="VideoInput_input"
        type="file"
        onChange={handleFileChange}
        accept=".mp4"
        style={{ visibility: "hidden" }}
      />
      <ChooseFileContainer onClick={() => !data.video && handleChoose()}>
        <h4>Select the video that you want posted</h4>
        <h5>
          Max. Filesize is <b>5GB</b> Note: Your video will not be encoded if it
          is above the size limit!
        </h5>
        {data.video && (
          <p>
            Selected video: <b>{data.video}</b>
          </p>
        )}
      </ChooseFileContainer>
      <FormWrapper>
        <Form onSubmit={() => handleSubmit()}>
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
              view={{ menu: true, md: true, html: false }}
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
        </Form>
        <Preview>
          <PreviewTitle>Preview</PreviewTitle>
          <VideoContainer>
            {data.video && (
              <video
                className="VideoInput_video"
                width="100%"
                id="video"
                height={240}
                controls
                src={data.video}
              />
            )}
          </VideoContainer>
          <h1>{data.title ? data.title : <i>Title</i>}</h1>
          <h3>{data.tags.length ? data.tags.join(" ") : <i>Tags</i>}</h3>
          <h4
            dangerouslySetInnerHTML={{
              __html: data.description
                ? mdParser.render(data.description)
                : "<i>Description</i>",
            }}
          />
          <h1>{data.community}</h1>
          <h1>{data.language}</h1>
        </Preview>
      </FormWrapper>
    </SubmitContainer>
  );
};

const VideoContainer = styled.div`
  padding: 1rem 0;
`;

const ChooseFileContainer = styled.div`
  width: 100%;
  background-color: #fff;
  margin: 0 0 2rem;
  text-align: center;
  padding: 2rem 0;
  border-radius: 1rem;
  color: #000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 2.5rem;
`;

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const PreviewTitle = styled.h1`
  text-align: left;
  font-size: 2rem;
`;

const Preview = styled.div`
  width: 100%;
  max-width: 45%;
  margin-left: 1rem;
  border-radius: 1rem;
  background-color: #fff;
  color: #000;
  padding: 1rem;
  border: 2px solid #1c658c;
`;

const SubmitContainer = styled.div`
  max-width: 70rem;
  width: 100%;
  margin: 6rem auto;
`;

export default VideoSubmitContainer;
