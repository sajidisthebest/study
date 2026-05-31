import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollegeTracker } from "@/components/trackers/CollegeTracker";
import { TuitionTracker } from "@/components/trackers/TuitionTracker";
import { SelfStudyTracker } from "@/components/trackers/SelfStudyTracker";

export function Trackers() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Trackers</h1>
      <Tabs defaultValue="college" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="college" className="flex-1">College</TabsTrigger>
          <TabsTrigger value="tuition" className="flex-1">Tuition</TabsTrigger>
          <TabsTrigger value="self-study" className="flex-1">Self Study</TabsTrigger>
        </TabsList>
        <TabsContent value="college">
          <CollegeTracker />
        </TabsContent>
        <TabsContent value="tuition">
          <TuitionTracker />
        </TabsContent>
        <TabsContent value="self-study">
          <SelfStudyTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
