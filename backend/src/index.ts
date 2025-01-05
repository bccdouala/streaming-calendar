import express from "express";
import ical from "node-ical";
import cors from "cors";

const app = express();
app.use(cors());

// Parse the iCal feed
app.get("/schedule", async (req, res) => {
  try {
    // const url =
    //   "https://widgets.bcc.no/ical-69db4c9e2fa0f3e9/52030/Portal-Calendar.ics"; // Replace with your iCal URL

    const url =
      "https://outlook.live.com/owa/calendar/3ce38da0-475e-4471-8c87-faa2514951ef/4edc3b10-d2d0-4ddf-a9b5-a501a71c1e91/cid-88C72C3D78956F32/calendar.ics";
    const data = await ical.async.fromURL(url);

    const events = Object.values(data)
      .filter((entry: any) => entry.type === "VEVENT")
      .map((event: any) => ({
        id: event.uid,
        summary: event.summary,
        description: event.description || "",
        start: event.start,
        end: event.end,
      }));

    res.json(events);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
