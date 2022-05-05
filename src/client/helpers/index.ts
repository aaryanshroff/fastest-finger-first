import { train_angles, train_hand_connections } from "../constants";
import { angle_between, mse } from "../utils";

const getTopPrediction = (results) => {
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      const connections = train_hand_connections.map((t) => {
        const l1 = landmarks[t[1]];
        const l2 = landmarks[t[0]];
        return [l1.x - l2.x, l1.y - l2.y, l1.z - l2.z];
      });
      const angles = [];
      for (const connection_from of connections) {
        for (const connection_to of connections) {
          const angle = angle_between(connection_from, connection_to);
          if (isNaN(angle)) {
            angles.push(0);
          } else {
            angles.push(angle);
          }
        }
      }
      let min_error = Infinity;
      let pred = "";
      for (const row of train_angles) {
        // @ts-ignore
        const error = mse(row.slice(1), angles);
        if (error < min_error) {
          min_error = error;
          // @ts-ignore
          pred = row[0];
        }
      }
      return pred;
    }
  }
};

export { getTopPrediction };
