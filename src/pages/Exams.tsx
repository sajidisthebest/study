import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamCountdown } from "@/components/exams/ExamCountdown";
import { PastExams } from "@/components/exams/PastExams";
import { UpcomingExams } from "@/components/exams/UpcomingExams";
import { ExamSyllabus } from "@/components/exams/ExamSyllabus";

export function Exams() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Exams</h1>

      <ExamCountdown />

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="syllabus" className="flex-1">Syllabus</TabsTrigger>
        </TabsList>
        <TabsContent value="past">
          <PastExams />
        </TabsContent>
        <TabsContent value="upcoming">
          <UpcomingExams />
        </TabsContent>
        <TabsContent value="syllabus">
          <ExamSyllabus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
