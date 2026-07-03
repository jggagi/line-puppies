# Custom Rules for Antigravity

You must report your status to the Code Buddy companion display to keep the user updated.

## Reporting Mechanism
Use the `/Users/guoq/opc/code-buddy/antigravity.sh` script to send ADB broadcasts to the connected Android device:

1. **At the start of a session / task**:
   ```bash
   /Users/guoq/opc/code-buddy/antigravity.sh begin "<Session Title>"
   ```
2. **During execution** (when doing analysis, reading code, editing files, testing, etc.):
   ```bash
   /Users/guoq/opc/code-buddy/antigravity.sh status <phase> "<Title>" "<Detail>" [<completed_steps> <total_steps>]
   ```
   Valid phases: `analysis`, `reading`, `coding`, `testing`, `summarizing`.
3. **When waiting for user input / feedback**:
   ```bash
   /Users/guoq/opc/code-buddy/antigravity.sh wait "<Attention Title>" "<Question/Prompt>" "回到 Antigravity 进行回复"
   ```
4. **On successful completion**:
   ```bash
   /Users/guoq/opc/code-buddy/antigravity.sh done "<Completion Summary>"
   ```
5. **On failure**:
   ```bash
   /Users/guoq/opc/code-buddy/antigravity.sh fail "<Failure Reason>"
   ```

## Rules for Code Execution
- Proactively run these commands as part of your tool execution loops to update the dashboard in real-time.
- Ensure that the path `/Users/guoq/opc/code-buddy/antigravity.sh` is used.
