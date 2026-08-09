export async function executeConditionalBranchStep(
  config: { field?: string; condition?: 'equals' | 'contains' | 'greater_than'; target_value?: any },
  previousStepOutput: any
) {
  const field = config.field || 'completion';
  const val = previousStepOutput ? previousStepOutput[field] || JSON.stringify(previousStepOutput) : '';
  const target = config.target_value || 'proceed';

  let evaluated = false;
  if (config.condition === 'equals') {
    evaluated = String(val).trim() === String(target).trim();
  } else if (config.condition === 'greater_than') {
    evaluated = Number(val) > Number(target);
  } else {
    // Default: contains
    evaluated = String(val).toLowerCase().includes(String(target).toLowerCase());
  }

  const selectedPath = evaluated ? 'true_branch' : 'false_branch';

  return {
    evaluated,
    selectedPath,
    inspectedField: field,
    fieldValue: val,
    targetValue: target,
  };
}
