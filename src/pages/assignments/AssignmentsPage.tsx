import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  TextArea,
  Modal,
  EmptyState,
} from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getParentAssignments, getParentChildren } from "@/lib/learning-data";
import { subjects } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import type {
  Assignment,
  AssignmentDifficulty,
  AssignmentStatus,
} from "@/types";

const statusVariant: Record<
  AssignmentStatus,
  "warning" | "primary" | "success"
> = { pending: "warning", "in-progress": "primary", completed: "success" };
type FormState = {
  subject: string;
  title: string;
  topic: string;
  description: string;
  dueDate: string;
  difficulty: AssignmentDifficulty;
  learningContentId: string;
  studentIds: string[];
};
type LearningContentOption = { id: string; title: string; subject: string };
const emptyForm: FormState = {
  subject: "",
  title: "",
  topic: "",
  description: "",
  dueDate: new Date().toISOString().slice(0, 10),
  difficulty: "medium",
  learningContentId: "",
  studentIds: [],
};

export function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [learningContent, setLearningContent] = useState<
    LearningContentOption[]
  >([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [details, setDetails] = useState<Assignment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const load = async () => {
    if (!user?.id) return;
    const childResult = await getParentChildren(user.id);
    const ids = (childResult.data ?? []).map((child) => child.id);
    setChildren(
      (childResult.data ?? []).map((child) => ({
        id: child.id,
        name: child.full_name,
      })),
    );
    const result = await getParentAssignments(ids);
    if (result.error) setError("Assignments could not be loaded.");
    setAssignments(
      (result.data ?? []).map((item) => ({
        id: item.id,
        subject: item.assignment?.subject ?? "-",
        title: item.assignment?.title ?? "Untitled assignment",
        description: item.assignment?.description ?? "",
        dueDate: item.assignment?.dueDate ?? new Date().toISOString(),
        difficulty:
          (item.assignment?.difficulty as AssignmentDifficulty) ?? "medium",
        status:
          item.status === "in_progress"
            ? "in-progress"
            : item.status === "assigned"
              ? "pending"
              : item.status === "overdue"
                ? "pending"
                : item.status,
        score: item.score ?? undefined,
      })),
    );
  };
  useEffect(() => {
    if (!user?.id) return;
    void Promise.all([
      supabase
        .from("learning_content")
        .select("id, title, subject")
        .order("title"),
      getParentChildren(user.id),
    ]).then(async ([contentResult, childResult]) => {
      const contentError = contentResult.error;
      if (contentError) setError("Learning content could not be loaded.");
      setLearningContent((contentResult.data ?? []) as LearningContentOption[]);
      const ids = (childResult.data ?? []).map((child) => child.id);
      setChildren(
        (childResult.data ?? []).map((child) => ({
          id: child.id,
          name: child.full_name,
        })),
      );
      const result = await getParentAssignments(ids);
      if (result.error) setError("Assignments could not be loaded.");
      setAssignments(
        (result.data ?? []).map((item) => ({
          id: item.id,
          subject: item.assignment?.subject ?? "-",
          title: item.assignment?.title ?? "Untitled assignment",
          description: item.assignment?.description ?? "",
          dueDate: item.assignment?.dueDate ?? new Date().toISOString(),
          difficulty:
            (item.assignment?.difficulty as AssignmentDifficulty) ?? "medium",
          status:
            item.status === "in_progress"
              ? "in-progress"
              : item.status === "assigned"
                ? "pending"
                : item.status === "overdue"
                  ? "pending"
                  : item.status,
          score: item.score ?? undefined,
        })),
      );
    });
  }, [user?.id]);
  const filtered = useMemo(
    () =>
      assignments.filter(
        (a) =>
          (!search ||
            `${a.title} ${a.subject}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (subjectFilter === "all" || a.subject === subjectFilter) &&
          (statusFilter === "all" || a.status === statusFilter),
      ),
    [assignments, search, subjectFilter, statusFilter],
  );
  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.studentIds.length) return;
    const { error: rpcError } = await supabase.rpc(
      "create_assignment_for_children",
      {
        p_title: form.title.trim(),
        p_description: [
          form.topic.trim() && `Topic: ${form.topic.trim()}`,
          form.description.trim(),
        ]
          .filter(Boolean)
          .join("\n\n"),
        p_subject: form.subject,
        p_grade: null,
        p_due_date: form.dueDate,
        p_difficulty: form.difficulty,
        p_learning_content_id: form.learningContentId || null,
        p_student_ids: form.studentIds,
      },
    );
    if (rpcError) {
      setError("Assignment could not be created.");
      return;
    }
    setForm(emptyForm);
    setIsCreateOpen(false);
    await load();
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Assignments</h1>
          <p className="mt-1 text-sm text-text-muted">
            Assignments for your children.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Create assignment
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          options={[
            { value: "all", label: "All subjects" },
            ...subjects.map((s) => ({ value: s.name, label: s.name })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "in-progress", label: "In progress" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments match"
          description="Create an assignment or adjust your filters."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card
              key={a.id}
              onClick={() => setDetails(a)}
              className="cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex justify-between gap-2">
                  <Badge variant="primary">{a.subject}</Badge>
                  <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-text">{a.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{a.description}</p>
                <p className="mt-4 text-xs text-text-muted">
                  Due {new Date(a.dueDate).toLocaleDateString()}
                </p>
                {a.score !== undefined && (
                  <p className="mt-2 text-sm font-medium text-secondary">
                    Scored {a.score}%
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create assignment"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
          />
          <Input
            label="Topic"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            label="Learning content"
            value={form.learningContentId}
            onChange={(e) =>
              setForm({ ...form, learningContentId: e.target.value })
            }
            options={[
              { value: "", label: "None yet (optional)" },
              ...learningContent.map((item) => ({
                value: item.id,
                label: `${item.title} · ${item.subject}`,
              })),
            ]}
          />
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <fieldset>
            <legend className="text-sm font-medium text-text">
              Assign to children
            </legend>
            <div className="mt-2 flex flex-col gap-2">
              {children.map((child) => (
                <label
                  key={child.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.studentIds.includes(child.id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        studentIds: e.target.checked
                          ? [...form.studentIds, child.id]
                          : form.studentIds.filter((id) => id !== child.id),
                      })
                    }
                  />
                  {child.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create assignment</Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={!!details}
        onClose={() => setDetails(null)}
        title={details?.title}
      >
        {details && (
          <div className="space-y-3">
            <Badge variant={statusVariant[details.status]}>
              {details.status}
            </Badge>
            <p className="text-sm text-text">{details.description}</p>
            <p className="text-sm text-text-muted">
              Completion is recorded when the student submits an assessment.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
