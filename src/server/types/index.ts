interface IRTCSessionData {
  sdp: RTCSessionDescription;
  roomID: string;
}

interface IRTCIceCandidateData {
  candidate: RTCIceCandidate;
  roomID: string;
}

export { IRTCSessionData, IRTCIceCandidateData };
