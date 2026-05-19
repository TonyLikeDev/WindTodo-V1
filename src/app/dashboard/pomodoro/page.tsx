import PomodoroTimer from "@/components/PomodoroTimer";

export default function PomodoroPage() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          Pomodoro Timer
        </h1>
        <p className="text-sm text-gray-500">
          Stay focused and boost your productivity with timed work sessions.
        </p>
      </div>

      <PomodoroTimer />
    </div>
  );
}
