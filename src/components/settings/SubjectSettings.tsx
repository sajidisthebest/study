import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubjectStore } from "@/stores/useSubjectStore";

export function SubjectSettings() {
  const { subjects, addSubject, updateSubject, deleteSubject, addPaper, updatePaper, deletePaper } =
    useSubjectStore();
  const activeSubjects = subjects.filter((s) => s.deletedAt === null);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [addingPaperForSubject, setAddingPaperForSubject] = useState<string | null>(null);
  const [newPaperName, setNewPaperName] = useState("");
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [editingPaperName, setEditingPaperName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim());
      setNewSubjectName("");
      setShowAddForm(false);
    }
  };

  const handleSaveSubjectEdit = (id: string) => {
    if (editingSubjectName.trim()) {
      updateSubject(id, editingSubjectName.trim());
    }
    setEditingSubjectId(null);
  };

  const handleAddPaper = (subjectId: string) => {
    if (newPaperName.trim()) {
      addPaper(subjectId, newPaperName.trim());
      setNewPaperName("");
      setAddingPaperForSubject(null);
    }
  };

  const handleSavePaperEdit = (subjectId: string, paperId: string) => {
    if (editingPaperName.trim()) {
      updatePaper(subjectId, paperId, editingPaperName.trim());
    }
    setEditingPaperId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Subjects & Papers</h3>
        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-1" />
          Add Subject
        </Button>
      </div>

      {showAddForm && (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
          <Input
            placeholder="Subject name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
            autoFocus
          />
          <Button size="sm" onClick={handleAddSubject}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setNewSubjectName(""); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {activeSubjects.map((subject) => (
          <div key={subject.id} className="border rounded-md">
            <div className="flex items-center gap-2 p-3">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              {editingSubjectId === subject.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingSubjectName}
                    onChange={(e) => setEditingSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveSubjectEdit(subject.id)}
                    autoFocus
                    className="h-8"
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleSaveSubjectEdit(subject.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingSubjectId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium flex-1">{subject.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setAddingPaperForSubject(subject.id); setNewPaperName(""); }}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Paper
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingSubjectId(subject.id); setEditingSubjectName(subject.name); }}
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {confirmDeleteId === subject.id ? (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="destructive" onClick={() => { deleteSubject(subject.id); setConfirmDeleteId(null); }} className="h-7 text-xs">
                        Confirm
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)} className="h-7 text-xs">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDeleteId(subject.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Papers */}
            {subject.papers.filter((p) => p.deletedAt === null).length > 0 && (
              <div className="border-t px-3 py-2 bg-muted/30">
                {subject.papers
                  .filter((p) => p.deletedAt === null)
                  .map((paper) => (
                    <div key={paper.id} className="flex items-center gap-2 pl-6 py-1">
                      {editingPaperId === paper.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingPaperName}
                            onChange={(e) => setEditingPaperName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSavePaperEdit(subject.id, paper.id)}
                            autoFocus
                            className="h-7 text-sm"
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleSavePaperEdit(subject.id, paper.id)} className="h-6 w-6 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingPaperId(null)} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground flex-1">{paper.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingPaperId(paper.id); setEditingPaperName(paper.name); }}
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePaper(subject.id, paper.id)}
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Add Paper Form */}
            {addingPaperForSubject === subject.id && (
              <div className="border-t px-3 py-2 bg-muted/30">
                <div className="flex items-center gap-2 pl-6">
                  <Input
                    placeholder="Paper name"
                    value={newPaperName}
                    onChange={(e) => setNewPaperName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPaper(subject.id)}
                    autoFocus
                    className="h-7 text-sm"
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleAddPaper(subject.id)} className="h-6 w-6 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingPaperForSubject(null)} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
