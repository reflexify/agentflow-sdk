# Leave requests

`acme/leave` is an AgentFlow app: employees ask for leave, an approver approves or rejects it, and an approved request gets a PDF approval letter.

## What it holds

- `leave_request` entity (`config/entities/leave_request.json`): fields, two views, create form, grants, rules and a stage model.
- `approve_leave` workflow (`config/build/approve-leave.mjs`): a Human step for the approvers, then the status, and for an approval the letter.
- `approval_letter` document template (`config/document_templates/approval_letter.json`).
- `leave_overview` dashboard (`config/dashboards/leave_overview.json`), and the launcher entries in the manifest.
- A UI module (`src/module/`): a request form and the list of requests.

## Commands

| Command | What it does |
|---|---|
| `pnpm build` | Writes `package/` from `config/`, and builds the UI module. |
| `pnpm test` | Unit and screen tests, then the check that `package/` and `src/generated/app.ts` match `config/`. |
| `pnpm exec agentflow-app deploy --sandbox` | Installs the app in a new disposable organization. |
| `pnpm test:sandbox` | Black-box tests as the sandbox's people. |
| `pnpm seal` | Seals `package/` into `dist-app/` with the key in `keys/`. |

## After the install

An admin approves the setup page and chooses the four parameters (two different groups for Employees and Approvers, the automation principal and its group). Then they **turn on the trigger** `on_submit`: it ships off, and nothing starts until it is on. They also share the Leave overview dashboard with the Employees group. Known gaps of the sandbox tests: none.
