import express from "express";
import ical from "node-ical";
import cors from "cors";

const app = express();
app.use(cors());

// Parse the iCal feed
app.get("/schedule", async (req, res) => {
  try {
    const url = "[Your iCal URL here]";
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
