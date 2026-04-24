import { useEffect, useState } from "react";

/**
 * After data exists on the server for this step, the form starts read-only until
 * the user clicks Edit (explicit unlock for changes).
 */
export function useOnboardingFormEditMode(hasPersistedData: boolean) {
  const [isEditing, setIsEditing] = useState(() => !hasPersistedData);

  useEffect(() => {
    setIsEditing(!hasPersistedData);
  }, [hasPersistedData]);

  const formDisabled = hasPersistedData && !isEditing;
  /** Hidden while read-only; shown again after Edit. */
  const showSaveButton = !formDisabled;

  return {
    isEditing,
    formDisabled,
    showEditControl: hasPersistedData,
    showSaveButton,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => setIsEditing(false),
  };
}
