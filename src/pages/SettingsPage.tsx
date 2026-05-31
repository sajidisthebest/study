import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectSettings } from "@/components/settings/SubjectSettings";
import { TagSettings } from "@/components/settings/TagSettings";
import { ColumnSettings } from "@/components/settings/ColumnSettings";
import { CardDisplaySettings } from "@/components/settings/CardDisplaySettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your study system preferences.</p>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="subjects">Subjects & Papers</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="cardDisplay">Card Display</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        <TabsContent value="subjects">
          <SubjectSettings />
        </TabsContent>
        <TabsContent value="tags">
          <TagSettings />
        </TabsContent>
        <TabsContent value="columns">
          <ColumnSettings />
        </TabsContent>
        <TabsContent value="cardDisplay">
          <CardDisplaySettings />
        </TabsContent>
        <TabsContent value="theme">
          <ThemeSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
