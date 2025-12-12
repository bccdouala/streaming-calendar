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

// Cache for events (refresh every 5 minutes)
let cachedEvents: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Parse the iCal feed
app.get("/schedule", async (req, res): Promise<void> => {
  try {
    if (!CALENDAR_URL) {
      res.status(500).json({ error: "CALENDAR_URL is not configured" });
      return;
    }

    const now = Date.now();

    // Use cache if still valid
    if (now - lastFetchTime < CACHE_DURATION && cachedEvents.length > 0) {
      res.json(cachedEvents);
      return;
    }

    const data = await ical.async.fromURL(CALENDAR_URL);
    const nowDate = new Date();

    const events = Object.values(data)
      .filter((entry: any) => entry.type === "VEVENT")
      // Filter out past events (only show events that haven't ended yet)
      .filter((event: any) => {
        if (!event.end) return false; // Skip events without end date

        const endDate =
          event.end instanceof Date ? event.end : new Date(event.end);

        // Only include events that haven't ended yet (compare timestamps)
        return endDate.getTime() >= nowDate.getTime();
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

    // Update cache
    cachedEvents = events;
    lastFetchTime = now;

    res.json(events);
  } catch (error: any) {
    console.error("Error fetching schedule:", error);

    // Return cached events if available, even if stale
    if (cachedEvents.length > 0) {
      console.log("Returning cached events due to error");
      res.json(cachedEvents);
      return;
    }

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
