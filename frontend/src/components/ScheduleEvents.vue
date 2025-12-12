<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import MusicIcon from "../assets/icons/MusicIcon.vue";
// import BccIcon from '../assets/icons/BccIcon.vue'

interface Event {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
}

const events = ref<Event[]>([]);
const nextEvents = ref<Event[]>([]);
const currentTime = ref<string>("");
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
// const backgroundImage = ref<string>('https://via.placeholder.com/1920x1080')

// Refresh interval (5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;
let refreshTimer: number | null = null;
let timeUpdateTimer: number | null = null;

// Fetch events and select the next two
const fetchEvents = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch("http://localhost:3000/schedule");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const allEvents = await response.json();

    if (Array.isArray(allEvents)) {
      events.value = allEvents;
      nextEvents.value = allEvents.slice(0, 2); // Select only the next 2 events
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error fetching events:", err);
    error.value = "Failed to load schedule. Retrying...";

    // Retry after 30 seconds if there's an error
    setTimeout(() => {
      if (error.value) {
        fetchEvents();
      }
    }, 30000);
  } finally {
    isLoading.value = false;
  }
};

// Update the current time every second
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  timeUpdateTimer = window.setTimeout(updateTime, 1000);
};

// Format date as "15. februar"
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return new Intl.DateTimeFormat("no-NO", options).format(new Date(dateString));
};

// Format time as "20:00"
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate event duration in hours and minutes
// const getEventDuration = (start: string, end: string): string => {
//   const startDate = new Date(start);
//   const endDate = new Date(end);
//   const durationMs = endDate.getTime() - startDate.getTime();
//   const hours = Math.floor(durationMs / (1000 * 60 * 60));
//   const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

//   if (hours > 0) {
//     return `${hours}h ${minutes}min`;
//   }
//   return `${minutes}min`;
// };

// Lifecycle hooks
onMounted(() => {
  fetchEvents();
  updateTime();

  // Set up auto-refresh
  refreshTimer = window.setInterval(() => {
    fetchEvents();
  }, REFRESH_INTERVAL);
});

onUnmounted(() => {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
  }
  if (timeUpdateTimer !== null) {
    clearTimeout(timeUpdateTimer);
  }
});
</script>

<template>
  <div
    class="backdrop-blur-md pt-52 pl-36 relative w-[1920px] h-[1080px] bg-cover bg-center bg-transparent text-black"
  >
    <div class="pt-14">
      <!-- Current Time -->
      <h1 class="text-5xl font-bold mb-20">{{ currentTime }}</h1>

      <!-- Error Message -->
      <div v-if="error" class="mb-8 text-red-400 text-2xl">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && events.length === 0" class="text-3xl opacity-70">
        Loading schedule...
      </div>

      <!-- Events -->
      <div v-if="!isLoading || events.length > 0" class="space-y-16">
        <div v-for="event in nextEvents" :key="event.id" class="space-y-0">
          <p class="text-xl">
            {{ formatDate(event.start) }} | {{ formatTime(event.start) }}
            <!-- <span class="text-lg opacity-80 ml-3">
              ({{ getEventDuration(event.start, event.end) }})
            </span> -->
          </p>
          <h2 class="text-3xl pt-2 font-semibold">{{ event.summary }}</h2>
          <p class="text-xl">{{ event.description }}</p>
        </div>

        <!-- No Events Message -->
        <div
          v-if="nextEvents.length === 0 && !isLoading"
          class="text-3xl opacity-70"
        >
          No upcoming events
        </div>
      </div>

      <!-- Footer -->
      <div
        class="absolute bottom-12 right-12 text-sm text-justify flex space-x-2 items-center"
      >
        <p>
          Lyrics and/or music are used by agreement with © <br />Stiftelsen
          Skjulte Skatters Forlag. All rights reserved.
        </p>
        <MusicIcon class="h-12 w-12" />
      </div>

      <!-- Top Right Icon
      <div class="absolute top-8 right-12">
        <BccIcon alt="Logo" class="h-12 w-12 " />
      </div> -->
    </div>
  </div>
</template>
