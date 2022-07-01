import React, { ChangeEvent, useCallback, useRef } from "react";
import { connect } from "react-redux";
import Feedback from "../components/feedback";
import FullHeight from "../components/full-height";
import { NavBar } from "../components/navbar";
import Theme from "../components/theme";
import { pageMapStateToProps, pageMapDispatchToProps } from "./common";
import * as tus from "tus-js-client";

import "./_submit_video.scss";
import { Button } from "react-bootstrap";

const SubmitVideoContainer: React.FC<any> = (props) => {
  const fileRef = useRef() as React.MutableRefObject<HTMLInputElement>;

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
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: () => {},
    });

    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      upload.start();
    });
  };

  const startUpload = () => {
    fileRef.current.click();
  };

  return (
    <>
      <FullHeight />
      <Theme global={props.global} />
      <Feedback />
      <NavBar {...props} />
      <div className="submit_container">
        <div className="content">
          <input
            ref={fileRef}
            className="video_input"
            type="file"
            onChange={handleSetUpload}
            accept=".mov,.mp4"
          />
          <Button onClick={startUpload}>Choose a video to upload</Button>
        </div>
      </div>
    </>
  );
};

export default connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(SubmitVideoContainer as any);
