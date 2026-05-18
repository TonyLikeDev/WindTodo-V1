import CalendarView from '@/components/CalendarView';

export const metadata = {
  title: 'Calendar – WindTodo',
  description: 'View all tasks on a monthly calendar',
};

export default function CalendarPage() {
  return (
    <div className="h-full flex flex-col">
      <CalendarView />
    </div>
  );
}
