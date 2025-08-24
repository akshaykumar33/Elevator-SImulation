"use client"

import { useSimulationStore } from "@/app/stores/useSimulationStore";


function RequestQueue() {
  const {requests} = useSimulationStore();
//   console.log("requests",requests)
  return (
    <div className="request-queue card">
      <div className="card__header">
        <h3>Request Queue</h3>
      </div>
      <div className="card__body">
        <div className="queue-list" id="queue-list">
          {requests.length === 0?
          (<div className="no-requests">No pending requests</div>):
          (
            requests.slice(0, 10).map((request,index) => {
            const waitTime = request.waitTime/1000;
            const priority = waitTime > 30 ? 'urgent' : waitTime > 15 ? 'priority' : '';
            const assignedText = request.assigned ? ` (E${request.elevatorId})` : '';
            
            return (
                <div className={`queue-item ${priority}`} key={index}>
                    <div className="request-info">
                        <span className="request-floors">{request.originFloor} → {request.destinationFloor}{assignedText}</span>
                        <span className="request-time">{waitTime.toFixed(1)}s</span>
                    </div>
                    <span className="request-direction">{request.direction === 'up' ? '↑' : '↓'}</span>
                </div>
            );
        })
          )}
        </div>
      </div>
    </div>
  );


}

export default RequestQueue;
