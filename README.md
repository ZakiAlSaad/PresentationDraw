# BAN0001 Presentation Draw System 🎡

A sophisticated, interactive lucky draw web application designed to assign presentation topics to students randomly. Built with React, Vite, and Tailwind CSS.

## 🌟 Features

- **Dual Synchronized Wheels**: Two independent spinning wheels for Participants and Topics.
- **Fair Random Allocation**: Ensures topics and participants are assigned 1-to-1 without duplicates.
- **Interactive UI/UX**: "Sophisticated Dark" theme with amber/gold accents, CSS gradients, and immersive animations.
- **Audio Effects**: Dynamic synthesized sound effects for the spinning duration and a triumphant chord for the winner announcement (powered by the Web Audio API).
- **PDF Report Generation**: Download the final allocation log as a beautifully formatted PDF report for official records.
- **Visual Rewards**: Confetti explosions upon selecting a winner using `canvas-confetti`.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Effects**: `canvas-confetti` (for celebrations)
- **PDF Export**: `jspdf` + `html2canvas`

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   https://github.com/ZakiAlSaad/PresentationDraw.git
   cd PresentationDraw
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

## 🛠️ Usage

1. Open the application in your browser.
2. Click the **INITIALIZE_DRAW** button to spin the wheels.
3. Wait for the wheels to stop. A modal will display the matched Participant and Topic.
4. Click **CONFIRM_LOG** to acknowledge the assignment. The system will log the assignment timeline on the main screen.
5. Repeat until all topics are assigned.
6. Once the draw is complete, click **DOWNLOAD_LOG_PDF** to save the results offline.

## 📝 Configuration

If you want to reuse this for different subjects or teams, you can easily modify the `NAMES` and `TOPICS` arrays inside `src/App.tsx`:

```tsx
const NAMES = [
  "Name 1",
  "Name 2",
  // ...
];

const TOPICS = [
  "Topic 1",
  "Topic 2",
  // ...
];
```

*Note: Ensure the length of the lists matches the requirements of your draw.*

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
