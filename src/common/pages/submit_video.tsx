import React, { ChangeEvent, lazy, useRef, useState } from "react";
import { connect } from "react-redux";
import Feedback from "../components/feedback";
import FullHeight from "../components/full-height";
import { NavBar } from "../components/navbar";
import Theme from "../components/theme";
import { pageMapStateToProps, pageMapDispatchToProps } from "./common";
import * as tus from "tus-js-client";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./_submit_video.scss";
import { Form, Button } from "react-bootstrap";
import { EditorToolbar } from "../components/editor-toolbar";
import TextareaAutocomplete from "../components/textarea-autocomplete";
import { _t } from "../i18n";
import Dropdown from "../components/dropdown";

import default_thumbnail from "../img/default-thumbnail.jpeg";
import axios from "axios";

const SubmitVideoContainer: React.FC<any> = (props) => {
  const [file, setFile] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState({
    title: "",
    description: "",
    tags: [],
    language: "",
    payoutOption: "",
    nfsw: false,
    donations: false,
    thumbnail: null,
    scheduel: false,
    date: "",
  });
  const fileRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const thumbnailRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const handleSetUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];

    if (!file) {
      return;
    }

    const upload = new tus.Upload(file, {
      endpoint: "http://localhost:1080/files/",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError: (error) => {
        console.log("Failed because: " + error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        setProgress(+percentage);
      },
      onSuccess: () => {
        const url = URL.createObjectURL(file);
        const media = new Audio(url);
        media.onloadedmetadata = () => {
          axios
            .post("https://studio.3speak.tv/apiv2/upload/prepare", {
              oFilename: file.name,
              duration: +media.duration,
              size: file.size,
            })
            .then((r) => {
              console.log(r);
            });
        };

        setFile(url);
      },
    });

    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      upload.start();
    });
  };

  const onSubmit = () => {
    console.log(data);
  };

  return (
    <>
      <FullHeight />
      <Theme global={props.global} />
      <Feedback />
      <NavBar {...props} />
      <div className="submit_container">
        <div className="content">
          {!!progress && (
            <div className="progress_bar" style={{ width: `${progress}%` }}>
              Video upload progress ({progress.toFixed(2)}%)
            </div>
          )}
          <input
            ref={fileRef}
            className="video_input"
            type="file"
            onChange={handleSetUpload}
            accept=".mov,.mp4"
          />
          <div
            className="submit_button"
            onClick={() => fileRef.current.click()}
          >
            Choose a video to upload
          </div>
          <div className="form_divider">
            <Form className="video_form">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  type="text"
                  placeholder="Enter title"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Description</Form.Label>
                <EditorToolbar {...props} />
                <Form.Control
                  global={props.global}
                  id="the-editor"
                  className="the-editor accepts-emoji form-control"
                  as="textarea"
                  placeholder={_t("submit.body-placeholder")}
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                  minrows={10}
                  maxrows={100}
                  spellCheck={true}
                  activeUser={
                    (props.activeUser && props.activeUser.username) || ""
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  onChange={(e) =>
                    setData({ ...data, tags: e.target.value.split(",") as any })
                  }
                  type="text"
                  placeholder="tag1,tag2"
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="formBasicEmail">
                <Form.Label />
                <Dropdown
                  history={null}
                  float={"left"}
                  label={"Language"}
                  items={[
                    {
                      label: "English",
                      onClick: () => setData({ ...data, language: "english" }),
                    },
                    {
                      label: "Deutch",
                      onClick: () => setData({ ...data, language: "deutch" }),
                    },
                  ]}
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="formBasicEmail">
                <Form.Label />
                <Dropdown
                  history={null}
                  float={"left"}
                  label={"Payout options"}
                  items={[
                    {
                      label: "Standard (50% liquid, 50% staked)",
                      onClick: () =>
                        setData({ ...data, payoutOption: "standard" }),
                    },
                    {
                      label: "100% powerup (100% staked)",
                      onClick: () =>
                        setData({ ...data, payoutOption: "powerup" }),
                    },
                    {
                      label: "Decline rewards",
                      onClick: () =>
                        setData({ ...data, payoutOption: "no_reward" }),
                    },
                  ]}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check
                  type="checkbox"
                  checked={data.nfsw}
                  label="Content is graphic and/or NSFW"
                  onChange={() => setData({ ...data, nfsw: !data.nfsw })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check
                  type="checkbox"
                  checked={data.donations}
                  onChange={() =>
                    setData({ ...data, donations: !data.donations })
                  }
                  label="Would you like to receive crypto donations on this video?"
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                style={{ display: "block" }}
                controlId="formBasicEmail"
              >
                <Form.Label>Thumbnail</Form.Label>
                <input
                  ref={thumbnailRef}
                  className="video_input"
                  type="file"
                  onChange={(e) =>
                    e.target.files
                      ? setData({
                          ...data,
                          thumbnail: URL.createObjectURL(
                            e.target.files[0]
                          ) as any,
                        })
                      : {}
                  }
                  accept=".jpeg,.png"
                />
                <Form.Group
                  onClick={() => {
                    thumbnailRef.current.click();
                  }}
                >
                  <img
                    src={data.thumbnail ? data.thumbnail : default_thumbnail}
                    style={{
                      maxWidth: "200px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                    alt=""
                    id="thumbnail"
                  />
                </Form.Group>
                <Form.Text>Click to change thumbnail</Form.Text>
              </Form.Group>
              <Form.Group
                className="mb-3"
                style={{ display: "block" }}
                controlId="formBasicEmail"
              >
                <Form.Label>Publishing settings</Form.Label>
                <Form.Check
                  type="radio"
                  className="mb-2"
                  name="group1"
                  onChange={() => setData({ ...data, scheduel: false })}
                  label="Publish Video after Encoding"
                />
                <Form.Check
                  type="radio"
                  name="group1"
                  onChange={() => setData({ ...data, scheduel: true })}
                  label="Schedule Video for a later date"
                />
              </Form.Group>
              {data.scheduel && (
                <DatePicker
                  className="mb-3"
                  placeholderText="Input post date"
                  value={data.date}
                  onChange={(value) =>
                    setData({ ...data, date: value?.toDateString()! })
                  }
                />
              )}
              <Button variant="primary" onClick={onSubmit}>
                Submit
              </Button>
            </Form>
            {file && (
              <div className="video_source">
                <video
                  className="VideoInput_video"
                  width="100%"
                  controls
                  src={file}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(SubmitVideoContainer as any);
