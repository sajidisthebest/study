import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/useSettingsStore";

const DISPLAY_FIELDS = [
  { id: "subject", label: "Subject badge", description: "Show subject name on cards" },
  { id: "paper", label: "Paper label", description: "Show paper name next to subject" },
  { id: "dueDate", label: "Due date", description: "Show when the task is due" },
  { id: "tags", label: "Tags", description: "Show tag badges on cards" },
  { id: "description", label: "Description preview", description: "Show first line of description" },
  { id: "urgency", label: "Urgency indicator", description: "Show urgency color coding" },
];

const DEFAULT_ON = ["subject", "paper", "dueDate", "tags", "urgency"];

export function CardDisplaySettings() {
  const { cardDisplayFields, setCardDisplayFields } = useSettingsStore();

  const activeFields = cardDisplayFields.length > 0 ? cardDisplayFields : DEFAULT_ON;

  const toggleField = (fieldId: string) => {
    if (activeFields.includes(fieldId)) {
      setCardDisplayFields(activeFields.filter((f) => f !== fieldId));
    } else {
      setCardDisplayFields([...activeFields, fieldId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Card Display</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose which fields to show on task cards in list and board views.
        </p>
      </div>

      <div className="space-y-4">
        {DISPLAY_FIELDS.map((field) => (
          <div key={field.id} className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor={`field-${field.id}`} className="text-sm font-medium cursor-pointer">
                {field.label}
              </Label>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
            <Switch
              id={`field-${field.id}`}
              checked={activeFields.includes(field.id)}
              onCheckedChange={() => toggleField(field.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
