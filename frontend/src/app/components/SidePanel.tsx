"use client"
import MetricsPanel from "@/app/components/MetricsPanel"
import RequestQueue from "@/app/components/RequestQueue"

function SidePanel() {
  return (
    <div className="side-panel">
     <MetricsPanel />
     <RequestQueue  />
    </div>
  )
}

export default SidePanel