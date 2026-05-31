import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRevisionStore } from "@/stores/useRevisionStore";
import type { TopicStatus } from "@/types";

export function CollegeTracker() {
  const subjects = useSubjectStore((s) => s.getActiveSubjects());
  const collegeProgress = useTrackerStore((s) => s.collegeProgress);
  const addChapter = useTrackerStore((s) => s.addChapter);
  const addTopic = useTrackerStore((s) => s.addTopic);
  const setTopicStatus = useTrackerStore((s) => s.setTopicStatus);
  const overallProgress = useTrackerStore((s) => s.getOverallProgress());
  const addRevision = useRevisionStore((s) => s.addSchedule);

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [newChapterName, setNewChapterName] = useState<Record<string, string>>({});
  const [newTopicName, setNewTopicName] = useState<Record<string, string>>({});
  const [showAddChapter, setShowAddChapter] = useState<Record<string, boolean>>({});
  const [showAddTopic, setShowAddTopic] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const handleAddChapter = (subjectId: string, paperId: string) => {
    const key = `${subjectId}-${paperId}`;
    const name = newChapterName[key]?.trim();
    if (!name) return;
    addChapter(subjectId, paperId, name);
    setNewChapterName((p) => ({ ...p, [key]: "" }));
    setShowAddChapter((p) => ({ ...p, [key]: false }));
  };

  const handleAddTopic = (subjectId: string, paperId: string, chapterId: string) => {
    const key = `${subjectId}-${paperId}-${chapterId}`;
    const name = newTopicName[key]?.trim();
    if (!name) return;
    addTopic(subjectId, paperId, chapterId, name);
    setNewTopicName((p) => ({ ...p, [key]: "" }));
    setShowAddTopic((p) => ({ ...p, [key]: false }));
  };

  const cycleStatus = (
    subjectId: string,
    paperId: string,
    chapterId: string,
    topicId: string,
    currentStatus: TopicStatus,
    topicName: string
  ) => {
    const order: TopicStatus[] = ["not_started", "in_progress", "completed"];
    const idx = order.indexOf(currentStatus);
    const next = order[(idx + 1) % order.length];
    setTopicStatus(subjectId, paperId, chapterId, topicId, next);

    if (next === "completed") {
      addRevision({
        topicName,
        subjectId,
        paperId,
        firstStudiedAt: new Date().toISOString(),
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
      });
    }
  };

  const getStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700 text-[10px]">Done</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-700 text-[10px]">In Progress</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Not Started</Badge>;
    }
  };

  const getChapterProgress = (topics: { status: TopicStatus }[]) => {
    if (topics.length === 0) return 0;
    const completed = topics.filter((t) => t.status === "completed").length;
    return Math.round((completed / topics.length) * 100);
  };

  const getPaperProgress = (subjectId: string, paperId: string) => {
    const progress = collegeProgress.find(
      (p) => p.subjectId === subjectId && p.paperId === paperId
    );
    if (!progress) return 0;
    let total = 0;
    let completed = 0;
    for (const ch of progress.chapters) {
      for (const t of ch.topics) {
        total++;
        if (t.status === "completed") completed++;
      }
    }
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const overallPercent =
    overallProgress.total === 0
      ? 0
      : Math.round((overallProgress.completed / overallProgress.total) * 100);

  return (
    <div className="space-y-4 mt-4">
      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Syllabus Progress</span>
            <span className="text-sm font-bold">{overallPercent}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {overallProgress.completed} of {overallProgress.total} topics completed
          </p>
        </CardContent>
      </Card>

      {/* Subject > Paper > Chapter > Topic hierarchy */}
      {subjects.map((subject) => {
        const activePapers = subject.papers.filter((p) => !p.deletedAt);
        if (activePapers.length === 0) return null;

        return (
          <Card key={subject.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{subject.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePapers.map((paper) => {
                const paperKey = `${subject.id}-${paper.id}`;
                const progress = collegeProgress.find(
                  (p) => p.subjectId === subject.id && p.paperId === paper.id
                );
                const paperPercent = getPaperProgress(subject.id, paper.id);

                return (
                  <div key={paper.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{paper.name}</span>
                      <span className="text-xs text-muted-foreground">{paperPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${paperPercent}%` }}
                      />
                    </div>

                    {/* Chapters */}
                    {progress?.chapters.map((chapter) => {
                      const chapterPercent = getChapterProgress(chapter.topics);
                      const isExpanded = expandedChapters.has(chapter.id);
                      const topicKey = `${subject.id}-${paper.id}-${chapter.id}`;

                      return (
                        <div key={chapter.id} className="ml-2 border-l-2 pl-3 space-y-1">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleChapter(chapter.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <span className="text-sm">{chapter.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {chapterPercent}%
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="ml-5 space-y-1">
                              {chapter.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="flex items-center gap-2 p-1 rounded hover:bg-muted/50 cursor-pointer"
                                  onClick={() =>
                                    cycleStatus(
                                      subject.id,
                                      paper.id,
                                      chapter.id,
                                      topic.id,
                                      topic.status,
                                      topic.name
                                    )
                                  }
                                >
                                  <span className="text-xs flex-1">{topic.name}</span>
                                  {getStatusBadge(topic.status)}
                                </div>
                              ))}

                              {/* Add Topic */}
                              {showAddTopic[topicKey] ? (
                                <div className="flex gap-1">
                                  <Input
                                    placeholder="Topic name"
                                    value={newTopicName[topicKey] || ""}
                                    onChange={(e) =>
                                      setNewTopicName((p) => ({ ...p, [topicKey]: e.target.value }))
                                    }
                                    className="h-7 text-xs"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleAddTopic(subject.id, paper.id, chapter.id);
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleAddTopic(subject.id, paper.id, chapter.id)}
                                  >
                                    Add
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => setShowAddTopic((p) => ({ ...p, [topicKey]: true }))}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add Topic
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Chapter */}
                    {showAddChapter[paperKey] ? (
                      <div className="flex gap-1 mt-2">
                        <Input
                          placeholder="Chapter name"
                          value={newChapterName[paperKey] || ""}
                          onChange={(e) =>
                            setNewChapterName((p) => ({ ...p, [paperKey]: e.target.value }))
                          }
                          className="h-7 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddChapter(subject.id, paper.id);
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleAddChapter(subject.id, paper.id)}
                        >
                          Add
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs mt-1"
                        onClick={() => setShowAddChapter((p) => ({ ...p, [paperKey]: true }))}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Chapter
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
