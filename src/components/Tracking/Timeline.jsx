import React from "react";
import "./Timeline.css";

const Timeline = ({ activities }) => {
  return (
    <div className="timeline">
      {activities.map((activity, index) => (
        <div
          key={index}
          className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
        >
          <div className="timeline-content">
            <span className="timeline-date">{activity.date || "N/A"}</span>
            <p className="timeline-status">
              <strong>Status:</strong> {activity.status || "N/A"}
            </p>
            <p className="timeline-activity">
              <strong>Activity:</strong> {activity.activity || "N/A"}
            </p>
            <p className="timeline-location">
              <strong>Location:</strong> {activity.location || "N/A"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
