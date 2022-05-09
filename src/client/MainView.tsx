import React, { MutableRefObject, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { getTopPrediction } from "./helpers";
import { Socket } from "socket.io-client";

const MainView: React.FC<IMainViewProps> = (props) => {
  const [topPrediction, setTopPrediction] = useState("");
  const [prompt, setPrompt] = useState("");
  const [myPoints, setMyPoints] = useState(0);
  const [opponentPoints, setOpponentPoints] = useState(0);

  useEffect(() => {
    props.socket.on("new prompt", (newPrompt: IPrompt) => {
      if (newPrompt.answerer === "") {
        // First prompt
      } else if (newPrompt.answerer === props.socket.id) {
        setMyPoints((p) => p + 1);
      } else {
        setOpponentPoints((p) => p + 1);
      }
      setPrompt(newPrompt.letter);
    });
    makePrediction();
  }, []);

  useEffect(() => {
    if (prompt && topPrediction === prompt) {
      props.socket.emit("correct answer", props.roomID);
    }
  }, [topPrediction]);

  const onPredictionResults = (results) => {
    const topPred = getTopPrediction(results);
    setTopPrediction(topPred);
  };

  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3.1632795355/${file}`;
    },
  });
  hands.onResults(onPredictionResults);

  const makePrediction = async () => {
    if (props.localVideoRef.current.videoWidth) {
      await hands.send({ image: props.localVideoRef.current });
    }
    requestAnimationFrame(makePrediction);
  };
  return (
    <div className="flex flex-col items-center w-screen">
      <div>
        <h1>Top Prediction: {topPrediction}</h1>
        <h1 className="my-display-lg">Prompt: {prompt}</h1>
      </div>
      <div className="flex">
        <div className="my-video-container">
          <h1 className="my-display">My points: {myPoints}</h1>
          <video
            ref={props.localVideoRef}
            width={1280}
            height={720}
            style={{ transform: "scale(-1, 1)" }}
            className="my-video-el"
            autoPlay
            playsInline
            muted
          />
        </div>
        <div className="my-video-container">
          <h1 className="my-display">Opponent's points: {opponentPoints}</h1>
          <video
            ref={props.remoteVideoRef}
            width={1280}
            height={720}
            className="my-video-el"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>
    </div>
  );
};

interface IMainViewProps {
  localVideoRef: MutableRefObject<HTMLVideoElement>;
  remoteVideoRef: MutableRefObject<HTMLVideoElement>;
  socket: Socket;
  roomID: string;
}

interface IPrompt {
  letter: string;
  answerer: string;
}

export default MainView;
