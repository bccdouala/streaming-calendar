<script lang="ts" setup>
import { ref, onMounted } from "vue";
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
// const backgroundImage = ref<string>('https://via.placeholder.com/1920x1080')

// Fetch events and select the next two
const fetchEvents = async () => {
  try {
    const response = await fetch("http://localhost:3000/schedule");
    const allEvents = await response.json();
    events.value = allEvents;
    nextEvents.value = allEvents.slice(0, 2); // Select only the next 2 events
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

// Update the current time every second
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  setTimeout(updateTime, 1000);
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

// Lifecycle hook
onMounted(() => {
  fetchEvents();
  updateTime();
});
</script>

<template>
  <div
    class="backdrop-blur-md pt-52 pl-36 relative w-[1920px] h-[1080px] bg-cover bg-center bg-transparent text-black"
  >
    <div class="pt-14">
      <!-- Current Time -->
      <h1 class="text-5xl font-bold mb-20">{{ currentTime }}</h1>

      <!-- Events -->
      <div class="space-y-16">
        <div v-for="event in nextEvents" :key="event.id" class="space-y-0">
          <p class="text-xl">
            {{ formatDate(event.start) }} | {{ formatTime(event.start) }}
          </p>
          <h2 class="text-3xl pt-2 font-semibold">{{ event.summary }}</h2>
          <p class="text-xl">{{ event.description }}</p>
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
