import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { IRTCIceCandidateData, IRTCSessionData } from "../server/types";
import MainView from "./MainView";
import "./styles/main.css";

const USER_MEDIA_CONFIG = {
  video: true,
  audio: false,
};

const STUN_SERVER = {
  iceServers: [
    { urls: "stun:stun01.sipphone.com" },
    { urls: "stun:stun.ekiga.net" },
    { urls: "stun:stun.fwdnet.net" },
    { urls: "stun:stun.ideasip.com" },
    { urls: "stun:stun.iptel.org" },
    { urls: "stun:stun.rixtelecom.se" },
    { urls: "stun:stun.schlund.de" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.softjoys.com" },
    { urls: "stun:stun.voiparound.com" },
    { urls: "stun:stun.voipbuster.com" },
    { urls: "stun:stun.voipstunt.com" },
    { urls: "stun:stun.voxgratia.org" },
    { urls: "stun:stun.xten.com" },
  ],
};

const RTCWrapper: React.FC<IRTCWrapperProps> = () => {
  const socket = io("/");
  const roomID = window.location.pathname.split("/")[0];

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [error, setError] = useState<IError>(null);

  // Sending ice candidate
  // [ Receiving handled by socket.on("ice candidate") ]
  const handleIceCandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    try {
      if (event.candidate) {
        socket.emit("ice candidate", {
          candidate: event.candidate,
          roomID: roomID,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Receiving other user's media stream
  const handleTrackEvent = (event: RTCTrackEvent) => {
    if (remoteVideoRef) {
      console.log("Received remote stream");
      console.log("Event", event);
      remoteVideoRef.current.srcObject = event.streams[0];
      remoteVideoRef.current.play();
    }
  };

  // Checking if connection is established
  const handleIceConnectionStateChange = (event: Event) => {
    console.log(pc.iceConnectionState);
    if (pc.iceConnectionState === "connected") {
      console.log("Connected to other user");
      socket.emit("ready", roomID);
    }
  };

  // Get user's camera feed AND send message to create or join room
  const getUserMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(USER_MEDIA_CONFIG);
    if (stream && localVideoRef) {
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      // Join SocketIO room with ID given by the random string in URL
      console.log(`Trying to join room ${roomID}`);
      socket.emit("create or join", roomID);
    } else {
      setError({ message: "Video permission denied" });
    }
  };

  // Setup peer connection object
  const pc = new RTCPeerConnection(STUN_SERVER);
  pc.onicecandidate = handleIceCandidateEvent;
  pc.ontrack = handleTrackEvent;
  pc.oniceconnectionstatechange = handleIceConnectionStateChange;

  useEffect(() => {
    getUserMedia();
  }, []);

  useEffect(() => {
    // When another user joins *your room*, send them an offer
    socket.on("other user", async () => {
      console.log("Other user joined your room");
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { sdp: offer, roomID: roomID });
      } catch (error) {
        console.error(error);
      }
    });
    // When you join *another user's room*, you receive an offer
    socket.on("offer", async (data: IRTCSessionData) => {
      console.log("Received an offer");
      await pc.setRemoteDescription(data.sdp);
      try {
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        socket.emit("answer", { sdp: ans, roomID: roomID });
      } catch (error) {
        console.error(error);
      }
    });
    // Receiving an answer to your offer
    socket.on("answer", async (data: IRTCSessionData) => {
      console.log("Received an answer to your offer");
      await pc.setRemoteDescription(data.sdp);
    });
    // Receiving ice candidate
    // [ Sending handled by handleIceCandidateEvent ]
    socket.on("ice candidate", async (data: IRTCIceCandidateData) => {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (error) {
        console.error(error);
      }
    });
    socket.on("error", (newError: IError) => {
      setError(newError);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <>
      {error ? (
        <div className="text-red">Error: {error.message}</div>
      ) : (
        <MainView
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          socket={socket}
          roomID={roomID}
        />
      )}
    </>
  );
};

interface IRTCWrapperProps {}
interface IError {
  message: string;
}

export default RTCWrapper;
