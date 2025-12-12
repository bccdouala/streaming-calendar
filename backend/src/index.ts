import "dotenv/config";
import express from "express";
import ical from "node-ical";
import cors from "cors";

const app = express();
app.use(cors());

// Get calendar URL from environment variable
const CALENDAR_URL =
  process.env.CALENDAR_URL ||
  "https://calendar.google.com/calendar/ical/bcccamerounmedia%40gmail.com/private-35ccc9cac34b775995ad06d1ef13f4e5/basic.ics";

// Parse the iCal feed
app.get("/schedule", async (req, res) => {
  try {
    if (!CALENDAR_URL) {
      res.status(500).json({ error: "CALENDAR_URL is not configured" });
      return;
    }

    const data = await ical.async.fromURL(CALENDAR_URL);
    const now = new Date();

    const events = Object.values(data)
      .filter((entry: any) => entry.type === "VEVENT")
      // Filter out past events (only show events that haven't ended yet)
      .filter((event: any) => {
        if (!event.end) return false; // Skip events without end date

        const endDate =
          event.end instanceof Date ? event.end : new Date(event.end);

        // Only include events that haven't ended yet (compare timestamps)
        return endDate.getTime() >= now.getTime();
      })
      .map((event: any) => {
        // Convert dates to ISO strings
        const startDate =
          event.start instanceof Date ? event.start : new Date(event.start);
        const endDate =
          event.end instanceof Date ? event.end : new Date(event.end);

        return {
          id: event.uid,
          summary: event.summary,
          description: event.description || "",
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        };
      })
      // Sort by start time (earliest first)
      .sort(
        (a: any, b: any) =>
          new Date(a.start).getTime() - new Date(b.start).getTime()
      );

    res.json(events);
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
    const errorMessage = error?.message || "Unknown error";
    res.status(500).json({
      error: "Failed to fetch schedule",
      details: errorMessage,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
